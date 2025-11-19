'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const FirebaseInitializer = () => {
  const { user } = useAuthStore();
  const [initializing, setInitializing] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [claiming, setClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<string>('');
  const [adminStatus, setAdminStatus] = useState<{ available: boolean; projectId?: string | null }>({ available: false, projectId: null });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/status');
        const data = await res.json();
        setAdminStatus({ available: !!data.adminAvailable, projectId: data.projectId });
      } catch {
        setAdminStatus({ available: false, projectId: null });
      }
    };
    load();
  }, []);

  const grantSiteAdmin = async () => {
    if (!user) {
      setClaimStatus('Please sign in first.');
      return;
    }
    try {
      setClaiming(true);
      setClaimStatus('Granting site admin...');
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/bootstrap', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to grant admin');
      setClaimStatus('✅ Granted. Please sign out and sign back in to refresh your permissions.');
    } catch (e: any) {
      setClaimStatus(`❌ ${e.message}`);
    } finally {
      setClaiming(false);
    }
  };

  const initializeFirebaseData = async () => {
    if (!db || !user) {
      setStatus('Error: User not authenticated or Firebase not configured');
      return;
    }

    setInitializing(true);
    setStatus('Initializing Firebase collections...');

    try {
      // Create a sample organization
      const orgId = `org_${Date.now()}`;
      const orgRef = doc(db, 'orgs', orgId);
      
      await setDoc(orgRef, {
        name: 'Ownly Studio',
        slug: 'ownly-studio',
        description: 'Web development and design studio',
        primaryContact: {
          name: user.displayName || 'Admin User',
          email: user.email || ''
        },
        adminUids: [user.uid],
        editorUids: [],
        clientUids: [],
        subscription: {
          plan: 'professional',
          active: true,
          features: ['projects', 'billing', 'analytics'],
          billingEmail: user.email || '',
          setupTotal: 500000, // $5000 in cents
          monthlyTotal: 9900, // $99 in cents
          setupPaid: true,
          startDate: serverTimestamp()
        },
        settings: {
          timezone: 'America/New_York',
          currency: 'USD',
          allowClientUploads: true,
          enableNotifications: true
        },
        status: 'active',
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setStatus('Created organization... Adding sample projects...');

      // Create sample projects
      const projectsRef = collection(db, 'orgs', orgId, 'projects');
      
      const sampleProjects = [
        {
          name: 'E-commerce Website Redesign',
          clientName: 'TechCorp Solutions',
          clientEmail: 'contact@techcorp.com',
          status: 'in-progress',
          priority: 'high',
          progress: 65,
          budget: 1200000, // $12,000 in cents
          spent: 780000, // $7,800 in cents
          startDate: new Date('2024-10-01'),
          dueDate: new Date('2024-12-15'),
          description: 'Complete redesign of the e-commerce platform with modern UI/UX',
          teamMembers: [user.uid],
          tags: ['website', 'ecommerce', 'redesign'],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          name: 'Mobile App Development',
          clientName: 'StartupXYZ',
          clientEmail: 'founder@startupxyz.com',
          status: 'planning',
          priority: 'medium',
          progress: 15,
          budget: 2500000, // $25,000 in cents
          spent: 375000, // $3,750 in cents
          startDate: new Date('2024-11-01'),
          dueDate: new Date('2025-03-01'),
          description: 'Native mobile app for iOS and Android platforms',
          teamMembers: [user.uid],
          tags: ['mobile', 'app', 'development'],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          name: 'Brand Identity Package',
          clientName: 'Local Restaurant Group',
          clientEmail: 'marketing@restaurantgroup.com',
          status: 'completed',
          priority: 'low',
          progress: 100,
          budget: 500000, // $5,000 in cents
          spent: 485000, // $4,850 in cents
          startDate: new Date('2024-08-01'),
          dueDate: new Date('2024-09-30'),
          description: 'Complete brand identity including logo, colors, and style guide',
          teamMembers: [user.uid],
          tags: ['branding', 'design', 'identity'],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];

      for (const project of sampleProjects) {
        await addDoc(projectsRef, project);
      }

      setStatus('Created projects... Adding sample invoices...');

      // Create sample invoices
      const invoicesRef = collection(db, 'orgs', orgId, 'invoices');
      
      const sampleInvoices = [
        {
          clientName: 'TechCorp Solutions',
          clientEmail: 'contact@techcorp.com',
          amount: 780000, // $7,800 in cents
          status: 'paid',
          dueDate: new Date('2024-11-15'),
          paidAt: new Date('2024-11-10'),
          description: 'E-commerce Website Redesign - Progress Payment',
          items: [
            {
              description: 'UI/UX Design Phase',
              quantity: 1,
              rate: 350000,
              amount: 350000
            },
            {
              description: 'Frontend Development',
              quantity: 1,
              rate: 430000,
              amount: 430000
            }
          ],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          clientName: 'StartupXYZ',
          clientEmail: 'founder@startupxyz.com',
          amount: 375000, // $3,750 in cents
          status: 'sent',
          dueDate: new Date('2024-12-01'),
          description: 'Mobile App Development - Initial Payment',
          items: [
            {
              description: 'Project Planning & Architecture',
              quantity: 1,
              rate: 375000,
              amount: 375000
            }
          ],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          clientName: 'Local Restaurant Group',
          clientEmail: 'marketing@restaurantgroup.com',
          amount: 485000, // $4,850 in cents
          status: 'paid',
          dueDate: new Date('2024-09-30'),
          paidAt: new Date('2024-09-28'),
          description: 'Brand Identity Package - Final Payment',
          items: [
            {
              description: 'Complete Brand Identity Package',
              quantity: 1,
              rate: 485000,
              amount: 485000
            }
          ],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];

      for (const invoice of sampleInvoices) {
        await addDoc(invoicesRef, invoice);
      }

      setStatus('Created invoices... Adding sample activity logs...');

      // Create sample activity logs
      const activityRef = collection(db, 'orgs', orgId, 'activity');
      
      const sampleActivities = [
        {
          type: 'project_update',
          title: 'Project progress updated',
          description: 'E-commerce Website Redesign progress updated to 65%',
          timestamp: serverTimestamp(),
          userId: user.uid,
          userName: user.displayName || 'Admin User',
          visibleToClient: true,
          clientUids: ['contact@techcorp.com']
        },
        {
          type: 'invoice_sent',
          title: 'Invoice sent',
          description: 'Invoice sent to StartupXYZ for $3,750',
          timestamp: serverTimestamp(),
          userId: user.uid,
          userName: user.displayName || 'Admin User',
          visibleToClient: false,
          clientUids: []
        },
        {
          type: 'project_completed',
          title: 'Project completed',
          description: 'Brand Identity Package completed for Local Restaurant Group',
          timestamp: serverTimestamp(),
          userId: user.uid,
          userName: user.displayName || 'Admin User',
          visibleToClient: true,
          clientUids: ['marketing@restaurantgroup.com']
        }
      ];

      for (const activity of sampleActivities) {
        await addDoc(activityRef, activity);
      }

      setStatus('Created activity logs... Adding message templates...');

      // Create sample message templates
      const templatesRef = collection(db, 'orgs', orgId, 'templates');
      
      const sampleTemplates = [
        {
          name: 'Project Welcome',
          subject: 'Welcome to Your New Project!',
          content: 'Hi {{clientName}},\n\nWe\'re excited to start working on {{projectName}} with you! Our team is ready to deliver exceptional results.\n\nBest regards,\nThe Ownly Studio Team',
          type: 'email',
          category: 'welcome',
          variables: ['clientName', 'projectName'],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          name: 'Invoice Reminder',
          subject: 'Payment Reminder - Invoice {{invoiceNumber}}',
          content: 'Hi {{clientName}},\n\nThis is a friendly reminder that invoice {{invoiceNumber}} for ${{amount}} is due on {{dueDate}}.\n\nPlease let us know if you have any questions.\n\nThank you,\nOwnly Studio',
          type: 'email',
          category: 'invoice',
          variables: ['clientName', 'invoiceNumber', 'amount', 'dueDate'],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          name: 'Project Completion',
          subject: 'Your Project is Complete!',
          content: 'Hi {{clientName}},\n\nGreat news! We\'ve completed {{projectName}}. You can review the final deliverables in your client portal.\n\nThank you for choosing Ownly Studio!\n\nBest regards,\nThe Team',
          type: 'email',
          category: 'project',
          variables: ['clientName', 'projectName'],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];

      for (const template of sampleTemplates) {
        await addDoc(templatesRef, template);
      }

      setStatus(`✅ Successfully initialized Firebase data! Organization ID: ${orgId}`);
      
    } catch (error) {
      console.error('Error initializing Firebase data:', error);
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setInitializing(false);
    }
  };

  if (!user) {
    return (
      <div className="glass-light rounded-2xl p-8 text-center">
        <p className="text-[var(--txt-secondary)]">Please sign in to initialize Firebase data</p>
      </div>
    );
  }

  return (
    <div className="glass-light rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-[var(--txt-primary)] mb-4">
        Firebase Data Initializer
      </h2>
      <p className="text-[var(--txt-secondary)] mb-6">
        This will create sample data for your admin dashboard including organizations, projects, invoices, and templates.
      </p>

      <div className="mb-6 p-4 rounded-lg bg-[var(--bg-3)] border border-[var(--bg-4)]">
        <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
          <div>
            <p className="font-medium text-[var(--txt-primary)]">Site Admin Access</p>
            <p className="text-sm text-[var(--txt-secondary)]">Grant yourself site-wide admin (superadmin) via custom claims. Allowed for ownly.studio/aloft emails or ADMIN_EMAILS.</p>
            <div className="text-xs text-[var(--txt-tertiary)] mt-2">
              Server Admin SDK configured: {adminStatus.available ? (
                <span className="text-emerald-400">Yes</span>
              ) : (
                <span className="text-red-400">No</span>
              )}
              {adminStatus.projectId ? (
                <span className="ml-2 text-[var(--txt-secondary)]">(project: {adminStatus.projectId})</span>
              ) : null}
            </div>
            {claimStatus && (
              <p className="text-sm mt-2 text-[var(--txt-tertiary)]">{claimStatus}</p>
            )}
          </div>
          {adminStatus.available ? (
            <button
              onClick={grantSiteAdmin}
              disabled={claiming}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-50"
            >
              {claiming ? 'Granting…' : 'Grant me Site Admin'}
            </button>
          ) : (
            <div className="text-sm text-[var(--txt-tertiary)]">
              Admin SDK not configured. Site staff access is granted automatically for Ownly/Aloft emails.
            </div>
          )}
        </div>
      </div>
      
      {status && (
        <div className="mb-6 p-4 rounded-lg bg-[var(--bg-3)] border border-[var(--bg-4)]">
          <p className="text-sm text-[var(--txt-primary)]">{status}</p>
        </div>
      )}
      
      <button
        onClick={initializeFirebaseData}
        disabled={initializing}
        className="px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {initializing ? 'Initializing...' : 'Initialize Firebase Data'}
      </button>
      
      <div className="mt-4 text-sm text-[var(--txt-tertiary)]">
        <p>This will create:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>1 Organization with your user as admin</li>
          <li>3 Sample projects with different statuses</li>
          <li>3 Sample invoices with payment data</li>
          <li>3 Activity log entries</li>
          <li>3 Message templates</li>
        </ul>
      </div>
    </div>
  );
};

export default FirebaseInitializer;