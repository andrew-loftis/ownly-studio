"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import { getAdminOrgs } from "@/lib/roles";
import { createOrganization, getOrgStats } from "@/lib/api/organizations";
import type { Organization } from "@/lib/types/backend";
import { serverTimestamp } from "firebase/firestore";

interface OrgWithStats extends Organization {
  stats?: {
    projectCounts: { total: number; active: number; completed: number; };
    revenueTotal: number;
    teamMemberCount: number;
  };
}

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const openModal = useAuthStore((s) => s.openModal);
  const [orgs, setOrgs] = useState<OrgWithStats[]>([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrgs = async () => {
      if (!user) {
        openModal("signin");
        return;
      }
      
      try {
        setLoading(true);
        const orgList = await getAdminOrgs(user.uid);
        
        // Load stats for each org
        const orgsWithStats: OrgWithStats[] = await Promise.all(
          orgList.map(async (org) => {
            try {
              const stats = await getOrgStats(org.id);
              return {
                id: org.id,
                name: org.name,
                stats
              } as OrgWithStats;
            } catch {
              return {
                id: org.id,
                name: org.name
              } as OrgWithStats;
            }
          })
        );
        
        setOrgs(orgsWithStats);
      } catch (error) {
        console.error("Failed to load organizations:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrgs();
  }, [user, openModal]);

  const handleCreateOrg = async () => {
    if (!user) return;
    
    setCreating(true);
    try {
      const orgId = await createOrganization({
        name: "New Organization",
        slug: `org-${Date.now()}`,
        description: "",
        primaryContact: {
          name: user.displayName || user.email?.split('@')[0] || 'Unknown',
          email: user.email || ''
        },
        adminUids: [user.uid],
        editorUids: [],
        clientUids: [],
        subscription: {
          plan: 'starter',
          active: false,
          features: [],
          billingEmail: user.email || '',
          setupTotal: 0,
          monthlyTotal: 0,
          setupPaid: false,
          startDate: serverTimestamp() as any
        },
        settings: {
          timezone: 'America/New_York',
          currency: 'USD',
          allowClientUploads: true,
          enableNotifications: true
        },
        status: 'active',
        createdBy: user.uid
      });
      
      // Add to local state
      setOrgs(prev => [{
        id: orgId,
        name: "New Organization",
        stats: {
          projectCounts: { total: 0, active: 0, completed: 0 },
          revenueTotal: 0,
          teamMemberCount: 1
        }
      } as OrgWithStats, ...prev]);
      
    } catch (error) {
      console.error("Failed to create organization:", error);
      alert("Failed to create organization. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-[var(--txt-secondary)]">Loading organizations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--txt-primary)]">Admin Dashboard</h1>
          <p className="text-[var(--txt-secondary)] mt-2">Manage your organizations and projects</p>
        </div>
        <button
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] text-black font-semibold hover:scale-[1.02] hover:-translate-y-0.5 transition-all disabled:opacity-50"
          onClick={handleCreateOrg}
          disabled={creating}
        >
          {creating ? "Creating..." : "Create Organization"}
        </button>
      </div>

      {/* Statistics Overview */}
      {orgs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-strong rounded-2xl p-6">
            <div className="text-2xl font-bold text-[var(--txt-primary)]">
              {orgs.reduce((sum, org) => sum + (org.stats?.projectCounts.total || 0), 0)}
            </div>
            <div className="text-sm text-[var(--txt-secondary)]">Total Projects</div>
          </div>
          <div className="glass-strong rounded-2xl p-6">
            <div className="text-2xl font-bold text-[var(--txt-primary)]">
              {orgs.reduce((sum, org) => sum + (org.stats?.projectCounts.active || 0), 0)}
            </div>
            <div className="text-sm text-[var(--txt-secondary)]">Active Projects</div>
          </div>
          <div className="glass-strong rounded-2xl p-6">
            <div className="text-2xl font-bold text-[var(--txt-primary)]">
              ${orgs.reduce((sum, org) => sum + (org.stats?.revenueTotal || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-[var(--txt-secondary)]">Total Revenue</div>
          </div>
          <div className="glass-strong rounded-2xl p-6">
            <div className="text-2xl font-bold text-[var(--txt-primary)]">{orgs.length}</div>
            <div className="text-sm text-[var(--txt-secondary)]">Organizations</div>
          </div>
        </div>
      )}

      {/* Organizations List */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-[var(--txt-primary)]">Your Organizations</h2>
        
        {orgs.length === 0 ? (
          <div className="glass-strong rounded-2xl p-8 text-center">
            <div className="text-[var(--txt-secondary)] mb-4">No organizations yet</div>
            <p className="text-sm text-[var(--txt-tertiary)] mb-6">
              Create your first organization to start managing projects and clients.
            </p>
            <button
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] text-black font-semibold hover:scale-[1.02] hover:-translate-y-0.5 transition-all disabled:opacity-50"
              onClick={handleCreateOrg}
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Your First Organization"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orgs.map((org) => (
              <div key={org.id} className="glass-strong rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[var(--txt-primary)]">{org.name}</h3>
                  <div className="text-xs text-[var(--txt-tertiary)] font-mono">{org.id}</div>
                </div>
                
                {org.stats && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-[var(--txt-primary)]">
                        {org.stats.projectCounts.total}
                      </div>
                      <div className="text-xs text-[var(--txt-secondary)]">Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-[var(--mint)]">
                        {org.stats.projectCounts.active}
                      </div>
                      <div className="text-xs text-[var(--txt-secondary)]">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-[var(--txt-primary)]">
                        ${org.stats.revenueTotal.toLocaleString()}
                      </div>
                      <div className="text-xs text-[var(--txt-secondary)]">Revenue</div>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 px-3 py-2 rounded-lg border border-white/10 text-sm text-[var(--txt-secondary)] hover:border-white/20 hover:text-[var(--txt-primary)] transition-colors">
                    Manage
                  </button>
                  <button className="flex-1 px-3 py-2 rounded-lg border border-white/10 text-sm text-[var(--txt-secondary)] hover:border-white/20 hover:text-[var(--txt-primary)] transition-colors">
                    Projects
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
