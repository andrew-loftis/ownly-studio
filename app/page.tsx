"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { LogoRow, StatBadge, AccordionCard, CTASection } from "@/components/premium";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.005;
      
      // Create ambient gradient animation
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.4, 0,
        canvas.width * 0.7, canvas.height * 0.6, canvas.width * 0.8
      );
      
      gradient.addColorStop(0, `rgba(34, 228, 196, ${0.05 + Math.sin(time) * 0.02})`);
      gradient.addColorStop(0.5, `rgba(93, 224, 230, ${0.03 + Math.cos(time * 0.7) * 0.015})`);
      gradient.addColorStop(1, `rgba(255, 90, 95, ${0.02 + Math.sin(time * 0.5) * 0.01})`);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Gentle parallax effect
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${scrollY * 0.1}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationId);
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
      {/* Ambient backdrop */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ mixBlendMode: "screen" }}
      />
      
      {/* Hero section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-wide text-[var(--mint)] drop-shadow-sm">
              One subscription. Everything unified.
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-[var(--txt-primary)] leading-tight drop-shadow-lg">
              All your digital—
              <span className="text-transparent bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] bg-clip-text drop-shadow-none">
                one place
              </span>
            </h1>
            <p className="text-xl text-[var(--txt-secondary)] max-w-2xl mx-auto leading-relaxed">
              <span className="text-[var(--txt-tertiary)]">Too many tools. Not enough together.</span>
            </p>
          </div>
          
          <div className="flex gap-6 justify-center items-center">
            <Link href="/build">
              <Button variant="primary" size="lg">
                Start Building
              </Button>
            </Link>
            <Link href="/work">
              <Button variant="ghost" size="lg">
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

      {/* Three Pillars */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-wide text-[var(--txt-tertiary)] font-medium mb-2">
              How we work
            </p>
            <h2 className="text-3xl font-bold text-[var(--txt-primary)]">Three pillars</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <AccordionCard
              title="Unified"
              subtitle="Web, apps, AI, automations—one cohesive platform"
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              }
              details={[
                "Single authentication across all services",
                "Shared data models and consistent APIs"
              ]}
            />

            <AccordionCard
              title="Cinematic"
              subtitle="Pixel-perfect interfaces that feel crafted"
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                </svg>
              }
              details={[
                "60fps animations and micro-interactions",
                "Custom design systems, not templates"
              ]}
            />

            <AccordionCard
              title="Operational"
              subtitle="Battle-tested infrastructure built to scale"
              icon={
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              }
              details={[
                "24/7 monitoring and automated scaling",
                "Enterprise-grade security and compliance"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-16 px-4 bg-[var(--bg-2)] border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-6">
            <StatBadge
              value=">90"
              label="Lighthouse Score"
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              }
            />
            <StatBadge
              value="<100ms"
              label="Time to Interactive"
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              }
            />
            <StatBadge
              value="24/7"
              label="Monitoring"
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* Cinematic strip placeholder */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden glass-strong aspect-[21/9]">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--mint)]/20 via-[var(--cyan)]/10 to-[var(--coral)]/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[var(--mint)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-[var(--muted)] text-sm">
                  Cinematic UI showcase (video placeholder)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
