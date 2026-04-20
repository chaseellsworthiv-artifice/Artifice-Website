import { notFound } from "next/navigation";

import ExperienceDetail from "../../../components/ExperienceDetail";
import { getDepthById, getExperienceBySlug } from "../../../components/experience-data";

export function generateStaticParams() {
  return ["roaming", "close-up", "table", "cabaret", "designed-experience"].map((slug) => ({ slug }));
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

export default async function DesignDetailPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const experience = getExperienceBySlug(resolvedParams.slug);

  if (!experience) {
    notFound();
  }

  const selectedDepth = getDepthById(experience, resolvedSearchParams?.depth);
  const eventContext = {
    date: resolvedSearchParams?.date ?? "",
    guestCount: resolvedSearchParams?.guestCount ?? "",
    eventType: resolvedSearchParams?.eventType ?? "",
    performanceFlow: resolvedSearchParams?.performanceFlow ?? "",
    details: resolvedSearchParams?.details ?? "",
  };

  return <ExperienceDetail experience={experience} selectedDepth={selectedDepth} basePath="/design" eventContext={eventContext} />;
}
