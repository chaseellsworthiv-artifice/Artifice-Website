import { notFound } from "next/navigation";

import ExperienceDetail from "../../../components/ExperienceDetail";
import { experienceContent, getDepthById, getExperienceBySlug } from "../../../components/experience-data";

export function generateStaticParams() {
  return [...Object.keys(experienceContent), "close-up"].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const experience = getExperienceBySlug(resolvedParams.slug);

  if (!experience) {
    return { title: "Artifice" };
  }

  return {
    title: `${experience.name} | Artifice`,
    description: experience.summary,
  };
}

export default async function ExperienceDetailPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const experience = getExperienceBySlug(resolvedParams.slug);

  if (!experience) {
    notFound();
  }

  const selectedDepth = getDepthById(experience, resolvedSearchParams?.depth);

  return <ExperienceDetail experience={experience} selectedDepth={selectedDepth} basePath="/experience" />;
}
