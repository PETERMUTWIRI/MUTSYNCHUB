import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // If tunnel forwarded host exists, normalize origin/host so Next's Server Actions check passes.
  const xfHost = req.headers.get("x-forwarded-host");
  if (xfHost) {
    const xfProto = req.headers.get("x-forwarded-proto") || "https";
    const normalizedOrigin = `${xfProto}://${xfHost}`;

    // Copy existing headers and override origin/host
    const headers = new Headers(req.headers);
    headers.set("origin", normalizedOrigin);
    headers.set("host", xfHost);

    // Return request with modified headers (applies to downstream Next handling)
    return NextResponse.next({
      request: {
        headers,
      },
    });
  }

  return NextResponse.next();
}