import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/measurements",
  "/orders",
  "/profile",
  "/dashboard",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("tailor_token")?.value;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/measurements/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/dashboard/:path*",
  ],
};
