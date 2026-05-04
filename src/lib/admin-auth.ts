import { NextRequest } from "next/server";

export const ADMIN_PASSWORDS = ["GatheringHub2026!", "tony"];
export const DEFAULT_ADMIN_PASSWORD = ADMIN_PASSWORDS[0];

export function isAdminPassword(password: string) {
  return ADMIN_PASSWORDS.includes(password);
}

export function isAdminRequest(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  try {
    const decoded = Buffer.from(auth.slice(7), "base64").toString("utf8");
    return isAdminPassword(decoded);
  } catch {
    return false;
  }
}
