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
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const info = await getPersonalInfo();

  return <AboutGrid info={info} />;
}
