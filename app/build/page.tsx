"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { create } from "zustand";
import { z } from "zod";
import { FEATURE_LABELS, BASE_PRICES, price, formatUSD, type FeatureKey, type Features } from "@/lib/pricing";
import { Mail, Globe, Bot, Zap, CreditCard, PanelsTopLeft, FileText, LayoutDashboard, Eye, ShoppingCart, Info } from "lucide-react";
import Button from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { MiniWebsite, MiniWebApp, MiniPayments, MiniAI, MiniAutomations, MiniCMS, MiniEmail } from "@/components/mini";
import { useAuthStore } from "@/lib/authStore";
import BuildSteps from "@/components/premium/BuildSteps";
import BundleSelector from "@/components/premium/BundleSelector";
import EstimateDrawer from "@/components/premium/EstimateDrawer";
// Local store and types for Build page
type FormValues = { features: FeatureKey[] };

type BuildState = {
  currentStep: number;
  completedSteps: number[];
  selected: FeatureKey[];
  isCustomMode: boolean;
  showEstimate: boolean;
  setCurrentStep: (n: number) => void;
  completeStep: (n: number) => void;
  setSelected: (f: FeatureKey[]) => void;
  toggle: (k: FeatureKey) => void;
  setCustomMode: (v: boolean) => void;
  setShowEstimate: (v: boolean) => void;
};

const useBuildStore = create<BuildState>((set) => ({
  currentStep: 1,
  completedSteps: [],
  selected: [],
  isCustomMode: true,
  showEstimate: false,
  setCurrentStep: (n) => set({ currentStep: n }),
  completeStep: (n) => set((s) => ({ completedSteps: Array.from(new Set([...s.completedSteps, n])) })),
  setSelected: (f) => set({ selected: f }),
  toggle: (k) => set((s) => ({ selected: s.selected.includes(k) ? s.selected.filter((x) => x !== k) as FeatureKey[] : ([...s.selected, k] as FeatureKey[]) })),
  setCustomMode: (v) => set({ isCustomMode: v }),
  setShowEstimate: (v) => set({ showEstimate: v }),
}));

