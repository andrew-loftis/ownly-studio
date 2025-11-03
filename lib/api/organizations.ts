import { db } from "@/lib/firebase";
import { collection, doc, addDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit, serverTimestamp } from "firebase/firestore";
import type { Organization, Project, CreateOrganizationData, CreateProjectData } from "@/lib/types/backend";

/** Create a new organization */
export async function createOrganization(data: CreateOrganizationData): Promise<string> {
  if (!db) throw new Error("Database not initialized");
  
  const orgData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: 'active' as const,
    // Ensure created user is an admin
    adminUids: data.adminUids?.length ? data.adminUids : [data.createdBy]
  };
  
  const docRef = await addDoc(collection(db, "orgs"), orgData);
  return docRef.id;
}

/** Get organization by ID */
export async function getOrganization(orgId: string): Promise<Organization | null> {
  if (!db) return null;
  
  const orgRef = doc(db, "orgs", orgId);
  const orgSnap = await getDoc(orgRef);
  
  if (!orgSnap.exists()) return null;
  
  return { id: orgSnap.id, ...orgSnap.data() } as Organization;
}

/** Update organization */
export async function updateOrganization(orgId: string, updates: Partial<Organization>): Promise<void> {
  if (!db) throw new Error("Database not initialized");
  
  const orgRef = doc(db, "orgs", orgId);
  await updateDoc(orgRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

/** Delete organization (soft delete by setting status) */
export async function deleteOrganization(orgId: string): Promise<void> {
  if (!db) throw new Error("Database not initialized");
  
  const orgRef = doc(db, "orgs", orgId);
  await updateDoc(orgRef, {
    status: 'archived',
    updatedAt: serverTimestamp()
  });
}

/** Get all active organizations */
export async function getAllOrganizations(): Promise<Organization[]> {
  if (!db) return [];
  
  const q = query(
    collection(db, "orgs"),
    where("status", "==", "active"),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as Organization[];
}

/** Create a new project */
export async function createProject(data: CreateProjectData): Promise<string> {
  if (!db) throw new Error("Database not initialized");
  
  const projectData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    progress: {
      percentage: 0,
      currentPhase: 'planning',
      milestonesCompleted: 0,
      milestonesTotal: 0
    }
  };
  
  const docRef = await addDoc(collection(db, "orgs", data.orgId, "projects"), projectData);
  return docRef.id;
}

/** Get project by ID */
export async function getProject(orgId: string, projectId: string): Promise<Project | null> {
  if (!db) return null;
  
  const projectRef = doc(db, "orgs", orgId, "projects", projectId);
  const projectSnap = await getDoc(projectRef);
  
  if (!projectSnap.exists()) return null;
  
  return { id: projectSnap.id, ...projectSnap.data() } as Project;
}

/** Update project */
export async function updateProject(orgId: string, projectId: string, updates: Partial<Project>): Promise<void> {
  if (!db) throw new Error("Database not initialized");
  
  const projectRef = doc(db, "orgs", orgId, "projects", projectId);
  await updateDoc(projectRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

/** Get all projects for an organization */
export async function getOrgProjects(orgId: string, statusFilter?: string): Promise<Project[]> {
  if (!db) return [];
  
  let q = query(
    collection(db, "orgs", orgId, "projects"),
    orderBy("createdAt", "desc")
  );
  
  if (statusFilter) {
    q = query(
      collection(db, "orgs", orgId, "projects"),
      where("status", "==", statusFilter),
      orderBy("createdAt", "desc")
    );
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as Project[];
}

/** Get projects assigned to a specific user */
export async function getUserProjects(orgId: string, uid: string): Promise<Project[]> {
  if (!db) return [];
  
  // Get projects where user is assigned as editor or client
  const editorQuery = query(
    collection(db, "orgs", orgId, "projects"),
    where("assignedEditorUids", "array-contains", uid),
    orderBy("createdAt", "desc")
  );
  
  const clientQuery = query(
    collection(db, "orgs", orgId, "projects"),
    where("assignedClientUids", "array-contains", uid),
    orderBy("createdAt", "desc")
  );
  
  const [editorSnap, clientSnap] = await Promise.all([
    getDocs(editorQuery),
    getDocs(clientQuery)
  ]);
  
  const projects: Project[] = [];
  const projectIds = new Set<string>();
  
  // Combine results and deduplicate
  [...editorSnap.docs, ...clientSnap.docs].forEach(doc => {
    if (!projectIds.has(doc.id)) {
      projectIds.add(doc.id);
      projects.push({ id: doc.id, ...doc.data() } as Project);
    }
  });
  
  return projects.sort((a, b) => (b.createdAt as any) - (a.createdAt as any));
}

/** Update project progress */
export async function updateProjectProgress(
  orgId: string, 
  projectId: string, 
  progress: {
    percentage?: number;
    currentPhase?: string;
    milestonesCompleted?: number;
    milestonesTotal?: number;
  }
): Promise<void> {
  if (!db) throw new Error("Database not initialized");
  
  const projectRef = doc(db, "orgs", orgId, "projects", projectId);
  const currentProject = await getDoc(projectRef);
  
  if (!currentProject.exists()) throw new Error("Project not found");
  
  const currentProgress = currentProject.data().progress || {};
  const updatedProgress = { ...currentProgress, ...progress };
  
  await updateDoc(projectRef, {
    progress: updatedProgress,
    updatedAt: serverTimestamp()
  });
}

/** Get organization statistics */
export async function getOrgStats(orgId: string): Promise<{
  projectCounts: { total: number; active: number; completed: number; };
  revenueTotal: number;
  teamMemberCount: number;
}> {
  if (!db) return { projectCounts: { total: 0, active: 0, completed: 0 }, revenueTotal: 0, teamMemberCount: 0 };
  
  // Get organization
  const org = await getOrganization(orgId);
  if (!org) return { projectCounts: { total: 0, active: 0, completed: 0 }, revenueTotal: 0, teamMemberCount: 0 };
  
  // Get all projects
  const projects = await getOrgProjects(orgId);
  
  const projectCounts = {
    total: projects.length,
    active: projects.filter(p => ['planning', 'in-progress', 'review'].includes(p.status)).length,
    completed: projects.filter(p => p.status === 'completed').length
  };
  
  const revenueTotal = projects.reduce((sum, p) => sum + (p.quote?.setup || 0), 0);
  
  const teamMemberCount = [...org.adminUids, ...org.editorUids, ...org.clientUids].length;
  
  return { projectCounts, revenueTotal, teamMemberCount };
}