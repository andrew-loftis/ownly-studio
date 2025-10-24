"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { create } from "zustand";
import { z } from "zod";
import { FEATURE_LABELS, BASE_PRICES, price, formatUSD, type FeatureKey, type Features } from "@/lib/pricing";
import { Mail, Globe, Bot, Zap, CreditCard, PanelsTopLeft, FileText, LayoutDashboard, Eye, ShoppingCart } from "lucide-react";
import Button from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/authStore";
import BuildSteps from "@/components/premium/BuildSteps";
import BundleSelector from "@/components/premium/BundleSelector";
import EstimateDrawer from "@/components/premium/EstimateDrawer";

const schema = z.object({
  features: z.array(z.enum(["website", "webapp", "ai", "automations", "payments", "cms", "email"]))
});

type FormValues = z.infer<typeof schema>;

type BuildState = {
  currentStep: number;
  completedSteps: number[];
  selected: FeatureKey[];
  isCustomMode: boolean;
  showEstimate: boolean;
  setCurrentStep: (step: number) => void;
  completeStep: (step: number) => void;
  setSelected: (s: FeatureKey[]) => void;
  toggle: (k: FeatureKey) => void;
  setCustomMode: (custom: boolean) => void;
  setShowEstimate: (show: boolean) => void;
};

const useBuildStore = create<BuildState>((set, get) => ({
  currentStep: 1,
  completedSteps: [],
  selected: [],
  isCustomMode: false,
  showEstimate: false,
  setCurrentStep: (step) => set({ currentStep: step }),
  completeStep: (step) => {
    const current = get().completedSteps;
    if (!current.includes(step)) {
      set({ completedSteps: [...current, step] });
    }
  },
  setSelected: (s) => set({ selected: s }),
  toggle: (k) => {
    const cur = get().selected;
    const next = cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k];
    set({ selected: next });
  },
  setCustomMode: (custom) => set({ isCustomMode: custom }),
  setShowEstimate: (show) => set({ showEstimate: show }),
}));

const options: { key: FeatureKey; icon: React.ReactNode; description: string }[] = [
  { key: "website", icon: <Globe className="w-5 h-5" />, description: "Marketing pages with premium design" },
  { key: "webapp", icon: <LayoutDashboard className="w-5 h-5" />, description: "Custom dashboard and tools" },
  { key: "ai", icon: <Bot className="w-5 h-5" />, description: "AI-powered features and automation" },
  { key: "automations", icon: <Zap className="w-5 h-5" />, description: "Workflow automation and integrations" },
  { key: "payments", icon: <CreditCard className="w-5 h-5" />, description: "Stripe integration and billing" },
  { key: "cms", icon: <FileText className="w-5 h-5" />, description: "Content management system" },
  { key: "email", icon: <Mail className="w-5 h-5" />, description: "Custom email setup and templates" },
];

