"use client";

import { motion } from "framer-motion";
import { Check, Star, Zap } from "lucide-react";
import { formatUSD } from "@/lib/pricing";
import { type FeatureKey } from "@/lib/pricing";

interface Bundle {
  id: string;
  name: string;
  description: string;
  features: FeatureKey[];
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  popular?: boolean;
  badge?: string;
}

const bundles: Bundle[] = [
  {
    id: "startup",
    name: "Startup Launch",
    description: "Perfect for getting your business online with essential features",
    features: ["website", "cms", "email"],
    originalPrice: 4500,
    bundlePrice: 3200,
    savings: 1300,
    badge: "Most Popular"
  },
  {
    id: "growth",
    name: "Growth Engine",
    description: "Scale your business with automation and advanced features",
    features: ["website", "webapp", "automations", "payments", "cms"],
    originalPrice: 12500,
    bundlePrice: 8900,
    savings: 3600,
    popular: true,
    badge: "Best Value"
  },
  {
    id: "enterprise",
    name: "Full Stack",
    description: "Complete digital transformation with AI and custom features",
    features: ["website", "webapp", "ai", "automations", "payments", "cms", "email"],
    originalPrice: 18000,
    bundlePrice: 12500,
    savings: 5500,
    badge: "Premium"
  }
];

interface BundleSelectorProps {
  selectedFeatures: FeatureKey[];
  onSelectBundle: (features: FeatureKey[]) => void;
  onCustomBuild: () => void;
}

export default function BundleSelector({ selectedFeatures, onSelectBundle, onCustomBuild }: BundleSelectorProps) {
  const getRecommendedBundle = () => {
    // Simple recommendation logic based on selected features
    if (selectedFeatures.length >= 5) return "enterprise";
    if (selectedFeatures.length >= 3) return "growth";
    return "startup";
  };

  const recommendedId = getRecommendedBundle();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-[var(--txt)]">Choose Your Bundle</h2>
        <p className="text-[var(--muted)]">Pre-configured packages designed for different business stages</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {bundles.map((bundle) => {
          const isRecommended = bundle.id === recommendedId;
          const hasAllFeatures = bundle.features.every(f => selectedFeatures.includes(f));
          
          return (
            <motion.div
              key={bundle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                relative cursor-pointer transition-all hover:-translate-y-1
                ${isRecommended ? 'ring-2 ring-[var(--mint)]/50' : ''}
                ${bundle.popular ? 'scale-105' : ''}
              `}
              onClick={() => onSelectBundle(bundle.features)}
            >
              <div className={`
                glass-strong rounded-2xl p-6 h-full border transition-all
                ${hasAllFeatures ? 'border-[var(--mint)]/50 bg-[var(--mint)]/5' : 'border-white/10'}
                ${bundle.popular ? 'glass-strong' : 'glass'}
              `}>
                {/* Badge */}
                {bundle.badge && (
                  <div className="absolute -top-3 left-6">
                    <div className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      ${bundle.popular 
                        ? 'bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] text-black' 
                        : 'bg-white/10 text-[var(--txt)]'
                      }
                    `}>
                      {bundle.badge}
                    </div>
                  </div>
                )}

                {/* Recommended Flag */}
                {isRecommended && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--mint)] to-[var(--cyan)] flex items-center justify-center">
                      <Star className="w-3 h-3 text-black" fill="currentColor" />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Header */}
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--txt)] mb-1">{bundle.name}</h3>
                    <p className="text-sm text-[var(--muted)]">{bundle.description}</p>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[var(--txt)]">
                        {formatUSD(bundle.bundlePrice)}
                      </span>
                      <span className="text-sm text-[var(--muted)] line-through">
                        {formatUSD(bundle.originalPrice)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[var(--mint)] font-medium">
                        Save {formatUSD(bundle.savings)}
                      </span>
                      <div className="px-2 py-1 rounded-full bg-[var(--mint)]/20 text-xs text-[var(--mint)] font-medium">
                        {Math.round((bundle.savings / bundle.originalPrice) * 100)}% off
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-[var(--txt)]">Includes:</div>
                    <div className="space-y-1.5">
                      {bundle.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[var(--mint)]" />
                          <span className="text-sm text-[var(--muted)] capitalize">
                            {feature === 'webapp' ? 'Web App' : feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {hasAllFeatures && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-[var(--mint)]/20 border border-[var(--mint)]/30"
                    >
                      <Check className="w-4 h-4 text-[var(--mint)]" />
                      <span className="text-sm font-medium text-[var(--mint)]">Selected</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Custom Build Option */}
      <div className="text-center pt-6 border-t border-white/10">
        <button
          onClick={onCustomBuild}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass hover:glass-strong transition-all hover:-translate-y-0.5"
        >
          <Zap className="w-4 h-4" />
          <span>Build Custom Package</span>
        </button>
        <p className="text-xs text-[var(--muted)] mt-2">
          Mix and match individual features for your specific needs
        </p>
      </div>
    </div>
  );
}