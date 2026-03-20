import { getAvailabilityWindow } from "../../api/_lib/availability";
import styles from "../../../components/inquiry-dashboard.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Availability Desk | Artifice",
  description: "Internal availability review for Artifice.",
};

function formatSlot(iso) {
  return new Date(iso).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AvailabilityDeskPage() {
  const availability = await getAvailabilityWindow();
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Availability</p>
        <h1>Open windows</h1>
        <p className={styles.subtitle}>Current mode: {availability.mode}. This is the availability layer that later booking steps will read from.</p>
      </header>
      <section className={styles.shell}>
        <aside className={styles.list}>
          <div className={styles.empty}>
            <p>Slot length: {availability.config.slotMinutes} minutes</p>
            <p>Buffer: {availability.config.bufferMinutes} minutes</p>
            <p>Window: {availability.config.startHour}:00 - {availability.config.endHour}:00</p>
            <p>Lookahead: {availability.config.lookAheadDays} days</p>
          </div>
        </aside>
        <section className={styles.detail}>
          <p className={styles.detailLabel}>Available slots</p>
          {availability.slots.length ? (
            <div className={styles.controls}>
              {availability.slots.slice(0, 24).map((slot) => (
                <div key={slot.start} className={styles.listItem}>
                  <div className={styles.listTop}>
                    <span>{formatSlot(slot.start)}</span>
                    <span className={styles.status}>open</span>
                  </div>
                  <small>{formatSlot(slot.end)}</small>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>No slots available in the current window.</div>
          )}
        </section>
      </section>
    </main>
  );
}
