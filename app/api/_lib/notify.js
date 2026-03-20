function getEmailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    to: process.env.BOOKING_TO_EMAIL || "Chase@artificefx.com",
    from: process.env.BOOKING_FROM_EMAIL || "Artifice <onboarding@resend.dev>",
  };
}

function buildEmailContent(eventType, payload) {
  const prettyPayload = JSON.stringify(payload, null, 2);
  return {
    subject: `Artifice notification: ${eventType}`,
    html: `
      <div style="font-family: Georgia, serif; line-height: 1.5; color: #111;">
        <h2 style="margin: 0 0 16px;">${eventType}</h2>
        <pre style="white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #f7f4ee; padding: 16px; border-radius: 8px; overflow: auto;">${prettyPayload}</pre>
      </div>
    `,
    text: `${eventType}\n\n${prettyPayload}`,
  };
}

async function notifyByEmail(eventType, payload) {
  const { apiKey, to, from } = getEmailConfig();
  if (!apiKey) {
    return { delivered: false, mode: "email_unconfigured" };
  }

  const content = buildEmailContent(eventType, payload);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: content.subject,
      html: content.html,
      text: content.text,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Email notification failed: ${response.status} ${errorText}`);
  }

  return { delivered: true, mode: "email" };
}

async function notifyByWebhook(eventType, payload) {
  const webhookUrl = process.env.BOOKING_WEBHOOK_URL;
  if (!webhookUrl) {
    return { delivered: false, mode: "webhook_unconfigured" };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventType,
      payload,
      sentAt: new Date().toISOString(),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Webhook notification failed: ${response.status} ${errorText}`);
  }

  return { delivered: true, mode: "webhook" };
}

export async function notifyEvent(eventType, payload) {
  const results = [];

  const emailResult = await notifyByEmail(eventType, payload);
  if (emailResult.delivered) {
    results.push(emailResult.mode);
  }

  const webhookResult = await notifyByWebhook(eventType, payload);
  if (webhookResult.delivered) {
    results.push(webhookResult.mode);
  }

  if (!results.length) {
    console.info(`Artifice event: ${eventType}`, payload);
    return { delivered: false, mode: "console" };
  }

  return {
    delivered: true,
    mode: results.join("+"),
  };
}
