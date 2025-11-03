"use client";

import { useState } from "react";
import { User } from "firebase/auth";
import { Menu, Search, Bell, Settings, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AdminTopBarProps {
  user: User;
  userRole: 'admin' | 'editor' | 'client';
  orgId?: string;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export default function AdminTopBar({ 
  user, 
  userRole, 
  orgId, 
  sidebarOpen, 
  sidebarCollapsed, 
  onToggleSidebar 
}: AdminTopBarProps) {
  const signOut = useAuthStore((s) => s.signOut);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSignOut = async () => {
    await signOut();
    setProfileDropdownOpen(false);
  };

  return (
    <header className="h-16 bg-[var(--bg-2)] border-b border-white/10 flex items-center justify-between px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search bar */}
        <div className="hidden md:flex items-center gap-3 bg-[var(--bg-3)] rounded-lg px-3 py-2 min-w-[300px] border border-white/10">
          <Search className="w-4 h-4 text-[var(--txt-tertiary)]" />
          <input
            type="text"
            placeholder="Search projects, clients, files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-[var(--txt-primary)] placeholder-[var(--txt-tertiary)] outline-none flex-1"
          />
          <div className="text-xs text-[var(--txt-tertiary)] px-2 py-1 rounded bg-white/5 font-mono">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Mobile search toggle */}
        <button className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] hover:bg-white/5 transition-colors">
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] hover:bg-white/5 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {/* Notification badge */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-medium text-white">3</span>
            </div>
          </button>

          {/* Notifications dropdown */}
          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-80 bg-[var(--bg-3)] border border-white/10 rounded-lg shadow-lg z-50"
              >
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-sm font-semibold text-[var(--txt-primary)]">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {/* Sample notifications */}
                  <div className="p-3 hover:bg-white/5 transition-colors border-b border-white/5">
                    <div className="text-sm text-[var(--txt-primary)] font-medium">New project assigned</div>
                    <div className="text-xs text-[var(--txt-tertiary)] mt-1">Website redesign for Acme Corp</div>
                    <div className="text-xs text-[var(--txt-tertiary)] mt-1">2 minutes ago</div>
                  </div>
                  <div className="p-3 hover:bg-white/5 transition-colors border-b border-white/5">
                    <div className="text-sm text-[var(--txt-primary)] font-medium">Invoice payment received</div>
                    <div className="text-xs text-[var(--txt-tertiary)] mt-1">$5,000 from TechStart Inc</div>
                    <div className="text-xs text-[var(--txt-tertiary)] mt-1">1 hour ago</div>
                  </div>
                  <div className="p-3 hover:bg-white/5 transition-colors">
                    <div className="text-sm text-[var(--txt-primary)] font-medium">Client feedback received</div>
                    <div className="text-xs text-[var(--txt-tertiary)] mt-1">Comments on homepage design</div>
                    <div className="text-xs text-[var(--txt-tertiary)] mt-1">3 hours ago</div>
                  </div>
                </div>
                <div className="p-3 border-t border-white/10">
                  <button className="text-xs text-[var(--mint)] hover:text-[var(--cyan)] transition-colors">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings */}
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] hover:bg-white/5 transition-colors">
          <Settings className="w-4 h-4" />
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] flex items-center justify-center">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-black" />
              )}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium text-[var(--txt-primary)]">
                {user.displayName || user.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-xs text-[var(--txt-tertiary)] capitalize">
                {userRole}
              </div>
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Profile dropdown menu */}
          <AnimatePresence>
            {profileDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-64 bg-[var(--bg-3)] border border-white/10 rounded-lg shadow-lg z-50"
              >
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] flex items-center justify-center">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName || 'User'} 
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        <UserIcon className="w-5 h-5 text-black" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--txt-primary)]">
                        {user.displayName || 'User'}
                      </div>
                      <div className="text-xs text-[var(--txt-tertiary)]">
                        {user.email}
                      </div>
                      <div className="text-xs text-[var(--mint)] capitalize font-medium">
                        {userRole}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] hover:bg-white/5 transition-colors">
                    <UserIcon className="w-4 h-4" />
                    Profile Settings
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] hover:bg-white/5 transition-colors">
                    <Settings className="w-4 h-4" />
                    Preferences
                  </button>
                </div>

                <div className="p-2 border-t border-white/10">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click outside handlers */}
      {(profileDropdownOpen || notificationsOpen) && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => {
            setProfileDropdownOpen(false);
            setNotificationsOpen(false);
          }}
        />
      )}
    </header>
  );
}