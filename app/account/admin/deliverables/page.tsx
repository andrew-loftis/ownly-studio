"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/authStore';
import { getUserOrgRole } from '@/lib/roles';
import AdminLayout from '@/components/admin/AdminLayout';
import Button from '@/components/ui/Button';
import { 
  Package, 
  Search, 
  Filter, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  FileText,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import type { Deliverable } from '@/lib/types/backend';

interface DeliverablesPageProps {
  searchParams: { orgId?: string; projectId?: string };
}

export default function DeliverablesPage({ searchParams }: DeliverablesPageProps) {
  const { user } = useAuthStore();
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const orgId = searchParams.orgId || 'default-org';
  const projectId = searchParams.projectId;

  useEffect(() => {
    if (user && orgId) {
      loadUserRole();
      loadDeliverables();
    }
  }, [user, orgId, projectId, statusFilter]);

  const loadUserRole = async () => {
    if (!user) return;
    try {
      const role = await getUserOrgRole(user.uid, orgId);
      setUserRole(role);
    } catch (err) {
      console.error('Error loading user role:', err);
    }
  };

  const loadDeliverables = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams({
        orgId,
        ...(projectId && { projectId }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/deliverables?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load deliverables');
      }

      const data = await response.json();
      setDeliverables(data.deliverables || []);
    } catch (err) {
      console.error('Error loading deliverables:', err);
      setError(err instanceof Error ? err.message : 'Failed to load deliverables');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'in-progress': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'review': return <Eye className="w-4 h-4 text-purple-400" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'delivered': return <Package className="w-4 h-4 text-green-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'review': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'approved': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'delivered': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'design': return '🎨';
      case 'development': return '💻';
      case 'content': return '📝';
      case 'testing': return '🧪';
      case 'deployment': return '🚀';
      case 'documentation': return '📚';
      default: return '📄';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate: any) => {
    if (!dueDate) return false;
    const due = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
    return due < new Date() && !['approved', 'delivered'].includes(''); // Add status check
  };

  const filteredDeliverables = deliverables.filter(deliverable =>
    deliverable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deliverable.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-[var(--txt-primary)] mb-2">Authentication Required</h2>
            <p className="text-[var(--txt-secondary)]">Please sign in to access deliverable management.</p>
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
            <h1 className="text-2xl font-bold text-[var(--txt-primary)]">Deliverables</h1>
            <p className="text-[var(--txt-secondary)] mt-1">
              {projectId 
                ? 'Manage deliverables for this project'
                : 'Track all deliverables across your organization'
              }
            </p>
          </div>
          
          {userRole && ['admin', 'editor'].includes(userRole) && (
            <Button 
              variant="primary" 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Deliverable
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
                placeholder="Search deliverables..."
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
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[var(--bg-3)] border border-white/10 rounded-lg 
                       text-[var(--txt-primary)] focus:outline-none focus:ring-2 
                       focus:ring-[var(--mint)] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="approved">Approved</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        {/* Deliverables List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--mint)] mx-auto mb-4"></div>
              <p className="text-[var(--txt-secondary)]">Loading deliverables...</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass-strong rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-2">Error Loading Deliverables</h3>
            <p className="text-[var(--txt-secondary)] mb-4">{error}</p>
            <Button variant="ghost" onClick={loadDeliverables}>
              Try Again
            </Button>
          </div>
        ) : filteredDeliverables.length === 0 ? (
          <div className="glass-strong rounded-xl p-8 text-center">
            <Package className="w-12 h-12 text-[var(--txt-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-2">
              {deliverables.length === 0 ? 'No Deliverables Yet' : 'No Matching Deliverables'}
            </h3>
            <p className="text-[var(--txt-secondary)] mb-4">
              {deliverables.length === 0 
                ? 'Create your first deliverable to start tracking project progress.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {userRole && ['admin', 'editor'].includes(userRole) && deliverables.length === 0 && (
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create First Deliverable
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
            {filteredDeliverables.map((deliverable) => (
              <motion.div
                key={deliverable.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.95 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.02, transition: { duration: 0.25 } }}
                className="glass-strong rounded-xl p-6 hover:bg-white/5 transition-colors relative overflow-hidden group"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--mint)]/0 via-[var(--mint)]/5 to-[var(--cyan)]/10 mix-blend-overlay" />
                  <div className="absolute -inset-[2px] rounded-xl border border-transparent group-hover:border-[var(--border-accent)]/40" />
                </div>
                <div className="flex items-start gap-4">
                  {/* Type Icon */}
                  <div className="text-2xl">{getTypeIcon(deliverable.type)}</div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[var(--txt-primary)] mb-1">
                          {deliverable.name}
                        </h3>
                        <p className="text-sm text-[var(--txt-secondary)] line-clamp-2">
                          {deliverable.description}
                        </p>
                      </div>
                      
                      <button className="p-1 hover:bg-white/10 rounded ml-4">
                        <MoreHorizontal className="w-4 h-4 text-[var(--txt-tertiary)]" />
                      </button>
                    </div>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      {/* Status */}
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(deliverable.status)}`}>
                        {getStatusIcon(deliverable.status)}
                        {deliverable.status.replace('-', ' ')}
                      </div>

                      {/* Type */}
                      <div className="text-xs text-[var(--txt-tertiary)] bg-white/5 px-2 py-1 rounded">
                        {deliverable.type}
                      </div>

                      {/* Due Date */}
                      <div className={`flex items-center gap-1 text-xs ${
                        isOverdue(deliverable.dueDate) ? 'text-red-400' : 'text-[var(--txt-tertiary)]'
                      }`}>
                        <Calendar className="w-3 h-3" />
                        Due {formatDate(deliverable.dueDate)}
                        {isOverdue(deliverable.dueDate) && (
                          <span className="ml-1 text-red-400">• Overdue</span>
                        )}
                      </div>

                      {/* Assigned User */}
                      {deliverable.assignedUid && (
                        <div className="flex items-center gap-1 text-xs text-[var(--txt-tertiary)]">
                          <User className="w-3 h-3" />
                          Assigned
                        </div>
                      )}

                      {/* Client Visible */}
                      {deliverable.visibleToClient && (
                        <div className="text-xs text-[var(--mint)] bg-[var(--mint)]/10 px-2 py-1 rounded">
                          Client Visible
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      
                      {userRole && ['admin', 'editor'].includes(userRole) && (
                        <Button variant="ghost" size="sm">
                          <FileText className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      )}

                      {/* Client approval for clients */}
                      {userRole === 'client' && deliverable.clientApprovalRequired && deliverable.status === 'review' && (
                        <Button variant="primary" size="sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Deliverable Modal Placeholder */}
      <AnimatePresence>
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: -12, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="glass-strong rounded-2xl p-6 w-full max-w-md relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-[var(--mint)]/10 via-transparent to-[var(--cyan)]/20" />
            <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">Create Deliverable</h3>
            <p className="text-[var(--txt-secondary)] mb-4">
              Deliverable creation form will be implemented here.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" className="flex-1">
                Create
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </AdminLayout>
  );
}