import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In a full implementation, verify the token and get user ID
    // const token = authHeader.substring(7);
    // const decodedToken = await adminAuth.verifyIdToken(token);
    // const userId = decodedToken.uid;

    // For now, return mock data
    const mockOrganizations = [
      {
        id: "org-1",
        name: "Acme Corporation",
        primaryContact: {
          name: "John Smith",
          email: "john@acme.com",
        },
        subscription: {
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        projectCount: 3,
        outstandingInvoices: 1,
      },
      {
        id: "org-2",
        name: "StartupXYZ",
        primaryContact: {
          name: "Jane Doe",
          email: "jane@startupxyz.com",
        },
        subscription: {
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        },
        projectCount: 1,
        outstandingInvoices: 0,
      },
    ];

    return NextResponse.json(mockOrganizations);
  } catch (error) {
    console.error("Error fetching client organizations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}