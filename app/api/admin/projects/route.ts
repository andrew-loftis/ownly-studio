import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseIdToken } from '@/lib/server/firebaseAuth';
import { runQuery, addDocument, fs } from '@/lib/server/firestoreRest';

// GET /api/admin/projects - List projects across orgs (optionally filter by orgId & status)
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.slice('Bearer '.length);
    const decoded = await verifyFirebaseIdToken(idToken).catch(() => null);
    if (!decoded?.uid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orgIdFilter = searchParams.get('orgId');
    const statusFilter = searchParams.get('status');
    const limitParam = parseInt(searchParams.get('limit') || '50');

    // Collection group query for projects under orgs/*/projects
    const structuredQuery: any = {
      from: [{ collectionGroup: 'projects' }],
      limit: limitParam,
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
      where: undefined,
    };

    // Build filters
    const filters: any[] = [];
    if (orgIdFilter) {
      filters.push({
        fieldFilter: {
          field: { fieldPath: 'orgId' },
          op: 'EQUAL',
          value: { stringValue: orgIdFilter },
        },
      });
    }
    if (statusFilter) {
      filters.push({
        fieldFilter: {
          field: { fieldPath: 'status' },
          op: 'EQUAL',
          value: { stringValue: statusFilter },
        },
      });
    }
    if (filters.length === 1) {
      structuredQuery.where = filters[0];
    } else if (filters.length > 1) {
      structuredQuery.where = { compositeFilter: { op: 'AND', filters } };
    }

    const results = await runQuery(structuredQuery, idToken);
    interface ProjectDoc {
      id: string;
      orgId: string;
      name: string;
      status: string;
      priority: string;
      progress: number;
      clientEmail: string;
      createdAt: string | null;
      estimatedEndDate: string | null;
    }
    const projects: ProjectDoc[] = results
      .filter((r: any) => r.document)
      .map((r: any) => {
        const doc = r.document;
        const f = doc.fields || {};
        const progressField = f.progress?.mapValue?.fields?.percentage;
        return {
          id: doc.name.split('/').pop(),
          orgId: f.orgId?.stringValue || '',
          name: f.name?.stringValue || 'Untitled',
          status: f.status?.stringValue || 'planning',
          priority: f.priority?.stringValue || 'medium',
          progress: progressField?.integerValue ? parseInt(progressField.integerValue) : progressField?.doubleValue ? parseFloat(progressField.doubleValue) : 0,
          clientEmail: f.clientEmail?.stringValue || '',
          createdAt: f.createdAt?.timestampValue || null,
          estimatedEndDate: f.estimatedEndDate?.timestampValue || null,
        };
      });

    // Aggregate metrics
    const metrics = {
      total: projects.length,
      byStatus: projects.reduce((acc: Record<string, number>, p: any) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {}),
  inProgress: projects.filter((p: ProjectDoc) => ['planning', 'in-progress', 'review'].includes(p.status)).length,
  completed: projects.filter((p: ProjectDoc) => p.status === 'completed').length,
    };

    return NextResponse.json({ projects, metrics });
  } catch (e: any) {
    console.error('Projects GET error', e);
    return NextResponse.json({ error: e.message || 'Failed to load projects' }, { status: 500 });
  }
}

// POST /api/admin/projects - Create project under orgs/{orgId}/projects
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.slice('Bearer '.length);
    const decoded = await verifyFirebaseIdToken(idToken).catch(() => null);
    if (!decoded?.uid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { orgId, name, description, assignedClientUids = [], priority = 'medium', estimatedValue = 0, deadline } = body;
    if (!orgId || !name) {
      return NextResponse.json({ error: 'orgId and name required' }, { status: 400 });
    }

    // Minimal project doc fields (match Firestore client expectations)
    const now = new Date();
    const projectFields: any = {
      orgId: fs.string(orgId),
      name: fs.string(name),
      description: fs.string(description || ''),
      status: fs.string('planning'),
      priority: fs.string(priority),
      createdAt: fs.timestamp(now),
      updatedAt: fs.timestamp(now),
      startDate: fs.timestamp(now),
      estimatedEndDate: deadline ? fs.timestamp(new Date(deadline)) : undefined,
      assignedClientUids: fs.array(assignedClientUids.map((uid: string) => fs.string(uid))),
      assignedEditorUids: fs.array([fs.string(decoded.uid)]),
      projectManager: fs.string(decoded.uid),
      progress: {
        mapValue: {
          fields: {
            percentage: fs.number(0),
            currentPhase: fs.string('Planning'),
            milestonesCompleted: fs.number(0),
            milestonesTotal: fs.number(0),
          },
        },
      },
      quote: {
        mapValue: {
          fields: {
            setup: fs.number(estimatedValue),
            monthly: fs.number(0),
            approved: fs.bool(false),
          },
        },
      },
    };

    // Remove undefined fields (e.g., estimatedEndDate when no deadline)
    Object.keys(projectFields).forEach((k) => projectFields[k] === undefined && delete projectFields[k]);

    const parentPath = `orgs/${orgId}`;
    const created = await addDocument(parentPath, 'projects', projectFields, idToken);
    const id = created.name?.split('/').pop();

    return NextResponse.json({ id, orgId, name, status: 'planning', priority }, { status: 201 });
  } catch (e: any) {
    console.error('Projects POST error', e);
    return NextResponse.json({ error: e.message || 'Failed to create project' }, { status: 500 });
  }
}