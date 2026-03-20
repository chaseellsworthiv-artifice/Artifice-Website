export async function notifyEvent(eventType, payload) {
  const webhookUrl = process.env.BOOKING_WEBHOOK_URL;
  if (!webhookUrl) {
    console.info(`Artifice event: ${eventType}`, payload);
    return { delivered: false, mode: "console" };
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
