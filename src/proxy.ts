import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/jwt";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get("session")?.value;

  const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;

  // 1. Protect Admin Routes (/admin/*)
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN") {
      // Forbidden: Redirect non-admins to homepage
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 2. Protect BUMDes Dashboard Routes (/dashboard/*)
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== "BUMDES_ADMIN" && session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 3. Protect Checkout Route
  if (pathname === "/checkout") {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Guest Only Routes (/login, /register)
  if ((pathname === "/login" || pathname === "/register") && session) {
    if (session.role === "SUPER_ADMIN" || session.role === "PLATFORM_ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (session.role === "BUMDES_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/checkout",
    "/login",
    "/register",
  ],
};
