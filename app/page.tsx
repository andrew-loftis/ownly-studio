"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/SectionHeading";

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

  return (
    <main className="flex-1 relative overflow-hidden">
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
            <p className="text-sm font-medium uppercase tracking-wide text-[var(--mint)]">
              One subscription. Everything unified.
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-[var(--txt)] leading-tight">
              All your digital—
              <span className="text-transparent bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] bg-clip-text">
                one place
              </span>
            </h1>
            <p className="text-xl text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
              Too many tools. Not enough together.
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

      {/* Value cards */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Unified */}
            <div className="glass p-8 rounded-xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--mint)] to-[var(--cyan)] flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <SectionHeading title="Unified" />
              <p className="text-[var(--muted)] text-sm leading-relaxed">
                Web, apps, AI, automations, payments—unified.
              </p>
            </div>

            {/* Cinematic */}
            <div className="glass p-8 rounded-xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--cyan)] to-[var(--coral)] flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                </svg>
              </div>
              <SectionHeading title="Cinematic" />
              <p className="text-[var(--muted)] text-sm leading-relaxed">
                Pixel-perfect interfaces that feel crafted, not assembled from templates.
              </p>
            </div>

            {/* Operational */}
            <div className="glass p-8 rounded-xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--coral)] to-[var(--mint)] flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <SectionHeading title="Operational" />
              <p className="text-[var(--muted)] text-sm leading-relaxed">
                Battle-tested infrastructure. Serious engineering. Built to scale with you.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
