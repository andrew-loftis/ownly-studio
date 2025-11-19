import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/server/firebaseAuth";
import { runQuery } from "@/lib/server/firestoreRest";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    if (!orgId) {
      return NextResponse.json({ error: "orgId required" }, { status: 400 });
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const idToken = authHeader.slice("Bearer ".length);
    const decoded = await verifyFirebaseIdToken(idToken).catch(() => null);
    if (!decoded?.uid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Query invoices for this org from collection group
    const structuredQuery: any = {
      from: [{ collectionGroup: "invoices" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "orgId" },
          op: "EQUAL",
          value: { stringValue: orgId },
        },
      },
      orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
      limit: 100,
    };
    const results = await runQuery(structuredQuery, idToken);
    const invoices = results
      .filter((r: any) => r.document)
      .map((r: any) => {
        const doc = r.document;
        const f = doc.fields || {};
        const num = (x: any) => (x?.doubleValue ?? x?.integerValue ? parseFloat(x.doubleValue ?? x.integerValue) : 0);
        return {
          id: doc.name.split("/").pop(),
          invoiceNumber: f.invoiceNumber?.stringValue || "",
          amount: num(f.total),
          status: f.status?.stringValue || "draft",
          dueDate: f.dueDate?.timestampValue || null,
          items: (f.lineItems?.arrayValue?.values || []).map((v: any) => {
            const lf = v.mapValue?.fields || {};
            return {
              description: lf.description?.stringValue || "",
              amount: num(lf.total),
            };
          }),
        };
      });

    return NextResponse.json(invoices);
  } catch (error: any) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}