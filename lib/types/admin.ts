export interface Organization {
  id: string;
  name: string;
  adminUids: string[];
  editorUids: string[];
  clientUids: string[];
  primaryContact?: {
    name: string;
    email: string;
    phone?: string;
  };
  billingContact?: {
    name: string;
    email: string;
    phone?: string;
  };
  subscription?: {
    stripeCustomerId?: string;
    status: "active" | "inactive" | "pending" | "canceled" | "past_due" | "unpaid" | "trialing" | "paused";
    plan: "starter" | "professional" | "enterprise";
    currentPeriodEnd?: Date;
    trialEnd?: Date;
  };
  billing?: {
    email: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  orgId: string;
  name: string;
  description: string;
  status: "planning" | "development" | "review" | "completed" | "on-hold";
  progress: number;
  clientUids: string[];
  adminUids: string[];
  startDate?: Date;
  dueDate?: Date;
  deliverables: Deliverable[];
  budget?: {
    estimated: number;
    actual: number;
  };
  timeline?: ProjectMilestone[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Deliverable {
  id: string;
  name: string;
  description?: string;
  status: "pending" | "in_progress" | "completed" | "approved" | "rejected";
  dueDate?: Date;
  completedAt?: Date;
  fileUrl?: string;
  notes?: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: "admin" | "editor" | "client";
  organizations: string[];
  profile?: {
    firstName?: string;
    lastName?: string;
    company?: string;
    phone?: string;
  };
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface Invoice {
  id: string;
  orgId: string;
  invoiceNumber: string;
  description: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "canceled";
  dueDate: Date;
  issueDate: Date;
  paidAt?: Date;
  stripeInvoiceId?: string;
  stripePaymentIntentId?: string;
  items: InvoiceItem[];
  client: {
    name: string;
    email: string;
    address?: Address;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface ActivityEvent {
  id: string;
  type: "build_started" | "build_completed" | "message_received" | "payment_processed" | "feature_added";
  title: string;
  description: string;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface CreateOrganizationData {
  name: string;
  adminEmail: string;
  clientEmails?: string[];
  subscription?: {
    plan: "starter" | "professional" | "enterprise";
  };
}

export interface CreateProjectData {
  orgId: string;
  name: string;
  description: string;
  clientUids: string[];
  startDate?: Date;
  dueDate?: Date;
  budget?: number;
}

export interface CreateInvoiceData {
  orgId: string;
  description: string;
  amount: number;
  dueDate: Date;
  items: InvoiceItem[];
  clientEmail: string;
  clientName: string;
  notes?: string;
}