type OptionItem = { key: FeatureKey; icon: ReactNode; description: string; category: 'core' | 'addons' };
const options: OptionItem[] = [
  { key: 'website', icon: <Globe className="w-4 h-4" />, description: 'Your marketing site. Pages, SEO, blazing fast.', category: 'core' },
  { key: 'webapp', icon: <PanelsTopLeft className="w-4 h-4" />, description: 'Accounts, dashboards, portals, internal tools.', category: 'core' },
  { key: 'payments', icon: <CreditCard className="w-4 h-4" />, description: 'Stripe checkout, subscriptions, or one-time.', category: 'core' },
  { key: 'ai', icon: <Bot className="w-4 h-4" />, description: 'Chat, content help, automations powered by OpenAI.', category: 'addons' },
  { key: 'automations', icon: <Zap className="w-4 h-4" />, description: 'Zapier/Make workflows, background jobs & syncing.', category: 'addons' },
  { key: 'cms', icon: <FileText className="w-4 h-4" />, description: 'Sanity/Webflow CMS to edit pages & content.', category: 'addons' },
  { key: 'email', icon: <Mail className="w-4 h-4" />, description: 'Custom domain email + deliverability setup.', category: 'addons' },
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

  // Calculate potential savings vs. raw sum of parts
  const sumSetup = selected.reduce((s, k) => s + (BASE_PRICES[k]?.setup ?? 0), 0);
  const sumMonthly = selected.reduce((s, k) => s + (BASE_PRICES[k]?.monthly ?? 0), 0);
  const savingsSetup = Math.max(0, sumSetup - quote.setup);
  const savingsMonthly = Math.max(0, sumMonthly - quote.monthly);
  const hasWebsite = selected.includes('website');
  const hasCMS = selected.includes('cms');
  const hasPayments = selected.includes('payments');
  const discountWebsiteCms = hasWebsite && hasCMS ? Math.round(BASE_PRICES.website.setup * 0.10) : 0;
  const discountWebsitePayments = hasWebsite && hasPayments ? Math.round(BASE_PRICES.payments.setup * 0.10) : 0;

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

  // Quick Picks helper
  const quickPick = (features: FeatureKey[]) => {
    setSelected(features);
    setValue("features", features as any, { shouldTouch: true, shouldDirty: true });
  };

  const selectAllCore = () => {
    const core = options.filter(o => o.category === 'core').map(o => o.key);
    const next = Array.from(new Set([...(features as FeatureKey[]), ...core])) as FeatureKey[];
    setSelected(next);
    setValue("features", next as any, { shouldTouch: true, shouldDirty: true });
  };

  const clearAll = () => {
    setSelected([]);
    setValue("features", [] as any, { shouldTouch: true, shouldDirty: true });
  };

  // Shareable link: load from query on first mount
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const f = sp.get('f');
      if (f) {
        const arr = f.split(',').filter(Boolean) as FeatureKey[];
        setSelected(arr);
        setValue('features', arr as any, { shouldTouch: true, shouldDirty: true });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync selected -> query param for shareable link
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      if (selected.length > 0) sp.set('f', selected.join(',')); else sp.delete('f');
      const url = `${window.location.pathname}?${sp.toString()}`;
      window.history.replaceState({}, '', url);
    } catch {}
  }, [selected]);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied');
    } catch {
      prompt('Copy link', window.location.href);
    }
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

  // Scale preview content slightly when many selections are active
  const count = selected.length;
  const previewScale = count >= 7 ? 0.8 : count >= 5 ? 0.9 : count >= 3 ? 0.95 : 1;

  return (
    <div className="relative">
      <div className="flex-1 px-3 py-4 sm:px-4 sm:py-6">
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto">
        {/* Steps Navigation */}
        <BuildSteps 
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepNavigation}
        />

        {/* Hero removed on this page to keep content above the fold */}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Mode toggle: Custom first, Packages as alternate */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCustomMode(true)}
                  className={`px-4 py-2 rounded-full text-sm border btn-focus-full transition-all ${isCustomMode ? 'bg-white/5 border-[var(--mint)]/40 text-[var(--mint)] font-semibold' : 'bg-transparent border-white/10 text-[var(--txt-tertiary)] hover:border-white/20 hover:text-[var(--txt)]'}`}
                >
                  Custom Build
                </button>
                <button
                  onClick={() => setCustomMode(false)}
                  className={`px-4 py-2 rounded-full text-sm border btn-focus-full transition-all ${!isCustomMode ? 'bg-white/5 border-[var(--mint)]/40 text-[var(--mint)] font-semibold' : 'bg-transparent border-white/10 text-[var(--txt-tertiary)] hover:border-white/20 hover:text-[var(--txt)]'}`}
                >
                  Packages
                </button>
              </div>

              {!isCustomMode ? (
                <BundleSelector
                  selectedFeatures={selected}
                  onSelectBundle={handleBundleSelect}
                  onCustomBuild={handleCustomBuild}
                />
              ) : (
                <div className="space-y-6">
                  <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
                    {/* Live Preview Panel (fixed height to avoid page scroll) */}
                    <div className="lg:order-2 lg:col-span-2 glass-strong rounded-2xl p-4 sm:p-5 sticky top-6 flex flex-col relative overflow-hidden" style={{ height: 'clamp(620px, 68vh, 760px)' }}>
                      {/* subtle tech grid + accent line */}
                      <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:12px_12px]" />
                      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--mint)]/40 to-transparent" />
                      {/* ambient glows */}
                      <div className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(closest-side, var(--cyan), transparent 70%)' }} />
                      <div className="pointer-events-none absolute -bottom-24 -left-24 w-[420px] h-[420px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(closest-side, var(--mint), transparent 70%)' }} />

                      <div className="mb-2 sm:mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-base sm:text-lg font-semibold text-[var(--txt-primary)] flex items-center gap-2">
                          <Eye className="w-5 h-5" />
                          Live Preview
                        </h3>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] sm:text-xs text-[var(--txt-secondary)]">
                          <span className="text-[var(--txt-primary)] font-medium">{formatUSD(quote.setup)}</span>
                          <span>•</span>
                          <span>{formatUSD(quote.monthly)}/mo</span>
                          <span>•</span>
                          <span>{getTimeline()}</span>
                          {savingsSetup > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-[var(--mint)] font-medium">Save {formatUSD(savingsSetup)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {selected.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-center">
                          <div>
                            <div className="w-16 h-16 mx-auto rounded-full bg.white/5 flex items-center justify-center mb-4">
                              <LayoutDashboard className="w-8 h-8 text-[var(--txt-tertiary)]" />
                            </div>
                            <p className="text-[var(--txt-secondary)] text-sm">
                              Select features to see your build preview
                            </p>
                            <p className="text-[var(--txt-tertiary)] text-xs mt-2">You can change this anytime before checkout.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 sm:space-y-2.5">
                          {/* Selected feature chips */}
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 pb-1">
                            {selected.map((f) => (
                              <button
                                key={f}
                                onClick={() => handleFeatureToggle(f)}
                                className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs bg-white/5 border border-white/10 text-[var(--txt-secondary)] hover:text-[var(--txt)]"
                                aria-label={`Remove ${FEATURE_LABELS[f]}`}
                              >
                                {FEATURE_LABELS[f]} ×
                              </button>
                            ))}
                          </div>

                          <div className="flex justify-end pb-1">
                            <button onClick={copyShareLink} className="text-[10px] px-2 py-1 rounded border border-white/10 text-[var(--txt-tertiary)] hover:text-[var(--txt)] hover:border-white/20">Copy link</button>
                          </div>
                          <div className="origin-top-left">
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3" style={{ transform: `scale(${previewScale})` }}>
                          <AnimatePresence>
                            {selected.includes("website") && (
                              <motion.div
                                key="website"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="rounded-lg border border-white/10 p-0 overflow-hidden"
                              >
                                <div className="text-mint-400 text-xs px-4 pt-3 font-medium">✓ Marketing Website</div>
                                <div className="p-2.5 pt-2 h-24 sm:h-28 overflow-hidden">
                                  <MiniWebsite />
                                </div>
                              </motion.div>
                            )}

                            {selected.includes("webapp") && (
                              <motion.div
                                key="webapp"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="rounded-lg border border-white/10 p-0"
                              >
                                <div className="text-mint-400 text-xs px-4 pt-3 font-medium">✓ Web Application</div>
                                <div className="p-2.5 pt-2 h-24 sm:h-28 overflow-hidden">
                                  <MiniWebApp />
                                </div>
                              </motion.div>
                            )}

                            {selected.includes("payments") && (
                              <motion.div
                                key="payments"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="rounded-lg border border-white/10 p-0"
                              >
                                <div className="text-mint-400 text-xs px-4 pt-3 font-medium">✓ Payment Integration</div>
                                <div className="p-2.5 pt-2 h-24 sm:h-28 overflow-hidden">
                                  <MiniPayments />
                                </div>
                              </motion.div>
                            )}

                            {selected.includes("ai") && (
                              <motion.div
                                key="ai"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="rounded-lg border border-white/10 p-0"
                              >
                                <div className="text-mint-400 text-xs px-4 pt-3 font-medium">✓ AI Features</div>
                                <div className="p-2.5 pt-2 h-24 sm:h-28 overflow-hidden">
                                  <MiniAI />
                                </div>
                              </motion.div>
                            )}

                            {selected.includes("automations") && (
                              <motion.div
                                key="automations"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="rounded-lg border border-white/10 p-0"
                              >
                                <div className="text-mint-400 text-xs px-4 pt-3 font-medium">✓ Automations</div>
                                <div className="p-2.5 pt-2 h-24 sm:h-28 overflow-hidden">
                                  <div className="h-full flex items-center">
                                    <MiniAutomations />
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {selected.includes("cms") && (
                              <motion.div
                                key="cms"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="rounded-lg border border-white/10 p-0"
                              >
                                <div className="text-mint-400 text-xs px-4 pt-3 font-medium">✓ Content Management</div>
                                <div className="p-2.5 pt-2 h-24 sm:h-28 overflow-hidden">
                                  <MiniCMS />
                                </div>
                              </motion.div>
                            )}

                            {selected.includes("email") && (
                              <motion.div
                                key="email"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="rounded-lg border border-white/10 p-0"
                              >
                                <div className="text-mint-400 text-xs px-4 pt-3 font-medium">✓ Email Setup</div>
                                <div className="p-2.5 pt-2 h-24 sm:h-28 overflow-hidden">
                                  <MiniEmail />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          </div>
                          </div>

                          {/* Reassurance */}
                          <p className="text-[10px] text-[var(--txt-tertiary)]">You can change this anytime before checkout.</p>
                        </div>
                      )}
                    </div>

                    {/* Options aside - fixed height to avoid page scroll */}
                    <aside className="lg:order-1">
                      <div className="glass-strong rounded-2xl p-4 sm:p-5 flex flex-col relative sticky top-6" style={{ height: 'clamp(620px, 68vh, 760px)' }}>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-[var(--txt-primary)]">Select features</h3>
                          <div className="flex items-center gap-2">
                            <button onClick={selectAllCore} className="text-[11px] px-2 py-1 rounded border border-white/10 text-[var(--txt-tertiary)] hover:text-[var(--txt)] hover:border-white/20">Add core</button>
                            <button onClick={clearAll} className="text-[11px] px-2 py-1 rounded border border-white/10 text-[var(--txt-tertiary)] hover:text-[var(--txt)] hover:border-white/20">Clear</button>
                          </div>
                        </div>
                        {selected.includes('website') && (
                          <div className="mb-3 rounded-lg border border-[var(--mint)]/30 bg-[var(--mint)]/10 p-2.5">
                            <div className="text-[11px] text-[var(--mint)] font-medium mb-1">Recommended with Website</div>
                            <div className="flex gap-2 flex-wrap">
                              {[{k:'cms', label:'CMS'}, {k:'payments', label:'Payments'}].map(({k,label}) => (
                                <button key={k} onClick={() => handleFeatureToggle(k as FeatureKey)} className={`text-[11px] px-2 py-1 rounded border ${selected.includes(k as FeatureKey) ? 'border-[var(--mint)]/40 text-[var(--mint)]' : 'border-white/15 text-[var(--txt-tertiary)] hover:text-[var(--txt)] hover:border-white/30'}`}>{selected.includes(k as FeatureKey) ? `${label} added` : `Add ${label}`}</button>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="space-y-4 overflow-hidden">
                          {/* Core */}
                          <div>
                            <div className="text-[11px] uppercase tracking-wide text-[var(--txt-tertiary)] mb-2">Core</div>
                            <div className="space-y-2">
                          {options.filter(o => o.category === 'core').map(({ key, icon, description }) => {
                            const active = selected.includes(key);
                            return (
                              <label key={key} className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${active ? 'border-white/10 bg-white/[0.06]' : 'border-white/5 hover:bg-white/[0.04]'} relative`} title={description}>
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={active}
                                  onChange={() => handleFeatureToggle(key)}
                                />
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-white/5 border border-white/10 text-[var(--txt-secondary)] flex-shrink-0">{icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[var(--txt-primary)] text-sm font-medium truncate">{FEATURE_LABELS[key]}</div>
                                  <div className="text-[var(--txt-tertiary)] text-xs line-clamp-1">{description}</div>
                                </div>
                                <div className="ml-auto flex items-center gap-3">
                                  <div className="hidden sm:flex flex-col items-end leading-tight">
                                    <span className="text-[11px] text-[var(--txt)] font-medium">{formatUSD(BASE_PRICES[key].setup)}</span>
                                    <span className="text-[10px] text-[var(--txt-tertiary)]">{formatUSD(BASE_PRICES[key].monthly)}/mo</span>
                                  </div>
                                  <span className={`text-xs px-2.5 py-1 rounded-full border ${active ? 'border-[var(--mint)]/40 text-[var(--mint)]' : 'border-white/10 text-[var(--txt-tertiary)]'}`}>{active ? 'Selected' : 'Add'}</span>
                                  <InfoPopover featureKey={key} />
                                </div>
                              </label>
                            );
                          })}
                            </div>
                          </div>

                          {/* Add-ons */}
                          <div>
                            <div className="text-[11px] uppercase tracking-wide text-[var(--txt-tertiary)] mb-2">Add-ons</div>
                            <div className="space-y-2">
                          {options.filter(o => o.category === 'addons').map(({ key, icon, description }) => {
                            const active = selected.includes(key);
                            return (
                              <label key={key} className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${active ? 'border-white/10 bg-white/[0.06]' : 'border-white/5 hover:bg-white/[0.04]'} relative`} title={description}>
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={active}
                                  onChange={() => handleFeatureToggle(key)}
                                />
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-white/5 border border-white/10 text-[var(--txt-secondary)] flex-shrink-0">{icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[var(--txt-primary)] text-sm font-medium truncate">{FEATURE_LABELS[key]}</div>
                                  <div className="text-[var(--txt-tertiary)] text-xs line-clamp-1">{description}</div>
                                </div>
                                <div className="ml-auto flex items-center gap-3">
                                  <div className="hidden sm:flex flex-col items-end leading-tight">
                                    <span className="text-[11px] text-[var(--txt)] font-medium">{formatUSD(BASE_PRICES[key].setup)}</span>
                                    <span className="text-[10px] text-[var(--txt-tertiary)]">{formatUSD(BASE_PRICES[key].monthly)}/mo</span>
                                  </div>
                                  <span className={`text-xs px-2.5 py-1 rounded-full border ${active ? 'border-[var(--mint)]/40 text-[var(--mint)]' : 'border-white/10 text-[var(--txt-tertiary)]'}`}>{active ? 'Selected' : 'Add'}</span>
                                  <InfoPopover featureKey={key} />
                                </div>
                              </label>
                            );
                          })}
                            </div>
                          </div>

                          {/* Quick picks removed for this page; kept on packages page */}
                        </div>
                      </div>
                    </aside>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence>
                      {selected.includes("website") && (
                        <motion.div
                          key="website"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
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
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="glass rounded-xl p-4"
                        >
                          <div className="text-[var(--muted)] text-xs mb-3">Web Application</div>
                          <DashboardWidgets />
                        </motion.div>
                      )}
                      
                      {selected.includes("ai") && aiPreview && (
                        <motion.div
                          key="ai"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
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
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
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
                        {(discountWebsiteCms > 0 || discountWebsitePayments > 0) && (
                          <div className="mt-3 text-xs text-[var(--mint)]">
                            <div className="flex items-center justify-between">
                              <span>Bundle savings</span>
                              <span className="font-medium">- {formatUSD(discountWebsiteCms + discountWebsitePayments)}</span>
                            </div>
                            {discountWebsiteCms > 0 && (
                              <div className="text-[var(--txt-tertiary)] mt-1">Website + CMS: -{formatUSD(discountWebsiteCms)} (10% off Website setup)</div>
                            )}
                            {discountWebsitePayments > 0 && (
                              <div className="text-[var(--txt-tertiary)]">Website + Payments: -{formatUSD(discountWebsitePayments)} (10% off Payments setup)</div>
                            )}
                          </div>
                        )}
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
      {/* Reduced-motion safeguard for CSS keyframe animations used in previews */}
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          [class*="animate-"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

// Simple Info popover for feature details
function InfoPopover({ featureKey }: { featureKey: FeatureKey }) {
  const [open, setOpen] = useState(false);
  const map: Record<FeatureKey, { blurb: string; points: string[] }> = {
    website: { blurb: 'High‑performance marketing site.', points: ['SEO + analytics', 'Responsive pages', 'Fast hosting/CDN'] },
    webapp: { blurb: 'Auth, dashboards, and portals.', points: ['Accounts/roles', 'Data CRUD & search', 'Audit & activity'] },
    ai: { blurb: 'GPT‑powered chat and content.', points: ['Chat + prompts', 'Content polish', 'Automations'] },
    automations: { blurb: 'Zapier/Make flows + jobs.', points: ['Form → CRM', 'Syncs & webhooks', 'Scheduled jobs'] },
    payments: { blurb: 'Stripe checkout & billing.', points: ['One‑time & subscriptions', 'Invoices + tax', 'Customer Portal'] },
    cms: { blurb: 'Edit content in a CMS.', points: ['Sanity or Webflow', 'Page sections', 'Media library'] },
    email: { blurb: 'Domain email set up.', points: ['DNS & deliverability', 'Sender auth (SPF/DKIM)', 'Warmup guidance'] },
  };
  const data = map[featureKey];
  return (
    <div className="relative">
      <button type="button" aria-label="Learn more" onClick={(e) => { e.preventDefault(); setOpen(v => !v); }} className="w-6 h-6 inline-flex items-center justify-center rounded-md border border-white/10 text-[var(--txt-tertiary)] hover:text-[var(--txt)] hover:border-white/20">
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 z-20 glass-strong rounded-lg border border-white/10 p-3 text-xs" onMouseLeave={() => setOpen(false)}>
          <div className="font-medium text-[var(--txt)] mb-1">{FEATURE_LABELS[featureKey]}</div>
          <div className="text-[var(--txt-tertiary)] mb-2">{data.blurb}</div>
          <ul className="list-disc pl-4 space-y-1 text-[var(--txt-secondary)]">
            {data.points.map((p, i) => (<li key={i}>{p}</li>))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ThemeBackdrop is now global via components/ThemeBackdrop and included in layout

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

// Mini interactive preview components
// Mini components moved to components/mini and imported above

// Quick picks moved to packages page; components removed here.
