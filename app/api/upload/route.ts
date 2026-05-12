import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { isAuthenticated } from "@/lib/auth";

export const maxDuration = 300;

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/avif",
  "video/mp4", "video/webm", "video/quicktime",
  "audio/mpeg", "audio/ogg", "audio/wav", "audio/mp4", "audio/aac",
  "application/pdf",
  "font/woff2", "font/woff", "font/ttf", "font/otf",
  "application/x-font-woff", "application/x-font-woff2",
  "application/x-font-ttf", "application/x-font-otf",
  "application/octet-stream",
];

const FONT_EXTENSIONS  = ["woff2", "woff", "ttf", "otf"];
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];
const VIDEO_EXTENSIONS = ["mp4", "webm", "mov"];
const AUDIO_EXTENSIONS = ["mp3", "ogg", "wav", "m4a", "aac"];

const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_AUDIO_SIZE = 20 * 1024 * 1024;
const MAX_OTHER_SIZE = 10 * 1024 * 1024;

// ── GitHub API file commit (Vercel: filesystem is read-only) ──
async function commitFileToGitHub(repoPath: string, buffer: Buffer): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not set");

  const owner = process.env.GITHUB_OWNER ?? "auremoo";
  const repo  = process.env.GITHUB_REPO  ?? "songs-plateforme";
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };

  // Get SHA if file already exists (needed for update)
  let sha: string | undefined;
  const getRes = await fetch(apiUrl, { headers });
  if (getRes.ok) {
    const data = await getRes.json() as { sha: string };
    sha = data.sha;
  }

  const putRes = await fetch(apiUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: `admin: upload ${repoPath.split("/").pop()}`,
      content: buffer.toString("base64"),
      ...(sha ? { sha } : {}),
    }),
  });

  if (!putRes.ok) {
    const err = await putRes.text();
    throw new Error(`GitHub commit failed (${putRes.status}): ${err}`);
  }
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const slug = formData.get("slug") as string | null;
  const filename = formData.get("filename") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const isFontFile  = FONT_EXTENSIONS.includes(ext);
  const isImage     = IMAGE_EXTENSIONS.includes(ext);
  const isVideo     = VIDEO_EXTENSIONS.includes(ext);
  const isAudio     = AUDIO_EXTENSIONS.includes(ext);

  if (!ALLOWED_TYPES.includes(file.type) && !isFontFile && !isAudio) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const maxSize = isVideo
    ? MAX_VIDEO_SIZE
    : isAudio
    ? MAX_AUDIO_SIZE
    : isImage
    ? MAX_IMAGE_SIZE
    : MAX_OTHER_SIZE;

  if (file.size > maxSize) {
    const maxMb = maxSize / (1024 * 1024);
    return NextResponse.json({ error: `File too large. Maximum ${maxMb}MB` }, { status: 400 });
  }

  let publicPrefix: string;

  if (isFontFile) {
    publicPrefix = "/fonts";
  } else if (isAudio && slug) {
    publicPrefix = `/audio/${slug}`;
  } else if (isAudio) {
    publicPrefix = "/audio";
  } else if (slug) {
    publicPrefix = `/images/releases/${slug}`;
  } else {
    publicPrefix = "/images";
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const baseName = filename
    ? filename
    : file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9.-]/g, "_");
  const safeName = `${baseName}.${ext}`;
  const publicPath = `${publicPrefix}/${safeName}`;

  if (process.env.VERCEL === "1") {
    // Commit directly to GitHub — Vercel redeploys and serves the file as a static asset
    await commitFileToGitHub(`public${publicPath}`, buffer);
  } else {
    const cwd = process.cwd();
    const dir = path.join(/*turbopackIgnore: true*/ cwd, "public", publicPrefix);
    await mkdir(dir, { recursive: true });
    const filePath = path.join(/*turbopackIgnore: true*/ dir, safeName);
    await writeFile(filePath, buffer);
  }

  return NextResponse.json(
    { path: publicPath, type: isVideo ? "video" : isAudio ? "audio" : "image" },
    { status: 201 }
  );
}
