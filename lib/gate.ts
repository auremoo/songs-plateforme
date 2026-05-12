import { createHash } from "crypto";

const GATE_COOKIE = "site_access";
const SALT = "mto_gate_salt_2026";

export function hashGateToken(password: string): string {
  return createHash("sha256").update(`${SALT}:${password}`).digest("hex");
}

export { GATE_COOKIE };
