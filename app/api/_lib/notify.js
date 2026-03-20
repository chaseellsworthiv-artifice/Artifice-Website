function getEmailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    to: process.env.BOOKING_TO_EMAIL || "Chase@artificefx.com",
    from: process.env.BOOKING_FROM_EMAIL || "Artifice <onboarding@resend.dev>",
  };
}

function formatTimestamp(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildEmailContent(eventType, payload) {
  if (eventType === "inquiry.created") {
    const submission = payload.submission ?? {};
    return {
      subject: "New Artifice Inquiry",
      html: `
        <div style="font-family: Georgia, serif; line-height: 1.55; color: #111; max-width: 700px;">
          <h2 style="margin: 0 0 18px; font-weight: 500;">New Artifice Inquiry</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; color: #6b5a38; width: 160px;">Name</td><td style="padding: 8px 0;">${submission.name || "Unknown"}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b5a38;">Email</td><td style="padding: 8px 0;">${submission.email || "Unknown"}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b5a38;">Event Type</td><td style="padding: 8px 0;">${submission.eventType || "Not specified"}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b5a38;">Date</td><td style="padding: 8px 0;">${submission.date || "Not specified"}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b5a38;">Location</td><td style="padding: 8px 0;">${submission.location || "Not specified"}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b5a38;">Submitted</td><td style="padding: 8px 0;">${formatTimestamp(submission.submittedAt)}</td></tr>
          </table>
          <div style="margin-top: 18px; padding: 16px 18px; background: #f7f4ee; border-radius: 10px;">
            <div style="font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #6b5a38; margin-bottom: 8px;">Message</div>
            <div>${submission.message || "No message provided."}</div>
          </div>
        </div>
      `,
      text: [
        "New Artifice Inquiry",
        "",
        `Name: ${submission.name || "Unknown"}`,
        `Email: ${submission.email || "Unknown"}`,
        `Event Type: ${submission.eventType || "Not specified"}`,
        `Date: ${submission.date || "Not specified"}`,
        `Location: ${submission.location || "Not specified"}`,
        `Submitted: ${formatTimestamp(submission.submittedAt)}`,
        "",
        "Message:",
        submission.message || "No message provided.",
      ].join("\n"),
    };
  }

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
