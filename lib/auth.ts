import { cookies } from "next/headers";
import { createHash } from "crypto";

const SESSION_COOKIE = "admin_session";
const SESSION_DURATION = 24 * 60 * 60; // 24 hours

function getSessionToken(): string {
  const password = process.env.ADMIN_PASSWORD ?? "";
  return createHash("sha256")
    .update(`${password}_session_token`)
    .digest("hex");
}

export function verifyPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD;
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, getSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value === getSessionToken();
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
