import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAvailable } from "@/lib/firebaseAdmin";
import { verifyFirebaseIdToken } from "@/lib/server/firebaseAuth";
import { addDocument, getDocument, fs } from "@/lib/server/firestoreRest";
import { createCheckoutSession } from "@/lib/stripe/utils";
import { getOrganization } from "@/lib/api/organizations";
import { type Features, type FeatureKey } from "@/lib/pricing";

// Admin SDK configured via lib/firebaseAdmin; avoid ad-hoc init here.

const featuresSchema = z.object({
  website: z.boolean(),
  webapp: z.boolean(),
  ai: z.boolean(),
  automations: z.boolean(),
  payments: z.boolean(),
  cms: z.boolean(),
  email: z.boolean(),
});

const bodySchema = z.object({
  features: featuresSchema,
  orgId: z.string().optional(), // Organization ID for existing orgs
  orgName: z.string().optional(), // For creating new organizations
  email: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { features, orgId, orgName, email } = bodySchema.parse(json);

    // Get selected features as array
    const selectedFeatures: FeatureKey[] = (Object.keys(features) as FeatureKey[])
      .filter((k) => features[k]);

    if (selectedFeatures.length === 0) {
      return NextResponse.json({ error: "No features selected" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    // Get authenticated user
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    // Prefer Admin SDK when available; otherwise verify via JWKS
    let userId: string;
    let decodedToken: any;
    if (isAdminAvailable()) {
      const { getAdminAuth } = await import('@/lib/firebaseAdmin');
      const auth = getAdminAuth();
      decodedToken = await auth.verifyIdToken(token);
      userId = decodedToken.uid;
    } else {
      decodedToken = await verifyFirebaseIdToken(token);
      userId = (decodedToken.uid || decodedToken.user_id) as string;
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    let organization;

    if (orgId) {
      // Use existing organization
      // Fetch org via REST with user's token (rules enforced)
      const orgDoc = await getDocument(`orgs/${orgId}`, token);
      if (!orgDoc || !orgDoc.fields) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      }
      const orgData = {
        adminUids: orgDoc.fields.adminUids?.arrayValue?.values?.map((v: any) => v.stringValue) || [],
        name: orgDoc.fields.name?.stringValue || 'Org',
      } as any;
      // Verify user has admin access to this org
      if (!orgData?.adminUids?.includes(userId)) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
      
      organization = { id: orgId, ...orgData };
    } else if (orgName) {
      // Create new organization
      const newOrgData = {
        name: orgName,
        slug: orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        primaryContact: {
          name: decodedToken.name || decodedToken.email || "",
          email: email || decodedToken.email || "",
        },
        adminUids: [userId],
        editorUids: [],
        clientUids: [],
        subscription: {
          plan: "professional",
          active: false,
          features: selectedFeatures,
          billingEmail: email || decodedToken.email || "",
          setupTotal: 0,
          monthlyTotal: 0,
          setupPaid: false,
          startDate: new Date(),
        },
        settings: {
          timezone: "America/New_York",
          currency: "USD",
          allowClientUploads: true,
          enableNotifications: true,
        },
        createdBy: userId,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create via REST with user's token (rules enforced)
      const doc = await addDocument('orgs', '', {
        name: fs.string(newOrgData.name),
        slug: fs.string(newOrgData.slug),
        primaryContact: {
          mapValue: {
            fields: {
              name: fs.string(newOrgData.primaryContact.name),
              email: fs.string(newOrgData.primaryContact.email),
            }
          }
        },
        adminUids: fs.array(newOrgData.adminUids.map(fs.string)),
        editorUids: fs.array([]),
        clientUids: fs.array([]),
        subscription: {
          mapValue: {
            fields: {
              plan: fs.string(newOrgData.subscription.plan),
              active: fs.bool(false),
              features: fs.array(newOrgData.subscription.features.map(fs.string)),
              billingEmail: fs.string(newOrgData.subscription.billingEmail),
              setupTotal: fs.number(0),
              monthlyTotal: fs.number(0),
              setupPaid: fs.bool(false),
              startDate: fs.timestamp(new Date()),
            }
          }
        },
        settings: {
          mapValue: {
            fields: {
              timezone: fs.string(newOrgData.settings.timezone),
              currency: fs.string(newOrgData.settings.currency),
              allowClientUploads: fs.bool(true),
              enableNotifications: fs.bool(true),
            }
          }
        },
        createdBy: fs.string(userId),
        status: fs.string('active'),
        createdAt: fs.timestamp(new Date()),
        updatedAt: fs.timestamp(new Date()),
      }, token);
      const createdName: string = doc.name; // projects/.../documents/orgs/{id}
      const id = createdName.split('/').pop();
      organization = { id, ...newOrgData };
    } else {
      return NextResponse.json({ error: "Either orgId or orgName is required" }, { status: 400 });
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession(
      organization as any,
      selectedFeatures,
      `${origin}/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      `${origin}/build?checkout=cancel`
    );

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout error", err);
    return NextResponse.json({ 
      error: err?.message ?? "Failed to create session" 
    }, { status: 400 });
  }
}
