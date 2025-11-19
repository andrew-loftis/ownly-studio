import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseIdToken } from '@/lib/server/firebaseAuth';
import { runQuery, addDocument, fs } from '@/lib/server/firestoreRest';
import { getUserOrgRole } from '@/lib/roles';
import type { Deliverable } from '@/lib/types/backend';

// Decode deliverable doc from REST response
function decodeDeliverable(doc: any): Deliverable {
  const f = doc.fields || {};
  return {
    id: doc.name.split('/').pop(),
    orgId: f.orgId?.stringValue || '',
    projectId: f.projectId?.stringValue || '',
    name: f.name?.stringValue || 'Untitled',
    description: f.description?.stringValue || '',
    type: f.type?.stringValue || 'design',
    status: f.status?.stringValue || 'pending',
    dueDate: f.dueDate?.timestampValue,
    completedAt: f.completedAt?.timestampValue,
    assignedUid: f.assignedUid?.stringValue,
    reviewerUid: f.reviewerUid?.stringValue,
    attachments: [],
    visibleToClient: f.visibleToClient?.booleanValue || false,
    clientApprovalRequired: f.clientApprovalRequired?.booleanValue || false,
    clientApproved: f.clientApproved?.booleanValue,
    clientApprovedAt: f.clientApprovedAt?.timestampValue,
    clientFeedback: f.clientFeedback?.stringValue,
    createdBy: f.createdBy?.stringValue || '',
    createdAt: f.createdAt?.timestampValue,
    updatedAt: f.updatedAt?.timestampValue,
  } as any;
}

// GET /api/admin/deliverables
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const idToken = authHeader.slice('Bearer '.length);
    const decoded = await verifyFirebaseIdToken(idToken).catch(() => null);
    if (!decoded?.uid) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId');
    const projectId = searchParams.get('projectId');
    const statusFilter = searchParams.get('status');
    const limitParam = parseInt(searchParams.get('limit') || '50');
    if (!orgId) return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    const userRole = await getUserOrgRole(decoded.uid, orgId);
    if (!userRole) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    const filters: any[] = [
      { fieldFilter: { field: { fieldPath: 'orgId' }, op: 'EQUAL', value: { stringValue: orgId } } },
    ];
    if (projectId) filters.push({ fieldFilter: { field: { fieldPath: 'projectId' }, op: 'EQUAL', value: { stringValue: projectId } } });
    if (statusFilter) filters.push({ fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: statusFilter } } });
    if (userRole === 'client') {
      filters.push({ fieldFilter: { field: { fieldPath: 'visibleToClient' }, op: 'EQUAL', value: { booleanValue: true } } });
    }
    const structuredQuery: any = {
      from: [{ collectionGroup: 'deliverables' }],
      limit: limitParam,
      orderBy: [{ field: { fieldPath: 'dueDate' }, direction: 'ASCENDING' }],
      where: filters.length === 1 ? filters[0] : { compositeFilter: { op: 'AND', filters } },
    };
    const results = await runQuery(structuredQuery, idToken);
    const deliverables = results.filter((r: any) => r.document).map((r: any) => decodeDeliverable(r.document));
    return NextResponse.json({ deliverables, total: deliverables.length });
  } catch (e: any) {
    console.error('Deliverables GET error', e);
    return NextResponse.json({ error: e.message || 'Failed to load deliverables' }, { status: 500 });
  }
}

// POST /api/admin/deliverables
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const idToken = authHeader.slice('Bearer '.length);
    const decoded = await verifyFirebaseIdToken(idToken).catch(() => null);
    if (!decoded?.uid) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    const body = await req.json();
    const { orgId, projectId, name, description = '', type, dueDate, assignedUid, visibleToClient = true, clientApprovalRequired = false } = body;
    if (!orgId || !projectId || !name || !type || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields: orgId, projectId, name, type, dueDate' }, { status: 400 });
    }
    const userRole = await getUserOrgRole(decoded.uid, orgId);
    if (!userRole || !['admin', 'editor'].includes(userRole)) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    const now = new Date();
    const deliverableFields: any = {
      orgId: fs.string(orgId),
      projectId: fs.string(projectId),
      name: fs.string(name),
      description: fs.string(description),
      type: fs.string(type),
      status: fs.string('pending'),
      dueDate: fs.timestamp(new Date(dueDate)),
      assignedUid: assignedUid ? fs.string(assignedUid) : undefined,
      visibleToClient: fs.bool(visibleToClient),
      clientApprovalRequired: fs.bool(clientApprovalRequired),
      createdBy: fs.string(decoded.uid),
      createdAt: fs.timestamp(now),
      updatedAt: fs.timestamp(now),
    };
    Object.keys(deliverableFields).forEach((k) => deliverableFields[k] === undefined && delete deliverableFields[k]);
    const parentPath = `orgs/${orgId}/projects/${projectId}`;
    const created = await addDocument(parentPath, 'deliverables', deliverableFields, idToken);
    const id = created.name?.split('/').pop();
    return NextResponse.json({ id, orgId, projectId, name, status: 'pending', type }, { status: 201 });
  } catch (e: any) {
    console.error('Deliverables POST error', e);
    return NextResponse.json({ error: e.message || 'Failed to create deliverable' }, { status: 500 });
  }
}