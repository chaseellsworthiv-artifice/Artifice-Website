import { createSign } from "node:crypto";

const defaultWeekdays = [2, 3, 4, 5, 6];

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseWeekdays(raw) {
  if (!raw) return defaultWeekdays;
  const weekdays = raw
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6);
  return weekdays.length ? weekdays : defaultWeekdays;
}

function getConfig() {
  return {
    slotMinutes: parseInteger(process.env.AVAILABILITY_SLOT_MINUTES, 90),
    bufferMinutes: parseInteger(process.env.AVAILABILITY_BUFFER_MINUTES, 90),
    startHour: parseInteger(process.env.AVAILABILITY_START_HOUR, 17),
    endHour: parseInteger(process.env.AVAILABILITY_END_HOUR, 22),
    weekdays: parseWeekdays(process.env.AVAILABILITY_WEEKDAYS),
    lookAheadDays: parseInteger(process.env.AVAILABILITY_LOOKAHEAD_DAYS, 45),
    calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
    clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };
}

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function toIso(date) {
  return new Date(date).toISOString();
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

async function getGoogleAccessToken(config) {
  if (!config.clientEmail || !config.privateKey) return null;

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claimSet = Buffer.from(
    JSON.stringify({
      iss: config.clientEmail,
      scope: "https://www.googleapis.com/auth/calendar.readonly",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
  ).toString("base64url");
  const unsigned = `${header}.${claimSet}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(config.privateKey, "base64url");

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Google token request failed: ${tokenResponse.status} ${errorText}`);
  }

  const payload = await tokenResponse.json();
  return payload.access_token;
}

async function loadBusyRanges(startIso, endIso, config) {
  const accessToken = await getGoogleAccessToken(config);
  if (!accessToken) return [];

  const response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      timeMin: startIso,
      timeMax: endIso,
      items: [{ id: config.calendarId }],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google freeBusy failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  return payload.calendars?.[config.calendarId]?.busy ?? [];
}

export async function getAvailabilityWindow(rangeStart, rangeEnd) {
  const config = getConfig();
  const start = startOfDay(rangeStart ?? new Date());
  const end = startOfDay(rangeEnd ?? new Date(start.getTime() + config.lookAheadDays * 86400000));
  const busyRanges = await loadBusyRanges(toIso(start), toIso(end), config);
  const slots = [];

  for (let cursor = new Date(start); cursor <= end; cursor = new Date(cursor.getTime() + 86400000)) {
    if (!config.weekdays.includes(cursor.getDay())) continue;

    const dayStart = new Date(cursor);
    dayStart.setHours(config.startHour, 0, 0, 0);
    const dayEnd = new Date(cursor);
    dayEnd.setHours(config.endHour, 0, 0, 0);

    for (
      let slotStart = new Date(dayStart);
      slotStart.getTime() + config.slotMinutes * 60000 <= dayEnd.getTime();
      slotStart = new Date(slotStart.getTime() + config.slotMinutes * 60000)
    ) {
      const slotEnd = new Date(slotStart.getTime() + config.slotMinutes * 60000);
      const bufferedStart = new Date(slotStart.getTime() - config.bufferMinutes * 60000);
      const bufferedEnd = new Date(slotEnd.getTime() + config.bufferMinutes * 60000);
      const clashes = busyRanges.some((range) =>
        rangesOverlap(bufferedStart.toISOString(), bufferedEnd.toISOString(), range.start, range.end)
      );

      if (!clashes && slotStart.getTime() > Date.now()) {
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
        });
      }
    }
  }

  return {
    mode: config.clientEmail && config.privateKey ? "google" : "rules",
    config: {
      slotMinutes: config.slotMinutes,
      bufferMinutes: config.bufferMinutes,
      startHour: config.startHour,
      endHour: config.endHour,
      weekdays: config.weekdays,
      lookAheadDays: config.lookAheadDays,
    },
    slots,
  };
}
