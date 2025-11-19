"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import Container from "@/components/Container";
import Button from "@/components/ui/Button";
import ClientMessaging from "@/components/premium/ClientMessaging";
import ClientFileManager from "@/components/premium/ClientFileManager";
import { fetchJsonWithAuth } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "planning" | "development" | "review" | "completed" | "on-hold";
  progress: number;
  dueDate?: Date;
  deliverables: Array<{
    id: string;
    name: string;
    status: "pending" | "completed" | "approved";
    fileUrl?: string;
  }>;
  lastUpdate: Date;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: Date;
  items: Array<{
    description: string;
    amount: number;
  }>;
}

interface Organization {
  id: string;
  name: string;
  subscription?: {
    status: string;
    plan: string;
    currentPeriodEnd?: Date;
  };
}

export default function ClientOrganizationPage() {
  const { orgId } = useParams();
  const { user } = useAuthStore();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<"projects" | "invoices" | "files" | "messages">("projects");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && orgId) {
      fetchOrganizationData();
    }
  }, [user, orgId]);

  const fetchOrganizationData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [orgData, projectsData, invoicesData] = await Promise.all([
        fetchJsonWithAuth<Organization>(`/api/client/organizations/${orgId}`),
        fetchJsonWithAuth<Project[]>(`/api/client/organizations/${orgId}/projects`).catch(() => []),
        fetchJsonWithAuth<Invoice[]>(`/api/client/organizations/${orgId}/invoices`).catch(() => []),
      ]);

      setOrganization(orgData);
      setProjects(projectsData);
      setInvoices(invoicesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
      case "approved":
        return "text-green-400 bg-green-500/10";
      case "development":
      case "review":
      case "sent":
        return "text-blue-400 bg-blue-500/10";
      case "planning":
      case "pending":
      case "draft":
        return "text-yellow-400 bg-yellow-500/10";
      case "on-hold":
      case "overdue":
        return "text-red-400 bg-red-500/10";
      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (!user) {
    return (
      <Container className="py-8">
        <div className="glass-strong rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-[var(--txt-primary)] mb-4">
            Access Denied
          </h1>
          <p className="text-[var(--txt-secondary)] mb-6">
            Please sign in to access this organization.
          </p>
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
          <div className="h-64 bg-white/10 rounded-xl"></div>
        </div>
      </Container>
    );
  }

  if (error || !organization) {
    return (
      <Container className="py-8">
        <div className="glass-strong rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-[var(--txt-primary)] mb-4">
            Organization Not Found
          </h1>
          <p className="text-[var(--txt-secondary)] mb-6">
            {error || "This organization doesn't exist or you don't have access to it."}
          </p>
          <Button variant="primary" onClick={() => window.location.href = "/account/client"}>
            Back to Portal
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--txt-primary)] mb-2">
              {organization.name}
            </h1>
            <p className="text-[var(--txt-secondary)]">
              Client Dashboard
            </p>
          </div>
          {organization.subscription && (
            <div className="glass-strong rounded-xl p-4 text-center">
              <div className={`px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                organization.subscription.status === "active" 
                  ? "text-green-400 bg-green-500/10" 
                  : "text-gray-400 bg-gray-500/10"
              }`}>
                {organization.subscription.plan} Plan
              </div>
              {organization.subscription.currentPeriodEnd && (
                <div className="text-xs text-[var(--txt-tertiary)]">
                  Until {new Date(organization.subscription.currentPeriodEnd).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass-strong rounded-2xl p-1 mb-8 inline-flex">
        {[
          { id: "projects", label: "Projects", count: projects.length },
          { id: "invoices", label: "Invoices", count: invoices.length },
          { id: "files", label: "Files", count: 0 },
          { id: "messages", label: "Messages", count: 0 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white/10 text-[var(--txt-primary)]"
                : "text-[var(--txt-secondary)] hover:text-[var(--txt-primary)]"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          {projects.length === 0 ? (
            <div className="glass-strong rounded-2xl p-8 text-center">
              <h3 className="text-xl font-semibold text-[var(--txt-primary)] mb-4">
                No Projects Yet
              </h3>
              <p className="text-[var(--txt-secondary)]">
                Your projects will appear here once they are assigned to you.
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="glass-strong rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-[var(--txt-primary)] mb-2">
                      {project.name}
                    </h3>
                    <p className="text-[var(--txt-secondary)] mb-3">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                      {project.dueDate && (
                        <span className="text-sm text-[var(--txt-tertiary)]">
                          Due: {new Date(project.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[var(--txt-primary)] mb-1">
                      {project.progress}%
                    </div>
                    <div className="text-sm text-[var(--txt-secondary)]">
                      Complete
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>

                {/* Deliverables */}
                {project.deliverables.length > 0 && (
                  <div>
                    <h4 className="font-medium text-[var(--txt-primary)] mb-3">
                      Deliverables
                    </h4>
                    <div className="space-y-2">
                      {project.deliverables.map((deliverable) => (
                        <div key={deliverable.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${
                              deliverable.status === "completed" || deliverable.status === "approved"
                                ? "bg-green-500"
                                : "bg-yellow-500"
                            }`} />
                            <span className="text-[var(--txt-primary)]">
                              {deliverable.name}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deliverable.status)}`}>
                              {deliverable.status}
                            </span>
                          </div>
                          {deliverable.fileUrl && (
                            <Button variant="ghost" size="sm">
                              Download
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 text-sm text-[var(--txt-tertiary)]">
                  Last updated: {new Date(project.lastUpdate).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "invoices" && (
        <div className="space-y-6">
          {invoices.length === 0 ? (
            <div className="glass-strong rounded-2xl p-8 text-center">
              <h3 className="text-xl font-semibold text-[var(--txt-primary)] mb-4">
                No Invoices
              </h3>
              <p className="text-[var(--txt-secondary)]">
                Your invoices will appear here once they are generated.
              </p>
            </div>
          ) : (
            invoices.map((invoice) => (
              <div key={invoice.id} className="glass-strong rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--txt-primary)] mb-2">
                      Invoice #{invoice.invoiceNumber}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                      <span className="text-sm text-[var(--txt-tertiary)]">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[var(--txt-primary)]">
                      {formatCurrency(invoice.amount)}
                    </div>
                  </div>
                </div>

                {/* Invoice Items */}
                <div className="space-y-2 mb-4">
                  {invoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-[var(--txt-secondary)]">{item.description}</span>
                      <span className="text-[var(--txt-primary)]">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="primary" size="sm">
                    View Invoice
                  </Button>
                  {invoice.status !== "paid" && (
                    <Button variant="ghost" size="sm">
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "files" && (
        <ClientFileManager organizationId={orgId as string} />
      )}

      {activeTab === "messages" && (
        <div className="space-y-6">
          <div className="glass-strong rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-[var(--txt-primary)] mb-4">
              Project Communication
            </h3>
            <p className="text-[var(--txt-secondary)] mb-6">
              Stay in touch with your project team. Messages are organized by project and organization.
            </p>
            <ClientMessaging organizationId={orgId as string} />
          </div>
        </div>
      )}
    </Container>
  );
}