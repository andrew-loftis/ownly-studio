"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/lib/authStore";
import Button from "@/components/ui/Button";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, CreditCard, Activity, HelpCircle, Plus, TrendingUp } from "lucide-react";
import PlanBadge from "@/components/premium/PlanBadge";
import BuildCard from "@/components/premium/BuildCard";
import ActivityTimeline from "@/components/premium/ActivityTimeline";
import SupportStrip from "@/components/premium/SupportStrip";
import { type Features } from "@/lib/pricing";

// Mock data for demonstration
const mockBuilds = [
  {
    id: "1",
    name: "E-commerce Platform",
    status: "in-progress" as const,
    features: {
      website: true,
      webapp: true,
      payments: true,
      cms: true,
      ai: false,
      automations: false,
      email: true
    } as Features,
    createdAt: new Date(2024, 0, 15),
    estimatedCompletion: new Date(2024, 1, 28)
  },
  {
    id: "2", 
    name: "Portfolio Website",
    status: "completed" as const,
    features: {
      website: true,
      webapp: false,
      payments: false,
      cms: true,
      ai: false,
      automations: false,
      email: true
    } as Features,
    createdAt: new Date(2023, 11, 5),
    previewUrl: "https://portfolio.example.com"
  }
];

const mockActivities = [
  {
    id: "1",
    type: "build_started" as const,
    title: "E-commerce build started",
    description: "Development has begun on your e-commerce platform with premium glass aesthetic",
    timestamp: new Date(2024, 0, 20, 14, 30)
  },
  {
    id: "2",
    type: "message_received" as const,
    title: "Message from your developer",
    description: "Design mockups are ready for review. Check your email for the preview link.",
    timestamp: new Date(2024, 0, 18, 10, 15)
  },
  {
    id: "3",
    type: "payment_processed" as const,
    title: "Payment processed",
    description: "Your subscription has been renewed successfully",
    timestamp: new Date(2024, 0, 15, 9, 0)
  },
  {
    id: "4",
    type: "build_completed" as const,
    title: "Portfolio website completed",
    description: "Your portfolio website is now live with premium animations and glass aesthetic",
    timestamp: new Date(2023, 11, 28, 16, 45)
  }
];

export default function AccountClient() {
  const { user, openModal } = useAuthStore();
  const [lastConfig, setLastConfig] = useState<any>(null);
  const [subActive, setSubActive] = useState<boolean | null>(null);
  const [thankYou, setThankYou] = useState(false);

  useEffect(() => {
    if (!user) openModal("signin");
  }, [user, openModal]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("lastConfiguration");
        if (raw) setLastConfig(JSON.parse(raw));
      } catch {}
    }
  }, []);

  // Detect checkout success param using window.location (safe in client-only component)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const status = params.get("checkout");
    if (status === "success") setThankYou(true);
  }, []);

  // Load subscription status from Firestore
  useEffect(() => {
    const load = async () => {
      if (!user || !db) return;
      try {
        const ref = doc(db, "subscriptions", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as any;
          setSubActive(Boolean(data.subscriptionActive));
        } else {
          setSubActive(false);
        }
      } catch {
        setSubActive(null);
      }
    };
    load();
  }, [user]);

  const currentPlan = subActive ? "pro" : "free";

  const handleContactSupport = () => {
    // Open support chat or modal
    window.open("mailto:support@ownly.studio", "_blank");
  };

  const handleScheduleCall = () => {
    // Open calendar booking
    window.open("https://calendly.com/ownly-studio", "_blank");
  };

  const handleEmailSupport = () => {
    window.open("mailto:support@ownly.studio", "_blank");
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center text-[var(--muted)]">Sign in to view your account.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Success Message */}
        <AnimatePresence>
          {thankYou && (
            <motion.section
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-strong rounded-2xl p-6 bg-gradient-to-r from-green-500/10 to-[var(--mint)]/10 border border-green-500/20"
            >
              <h2 className="text-xl font-semibold text-[var(--txt)] mb-1">Thank you — you're all set</h2>
              <p className="text-[var(--muted)]">We've activated your subscription and recorded your setup. You'll receive a confirmation email shortly.</p>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Header Section */}
        <section className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--txt)] mb-2">Account Dashboard</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <User className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <PlanBadge plan={currentPlan} isActive={true} />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Build
            </Button>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--mint)] to-[var(--cyan)] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--txt)]">{mockBuilds.length}</div>
                <div className="text-sm text-[var(--muted)]">Active Projects</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--txt)]">{mockActivities.length}</div>
                <div className="text-sm text-[var(--muted)]">Recent Updates</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-[var(--mint)] flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--txt)]">
                  {subActive === null ? "..." : subActive ? "Active" : "Inactive"}
                </div>
                <div className="text-sm text-[var(--muted)]">Subscription</div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Builds */}
          <div className="lg:col-span-2 space-y-6">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[var(--txt)]">Your Builds</h2>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              
              <div className="space-y-4">
                {mockBuilds.map((build, index) => (
                  <motion.div
                    key={build.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <BuildCard
                      build={build}
                      onViewDetails={(id) => console.log("View details:", id)}
                      onViewPreview={(url) => window.open(url, "_blank")}
                    />
                  </motion.div>
                ))}
              </div>

              {mockBuilds.length === 0 && (
                <div className="text-center py-12 glass rounded-2xl">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-6 h-6 text-[var(--muted)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--txt)] mb-2">No builds yet</h3>
                  <p className="text-[var(--muted)] mb-4">Start your first project to see it here</p>
                  <Button variant="primary">
                    Create New Build
                  </Button>
                </div>
              )}
            </section>

            {/* Last Configuration */}
            {lastConfig && (
              <section className="glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-[var(--txt)] mb-4">Last Configuration</h2>
                <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                  <pre className="text-xs text-[var(--muted)] overflow-auto">
{JSON.stringify(lastConfig, null, 2)}
                  </pre>
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Activity & Support */}
          <div className="space-y-6">
            {/* Activity Timeline */}
            <section className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[var(--txt)]">Recent Activity</h2>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              
              <ActivityTimeline activities={mockActivities} maxItems={5} />
            </section>

            {/* Billing Section */}
            <section className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-[var(--txt)] mb-4">Billing & Usage</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Plan</span>
                  <PlanBadge plan={currentPlan} isActive={true} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Status</span>
                  <span className="text-[var(--txt)]">
                    {subActive === null ? "Loading..." : subActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <Button variant="ghost" className="w-full">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Billing
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Support Strip */}
        <SupportStrip
          onContactSupport={handleContactSupport}
          onScheduleCall={handleScheduleCall}
          onEmailSupport={handleEmailSupport}
        />
      </div>
    </div>
  );
}