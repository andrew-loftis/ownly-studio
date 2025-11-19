"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Container from "@/components/Container";
import Button from "@/components/ui/Button";
import { SubscriptionCard, InvoiceList, PaymentTracking } from "@/components/premium";
import ActivityTimeline from "@/components/premium/ActivityTimeline";
import type { Organization, Project } from "@/lib/types/admin";

interface ExtendedOrganization extends Omit<Organization, 'subscription'> {
  subscription?: {
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    status: "active" | "inactive" | "pending" | "canceled" | "past_due" | "unpaid" | "trialing" | "paused";
    plan: "starter" | "professional" | "enterprise";
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: Date | null;
    trialStart?: Date | null;
    trialEnd?: Date | null;
    priceId?: string;
    quantity?: number;
    planName?: string;
    monthlyPrice?: number;
    features?: string[];
  };
}

export default function OrganizationDetailPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  
  const [organization, setOrganization] = useState<ExtendedOrganization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "billing">("overview");

  useEffect(() => {
    if (orgId) {
      fetchOrganizationData();
    }
  }, [orgId]);

  const fetchOrganizationData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch organization details
      const orgResponse = await fetch(`/api/admin/organizations/${orgId}`, {
        headers: {
          "Authorization": `Bearer ${await getIdToken()}`,
        },
      });

      if (!orgResponse.ok) {
        throw new Error("Failed to fetch organization");
      }

      const orgData = await orgResponse.json();
      setOrganization(orgData);

      // Fetch projects for this organization
      const projectsResponse = await fetch(`/api/admin/projects?orgId=${orgId}`, {
        headers: {
          "Authorization": `Bearer ${await getIdToken()}`,
        },
      });

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getIdToken = async () => {
    // Implementation depends on your auth store
    return "";
  };

  if (loading) {
    return (
      <Container className="py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="h-64 bg-white/10 rounded"></div>
        </div>
      </Container>
    );
  }

  if (error || !organization) {
    return (
      <Container className="py-8">
        <div className="glass-strong rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--txt-primary)] mb-4">
            Organization Not Found
          </h1>
          <p className="text-[var(--txt-secondary)] mb-6">
            {error || "The requested organization could not be found."}
          </p>
          <Button variant="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--txt-primary)] mb-2">
            {organization.name}
          </h1>
          <div className="flex items-center gap-4 text-sm text-[var(--txt-secondary)]">
            <span>Created {new Date(organization.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{projects.length} project{projects.length !== 1 ? "s" : ""}</span>
            <span>•</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              organization.subscription?.status === "active" 
                ? "bg-green-500/10 text-green-400" 
                : "bg-gray-500/10 text-gray-400"
            }`}>
              {organization.subscription?.status || "No subscription"}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm">
            Edit Organization
          </Button>
          <Button variant="primary" size="sm">
            Create Project
          </Button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="glass-strong rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-[var(--txt-primary)] mb-4">
          Contact Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-[var(--txt-secondary)] mb-2">
              Primary Contact
            </h3>
            <p className="text-[var(--txt-primary)]">{organization.primaryContact?.name || "Not set"}</p>
            <p className="text-[var(--txt-secondary)]">{organization.primaryContact?.email || "Not set"}</p>
            {organization.primaryContact?.phone && (
              <p className="text-[var(--txt-secondary)]">{organization.primaryContact.phone}</p>
            )}
          </div>
          {organization.billingContact && (
            <div>
              <h3 className="text-sm font-medium text-[var(--txt-secondary)] mb-2">
                Billing Contact
              </h3>
              <p className="text-[var(--txt-primary)]">{organization.billingContact.name}</p>
              <p className="text-[var(--txt-secondary)]">{organization.billingContact.email}</p>
              {organization.billingContact.phone && (
                <p className="text-[var(--txt-secondary)]">{organization.billingContact.phone}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-8">
        {["overview", "projects", "billing"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-[var(--bg-3)] text-[var(--txt-primary)]"
                : "text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] hover:bg-[var(--bg-4)]"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="glass-strong rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-[var(--txt-primary)] mb-4">
              Recent Activity
            </h3>
            <ActivityTimeline 
              activities={[
                {
                  id: "1",
                  title: "Project Created",
                  description: "New website project created",
                  timestamp: new Date(),
                  type: "build_started",
                  metadata: { projectId: "1" }
                },
                {
                  id: "2", 
                  title: "Invoice Generated",
                  description: "Invoice #001 for $2,500",
                  timestamp: new Date(),
                  type: "payment_processed",
                  metadata: { amount: 2500 }
                }
              ]}
            />
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[var(--txt-primary)] mb-4">
                Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--txt-primary)]">
                    {projects.length}
                  </div>
                  <div className="text-sm text-[var(--txt-secondary)]">
                    Total Projects
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--txt-primary)]">
                    {projects.filter(p => p.status === "development").length}
                  </div>
                  <div className="text-sm text-[var(--txt-secondary)]">
                    Active Projects
                  </div>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[var(--txt-primary)] mb-4">
                Team Access
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-[var(--txt-secondary)]">Admins:</span>
                  <span className="ml-2 text-[var(--txt-primary)]">
                    {organization.adminUids?.length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-[var(--txt-secondary)]">Editors:</span>
                  <span className="ml-2 text-[var(--txt-primary)]">
                    {organization.editorUids?.length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-[var(--txt-secondary)]">Clients:</span>
                  <span className="ml-2 text-[var(--txt-primary)]">
                    {organization.clientUids?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "projects" && (
        <div className="space-y-6">
          {projects.length === 0 ? (
            <div className="glass-strong rounded-2xl p-8 text-center">
              <h3 className="text-xl font-semibold text-[var(--txt-primary)] mb-2">
                No Projects Yet
              </h3>
              <p className="text-[var(--txt-secondary)] mb-6">
                Create your first project to get started.
              </p>
              <Button variant="primary">
                Create Project
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {projects.map((project) => (
                <div key={project.id} className="glass-strong rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--txt-primary)]">
                        {project.name}
                      </h3>
                      <p className="text-[var(--txt-secondary)] mt-1">
                        {project.description}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === "development" ? "bg-green-500/10 text-green-400" :
                      project.status === "completed" ? "bg-blue-500/10 text-blue-400" :
                      project.status === "on-hold" ? "bg-yellow-500/10 text-yellow-400" :
                      "bg-gray-500/10 text-gray-400"
                    }`}>
                      {project.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-[var(--txt-secondary)]">
                    <span>Start: {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not set"}</span>
                    {project.dueDate && (
                      <>
                        <span> • </span>
                        <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>${project.budget?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "billing" && (
        <div className="space-y-8">
          {/* Subscription and Invoices Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Subscription */}
            <SubscriptionCard
              orgId={orgId}
              subscription={organization.subscription}
              onSubscriptionUpdate={fetchOrganizationData}
            />

            {/* Payment Tracking */}
            <PaymentTracking orgId={orgId} />
          </div>

          {/* Invoices */}
          <InvoiceList orgId={orgId} />
        </div>
      )}
    </Container>
  );
}