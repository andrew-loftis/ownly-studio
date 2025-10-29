"use client";

import { useAuthStore } from "@/lib/authStore";

export default function ClientDashboard() {
  const user = useAuthStore((s) => s.user);
  const openModal = useAuthStore((s) => s.openModal);

  if (!user) {
    openModal("signin");
    return null;
  }

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--txt)]">Your Dashboard</h1>
      <p className="text-[var(--muted)] text-sm">
        Welcome! Your projects and deliverables will appear here as your admin assigns them to you.
      </p>
    </div>
  );
}
