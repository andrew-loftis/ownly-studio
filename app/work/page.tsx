"use client";

import { useState, useMemo } from "react";
import ProjectTile from "@/components/ProjectTile";
import { FilterChip } from "@/components/premium";
import { projects, type WorkCategory } from "@/lib/work";

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

        {/* Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <ProjectTile
              key={p.slug}
              href={`/examples?slug=${p.slug}`}
              title={p.title}
              outcome={p.outcome}
              thumbnail={p.thumbnail}
              video={p.video}
              metric={p.metric}
              category={p.category}
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
