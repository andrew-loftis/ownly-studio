export type SiteRole = "superadmin" | "staff" | null;

export type OrgRole = "admin" | "editor" | "client";

export interface OrgDoc {
  id: string;
  name: string;
  createdAt?: any;
  createdBy?: string;
  adminUids: string[];
  editorUids?: string[];
  clientUids?: string[];
  settings?: Record<string, unknown>;
  billing?: {
    plan?: string;
    status?: string;
    stripeCustomerId?: string | null;
  };
}

export interface MembershipHint {
  orgId: string;
  role: OrgRole;
}
