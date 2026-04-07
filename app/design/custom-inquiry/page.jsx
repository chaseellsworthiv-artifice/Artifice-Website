import DesignInquiry from "../../../components/DesignInquiry";

export const metadata = {
  title: "Custom Inquiry | Artifice",
  description: "Design a custom Artifice experience around your event.",
};

export default function DesignInquiryPage({ searchParams }) {
  const initialValues = {
    date: searchParams?.date ?? "",
    guestCount: searchParams?.guestCount ?? "",
    eventType: searchParams?.eventType ?? "",
    details: searchParams?.details ?? "",
    venue: searchParams?.venue ?? "",
  };

  return <DesignInquiry initialValues={initialValues} />;
}
