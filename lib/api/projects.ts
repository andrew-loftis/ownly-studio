import { auth } from '@/lib/firebase';
import type { Project, Deliverable, ProjectStatus } from '@/lib/types/backend';

// Helper function to get auth token
async function getAuthToken(): Promise<string> {
  const user = auth?.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
}

// Projects API
export const projectsAPI = {
  // Get all projects for an organization
  async getProjects(orgId: string, options: {
    status?: ProjectStatus;
    assignedClientUid?: string;
    limit?: number;
    cursor?: string;
  } = {}): Promise<{
    projects: Project[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    const token = await getAuthToken();
    const params = new URLSearchParams({ orgId });
    
    if (options.status) params.append('status', options.status);
    if (options.assignedClientUid) params.append('assignedClientUid', options.assignedClientUid);
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.cursor) params.append('cursor', options.cursor);

    const response = await fetch(`/api/admin/projects?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch projects');
    }

    return response.json();
  },

  // Get a single project
  async getProject(projectId: string): Promise<Project> {
    const token = await getAuthToken();
    
    const response = await fetch(`/api/admin/projects/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch project');
    }

    return response.json();
  },

  // Create a new project
  async createProject(projectData: {
    orgId: string;
    name: string;
    description?: string;
    assignedClientUids: string[];
    estimatedValue?: number;
    deadline?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<Project> {
    const token = await getAuthToken();
    
    const response = await fetch('/api/admin/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create project');
    }

    return response.json();
  },

  // Update a project
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const token = await getAuthToken();
    
    const response = await fetch(`/api/admin/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update project');
    }

    return response.json();
  },

  // Delete a project
  async deleteProject(projectId: string): Promise<void> {
    const token = await getAuthToken();
    
    const response = await fetch(`/api/admin/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete project');
    }
  },
};

// Deliverables API
export const deliverablesAPI = {
  // Get deliverables for an organization or project
  async getDeliverables(orgId: string, options: {
    projectId?: string;
    status?: string;
    limit?: number;
    cursor?: string;
  } = {}): Promise<{
    deliverables: Deliverable[];
    nextCursor?: string;
    hasMore: boolean;
  }> {
    const token = await getAuthToken();
    const params = new URLSearchParams({ orgId });
    
    if (options.projectId) params.append('projectId', options.projectId);
    if (options.status) params.append('status', options.status);
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.cursor) params.append('cursor', options.cursor);

    const response = await fetch(`/api/admin/deliverables?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch deliverables');
    }

    return response.json();
  },

  // Get a single deliverable
  async getDeliverable(deliverableId: string): Promise<Deliverable> {
    const token = await getAuthToken();
    
    const response = await fetch(`/api/admin/deliverables/${deliverableId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch deliverable');
    }

    return response.json();
  },

  // Create a new deliverable
  async createDeliverable(deliverableData: {
    orgId: string;
    projectId: string;
    name: string;
    description?: string;
    type: 'design' | 'development' | 'content' | 'testing' | 'deployment' | 'documentation';
    dueDate: string;
    assignedUid?: string;
    visibleToClient?: boolean;
    clientApprovalRequired?: boolean;
  }): Promise<Deliverable> {
    const token = await getAuthToken();
    
    const response = await fetch('/api/admin/deliverables', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deliverableData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create deliverable');
    }

    return response.json();
  },

  // Update a deliverable
  async updateDeliverable(deliverableId: string, updates: Partial<Deliverable>): Promise<Deliverable> {
    const token = await getAuthToken();
    
    const response = await fetch(`/api/admin/deliverables/${deliverableId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update deliverable');
    }

    return response.json();
  },

  // Delete a deliverable
  async deleteDeliverable(deliverableId: string): Promise<void> {
    const token = await getAuthToken();
    
    const response = await fetch(`/api/admin/deliverables/${deliverableId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete deliverable');
    }
  },

  // Client approval functions
  async approveDeliverable(deliverableId: string, feedback?: string): Promise<Deliverable> {
    return this.updateDeliverable(deliverableId, {
      clientApproved: true,
      clientFeedback: feedback,
    });
  },

  async rejectDeliverable(deliverableId: string, feedback: string): Promise<Deliverable> {
    return this.updateDeliverable(deliverableId, {
      clientApproved: false,
      clientFeedback: feedback,
    });
  },
};

// Utility functions
export const projectUtils = {
  // Calculate project progress
  calculateProgress(project: Project, deliverables: Deliverable[]): {
    percentage: number;
    completedDeliverables: number;
    totalDeliverables: number;
    overdue: number;
  } {
    const projectDeliverables = deliverables.filter(d => d.projectId === project.id);
    const completed = projectDeliverables.filter(d => d.status === 'delivered').length;
    const total = projectDeliverables.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const now = new Date();
    const overdue = projectDeliverables.filter(d => {
      const dueDate = d.dueDate.toDate ? d.dueDate.toDate() : new Date(d.dueDate);
      return dueDate < now && !['approved', 'delivered'].includes(d.status);
    }).length;

    return {
      percentage,
      completedDeliverables: completed,
      totalDeliverables: total,
      overdue
    };
  },

  // Get project status color
  getStatusColor(status: ProjectStatus): string {
    switch (status) {
      case 'planning': return 'blue';
      case 'in-progress': return 'yellow';
      case 'review': return 'purple';
      case 'completed': return 'green';
      case 'on-hold': return 'orange';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  },

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  },

  // Calculate days until deadline
  getDaysUntilDeadline(date: any): number {
    const deadline = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },
};