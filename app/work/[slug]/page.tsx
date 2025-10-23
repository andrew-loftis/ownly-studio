import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/lib/work";
import Image from "next/image";
const BLUR = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

export default function WorkDetailPage({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) return notFound();

  return (
    <main className="flex-1 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Banner */}
        <div className="rounded-2xl overflow-hidden glass-strong">
          <div className="aspect-[16/8] relative">
            <Image
              src={project.thumbnail}
              alt=""
              className="w-full h-full object-cover"
              fill
              placeholder="blur"
              blurDataURL={BLUR}
            />
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold text-[var(--txt)]">{project.title}</h1>
            <p className="text-[var(--muted)] mt-2">{project.outcome}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-4">
            <div className="text-[var(--muted)] text-xs uppercase tracking-wide">Timeline</div>
            <div className="text-[var(--txt)] font-semibold">{project.timeline}</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-[var(--muted)] text-xs uppercase tracking-wide">Stack</div>
            <div className="text-[var(--txt)] font-semibold">{project.stack}</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-[var(--muted)] text-xs uppercase tracking-wide">Result</div>
            <div className="text-[var(--txt)] font-semibold">{project.result}</div>
          </div>
        </div>

        {/* Image grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {project.images.map((src, i) => (
            <div key={i} className="rounded-xl overflow-hidden glass">
              <Image
                src={src}
                alt=""
                className="w-full h-full object-cover"
                fill
                placeholder="blur"
                blurDataURL={BLUR}
              />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="pt-4">
          <Link href="/build" className="inline-block">
            <span className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-black font-semibold bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)]">
              Start your build
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
