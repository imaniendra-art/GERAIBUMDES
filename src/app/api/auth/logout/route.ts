import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

/**
 * Resolves the true public base URL of the incoming request.
 * Prevents redirects to 'localhost' when running in Docker or behind reverse proxies in production.
 */
function getRedirectBaseUrl(req: Request): string {
  // 1. Browser Origin header (present on POST form submissions)
  const origin = req.headers.get("origin");
  if (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
    return origin;
  }

  // 2. Browser Referer header (present on form navigation)
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const refUrl = new URL(referer);
      if (!refUrl.host.includes("localhost") && !refUrl.host.includes("127.0.0.1")) {
        return refUrl.origin;
      }
    } catch {
      // ignore parse error
    }
  }

  // 3. X-Forwarded-Host & X-Forwarded-Proto (standard reverse proxy headers)
  const forwardedHost = req.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const proto = req.headers.get("x-forwarded-proto") || (forwardedHost.includes("localhost") ? "http" : "https");
    return `${proto}://${forwardedHost}`;
  }

  // 4. Host header
  const host = req.headers.get("host");
  if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    return `${proto}://${host}`;
  }

  // 5. Configured public app URL (e.g. https://geraibumdes.com in production)
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.startsWith("http")) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  }

  // 6. Local development fallbacks
  if (origin) return origin;
  if (host) {
    const proto = req.headers.get("x-forwarded-proto") || "http";
    return `${proto}://${host}`;
  }

  return new URL(req.url).origin;
}

export async function POST(req: Request) {
  await deleteSession();

  // If request expects JSON (client-side fetch)
  const acceptHeader = req.headers.get("accept") || "";
  if (acceptHeader.includes("application/json")) {
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  }

  // HTTP 303 (See Other) forces the browser to convert the subsequent request to GET /
  // Prevents browser from re-submitting POST to / which triggers 404
  const baseUrl = getRedirectBaseUrl(req);
  return NextResponse.redirect(new URL("/", baseUrl), 303);
}

export async function GET(req: Request) {
  await deleteSession();
  const baseUrl = getRedirectBaseUrl(req);
  return NextResponse.redirect(new URL("/", baseUrl), 303);
}
