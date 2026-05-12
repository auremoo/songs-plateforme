import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getReleases, getReleaseBySlug, getDesignSettings } from "@/lib/data";
import { ReleaseHero } from "@/components/release/ReleaseHero";
import { ReleaseInfo } from "@/components/release/ReleaseInfo";
import { ReleaseGallery } from "@/components/release/ReleaseGallery";
import { ReleaseNav } from "@/components/release/ReleaseNav";

export async function generateStaticParams() {
  const releases = await getReleases();
  return releases.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const release = await getReleaseBySlug(slug);
  if (!release) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: `${release.title[locale as "fr" | "en"]} — Artist Name`,
    description: t("releaseDescription"),
  };
}

export default async function ReleasePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [releases, design] = await Promise.all([getReleases(), getDesignSettings()]);
  const releaseIndex = releases.findIndex((r) => r.slug === slug);
  const release = releases[releaseIndex];

  if (!release) notFound();

  const prev = releaseIndex > 0 ? releases[releaseIndex - 1] : null;
  const next = releaseIndex < releases.length - 1 ? releases[releaseIndex + 1] : null;

  return (
    <div className="pt-20 sm:pt-28 md:pt-32">
      <div className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-40 2xl:px-56">
        <ReleaseHero release={release} />
        <div className="border-t border-gris-clair/30 mt-8 sm:mt-12" />
        <ReleaseInfo release={release} categories={design.categories} />
        <div className="border-t border-gris-clair/30 mt-4" />
        <ReleaseGallery release={release} />
        <div className="border-t border-gris-clair/30 mt-4" />
        <ReleaseNav prev={prev} next={next} />
      </div>
    </div>
  );
}
