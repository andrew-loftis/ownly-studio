'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Container from '@/components/Container';
import RevenueChart from './RevenueChart';
import StatCard from './StatCard';
import ProjectAnalytics from './ProjectAnalytics';
import ClientInsights from './ClientInsights';

interface DashboardData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalProjects: number;
  activeProjects: number;
  totalClients: number;
  activeClients: number;
  avgProjectValue: number;
  projectsByStatus: Record<string, number>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  topClients: Array<{ name: string; revenue: number; projects: number }>;
}

const AnalyticsDashboard = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user, timeRange]);

  const fetchAnalyticsData = async () => {
    if (!db || !user) return;

    try {
      setLoading(true);

      // Calculate date range
      const now = new Date();
      const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      // Fetch organizations where user is admin
      const orgsQuery = query(
        collection(db, 'organizations'),
        where('adminUids', 'array-contains', user.uid)
      );
      const orgsSnapshot = await getDocs(orgsQuery);
      const orgIds = orgsSnapshot.docs.map(doc => doc.id);

      if (orgIds.length === 0) {
        setData({
          totalRevenue: 0,
          monthlyRevenue: 0,
          totalProjects: 0,
          activeProjects: 0,
          totalClients: 0,
          activeClients: 0,
          avgProjectValue: 0,
          projectsByStatus: {},
          revenueByMonth: [],
          topClients: []
        });
        setLoading(false);
        return;
      }

      // Fetch projects for these organizations
      const projectsPromises = orgIds.map(orgId =>
        getDocs(query(
          collection(db!, 'organizations', orgId, 'projects'),
          orderBy('createdAt', 'desc')
        ))
      );
      const projectsSnapshots = await Promise.all(projectsPromises);
      
      // Fetch invoices for revenue data
      const invoicesPromises = orgIds.map(orgId =>
        getDocs(query(
          collection(db!, 'organizations', orgId, 'invoices'),
          where('status', '==', 'paid'),
          orderBy('createdAt', 'desc')
        ))
      );
      const invoicesSnapshots = await Promise.all(invoicesPromises);

      // Process data
      const allProjects = projectsSnapshots.flatMap(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      );
      
      const allInvoices = invoicesSnapshots.flatMap(snapshot => 
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      );

      // Calculate metrics
      const totalRevenue = allInvoices.reduce((sum, invoice: any) => sum + (invoice.amount || 0), 0);
      
      // Recent revenue (within time range)
      const recentInvoices = allInvoices.filter((invoice: any) => {
        const invoiceDate = invoice.createdAt?.toDate?.() || new Date(invoice.createdAt);
        return invoiceDate >= startDate;
      });
      const monthlyRevenue = recentInvoices.reduce((sum, invoice: any) => sum + (invoice.amount || 0), 0);

      const totalProjects = allProjects.length;
      const activeProjects = allProjects.filter((p: any) => 
        ['in-progress', 'planning', 'review'].includes(p.status)
      ).length;

      // Get unique clients
      const clientEmails = new Set(allProjects.map((p: any) => p.clientEmail).filter(Boolean));
      const totalClients = clientEmails.size;
      const activeClients = new Set(
        allProjects
          .filter((p: any) => ['in-progress', 'planning', 'review'].includes(p.status))
          .map((p: any) => p.clientEmail)
          .filter(Boolean)
      ).size;

      const avgProjectValue = totalProjects > 0 ? totalRevenue / totalProjects : 0;

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
        
        const monthInvoices = allInvoices.filter((invoice: any) => {
          const invoiceDate = invoice.createdAt?.toDate?.() || new Date(invoice.createdAt);
          return invoiceDate >= monthStart && invoiceDate <= monthEnd;
        });
        
        revenueByMonth.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: monthInvoices.reduce((sum, inv: any) => sum + (inv.amount || 0), 0)
        });
      }

      // Top clients by revenue
      const clientRevenue = new Map();
      const clientProjects = new Map();
      
      allInvoices.forEach((invoice: any) => {
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
          revenue,
          projects: clientProjects.get(email) || 0
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setData({
        totalRevenue,
        monthlyRevenue,
        totalProjects,
        activeProjects,
        totalClients,
        activeClients,
        avgProjectValue,
        projectsByStatus,
        revenueByMonth,
        topClients
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="glass-light rounded-2xl p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-[var(--bg-4)] rounded w-48"></div>
              <div className="h-8 bg-[var(--bg-4)] rounded w-32"></div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <h2 className="text-xl font-medium text-[var(--txt-primary)]">
            No analytics data available
          </h2>
          <p className="text-[var(--txt-secondary)] mt-2">
            Create some organizations and projects to see analytics
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--txt-primary)]">
            Analytics Dashboard
          </h1>
          <p className="text-[var(--txt-secondary)] mt-1">
            Business insights and performance metrics
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex bg-[var(--bg-2)] rounded-xl p-1">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--txt-secondary)] hover:text-[var(--txt-primary)]'
              }`}
            >
              {range === '1y' ? '1 Year' : range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${(data.totalRevenue / 100).toLocaleString()}`}
          icon="solar:wallet-money-bold-duotone"
          trend={data.monthlyRevenue > 0 ? 'up' : 'neutral'}
          trendValue={data.monthlyRevenue > 0 ? 
            `+$${(data.monthlyRevenue / 100).toLocaleString()} this period` : 
            'No revenue this period'
          }
          variant="success"
        />
        
        <StatCard
          title="Active Projects"
          value={data.activeProjects.toString()}
          icon="solar:case-round-minimalistic-bold-duotone"
          trend={data.activeProjects > 0 ? 'up' : 'neutral'}
          trendValue={`${data.totalProjects} total projects`}
          variant="primary"
        />
        
        <StatCard
          title="Active Clients"
          value={data.activeClients.toString()}
          icon="solar:users-group-two-rounded-bold-duotone"
          trend={data.activeClients > 0 ? 'up' : 'neutral'}
          trendValue={`${data.totalClients} total clients`}
          variant="info"
        />
        
        <StatCard
          title="Avg Project Value"
          value={`$${(data.avgProjectValue / 100).toLocaleString()}`}
          icon="solar:chart-2-bold-duotone"
          trend="neutral"
          trendValue="Based on completed projects"
          variant="warning"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <RevenueChart data={data.revenueByMonth} />
        
        {/* Project Analytics */}
        <ProjectAnalytics data={data.projectsByStatus} />
      </div>

      {/* Client Insights */}
      <ClientInsights clients={data.topClients} />
    </Container>
  );
};

export default AnalyticsDashboard;