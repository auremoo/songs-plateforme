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

  let dir: string;
  let publicPrefix: string;

  const cwd = process.cwd();
  if (isFontFile) {
    dir = path.join(/*turbopackIgnore: true*/ cwd, "public/fonts");
    publicPrefix = "/fonts";
  } else if (isAudio && slug) {
    dir = path.join(/*turbopackIgnore: true*/ cwd, "public/audio", slug);
    publicPrefix = `/audio/${slug}`;
  } else if (isAudio) {
    dir = path.join(/*turbopackIgnore: true*/ cwd, "public/audio");
    publicPrefix = "/audio";
  } else if (slug) {
    dir = path.join(/*turbopackIgnore: true*/ cwd, "public/images/releases", slug);
    publicPrefix = `/images/releases/${slug}`;
  } else {
    dir = path.join(/*turbopackIgnore: true*/ cwd, "public/images");
    publicPrefix = "/images";
  }

  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const baseName = filename
    ? filename
    : file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9.-]/g, "_");
  const safeName = `${baseName}.${ext}`;
  const filePath = path.join(/*turbopackIgnore: true*/ dir, safeName);

  await writeFile(filePath, buffer);

  const publicPath = `${publicPrefix}/${safeName}`;

  return NextResponse.json(
    { path: publicPath, type: isVideo ? "video" : isAudio ? "audio" : "image" },
    { status: 201 }
  );
}
