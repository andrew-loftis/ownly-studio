"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import ProjectTile from "@/components/ProjectTile";
import { FilterChip } from "@/components/premium";
import { projects, type WorkCategory, type Project } from "@/lib/work";

const tabs: WorkCategory[] = ["Websites", "Apps", "Agents"];
const industries = ["All", "E-commerce", "SaaS", "Healthcare", "Education", "Finance", "Entertainment"];
const projectTypes = ["All", "Mobile Apps", "Web Apps", "Websites", "Auto Replies", "AI Agents"];
const years = ["All", "2025", "2024", "2023"];

export default function WorkPage() {
  const [activeTab, setActiveTab] = useState<WorkCategory>("Websites");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [projectTypeFilter, setProjectTypeFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesCategory = p.category === activeTab;
      const matchesIndustry = industryFilter === "All" || p.industry === industryFilter;
      const matchesProjectType = projectTypeFilter === "All" || p.type === projectTypeFilter;
      const matchesYear = yearFilter === "All" || p.year === yearFilter;
      
      return matchesCategory && matchesIndustry && matchesProjectType && matchesYear;
    });
  }, [activeTab, industryFilter, projectTypeFilter, yearFilter]);

  return (
    <div className="flex-1 px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-wide text-[var(--txt-tertiary)] font-medium mb-4">
            Our Work
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--txt-primary)] mb-4">
            Built to{" "}
            <span className="gradient-text-bright">
              perform
            </span>
          </h1>
          <p className="text-[var(--txt-secondary)] text-lg max-w-2xl mx-auto">
            Real results from real projects. Every build optimized for speed, conversion, and scale.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-3">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => {
                setActiveTab(t);
                // Reset filters when changing tabs
                setIndustryFilter("All");
                setProjectTypeFilter("All");
                setYearFilter("All");
              }}
              className={
                "px-4 py-2 rounded-full text-sm transition-all duration-200 border btn-focus-full " +
                (activeTab === t
                  ? "gradient-text-bright bg-white/5 border-mint-400/30 font-semibold"
                  : "bg-transparent border-white/10 text-[var(--txt-tertiary)] hover:border-white/20 hover:text-[var(--txt-primary)]")
              }
            >
              {t}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <FilterChip
            label="Industry"
            options={industries}
            value={industryFilter}
            onChange={setIndustryFilter}
          />
          <FilterChip
            label="Type"
            options={projectTypes}
            value={projectTypeFilter}
            onChange={setProjectTypeFilter}
          />
          <FilterChip
            label="Year"
            options={years}
            value={yearFilter}
            onChange={setYearFilter}
          />
        </div>

        {/* Results count */}
        <div className="text-center">
          <p className="text-[var(--muted)] text-sm">
            Showing {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
          </p>
        </div>

        {/* Mobile carousel (swipe left/right) */}
        <div className="md:hidden -mx-4">
          <WorkMobileCarousel items={filtered} />
        </div>

        {/* Grid (desktop/tablet) */}
        <div className="hidden md:grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <ProjectTile
              key={p.slug}
              href={`/examples?slug=${p.slug}`}
              slug={p.slug}
              title={p.title}
              outcome={p.outcome}
              thumbnail={p.thumbnail}
              video={p.video}
              metric={p.metric}
              category={p.category}
              images={p.images}
              result={p.result}
              stack={p.stack}
              industry={p.industry}
              year={p.year}
            />
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[var(--txt-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.462-.881-6.065-2.331C5.935 14.15 8.066 15 12 15s6.065-.85 6.065-2.331z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-2">No projects found</h3>
            <p className="text-[var(--txt-secondary)] text-sm mb-4">
              Try adjusting your filters or browse a different category.
            </p>
            <button
              onClick={() => {
                setIndustryFilter("All");
                setProjectTypeFilter("All");
                setYearFilter("All");
              }}
              className="text-[var(--mint)] text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function WorkMobileCarousel({ items }: { items: Project[] }) {
  // Client-only mobile carousel with lock and onboarding hint
  const [locked, setLocked] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Hide hint after a moment
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 1600);
    return () => clearTimeout(t);
  }, []);

  // Track centered slide index while scrolling
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        let bestIdx = 0;
        let bestDist = Infinity;
        const children = Array.from(el.children) as HTMLElement[];
        children.forEach((child, idx) => {
          const cRect = child.getBoundingClientRect();
          const cCenter = cRect.left + cRect.width / 2;
          const d = Math.abs(cCenter - centerX);
          if (d < bestDist) { bestDist = d; bestIdx = idx; }
        });
        setCurrent(bestIdx);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    // initial index
    onScroll();
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="relative">
      {/* hint bubble */}
      {showHint && items.length > 1 && (
        <div className="absolute top-0 right-4 z-10 text-[10px] text-white/90 bg-black/50 border border-white/10 rounded-full px-2 py-1 backdrop-blur-sm">
          Swipe →
        </div>
      )}
      <div
        ref={trackRef}
        className={`flex gap-4 px-4 ${locked ? 'overflow-x-hidden' : 'overflow-x-auto'} snap-x snap-mandatory scroll-smooth`}
        style={{ touchAction: (locked ? 'pan-y' : 'pan-x') as any, transform: showHint ? 'translateX(-12px)' : 'translateX(0)', transition: 'transform 420ms ease' }}
      >
        {items.map((p, i) => (
          <div key={p.slug} className="snap-center shrink-0 w-[88vw]">
            <div className="relative">
              <ProjectTile
                href={`/examples?slug=${p.slug}`}
                slug={p.slug}
                title={p.title}
                outcome={p.outcome}
                thumbnail={p.thumbnail}
                video={p.video}
                metric={p.metric}
                category={p.category}
                images={p.images}
                result={p.result}
                stack={p.stack}
                industry={p.industry}
                year={p.year}
                active={i === current}
              />
              <button
                className={`absolute top-3 right-5 z-10 text-[10px] rounded-full px-2 py-1 border ${locked ? 'bg-[var(--mint)]/30 border-[var(--mint)]/40 text-[var(--mint)]' : 'bg-black/40 border-white/10 text-white/80'} backdrop-blur`}
                onClick={() => setLocked((v) => !v)}
              >
                {locked ? 'Unlock' : 'Lock'}
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Nudge animation handled via inline transform style above */}
    </div>
  );
}
