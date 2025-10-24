"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { projects } from "@/lib/work";
import ExampleWebsite from "@/components/examples/ExampleWebsite";
import ExampleAppPhone from "@/components/examples/ExampleAppPhone";
import ExampleAgent from "@/components/examples/ExampleAgent";

function ExamplesInner() {
  const sp = useSearchParams();
  const slug = sp.get("slug") || "";
  const project = projects.find((p) => p.slug === slug);

  return (
    <div className="flex-1 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-wide text-[var(--txt-tertiary)]">Live Example</p>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--txt)]">
            {project ? project.title : "Choose an example"}
          </h1>
          {!project && (
            <p className="text-[var(--txt-secondary)]">
              Add ?slug=<em>project-slug</em> to the URL or click from the Work grid.
            </p>
          )}
        </div>

        {project && project.category === "Websites" && (
          <ExampleWebsite
            title={project.title}
            images={project.images}
            outcome={project.outcome}
            metric={project.metric}
            result={project.result}
          />
        )}
        {project && project.category === "Apps" && (
          <ExampleAppPhone
            title={project.title}
            images={project.images}
            outcome={project.outcome}
            metric={project.metric}
            stack={project.stack}
          />
        )}
        {project && project.category === "Agents" && (
          <ExampleAgent
            title={project.title}
            outcome={project.outcome}
            metric={project.metric}
            stack={project.stack}
          />
        )}
      </div>
    </div>
  );
}

export default function ExamplesIndex() {
  return (
    <Suspense fallback={<div className="px-4 py-10 text-center text-[var(--txt-secondary)]">Loading…</div>}>
      <ExamplesInner />
    </Suspense>
  );
}
