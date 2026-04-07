import { notFound } from "next/navigation";

import ExperienceDetail from "../../../components/ExperienceDetail";
import { experienceContent, getDepthById, getExperienceBySlug } from "../../../components/experience-data";

export function generateStaticParams() {
  return Object.keys(experienceContent).map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const experience = getExperienceBySlug(params.slug);

  if (!experience) {
    return { title: "Artifice" };
  }

  return {
    title: `${experience.name} | Artifice`,
    description: experience.summary,
  };
}

export default function ExperienceDetailPage({ params, searchParams }) {
  const experience = getExperienceBySlug(params.slug);

  if (!experience) {
    notFound();
  }

  const selectedDepth = getDepthById(experience, searchParams?.depth);

  return <ExperienceDetail experience={experience} selectedDepth={selectedDepth} basePath="/experience" />;
}
