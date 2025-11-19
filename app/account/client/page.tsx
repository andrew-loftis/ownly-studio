"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/authStore";
import Container from "@/components/Container";
import Button from "@/components/ui/Button";
import { fetchJsonWithAuth } from "@/lib/utils";

interface ClientOrganization {
  id: string;
  name: string;
  primaryContact: {
    name: string;
    email: string;
  };
  subscription?: {
    status: string;
    currentPeriodEnd?: Date;
  };
  projectCount: number;
  outstandingInvoices: number;
}

export default function ClientPortalPage() {
  const { user, openModal } = useAuthStore();
  const [organizations, setOrganizations] = useState<ClientOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchClientOrganizations();
    }
  }, [user]);

  const fetchClientOrganizations = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchJsonWithAuth<ClientOrganization[]>("/api/client/organizations");
      setOrganizations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container className="py-8">
        <div className="glass-strong rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-[var(--txt-primary)] mb-4">
            Client Portal Access
          </h1>
          <p className="text-[var(--txt-secondary)] mb-6">
            Please sign in to access your client portal.
          </p>
          <Button variant="primary" onClick={() => openModal("signin")}>
            Sign In
          </Button>
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-white/10 rounded-xl"></div>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-8">
        <div className="glass-strong rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-[var(--txt-primary)] mb-4">
            Access Error
          </h1>
          <p className="text-[var(--txt-secondary)] mb-6">
            {error}
          </p>
          <Button variant="primary" onClick={fetchClientOrganizations}>
            Try Again
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--txt-primary)] mb-2">
          Welcome, {user.displayName || user.email}
        </h1>
        <p className="text-[var(--txt-secondary)]">
          Access your projects, invoices, and account information.
        </p>
      </div>

      {/* Organizations */}
      {organizations.length === 0 ? (
        <div className="glass-strong rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold text-[var(--txt-primary)] mb-4">
            No Organizations Found
          </h2>
          <p className="text-[var(--txt-secondary)] mb-6">
            You don't have access to any organizations yet. Contact your project manager to get access.
          </p>
          <Button variant="ghost">
            Contact Support
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <div key={org.id} className="glass-strong rounded-2xl p-6 hover:bg-[var(--bg-3)] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--txt-primary)]">
                    {org.name}
                  </h3>
                  <p className="text-sm text-[var(--txt-secondary)]">
                    {org.primaryContact.name}
                  </p>
                </div>
                {org.subscription && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    org.subscription.status === "active" 
                      ? "text-green-400 bg-green-500/10" 
                      : "text-gray-400 bg-gray-500/10"
                  }`}>
                    {org.subscription.status}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--txt-secondary)]">Active Projects:</span>
                  <span className="text-[var(--txt-primary)] font-medium">{org.projectCount}</span>
                </div>
                
                {org.outstandingInvoices > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--txt-secondary)]">Outstanding Invoices:</span>
                    <span className="text-yellow-400 font-medium">{org.outstandingInvoices}</span>
                  </div>
                )}

                {org.subscription?.currentPeriodEnd && (
                  <div className="text-xs text-[var(--txt-tertiary)]">
                    Subscription until {new Date(org.subscription.currentPeriodEnd).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.location.href = `/account/client/${org.id}`}
                >
                  View Dashboard
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-strong rounded-2xl p-6 text-center">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-2">
            Recent Invoices
          </h3>
          <p className="text-sm text-[var(--txt-secondary)] mb-4">
            View and pay outstanding invoices
          </p>
          <Button variant="ghost" size="sm">
            View All Invoices
          </Button>
        </div>

        <div className="glass-strong rounded-2xl p-6 text-center">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M7 8H5a2 2 0 00-2 2v8a2 2 0 002 2h2M7 8h10M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-2">
            Project Updates
          </h3>
          <p className="text-sm text-[var(--txt-secondary)] mb-4">
            Latest progress on your projects
          </p>
          <Button variant="ghost" size="sm">
            View Projects
          </Button>
        </div>

        <div className="glass-strong rounded-2xl p-6 text-center">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-2">
            Support
          </h3>
          <p className="text-sm text-[var(--txt-secondary)] mb-4">
            Get help with your projects
          </p>
          <Button variant="ghost" size="sm">
            Contact Support
          </Button>
        </div>
      </div>
    </Container>
  );
}
