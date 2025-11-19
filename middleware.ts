import { NextRequest, NextResponse } from "next/server";

// Rewrite pretty example URLs like /examples/<slug> to the static /examples?slug=<slug>
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  // Redirect legacy admin route to the new official admin dashboard
  if (pathname.startsWith("/account/admin")) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.search = search; // preserve query if any
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith("/examples/")) {
    const parts = pathname.split("/").filter(Boolean); // ["examples", "slug", ...]
    const slug = parts[1];
    if (slug) {
      const url = req.nextUrl.clone();
      url.pathname = "/examples";
      url.search = `?slug=${encodeURIComponent(slug)}${search ? "&" + search.replace(/^\?/, "") : ""}`;
      return NextResponse.rewrite(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/examples/:path*", "/account/admin/:path*"],
};
