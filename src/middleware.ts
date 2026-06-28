import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rate limiting map (in production, use Redis)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = 100;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers that can't be set in next.config
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://pagead2.googlesyndication.com https://accounts.google.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https: data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://*.tiktok.com https://api.apify.com https://accounts.google.com",
      "frame-src 'self' https://accounts.google.com",
      "media-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join("; ")
  );

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip = request.ip ?? "anonymous";
    const now = Date.now();

    const record = rateLimit.get(ip);
    if (!record || now > record.resetTime) {
      rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    } else if (record.count >= RATE_LIMIT_REQUESTS) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((record.resetTime - now) / 1000)),
        },
      });
    } else {
      record.count++;
    }
  }

  // Prevent clickjacking on sensitive routes
  if (
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/admin")
  ) {
    response.headers.set("X-Frame-Options", "DENY");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
