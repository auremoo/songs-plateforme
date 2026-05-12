import { NextResponse } from "next/server";
import { getReleases, saveReleases } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";
import type { Release } from "@/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const releases = await getReleases();
  const release = releases.find((r) => r.slug === slug);

  if (!release) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(release);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body: Partial<Release> = await request.json();
  const releases = await getReleases();
  const index = releases.findIndex((r) => r.slug === slug);

  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  releases[index] = { ...releases[index], ...body };
  await saveReleases(releases);
  return NextResponse.json(releases[index]);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const releases = await getReleases();
  const filtered = releases.filter((r) => r.slug !== slug);

  if (filtered.length === releases.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await saveReleases(filtered);
  return NextResponse.json({ success: true });
}
