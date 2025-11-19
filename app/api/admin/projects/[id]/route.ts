import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseIdToken } from '@/lib/server/firebaseAuth';
import { runQuery, patchDocument, deleteDocument, fs } from '@/lib/server/firestoreRest';
import { getUserOrgRole } from '@/lib/roles';
import type { Project } from '@/lib/types/backend';

// Helper: find project document across collectionGroup by id
async function findProjectDoc(projectId: string, idToken: string) {
  const structuredQuery: any = {
    from: [{ collectionGroup: 'projects' }],
    where: {
      fieldFilter: {
        field: { fieldPath: '__name__' },
        op: 'EQUAL',
        value: { referenceValue: `projects/${projectId}` } // This direct reference form might not work; fallback below
      }
    },
    limit: 1
  };
  // Firestore collectionGroup can't match __name__ with simple reference when nested; fallback to client-side filter.
  const results = await runQuery({ from: [{ collectionGroup: 'projects' }], limit: 200 }, idToken);
  const match = results.find((r: any) => r.document && r.document.name.endsWith(`/projects/${projectId}`));
  return match?.document || null;
}

function decodeProject(document: any): Project | null {
  if (!document) return null;
  const f = document.fields || {};
  const progressFields = f.progress?.mapValue?.fields || {};
  const quoteFields = f.quote?.mapValue?.fields || {};
  return {
    id: document.name.split('/').pop(),
    orgId: f.orgId?.stringValue || '',
    name: f.name?.stringValue || 'Untitled',
    description: f.description?.stringValue || '',
    status: f.status?.stringValue || 'planning',
    priority: f.priority?.stringValue || 'medium',
    startDate: f.startDate?.timestampValue,
    estimatedEndDate: f.estimatedEndDate?.timestampValue,
    actualEndDate: f.actualEndDate?.timestampValue,
    assignedEditorUids: (f.assignedEditorUids?.arrayValue?.values || []).map((v: any) => v.stringValue),
    assignedClientUids: (f.assignedClientUids?.arrayValue?.values || []).map((v: any) => v.stringValue),
    projectManager: f.projectManager?.stringValue,
    features: (f.features?.arrayValue?.values || []).map((v: any) => v.stringValue),
    quote: {
      setup: quoteFields.setup?.integerValue ? parseInt(quoteFields.setup.integerValue) : quoteFields.setup?.doubleValue ? parseFloat(quoteFields.setup.doubleValue) : 0,
      monthly: quoteFields.monthly?.integerValue ? parseInt(quoteFields.monthly.integerValue) : quoteFields.monthly?.doubleValue ? parseFloat(quoteFields.monthly.doubleValue) : 0,
      breakdown: {},
      approved: quoteFields.approved?.booleanValue || false,
      approvedAt: quoteFields.approvedAt?.timestampValue,
      approvedBy: quoteFields.approvedBy?.stringValue,
    },
    progress: {
      percentage: progressFields.percentage?.integerValue ? parseInt(progressFields.percentage.integerValue) : progressFields.percentage?.doubleValue ? parseFloat(progressFields.percentage.doubleValue) : 0,
      currentPhase: progressFields.currentPhase?.stringValue || 'Planning',
      milestonesCompleted: progressFields.milestonesCompleted?.integerValue ? parseInt(progressFields.milestonesCompleted.integerValue) : 0,
      milestonesTotal: progressFields.milestonesTotal?.integerValue ? parseInt(progressFields.milestonesTotal.integerValue) : 0,
    },
    lastClientUpdate: f.lastClientUpdate?.timestampValue,
    nextCheckIn: f.nextCheckIn?.timestampValue,
    createdBy: f.createdBy?.stringValue || '',
    createdAt: f.createdAt?.timestampValue,
    updatedAt: f.updatedAt?.timestampValue,
  } as any; // Using any to bypass timestamp typing complexity
}

// Extract collection path from document name for patch/delete operations
function getDocumentPath(document: any) {
  return document.name.split(`projects/${document.name.split('/').pop()}`)[0] + `projects/${document.name.split('/').pop()}`;
}

// GET /api/admin/projects/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.slice('Bearer '.length);
    const decoded = await verifyFirebaseIdToken(idToken).catch(() => null);
    if (!decoded?.uid) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const { id } = await params;
  const projectDoc = await findProjectDoc(id, idToken);
    if (!projectDoc) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    const project = decodeProject(projectDoc)!;

    const userRole = await getUserOrgRole(decoded.uid, project.orgId);
    if (!userRole) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    if (userRole === 'client' && !project.assignedClientUids.includes(decoded.uid)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    return NextResponse.json(project);
  } catch (e: any) {
    console.error('Project GET error', e);
    return NextResponse.json({ error: e.message || 'Failed to load project' }, { status: 500 });
  }
}

// PUT /api/admin/projects/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const idToken = authHeader.slice('Bearer '.length);
    const decoded = await verifyFirebaseIdToken(idToken).catch(() => null);
    if (!decoded?.uid) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  const { id } = await params;
  const projectDoc = await findProjectDoc(id, idToken);
    if (!projectDoc) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    const project = decodeProject(projectDoc)!;
    const userRole = await getUserOrgRole(decoded.uid, project.orgId);
    if (!userRole || !['admin', 'editor'].includes(userRole)) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    const updates = await req.json();
    // Build Firestore REST field map
    const updateFields: any = {};
    Object.entries(updates).forEach(([k, v]) => {
      if (['id', 'orgId', 'createdAt', 'createdBy'].includes(k)) return; // protect
      if (typeof v === 'string') updateFields[k] = fs.string(v);
      else if (typeof v === 'number') updateFields[k] = fs.number(v);
      else if (typeof v === 'boolean') updateFields[k] = fs.bool(v);
    });
    updateFields.updatedAt = fs.timestamp(new Date());
    const docPath = projectDoc.name.split(`/documents/`)[1];
    await patchDocument(docPath, updateFields, idToken);
    // Re-fetch
  const refreshed = await findProjectDoc(id, idToken);
    return NextResponse.json(decodeProject(refreshed));
  } catch (e: any) {
    console.error('Project PUT error', e);
    return NextResponse.json({ error: e.message || 'Failed to update project' }, { status: 500 });
  }
}

// DELETE /api/admin/projects/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const idToken = authHeader.slice('Bearer '.length);
    const decoded = await verifyFirebaseIdToken(idToken).catch(() => null);
    if (!decoded?.uid) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  const { id } = await params;
  const projectDoc = await findProjectDoc(id, idToken);
    if (!projectDoc) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    const project = decodeProject(projectDoc)!;
    const userRole = await getUserOrgRole(decoded.uid, project.orgId);
    if (!userRole || userRole !== 'admin') return NextResponse.json({ error: 'Only admins can delete projects' }, { status: 403 });
    const docPath = projectDoc.name.split(`/documents/`)[1];
    await deleteDocument(docPath, idToken);
    return NextResponse.json({ deleted: true });
  } catch (e: any) {
    console.error('Project DELETE error', e);
    return NextResponse.json({ error: e.message || 'Failed to delete project' }, { status: 500 });
  }
}