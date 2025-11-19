import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseIdToken } from '@/lib/server/firebaseAuth';
import { runQuery, patchDocument, deleteDocument, fs } from '@/lib/server/firestoreRest';
import { getUserOrgRole } from '@/lib/roles';

// Find deliverable doc by id using collectionGroup
async function findDeliverableDoc(deliverableId: string, idToken: string) {
  const results = await runQuery({ from: [{ collectionGroup: 'deliverables' }], limit: 200 }, idToken);
  return results.find((r: any) => r.document && r.document.name.endsWith(`/deliverables/${deliverableId}`))?.document || null;
}

function decodeDeliverable(document: any) {
  if (!document) return null;
  const f = document.fields || {};
  return {
    id: document.name.split('/').pop(),
    orgId: f.orgId?.stringValue || '',
    projectId: f.projectId?.stringValue || '',
    name: f.name?.stringValue || 'Untitled',
    description: f.description?.stringValue || '',
    type: f.type?.stringValue || 'design',
    status: f.status?.stringValue || 'pending',
    dueDate: f.dueDate?.timestampValue,
    completedAt: f.completedAt?.timestampValue,
    assignedUid: f.assignedUid?.stringValue,
    visibleToClient: f.visibleToClient?.booleanValue || false,
    clientApprovalRequired: f.clientApprovalRequired?.booleanValue || false,
    clientApproved: f.clientApproved?.booleanValue || false,
    clientApprovedAt: f.clientApprovedAt?.timestampValue,
    clientFeedback: f.clientFeedback?.stringValue,
    createdBy: f.createdBy?.stringValue || '',
    createdAt: f.createdAt?.timestampValue,
    updatedAt: f.updatedAt?.timestampValue,
  } as any;
}

// GET
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const idToken = authHeader.slice('Bearer '.length);
    const decoded = await verifyFirebaseIdToken(idToken).catch(() => null);
    if (!decoded?.uid) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  const { id } = await params;
  const doc = await findDeliverableDoc(id, idToken);
    if (!doc) return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 });
    const deliverable = decodeDeliverable(doc);
    const userRole = await getUserOrgRole(decoded.uid, deliverable.orgId);
    if (!userRole) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    if (userRole === 'client' && !deliverable.visibleToClient) return NextResponse.json({ error: 'Deliverable not visible to clients' }, { status: 403 });
    return NextResponse.json(deliverable);
  } catch (e: any) {
    console.error('Deliverable GET error', e);
    return NextResponse.json({ error: e.message || 'Failed to load deliverable' }, { status: 500 });
  }
}

// PUT
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const idToken = authHeader.slice('Bearer '.length);
    const decoded = await verifyFirebaseIdToken(idToken).catch(() => null);
    if (!decoded?.uid) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  const { id } = await params;
  const doc = await findDeliverableDoc(id, idToken);
    if (!doc) return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 });
    const deliverable = decodeDeliverable(doc)!;
    const userRole = await getUserOrgRole(decoded.uid, deliverable.orgId);
    if (!userRole) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    const updates = await req.json();
    const isClient = userRole === 'client';
    if (isClient) {
      const allowed = ['clientApproved', 'clientFeedback'];
      if (Object.keys(updates).some(k => !allowed.includes(k))) return NextResponse.json({ error: 'Clients can only update approval fields' }, { status: 403 });
    } else if (!['admin', 'editor'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    const updateFields: any = {};
    Object.entries(updates).forEach(([k, v]) => {
      if (['id', 'orgId', 'projectId', 'createdAt', 'createdBy'].includes(k)) return;
      if (typeof v === 'string') updateFields[k] = fs.string(v);
      else if (typeof v === 'number') updateFields[k] = fs.number(v);
      else if (typeof v === 'boolean') updateFields[k] = fs.bool(v);
      // Timestamps should be sent as ISO strings; optionally handle here
    });
    // Special transitions
    if (updates.status === 'delivered' && deliverable.status !== 'delivered') {
      updateFields.completedAt = fs.timestamp(new Date());
    }
    if (updates.clientApproved === true && !deliverable.clientApproved) {
      updateFields.clientApprovedAt = fs.timestamp(new Date());
    }
    updateFields.updatedAt = fs.timestamp(new Date());
    const docPath = doc.name.split(`/documents/`)[1];
    await patchDocument(docPath, updateFields, idToken);
  const refreshed = await findDeliverableDoc(id, idToken);
    return NextResponse.json(decodeDeliverable(refreshed));
  } catch (e: any) {
    console.error('Deliverable PUT error', e);
    return NextResponse.json({ error: e.message || 'Failed to update deliverable' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const idToken = authHeader.slice('Bearer '.length);
    const decoded = await verifyFirebaseIdToken(idToken).catch(() => null);
    if (!decoded?.uid) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  const { id } = await params;
  const doc = await findDeliverableDoc(id, idToken);
    if (!doc) return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 });
    const deliverable = decodeDeliverable(doc)!;
    const userRole = await getUserOrgRole(decoded.uid, deliverable.orgId);
    if (!userRole || !['admin', 'editor'].includes(userRole)) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    const docPath = doc.name.split(`/documents/`)[1];
    await deleteDocument(docPath, idToken);
    return NextResponse.json({ deleted: true });
  } catch (e: any) {
    console.error('Deliverable DELETE error', e);
    return NextResponse.json({ error: e.message || 'Failed to delete deliverable' }, { status: 500 });
  }
}