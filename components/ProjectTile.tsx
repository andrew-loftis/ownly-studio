import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { WorkCategory } from "@/lib/work";

const BLUR = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

export default function ProjectTile({
  href,
  title,
  outcome,
  thumbnail,
  video,
  metric,
  category,
}: {
  href: string;
  title: string;
  outcome: string;
  thumbnail: string;
  video?: string;
  metric?: string;
  category: WorkCategory;
}) {
  const img = thumbnail || "/placeholders/placeholder-wide.svg";

  const WebsiteLaptop = () => (
    <div className="relative">
      {/* Screen */}
      <div className="relative rounded-t-xl overflow-hidden bg-black/10 border-x border-t border-white/10">
        <div className="aspect-[16/10] relative bg-white">
          {video ? (
            <video className="w-full h-full object-cover" src={video} muted playsInline loop autoPlay />
          ) : (
            <Image src={img} alt="" className="w-full h-full object-cover" fill placeholder="blur" blurDataURL={BLUR} />
          )}
          {/* light sweep on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
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
            <Image src={img.replace("wide","tall")} alt="" fill className="object-cover" placeholder="blur" blurDataURL={BLUR} />
          </div>
          {/* home bar */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-1 w-12 rounded-full bg-white/40" />
        </div>
      </div>
    </div>
  );

  const AgentTerminal = () => (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/60">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/10 bg-black/40">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span className="ml-3 text-[10px] text-white/50 font-mono">agent@{title.toLowerCase().replace(/\s+/g, "-")}</span>
      </div>
      <div className="p-3 font-mono text-[11px] leading-5 text-white/90">
        <div><span className="text-mint-300">$</span> init agent --project "{title}"</div>
        <div>✔ tools: crm, stripe, kb-sync, escalate</div>
        <div>✔ memory: 30 days | locale: en, es</div>
        <div>✔ policy: brand-safe, helpful</div>
        <div className="text-white/70 mt-2">› {outcome}</div>
      </div>
    </div>
  );

  const Preview = () => {
    if (category === "Websites") return <WebsiteLaptop />;
    if (category === "Apps") return <AppPhone />;
    return <AgentTerminal />;
  };

  return (
    <Link href={href} prefetch={false} className="group block focus:outline-none">
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
      `}</style>
    </Link>
  );
}
