import { NextRequest, NextResponse } from "next/server";
import { isAdminPassword } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (typeof password === "string" && isAdminPassword(password)) {
      const token = Buffer.from(password).toString("base64");
      return NextResponse.json({ token, success: true });
    }
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
