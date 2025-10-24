"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { WorkCategory } from "@/lib/work";

const BLUR = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

type Props = {
  href: string;
  title: string;
  outcome: string;
  thumbnail: string;
  video?: string;
  metric?: string;
  category: WorkCategory;
  images?: string[]; // kept for future but not required anymore
};

export default function ProjectTile({
  href,
  title,
  outcome,
  thumbnail,
  video,
  metric,
  category,
  images,
}: Props) {
  const img = thumbnail || "/placeholders/placeholder-wide.svg";
  const [hovering, setHovering] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<number | null>(null);

  // Smooth scroll simulation on hover (no flashing)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = Math.max(0, el.scrollHeight - el.clientHeight);
    if (hovering && max > 0) {
      let t = 0;
      const dur = 6000; // ms per full pass
      const step = (ts: number) => {
        if (!hovering) return;
        t = (t + 16) % dur;
        const p = t / dur;
        // ping-pong easing for pleasant effect
        const y = p < 0.5 ? (p * 2) : (1 - (p - 0.5) * 2);
        el.scrollTop = y * max;
        animRef.current = requestAnimationFrame(step as any);
      };
      animRef.current = requestAnimationFrame(step as any);
      return () => {
        if (animRef.current) cancelAnimationFrame(animRef.current);
        animRef.current = null;
        el.scrollTop = 0; // reset
      };
    } else {
      el.scrollTop = 0;
    }
  }, [hovering]);

  const WebsiteLaptop = () => (
    <div className="relative">
      {/* Screen */}
      <div className="relative rounded-t-xl overflow-hidden bg-black/10 border-x border-t border-white/10">
        <div className="aspect-[16/10] relative bg-white">
          {/* Mini landing page inside monitor */}
          <div ref={scrollRef} className="absolute inset-0 overflow-hidden overflow-y-auto no-scrollbar">
            <div className="min-h-[160%]">
              {/* hero */}
              <div className="h-24 md:h-28 px-4 py-3 bg-gradient-to-br from-white to-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[var(--mint)] to-[var(--cyan)]" />
                    <div className="w-16 h-2 rounded bg-black/10" />
                  </div>
                  <div className="flex items-center gap-3 text-[10px]">
                    <div className="w-10 h-2 rounded bg-black/10" />
                    <div className="w-10 h-2 rounded bg-black/10" />
                    <div className="w-10 h-2 rounded bg-black/10" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-3 w-40 rounded bg-black/10 mb-2" />
                  <div className="h-2 w-64 rounded bg-black/10" />
                </div>
              </div>
              {/* features */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-white">
                {[1,2,3].map((i) => (
                  <div key={i} className="rounded-lg border border-black/10 p-2">
                    <div className="h-2 w-16 rounded bg-black/10 mb-1" />
                    <div className="h-2 w-20 rounded bg-black/10" />
                  </div>
                ))}
              </div>
              {/* testimonial */}
              <div className="px-3 py-2 bg-slate-50 border-t border-black/10">
                <div className="h-2 w-3/4 rounded bg-black/10 mb-1" />
                <div className="h-2 w-1/2 rounded bg-black/10" />
              </div>
              {/* footer */}
              <div className="h-10 bg-white flex items-center justify-center gap-2">
                <div className="h-2 w-16 rounded bg-black/10" />
                <div className="h-2 w-16 rounded bg-black/10" />
              </div>
            </div>
          </div>
          {/* light sweep on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background:
                "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)",
              transform: "translateX(-100%)",
            }}
          />
        </div>
      </div>
      {/* Base */}
      <div className="h-3 bg-[var(--bg-2)] rounded-b-xl border-x border-b border-white/10" />
      <div className="mx-auto mt-1 h-1.5 w-1/2 rounded-b-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );

  const AppPhone = () => (
    <div className="relative flex items-center justify-center py-3">
      <div className="w-[180px] h-[360px] bg-black rounded-[30px] p-1.5 shadow-xl">
        <div className="w-full h-full bg-[var(--bg-1)] rounded-[24px] overflow-hidden relative">
          {/* status bar */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-black/20" />
          <div className="pt-6 h-full">
            {/* Mini app with scrollable content on hover */}
            <div ref={scrollRef} className="absolute inset-0 overflow-hidden overflow-y-auto no-scrollbar bg-[var(--bg-1)]">
              <div className="min-h-[180%] p-3 space-y-2">
                {/* header banner */}
                <div className="h-16 rounded-xl bg-gradient-to-br from-[var(--mint)]/20 to-[var(--cyan)]/20 border border-white/10" />
                {/* cards */}
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="rounded-xl border border-white/10 p-2 bg-white/5">
                    <div className="h-2 w-24 rounded bg-white/20 mb-1" />
                    <div className="h-2 w-32 rounded bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* home bar */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-1 w-12 rounded-full bg-white/40" />
        </div>
      </div>
    </div>
  );

  const AgentHUD = () => (
    <div className="relative rounded-xl overflow-hidden border border-cyan-400/20 bg-gradient-to-br from-black/70 to-[var(--bg-2)]">
      {/* hologrid */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,.08) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      {/* header */}
      <div className="relative flex items-center justify-between px-3 py-2 border-b border-cyan-400/20 bg-black/30">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-mint-400/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-coral-400/60" />
        </div>
        <span className="text-[10px] text-cyan-200/70 font-mono tracking-wide">AI AGENT • {title}</span>
        <span className="text-[10px] text-cyan-200/50 font-mono">HUD</span>
      </div>
      {/* body */}
      <div className="relative p-3 font-mono text-[11px] leading-5 text-cyan-100/90">
        <div className="flex items-center gap-2">
          <span className="text-mint-300">▸</span>
          <span>Boot sequence</span>
          <span className="text-cyan-400/70 animate-pulse">...</span>
        </div>
        <div className="mt-1 grid grid-cols-3 gap-2 text-[10px]">
          <div className="rounded-md border border-cyan-400/20 bg-black/30 p-2">
            <div className="text-cyan-300/80">TOOLS</div>
            <div className="mt-1 text-cyan-100/80">crm · stripe · kb · escalate</div>
          </div>
          <div className="rounded-md border border-cyan-400/20 bg-black/30 p-2">
            <div className="text-cyan-300/80">MEMORY</div>
            <div className="mt-1 text-cyan-100/80">30d · locales: en, es</div>
          </div>
          <div className="rounded-md border border-cyan-400/20 bg-black/30 p-2">
            <div className="text-cyan-300/80">POLICY</div>
            <div className="mt-1 text-cyan-100/80">brand-safe · helpful</div>
          </div>
        </div>
        <div className="mt-2 text-cyan-200/80">› {outcome}</div>
        {/* Hover conversation */}
        <AgentConversation active={hovering} />
        {/* scanline */}
        <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-20">
          <div className="w-full h-full bg-[linear-gradient(to_bottom,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[length:2px_6px] animate-[scan_6s_linear_infinite]" />
        </div>
      </div>
    </div>
  );

  function AgentConversation({ active }: { active: boolean }) {
    const [step, setStep] = useState(0);
    const [typed, setTyped] = useState(0);
    const convo = [
      { who: "User", text: "Can you reschedule my appointment to Friday?" },
      { who: "Agent", text: "I can do that. Morning or afternoon?" },
      { who: "User", text: "Afternoon works best." },
      { who: "Agent", text: "Done. You’re confirmed for Fri 2:30pm. Calendar updated." },
    ];
    useEffect(() => {
      let int: number | null = null;
      if (active) {
        setStep(0); setTyped(0);
        int = (setInterval(() => {
          setTyped((t) => {
            const cur = convo[step]?.text ?? "";
            if (t < cur.length) return t + 1;
            // move to next message
            setStep((s) => (s + 1) % convo.length);
            return 0;
          });
        }, 40) as unknown) as number;
      }
      return () => { if (int) clearInterval(int); };
    }, [active, step]);

    const rendered = convo.slice(0, step);
    const current = convo[step];
    return (
      <div className="mt-2 space-y-1">
        {rendered.map((m, i) => (
          <div key={i} className="text-[10px]">
            <span className={m.who === "Agent" ? "text-mint-300" : "text-cyan-300"}>{m.who}:</span> {m.text}
          </div>
        ))}
        {active && current && (
          <div className="text-[10px]">
            <span className={current.who === "Agent" ? "text-mint-300" : "text-cyan-300"}>{current.who}:</span> {current.text.slice(0, typed)}
            <span className="animate-pulse">▍</span>
          </div>
        )}
      </div>
    );
  }

  const Preview = () => {
    if (category === "Websites") return <WebsiteLaptop />;
    if (category === "Apps") return <AppPhone />;
    return <AgentHUD />;
  };

  return (
    <Link
      href={href}
      prefetch={false}
      className="group block focus:outline-none"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl glass hover:shadow-2xl transition-shadow"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="p-4">
          <Preview />
        </div>
        {/* Metric badge */}
        {metric && (
          <div className="absolute top-3 right-3">
            <div className="glass-strong rounded-full px-3 py-1">
              <span className="text-[var(--mint)] text-xs font-semibold">{metric}</span>
            </div>
          </div>
        )}

        <div className="p-5">
          <h3 className="text-lg font-semibold text-[var(--txt)] group-hover:text-[var(--mint)] transition-colors duration-200">
            {title}
          </h3>
          <p className="text-[var(--muted)] text-sm">{outcome}</p>
        </div>
      </motion.div>

      <style jsx>{`
        .group:hover .absolute.inset-0 {
          animation: sweep 0.8s ease-out forwards;
        }
        @keyframes sweep {
          to { transform: translateX(100%); }
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </Link>
  );
}
