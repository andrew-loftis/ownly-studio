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
  images?: string[];
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
  const gallery = (images && images.length > 0 ? images : [img]).slice(0, 3);
  const [frameIndex, setFrameIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (hovering && gallery.length > 1) {
      timerRef.current = (setInterval(() => {
        setFrameIndex((i) => (i + 1) % gallery.length);
      }, 1000) as unknown) as number;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (!hovering) setFrameIndex(0);
    };
  }, [hovering, gallery.length]);

  const WebsiteLaptop = () => (
    <div className="relative">
      {/* Screen */}
      <div className="relative rounded-t-xl overflow-hidden bg-black/10 border-x border-t border-white/10">
        <div className="aspect-[16/10] relative bg-white">
          {video && category === "Websites" ? (
            <video className="w-full h-full object-cover" src={video} muted playsInline loop autoPlay />
          ) : (
            <Image
              src={gallery[frameIndex] || img}
              alt="Website preview"
              className="w-full h-full object-cover"
              fill
              placeholder="blur"
              blurDataURL={BLUR}
            />
          )}
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
            <Image
              src={gallery[frameIndex] || img}
              alt="App preview"
              fill
              className="object-cover"
              placeholder="blur"
              blurDataURL={BLUR}
            />
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
        {/* scanline */}
        <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-20">
          <div className="w-full h-full bg-[linear-gradient(to_bottom,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[length:2px_6px] animate-[scan_6s_linear_infinite]" />
        </div>
      </div>
    </div>
  );

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
