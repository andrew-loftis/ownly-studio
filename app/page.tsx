"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { LogoRow, StatBadge, AccordionCard, CTASection } from "@/components/premium";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Gentle parallax effect for hero block
    // Gentle parallax effect
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${scrollY * 0.1}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const placeholderLogos = [
    { name: "TechCorp", src: "/placeholders/logos/techcorp.svg" },
    { name: "InnovateCo", src: "/placeholders/logos/innovate.svg" },
    { name: "BuildRight", src: "/placeholders/logos/buildright.svg" },
    { name: "NextGen", src: "/placeholders/logos/nextgen.svg" },
    { name: "CloudSync", src: "/placeholders/logos/cloudsync.svg" },
    { name: "DataFlow", src: "/placeholders/logos/dataflow.svg" },
    { name: "AppForge", src: "/placeholders/logos/appforge.svg" },
    { name: "DevCore", src: "/placeholders/logos/devcore.svg" },
  ];

  return (
    <div className="flex-1 relative overflow-hidden">
  {/* Site-wide DotField handled in ThemeBackdrop */}
      
      {/* Hero section */}
      <section ref={heroRef} className="relative md:min-h-screen min-h-[70vh] flex items-center justify-center px-4">
        {/* Mobile step hint */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 sm:hidden">
          <div className="px-3 py-1 rounded-full text-[11px] glass-strong border border-white/10 text-[var(--txt-tertiary)]">
            Explore → Build → Launch
          </div>
        </div>
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <p className="text-xs md:text-sm font-medium uppercase tracking-[0.2em] text-[var(--txt-tertiary)]">Product studio</p>
            <h1 className="text-5xl md:text-7xl font-extrabold text-[var(--txt)] leading-[1.05] tracking-tight">
              We design and build
              <span className="text-transparent bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] bg-clip-text"> websites & apps</span>
            </h1>
            <p className="text-base md:text-lg text-[var(--txt-secondary)] max-w-2xl mx-auto leading-relaxed">
              End‑to‑end: frontend, backend, payments, AI, automations, and ops.
            </p>
          </div>
          
          <div className="flex gap-3 md:gap-6 justify-center items-center">
            <Link href="/build">
              <Button variant="primary" size="lg" className="sm:px-8 sm:py-3 px-6 py-2.5">
                Start Building
              </Button>
            </Link>
            <Link href="/work">
              <Button variant="ghost" size="lg" className="sm:px-8 sm:py-3 px-6 py-2.5">
                See Our Work
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Logo marquee */}
      <LogoRow 
        logos={placeholderLogos}
        className="border-y border-white/5 bg-[var(--bg-2)]"
      />

      {/* Three pillars (polished) */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-wide text-[var(--txt-tertiary)] font-medium mb-2">How we work</p>
            <h2 className="text-3xl font-bold text-[var(--txt)]">What you can count on</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <AccordionCard
              title="Product"
              subtitle="Websites and web apps, built together"
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              }
              details={[
                "One design system, one auth, one data model",
                "Accessible, performant, and responsive"
              ]}
            />

            <AccordionCard
              title="Capabilities"
              subtitle="Payments, AI, and automations when you need them"
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                </svg>
              }
              details={[
                "Stripe checkout, subscriptions, invoicing",
                "Assistants, workflows, and webhooks"
              ]}
            />

            <AccordionCard
              title="Operations"
              subtitle="Built to ship, observe, and scale"
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              }
              details={[
                "CI/CD, monitoring, error reporting",
                "Environments and sensible security"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Proof strip removed per feedback */}

      {/* Removed the cinematic video placeholder to reduce noise */}

      {/* CTA Section */}
      <CTASection
        title="Pick what you need. Watch it come alive."
        description="Start with what matters most. Scale when you're ready."
        primaryAction={{
          text: "Start Building",
          href: "/build"
        }}
        secondaryAction={{
          text: "View Pricing",
          href: "/services"
        }}
        className="px-4 max-w-6xl mx-auto"
      />
    </div>
  );
}
