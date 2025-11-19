import { NextRequest, NextResponse } from "next/server";

export interface ClientUser {
  uid: string;
  email: string;
  displayName?: string;
  organizations: string[]; // Organization IDs the user has access to
  role: "client" | "admin" | "editor";
}

export async function verifyClientAccess(
  request: NextRequest,
  organizationId?: string
): Promise<ClientUser | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // In a real implementation, verify the Firebase ID token
    // const decodedToken = await adminAuth.verifyIdToken(token);
    // const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    
    // For now, return mock client user
    const mockUser: ClientUser = {
      uid: "client-user-123",
      email: "john@acme.com",
      displayName: "John Smith",
      organizations: ["org-1", "org-2"], // Organizations this user can access
      role: "client",
    };

    // Check if user has access to the specific organization
    if (organizationId && !mockUser.organizations.includes(organizationId)) {
      return null;
    }

    return mockUser;
  } catch (error) {
    console.error("Error verifying client access:", error);
    return null;
  }
}

export function createUnauthorizedResponse() {
  return NextResponse.json(
    { error: "Unauthorized access" },
    { status: 401 }
  );
}

export function createForbiddenResponse() {
  return NextResponse.json(
    { error: "Access forbidden - insufficient permissions" },
    { status: 403 }
  );
}