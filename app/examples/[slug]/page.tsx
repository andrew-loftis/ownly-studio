import { notFound } from "next/navigation";
import { projects } from "@/lib/work";
import ExampleWebsite from "@/components/examples/ExampleWebsite";
import ExampleAppPhone from "@/components/examples/ExampleAppPhone";
import ExampleAgent from "@/components/examples/ExampleAgent";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default function ExampleBySlug({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) return notFound();

  return (
    <div className="flex-1 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-wide text-[var(--txt-tertiary)]">Live Example</p>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--txt)]">{project.title}</h1>
          <p className="text-[var(--txt-secondary)]">Category: {project.category}</p>
        </div>

        {project.category === "Websites" && (
          <ExampleWebsite
            title={project.title}
            images={project.images}
            outcome={project.outcome}
            metric={project.metric}
            result={project.result}
          />
        )}
        {project.category === "Apps" && (
          <ExampleAppPhone
            title={project.title}
            images={project.images}
            outcome={project.outcome}
            metric={project.metric}
            stack={project.stack}
          />
        )}
        {project.category === "Agents" && (
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
