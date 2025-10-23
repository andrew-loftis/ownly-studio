"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import Button from "@/components/ui/Button";
// Avoid using next/navigation's useSearchParams to prevent CSR bailout warnings during build.
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function AccountClient() {
  const { user, openModal } = useAuthStore();
  const [lastConfig, setLastConfig] = useState<any>(null);
  const [subActive, setSubActive] = useState<boolean | null>(null);
  const [thankYou, setThankYou] = useState(false);

  useEffect(() => {
    if (!user) openModal("signin");
  }, [user, openModal]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("lastConfiguration");
        if (raw) setLastConfig(JSON.parse(raw));
      } catch {}
    }
  }, []);

  // Detect checkout success param using window.location (safe in client-only component)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const status = params.get("checkout");
    if (status === "success") setThankYou(true);
  }, []);

  // Load subscription status from Firestore
  useEffect(() => {
    const load = async () => {
      if (!user || !db) return;
      try {
        const ref = doc(db, "subscriptions", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as any;
          setSubActive(Boolean(data.subscriptionActive));
        } else {
          setSubActive(false);
        }
      } catch {
        setSubActive(null);
      }
    };
    load();
  }, [user]);

  if (!user) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center text-[var(--muted)]">Sign in to view your account.</div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {thankYou && (
          <section className="glass-strong rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-[var(--txt)] mb-1">Thank you — you’re all set</h2>
            <p className="text-[var(--muted)]">We’ve activated your subscription and recorded your setup. You’ll receive a confirmation email shortly.</p>
          </section>
        )}
        <section className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-[var(--txt)]">Subscription</h2>
          <p className="text-[var(--muted)]">Status: {subActive === null ? "Loading…" : subActive ? "Active" : "Inactive"}</p>
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-[var(--txt)] mb-2">Last configuration</h2>
          {lastConfig ? (
            <pre className="text-xs text-[var(--muted)] bg-black/30 p-4 rounded border border-white/10 overflow-auto">
{JSON.stringify(lastConfig, null, 2)}
            </pre>
          ) : (
            <p className="text-[var(--muted)]">No configuration saved yet.</p>
          )}
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-[var(--txt)] mb-4">Billing</h2>
          <Button variant="ghost">Manage billing</Button>
        </section>
      </div>
    </main>
  );
}
