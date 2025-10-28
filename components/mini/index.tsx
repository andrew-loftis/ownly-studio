"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mail, FileText, Zap } from "lucide-react";

export function MiniWebsite() {
  const ref = useRef<HTMLDivElement | null>(null);
  const anim = useRef<number | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const loop = () => {
      const max = Math.max(0, el.scrollHeight - el.clientHeight);
      const t = (performance.now() / 3500) % 2; // ping-pong
      const p = t < 1 ? t : 2 - t;
      el.scrollTop = p * max;
      anim.current = requestAnimationFrame(loop);
    };
    anim.current = requestAnimationFrame(loop);
    return () => { if (anim.current) cancelAnimationFrame(anim.current); };
  }, []);
  return (
    <div className="h-36 relative rounded-b-xl overflow-hidden border-t border-white/10 bg-white">
      <div ref={ref} className="absolute inset-0 overflow-y-auto no-scrollbar">
        <div className="min-h-[180%]">
          <div className="h-10 bg-gradient-to-r from-white to-slate-50 border-b border-black/10 px-3 py-2">
            <div className="h-2 w-24 bg-black/10 rounded" />
            <div className="mt-1 h-1.5 w-40 bg-black/10 rounded" />
          </div>
          <div className="grid grid-cols-3 gap-2 p-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 rounded border border-black/10" />
            ))}
          </div>
          <div className="h-8 bg-slate-50 border-t border-black/10 flex items-center justify-center">
            <div className="h-2 w-16 bg-black/10 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MiniWebApp() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-2 bg-white/10 rounded" />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div className="h-10 bg-white/5 rounded relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-[var(--mint)]/20 animate-[grow_2.6s_ease_infinite]" />
        </div>
        <div className="h-10 bg-white/5 rounded col-span-3 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-[var(--cyan)]/20 animate-[grow_3.1s_ease_infinite]" />
        </div>
      </div>
      <style jsx>{`
        @keyframes grow { 0% { width: 10%; } 50% { width: 85%; } 100% { width: 10%; } }
      `}</style>
    </div>
  );
}

export function MiniAI() {
  const lines = [
    { who: 'User', text: 'Draft a welcome email for new signups.' },
    { who: 'AI', text: 'Here’s a concise, on-brand welcome with a clear CTA.' },
    { who: 'User', text: 'Add a discount line at the end.' },
    { who: 'AI', text: 'Added 10% code + unsubscribe footer. Ready to send?' },
  ];
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState(0);
  useEffect(() => {
    const cur = lines[idx]?.text ?? '';
    const int = setInterval(() => {
      setTyped((t) => {
        if (t < cur.length) return t + 1;
        clearInterval(int);
        setTimeout(() => {
          setIdx((i) => (i + 1) % lines.length);
          setTyped(0);
        }, 300);
        return t;
      });
    }, 28);
    return () => clearInterval(int);
  }, [idx]);
  return (
    <div className="font-mono text-[11px] space-y-1">
      {lines.slice(0, idx).map((m, i) => (
        <div key={i}><span className={m.who === 'AI' ? 'text-mint-300' : 'text-cyan-300'}>{m.who}:</span> {m.text}</div>
      ))}
      <div>
        <span className={lines[idx]?.who === 'AI' ? 'text-mint-300' : 'text-cyan-300'}>{lines[idx]?.who}:</span> {lines[idx]?.text.slice(0, typed)}<span className="animate-pulse">▍</span>
      </div>
    </div>
  );
}

