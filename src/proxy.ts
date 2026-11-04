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
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN") {
      // Forbidden: Redirect non-admins to homepage
      const homeUrl = req.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";
      return NextResponse.redirect(homeUrl);
    }
  }

  // 2. Protect BUMDes Dashboard Routes (/dashboard/*)
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== "BUMDES_ADMIN" && session.role !== "SUPER_ADMIN" && session.role !== "PLATFORM_ADMIN") {
      const homeUrl = req.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";
      return NextResponse.redirect(homeUrl);
    }
  }

  // 3. Protect Checkout Route
  if (pathname === "/checkout") {
    if (!session) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Guest Only Routes (/login, /register)
  if ((pathname === "/login" || pathname === "/register") && session) {
    if (session.role === "SUPER_ADMIN" || session.role === "PLATFORM_ADMIN") {
      const adminUrl = req.nextUrl.clone();
      adminUrl.pathname = "/admin";
      adminUrl.search = "";
      return NextResponse.redirect(adminUrl);
    }
    if (session.role === "BUMDES_ADMIN") {
      const dashUrl = req.nextUrl.clone();
      dashUrl.pathname = "/dashboard";
      dashUrl.search = "";
      return NextResponse.redirect(dashUrl);
    }
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
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
