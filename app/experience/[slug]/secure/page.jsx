import { notFound } from "next/navigation";

import SecureDateFlow from "../../../../components/SecureDateFlow";
import { getDepthById, getExperienceBySlug } from "../../../../components/experience-data";

export function generateMetadata({ params }) {
  const experience = getExperienceBySlug(params.slug);

  if (!experience) {
    return { title: "Artifice" };
  }

  return {
    title: `Secure ${experience.name} | Artifice`,
    description: `Confirm the booking details for ${experience.name}.`,
  };
}

export default function SecureDatePage({ params, searchParams }) {
  const experience = getExperienceBySlug(params.slug);

  if (!experience || experience.slug === "designed") {
    notFound();
  }

  const selectedDepth = getDepthById(experience, searchParams?.depth);

  if (!selectedDepth) {
    notFound();
  }

  return <SecureDateFlow experience={experience} selectedDepth={selectedDepth} />;
}
