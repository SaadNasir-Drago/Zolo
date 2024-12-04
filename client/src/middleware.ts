// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Add the paths that need to be protected
const protectedRoutes = ["/create-listing", "/properties", "/messages"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const user = request.cookies.get("user");
  const path = request.nextUrl.pathname;

  // Check if the current path is in protectedRoutes
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  if (isProtectedRoute && (!token || !user)) {
    // Store the attempted URL to redirect back after login
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("redirect", path);
    redirectUrl.searchParams.set("showAuth", "true");

    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/create-listing/:path*", "/properties/:path*", "/messages/:path*"],
};
