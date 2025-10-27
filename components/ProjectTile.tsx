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
  // Additional fields to allow per-project variation and richer previews
  slug?: string;
  result?: string;
  stack?: string;
  industry?: string;
  year?: string;
  // When true, treat tile as active/visible (mobile). Behaves like hover.
  active?: boolean;
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
  slug,
  result,
  stack,
  industry,
  year,
  active,
}: Props) {
  const img = thumbnail || "/placeholders/placeholder-wide.svg";
  const [hovering, setHovering] = useState(false);
  const isActive = Boolean(active || hovering);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<number | null>(null);
  const velocityRef = useRef(0);
  const userScrollRef = useRef(false);
  const touchYRef = useRef<number | null>(null);

  // Compute per-project accent colors by hashing the slug/title to HSL pairs
  const seed = (slug || title || "").toLowerCase();
  function hashToHue(s: string) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % 360;
  }
  const baseHue = hashToHue(seed || "ownly");
  const accentA = `hsl(${baseHue} 85% 62%)`;
  const accentB = `hsl(${(baseHue + 40) % 360} 80% 58%)`;

  // Smooth auto-scroll on hover, but if user starts scrolling inside, we take over (inertial)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = Math.max(0, el.scrollHeight - el.clientHeight);
    if (isActive && max > 0 && !userScrollRef.current) {
      let t = 0;
      const dur = 6000; // ms per full pass
      const step = (ts: number) => {
        if (!isActive || userScrollRef.current) return;
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
  }, [isActive]);

  // Inertial user-controlled scroll inside preview; prevents page scroll bleed
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!isActive) return;
      userScrollRef.current = true;
      e.preventDefault();
      e.stopPropagation();
      velocityRef.current += e.deltaY;
      scheduleInertia();
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!isActive) return;
      userScrollRef.current = true;
      touchYRef.current = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isActive) return;
      const y = e.touches[0]?.clientY ?? null;
      if (touchYRef.current != null && y != null) {
        const dy = touchYRef.current - y;
        velocityRef.current += dy * 1.2;
        scheduleInertia();
        e.preventDefault();
        e.stopPropagation();
      }
      touchYRef.current = y;
    };
    const onTouchEnd = () => { touchYRef.current = null; };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.style.overscrollBehavior = "contain";

    return () => {
      el.removeEventListener("wheel", onWheel as any);
      el.removeEventListener("touchstart", onTouchStart as any);
      el.removeEventListener("touchmove", onTouchMove as any);
      el.removeEventListener("touchend", onTouchEnd as any);
    };
  }, [isActive]);

  const inertiaRef = useRef<number | null>(null);
  const lastInputRef = useRef<number>(0);
  const scheduleInertia = () => {
    if (inertiaRef.current != null) return;
    const el = scrollRef.current;
    if (!el) return;
    const step = () => {
      const v = velocityRef.current;
      if (Math.abs(v) < 0.1) {
        velocityRef.current = 0;
        inertiaRef.current = null;
        // If inactive input for a while, allow auto-scroll to resume
        const now = performance.now();
        if (now - lastInputRef.current > 1200) {
          userScrollRef.current = false;
        }
        return;
      }
      el.scrollTop = Math.max(0, Math.min(el.scrollTop + v * 0.12, el.scrollHeight - el.clientHeight));
      velocityRef.current *= 0.9; // decay
      inertiaRef.current = requestAnimationFrame(step);
    };
    inertiaRef.current = requestAnimationFrame(step);
  };

  // Choose per-project variants for unique builds
  const websiteVariant = getWebsiteVariant(slug || title);
  const appVariant = getAppVariant(slug || title);
  const agentVariant = getAgentVariant(slug || title);

  const WebsiteLaptop = () => (
    <div className="relative">
      {/* Screen */}
      <div className="relative rounded-t-xl overflow-hidden bg-black/10 border-x border-t border-white/10">
        <div className="aspect-[16/10] relative bg-white">
          {/* Mini landing page inside monitor */}
          <div ref={scrollRef} className="absolute inset-0 overflow-hidden overflow-y-auto no-scrollbar">
            <div className="min-h-[170%]">
              {websiteVariant === 'ecommerce' && (
                <div>
                  {/* Hero sale banner */}
                  <div className="h-24 md:h-28 px-4 py-3 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-black/10">
                    <div className="text-[11px] font-semibold text-rose-700">{title}</div>
                    <div className="text-[10px] text-rose-600">{outcome}</div>
                  </div>
                  {/* Product grid */}
                  <div className="grid grid-cols-3 gap-2 p-3">
                    {[1,2,3,4,5,6].map((i) => (
                      <div key={i} className="rounded-lg border border-black/10 overflow-hidden">
                        <div className="h-12 bg-rose-100" />
                        <div className="p-2">
                          <div className="h-2 w-14 bg-black/10 rounded mb-1" />
                          <div className="flex items-center justify-between">
                            <div className="h-2 w-8 bg-black/10 rounded" />
                            <div className="h-3 w-10 bg-rose-200 rounded" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Cart bar */}
                  <div className="h-10 bg-white border-t border-black/10 px-3 flex items-center justify-between">
                    <div className="h-2 w-24 bg-black/10 rounded" />
                    <div className="px-2 py-1 text-[10px] rounded bg-rose-200/80">Checkout</div>
                  </div>
                </div>
              )}

              {websiteVariant === 'lms' && (
                <div className="grid grid-cols-[140px_1fr] min-h-[170%]">
                  {/* Sidebar */}
                  <div className="bg-slate-50 border-r border-black/10 p-2 space-y-2">
                    {["Dashboard","Courses","Calendar","Grades"].map((t) => (
                      <div key={t} className="text-[10px] text-black/70">{t}</div>
                    ))}
                  </div>
                  {/* Content */}
                  <div>
                    <div className="h-20 bg-gradient-to-r from-sky-50 to-cyan-50 border-b border-black/10 p-3">
                      <div className="text-[11px] font-semibold text-sky-800">{title}</div>
                      <div className="text-[10px] text-sky-700">{outcome}</div>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-2">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className="border border-black/10 rounded p-2">
                          <div className="h-2 w-20 bg-black/10 rounded mb-1" />
                          <div className="h-1.5 w-28 bg-black/10 rounded" />
                          <div className="mt-2 h-1 w-full bg-sky-200 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {websiteVariant === 'banking' && (
                <div>
                  <div className="h-10 bg-slate-900 text-white text-[10px] flex items-center justify-between px-3">
                    <div>{title}</div>
                    <div className="opacity-70">Secure • {year || '2025'}</div>
                  </div>
                  <div className="p-3 grid grid-cols-3 gap-2 bg-white">
                    <div className="col-span-2 border border-black/10 rounded p-2">
                      <div className="h-2 w-24 bg-black/10 rounded mb-2" />
                      <div className="h-16 bg-slate-100 rounded" />
                    </div>
                    <div className="border border-black/10 rounded p-2 space-y-1">
                      {[1,2,3,4].map(i => (<div key={i} className="h-2 w-20 bg-black/10 rounded" />))}
                    </div>
                  </div>
                  <div className="px-3 py-2 bg-slate-50 border-t border-black/10 flex items-center gap-2">
                    <div className="h-2 w-16 bg-black/10 rounded" />
                    <div className="h-2 w-16 bg-black/10 rounded" />
                    <div className="h-2 w-16 bg-black/10 rounded" />
                  </div>
                </div>
              )}

              {websiteVariant === 'medspa' && (
                <div>
                  <div className="h-24 bg-gradient-to-br from-emerald-50 to-teal-50 p-3 border-b border-black/10">
                    <div className="text-[11px] text-emerald-800 font-semibold">{title}</div>
                    <div className="text-[10px] text-emerald-700">{outcome}</div>
                  </div>
                  <div className="p-3 grid grid-cols-3 gap-2">
                    {["Facials","Peels","Injectables"].map((s) => (
                      <div key={s} className="rounded border border-black/10 p-2">
                        <div className="text-[10px] text-emerald-800">{s}</div>
                        <div className="h-2 w-16 bg-black/10 rounded mt-1" />
                      </div>
                    ))}
                  </div>
                  <div className="h-10 bg-white flex items-center justify-center">
                    <div className="px-2 py-1 bg-emerald-200/70 rounded text-[10px]">Book Appointment</div>
                  </div>
                </div>
              )}

              {websiteVariant === 'builder' && (
                <div>
                  <div className="h-16 bg-gradient-to-r from-indigo-50 to-violet-50 p-3 border-b border-black/10">
                    <div className="text-[11px] text-indigo-800 font-semibold">{title}</div>
                    <div className="text-[10px] text-indigo-700">{outcome}</div>
                  </div>
                  <div className="p-3 grid grid-cols-3 gap-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="rounded-lg border border-black/10 p-2">
                        <div className="h-2 w-16 bg-black/10 rounded mb-1" />
                        <div className="h-10 bg-slate-100 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="px-3 py-2 bg-white border-t border-black/10 text-[10px] flex items-center gap-2">
                    <div className="h-2 w-20 bg-black/10 rounded" />
                    <div className="h-2 w-10 bg-black/10 rounded" />
                  </div>
                </div>
              )}
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
            {/* Mini apps with different builds per slug */}
            <div ref={scrollRef} className="absolute inset-0 overflow-hidden overflow-y-auto no-scrollbar bg-[var(--bg-1)]">
              {appVariant === 'wayfinding' && (
                <div className="min-h-[180%] p-2">
                  <div className="h-8 bg-white/10 rounded mb-2 flex items-center px-2 text-[10px]">Search halls, booths…</div>
                  <div className="h-36 rounded-lg bg-[repeating-linear-gradient(45deg,rgba(0,0,0,.3)_0_2px,transparent_2px_6px)] relative">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="absolute w-3 h-3 rounded-full bg-[var(--mint)]" style={{ left: `${20*i}%`, top: `${10*i}%` }} />
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {["Events","Food","Restrooms","Exits"].map(t => (
                      <div key={t} className="h-10 rounded bg-white/5 border border-white/10 text-[10px] flex items-center justify-center">{t}</div>
                    ))}
                  </div>
                  <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 text-[10px]">
                    {["Map","Events","Me"].map(t => (<div key={t} className="px-2 py-1 rounded bg-white/10">{t}</div>))}
                  </div>
                </div>
              )}

              {appVariant === 'barndo' && (
                <div className="min-h-[180%] p-2">
                  <div className="h-36 rounded-lg border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-[10px]">3D VIEW</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {["Roof","Siding","Windows","Doors","Porch","Garage"].map(o => (
                      <div key={o} className="px-2 py-2 rounded border border-white/10 bg-white/5 text-[10px]">{o}</div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <div className="px-2 py-1 rounded bg-white/10">Reset</div>
                    <div className="px-2 py-1 rounded bg-[var(--mint)]/40">Checkout</div>
                  </div>
                </div>
              )}

              {appVariant === 'campus' && (
                <div className="min-h-[180%] p-2">
                  <div className="h-36 rounded-lg bg-[radial-gradient(circle_at_center,rgba(255,255,255,.1)_0,transparent_60%)] relative">
                    <div className="absolute inset-0 border-2 border-white/10 rounded-lg" />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] bg-white/10 rounded px-2">AR SCAN</div>
                  </div>
                  <div className="mt-2 space-y-1">
                    {["Library","Gym","Dining Hall"].map(n => (
                      <div key={n} className="h-10 rounded border border-white/10 bg-white/5 flex items-center px-2 text-[10px] justify-between"><span>{n}</span><span className="opacity-70">200m</span></div>
                    ))}
                  </div>
                </div>
              )}

              {appVariant === 'fintech' && (
                <div className="min-h-[180%] p-2">
                  <div className="h-24 rounded bg-white/5 border border-white/10 mb-2 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-60 bg-[repeating-linear-gradient(90deg,transparent_0_6px,rgba(255,255,255,.1)_6px_7px)]" />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[var(--mint)]/30 to-transparent" />
                  </div>
                  <div className="space-y-1 text-[10px]">
                    {["AAPL +2.1%","GOOG -0.4%","TSLA +4.3%","MSFT +0.9%"].map(r => (
                      <div key={r} className="h-8 rounded border border-white/10 bg-white/5 flex items-center justify-between px-2"><span>{r}</span><span className="opacity-70">$</span></div>
                    ))}
                  </div>
                </div>
              )}

              {appVariant === 'entertainment' && (
                <div className="min-h-[180%] p-2">
                  <div className="h-28 rounded bg-white/10 mb-2 flex items-end p-2 text-[10px]">Featured</div>
                  <div className="h-10 rounded bg-white/5 border border-white/10 mb-2 flex items-center justify-center text-[10px]">Play ▸</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1,2,3,4,5,6].map(i => (<div key={i} className="h-10 rounded bg-white/5 border border-white/10" />))}
                  </div>
                </div>
              )}

              {appVariant === 'autoreply' && (
                <div className="min-h-[180%] p-2 grid grid-cols-[70px_1fr] gap-2">
                  <div className="space-y-1">
                    {["INBOX","STAR","SENT"].map(l => (<div key={l} className="h-6 rounded bg-white/10 flex items-center justify-center text-[9px]">{l}</div>))}
                  </div>
                  <div>
                    <div className="space-y-1 mb-2">
                      {[1,2,3,4].map(i => (<div key={i} className="h-8 rounded bg-white/5 border border-white/10" />))}
                    </div>
                    <div className="h-16 rounded bg-white/5 border border-white/10 mb-2" />
                    <div className="flex gap-2 text-[10px]">
                      {["Quick Reply","Summarize","Draft"].map(t => (<div key={t} className="px-2 py-1 rounded bg-white/10">{t}</div>))}
                    </div>
                  </div>
                </div>
              )}
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
      <div className="relative p-3 font-mono text-[11px] leading-5 text-cyan-100/90 min-h-[140px]">
  <AgentBootOrConvo active={isActive} variant={agentVariant} />
        {/* scanline */}
        <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-20">
          <div className="w-full h-full bg-[linear-gradient(to_bottom,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[length:2px_6px] animate-[scan_6s_linear_infinite]" />
        </div>
      </div>
    </div>
  );

  function AgentBootOrConvo({ active, variant }: { active: boolean; variant: string }) {
    // Smooth state machine: idle -> boot -> convo -> done; reset when hover ends
    type Phase = "idle" | "boot" | "convo" | "done";
    const [phase, setPhase] = useState<Phase>("idle");
    const [index, setIndex] = useState(0); // which message fully completed
    const [typed, setTyped] = useState(0); // characters typed in current message
    const idxRef = useRef(0);
    const typedRef = useRef(0);
    const intervalRef = useRef<number | null>(null);
    const timerRef = useRef<number | null>(null);
    const script = getAgentScript(variant, { title, outcome, industry }); // 10 lines alternating
    const CURSOR = <span className="animate-pulse">▍</span>;

    const clearTimers = () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    };

    // Handle activation/lifecycle
    useEffect(() => {
      if (!active) {
        clearTimers();
        setPhase("idle");
        setIndex(0); idxRef.current = 0;
        setTyped(0); typedRef.current = 0;
        return;
      }
      // Start boot on hover
      setPhase("boot");
      setIndex(0); idxRef.current = 0;
      setTyped(0); typedRef.current = 0;
      timerRef.current = (setTimeout(() => {
        setPhase("convo");
      }, 1100) as unknown) as number;
      return clearTimers;
    }, [active]);

    // Typing loop during conversation
    useEffect(() => {
      if (!active || phase !== "convo") return;
      clearTimers();
      const SPEED = 28; // ms per char
      const GAP = 380; // ms between messages
      const typeNext = () => {
        const msg = script[idxRef.current];
        if (!msg) {
          setPhase("done");
          clearTimers();
          return;
        }
        if (typedRef.current < msg.text.length) {
          typedRef.current += 1;
          setTyped(typedRef.current);
          return;
        }
        // message complete → wait then go to next line
        clearTimers();
        timerRef.current = (setTimeout(() => {
          idxRef.current += 1;
          setIndex(idxRef.current);
          typedRef.current = 0;
          setTyped(0);
          if (idxRef.current >= script.length) {
            setPhase("done");
          } else {
            startInterval();
          }
        }, GAP) as unknown) as number;
      };
      const startInterval = () => {
        intervalRef.current = (setInterval(typeNext, SPEED) as unknown) as number;
      };
      startInterval();
      return clearTimers;
    }, [active, phase]);

    // Rendering: keep height stable, fade boot to chat
    const boot = (
      <div className="transition-opacity duration-300">
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
      </div>
    );

    const chat = (
      <div className="mt-2 space-y-1 transition-opacity duration-300">
        {script.slice(0, index).map((m, i) => (
          <div key={i} className="text-[10px]">
            <span className={m.who === "Agent" ? "text-mint-300" : "text-cyan-300"}>{m.who}:</span> {m.text}
          </div>
        ))}
        {phase !== "done" && script[index] && (
          <div className="text-[10px]">
            <span className={script[index].who === "Agent" ? "text-mint-300" : "text-cyan-300"}>{script[index].who}:</span> {script[index].text.slice(0, typed)} {CURSOR}
          </div>
        )}
      </div>
    );

    return (
      <div>
        <div className={phase === "boot" ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}>{boot}</div>
        <div className={phase === "convo" || phase === "done" ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}>{chat}</div>
      </div>
    );
  }

  function getWebsiteVariant(key: string) {
    const k = key.toLowerCase();
    if (k.includes("e-commerce") || k.includes("ecommerce")) return "ecommerce";
    if (k.includes("lms") || k.includes("learning")) return "lms";
    if (k.includes("bank") || k.includes("banking")) return "banking";
    if (k.includes("med") || k.includes("spa")) return "medspa";
    if (k.includes("builder")) return "builder";
    return "ecommerce";
  }

  function getAppVariant(key: string) {
    const k = key.toLowerCase();
    if (k.includes("wayfinding") || k.includes("convention")) return "wayfinding";
    if (k.includes("barndominium") || k.includes("config")) return "barndo";
    if (k.includes("campus")) return "campus";
    if (k.includes("fintech")) return "fintech";
    if (k.includes("entertainment")) return "entertainment";
    if (k.includes("reply")) return "autoreply";
    return "fintech";
  }

  function getAgentVariant(key: string) {
    const k = key.toLowerCase();
    if (k.includes("support")) return "support";
    if (k.includes("health")) return "health";
    if (k.includes("social")) return "social";
    return "support";
  }

  function getAgentScript(variant: string, ctx: { title: string; outcome: string; industry?: string }) {
    const o = ctx.outcome.replace(/\.$/, "");
    if (variant === "social") {
      return [
        { who: "User", text: "We need a week's worth of posts for the launch." },
        { who: "Agent", text: "What's the product hook and preferred tone?" },
        { who: "User", text: "Hook: 1-click setup. Tone: friendly, confident." },
        { who: "Agent", text: "Drafting 7 posts with variations for X, IG, and LinkedIn." },
        { who: "User", text: "Include a teaser video script too." },
        { who: "Agent", text: "Added 30s script: problem → demo → CTA, safe for brand guidelines." },
        { who: "User", text: "Schedule for mornings. Add alt text." },
        { who: "Agent", text: "Scheduled 8:30am local. Alt text generated and attached." },
        { who: "User", text: "Any risks?" },
        { who: "Agent", text: "Low. All claims verified. Links tracked. Ready to publish?" },
      ];
    }
    if (variant === "health") {
      return [
        { who: "User", text: "Patient reports fever and cough, 3 days. What triage?" },
        { who: "Agent", text: "Collect vitals, red flags. If severe, advise urgent care; else schedule telehealth." },
        { who: "User", text: "No red flags, mild fatigue." },
        { who: "Agent", text: "Recommend fluids, rest, antipyretics. Offer test booking for flu/COVID." },
        { who: "User", text: "Book earliest telehealth slot." },
        { who: "Agent", text: "Booked 9:20am tomorrow. Confirmation sent. HIPAA audit log updated." },
        { who: "User", text: "Summarize symptoms and advice for chart." },
        { who: "Agent", text: "Summary drafted. Added vitals, self-care, and follow-up triggers." },
        { who: "User", text: "Notify clinician if symptoms worsen." },
        { who: "Agent", text: "Alert configured: fever > 102°F or shortness of breath → immediate page." },
      ];
    }
    // support default
    return [
      { who: "User", text: "Order #58421 never arrived. Help?" },
      { who: "Agent", text: "Checking status and carrier scans…" },
      { who: "User", text: "It's been 10 days." },
      { who: "Agent", text: "Carrier shows delay. I can reship or refund. Preference?" },
      { who: "User", text: "Reship please." },
      { who: "Agent", text: "Reship initiated, expedited. New tracking sent to your email." },
      { who: "User", text: "Thanks. Any discount?" },
      { who: "Agent", text: "Applied 15% coupon to your next order. Anything else?" },
      { who: "User", text: "No, we're good." },
      { who: "Agent", text: "Happy to help. Closing ticket and logging customer sentiment as positive." },
    ];
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
        style={{
          // Override accent variables so gradients pick up per-project colors
          ["--mint" as any]: accentA,
          ["--cyan" as any]: accentB,
        }}
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
