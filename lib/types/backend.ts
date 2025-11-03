import type { FeatureKey } from "../pricing";

// Use FirebaseFirestore.Timestamp for compatibility
type Timestamp = any; // Will be FirebaseFirestore.Timestamp in practice

// Base interfaces
export interface BaseEntity {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User roles within organizations
export type OrgRole = 'admin' | 'editor' | 'client';

// Project status types
export type ProjectStatus = 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold' | 'cancelled';

// Subscription plans
export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise';

// Organization structure - enhanced multi-tenant model
export interface Organization extends BaseEntity {
  name: string;
  slug: string; // URL-friendly identifier
  description?: string;
  logo?: string;
  website?: string;
  
  // Contact information
  primaryContact: {
    name: string;
    email: string;
    phone?: string;
  };
  
  // Role-based access control
  adminUids: string[];    // Full admin access (Owen + any client admins)
  editorUids: string[];   // Staff members who can edit projects
  clientUids: string[];   // Client users who can view assigned projects
  
  // Subscription and billing
  subscription: {
    plan: SubscriptionPlan;
    active: boolean;
    features: FeatureKey[];
    
    // Stripe integration
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    billingEmail: string;
    
    // Pricing
    setupTotal: number;
    monthlyTotal: number;
    setupPaid: boolean;
    
    // Dates
    startDate: Timestamp;
    nextBillingDate?: Timestamp;
    canceledAt?: Timestamp;
  };
  
  // Settings
  settings: {
    timezone: string;
    currency: string;
    allowClientUploads: boolean;
    enableNotifications: boolean;
  };
  
  // Metadata
  createdBy: string;
  status: 'active' | 'suspended' | 'archived';
}

// Project management
export interface Project extends BaseEntity {
  orgId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Timeline
  startDate: Timestamp;
  estimatedEndDate: Timestamp;
  actualEndDate?: Timestamp;
  
  // Assignment
  assignedEditorUids: string[];  // Staff working on this project
  assignedClientUids: string[];  // Client contacts for this project
  projectManager?: string;       // Primary staff member responsible
  
  // Features and pricing (can differ from org subscription)
  features: FeatureKey[];
  quote: {
    setup: number;
    monthly: number;
    breakdown: Record<FeatureKey, { setup: number; monthly: number; }>;
    approved: boolean;
    approvedAt?: Timestamp;
    approvedBy?: string;
  };
  
  // Progress tracking
  progress: {
    percentage: number;
    currentPhase: string;
    milestonesCompleted: number;
    milestonesTotal: number;
  };
  
  // Communication
  lastClientUpdate?: Timestamp;
  nextCheckIn?: Timestamp;
  
  createdBy: string;
}

// Deliverables and milestones
export interface Deliverable extends BaseEntity {
  orgId: string;
  projectId: string;
  name: string;
  description: string;
  type: 'design' | 'development' | 'content' | 'testing' | 'deployment' | 'documentation';
  
  status: 'pending' | 'in-progress' | 'review' | 'approved' | 'delivered';
  
  // Timeline
  dueDate: Timestamp;
  completedAt?: Timestamp;
  
  // Assignment
  assignedUid?: string;
  reviewerUid?: string;
  
  // Files and links
  attachments: {
    name: string;
    url: string;
    type: string;
    uploadedAt: Timestamp;
    uploadedBy: string;
  }[];
  
  // Client visibility
  visibleToClient: boolean;
  clientApprovalRequired: boolean;
  clientApproved?: boolean;
  clientApprovedAt?: Timestamp;
  clientFeedback?: string;
  
  createdBy: string;
}

// Milestone tracking
export interface Milestone extends BaseEntity {
  orgId: string;
  projectId: string;
  name: string;
  description: string;
  
  // Timeline
  targetDate: Timestamp;
  completedAt?: Timestamp;
  
  // Progress
  status: 'upcoming' | 'in-progress' | 'completed' | 'overdue';
  blockers?: string[];
  
  // Associated deliverables
  deliverableIds: string[];
  
  createdBy: string;
}

// Invoice and billing
export interface Invoice extends BaseEntity {
  orgId: string;
  projectId?: string;
  invoiceNumber: string;
  
  // Billing details
  description: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  
  subtotal: number;
  tax: number;
  total: number;
  
  // Status
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  
  // Dates
  issueDate: Timestamp;
  dueDate: Timestamp;
  paidAt?: Timestamp;
  
  // Stripe
  stripeInvoiceId?: string;
  stripePaymentIntentId?: string;
  
  // Recipients
  billingEmail: string;
  sentTo: string[];
  
  createdBy: string;
}

// Communication and activity logs
export interface ActivityLog extends BaseEntity {
  orgId: string;
  projectId?: string;
  deliverableId?: string;
  
  type: 'project_created' | 'status_changed' | 'deliverable_completed' | 'comment_added' | 'file_uploaded' | 'invoice_sent' | 'payment_received';
  
  actor: {
    uid: string;
    name: string;
    role: OrgRole;
  };
  
  description: string;
  metadata?: Record<string, any>;
  
  // Visibility
  visibleToClient: boolean;
}

// Team member information (enhanced user profile)
export interface TeamMember {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: OrgRole;
  
  // Contact info
  phone?: string;
  timezone?: string;
  
  // Permissions (for editors/staff)
  permissions?: {
    canCreateProjects: boolean;
    canManageBilling: boolean;
    canManageTeam: boolean;
    canViewAnalytics: boolean;
  };
  
  // Activity
  lastActive?: Timestamp;
  joinedAt: Timestamp;
}

// Analytics and reporting data
export interface OrgAnalytics {
  orgId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: Timestamp;
  
  // Financial metrics
  revenue: {
    setup: number;
    monthly: number;
    total: number;
  };
  
  // Project metrics
  projects: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
  };
  
  // Team metrics
  team: {
    utilization: number; // percentage of capacity used
    activeMembers: number;
  };
  
  // Client metrics
  clients: {
    total: number;
    active: number;
    satisfaction?: number; // if we implement feedback
  };
}

// Notification settings and delivery
export interface NotificationPreferences {
  uid: string;
  orgId: string;
  
  email: {
    projectUpdates: boolean;
    deliverableCompleted: boolean;
    invoices: boolean;
    systemNotifications: boolean;
  };
  
  inApp: {
    projectUpdates: boolean;
    mentions: boolean;
    deadlines: boolean;
  };
  
  frequency: 'immediate' | 'daily' | 'weekly';
}

// Type helpers for API responses
export type CreateOrganizationData = Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateProjectData = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'progress'>;
export type CreateDeliverableData = Omit<Deliverable, 'id' | 'createdAt' | 'updatedAt'>;

// Query result types
export interface OrganizationWithProjects extends Organization {
  projects: Project[];
  activeProjectsCount: number;
  totalRevenue: number;
}

export interface ProjectWithDetails extends Project {
  deliverables: Deliverable[];
  milestones: Milestone[];
  teamMembers: TeamMember[];
  recentActivity: ActivityLog[];
}