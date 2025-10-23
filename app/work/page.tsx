"use client";

import { useState, useMemo } from "react";
import ProjectTile from "@/components/ProjectTile";
import { projects, type WorkCategory } from "@/lib/work";

const tabs: WorkCategory[] = ["Websites", "Apps", "Agents"];

export default function WorkPage() {
  const [active, setActive] = useState<WorkCategory>("Websites");
  const filtered = useMemo(
    () => projects.filter((p) => p.category === active),
    [active]
  );

  return (
    <main className="flex-1 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Tabs */}
        <div className="flex items-center gap-3 mb-8">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={
                "px-4 py-2 rounded-full text-sm transition-colors border " +
                (active === t
                  ? "bg-white/10 border-white/20 text-[var(--txt)]"
                  : "bg-transparent border-white/10 text-[var(--muted)] hover:border-white/20")
              }
            >
              {t}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <ProjectTile
              key={p.slug}
              href={`/work/${p.slug}`}
              title={p.title}
              outcome={p.outcome}
              thumbnail={p.thumbnail}
              video={p.video}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
