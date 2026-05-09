import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (but not /admin/login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // If already logged in, redirect away from login page
  if (pathname === "/admin/login") {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
