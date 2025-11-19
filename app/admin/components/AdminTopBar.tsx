'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/authStore';
import Link from 'next/link';

interface AdminTopBarProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  onToggleCollapse: () => void;
}

const AdminTopBar = ({ onToggleSidebar, sidebarCollapsed, onToggleCollapse }: AdminTopBarProps) => {
  const { user, signOut } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'New client registration', time: '5 min ago', type: 'info' },
    { id: 2, title: 'Payment received', time: '15 min ago', type: 'success' },
    { id: 3, title: 'Project deadline approaching', time: '1 hour ago', type: 'warning' },
  ];

  return (
    <header className="h-16 bg-[var(--bg-2)]/90 backdrop-blur-xl border-b border-[var(--bg-4)] flex items-center justify-between px-6 relative">
      {/* Accent underline */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/60 to-transparent"></div>
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] hover:bg-[var(--bg-3)] transition-colors"
        >
          <span className="text-lg">☰</span>
        </button>
        
        <button
          onClick={onToggleCollapse}
          className="hidden md:block p-2 rounded-lg text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] hover:bg-[var(--bg-3)] transition-colors"
        >
          <span className="text-lg">{sidebarCollapsed ? '→' : '←'}</span>
        </button>

        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--cyan)] drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
            Admin Dashboard
          </h1>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Quick Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <Link
            href="/admin/projects"
            className="px-3 py-1.5 text-sm rounded-lg bg-[var(--bg-3)] text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] transition-colors"
          >
            Projects
          </Link>
          <Link
            href="/admin/clients"
            className="px-3 py-1.5 text-sm rounded-lg bg-[var(--bg-3)] text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] transition-colors"
          >
            Clients
          </Link>
          <Link
            href="/admin/billing/invoices"
            className="px-3 py-1.5 text-sm rounded-lg bg-[var(--bg-3)] text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] transition-colors"
          >
            Invoices
          </Link>
        </div>

        {/* Search */}
        <div className="hidden md:block relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-64 px-4 py-2 pl-10 bg-[var(--bg-3)] border border-[var(--bg-4)] rounded-lg text-[var(--txt-primary)] placeholder-[var(--txt-tertiary)] focus:outline-none focus:border-[var(--accent)]"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--txt-tertiary)]">
            🔍
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] hover:bg-[var(--bg-3)] transition-colors"
          >
            <span className="text-lg">🔔</span>
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--bg-2)] border border-[var(--bg-4)] rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-[var(--bg-4)]">
                <h3 className="font-semibold text-[var(--txt-primary)]">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map(notification => (
                  <div key={notification.id} className="p-4 border-b border-[var(--bg-4)] hover:bg-[var(--bg-3)] transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">
                        {notification.type === 'info' ? 'ℹ️' : 
                         notification.type === 'success' ? '✅' : '⚠️'}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--txt-primary)]">
                          {notification.title}
                        </p>
                        <p className="text-xs text-[var(--txt-tertiary)] mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4">
                <Link
                  href="/admin/notifications"
                  className="block text-center text-sm text-[var(--accent)] hover:underline"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 rounded-lg text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] hover:bg-[var(--bg-3)] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/60 flex items-center justify-center text-white font-semibold text-sm">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </div>
            <span className="hidden sm:block text-sm font-medium">
              {user?.displayName || user?.email?.split('@')[0] || 'Admin'}
            </span>
            <span className="text-xs">▼</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-2)] border border-[var(--bg-4)] rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-[var(--bg-4)]">
                <p className="font-medium text-[var(--txt-primary)]">
                  {user?.displayName || 'Admin User'}
                </p>
                <p className="text-xs text-[var(--txt-tertiary)]">
                  {user?.email}
                </p>
              </div>
              <div className="py-2">
                <Link
                  href="/admin/settings/general"
                  className="block px-4 py-2 text-sm text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] hover:bg-[var(--bg-3)] transition-colors"
                >
                  Settings
                </Link>
                <Link
                  href="/admin/profile"
                  className="block px-4 py-2 text-sm text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] hover:bg-[var(--bg-3)] transition-colors"
                >
                  Profile
                </Link>
                <Link
                  href="/admin/help"
                  className="block px-4 py-2 text-sm text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] hover:bg-[var(--bg-3)] transition-colors"
                >
                  Help & Support
                </Link>
                <div className="border-t border-[var(--bg-4)] mt-2 pt-2">
                  <button
                    onClick={signOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-[var(--bg-3)] transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default AdminTopBar;