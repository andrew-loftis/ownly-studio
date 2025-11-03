import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
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

// GET /api/admin/deliverables/[id] - Get single deliverable
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
    }

    const decodedToken = await verifyAuth(req);
    const { id: deliverableId } = await params;

    const deliverableRef = doc(db, 'deliverables', deliverableId);
    const deliverableSnap = await getDoc(deliverableRef);

    if (!deliverableSnap.exists()) {
      return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 });
    }

    const deliverable = { id: deliverableSnap.id, ...deliverableSnap.data() } as Deliverable;

    // Check user permissions
    const userRole = await getUserOrgRole(decodedToken.uid, deliverable.orgId);
    if (!userRole) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Clients can only see deliverables marked as visible to them
    if (userRole === 'client' && !deliverable.visibleToClient) {
      return NextResponse.json({ error: 'Deliverable not visible to clients' }, { status: 403 });
    }

    return NextResponse.json(deliverable);

  } catch (error) {
    console.error('Error fetching deliverable:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch deliverable' 
    }, { status: 500 });
  }
}

// PUT /api/admin/deliverables/[id] - Update deliverable
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
    }

    const decodedToken = await verifyAuth(req);
    const { id: deliverableId } = await params;
    const updates = await req.json();

    const deliverableRef = doc(db, 'deliverables', deliverableId);
    const deliverableSnap = await getDoc(deliverableRef);

    if (!deliverableSnap.exists()) {
      return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 });
    }

    const deliverable = deliverableSnap.data() as Deliverable;

    // Check user permissions
    const userRole = await getUserOrgRole(decodedToken.uid, deliverable.orgId);
    if (!userRole) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Different permission levels for different operations
    const isClientUpdate = userRole === 'client';
    const isStatusUpdate = 'status' in updates;
    const isApprovalUpdate = 'clientApproved' in updates || 'clientFeedback' in updates;

    // Clients can only update approval status and feedback on their visible deliverables
    if (isClientUpdate) {
      if (!deliverable.visibleToClient) {
        return NextResponse.json({ error: 'Deliverable not visible to clients' }, { status: 403 });
      }
      
      // Clients can only update approval-related fields
      const allowedClientFields = ['clientApproved', 'clientFeedback'];
      const updatedFields = Object.keys(updates);
      const hasDisallowedFields = updatedFields.some(field => !allowedClientFields.includes(field));
      
      if (hasDisallowedFields) {
        return NextResponse.json({ 
          error: 'Clients can only update approval status and feedback' 
        }, { status: 403 });
      }

      // Add approval timestamp if approving
      if (updates.clientApproved === true) {
        updates.clientApprovedAt = serverTimestamp();
      }
    } else {
      // Admins and editors can update everything except certain protected fields
      if (!['admin', 'editor'].includes(userRole)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      // If marking as completed, set completion timestamp
      if (updates.status === 'delivered' && deliverable.status !== 'delivered') {
        updates.completedAt = serverTimestamp();
      }
    }

    // Prepare update data
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.orgId;
    delete updateData.projectId;
    delete updateData.createdAt;
    delete updateData.createdBy;

    await updateDoc(deliverableRef, updateData);

    const updatedDeliverableSnap = await getDoc(deliverableRef);
    const updatedDeliverable = { id: updatedDeliverableSnap.id, ...updatedDeliverableSnap.data() };

    return NextResponse.json(updatedDeliverable);

  } catch (error) {
    console.error('Error updating deliverable:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to update deliverable' 
    }, { status: 500 });
  }
}

// DELETE /api/admin/deliverables/[id] - Delete deliverable
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
    }

    const decodedToken = await verifyAuth(req);
    const { id: deliverableId } = await params;

    const deliverableRef = doc(db, 'deliverables', deliverableId);
    const deliverableSnap = await getDoc(deliverableRef);

    if (!deliverableSnap.exists()) {
      return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 });
    }

    const deliverable = deliverableSnap.data() as Deliverable;

    // Check user permissions - only admins and editors can delete deliverables
    const userRole = await getUserOrgRole(decodedToken.uid, deliverable.orgId);
    if (!userRole || !['admin', 'editor'].includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions to delete deliverables' }, { status: 403 });
    }

    await deleteDoc(deliverableRef);

    return NextResponse.json({ message: 'Deliverable deleted successfully' });

  } catch (error) {
    console.error('Error deleting deliverable:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to delete deliverable' 
    }, { status: 500 });
  }
}