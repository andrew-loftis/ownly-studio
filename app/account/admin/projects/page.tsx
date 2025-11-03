"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { getUserOrgRole } from '@/lib/roles';
import AdminLayout from '@/components/admin/AdminLayout';
import Button from '@/components/ui/Button';
import { 
  FolderPlus, 
  Search, 
  Filter, 
  Calendar,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import type { Project, ProjectStatus } from '@/lib/types/backend';

interface ProjectsPageProps {
  searchParams: { orgId?: string };
}

export default function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const orgId = searchParams.orgId || 'default-org'; // Fallback for demo

  useEffect(() => {
    if (user && orgId) {
      loadUserRole();
      loadProjects();
    }
  }, [user, orgId, statusFilter]);

  const loadUserRole = async () => {
    if (!user) return;
    try {
      const role = await getUserOrgRole(user.uid, orgId);
      setUserRole(role);
    } catch (err) {
      console.error('Error loading user role:', err);
    }
  };

  const loadProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams({
        orgId,
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/projects?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load projects');
      }

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case 'planning': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'in-progress': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'review': return <Eye className="w-4 h-4 text-purple-400" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'on-hold': return <PauseCircle className="w-4 h-4 text-orange-400" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'planning': return 'bg-blue-500/20 text-blue-300';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-300';
      case 'review': return 'bg-purple-500/20 text-purple-300';
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'on-hold': return 'bg-orange-500/20 text-orange-300';
      case 'cancelled': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-300';
      case 'high': return 'bg-orange-500/20 text-orange-300';
      case 'medium': return 'bg-blue-500/20 text-blue-300';
      case 'low': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-[var(--txt-primary)] mb-2">Authentication Required</h2>
            <p className="text-[var(--txt-secondary)]">Please sign in to access project management.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--txt-primary)]">Projects</h1>
            <p className="text-[var(--txt-secondary)] mt-1">
              Manage your organization's projects and deliverables
            </p>
          </div>
          
          {userRole && ['admin', 'editor'].includes(userRole) && (
            <Button 
              variant="primary" 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              New Project
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="glass-strong rounded-xl p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--txt-tertiary)]" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-3)] border border-white/10 rounded-lg 
                         text-[var(--txt-primary)] placeholder-[var(--txt-tertiary)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--mint)] focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
              className="px-4 py-2 bg-[var(--bg-3)] border border-white/10 rounded-lg 
                       text-[var(--txt-primary)] focus:outline-none focus:ring-2 
                       focus:ring-[var(--mint)] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--mint)] mx-auto mb-4"></div>
              <p className="text-[var(--txt-secondary)]">Loading projects...</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass-strong rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-2">Error Loading Projects</h3>
            <p className="text-[var(--txt-secondary)] mb-4">{error}</p>
            <Button variant="ghost" onClick={loadProjects}>
              Try Again
            </Button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="glass-strong rounded-xl p-8 text-center">
            <FolderPlus className="w-12 h-12 text-[var(--txt-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-2">
              {projects.length === 0 ? 'No Projects Yet' : 'No Matching Projects'}
            </h3>
            <p className="text-[var(--txt-secondary)] mb-4">
              {projects.length === 0 
                ? 'Create your first project to get started with project management.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {userRole && ['admin', 'editor'].includes(userRole) && projects.length === 0 && (
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create First Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div key={project.id} className="glass-strong rounded-xl p-6 hover:bg-white/5 transition-colors">
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--txt-primary)] mb-1">
                      {project.name}
                    </h3>
                    <p className="text-sm text-[var(--txt-secondary)] line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button className="p-1 hover:bg-white/10 rounded">
                      <MoreHorizontal className="w-4 h-4 text-[var(--txt-tertiary)]" />
                    </button>
                  </div>
                </div>

                {/* Status and Priority */}
                <div className="flex items-center gap-2 mb-4">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {getStatusIcon(project.status)}
                    {project.status.replace('-', ' ')}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--txt-tertiary)]">Progress</span>
                    <span className="text-xs text-[var(--txt-secondary)]">
                      {project.progress.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-[var(--mint)] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Project Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-[var(--txt-primary)]">
                      {project.assignedClientUids.length}
                    </div>
                    <div className="text-xs text-[var(--txt-tertiary)]">Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-[var(--txt-primary)]">
                      {project.progress.milestonesCompleted}/{project.progress.milestonesTotal}
                    </div>
                    <div className="text-xs text-[var(--txt-tertiary)]">Milestones</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-[var(--txt-primary)]">
                      ${project.quote.setup.toLocaleString()}
                    </div>
                    <div className="text-xs text-[var(--txt-tertiary)]">Value</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  {userRole && ['admin', 'editor'].includes(userRole) && (
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-strong rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">Create Project</h3>
            <p className="text-[var(--txt-secondary)] mb-4">
              Project creation form will be implemented here.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" className="flex-1">
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}