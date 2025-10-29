"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import { getAdminOrgs } from "@/lib/roles";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const openModal = useAuthStore((s) => s.openModal);
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!user) {
        openModal("signin");
        return;
      }
      const list = await getAdminOrgs(user.uid);
      setOrgs(list);
    };
    run();
  }, [user]);

  const createOrg = async () => {
    if (!db || !user) return;
    setCreating(true);
    try {
      const ref = await addDoc(collection(db, "orgs"), {
        name: "New Organization",
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        adminUids: [user.uid],
      });
      setOrgs((prev) => [{ id: ref.id, name: "New Organization" }, ...prev]);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--txt)]">Admin</h1>
      <div className="flex gap-3">
        <button
          className="px-3 py-2 rounded-md border border-white/10 hover:border-white/20"
          onClick={createOrg}
          disabled={creating}
        >
          {creating ? "Creating…" : "Create organization"}
        </button>
      </div>
      <div className="space-y-2">
        <div className="text-[var(--txt)] font-medium">Your organizations</div>
        {orgs.length === 0 ? (
          <div className="text-sm text-[var(--muted)]">None yet. Create your first org.</div>
        ) : (
          <ul className="divide-y divide-white/10 rounded-md border border-white/10">
            {orgs.map((o) => (
              <li key={o.id} className="p-3 flex items-center justify-between">
                <div className="text-[var(--txt)]">{o.name}</div>
                <div className="text-xs text-[var(--muted)]">{o.id}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
