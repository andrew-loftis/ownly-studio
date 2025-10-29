import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

/** Returns true if the user is admin of at least one org. */
export async function userIsAnyOrgAdmin(uid: string): Promise<boolean> {
  if (!db) return false;
  const q = query(collection(db, "orgs"), where("adminUids", "array-contains", uid));
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function getAdminOrgs(uid: string) {
  if (!db) return [] as { id: string; name: string }[];
  const q = query(collection(db, "orgs"), where("adminUids", "array-contains", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, name: (d.data() as any).name || d.id }));
}
