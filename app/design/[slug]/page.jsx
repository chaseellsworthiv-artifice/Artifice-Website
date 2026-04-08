import { notFound } from "next/navigation";

import ExperienceDetail from "../../../components/ExperienceDetail";
import { getDepthById, getExperienceBySlug } from "../../../components/experience-data";

function mapIncomingSlug(slug) {
  return slug === "designed-experience" ? "designed" : slug;
}

export function generateStaticParams() {
  return ["close-up", "table", "cabaret", "designed-experience"].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const experience = getExperienceBySlug(mapIncomingSlug(resolvedParams.slug));

  if (!experience) {
    return { title: "Artifice" };
  }

  return {
    title: `${experience.name} | Artifice`,
    description: experience.summary,
  };
}

export default async function DesignDetailPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const experience = getExperienceBySlug(mapIncomingSlug(resolvedParams.slug));

  if (!experience) {
    notFound();
  }

  const selectedDepth = getDepthById(experience, resolvedSearchParams?.depth);

  return <ExperienceDetail experience={experience} selectedDepth={selectedDepth} basePath="/design" />;
}
