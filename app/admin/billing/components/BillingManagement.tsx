'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { fetchJsonWithAuth } from '@/lib/utils';
import Link from 'next/link';

interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  createdAt: Date;
  paidAt?: Date;
  description: string;
  items: {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
}

interface Subscription {
  id: string;
  clientName: string;
  clientEmail: string;
  plan: string;
  amount: number;
  interval: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
}

const BillingManagement = () => {
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'invoices' | 'subscriptions' | 'analytics'>('invoices');
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue'>('all');

  useEffect(() => {
    if (user) {
      fetchBillingData();
    }
  }, [user]);

  const fetchBillingData = async () => {
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
        setInvoices([]);
        setSubscriptions([]);
        setLoading(false);
        return;
      }

      // Fetch invoices via existing API and subscriptions via new API
      const [invoicesData, subscriptionsResponse] = await Promise.all([
        Promise.all(orgIds.map(orgId =>
          getDocs(query(
            collection(db!, 'orgs', orgId, 'invoices'),
            orderBy('createdAt', 'desc')
          ))
        )),
        fetchJsonWithAuth<{ subscriptions: any[] }>('/api/admin/subscriptions')
      ]);

      const allInvoices = invoicesData.flatMap(snapshot =>
        snapshot.docs.map(doc => ({
          id: doc.id,
          clientName: doc.data().clientName || doc.data().clientEmail?.split('@')[0] || 'Unknown',
          clientEmail: doc.data().clientEmail || '',
          amount: doc.data().amount || 0,
          status: doc.data().status || 'draft',
          dueDate: doc.data().dueDate?.toDate?.() || new Date(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          paidAt: doc.data().paidAt?.toDate?.(),
          description: doc.data().description || '',
          items: doc.data().items || []
        }))
      );

      const allSubscriptions = subscriptionsResponse.subscriptions.map((sub: any) => ({
        id: sub.id,
        clientName: sub.plan || 'Unknown Plan',
        clientEmail: sub.customerId || '',
        plan: sub.plan || '',
        amount: sub.amount || 0,
        interval: sub.interval || 'monthly',
        status: sub.status || 'active',
        currentPeriodStart: new Date(sub.currentPeriodStart),
        currentPeriodEnd: new Date(sub.currentPeriodEnd),
        createdAt: new Date(sub.createdAt)
      }));

      setInvoices(allInvoices);
      setSubscriptions(allSubscriptions);

    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `$${(amount / 100).toLocaleString()}`;
  const formatDate = (date: Date) => date.toLocaleDateString();

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-400 bg-gray-500/10';
      case 'sent': return 'text-blue-400 bg-blue-500/10';
      case 'paid': return 'text-green-400 bg-green-500/10';
      case 'overdue': return 'text-red-400 bg-red-500/10';
      case 'cancelled': return 'text-gray-400 bg-gray-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/10';
      case 'cancelled': return 'text-gray-400 bg-gray-500/10';
      case 'past_due': return 'text-amber-400 bg-amber-500/10';
      case 'unpaid': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const pendingRevenue = invoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((sum, i) => sum + i.amount, 0);
  const monthlyRecurring = subscriptions.filter(s => s.status === 'active' && s.interval === 'monthly').reduce((sum, s) => sum + s.amount, 0);
  const yearlyRecurring = subscriptions.filter(s => s.status === 'active' && s.interval === 'yearly').reduce((sum, s) => sum + s.amount, 0);

  const filteredInvoices = invoices.filter(invoice => 
    invoiceFilter === 'all' || invoice.status === invoiceFilter
  );

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
            Billing & Finance
          </h1>
          <p className="text-[var(--txt-secondary)] mt-1">
            Manage invoices, subscriptions, and financial reporting
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/billing/create-invoice"
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors"
          >
            Create Invoice
          </Link>
          <Link
            href="/admin/billing/reports"
            className="px-4 py-2 border border-[var(--bg-4)] text-[var(--txt-secondary)] rounded-lg font-medium hover:text-[var(--txt-primary)] hover:border-[var(--bg-3)] transition-colors"
          >
            Reports
          </Link>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-light rounded-2xl p-6">
          <div className="text-2xl font-bold text-green-400">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-sm text-[var(--txt-secondary)]">Total Revenue</div>
        </div>
        <div className="glass-light rounded-2xl p-6">
          <div className="text-2xl font-bold text-amber-400">
            {formatCurrency(pendingRevenue)}
          </div>
          <div className="text-sm text-[var(--txt-secondary)]">Pending Revenue</div>
        </div>
        <div className="glass-light rounded-2xl p-6">
          <div className="text-2xl font-bold text-blue-400">
            {formatCurrency(monthlyRecurring)}
          </div>
          <div className="text-sm text-[var(--txt-secondary)]">Monthly Recurring</div>
        </div>
        <div className="glass-light rounded-2xl p-6">
          <div className="text-2xl font-bold text-purple-400">
            {formatCurrency(yearlyRecurring)}
          </div>
          <div className="text-sm text-[var(--txt-secondary)]">Yearly Recurring</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-light rounded-2xl p-6">
        <div className="flex bg-[var(--bg-2)] rounded-lg p-1 w-fit">
          {(['invoices', 'subscriptions', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--txt-secondary)] hover:text-[var(--txt-primary)]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          {/* Invoice Filters */}
          <div className="glass-light rounded-2xl p-6">
            <div className="flex bg-[var(--bg-2)] rounded-lg p-1 w-fit">
              {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setInvoiceFilter(status)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    invoiceFilter === status
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--txt-secondary)] hover:text-[var(--txt-primary)]'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Invoices List */}
          <div className="glass-light rounded-2xl overflow-hidden">
            {filteredInvoices.length === 0 ? (
              <div className="p-8 text-center text-[var(--txt-tertiary)]">
                No invoices found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--bg-2)] border-b border-[var(--bg-4)]">
                    <tr>
                      <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Invoice #</th>
                      <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Client</th>
                      <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Amount</th>
                      <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Status</th>
                      <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Due Date</th>
                      <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice, index) => (
                      <tr 
                        key={invoice.id} 
                        className={`border-b border-[var(--bg-4)] hover:bg-[var(--bg-2)] transition-colors ${
                          index % 2 === 0 ? 'bg-[var(--bg-1)]' : 'bg-[var(--bg-2)]'
                        }`}
                      >
                        <td className="p-4">
                          <div className="font-mono text-sm text-[var(--txt-primary)]">
                            #{invoice.id.slice(-8).toUpperCase()}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-[var(--txt-primary)]">{invoice.clientName}</div>
                          <div className="text-sm text-[var(--txt-secondary)]">{invoice.clientEmail}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-[var(--txt-primary)]">
                            {formatCurrency(invoice.amount)}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInvoiceStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className={`text-sm ${invoice.status === 'overdue' ? 'text-red-400' : 'text-[var(--txt-secondary)]'}`}>
                            {formatDate(invoice.dueDate)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/billing/invoices/${invoice.id}`}
                              className="px-3 py-1 text-xs rounded bg-[var(--bg-3)] text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] transition-colors"
                            >
                              View
                            </Link>
                            <Link
                              href={`/admin/billing/invoices/${invoice.id}/edit`}
                              className="px-3 py-1 text-xs rounded bg-[var(--bg-3)] text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] transition-colors"
                            >
                              Edit
                            </Link>
                            <button className="px-3 py-1 text-xs rounded bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors">
                              Send
                            </button>
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
      )}

      {activeTab === 'subscriptions' && (
        <div className="glass-light rounded-2xl overflow-hidden">
          {subscriptions.length === 0 ? (
            <div className="p-8 text-center text-[var(--txt-tertiary)]">
              No subscriptions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--bg-2)] border-b border-[var(--bg-4)]">
                  <tr>
                    <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Client</th>
                    <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Plan</th>
                    <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Amount</th>
                    <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Billing</th>
                    <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Status</th>
                    <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Next Billing</th>
                    <th className="text-left p-4 font-medium text-[var(--txt-secondary)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((subscription, index) => (
                    <tr 
                      key={subscription.id} 
                      className={`border-b border-[var(--bg-4)] hover:bg-[var(--bg-2)] transition-colors ${
                        index % 2 === 0 ? 'bg-[var(--bg-1)]' : 'bg-[var(--bg-2)]'
                      }`}
                    >
                      <td className="p-4">
                        <div className="text-[var(--txt-primary)]">{subscription.clientName}</div>
                        <div className="text-sm text-[var(--txt-secondary)]">{subscription.clientEmail}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-[var(--txt-primary)]">
                          {subscription.plan}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-[var(--txt-primary)]">
                          {formatCurrency(subscription.amount)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-[var(--txt-secondary)]">
                          {subscription.interval.charAt(0).toUpperCase() + subscription.interval.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubscriptionStatusColor(subscription.status)}`}>
                          {subscription.status.replace('_', ' ').charAt(0).toUpperCase() + subscription.status.replace('_', ' ').slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-[var(--txt-secondary)]">
                          {formatDate(subscription.currentPeriodEnd)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/billing/subscriptions/${subscription.id}`}
                            className="px-3 py-1 text-xs rounded bg-[var(--bg-3)] text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] transition-colors"
                          >
                            Manage
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
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart Placeholder */}
          <div className="glass-light rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">
              Revenue Trends
            </h3>
            <div className="h-64 bg-[var(--bg-2)] rounded-lg flex items-center justify-center text-[var(--txt-tertiary)]">
              Revenue chart placeholder
            </div>
          </div>

          {/* Payment Methods */}
          <div className="glass-light rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">
              Payment Analytics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[var(--txt-secondary)]">Paid Invoices</span>
                <span className="font-medium text-[var(--txt-primary)]">
                  {invoices.filter(i => i.status === 'paid').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--txt-secondary)]">Overdue Invoices</span>
                <span className="font-medium text-red-400">
                  {invoices.filter(i => i.status === 'overdue').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--txt-secondary)]">Active Subscriptions</span>
                <span className="font-medium text-green-400">
                  {subscriptions.filter(s => s.status === 'active').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--txt-secondary)]">Average Invoice</span>
                <span className="font-medium text-[var(--txt-primary)]">
                  {formatCurrency(invoices.length > 0 ? invoices.reduce((sum, i) => sum + i.amount, 0) / invoices.length : 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManagement;