'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/authStore';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

interface OrgDoc {
  id: string;
  name: string;
  plan?: string;
  subscription?: { plan?: string; active?: boolean };
  billing?: { email?: string };
  adminUids?: string[];
  editorUids?: string[];
  clientUids?: string[];
  createdAt?: any;
}

const OrganizationsManagement = () => {
  const { user } = useAuthStore();
  const [orgs, setOrgs] = useState<OrgDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    void fetchOrgs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const fetchOrgs = async () => {
    if (!db || !user) return;
    setLoading(true);
    setError(null);

    try {
      // First try: list all orgs (allowed by rules for site staff)
      const snap = await getDocs(collection(db, 'orgs'));
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as OrgDoc[];
      // Sort by createdAt desc if present, else by name
      rows.sort((a, b) => {
        const ad = a.createdAt?.toDate?.() || (a.createdAt ? new Date(a.createdAt) : null);
        const bd = b.createdAt?.toDate?.() || (b.createdAt ? new Date(b.createdAt) : null);
        if (ad && bd) return bd.getTime() - ad.getTime();
        if (a.name && b.name) return a.name.localeCompare(b.name);
        return 0;
      });
      setOrgs(rows);
    } catch (e: any) {
      // Fallback: only orgs where the user is an admin
      try {
        const q = query(collection(db, 'orgs'), where('adminUids', 'array-contains', user.uid));
        const snap = await getDocs(q);
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as OrgDoc[];
        setOrgs(rows);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching orgs', err);
        setError('Unable to load organizations. Please check your access.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orgs;
    return orgs.filter((o) =>
      [o.name, o.plan, o.subscription?.plan, o.billing?.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [orgs, search]);

  const onQuickSave = async (
    id: string,
    updates: Partial<Pick<OrgDoc, 'plan'>> & {
      subscription?: { plan?: string; active?: boolean };
      billing?: { email?: string };
    }
  ) => {
    if (!db) return;
    setSavingId(id);
    setError(null);
    try {
      const ref = doc(db, 'orgs', id);
      await updateDoc(ref, updates as any);
      setOrgs((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
    } catch (e) {
      setError('Save failed. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  if (!user) {
    return (
      <div className="glass-light rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-[var(--txt-primary)] mb-2">Sign in required</h2>
        <p className="text-[var(--txt-secondary)]">Please sign in to manage organizations.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-[var(--bg-4)] rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-[var(--bg-4)] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--txt-primary)]">Organizations</h1>
          <p className="text-[var(--txt-secondary)] mt-1">Manage org details, plans, and billing preferences</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/organizations/create"
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors"
          >
            Add Organization
          </Link>
        </div>
      </div>

      {/* Tools */}
      <div className="glass-light rounded-2xl p-6 flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orgs by name, plan, or billing email..."
          className="flex-1 px-4 py-2 bg-[var(--bg-3)] border border-[var(--bg-4)] rounded-lg text-[var(--txt-primary)] placeholder-[var(--txt-tertiary)] focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      {error && (
        <div className="glass-strong rounded-2xl p-4 text-amber-300">
          {error}
        </div>
      )}

      {/* List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filtered.length === 0 ? (
          <div className="glass-light rounded-2xl p-8 text-center text-[var(--txt-tertiary)]">
            No organizations found
          </div>
        ) : (
          filtered.map((org) => {
            const plan = org.subscription?.plan || org.plan || 'starter';
            const active = org.subscription?.active ?? true;
            const billingEmail = org.billing?.email || '';
            return (
              <div key={org.id} className="glass-light rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-[var(--txt-primary)]">{org.name || org.id}</div>
                    <div className="text-sm text-[var(--txt-tertiary)] mt-0.5">ID: {org.id}</div>
                  </div>
                  <Link
                    href={`/admin/organizations/${org.id}`}
                    className="px-3 py-1.5 text-xs rounded bg-[var(--bg-3)] text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] transition-colors"
                  >
                    Open
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div>
                    <div className="text-xs text-[var(--txt-tertiary)] mb-1">Plan</div>
                    <select
                      defaultValue={plan}
                      onChange={(e) => onQuickSave(org.id, { subscription: { ...org.subscription, plan: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-3)] border border-[var(--bg-4)] text-[var(--txt-primary)]"
                    >
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <div className="text-xs text-[var(--txt-tertiary)] mb-1">Billing Email</div>
                    <div className="flex gap-2">
                      <input
                        defaultValue={billingEmail}
                        onBlur={(e) => e.target.value !== billingEmail && onQuickSave(org.id, { billing: { email: e.target.value } })}
                        placeholder="billing@company.com"
                        className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-3)] border border-[var(--bg-4)] text-[var(--txt-primary)]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-[var(--txt-tertiary)] mb-1">Subscription</div>
                    <button
                      onClick={() => onQuickSave(org.id, { subscription: { ...org.subscription, active: !active } })}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                        active ? 'bg-green-500/15 text-green-300 hover:bg-green-500/25' : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                      }`}
                    >
                      {active ? 'Active' : 'Paused'}
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-xs text-[var(--txt-tertiary)]">
                  Admins: {org.adminUids?.length || 0} • Editors: {org.editorUids?.length || 0} • Clients: {org.clientUids?.length || 0}
                </div>

                {savingId === org.id && (
                  <div className="mt-3 text-xs text-[var(--txt-secondary)]">Saving changes…</div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrganizationsManagement;
