"use client";

import { ReactNode, useState, useEffect } from "react";
import { useAuthStore } from "@/lib/authStore";
import { getUserOrgRole } from "@/lib/roles";
import AdminSidebar from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";
import AdminMobileNav from "./AdminMobileNav";
import { AnimatePresence, motion } from "framer-motion";

interface AdminLayoutProps {
  children: ReactNode;
  orgId?: string; // If user is working within a specific org context
}

export default function AdminLayout({ children, orgId }: AdminLayoutProps) {
  const user = useAuthStore((s) => s.user);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'editor' | 'client' | null>(null);
  const [loading, setLoading] = useState(true);

  // Check user role for menu filtering
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        if (orgId) {
          // Get role for specific org
          const role = await getUserOrgRole(user.uid, orgId);
          setUserRole(role);
        } else {
          // Default to admin role for site-wide admin (Owen)
          // You can expand this logic based on your needs
          setUserRole('admin');
        }
      } catch (error) {
        console.error("Failed to check user role:", error);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user, orgId]);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
        setSidebarCollapsed(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-1)] flex items-center justify-center">
        <div className="text-[var(--txt-secondary)]">Loading admin interface...</div>
      </div>
    );
  }

  if (!user || !userRole) {
    return (
      <div className="min-h-screen bg-[var(--bg-1)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-[var(--txt-primary)] text-xl font-semibold">Access Denied</div>
          <div className="text-[var(--txt-secondary)]">You don't have permission to access this area.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-1)] flex">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed lg:relative z-40 h-full"
          >
            <AdminSidebar
              userRole={userRole}
              orgId={orgId}
              collapsed={sidebarCollapsed}
              onToggleCollapse={toggleSidebarCollapse}
              onClose={() => setSidebarOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navigation */}
        <AdminTopBar
          user={user}
          userRole={userRole}
          orgId={orgId}
          sidebarOpen={sidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>

        {/* Mobile navigation for small screens */}
        <div className="lg:hidden">
          <AdminMobileNav userRole={userRole} orgId={orgId} />
        </div>
      </div>
    </div>
  );
}