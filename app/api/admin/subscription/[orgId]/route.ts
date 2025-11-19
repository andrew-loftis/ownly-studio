import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { 
  getSubscriptionStatus, 
  updateSubscription, 
  cancelSubscription 
} from "@/lib/stripe/utils";
import { verifyFirebaseIdToken } from "@/lib/server/firebaseAuth";
import { getDocument, patchDocument, fs } from "@/lib/server/firestoreRest";

const updateSubscriptionSchema = z.object({
  features: z.array(z.string()),
});

const cancelSubscriptionSchema = z.object({
  immediately: z.boolean().optional(),
});

/**
 * GET /api/admin/subscription/[orgId] - Get subscription status
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await verifyFirebaseIdToken(idToken).catch(() => null);
    if (!decoded?.uid) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Get organization and verify access (admin or editor)
    const orgDoc = await getDocument(`orgs/${orgId}`, idToken).catch(() => null);
    if (!orgDoc?.fields) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }
    const f = orgDoc.fields;
    const adminUids = f.adminUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    const editorUids = f.editorUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    if (!adminUids.includes(decoded.uid) && !editorUids.includes(decoded.uid)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get Stripe subscription status
    const subFields = f.subscription?.mapValue?.fields || {};
    const stripeSubId = subFields.stripeSubscriptionId?.stringValue;
    if (!stripeSubId) {
      return NextResponse.json({ 
        error: "No active subscription found" 
      }, { status: 404 });
    }

    const subscriptionStatus = await getSubscriptionStatus(stripeSubId);

    return NextResponse.json(subscriptionStatus);
  } catch (error: any) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to fetch subscription" 
    }, { status: 500 });
  }
}

/**
 * PUT /api/admin/subscription/[orgId] - Update subscription features
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const body = await req.json();
    const { features } = updateSubscriptionSchema.parse(body);
    
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await verifyFirebaseIdToken(idToken).catch(() => null);
    if (!decoded?.uid) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Get organization and verify admin access
    const orgDoc = await getDocument(`orgs/${orgId}`, idToken).catch(() => null);
    if (!orgDoc?.fields) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }
    const f = orgDoc.fields;
    const adminUids = f.adminUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    if (!adminUids.includes(decoded.uid)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Update Stripe subscription
    const subFields = f.subscription?.mapValue?.fields || {};
    const stripeSubId = subFields.stripeSubscriptionId?.stringValue;
    if (!stripeSubId) {
      return NextResponse.json({ 
        error: "No active subscription to update" 
      }, { status: 404 });
    }

    const updatedSubscription = await updateSubscription(stripeSubId, features as any);

    // Build new subscription map by merging existing
    const newSubMap: any = {
      ...Object.fromEntries(Object.entries(subFields).map(([k, v]: any) => [k, v])),
      features: { arrayValue: { values: features.map((f: string) => fs.string(f)) } },
      plan: fs.string(features.join(" + ")),
    };

    // Patch subscription map and updatedAt
    await patchDocument(`orgs/${orgId}`, {
      subscription: { mapValue: { fields: newSubMap } },
      updatedAt: fs.timestamp(new Date()),
    }, idToken);

    return NextResponse.json({ 
      success: true, 
      subscription: updatedSubscription 
    });
  } catch (error: any) {
    console.error("Error updating subscription:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to update subscription" 
    }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/subscription/[orgId] - Cancel subscription
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const url = new URL(req.url);
    const immediately = url.searchParams.get("immediately") === "true";
    
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await verifyFirebaseIdToken(idToken).catch(() => null);
    if (!decoded?.uid) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Get organization and verify admin access
    const orgDoc = await getDocument(`orgs/${orgId}`, idToken).catch(() => null);
    if (!orgDoc?.fields) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }
    const f = orgDoc.fields;
    const adminUids = f.adminUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [];
    if (!adminUids.includes(decoded.uid)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Cancel Stripe subscription
    const subFields = f.subscription?.mapValue?.fields || {};
    const stripeSubId = subFields.stripeSubscriptionId?.stringValue;
    if (!stripeSubId) {
      return NextResponse.json({ 
        error: "No active subscription to cancel" 
      }, { status: 404 });
    }
    const canceledSubscription = await cancelSubscription(stripeSubId, immediately);

    // Build new subscription map with active=false and optional canceledAt
    const newSubMap: any = {
      ...Object.fromEntries(Object.entries(subFields).map(([k, v]: any) => [k, v])),
      active: fs.bool(false),
    };
    if (immediately) {
      newSubMap.canceledAt = fs.timestamp(new Date());
    }

    await patchDocument(`orgs/${orgId}`, {
      subscription: { mapValue: { fields: newSubMap } },
      updatedAt: fs.timestamp(new Date()),
    }, idToken);

    return NextResponse.json({ 
      success: true, 
      subscription: canceledSubscription,
      canceledImmediately: immediately 
    });
  } catch (error: any) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to cancel subscription" 
    }, { status: 500 });
  }
}