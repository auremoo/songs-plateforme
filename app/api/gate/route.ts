import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPersonalInfo } from "@/lib/data";
import { hashGateToken, GATE_COOKIE } from "@/lib/gate";

export async function POST(request: Request) {
  const { password } = await request.json();
  const info = await getPersonalInfo();

  if (!info.sitePasswordEnabled) {
    return NextResponse.json({ success: true });
  }

  if (password !== info.sitePassword) {
    return NextResponse.json(
      { error: "Mot de passe incorrect" },
      { status: 401 }
    );
  }

  const token = hashGateToken(info.sitePassword);
  const cookieStore = await cookies();
  cookieStore.set(GATE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  return NextResponse.json({ success: true });
}
