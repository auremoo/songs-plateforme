import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getPersonalInfo } from "@/lib/data";
import { AboutGrid } from "@/components/about/AboutGrid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("aboutTitle"),
    description: t("aboutDescription"),
  };
}

export default async function AboutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ a?: string }>;
}) {
  const { locale } = await params;
  const { a } = await searchParams;
  setRequestLocale(locale);

  const info = await getPersonalInfo();
  const artist =
    info.artists.find((ar) => ar.id === a) ?? info.artists[0];

  return <AboutGrid artist={artist} />;
}
