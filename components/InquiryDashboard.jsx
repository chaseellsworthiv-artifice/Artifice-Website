"use client";

import { useMemo, useState } from "react";
import styles from "./inquiry-dashboard.module.css";

const statuses = ["new", "reviewing", "responded", "closed"];

function formatDate(value) {
  if (!value) return "No date";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

export default function InquiryDashboard({ initialInquiries }) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [selectedId, setSelectedId] = useState(initialInquiries[0]?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedInquiry = useMemo(
    () => inquiries.find((entry) => entry.id === selectedId) ?? inquiries[0] ?? null,
    [inquiries, selectedId]
  );

  async function updateSelectedInquiry(updates) {
    if (!selectedInquiry) return;
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/inquiries/${selectedInquiry.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Update failed");
      }

      const payload = await response.json();
      setInquiries((current) =>
        current.map((entry) => (entry.id === payload.inquiry.id ? { ...entry, ...payload.inquiry } : entry))
      );
    } catch (issue) {
      console.error(issue);
      setError("Could not save this inquiry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Private Queue</p>
        <h1>Inquiry desk</h1>
        <p className={styles.subtitle}>A minimal internal view for reviewing new interest before the booking flow takes over.</p>
      </header>

      <section className={styles.shell}>
        <aside className={styles.list}>
          {inquiries.length ? (
            inquiries.map((inquiry) => (
              <button
                key={inquiry.id}
                type="button"
                className={`${styles.listItem} ${inquiry.id === selectedInquiry?.id ? styles.listItemActive : ""}`}
                onClick={() => setSelectedId(inquiry.id)}
              >
                <div className={styles.listTop}>
                  <span>{inquiry.name}</span>
                  <span className={styles.status}>{inquiry.status}</span>
                </div>
                <p>{inquiry.event_type ?? inquiry.eventType ?? "Event inquiry"}</p>
                <small>{formatDate(inquiry.submitted_at ?? inquiry.submittedAt ?? inquiry.createdAt)}</small>
              </button>
            ))
          ) : (
            <div className={styles.empty}>No inquiries yet.</div>
          )}
        </aside>

        <section className={styles.detail}>
          {selectedInquiry ? (
            <>
              <div className={styles.detailHeader}>
                <div>
                  <p className={styles.detailLabel}>Selected inquiry</p>
                  <h2>{selectedInquiry.name}</h2>
                </div>
                <div className={styles.meta}>
                  <span>{selectedInquiry.email}</span>
                  <span>{selectedInquiry.location || "Location pending"}</span>
                </div>
              </div>

              <dl className={styles.detailGrid}>
                <div>
                  <dt>Event type</dt>
                  <dd>{selectedInquiry.event_type ?? selectedInquiry.eventType ?? "Not specified"}</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>{selectedInquiry.event_date ?? selectedInquiry.date ?? "Not specified"}</dd>
                </div>
                <div>
                  <dt>Received</dt>
                  <dd>{formatDate(selectedInquiry.submitted_at ?? selectedInquiry.submittedAt ?? selectedInquiry.createdAt)}</dd>
                </div>
                <div>
                  <dt>Source</dt>
                  <dd>{selectedInquiry.source ?? "artifice-site"}</dd>
                </div>
              </dl>

              <div className={styles.messageBlock}>
                <p className={styles.detailLabel}>Message</p>
                <p>{selectedInquiry.message}</p>
              </div>

              <div className={styles.controls}>
                <label className={styles.controlBlock}>
                  <span>Status</span>
                  <select
                    value={selectedInquiry.status}
                    onChange={(event) => updateSelectedInquiry({ status: event.target.value })}
                    disabled={saving}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.controlBlock}>
                  <span>Notes</span>
                  <textarea
                    rows="6"
                    defaultValue={selectedInquiry.notes ?? ""}
                    onBlur={(event) => {
                      if (event.target.value !== (selectedInquiry.notes ?? "")) {
                        updateSelectedInquiry({ notes: event.target.value });
                      }
                    }}
                    disabled={saving}
                  />
                </label>
              </div>

              {error ? <p className={styles.error}>{error}</p> : null}
            </>
          ) : (
            <div className={styles.empty}>No inquiry selected.</div>
          )}
        </section>
      </section>
    </main>
  );
}