export default function BuildPage() {
  const { 
    currentStep, 
    completedSteps, 
    selected, 
    isCustomMode,
    showEstimate,
    setCurrentStep, 
    completeStep, 
    setSelected, 
    toggle,
    setCustomMode,
    setShowEstimate
  } = useBuildStore();
  
  const { user, openModal } = useAuthStore();
  const [aiPreview, setAiPreview] = useState<{ before: string; after: string } | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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

  // Calculate estimate
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

  // Calculate timeline
  const getTimeline = () => {
    const featureCount = selected.length;
    if (featureCount <= 2) return "2-3 weeks";
    if (featureCount <= 4) return "4-6 weeks";
    return "6-8 weeks";
  };

  const handleBundleSelect = (bundleFeatures: FeatureKey[]) => {
    setSelected(bundleFeatures);
    setValue("features", bundleFeatures as any, { shouldTouch: true, shouldDirty: true });
    completeStep(1);
    setCurrentStep(2);
  };

  const handleCustomBuild = () => {
    setCustomMode(true);
  };

  const handleFeatureToggle = async (k: FeatureKey) => {
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

  const handleStepNavigation = (step: number) => {
    if (step <= Math.max(currentStep, ...completedSteps) + 1) {
      setCurrentStep(step);
    }
  };

  const handleContinueToPreview = () => {
    if (selected.length > 0) {
      completeStep(1);
      setCurrentStep(2);
    }
  };

  const handleContinueToCheckout = () => {
    completeStep(2);
    setCurrentStep(3);
  };

  const handleCheckout = async () => {
    if (!user) {
      openModal("signin");
      return;
    }
    
    setCheckoutLoading(true);
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
      alert((e as any)?.message ?? "Failed to start checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="flex-1 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Steps Navigation */}
        <BuildSteps 
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepNavigation}
        />

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[var(--txt-primary)] mb-4">
            Build Your{" "}
            <span className="gradient-text-bright">
              Digital Empire
            </span>
          </h1>
          <p className="text-xl text-[var(--txt-secondary)] max-w-2xl mx-auto">
            Premium glass aesthetic. 60fps animations. Enterprise-grade performance.
          </p>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {!isCustomMode ? (
                <BundleSelector
                  selectedFeatures={selected}
                  onSelectBundle={handleBundleSelect}
                  onCustomBuild={handleCustomBuild}
                />
              ) : (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold text-[var(--txt-primary)] mb-2">Custom Build</h2>
                    <p className="text-[var(--txt-secondary)]">Select exactly what you need and see it come to life</p>
                  </div>
                  
                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Feature Selection */}
                    <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                      {options.map(({ key, icon, description }) => {
                        const active = selected.includes(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleFeatureToggle(key)}
                            className={`
                              tactile p-6 rounded-xl text-left transition-all hover:-translate-y-1
                              ${active ? "ring-1 ring-mint-400/50 bg-mint-400/5" : "bg-transparent"}
                            `}
                          >
                            <div className="flex items-start gap-4">
                              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-mint-500 to-cyan-400 text-black flex-shrink-0">
                                {icon}
                              </span>
                              <div>
                                <div className="text-[var(--txt-primary)] font-semibold mb-1">{FEATURE_LABELS[key]}</div>
                                <div className="text-[var(--txt-secondary)] text-sm mb-2">{description}</div>
                                <div className="text-[var(--txt-tertiary)] text-sm">
                                  {formatUSD(BASE_PRICES[key].setup)} setup · {formatUSD(BASE_PRICES[key].monthly)}/mo
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Live Preview Panel */}
                    <div className="glass-strong rounded-2xl p-6 sticky top-8 h-fit">
                      <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Live Preview
                      </h3>
                      
                      {selected.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <LayoutDashboard className="w-8 h-8 text-[var(--txt-tertiary)]" />
                          </div>
                          <p className="text-[var(--txt-secondary)] text-sm">
                            Select features to see your build preview
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <AnimatePresence>
                            {selected.includes("website") && (
                              <motion.div
                                key="website"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass rounded-xl p-4"
                              >
                                <div className="text-mint-400 text-xs mb-3 font-medium">✓ Marketing Website</div>
                                <div className="space-y-2">
                                  <div className="h-4 bg-white/10 rounded w-3/5" />
                                  <div className="h-2 bg-white/10 rounded" />
                                  <div className="h-2 bg-white/10 rounded w-4/5" />
                                  <div className="h-6 gradient-text-bright rounded w-20 text-xs" />
                                </div>
                              </motion.div>
                            )}
                            
                            {selected.includes("webapp") && (
                              <motion.div
                                key="webapp"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass rounded-xl p-4"
                              >
                                <div className="text-mint-400 text-xs mb-3 font-medium">✓ Web Application</div>
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                  <div className="h-2 bg-white/10 rounded" />
                                  <div className="h-2 bg-white/10 rounded" />
                                  <div className="h-2 bg-white/10 rounded" />
                                </div>
                                <div className="grid grid-cols-4 gap-1">
                                  <div className="h-8 bg-white/5 rounded" />
                                  <div className="h-8 bg-white/5 rounded col-span-3" />
                                </div>
                              </motion.div>
                            )}

                            {selected.includes("payments") && (
                              <motion.div
                                key="payments"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass rounded-xl p-4"
                              >
                                <div className="text-mint-400 text-xs mb-3 font-medium">✓ Payment Integration</div>
                                <div className="flex items-center gap-2">
                                  <CreditCard className="w-4 h-4 text-[var(--txt-tertiary)]" />
                                  <div className="h-2 bg-white/10 rounded flex-1" />
                                  <div className="h-4 gradient-text-bright rounded w-12" />
                                </div>
                              </motion.div>
                            )}

                            {selected.includes("ai") && (
                              <motion.div
                                key="ai"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass rounded-xl p-4"
                              >
                                <div className="text-mint-400 text-xs mb-3 font-medium">✓ AI Features</div>
                                <div className="flex items-center gap-2">
                                  <Bot className="w-4 h-4 text-[var(--txt-tertiary)]" />
                                  <div className="space-y-1 flex-1">
                                    <div className="h-2 bg-white/10 rounded w-3/4" />
                                    <div className="h-2 bg-white/10 rounded w-1/2" />
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {selected.includes("automations") && (
                              <motion.div
                                key="automations"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass rounded-xl p-4"
                              >
                                <div className="text-mint-400 text-xs mb-3 font-medium">✓ Automations</div>
                                <div className="flex items-center gap-1">
                                  <div className="w-3 h-3 rounded-full bg-white/10" />
                                  <div className="h-0.5 bg-white/10 flex-1" />
                                  <Zap className="w-3 h-3 text-mint-400" />
                                  <div className="h-0.5 bg-white/10 flex-1" />
                                  <div className="w-3 h-3 rounded-full bg-white/10" />
                                </div>
                              </motion.div>
                            )}

                            {selected.includes("cms") && (
                              <motion.div
                                key="cms"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass rounded-xl p-4"
                              >
                                <div className="text-mint-400 text-xs mb-3 font-medium">✓ Content Management</div>
                                <div className="space-y-1">
                                  <div className="flex gap-2">
                                    <FileText className="w-3 h-3 text-[var(--txt-tertiary)] mt-0.5" />
                                    <div className="h-2 bg-white/10 rounded flex-1" />
                                  </div>
                                  <div className="flex gap-2">
                                    <div className="w-3" />
                                    <div className="h-2 bg-white/10 rounded w-2/3" />
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {selected.includes("email") && (
                              <motion.div
                                key="email"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass rounded-xl p-4"
                              >
                                <div className="text-mint-400 text-xs mb-3 font-medium">✓ Email Setup</div>
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-[var(--txt-tertiary)]" />
                                  <div className="space-y-1 flex-1">
                                    <div className="h-2 bg-white/10 rounded" />
                                    <div className="h-1 bg-white/10 rounded w-3/4" />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Quick Summary */}
                          <div className="pt-4 border-t border-white/10">
                            <div className="text-xs text-[var(--txt-tertiary)] mb-2">
                              {selected.length} feature{selected.length !== 1 ? 's' : ''} selected
                            </div>
                            <div className="text-sm font-medium text-[var(--txt-primary)]">
                              {formatUSD(price({
                                website: selected.includes("website"),
                                webapp: selected.includes("webapp"),
                                ai: selected.includes("ai"),
                                automations: selected.includes("automations"),
                                payments: selected.includes("payments"),
                                cms: selected.includes("cms"),
                                email: selected.includes("email"),
                              }).setup)} setup
                            </div>
                            <div className="text-xs text-[var(--txt-secondary)]">
                              {formatUSD(price({
                                website: selected.includes("website"),
                                webapp: selected.includes("webapp"),
                                ai: selected.includes("ai"),
                                automations: selected.includes("automations"),
                                payments: selected.includes("payments"),
                                cms: selected.includes("cms"),
                                email: selected.includes("email"),
                              }).monthly)}/month ongoing
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selected.length > 0 && (
                    <div className="text-center pt-6">
                      <Button 
                        variant="primary" 
                        onClick={handleContinueToPreview}
                        className="px-8"
                      >
                        Continue to Detailed Preview
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-[var(--txt)] mb-2">Preview Your Build</h2>
                <p className="text-[var(--muted)]">See what you're getting before checkout</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Live Preview */}
                <div className="glass-strong rounded-2xl p-8">
                  <h3 className="text-lg font-semibold text-[var(--txt)] mb-6">Live Preview</h3>
                  <div className="grid gap-4">
                    <AnimatePresence>
                      {selected.includes("website") && (
                        <motion.div
                          key="website"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="glass rounded-xl p-4"
                        >
                          <div className="text-[var(--muted)] text-xs mb-3">Marketing Website</div>
                          <div className="space-y-2">
                            <div className="h-6 bg-white/10 rounded w-3/5" />
                            <div className="h-3 bg-white/10 rounded" />
                            <div className="h-3 bg-white/10 rounded w-4/5" />
                            <div className="h-8 bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] rounded w-32" />
                          </div>
                        </motion.div>
                      )}
                      
                      {selected.includes("webapp") && (
                        <motion.div
                          key="webapp"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="glass rounded-xl p-4"
                        >
                          <div className="text-[var(--muted)] text-xs mb-3">Web Application</div>
                          <DashboardWidgets />
                        </motion.div>
                      )}
                      
                      {selected.includes("ai") && aiPreview && (
                        <motion.div
                          key="ai"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="glass rounded-xl p-4"
                        >
                          <div className="text-[var(--muted)] text-xs mb-3">AI Features</div>
                          <div className="bg-black/30 rounded-md p-3 border border-white/10 text-sm">
                            <div className="text-[var(--muted)] mb-1">Before:</div>
                            <div className="text-[var(--txt)] mb-2">{aiPreview.before}</div>
                            <div className="text-[var(--muted)] mb-1">After:</div>
                            <div className="text-[var(--txt)]">{aiPreview.after}</div>
                          </div>
                        </motion.div>
                      )}
                      
                      {selected.includes("payments") && (
                        <motion.div
                          key="payments"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="glass rounded-xl p-4"
                        >
                          <div className="text-[var(--muted)] text-xs mb-3">Payment Integration</div>
                          <div className="bg-black/30 rounded-md p-3 border border-white/10 space-y-2">
                            <div className="h-6 bg-white/10 rounded" />
                            <div className="h-6 bg-white/10 rounded w-3/4" />
                            <div className="h-8 bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] rounded" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-6">
                  <div className="glass-strong rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-[var(--txt)] mb-4">Project Summary</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-[var(--muted)] mb-2">Selected Features ({selected.length})</div>
                        <div className="space-y-2">
                          {selected.map((feature) => (
                            <div key={feature} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-[var(--mint)]" />
                              <span className="text-[var(--txt)] text-sm">{FEATURE_LABELS[feature]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[var(--muted)]">Setup Cost</span>
                          <span className="text-[var(--txt)] font-semibold">{formatUSD(quote.setup)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--muted)]">Monthly</span>
                          <span className="text-[var(--txt)] font-semibold">{formatUSD(quote.monthly)}/mo</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Back to Select
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleContinueToCheckout}
                      className="flex-1"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Continue to Checkout
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-[var(--txt)] mb-2">Ready to Launch?</h2>
                <p className="text-[var(--muted)]">Let's get your project started</p>
              </div>

              <div className="glass-strong rounded-2xl p-8 space-y-6">
                <div className="text-center space-y-4">
                  <div className="text-3xl font-bold text-[var(--txt)]">
                    {formatUSD(quote.setup)}
                  </div>
                  <div className="text-[var(--muted)]">
                    One-time setup • {formatUSD(quote.monthly)}/mo after launch
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--mint)]/20 border border-[var(--mint)]/30">
                    <span className="text-sm font-medium text-[var(--mint)]">
                      {getTimeline()} delivery
                    </span>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/10">
                  <h4 className="font-semibold text-[var(--txt)]">What happens next?</h4>
                  <div className="space-y-3 text-sm text-[var(--muted)]">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[var(--mint)]/20 flex items-center justify-center text-[var(--mint)] font-semibold text-xs">1</div>
                      <span>Discovery call to align on vision and requirements</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[var(--mint)]/20 flex items-center justify-center text-[var(--mint)] font-semibold text-xs">2</div>
                      <span>Design mockups and technical architecture</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[var(--mint)]/20 flex items-center justify-center text-[var(--mint)] font-semibold text-xs">3</div>
                      <span>Development with weekly progress updates</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[var(--mint)]/20 flex items-center justify-center text-[var(--mint)] font-semibold text-xs">4</div>
                      <span>Launch and post-launch support</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1"
                  >
                    Back to Preview
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="flex-1"
                  >
                    {checkoutLoading ? "Processing..." : "Start Project"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fixed Estimate Button */}
        {selected.length > 0 && currentStep < 3 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 z-30"
          >
            <button
              onClick={() => setShowEstimate(true)}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl glass-strong border border-white/20 hover:-translate-y-1 transition-all shadow-lg backdrop-blur-xl"
            >
              <div className="text-left">
                <div className="text-sm text-[var(--muted)]">Estimate</div>
                <div className="text-lg font-semibold text-[var(--txt)]">{formatUSD(quote.setup)}</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--mint)] to-[var(--cyan)] flex items-center justify-center">
                <Eye className="w-4 h-4 text-black" />
              </div>
            </button>
          </motion.div>
        )}

        {/* Estimate Drawer */}
        <EstimateDrawer
          isOpen={showEstimate}
          onClose={() => setShowEstimate(false)}
          estimate={quote}
          timeline={getTimeline()}
          features={selected.map(f => FEATURE_LABELS[f])}
          onCheckout={handleCheckout}
          loading={checkoutLoading}
        />
      </div>
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