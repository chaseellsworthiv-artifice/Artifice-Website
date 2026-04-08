import Link from "next/link";

import styles from "../../../components/design.module.css";

export const metadata = {
  title: "Booking Confirmed | Artifice",
  description: "Your Artifice booking has been received and your date is now held.",
};

export default function BookingConfirmedPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.intakePanel}>
          <p className={styles.eyebrow}>Booking Confirmed</p>
          <h1 className={styles.title}>Your date is reserved.</h1>
          <p className={styles.subtext}>
            Your booking has been received and your date is now held. You’ll receive a confirmation shortly with everything you need.
          </p>
          <div className={styles.formActions}>
            <Link href="/" className={styles.primaryAction}>
              Return Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
