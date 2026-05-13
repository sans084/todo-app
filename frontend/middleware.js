import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("jwt")?.value;

  if (pathname.startsWith("/dashboard") && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  if ((pathname === "/signin" || pathname === "/signup") && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/signin", "/signup"] };
