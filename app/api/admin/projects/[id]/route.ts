import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getUserOrgRole } from '@/lib/roles';
import { db } from '@/lib/firebase';
import type { Project, Deliverable, Milestone } from '@/lib/types/backend';

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

// GET /api/admin/projects/[id] - Get single project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
    }

    const decodedToken = await verifyAuth(req);
    const { id: projectId } = await params;

    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = { id: projectSnap.id, ...projectSnap.data() } as Project;

    // Check user permissions
    const userRole = await getUserOrgRole(decodedToken.uid, project.orgId);
    if (!userRole) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Clients can only see projects they're assigned to
    if (userRole === 'client' && !project.assignedClientUids.includes(decodedToken.uid)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json(project);

  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch project' 
    }, { status: 500 });
  }
}

// PUT /api/admin/projects/[id] - Update project
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
    }

    const decodedToken = await verifyAuth(req);
    const { id: projectId } = await params;
    const updates = await req.json();

    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = projectSnap.data() as Project;

    // Check user permissions
    const userRole = await getUserOrgRole(decodedToken.uid, project.orgId);
    if (!userRole || !['admin', 'editor'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.orgId;
    delete updateData.createdAt;
    delete updateData.createdBy;

    await updateDoc(projectRef, updateData);

    const updatedProjectSnap = await getDoc(projectRef);
    const updatedProject = { id: updatedProjectSnap.id, ...updatedProjectSnap.data() };

    return NextResponse.json(updatedProject);

  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to update project' 
    }, { status: 500 });
  }
}

// DELETE /api/admin/projects/[id] - Delete project
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
    }

    const decodedToken = await verifyAuth(req);
    const { id: projectId } = await params;

    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = projectSnap.data() as Project;

    // Check user permissions - only admins can delete projects
    const userRole = await getUserOrgRole(decodedToken.uid, project.orgId);
    if (!userRole || userRole !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete projects' }, { status: 403 });
    }

    await deleteDoc(projectRef);

    return NextResponse.json({ message: 'Project deleted successfully' });

  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to delete project' 
    }, { status: 500 });
  }
}