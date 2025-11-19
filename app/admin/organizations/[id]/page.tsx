'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getCountFromServer } from 'firebase/firestore';

interface OrgDoc {
  id: string;
  name: string;
  plan?: string;
  subscription?: { plan?: string; active?: boolean };
  billing?: { email?: string };
  adminUids?: string[];
  editorUids?: string[];
  clientUids?: string[];
}

export default function OrganizationDetailPage() {
  const params = useParams<{ id: string }>();
  const orgId = params?.id as string;
  const [org, setOrg] = useState<OrgDoc | null>(null);
  const [counts, setCounts] = useState<{ projects: number; invoices: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!db || !orgId) return;
      setLoading(true);
      try {
        const ref = doc(db, 'orgs', orgId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setOrg({ id: snap.id, ...(snap.data() as any) });
        }
        const [projCount, invCount] = await Promise.all([
          getCountFromServer(collection(db, 'orgs', orgId, 'projects')),
          getCountFromServer(collection(db, 'orgs', orgId, 'invoices')),
        ]);
        setCounts({ projects: projCount.data().count, invoices: invCount.data().count });
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [orgId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-[var(--bg-4)] rounded animate-pulse" />
        <div className="h-32 bg-[var(--bg-4)] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="glass-light rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-[var(--txt-primary)] mb-2">Organization not found</h2>
        <p className="text-[var(--txt-secondary)]">The organization you are looking for does not exist or you don't have access.</p>
        <div className="mt-4">
          <Link href="/admin/organizations" className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg">
            Back to Organizations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--txt-primary)]">{org.name || org.id}</h1>
          <p className="text-[var(--txt-tertiary)] mt-1">ID: {org.id}</p>
        </div>
        <Link href="/admin/organizations" className="px-3 py-2 text-sm rounded bg-[var(--bg-3)] text-[var(--txt-secondary)] hover:text-[var(--txt-primary)]">
          All Organizations
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-light rounded-2xl p-6">
          <div className="text-xs text-[var(--txt-tertiary)]">Plan</div>
          <div className="text-lg font-semibold text-[var(--txt-primary)] mt-1">{org.subscription?.plan || org.plan || 'starter'}</div>
          <div className="text-xs mt-2">
            <span className={`px-2 py-1 rounded-full ${org.subscription?.active ?? true ? 'bg-green-500/15 text-green-300' : 'bg-amber-500/15 text-amber-300'}`}>
              {org.subscription?.active ?? true ? 'Active' : 'Paused'}
            </span>
          </div>
        </div>

        <div className="glass-light rounded-2xl p-6">
          <div className="text-xs text-[var(--txt-tertiary)]">Billing Email</div>
          <div className="text-lg font-semibold text-[var(--txt-primary)] mt-1">{org.billing?.email || '—'}</div>
        </div>

        <div className="glass-light rounded-2xl p-6">
          <div className="text-xs text-[var(--txt-tertiary)]">Team</div>
          <div className="text-lg font-semibold text-[var(--txt-primary)] mt-1">Admins {org.adminUids?.length || 0} • Editors {org.editorUids?.length || 0} • Clients {org.clientUids?.length || 0}</div>
        </div>
      </div>

      {counts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-light rounded-2xl p-6">
            <div className="text-xs text-[var(--txt-tertiary)]">Projects</div>
            <div className="text-2xl font-bold text-[var(--txt-primary)] mt-1">{counts.projects}</div>
            <Link href={`/admin/projects?org=${org.id}`} className="mt-3 inline-block text-[var(--accent)] hover:underline">View projects →</Link>
          </div>

          <div className="glass-light rounded-2xl p-6">
            <div className="text-xs text-[var(--txt-tertiary)]">Invoices</div>
            <div className="text-2xl font-bold text-[var(--txt-primary)] mt-1">{counts.invoices}</div>
            <Link href={`/admin/billing/invoices?org=${org.id}`} className="mt-3 inline-block text-[var(--accent)] hover:underline">View invoices →</Link>
          </div>
        </div>
      )}
    </div>
  );
}
