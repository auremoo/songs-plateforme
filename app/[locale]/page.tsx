import { setRequestLocale } from "next-intl/server";
import { getReleases, getDesignSettings } from "@/lib/data";
import { EditorialGrid } from "@/components/home/EditorialGrid";
import { ArchivesSection } from "@/components/home/ArchivesSection";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const releases = await getReleases();
  const design = await getDesignSettings();

  return (
    <>
      <ArchivesSection releases={releases} gridColumns={design.gridColumns ?? 5} mosaicOrder={design.mosaicOrder} mosaicGrid={design.mosaicGrid} mosaicAlignBottom={design.mosaicAlignBottom ?? false} />
      <EditorialGrid releases={releases} categories={design.categories} />
    </>
  );
}
