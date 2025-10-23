"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { create } from "zustand";
import { z } from "zod";
import { FEATURE_LABELS, BASE_PRICES, price, formatUSD, type FeatureKey, type Features } from "@/lib/pricing";
import { Mail, Globe, Bot, Zap, CreditCard, PanelsTopLeft, FileText, LayoutDashboard } from "lucide-react";
import Button from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/authStore";

const schema = z.object({
  features: z.array(z.enum(["website", "webapp", "ai", "automations", "payments", "cms", "email"]))
});

type FormValues = z.infer<typeof schema>;

type BuildState = {
  selected: FeatureKey[];
  setSelected: (s: FeatureKey[]) => void;
  toggle: (k: FeatureKey) => void;
};

const useBuildStore = create<BuildState>((set, get) => ({
  selected: [],
  setSelected: (s) => set({ selected: s }),
  toggle: (k) => {
    const cur = get().selected;
    const next = cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k];
    set({ selected: next });
  },
}));

const options: { key: FeatureKey; icon: React.ReactNode }[] = [
  { key: "website", icon: <Globe className="w-5 h-5" /> },
  { key: "webapp", icon: <LayoutDashboard className="w-5 h-5" /> },
  { key: "ai", icon: <Bot className="w-5 h-5" /> },
  { key: "automations", icon: <Zap className="w-5 h-5" /> },
  { key: "payments", icon: <CreditCard className="w-5 h-5" /> },
  { key: "cms", icon: <FileText className="w-5 h-5" /> },
  { key: "email", icon: <Mail className="w-5 h-5" /> },
];

