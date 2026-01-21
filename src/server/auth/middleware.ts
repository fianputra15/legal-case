import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";


export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const protectedPaths = [ "/", "/my-cases", "/messages"]; // protect these routes
  const pathname = req.nextUrl.pathname;

  if (protectedPaths.some(path => pathname.startsWith(path))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

// Specify matcher
export const config = {
  matcher: [ "/", "/my-cases/:path*", "/messages/:path*"],
};