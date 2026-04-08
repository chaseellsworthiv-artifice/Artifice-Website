import { notFound } from "next/navigation";

import SecureDateFlow from "../../../../components/SecureDateFlow";
import { getDepthById, getExperienceBySlug } from "../../../../components/experience-data";

function mapIncomingSlug(slug) {
  return slug === "designed-experience" ? "designed" : slug;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const experience = getExperienceBySlug(mapIncomingSlug(resolvedParams.slug));

  if (!experience) {
    return { title: "Artifice" };
  }

  return {
    title: `Secure ${experience.name} | Artifice`,
    description: `Confirm the booking details for ${experience.name}.`,
  };
}

export default async function DesignSecureDatePage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const experience = getExperienceBySlug(mapIncomingSlug(resolvedParams.slug));

  if (!experience || experience.slug === "designed") {
    notFound();
  }

  const selectedDepth = getDepthById(experience, resolvedSearchParams?.depth);

  if (!selectedDepth) {
    notFound();
  }

  return <SecureDateFlow experience={experience} selectedDepth={selectedDepth} basePath="/design" />;
}
