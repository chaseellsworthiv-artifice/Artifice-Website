import BookingDesk from "../../../components/BookingDesk";
import { getAvailabilityWindow } from "../../api/_lib/availability";
import { listBookings, listInquiries } from "../../api/_lib/data-store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Booking Desk | Artifice",
  description: "Internal booking workflow for Artifice.",
};

export default async function BookingDeskPage() {
  const [inquiries, bookings, availability] = await Promise.all([
    listInquiries(),
    listBookings(),
    getAvailabilityWindow(),
  ]);

  return (
    <BookingDesk
      initialInquiries={inquiries}
      initialBookings={bookings}
      initialSlots={availability.slots.slice(0, 24)}
    />
  );
}
