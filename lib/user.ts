import type { User } from "firebase/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

/**
 * Ensure a basic user profile document exists and is updated with latest fields.
 * Collection: users/{uid}
 */
export async function ensureUserDoc(user: User) {
  if (!db) return; // Firebase not configured
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const base = {
    email: user.email ?? null,
    displayName: user.displayName ?? (user.email ? user.email.split("@")[0] : null),
    photoURL: user.photoURL ?? null,
    updatedAt: serverTimestamp(),
  } as const;

  if (!snap.exists()) {
    await setDoc(
      ref,
      {
        ...base,
        createdAt: serverTimestamp(),
        plan: "free",
        subscriptionActive: false,
      },
      { merge: true }
    );
  } else {
    await setDoc(ref, base, { merge: true });
  }
}
