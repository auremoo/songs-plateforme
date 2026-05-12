import { NextResponse } from "next/server";
import { getReleases, saveReleases } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";
import type { Release } from "@/types";

export async function GET() {
  const releases = await getReleases();
  return NextResponse.json(releases);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: Release = await request.json();
  const releases = await getReleases();

  if (releases.some((r) => r.slug === body.slug)) {
    return NextResponse.json(
      { error: "A release with this slug already exists" },
      { status: 409 }
    );
  }

  releases.unshift(body);
  await saveReleases(releases);
  return NextResponse.json(body, { status: 201 });
}
