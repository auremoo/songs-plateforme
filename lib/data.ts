import fs from "fs/promises";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import type { Release, PersonalInfo, DesignSettings } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");

export async function getReleases(): Promise<Release[]> {
  noStore();
  const raw = await fs.readFile(path.join(DATA_DIR, "releases.json"), "utf-8");
  return JSON.parse(raw);
}

export async function getReleaseBySlug(slug: string): Promise<Release | undefined> {
  const releases = await getReleases();
  return releases.find((r) => r.slug === slug);
}

export async function saveReleases(releases: Release[]): Promise<void> {
  await fs.writeFile(
    path.join(DATA_DIR, "releases.json"),
    JSON.stringify(releases, null, 2),
    "utf-8"
  );
}

export async function getPersonalInfo(): Promise<PersonalInfo> {
  noStore();
  const raw = await fs.readFile(
    path.join(DATA_DIR, "personal.json"),
    "utf-8"
  );
  return JSON.parse(raw);
}

export async function savePersonalInfo(info: PersonalInfo): Promise<void> {
  await fs.writeFile(
    path.join(DATA_DIR, "personal.json"),
    JSON.stringify(info, null, 2),
    "utf-8"
  );
}

export async function getDesignSettings(): Promise<DesignSettings> {
  noStore();
  const raw = await fs.readFile(
    path.join(DATA_DIR, "design.json"),
    "utf-8"
  );
  return JSON.parse(raw);
}

export async function saveDesignSettings(settings: DesignSettings): Promise<void> {
  await fs.writeFile(
    path.join(DATA_DIR, "design.json"),
    JSON.stringify(settings, null, 2),
    "utf-8"
  );
}
