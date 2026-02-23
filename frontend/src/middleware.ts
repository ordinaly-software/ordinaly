import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const verified = req.cookies.get("email_verified")?.value;

  const url = req.nextUrl.pathname;

  const publicRoutes = [
    "/login",
    "/signup",
    "/verify-email",
    "/change-email",
  ];

  if (publicRoutes.includes(url)) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (verified !== "true") {
    return NextResponse.redirect(new URL("/verify-email", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|static|favicon.ico).*)",
  ],
};
