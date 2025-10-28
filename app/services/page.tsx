"use client";

import Link from "next/link";
import Script from "next/script";
import Button from "@/components/ui/Button";
import { Bot, CreditCard, Globe2, LayoutDashboard, Server, Cloud, RefreshCcw } from "lucide-react";

type ServiceItem = {
  title: string;
  description: string;
  scope: string; // concise, comma-separated
  icon: React.ReactNode;
};

const SERVICES: ServiceItem[] = [
  { title: "Websites",
    description: "Fast, accessible marketing sites with a modern CMS.",
    scope: "Design system, SEO & analytics, headless CMS",
    icon: <Globe2 className="w-5 h-5" /> },
  { title: "Web apps",
    description: "Auth, roles, admin panels, and reporting.",
    scope: "User management, admin tools, charts & reports",
    icon: <LayoutDashboard className="w-5 h-5" /> },
  { title: "Payments",
    description: "Checkout, subscriptions, and invoicing that just works.",
    scope: "Stripe integration, invoices & taxes, customer portal",
    icon: <CreditCard className="w-5 h-5" /> },
  { title: "Automations & AI",
    description: "Assistants, workflows, and event-driven operations.",
    scope: "Chat & tools, pipelines & webhooks, notifications",
    icon: <Bot className="w-5 h-5" /> },
];


export default function ServicesPage() {
  return (
    <div className="flex-1 py-16 sm:py-20 px-4">
  <div className="max-w-[1100px] xl:max-w-[1200px] mx-auto space-y-14">
        {/* Hero */}
        <div className="text-center mb-2">
          <p className="text-xs uppercase tracking-wide text-[var(--txt-tertiary)] font-medium mb-4">Services</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--txt-primary)] mb-3">We design and build websites and apps</h1>
          <p className="text-[var(--txt-secondary)] text-base md:text-lg max-w-2xl mx-auto">End‑to‑end product delivery: frontend, backend, payments, AI, automations, ops.</p>
          <div className="mt-6 flex items-center justify-center">
            <Link href="/build" className="inline-flex"><Button variant="primary">Book a discovery call</Button></Link>
          </div>
        </div>

        {/* What we build */}
        <section aria-labelledby="services" className="space-y-5">
          <h2 id="services" className="text-center text-xl font-semibold text-[var(--txt)]">What we build</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {SERVICES.map((s) => (
              <div key={s.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-md bg-white/[0.06] border border-white/10 flex items-center justify-center text-[var(--mint)]">{s.icon}</div>
                  <div>
                    <div className="text-[var(--txt)] font-semibold">{s.title}</div>
                    <div className="text-sm text-[var(--txt-secondary)]">{s.description}</div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-[var(--txt-tertiary)]">Scope: {s.scope}</div>
              </div>
            ))}
          </div>
        </section>

        {/* What you get */}
        <section aria-labelledby="deliverables" className="space-y-4">
          <h2 id="deliverables" className="text-center text-xl font-semibold text-[var(--txt)]">What you get</h2>
          <div className="grid md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start gap-2 text-[var(--txt)] font-semibold"><LayoutDashboard className="w-4 h-4 text-[var(--mint)]"/> Design system & UI</div>
              <div className="text-sm text-[var(--txt-secondary)] mt-1">Reusable components, accessibility, responsive layouts.</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start gap-2 text-[var(--txt)] font-semibold"><Server className="w-4 h-4 text-[var(--mint)]"/> Backend & APIs</div>
              <div className="text-sm text-[var(--txt-secondary)] mt-1">Data model, auth, integrations, background jobs.</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start gap-2 text-[var(--txt)] font-semibold"><Cloud className="w-4 h-4 text-[var(--mint)]"/> Operations & hosting</div>
              <div className="text-sm text-[var(--txt-secondary)] mt-1">CI/CD, monitoring, error reporting, environments.</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start gap-2 text-[var(--txt)] font-semibold"><RefreshCcw className="w-4 h-4 text-[var(--mint)]"/> Support & iterations</div>
              <div className="text-sm text-[var(--txt-secondary)] mt-1">Roadmaps, feature sprints, and ongoing improvements.</div>
            </div>
          </div>
        </section>

        {/* Process & proof (thin) */}
        <div className="text-center space-y-2">
          <div className="text-xs text-[var(--txt-tertiary)]">Process: Discover • Design • Build • Launch + Operate</div>
          <div className="text-sm text-[var(--txt-secondary)]">Trusted outcomes: shipped in weeks, payment‑ready, maintainable.</div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex">
            <Link href="/build" className="inline-flex"><Button variant="primary">Book a discovery call</Button></Link>
          </div>
        </div>

  {/* Keep the page minimal—no FAQ here to reduce noise */}
      </div>

  {/* JSON‑LD: List of Services (reflects the 4 featured services) */}
      <Script id="schema-services" type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: SERVICES.map((s, i) => ({
            '@type': 'ListItem', position: i + 1,
            item: { '@type': 'Service', name: s.title, description: s.description, provider: { '@type': 'Organization', name: 'Ownly Studio' } },
          })),
        }),
      }} />
    </div>
  );
}
