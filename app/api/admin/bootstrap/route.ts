import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, isAdminAvailable } from "@/lib/firebaseAdmin";

// POST /api/admin/bootstrap
// Grants site-wide admin claims to the authenticated user if their email is allowed.
// Allowed if:
// - Email ends with @ownly.studio, or contains 'aloft'
// - OR matches any email in env ADMIN_EMAILS (comma-separated)
export async function POST(req: NextRequest) {
  try {
    if (!isAdminAvailable()) {
      return NextResponse.json({ error: "Admin SDK not configured; bootstrap disabled. Use ownly/aloft email fallback or configure FIREBASE_ADMIN_* envs." }, { status: 501 });
    }
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(token);

  const email = decoded.email || "";
  // Accept either ADMIN_EMAILS or SITE_ADMIN_EMAILS as the allowlist source
  const allowlistRaw = process.env.ADMIN_EMAILS || process.env.SITE_ADMIN_EMAILS || "";
  const allowedEnv = allowlistRaw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
    const domainAllowed = email.toLowerCase().endsWith("@ownly.studio") || email.toLowerCase().includes("aloft");
    const isAllowed = domainAllowed || allowedEnv.includes(email.toLowerCase());

    if (!isAllowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await auth.setCustomUserClaims(decoded.uid, {
      ...(decoded as any).customClaims,
      admin: true,
      siteRole: "superadmin",
    });

    return NextResponse.json({ success: true, message: "Claims set. Sign out and back in to refresh." });
  } catch (err: any) {
    console.error("Bootstrap error:", err);
    return NextResponse.json({ error: err?.message || "Failed to set claims" }, { status: 500 });
  }
}
