import { notFound } from "next/navigation";

import SecureDateFlow from "../../../../components/SecureDateFlow";
import { getDepthById, getExperienceBySlug } from "../../../../components/experience-data";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const experience = getExperienceBySlug(resolvedParams.slug);

  if (!experience) {
    return { title: "Artifice" };
  }

  return {
    title: `Secure ${experience.name} | Artifice`,
    description: `Confirm the booking details for ${experience.name}.`,
  };
}

export default async function SecureDatePage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const experience = getExperienceBySlug(resolvedParams.slug);

  if (!experience || experience.slug === "designed") {
    notFound();
  }

  const selectedDepth = getDepthById(experience, resolvedSearchParams?.depth);

  if (!selectedDepth) {
    notFound();
  }

  return <SecureDateFlow experience={experience} selectedDepth={selectedDepth} />;
}
