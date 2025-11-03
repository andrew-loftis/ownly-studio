import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, query, where, orderBy, limit, startAfter, addDoc, serverTimestamp, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getUserOrgRole } from '@/lib/roles';
import { db } from '@/lib/firebase';
import type { Deliverable } from '@/lib/types/backend';

async function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No authorization token');
  }

  const token = authHeader.split('Bearer ')[1];
  const auth = getAuth();
  const decodedToken = await auth.verifyIdToken(token);
  return decodedToken;
}

// GET /api/admin/deliverables - List deliverables for project or organization
export async function GET(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
    }

    const decodedToken = await verifyAuth(req);
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId');
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const pageSize = parseInt(searchParams.get('limit') || '20');
    const lastDocId = searchParams.get('cursor');

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Check user permissions
    const userRole = await getUserOrgRole(decodedToken.uid, orgId);
    if (!userRole) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Build query
    let queryConstraints: any[] = [
      where('orgId', '==', orgId),
      orderBy('dueDate', 'asc'),
      limit(pageSize)
    ];

    if (projectId) {
      queryConstraints.splice(1, 0, where('projectId', '==', projectId));
    }

    if (status) {
      queryConstraints.splice(projectId ? 2 : 1, 0, where('status', '==', status));
    }

    // For clients, only show deliverables marked as visible to client
    if (userRole === 'client') {
      queryConstraints.splice(-2, 0, where('visibleToClient', '==', true));
    }

    if (lastDocId) {
      const lastDocRef = doc(db, 'deliverables', lastDocId);
      const lastDocSnap = await getDoc(lastDocRef);
      if (lastDocSnap.exists()) {
        queryConstraints.push(startAfter(lastDocSnap));
      }
    }

    const deliverablesQuery = query(collection(db, 'deliverables'), ...queryConstraints);
    const querySnapshot = await getDocs(deliverablesQuery);
    
    const deliverables = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Deliverable[];

    const nextCursor = querySnapshot.docs.length === pageSize 
      ? querySnapshot.docs[querySnapshot.docs.length - 1].id 
      : null;

    return NextResponse.json({
      deliverables,
      nextCursor,
      hasMore: querySnapshot.docs.length === pageSize
    });

  } catch (error) {
    console.error('Error fetching deliverables:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch deliverables' 
    }, { status: 500 });
  }
}

// POST /api/admin/deliverables - Create new deliverable
export async function POST(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
    }

    const decodedToken = await verifyAuth(req);
    const body = await req.json();
    
    const {
      orgId,
      projectId,
      name,
      description,
      type,
      dueDate,
      assignedUid,
      visibleToClient = true,
      clientApprovalRequired = false
    } = body;

    // Validate required fields
    if (!orgId || !projectId || !name || !type || !dueDate) {
      return NextResponse.json({ 
        error: 'Missing required fields: orgId, projectId, name, type, dueDate' 
      }, { status: 400 });
    }

    // Check user permissions
    const userRole = await getUserOrgRole(decodedToken.uid, orgId);
    if (!userRole || !['admin', 'editor'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Verify project exists and user has access
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = projectSnap.data();
    if (project?.orgId !== orgId) {
      return NextResponse.json({ error: 'Project does not belong to organization' }, { status: 403 });
    }

    // Create deliverable
    const deliverableData: Omit<Deliverable, 'id'> = {
      orgId,
      projectId,
      name,
      description: description || '',
      type,
      status: 'pending',
      dueDate: new Date(dueDate),
      assignedUid,
      visibleToClient,
      clientApprovalRequired,
      attachments: [],
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
      createdBy: decodedToken.uid
    };

    const docRef = await addDoc(collection(db, 'deliverables'), deliverableData);
    
    return NextResponse.json({
      id: docRef.id,
      ...deliverableData,
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: new Date(dueDate)
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating deliverable:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create deliverable' 
    }, { status: 500 });
  }
}