import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export async function POST(req: Request) {
  await deleteSession();

  // If request expects JSON (client-side fetch)
  const acceptHeader = req.headers.get("accept") || "";
  if (acceptHeader.includes("application/json")) {
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  }

  // HTTP 303 (See Other) forces the browser to convert the subsequent request to GET /
  // Prevents browser from re-submitting POST to / which triggers 404
  return NextResponse.redirect(new URL("/", req.url), 303);
}

export async function GET(req: Request) {
  await deleteSession();
  return NextResponse.redirect(new URL("/", req.url), 303);
}
