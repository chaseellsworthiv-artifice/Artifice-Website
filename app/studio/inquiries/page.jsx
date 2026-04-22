import InquiryDashboard from "../../../components/InquiryDashboard";
import { listInquiries } from "../../api/_lib/data-store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Request Desk | Artifice",
  description: "Internal request review for Artifice.",
};

export default async function InquiryDeskPage() {
  const inquiries = await listInquiries();
  return <InquiryDashboard initialInquiries={inquiries} />;
}
