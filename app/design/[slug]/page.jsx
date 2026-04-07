import { notFound } from "next/navigation";

import ExperienceDetail from "../../../components/ExperienceDetail";
import { getDepthById, getExperienceBySlug } from "../../../components/experience-data";

function mapIncomingSlug(slug) {
  return slug === "designed-experience" ? "designed" : slug;
}

export function generateStaticParams() {
  return ["close-up", "table", "cabaret", "designed-experience"].map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const experience = getExperienceBySlug(mapIncomingSlug(params.slug));

  if (!experience) {
    return { title: "Artifice" };
  }

  return {
    title: `${experience.name} | Artifice`,
    description: experience.summary,
  };
}

export default function DesignDetailPage({ params, searchParams }) {
  const experience = getExperienceBySlug(mapIncomingSlug(params.slug));

  if (!experience) {
    notFound();
  }

  const selectedDepth = getDepthById(experience, searchParams?.depth);

  return <ExperienceDetail experience={experience} selectedDepth={selectedDepth} basePath="/design" />;
}