export function MiniAutomations() {
  return (
    <div className="relative h-14 w-full">
      {/* Track */}
      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-0.5 bg-white/10" />

      {/* Stations: Form -> Flow -> Email */}
      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between">
        <div className="flex items-center -translate-y-1/2">
          <motion.div
            className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FileText className="w-3.5 h-3.5 text-[var(--txt-tertiary)]" />
          </motion.div>
        </div>
        <div className="flex items-center -translate-y-1/2">
          <motion.div
            className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.45 }}
          >
            <Zap className="w-3.5 h-3.5 text-[var(--txt-tertiary)]" />
          </motion.div>
        </div>
        <div className="flex items-center -translate-y-1/2">
          <motion.div
            className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
          >
            <Mail className="w-3.5 h-3.5 text-[var(--txt-tertiary)]" />
          </motion.div>
        </div>
      </div>

      {/* Envelope traveling along the track */}
      <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-6 h-6 rounded-md bg-[var(--mint)]/15 border border-[var(--mint)]/30 shadow-sm flex items-center justify-center animate-[travelX_2.8s_linear_infinite]">
            <Mail className="w-3.5 h-3.5 text-[var(--mint)]" />
          </div>
        </div>
      </div>

      {/* success blip near the end */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2">
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--mint)]/70 animate-[pop_2.8s_ease_infinite]" />
      </div>

      <style jsx>{`
        @keyframes travelX {
          0% { transform: translateX(0) translateY(-50%); }
          50% { transform: translateX(calc((100% - 24px)/2)) translateY(-50%); }
          100% { transform: translateX(calc(100% - 24px)) translateY(-50%); }
        }
        @keyframes pop {
          0%, 49% { opacity: 0; transform: scale(0.7); }
          50%, 70% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
}

export function MiniPayments() {
  return (
    <div className="relative h-16">
      {/* Slot / Reader */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-3/4 h-8 rounded-lg bg-white/[0.06] border border-white/10" />
      {/* Card */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-6 w-2/3 h-9 rounded-md bg-white/90 text-black border border-black/10 shadow-sm overflow-hidden animate-[dip_2.6s_ease_in_out_infinite]">
        <div className="h-full flex items-center gap-2 px-2">
          <div className="w-6 h-4 rounded-sm bg-gradient-to-br from-slate-300 to-slate-100 border border-black/10" />
          <div className="h-2 w-16 rounded bg-black/10" />
          <div className="ml-auto h-2 w-10 rounded bg-black/10" />
        </div>
      </div>
      {/* Success blip */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-5 w-2 h-2 rounded-full bg-[var(--mint)]/80 animate-[pop_2.6s_ease_in_out_infinite]" />
      <style jsx>{`
        @keyframes dip { 0% { transform: translate(-50%, 0); } 35% { transform: translate(-50%, 8px); } 70% { transform: translate(-50%, 8px); } 100% { transform: translate(-50%, 0); } }
        @keyframes pop { 0%, 34% { opacity: 0; transform: scale(0.7); } 35%, 70% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.7); } }
      `}</style>
    </div>
  );
}

export function MiniCMS() {
  return (
    <div className="space-y-1">
      {/* Row 1 */}
      <div className="flex items-center gap-2">
        <FileText className="w-3 h-3 text-[var(--txt-tertiary)]" />
        <div className="h-2 bg-white/10 rounded flex-1" />
        <div className="h-2 bg-white/10 rounded w-10" />
      </div>
      {/* Row 2 (block shuffling) */}
      <div className="flex items-center gap-2">
        <FileText className="w-3 h-3 text-[var(--txt-tertiary)]" />
        <div className="relative flex-1 h-2">
          <div className="absolute inset-y-0 left-0 right-10 bg-white/10 rounded" />
          <div className="absolute inset-y-0 left-0 w-10 bg-[var(--mint)]/30 rounded animate-[shuffle_2.8s_ease_in_out_infinite]" />
        </div>
        <div className="h-2 bg-white/10 rounded w-10" />
      </div>
      {/* Row 3 */}
      <div className="flex items-center gap-2">
        <FileText className="w-3 h-3 text-[var(--txt-tertiary)]" />
        <div className="h-2 bg-white/10 rounded flex-1" />
        <div className="h-2 bg-white/10 rounded w-8" />
      </div>
      <style jsx>{`
        @keyframes shuffle { 0% { transform: translateX(0); } 50% { transform: translateX(calc(100% - 2.5rem)); } 100% { transform: translateX(0); } }
      `}</style>
    </div>
  );
}

export function MiniEmail() {
  return (
    <div className="space-y-2">
      <div className="h-6 bg-white/10 rounded flex items-center px-2 gap-2">
        <Mail className="w-3 h-3 text-[var(--txt-tertiary)]" />
        <div className="h-2 bg-white/20 rounded w-2/3" />
      </div>
      <div className="h-20 bg-white/5 rounded relative overflow-hidden p-2">
        {/* email body */}
        <div className="h-2 bg-white/10 rounded w-3/4 mb-2" />
        <div className="h-2 bg-white/10 rounded w-5/6 mb-1" />
        <div className="h-2 bg-white/10 rounded w-1/2" />
        {/* plane path */}
        <div className="absolute left-2 right-2 bottom-7 h-px bg-white/10" />
        {/* moving envelope */}
        <div className="absolute left-2 bottom-6 w-6 h-6 rounded-md bg-[var(--mint)]/15 border border-[var(--mint)]/30 flex items-center justify-center animate-[fly_2.8s_linear_infinite]">
          <Mail className="w-3.5 h-3.5 text-[var(--mint)]" />
        </div>
        {/* sent badge */}
        <div className="absolute right-2 bottom-6 text-[10px] px-2 py-1 rounded-full bg-[var(--mint)]/20 border border-[var(--mint)]/30 text-[var(--mint)] font-medium animate-[pop_2.8s_ease_infinite]">
          Sent
        </div>
        {/* CTA */}
        <div className="absolute bottom-2 right-2 h-6 px-3 rounded bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] text-[10px] flex items-center text-black/90 font-medium">
          Send test
        </div>
      </div>
      <style jsx>{`
        @keyframes fly { 0% { transform: translateX(0); } 50% { transform: translateX(calc(50%)); } 100% { transform: translateX(calc(100% - 0.5rem)); } }
        @keyframes pop { 0%, 49% { opacity: 0; transform: scale(0.9); } 50%, 70% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.9); } }
      `}</style>
    </div>
  );
}
