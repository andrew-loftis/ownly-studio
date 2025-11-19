import { NextRequest, NextResponse } from "next/server";
import { verifyClientAccess, createUnauthorizedResponse, createForbiddenResponse } from "@/lib/clientAuth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;

    // Verify client has access to this organization
    const clientUser = await verifyClientAccess(request, orgId);
    if (!clientUser) {
      return createUnauthorizedResponse();
    }

    // Mock organization data
    const mockOrganization = {
      id: orgId,
      name: orgId === "org-1" ? "Acme Corporation" : "StartupXYZ",
      subscription: {
        status: "active",
        plan: "Professional",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    };

    return NextResponse.json(mockOrganization);
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}