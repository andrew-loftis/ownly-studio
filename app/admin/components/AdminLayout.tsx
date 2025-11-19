'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);

  // Temporarily allow access even when not signed in to avoid redirect loops
  // during environment setup. We'll re-enable an auth gate after verification.
  useEffect(() => {
    // If you want to force sign-in, uncomment below:
    // if (!loading && !user) {
    //   router.push('/account?tab=signin&redirect=/admin');
    // }
  }, [user, loading, router]);

  // Temporarily disable admin role checking - allow all authenticated users
  // useEffect(() => {
  //   if (user && !user.email?.includes('ownly') && !user.email?.includes('aloft')) {
  //     // Allow Ownly and Aloft email addresses for admin access
  //     router.push('/account');
  //   }
  // }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-1)] flex items-center justify-center">
        <div className="glass-light rounded-2xl p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-[var(--bg-4)] rounded w-48"></div>
            <div className="h-8 bg-[var(--bg-4)] rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  // Allow rendering when user is null (unauthenticated) so setup pages work.
  // You can show a soft banner in the TopBar if desired.

  return (
    <div className="admin-wrapper min-h-screen bg-[var(--bg-1)]">
      {/* Sidebar */}
      <AdminSidebar 
        collapsed={sidebarCollapsed}
        hidden={sidebarHidden}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onHide={() => setSidebarHidden(!sidebarHidden)}
      />
      
      {/* Main Content */}
      <div className={`admin-content transition-all duration-300 ${
        sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
      } ${sidebarHidden ? 'ml-0' : ''}`}>
        {/* Top Navigation */}
        <AdminTopBar 
          onToggleSidebar={() => setSidebarHidden(!sidebarHidden)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        {/* Page Content */}
        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={(typeof window !== 'undefined' ? window.location.pathname : 'admin')}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="will-change-transform"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {!sidebarHidden && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarHidden(true)}
        />
      )}
    </div>
  );
};

export default AdminLayout;