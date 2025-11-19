'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/authStore';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import DashboardOverview from './DashboardOverview';
import QuickActions from './QuickActions';
import RealtimeMetrics from './RealtimeMetrics';
import RevenueAnalytics from './RevenueAnalytics';
import ClientOverview from './ClientOverview';
import ProjectStatus from './ProjectStatus';
import RecentActivity from './RecentActivity';
import Performance from './Performance';

interface DashboardData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalClients: number;
  activeClients: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingInvoices: number;
  overdueInvoices: number;
  revenueGrowth: number;
  clientGrowth: number;
  projectGrowth: number;
  avgProjectValue: number;
  conversionRate: number;
  clientSatisfaction: number;
  recentActivities: any[];
  topClients: any[];
  projectsByStatus: Record<string, number>;
  revenueByMonth: Array<{ month: string; revenue: number; growth: number }>;
  upcomingDeadlines: any[];
}

const AdminDashboard = () => {
  const { user, openModal } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user, timeRange]);

  const fetchDashboardData = async () => {
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
        setData({
          totalRevenue: 0,
          monthlyRevenue: 0,
          totalClients: 0,
          activeClients: 0,
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          pendingInvoices: 0,
          overdueInvoices: 0,
          revenueGrowth: 0,
          clientGrowth: 0,
          projectGrowth: 0,
          avgProjectValue: 0,
          conversionRate: 75.5,
          clientSatisfaction: 94.2,
          recentActivities: [],
          topClients: [],
          projectsByStatus: {},
          revenueByMonth: [],
          upcomingDeadlines: []
        });
        setLoading(false);
        return;
      }

      // Fetch all data in parallel
      const [projectsData, invoicesData, clientsData] = await Promise.all([
        // Projects
        Promise.all(orgIds.map(orgId =>
          getDocs(query(
            collection(db!, 'orgs', orgId, 'projects'),
            orderBy('createdAt', 'desc')
          ))
        )),
        // Invoices
        Promise.all(orgIds.map(orgId =>
          getDocs(query(
            collection(db!, 'orgs', orgId, 'invoices'),
            orderBy('createdAt', 'desc')
          ))
        )),
        // Recent activities
        Promise.all(orgIds.map(orgId =>
          getDocs(query(
            collection(db!, 'orgs', orgId, 'activity'),
            orderBy('timestamp', 'desc'),
            limit(10)
          ))
        ))
      ]);

      // Process projects
      const allProjects = projectsData.flatMap(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      );

      // Process invoices
      const allInvoices = invoicesData.flatMap(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      );

      // Process activities
      const allActivities = clientsData.flatMap(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      );

      // Calculate metrics
      const now = new Date();
      const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
      const prevStartDate = new Date(startDate.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      // Revenue calculations
      const paidInvoices = allInvoices.filter((inv: any) => inv.status === 'paid');
      const totalRevenue = paidInvoices.reduce((sum, inv: any) => sum + (inv.amount || 0), 0);
      
      const recentRevenue = paidInvoices.filter((inv: any) => {
        const date = inv.createdAt?.toDate?.() || new Date(inv.createdAt);
        return date >= startDate;
      }).reduce((sum, inv: any) => sum + (inv.amount || 0), 0);

      const prevRevenue = paidInvoices.filter((inv: any) => {
        const date = inv.createdAt?.toDate?.() || new Date(inv.createdAt);
        return date >= prevStartDate && date < startDate;
      }).reduce((sum, inv: any) => sum + (inv.amount || 0), 0);

      const revenueGrowth = prevRevenue > 0 ? ((recentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

      // Project calculations
      const totalProjects = allProjects.length;
      const activeProjects = allProjects.filter((p: any) => 
        ['in-progress', 'planning', 'review'].includes(p.status)
      ).length;
      const completedProjects = allProjects.filter((p: any) => p.status === 'completed').length;

      const recentProjects = allProjects.filter((p: any) => {
        const date = p.createdAt?.toDate?.() || new Date(p.createdAt);
        return date >= startDate;
      }).length;

      const prevProjects = allProjects.filter((p: any) => {
        const date = p.createdAt?.toDate?.() || new Date(p.createdAt);
        return date >= prevStartDate && date < startDate;
      }).length;

      const projectGrowth = prevProjects > 0 ? ((recentProjects - prevProjects) / prevProjects) * 100 : 0;

      // Client calculations
      const clientEmails = new Set(allProjects.map((p: any) => p.clientEmail).filter(Boolean));
      const totalClients = clientEmails.size;
      const activeClients = new Set(
        allProjects
          .filter((p: any) => ['in-progress', 'planning', 'review'].includes(p.status))
          .map((p: any) => p.clientEmail)
          .filter(Boolean)
      ).size;

      // Invoice status
      const pendingInvoices = allInvoices.filter((inv: any) => inv.status === 'pending').length;
      const overdueInvoices = allInvoices.filter((inv: any) => {
        if (inv.status !== 'pending') return false;
        const dueDate = inv.dueDate?.toDate?.() || new Date(inv.dueDate);
        return dueDate < now;
      }).length;

      // Projects by status
      const projectsByStatus = allProjects.reduce((acc, project: any) => {
        const status = project.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Revenue by month (last 12 months)
      const revenueByMonth = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthInvoices = paidInvoices.filter((invoice: any) => {
          const invoiceDate = invoice.createdAt?.toDate?.() || new Date(invoice.createdAt);
          return invoiceDate >= monthStart && invoiceDate <= monthEnd;
        });
        
        const monthRevenue = monthInvoices.reduce((sum, inv: any) => sum + (inv.amount || 0), 0);
        
        // Calculate growth
        const prevMonthStart = new Date(monthStart);
        prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
        const prevMonthEnd = new Date(monthEnd);
        prevMonthEnd.setMonth(prevMonthEnd.getMonth() - 1);
        
        const prevMonthInvoices = paidInvoices.filter((invoice: any) => {
          const invoiceDate = invoice.createdAt?.toDate?.() || new Date(invoice.createdAt);
          return invoiceDate >= prevMonthStart && invoiceDate <= prevMonthEnd;
        });
        
        const prevMonthRevenue = prevMonthInvoices.reduce((sum, inv: any) => sum + (inv.amount || 0), 0);
        const growth = prevMonthRevenue > 0 ? ((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0;
        
        revenueByMonth.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: monthRevenue,
          growth
        });
      }

      // Top clients by revenue
      const clientRevenue = new Map();
      const clientProjects = new Map();
      
      paidInvoices.forEach((invoice: any) => {
        const client = invoice.clientEmail || 'Unknown';
        clientRevenue.set(client, (clientRevenue.get(client) || 0) + (invoice.amount || 0));
      });
      
      allProjects.forEach((project: any) => {
        const client = project.clientEmail || 'Unknown';
        clientProjects.set(client, (clientProjects.get(client) || 0) + 1);
      });

      const topClients = Array.from(clientRevenue.entries())
        .map(([email, revenue]) => ({
          name: email.split('@')[0] || email,
          email,
          revenue,
          projects: clientProjects.get(email) || 0
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Upcoming deadlines
      const upcomingDeadlines = allProjects
        .filter((p: any) => p.deadline && ['in-progress', 'planning', 'review'].includes(p.status))
        .map((p: any) => ({
          ...p,
          deadlineDate: p.deadline?.toDate?.() || new Date(p.deadline)
        }))
        .filter((p: any) => p.deadlineDate > now)
        .sort((a: any, b: any) => a.deadlineDate - b.deadlineDate)
        .slice(0, 5);

      setData({
        totalRevenue,
        monthlyRevenue: recentRevenue,
        totalClients,
        activeClients,
        totalProjects,
        activeProjects,
        completedProjects,
        pendingInvoices,
        overdueInvoices,
        revenueGrowth,
        clientGrowth: 12.5, // Mock data for now
        projectGrowth,
        avgProjectValue: totalProjects > 0 ? totalRevenue / totalProjects : 0,
        conversionRate: 75.5, // Mock data
        clientSatisfaction: 94.2, // Mock data
        recentActivities: allActivities.slice(0, 10),
        topClients,
        projectsByStatus,
        revenueByMonth,
        upcomingDeadlines
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[var(--bg-4)] rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-[var(--bg-4)] rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-64 bg-[var(--bg-4)] rounded-2xl"></div>
            <div className="h-64 bg-[var(--bg-4)] rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="glass-light rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--txt-primary)] mb-2">Sign in to view your dashboard</h2>
          <p className="text-[var(--txt-secondary)] mb-6">We use your account to determine your organization access per Firestore rules.</p>
          <button
            onClick={() => openModal('signin')}
            className="px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors"
          >
            Sign in
          </button>
        </div>
        <div className="glass-light rounded-2xl p-6">
          <p className="text-sm text-[var(--txt-tertiary)]">Tip: After signing in, open “Setup Database” in the sidebar to seed sample data if this is a fresh project.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--txt-primary)]">
            Business Dashboard
          </h1>
          <p className="text-[var(--txt-secondary)] mt-1">
            Complete overview of your business operations
          </p>
        </div>
        
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 bg-[var(--bg-3)] border border-[var(--bg-4)] rounded-lg text-[var(--txt-primary)] focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <DashboardOverview data={data} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Management Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Client Management */}
        <Link href="/admin/clients" className="glass-light rounded-2xl p-6 hover:scale-[1.02] transition-transform group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl">
              👥
            </div>
            <span className="text-2xl font-bold text-[var(--txt-primary)]">
              {data?.totalClients || 0}
            </span>
          </div>
          <h3 className="font-semibold text-[var(--txt-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors">
            Client Management
          </h3>
          <p className="text-sm text-[var(--txt-secondary)] mb-3">
            Manage client relationships, profiles, and communication
          </p>
          <div className="text-xs text-[var(--txt-tertiary)]">
            {data?.activeClients || 0} active clients
          </div>
        </Link>

        {/* Project Management */}
        <Link href="/admin/projects" className="glass-light rounded-2xl p-6 hover:scale-[1.02] transition-transform group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-2xl">
              🚀
            </div>
            <span className="text-2xl font-bold text-[var(--txt-primary)]">
              {data?.totalProjects || 0}
            </span>
          </div>
          <h3 className="font-semibold text-[var(--txt-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors">
            Project Management
          </h3>
          <p className="text-sm text-[var(--txt-secondary)] mb-3">
            Track projects, timelines, and deliverables
          </p>
          <div className="text-xs text-[var(--txt-tertiary)]">
            {data?.activeProjects || 0} in progress
          </div>
        </Link>

        {/* Billing & Finance */}
        <Link href="/admin/billing" className="glass-light rounded-2xl p-6 hover:scale-[1.02] transition-transform group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl">
              💳
            </div>
            <span className="text-2xl font-bold text-[var(--txt-primary)]">
              ${((data?.totalRevenue || 0) / 100).toLocaleString()}
            </span>
          </div>
          <h3 className="font-semibold text-[var(--txt-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors">
            Billing & Finance
          </h3>
          <p className="text-sm text-[var(--txt-secondary)] mb-3">
            Manage invoices, payments, and subscriptions
          </p>
          <div className="text-xs text-[var(--txt-tertiary)]">
            {data?.pendingInvoices || 0} pending invoices
          </div>
        </Link>

        {/* Communication Center */}
        <Link href="/admin/communications" className="glass-light rounded-2xl p-6 hover:scale-[1.02] transition-transform group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl">
              💬
            </div>
            <span className="text-2xl font-bold text-[var(--txt-primary)]">
              {data?.recentActivities?.length || 0}
            </span>
          </div>
          <h3 className="font-semibold text-[var(--txt-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors">
            Communication Center
          </h3>
          <p className="text-sm text-[var(--txt-secondary)] mb-3">
            Messages, campaigns, and templates
          </p>
          <div className="text-xs text-[var(--txt-tertiary)]">
            Recent activity
          </div>
        </Link>
      </div>

      {/* Real-time Metrics */}
      <RealtimeMetrics data={data} />

      {/* Analytics & Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Advanced Analytics */}
        <Link href="/admin/analytics/revenue" className="glass-light rounded-2xl p-6 hover:scale-[1.02] transition-transform group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-2xl">
              📈
            </div>
            <div>
              <h3 className="font-semibold text-[var(--txt-primary)] group-hover:text-[var(--accent)] transition-colors">
                Advanced Analytics
              </h3>
              <p className="text-sm text-[var(--txt-secondary)]">
                Revenue forecasting & insights
              </p>
            </div>
          </div>
          <div className="text-xs text-[var(--txt-tertiary)]">
            Growth: {data?.revenueGrowth ? `${data.revenueGrowth.toFixed(1)}%` : '0%'}
          </div>
        </Link>

        {/* Reports & Exports */}
        <Link href="/admin/reports/financial" className="glass-light rounded-2xl p-6 hover:scale-[1.02] transition-transform group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-2xl">
              📋
            </div>
            <div>
              <h3 className="font-semibold text-[var(--txt-primary)] group-hover:text-[var(--accent)] transition-colors">
                Reports & Exports
              </h3>
              <p className="text-sm text-[var(--txt-secondary)]">
                Financial & business reports
              </p>
            </div>
          </div>
          <div className="text-xs text-[var(--txt-tertiary)]">
            Generate custom reports
          </div>
        </Link>

        {/* Business Automation */}
        <Link href="/admin/automation/workflows" className="glass-light rounded-2xl p-6 hover:scale-[1.02] transition-transform group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-2xl">
              ⚡
            </div>
            <div>
              <h3 className="font-semibold text-[var(--txt-primary)] group-hover:text-[var(--accent)] transition-colors">
                Business Automation
              </h3>
              <p className="text-sm text-[var(--txt-secondary)]">
                Workflows & integrations
              </p>
            </div>
          </div>
          <div className="text-xs text-[var(--txt-tertiary)]">
            Streamline operations
          </div>
        </Link>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Analytics - spans 2 columns */}
        <div className="lg:col-span-2">
          <RevenueAnalytics data={data?.revenueByMonth || []} />
        </div>
        
        {/* Client Overview */}
        <div>
          <ClientOverview clients={data?.topClients || []} />
        </div>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProjectStatus data={data?.projectsByStatus || {}} />
        <Performance data={data} />
      </div>

      {/* Recent Activity */}
      <RecentActivity 
        activities={data?.recentActivities || []}
        deadlines={data?.upcomingDeadlines || []}
      />
    </div>
  );
};

export default AdminDashboard;