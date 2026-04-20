import { redirect } from "next/navigation";

import { getExperienceBySlug, getPublicSlug } from "../../../components/experience-data";

export function generateStaticParams() {
  return ["roaming", "close-up", "table", "cabaret", "designed", "designed-experience"].map((slug) => ({ slug }));
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
    redirect("/design");
  }

  const query = new URLSearchParams();
  Object.entries(resolvedSearchParams || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, entry));
    } else if (value) {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  redirect(`/design/${getPublicSlug(experience.slug)}${queryString ? `?${queryString}` : ""}`);
}
