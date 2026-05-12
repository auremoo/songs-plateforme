import { NextResponse } from "next/server";
import { getPersonalInfo, savePersonalInfo } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";
import type { PersonalInfo } from "@/types";

export async function GET() {
  const info = await getPersonalInfo();
  return NextResponse.json(info);
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: PersonalInfo = await request.json();
  await savePersonalInfo(body);
  return NextResponse.json(body);
}
