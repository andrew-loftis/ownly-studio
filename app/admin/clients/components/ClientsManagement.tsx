'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'potential';
  totalRevenue: number;
  projectCount: number;
  lastActivity: Date;
  joinDate: Date;
  tags: string[];
}

const ClientsManagement = () => {
  const { user } = useAuthStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'potential'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

  const fetchClients = async () => {
    if (!db || !user) return;

    try {
      setLoading(true);

      // Fetch organizations where user is admin
      const orgsQuery = query(
        collection(db, 'orgs'),
        where('adminUids', 'array-contains', user.uid)
      );
      const orgsSnapshot = await getDocs(orgsQuery);
      const orgIds = orgsSnapshot.docs.map(doc => doc.id);

      if (orgIds.length === 0) {
        setClients([]);
        setLoading(false);
        return;
      }

      // Fetch projects and invoices for all organizations
      const [projectsData, invoicesData] = await Promise.all([
        Promise.all(orgIds.map(orgId =>
          getDocs(query(
            collection(db!, 'orgs', orgId, 'projects'),
            orderBy('createdAt', 'desc')
          ))
        )),
        Promise.all(orgIds.map(orgId =>
          getDocs(query(
            collection(db!, 'orgs', orgId, 'invoices'),
            where('status', '==', 'paid'),
            orderBy('createdAt', 'desc')
          ))
        ))
      ]);

      const allProjects = projectsData.flatMap(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      );
      
      const allInvoices = invoicesData.flatMap(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      );

      // Group by client email
      const clientMap = new Map<string, Client>();

      allProjects.forEach((project: any) => {
        if (!project.clientEmail) return;

        const clientEmail = project.clientEmail;
        const existing = clientMap.get(clientEmail);
        const projectDate = project.createdAt?.toDate?.() || new Date(project.createdAt);

        if (!existing) {
          clientMap.set(clientEmail, {
            id: clientEmail,
            name: project.clientName || clientEmail.split('@')[0],
            email: clientEmail,
            company: project.clientCompany || '',
            phone: project.clientPhone || '',
            status: project.status === 'completed' ? 'active' : 
                   ['in-progress', 'planning', 'review'].includes(project.status) ? 'active' : 'potential',
            totalRevenue: 0,
            projectCount: 1,
            lastActivity: projectDate,
            joinDate: projectDate,
            tags: []
          });
        } else {
          existing.projectCount++;
          if (projectDate > existing.lastActivity) {
            existing.lastActivity = projectDate;
          }
          if (projectDate < existing.joinDate) {
            existing.joinDate = projectDate;
          }
        }
      });

      // Add revenue data
      allInvoices.forEach((invoice: any) => {
        if (!invoice.clientEmail) return;
        
        const client = clientMap.get(invoice.clientEmail);
        if (client) {
          client.totalRevenue += invoice.amount || 0;
        }
      });

      setClients(Array.from(clientMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue));

    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesFilter = filter === 'all' || client.status === filter;
    const matchesSearch = searchTerm === '' || 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (amount: number) => `$${(amount / 100).toLocaleString()}`;
  const formatDate = (date: Date) => date.toLocaleDateString();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/10';
      case 'inactive': return 'text-gray-400 bg-gray-500/10';
      case 'potential': return 'text-amber-400 bg-amber-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

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
            Client Management
          </h1>
          <p className="text-[var(--txt-secondary)] mt-1">
            Manage client relationships and track business performance
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/clients/create"
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors"
          >
            Add Client
          </Link>
          <Link
            href="/admin/clients/import"
            className="px-4 py-2 border border-[var(--bg-4)] text-[var(--txt-secondary)] rounded-lg font-medium hover:text-[var(--txt-primary)] hover:border-[var(--bg-3)] transition-colors"
          >
            Import
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-light rounded-2xl p-6">
          <div className="text-2xl font-bold text-[var(--txt-primary)]">
            {clients.length}
          </div>
          <div className="text-sm text-[var(--txt-secondary)]">Total Clients</div>
        </div>
        <div className="glass-light rounded-2xl p-6">
          <div className="text-2xl font-bold text-green-400">
            {clients.filter(c => c.status === 'active').length}
          </div>
          <div className="text-sm text-[var(--txt-secondary)]">Active Clients</div>
        </div>
        <div className="glass-light rounded-2xl p-6">
          <div className="text-2xl font-bold text-[var(--txt-primary)]">
            {formatCurrency(clients.reduce((sum, c) => sum + c.totalRevenue, 0))}
          </div>
          <div className="text-sm text-[var(--txt-secondary)]">Total Revenue</div>
        </div>
        <div className="glass-light rounded-2xl p-6">
          <div className="text-2xl font-bold text-[var(--txt-primary)]">
            {formatCurrency(clients.reduce((sum, c) => sum + c.totalRevenue, 0) / Math.max(clients.length, 1))}
          </div>
          <div className="text-sm text-[var(--txt-secondary)]">Avg Revenue/Client</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass-light rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--bg-3)] border border-[var(--bg-4)] rounded-lg text-[var(--txt-primary)] placeholder-[var(--txt-tertiary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex bg-[var(--bg-2)] rounded-lg p-1">
            {(['all', 'active', 'inactive', 'potential'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--txt-secondary)] hover:text-[var(--txt-primary)]'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="glass-light rounded-2xl overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="p-8 text-center text-[var(--txt-tertiary)]">
            {searchTerm ? 'No clients match your search' : 'No clients found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--bg-2)] border-b border-[var(--bg-4)]">
                <tr>
                  <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Client</th>
                  <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Status</th>
                  <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Projects</th>
                  <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Revenue</th>
                  <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Last Activity</th>
                  <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client, index) => (
                  <tr 
                    key={client.id} 
                    className={`border-b border-[var(--bg-4)] hover:bg-[var(--bg-2)] transition-colors ${
                      index % 2 === 0 ? 'bg-[var(--bg-1)]' : 'bg-[var(--bg-2)]'
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/60 flex items-center justify-center text-white font-semibold">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-[var(--txt-primary)]">
                            {client.name}
                          </div>
                          <div className="text-sm text-[var(--txt-secondary)]">
                            {client.email}
                          </div>
                          {client.company && (
                            <div className="text-xs text-[var(--txt-tertiary)]">
                              {client.company}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-[var(--txt-primary)]">
                        {client.projectCount}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-[var(--txt-primary)]">
                        {formatCurrency(client.totalRevenue)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-[var(--txt-secondary)]">
                        {formatDate(client.lastActivity)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/clients/${encodeURIComponent(client.email)}`}
                          className="px-3 py-1 text-xs rounded bg-[var(--bg-3)] text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/clients/${encodeURIComponent(client.email)}/edit`}
                          className="px-3 py-1 text-xs rounded bg-[var(--bg-3)] text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] transition-colors"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/admin/communications/messages?client=${encodeURIComponent(client.email)}`}
                          className="px-3 py-1 text-xs rounded bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors"
                        >
                          Message
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
    </div>
  );
};

export default ClientsManagement;