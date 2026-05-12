import fs from "fs/promises";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import type { Release, PersonalInfo, DesignSettings } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");

// ── GitHub API commit (used on Vercel where filesystem is read-only) ──
async function commitToGitHub(fileName: string, content: string): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set — cannot save on Vercel.");

  const owner = process.env.GITHUB_OWNER ?? "auremoo";
  const repo  = process.env.GITHUB_REPO  ?? "songs-plateforme";
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/data/${fileName}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };

  // Need current file SHA for the update
  const getRes = await fetch(apiUrl, { headers });
  if (!getRes.ok) throw new Error(`GitHub GET failed: ${getRes.status}`);
  const { sha } = await getRes.json() as { sha: string };

  const putRes = await fetch(apiUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: `admin: update ${fileName}`,
      content: Buffer.from(content).toString("base64"),
      sha,
    }),
  });
  if (!putRes.ok) {
    const err = await putRes.text();
    throw new Error(`GitHub commit failed: ${err}`);
  }
}

async function saveData(fileName: string, content: string): Promise<void> {
  if (process.env.VERCEL === "1") {
    await commitToGitHub(fileName, content);
  } else {
    await fs.writeFile(path.join(DATA_DIR, fileName), content, "utf-8");
  }
}

// ── Reads ──

export async function getReleases(): Promise<Release[]> {
  noStore();
  const raw = await fs.readFile(path.join(DATA_DIR, "releases.json"), "utf-8");
  return JSON.parse(raw);
}

export async function getReleaseBySlug(slug: string): Promise<Release | undefined> {
  const releases = await getReleases();
  return releases.find((r) => r.slug === slug);
}

export async function getPersonalInfo(): Promise<PersonalInfo> {
  noStore();
  const raw = await fs.readFile(path.join(DATA_DIR, "personal.json"), "utf-8");
  return JSON.parse(raw);
}

export async function getDesignSettings(): Promise<DesignSettings> {
  noStore();
  const raw = await fs.readFile(path.join(DATA_DIR, "design.json"), "utf-8");
  return JSON.parse(raw);
}

// ── Writes ──

export async function saveReleases(releases: Release[]): Promise<void> {
  await saveData("releases.json", JSON.stringify(releases, null, 2));
}

export async function savePersonalInfo(info: PersonalInfo): Promise<void> {
  await saveData("personal.json", JSON.stringify(info, null, 2));
}

export async function saveDesignSettings(settings: DesignSettings): Promise<void> {
  await saveData("design.json", JSON.stringify(settings, null, 2));
}
