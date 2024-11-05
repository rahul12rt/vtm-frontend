import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("user");

  if (
    !token &&
    request.nextUrl.pathname !== "/login" &&
    !request.nextUrl.pathname.startsWith("/_next/") &&
    !request.nextUrl.pathname.startsWith("/api/")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image).*)"],
};
