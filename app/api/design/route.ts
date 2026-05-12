import { NextResponse } from "next/server";
import { getDesignSettings, saveDesignSettings } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";
import type { DesignSettings } from "@/types";

export async function GET() {
  const settings = await getDesignSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: DesignSettings = await request.json();
  await saveDesignSettings(body);
  return NextResponse.json(body);
}