export default function BuildPage() {
  const { selected, setSelected, toggle } = useBuildStore();
  const { user, openModal } = useAuthStore();
  const [aiPreview, setAiPreview] = useState<{ before: string; after: string } | null>(null);

  const { watch, setValue } = useForm<FormValues>({
    defaultValues: { features: [] },
    mode: "onChange",
  });

  // Sync RHF -> store
  const features = watch("features");
  useEffect(() => {
    setSelected(features as FeatureKey[]);
    // persist last configuration for /account
    try {
      const obj: Features = {
        website: (features as FeatureKey[]).includes("website"),
        webapp: (features as FeatureKey[]).includes("webapp"),
        ai: (features as FeatureKey[]).includes("ai"),
        automations: (features as FeatureKey[]).includes("automations"),
        payments: (features as FeatureKey[]).includes("payments"),
        cms: (features as FeatureKey[]).includes("cms"),
        email: (features as FeatureKey[]).includes("email"),
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("lastConfiguration", JSON.stringify(obj));
      }
    } catch {}
  }, [features, setSelected]);

  // Ensure store -> RHF when toggling via card clicks
  const onToggle = async (k: FeatureKey) => {
    const next = selected.includes(k)
      ? selected.filter((x) => x !== k)
      : [...selected, k];
    setValue("features", next as any, { shouldTouch: true, shouldDirty: true, shouldValidate: false });
    toggle(k);

    if (k === "ai" && !selected.includes("ai")) {
      try {
        const res = await fetch("/api/ai/polish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: "This is a sample sentence to polish." }),
        });
        const data = await res.json();
        if (res.ok && data.polished) {
          setAiPreview({ before: "This is a sample sentence to polish.", after: data.polished });
        }
      } catch (err) {
        console.error("Failed to fetch AI polish preview", err);
      }
    } else if (k === "ai" && selected.includes("ai")) {
      setAiPreview(null);
    }
  };

  const featuresObj: Features = {
    website: selected.includes("website"),
    webapp: selected.includes("webapp"),
    ai: selected.includes("ai"),
    automations: selected.includes("automations"),
    payments: selected.includes("payments"),
    cms: selected.includes("cms"),
    email: selected.includes("email"),
  };
  const quote = price(featuresObj);

  return (
    <main className="flex-1 px-4 py-8">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
        {/* Left: Options */}
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-[var(--txt)]">Pick what you need. Watch it come alive.</h1>
          <div className="grid sm:grid-cols-2 gap-4">
            {options.map(({ key, icon }) => {
              const active = selected.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onToggle(key)}
                  className={
                    "tactile p-4 rounded-xl text-left flex items-center gap-3 transition-transform hover:-translate-y-0.5 " +
                    (active ? "ring-1 ring-white/20 bg-white/5" : "bg-transparent")
                  }
                >
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--mint)] to-[var(--cyan)] text-black">
                    {icon}
                  </span>
                  <div>
                    <div className="text-[var(--txt)] font-semibold">{FEATURE_LABELS[key]}</div>
                    <div className="text-[var(--muted)] text-sm">
                      {formatUSD(BASE_PRICES[key].setup)} setup · {formatUSD(BASE_PRICES[key].monthly)}/mo
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right: Preview + Estimate */}
        <section className="relative">
          <div className="space-y-6">
            {/* Live Preview Panel */}
            <div className="glass-strong rounded-2xl p-6 min-h-[320px]">
              <h2 className="text-lg font-semibold text-[var(--txt)] mb-4">Preview</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <AnimatePresence>
                  {selected.includes("email") && (
                    <motion.div
                      key="email"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="glass rounded-xl p-4"
                    >
                      <div className="text-[var(--muted)] text-xs mb-2">Custom Email</div>
                      <div className="bg-black/30 rounded-md p-3 border border-white/10">
                        <div className="h-2 w-24 bg-white/20 rounded mb-2" />
                        <TypingLine />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {selected.includes("ai") && aiPreview && (
                    <motion.div
                      key="ai-preview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="glass rounded-xl p-4"
                    >
                      <div className="text-[var(--muted)] text-xs mb-2">AI Polish</div>
                      <div className="bg-black/30 rounded-md p-3 border border-white/10">
                        <div className="text-[var(--txt)] text-sm mb-2">Before: {aiPreview.before}</div>
                        <div className="text-[var(--txt)] text-sm">After: {aiPreview.after}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {selected.includes("payments") && (
                    <motion.div key="pay" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass rounded-xl p-4">
                      <div className="text-[var(--muted)] text-xs mb-2">Checkout</div>
                      <div className="bg-black/30 rounded-md p-3 border border-white/10 space-y-2">
                        <div className="h-8 bg-white/10 rounded" />
                        <div className="h-8 bg-white/10 rounded w-3/4" />
                        <div className="h-10 bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] rounded" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {selected.includes("webapp") && (
                    <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass rounded-xl p-4">
                      <div className="text-[var(--muted)] text-xs mb-2">Dashboard</div>
                      <DashboardWidgets />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {selected.includes("website") && (
                    <motion.div key="site" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass rounded-xl p-4">
                      <div className="text-[var(--muted)] text-xs mb-2">Marketing Page</div>
                      <div className="space-y-2">
                        <div className="h-8 bg-white/10 rounded w-3/5" />
                        <div className="h-4 bg-white/10 rounded" />
                        <div className="h-4 bg-white/10 rounded w-4/5" />
                        <div className="h-10 bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] rounded w-40" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {selected.includes("automations") && (
                    <motion.div key="auto" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass rounded-xl p-4">
                      <div className="text-[var(--muted)] text-xs mb-2">Automation</div>
                      <div className="relative h-24 overflow-hidden rounded bg-black/30 border border-white/10">
                        <motion.div className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)]" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ repeat: Infinity, duration: 2 }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {selected.includes("cms") && (
                    <motion.div key="cms" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass rounded-xl p-4">
                      <div className="text-[var(--muted)] text-xs mb-2">CMS</div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-16 bg-white/10 rounded" />
                        <div className="h-16 bg-white/10 rounded" />
                        <div className="h-16 bg-white/10 rounded" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Sticky Estimate */}
            <div className="lg:sticky lg:top-4 lg:self-start">
              <div className="glass-strong rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-[var(--txt)] mb-4">Estimate</h2>
                <div className="flex items-center justify-between text-[var(--muted)] mb-2">
                  <span>One-time</span>
                  <span className="text-[var(--txt)] font-semibold">{formatUSD(quote.setup)}</span>
                </div>
                <div className="flex items-center justify-between text-[var(--muted)] mb-6">
                  <span>Monthly</span>
                  <span className="text-[var(--txt)] font-semibold">{formatUSD(quote.monthly)}/mo</span>
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={async () => {
                    if (!user) {
                      openModal("signin");
                      return;
                    }
                    try {
                      const res = await fetch("/api/checkout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ features: featuresObj, email: user.email ?? undefined }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data?.error || "Checkout failed");
                      if (data?.url) window.location.href = data.url as string;
                    } catch (e) {
                      // eslint-disable-next-line no-alert
                      alert((e as any)?.message ?? "Failed to start checkout");
                    }
                  }}
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function TypingLine() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-40 bg-white/20 rounded animate-pulse" />
      <div className="h-4 w-1.5 bg-white/70 animate-[blink_1s_steps(2,start)_infinite]" />
      <style jsx>{`
        @keyframes blink { to { opacity: 0; } }
      `}</style>
    </div>
  );
}

function ShimmerBlock({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="relative overflow-hidden h-4 rounded bg-white/10">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.2s_infinite]" />
        </div>
      ))}
      <style jsx>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  );
}

function DashboardWidgets() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="h-12 bg-white/10 rounded"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        />
      ))}
    </div>
  );
}
