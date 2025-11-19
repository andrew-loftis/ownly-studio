import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { z } from "zod";
import { 
  getSubscriptionStatus, 
  updateSubscription, 
  cancelSubscription 
} from "@/lib/stripe/utils";
import { getOrganization } from "@/lib/api/organizations";

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

    const token = authHeader.split("Bearer ")[1];
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get organization and verify access
    const db = getFirestore();
    const orgDoc = await db.collection("organizations").doc(orgId).get();
    
    if (!orgDoc.exists) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const orgData = orgDoc.data();
    if (!orgData?.adminUids?.includes(userId) && !orgData?.editorUids?.includes(userId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get Stripe subscription status
    if (!orgData.subscription?.stripeSubscriptionId) {
      return NextResponse.json({ 
        error: "No active subscription found" 
      }, { status: 404 });
    }

    const subscriptionStatus = await getSubscriptionStatus(
      orgData.subscription.stripeSubscriptionId
    );

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

    const token = authHeader.split("Bearer ")[1];
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get organization and verify admin access
    const db = getFirestore();
    const orgDoc = await db.collection("organizations").doc(orgId).get();
    
    if (!orgDoc.exists) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const orgData = orgDoc.data();
    if (!orgData?.adminUids?.includes(userId)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Update Stripe subscription
    if (!orgData.subscription?.stripeSubscriptionId) {
      return NextResponse.json({ 
        error: "No active subscription to update" 
      }, { status: 404 });
    }

    const updatedSubscription = await updateSubscription(
      orgData.subscription.stripeSubscriptionId,
      features as any
    );

    // Update organization in Firestore
    await db.collection("organizations").doc(orgId).update({
      "subscription.features": features,
      "subscription.plan": features.join(" + "),
      updatedAt: new Date(),
    });

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

    const token = authHeader.split("Bearer ")[1];
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get organization and verify admin access
    const db = getFirestore();
    const orgDoc = await db.collection("organizations").doc(orgId).get();
    
    if (!orgDoc.exists) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const orgData = orgDoc.data();
    if (!orgData?.adminUids?.includes(userId)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Cancel Stripe subscription
    if (!orgData.subscription?.stripeSubscriptionId) {
      return NextResponse.json({ 
        error: "No active subscription to cancel" 
      }, { status: 404 });
    }

    const canceledSubscription = await cancelSubscription(
      orgData.subscription.stripeSubscriptionId,
      immediately
    );

    // Update organization in Firestore
    const updateData: any = {
      "subscription.active": false,
      updatedAt: new Date(),
    };

    if (immediately) {
      updateData["subscription.canceledAt"] = new Date();
    }

    await db.collection("organizations").doc(orgId).update(updateData);

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