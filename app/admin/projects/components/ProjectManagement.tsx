'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { fetchJsonWithAuth } from '@/lib/utils';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  client: string;
  clientEmail: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  budget: number;
  spent: number;
  startDate: Date;
  dueDate: Date;
  teamMembers: string[];
  description: string;
  tags: string[];
}

const ProjectManagement = () => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await fetchJsonWithAuth<{ projects: any[] }>(`/api/admin/projects`);
      const mapped: Project[] = (data.projects || []).map((p: any) => {
        const createdAt = p.createdAt ? new Date(p.createdAt) : new Date();
        const due = p.estimatedEndDate ? new Date(p.estimatedEndDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return {
          id: p.id,
          name: p.name || 'Untitled Project',
          client: p.clientEmail ? (p.clientEmail.split('@')[0] || 'Unknown') : 'Unknown',
          clientEmail: p.clientEmail || '',
          status: p.status || 'planning',
          priority: p.priority || 'medium',
          progress: typeof p.progress === 'number' ? p.progress : 0,
          budget: typeof p.budget === 'number' ? p.budget : 0,
          spent: typeof p.spent === 'number' ? p.spent : 0,
          startDate: createdAt,
          dueDate: due,
          teamMembers: Array.isArray(p.teamMembers) ? p.teamMembers : [],
          description: p.description || '',
          tags: Array.isArray(p.tags) ? p.tags : [],
        };
      });
      setProjects(mapped);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'all' || project.status === filter;
    const matchesSearch = searchTerm === '' || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (amount: number) => `$${(amount / 100).toLocaleString()}`;
  const formatDate = (date: Date) => date.toLocaleDateString();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'text-blue-400 bg-blue-500/10';
      case 'in-progress': return 'text-green-400 bg-green-500/10';
      case 'review': return 'text-amber-400 bg-amber-500/10';
      case 'completed': return 'text-emerald-400 bg-emerald-500/10';
      case 'on-hold': return 'text-gray-400 bg-gray-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-gray-400 bg-gray-500/10';
      case 'medium': return 'text-blue-400 bg-blue-500/10';
      case 'high': return 'text-amber-400 bg-amber-500/10';
      case 'urgent': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 25) return 'bg-red-500';
    if (progress < 50) return 'bg-amber-500';
    if (progress < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const isOverdue = (dueDate: Date) => dueDate < new Date();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[var(--bg-4)] rounded w-64 mb-4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-[var(--bg-4)] rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--txt-primary)]">
            Project Management
          </h1>
          <p className="text-[var(--txt-secondary)] mt-1">
            Track and manage all client projects and deliverables
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/projects/create"
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors"
          >
            New Project
          </Link>
          <Link
            href="/admin/projects/templates"
            className="px-4 py-2 border border-[var(--bg-4)] text-[var(--txt-secondary)] rounded-lg font-medium hover:text-[var(--txt-primary)] hover:border-[var(--bg-3)] transition-colors"
          >
            Templates
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="glass-light rounded-2xl p-6">
          <div className="text-2xl font-bold text-[var(--txt-primary)]">
            {projects.length}
          </div>
          <div className="text-sm text-[var(--txt-secondary)]">Total Projects</div>
        </div>
        <div className="glass-light rounded-2xl p-6">
          <div className="text-2xl font-bold text-green-400">
            {projects.filter(p => p.status === 'in-progress').length}
          </div>
          <div className="text-sm text-[var(--txt-secondary)]">In Progress</div>
        </div>
        <div className="glass-light rounded-2xl p-6">
          <div className="text-2xl font-bold text-amber-400">
            {projects.filter(p => p.status === 'review').length}
          </div>
          <div className="text-sm text-[var(--txt-secondary)]">In Review</div>
        </div>
        <div className="glass-light rounded-2xl p-6">
          <div className="text-2xl font-bold text-red-400">
            {projects.filter(p => isOverdue(p.dueDate) && p.status !== 'completed').length}
          </div>
          <div className="text-sm text-[var(--txt-secondary)]">Overdue</div>
        </div>
        <div className="glass-light rounded-2xl p-6">
          <div className="text-2xl font-bold text-[var(--txt-primary)]">
            {formatCurrency(projects.reduce((sum, p) => sum + p.budget, 0))}
          </div>
          <div className="text-sm text-[var(--txt-secondary)]">Total Budget</div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="glass-light rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex-1 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--bg-3)] border border-[var(--bg-4)] rounded-lg text-[var(--txt-primary)] placeholder-[var(--txt-tertiary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex gap-4 items-center">
            {/* Status Filter */}
            <div className="flex bg-[var(--bg-2)] rounded-lg p-1">
              {(['all', 'planning', 'in-progress', 'review', 'completed', 'on-hold'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === status
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--txt-secondary)] hover:text-[var(--txt-primary)]'
                  }`}
                >
                  {status === 'all' ? 'All' : status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex bg-[var(--bg-2)] rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--txt-secondary)] hover:text-[var(--txt-primary)]'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--txt-secondary)] hover:text-[var(--txt-primary)]'
                }`}
              >
                Kanban
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List/Kanban */}
      {viewMode === 'table' ? (
        <div className="glass-light rounded-2xl overflow-hidden">
          {filteredProjects.length === 0 ? (
            <div className="p-8 text-center text-[var(--txt-tertiary)]">
              {searchTerm ? 'No projects match your search' : 'No projects found'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--bg-2)] border-b border-[var(--bg-4)]">
                  <tr>
                    <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Project</th>
                    <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Client</th>
                    <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Status</th>
                    <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Priority</th>
                    <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Progress</th>
                    <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Budget</th>
                    <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Due Date</th>
                    <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project, index) => (
                    <tr 
                      key={project.id} 
                      className={`border-b border-[var(--bg-4)] hover:bg-[var(--bg-2)] transition-colors ${
                        index % 2 === 0 ? 'bg-[var(--bg-1)]' : 'bg-[var(--bg-2)]'
                      }`}
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-[var(--txt-primary)]">
                            {project.name}
                          </div>
                          {project.description && (
                            <div className="text-sm text-[var(--txt-tertiary)] truncate max-w-48">
                              {project.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-[var(--txt-primary)]">{project.client}</div>
                        <div className="text-sm text-[var(--txt-secondary)]">{project.clientEmail}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                          {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-[var(--bg-4)] rounded-full h-2">
                            <div 
                              className={`h-full rounded-full ${getProgressColor(project.progress)}`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-[var(--txt-secondary)] min-w-12">
                            {project.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-[var(--txt-primary)]">{formatCurrency(project.budget)}</div>
                        <div className="text-sm text-[var(--txt-secondary)]">
                          Spent: {formatCurrency(project.spent)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`text-sm ${isOverdue(project.dueDate) && project.status !== 'completed' ? 'text-red-400' : 'text-[var(--txt-secondary)]'}`}>
                          {formatDate(project.dueDate)}
                          {isOverdue(project.dueDate) && project.status !== 'completed' && (
                            <div className="text-xs text-red-400">Overdue</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/projects/${project.id}`}
                            className="px-3 py-1 text-xs rounded bg-[var(--bg-3)] text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] transition-colors"
                          >
                            View
                          </Link>
                          <Link
                            href={`/admin/projects/${project.id}/edit`}
                            className="px-3 py-1 text-xs rounded bg-[var(--bg-3)] text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] transition-colors"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // Kanban View
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[800px] overflow-hidden">
          {(['planning', 'in-progress', 'review', 'completed', 'on-hold'] as const).map((status) => {
            const statusProjects = filteredProjects.filter(p => p.status === status);
            return (
              <div key={status} className="glass-light rounded-2xl p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[var(--txt-primary)]">
                    {status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </h3>
                  <span className="text-sm text-[var(--txt-secondary)] bg-[var(--bg-3)] px-2 py-1 rounded">
                    {statusProjects.length}
                  </span>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {statusProjects.map((project) => (
                    <div key={project.id} className="bg-[var(--bg-3)] rounded-lg p-4 border border-[var(--bg-4)] hover:border-[var(--accent)]/30 transition-colors cursor-pointer">
                      <div className="font-medium text-[var(--txt-primary)] mb-2">
                        {project.name}
                      </div>
                      <div className="text-sm text-[var(--txt-secondary)] mb-3">
                        {project.client}
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                        <span className="text-xs text-[var(--txt-tertiary)]">
                          {formatDate(project.dueDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-[var(--bg-4)] rounded-full h-1.5">
                          <div 
                            className={`h-full rounded-full ${getProgressColor(project.progress)}`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-[var(--txt-secondary)]">
                          {project.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;