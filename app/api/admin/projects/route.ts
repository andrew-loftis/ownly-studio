import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getFirestore, collection, query, where, orderBy, limit, startAfter, addDoc, serverTimestamp, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getApps, initializeApp } from 'firebase-admin/app';
import { credential } from 'firebase-admin';
import { getUserOrgRole } from '@/lib/roles';
import { db } from '@/lib/firebase';
import { FeatureKey } from '@/lib/pricing';
import type { Project, ProjectStatus } from '@/lib/types/backend';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (privateKey && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
    initializeApp({
      credential: credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }
}

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

// GET /api/admin/projects - List projects for organization
export async function GET(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
    }

    const decodedToken = await verifyAuth(req);
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId');
    const status = searchParams.get('status') as ProjectStatus;
    const assignedClientUid = searchParams.get('assignedClientUid');
    const pageSize = parseInt(searchParams.get('limit') || '20');
    const lastDocId = searchParams.get('cursor');

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Check user permissions
    const userRole = await getUserOrgRole(decodedToken.uid, orgId);
    if (!userRole || !['admin', 'editor'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Build query
    let queryConstraints: any[] = [
      where('orgId', '==', orgId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    ];

    if (status) {
      queryConstraints.splice(1, 0, where('status', '==', status));
    }

    if (assignedClientUid) {
      queryConstraints.splice(status ? 2 : 1, 0, where('assignedClientUids', 'array-contains', assignedClientUid));
    }

    if (lastDocId) {
      const lastDocRef = doc(db, 'projects', lastDocId);
      const lastDocSnap = await getDoc(lastDocRef);
      if (lastDocSnap.exists()) {
        queryConstraints.push(startAfter(lastDocSnap));
      }
    }

    const projectsQuery = query(collection(db, 'projects'), ...queryConstraints);
    const querySnapshot = await getDocs(projectsQuery);
    
    const projects = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];

    const nextCursor = querySnapshot.docs.length === pageSize 
      ? querySnapshot.docs[querySnapshot.docs.length - 1].id 
      : null;

    return NextResponse.json({
      projects,
      nextCursor,
      hasMore: querySnapshot.docs.length === pageSize
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch projects' 
    }, { status: 500 });
  }
}

// POST /api/admin/projects - Create new project
export async function POST(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
    }

    const decodedToken = await verifyAuth(req);
    const body = await req.json();
    
    const {
      orgId,
      name,
      description,
      assignedClientUids,
      estimatedValue,
      deadline,
      priority = 'medium'
    } = body;

    // Validate required fields
    if (!orgId || !name || !assignedClientUids || !Array.isArray(assignedClientUids)) {
      return NextResponse.json({ 
        error: 'Missing required fields: orgId, name, assignedClientUids (array)' 
      }, { status: 400 });
    }

    // Check user permissions
    const userRole = await getUserOrgRole(decodedToken.uid, orgId);
    if (!userRole || !['admin', 'editor'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Validate clients exist in organization
    for (const clientUid of assignedClientUids) {
      const clientRef = doc(db, 'users', clientUid);
      const clientSnap = await getDoc(clientRef);
      if (!clientSnap.exists()) {
        return NextResponse.json({ error: `Client ${clientUid} not found` }, { status: 404 });
      }
    }

    // Create project
    const projectData: Omit<Project, 'id'> = {
      orgId,
      name,
      description: description || '',
      status: 'planning',
      priority,
      
      // Timeline
      startDate: serverTimestamp() as any,
      estimatedEndDate: deadline ? new Date(deadline) : null,
      
      // Assignment
      assignedEditorUids: [decodedToken.uid], // Creator is automatically assigned
      assignedClientUids,
      projectManager: decodedToken.uid,
      
      // Features and pricing
      features: [],
      quote: {
        setup: estimatedValue || 0,
        monthly: 0,
        breakdown: {
          website: { setup: 0, monthly: 0 },
          webapp: { setup: 0, monthly: 0 },
          ai: { setup: 0, monthly: 0 },
          automations: { setup: 0, monthly: 0 },
          payments: { setup: 0, monthly: 0 },
          cms: { setup: 0, monthly: 0 },
          email: { setup: 0, monthly: 0 }
        },
        approved: false
      },
      
      // Progress tracking
      progress: {
        percentage: 0,
        currentPhase: 'Planning',
        milestonesCompleted: 0,
        milestonesTotal: 0
      },
      
      createdAt: serverTimestamp() as any,
      updatedAt: serverTimestamp() as any,
      createdBy: decodedToken.uid
    };

    const docRef = await addDoc(collection(db, 'projects'), projectData);
    
    return NextResponse.json({
      id: docRef.id,
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create project' 
    }, { status: 500 });
  }
}