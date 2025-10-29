"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuthStore } from "@/lib/authStore";

export default function FirebaseDebugPage() {
  const user = useAuthStore((s) => s.user);
  const openModal = useAuthStore((s) => s.openModal);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signOut = useAuthStore((s) => s.signOut);

  const [subStatus, setSubStatus] = useState<null | boolean | "loading">(null);

  useEffect(() => {
    const run = async () => {
      if (!user || !db) {
        setSubStatus(null);
        return;
      }
      setSubStatus("loading");
      try {
        const ref = doc(db, "subscriptions", user.uid);
        const snap = await getDoc(ref);
        setSubStatus(snap.exists() ? Boolean((snap.data() as any).subscriptionActive) : false);
      } catch {
        setSubStatus(null);
      }
    };
    run();
  }, [user]);

  const inProd = typeof window !== "undefined" && window.location.hostname !== "localhost";

  return (
    <div className="px-4 py-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--txt)]">Firebase Debug</h1>
      {inProd && (
        <div className="text-sm text-amber-300/90">This page is intended for development; consider removing it in production.</div>
      )}

      <div className="rounded-lg border border-white/10 p-4 bg-white/[0.03]">
        <div className="text-[var(--txt)] font-medium mb-2">Client SDK</div>
        <ul className="text-sm text-[var(--txt-secondary)] space-y-1">
          <li>auth initialized: {auth ? "yes" : "no"}</li>
          <li>db initialized: {db ? "yes" : "no"}</li>
        </ul>
      </div>

      <div className="rounded-lg border border-white/10 p-4 bg-white/[0.03]">
        <div className="text-[var(--txt)] font-medium mb-2">Auth</div>
        {user ? (
          <div className="space-y-2 text-sm text-[var(--txt-secondary)]">
            <div>uid: <span className="text-[var(--txt)]">{user.uid}</span></div>
            <div>email: <span className="text-[var(--txt)]">{user.email ?? "(none)"}</span></div>
            <button onClick={() => signOut()} className="px-3 py-1 rounded-md border border-white/10 hover:border-white/20">Sign out</button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <button onClick={() => openModal("signin")} className="px-3 py-1 rounded-md border border-white/10 hover:border-white/20">Open sign-in modal</button>
            <button onClick={() => signInWithGoogle()} className="px-3 py-1 rounded-md border border-white/10 hover:border-white/20">Continue with Google</button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-white/10 p-4 bg-white/[0.03]">
        <div className="text-[var(--txt)] font-medium mb-2">Subscription</div>
        {user ? (
          <div className="text-sm text-[var(--txt-secondary)]">
            Status: {subStatus === "loading" ? "loading…" : subStatus === null ? "(error or no access)" : subStatus ? "active" : "none"}
          </div>
        ) : (
          <div className="text-sm text-[var(--txt-secondary)]">Sign in to check subscription doc at subscriptions/&lt;uid&gt;</div>
        )}
      </div>
    </div>
  );
}
