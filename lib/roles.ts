import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, getDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore";
import type { Organization, OrgRole, TeamMember } from "@/lib/types/backend";

/** Returns true if the user is admin of at least one org. */
export async function userIsAnyOrgAdmin(uid: string): Promise<boolean> {
  if (!db) return false;
  const q = query(collection(db, "orgs"), where("adminUids", "array-contains", uid));
  const snap = await getDocs(q);
  return !snap.empty;
}

/** Get all organizations where user is an admin */
export async function getAdminOrgs(uid: string): Promise<{ id: string; name: string }[]> {
  if (!db) return [];
  const q = query(collection(db, "orgs"), where("adminUids", "array-contains", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d: any) => ({ id: d.id, name: (d.data() as any).name || d.id }));
}

/** Get user's role in a specific organization */
export async function getUserOrgRole(uid: string, orgId: string): Promise<OrgRole | null> {
  if (!db) return null;
  
  const orgRef = doc(db, "orgs", orgId);
  const orgSnap = await getDoc(orgRef);
  
  if (!orgSnap.exists()) return null;
  
  const org = orgSnap.data() as Organization;
  
  if (org.adminUids?.includes(uid)) return 'admin';
  if (org.editorUids?.includes(uid)) return 'editor';
  if (org.clientUids?.includes(uid)) return 'client';
  
  return null;
}

/** Get all organizations where user has any role */
export async function getUserOrgs(uid: string): Promise<Array<{ id: string; name: string; role: OrgRole }>> {
  if (!db) return [];
  
  const adminQuery = query(collection(db, "orgs"), where("adminUids", "array-contains", uid));
  const editorQuery = query(collection(db, "orgs"), where("editorUids", "array-contains", uid));
  const clientQuery = query(collection(db, "orgs"), where("clientUids", "array-contains", uid));
  
  const [adminSnap, editorSnap, clientSnap] = await Promise.all([
    getDocs(adminQuery),
    getDocs(editorQuery),
    getDocs(clientQuery)
  ]);
  
  const orgs: Array<{ id: string; name: string; role: OrgRole }> = [];
  
  adminSnap.forEach((docSnap: any) => {
    orgs.push({ id: docSnap.id, name: docSnap.data().name || docSnap.id, role: 'admin' });
  });
  
  editorSnap.forEach((docSnap: any) => {
    orgs.push({ id: docSnap.id, name: docSnap.data().name || docSnap.id, role: 'editor' });
  });
  
  clientSnap.forEach((docSnap: any) => {
    orgs.push({ id: docSnap.id, name: docSnap.data().name || docSnap.id, role: 'client' });
  });
  
  // Remove duplicates (user could have multiple roles)
  const uniqueOrgs = orgs.reduce((acc, org) => {
    const existing = acc.find(o => o.id === org.id);
    if (!existing) {
      acc.push(org);
    } else if (org.role === 'admin') {
      // Admin role takes precedence
      existing.role = 'admin';
    } else if (org.role === 'editor' && existing.role === 'client') {
      // Editor takes precedence over client
      existing.role = 'editor';
    }
    return acc;
  }, [] as Array<{ id: string; name: string; role: OrgRole }>);
  
  return uniqueOrgs;
}

/** Check if user has permission to access organization */
export async function canAccessOrg(uid: string, orgId: string): Promise<boolean> {
  const role = await getUserOrgRole(uid, orgId);
  return role !== null;
}

/** Check if user has admin or editor permissions in org */
export async function canManageOrg(uid: string, orgId: string): Promise<boolean> {
  const role = await getUserOrgRole(uid, orgId);
  return role === 'admin' || role === 'editor';
}

/** Check if user has admin permissions in org */
export async function isOrgAdmin(uid: string, orgId: string): Promise<boolean> {
  const role = await getUserOrgRole(uid, orgId);
  return role === 'admin';
}

/** Add user to organization with specified role */
export async function addUserToOrg(uid: string, orgId: string, role: OrgRole): Promise<void> {
  if (!db) return;
  
  const orgRef = doc(db, "orgs", orgId);
  const fieldName = `${role}Uids`;
  
  await updateDoc(orgRef, {
    [fieldName]: arrayUnion(uid),
    updatedAt: serverTimestamp()
  });
}

/** Remove user from organization role */
export async function removeUserFromOrg(uid: string, orgId: string, role: OrgRole): Promise<void> {
  if (!db) return;
  
  const orgRef = doc(db, "orgs", orgId);
  const fieldName = `${role}Uids`;
  
  await updateDoc(orgRef, {
    [fieldName]: arrayRemove(uid),
    updatedAt: serverTimestamp()
  });
}

/** Change user's role in organization */
export async function changeUserOrgRole(uid: string, orgId: string, fromRole: OrgRole, toRole: OrgRole): Promise<void> {
  if (!db) return;
  
  const orgRef = doc(db, "orgs", orgId);
  
  await updateDoc(orgRef, {
    [`${fromRole}Uids`]: arrayRemove(uid),
    [`${toRole}Uids`]: arrayUnion(uid),
    updatedAt: serverTimestamp()
  });
}

/** Get all team members for an organization */
export async function getOrgTeamMembers(orgId: string): Promise<TeamMember[]> {
  if (!db) return [];
  
  const orgRef = doc(db, "orgs", orgId);
  const orgSnap = await getDoc(orgRef);
  
  if (!orgSnap.exists()) return [];
  
  const org = orgSnap.data() as Organization;
  const allUids = [...(org.adminUids || []), ...(org.editorUids || []), ...(org.clientUids || [])];
  
  // Get user profiles for all team members
  const teamMembers: TeamMember[] = [];
  
  for (const uid of allUids) {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const role = org.adminUids?.includes(uid) ? 'admin' 
                 : org.editorUids?.includes(uid) ? 'editor' 
                 : 'client';
      
      teamMembers.push({
        uid,
        email: userData.email || '',
        displayName: userData.displayName || userData.email?.split('@')[0] || 'Unknown',
        photoURL: userData.photoURL,
        role,
        joinedAt: userData.createdAt || serverTimestamp() as any
      });
    }
  }
  
  return teamMembers;
}

/** Check if user is Owen (site super admin) */
export function isOwen(uid: string): boolean {
  // Add Owen's actual Firebase UID here
  const owenUids = [
    "owen-firebase-uid-here", // Replace with actual UID
    // Add any other super admin UIDs
  ];
  return owenUids.includes(uid);
}

/** Check if user has site-wide admin privileges */
export async function isSiteAdmin(uid: string): Promise<boolean> {
  return isOwen(uid);
}
