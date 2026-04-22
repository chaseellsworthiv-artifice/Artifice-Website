import DesignInquiry from "../../../components/DesignInquiry";

export const metadata = {
  title: "Custom Request | Artifice",
  description: "Request an Artifice experience shaped around your event.",
};

export default async function DesignInquiryPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialValues = {
    date: resolvedSearchParams?.date ?? "",
    guestCount: resolvedSearchParams?.guestCount ?? "",
    eventType: resolvedSearchParams?.eventType ?? "",
    performanceFlow: resolvedSearchParams?.performanceFlow ?? "",
    details: resolvedSearchParams?.details ?? "",
    venue: resolvedSearchParams?.venue ?? "",
    experience: resolvedSearchParams?.experience ?? "",
    depth: resolvedSearchParams?.depth ?? "",
    duration: resolvedSearchParams?.duration ?? "",
    price: resolvedSearchParams?.price ?? "",
  };

  return <DesignInquiry initialValues={initialValues} />;
}
