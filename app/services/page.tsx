"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { FeatureChecklist, FAQ, CTASection } from "@/components/premium";

const services = [
  {
    name: "Launch",
    description: "Launch fast with core features.",
    features: ["MVP in 2 weeks", "Core features only", "Mobile-first"],
    price: "Quick start",
    gradient: "from-[var(--mint)] to-[var(--cyan)]",
    includedFeatures: ["Website", "Basic auth", "Mobile responsive", "SSL & hosting", "Basic analytics"]
  },
  {
    name: "Pro",
    description: "Auth, dashboards, integrations—complete solution.",
    features: ["User management", "Admin panels", "API connections", "Analytics"],
    price: "Full featured",
    gradient: "from-[var(--cyan)] to-[var(--coral)]",
    popular: true,
    includedFeatures: ["Everything in Launch", "User dashboards", "API integrations", "Advanced analytics", "Email automation"]
  },
  {
    name: "Platform",
    description: "Full stack, AI, ops—enterprise ready.",
    features: ["Custom AI models", "DevOps pipeline", "Multi-tenant", "White label"],
    price: "Enterprise ready",
    gradient: "from-[var(--coral)] to-[var(--mint)]",
    includedFeatures: ["Everything in Pro", "Custom AI models", "Multi-tenant architecture", "White label options", "24/7 support"]
  },
];

const comparisonFeatures = [
  { name: "Pages", launch: "5", pro: "Unlimited", platform: "Unlimited" },
  { name: "Auth", launch: "Basic", pro: "Advanced", platform: "Enterprise SSO" },
  { name: "AI", launch: "—", pro: "Basic", platform: "Custom models" },
  { name: "Automations", launch: "—", pro: "5/month", platform: "Unlimited" },
  { name: "Payments", launch: "—", pro: "Stripe", platform: "Multi-gateway" },
  { name: "CMS", launch: "—", pro: "Included", platform: "Headless + UI" },
  { name: "Email", launch: "—", pro: "Transactional", platform: "Marketing suite" },
  { name: "SLA", launch: "Community", pro: "Business hours", platform: "24/7 dedicated" },
];

const faqItems = [
  {
    question: "How does the subscription model work?",
    answer: "One monthly fee covers hosting, updates, support, and ongoing development. No hidden costs or surprise bills."
  },
  {
    question: "What's the typical timeline?",
    answer: "Launch: 2-3 weeks. Pro: 4-6 weeks. Platform: 8-12 weeks. We'll provide a detailed timeline after your discovery call."
  },
  {
    question: "Do I own the code when complete?",
    answer: "Yes, you receive full source code and can export everything. The subscription covers hosting and ongoing updates."
  },
  {
    question: "Can I upgrade my plan later?",
    answer: "Absolutely. You can upgrade anytime and we'll migrate your existing features to the new tier seamlessly."
  }
];

export default function ServicesPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="flex-1 py-24 px-4">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-wide text-[var(--txt-tertiary)] font-medium mb-4">
            Services
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--txt-primary)] mb-4">
            Pick your{" "}
            <span className="gradient-text-bright">
              speed
            </span>
          </h1>
          <p className="text-[var(--txt-secondary)] text-lg max-w-2xl mx-auto">
            From rapid prototypes to enterprise platforms. All roads lead to shipped.
          </p>
        </div>

        {/* Service cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={service.name}
              className="relative group cursor-pointer"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                transform: hoveredCard === index ? 'perspective(1000px) rotateX(5deg) rotateY(-5deg) translateY(-10px)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Popular badge */}
              {service.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] text-black text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Card */}
              <div className="glass-strong h-full p-8 rounded-2xl relative overflow-hidden">
                {/* Light sweep effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`,
                    transform: hoveredCard === index ? 'translateX(100%)' : 'translateX(-100%)',
                    transition: 'transform 0.6s ease-out',
                  }}
                />

                {/* Content */}
                <div className="relative z-10 space-y-6">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6`}>
                    <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                      {index === 0 && (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      )}
                      {index === 1 && (
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      )}
                      {index === 2 && (
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      )}
                    </svg>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--txt-primary)] mb-2">{service.name}</h3>
                    <p className="text-[var(--txt-secondary)] text-lg">{service.description}</p>
                  </div>

                  {/* Features */}
                  <FeatureChecklist 
                    items={service.features}
                    className="mb-6"
                  />

                  {/* Price */}
                  <div className="pt-4 border-t border-white/10">
                    <span className="text-[var(--muted)] text-sm">{service.price}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Grid */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--txt-primary)] mb-2">
              Compare{" "}
              <span className="gradient-text-bright">
                plans
              </span>
            </h2>
            <p className="text-[var(--txt-secondary)]">What's included in each tier</p>
          </div>

          <div className="glass-strong rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-[var(--txt-primary)] font-medium">Feature</th>
                    <th className="text-center p-4 text-[var(--txt-primary)] font-medium">Launch</th>
                    <th className="text-center p-4 text-[var(--txt-primary)] font-medium">Pro</th>
                    <th className="text-center p-4 text-[var(--txt-primary)] font-medium">Platform</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={feature.name} className={index < comparisonFeatures.length - 1 ? "border-b border-white/5" : ""}>
                      <td className="p-4 text-[var(--txt-primary)] font-medium">{feature.name}</td>
                      <td className="p-4 text-center text-[var(--txt-secondary)] text-sm">{feature.launch}</td>
                      <td className="p-4 text-center text-[var(--txt-secondary)] text-sm">{feature.pro}</td>
                      <td className="p-4 text-center text-[var(--txt-secondary)] text-sm">{feature.platform}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Feature Details */}
        <section className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={service.name} className="space-y-4">
              <h3 className="text-lg font-bold text-[var(--txt-primary)]">{service.name} includes</h3>
              <FeatureChecklist 
                items={service.includedFeatures}
              />
            </div>
          ))}
        </section>

        {/* FAQ */}
        <FAQ 
          items={faqItems}
          title="Common questions"
        />

        {/* CTA Sections */}
        <div className="space-y-8">
          <CTASection
            title="Show me what's included"
            description="Jump to the comparison grid to see exactly what each tier offers."
            primaryAction={{
              text: "View comparison",
              href: "#compare"
            }}
            secondaryAction={{
              text: "Browse examples",
              href: "/work"
            }}
          />

          <CTASection
            title="Start a proposal"
            description="30-minute discovery call. No commitment required."
            primaryAction={{
              text: "Configure & quote",
              href: "/build"
            }}
            gradient="from-[var(--cyan)]/10 to-[var(--coral)]/5"
          />
        </div>
      </div>
    </div>
  );
}
