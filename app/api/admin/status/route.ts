import { NextResponse } from "next/server";
import { isAdminAvailable, getAdminProjectId } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const available = isAdminAvailable();
    const projectId = getAdminProjectId();
    return NextResponse.json({ adminAvailable: available, projectId: projectId || null });
  } catch (e: any) {
    return NextResponse.json({ adminAvailable: false, projectId: null, error: e?.message }, { status: 200 });
  }
}
