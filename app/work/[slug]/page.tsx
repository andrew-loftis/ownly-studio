import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/lib/work";
import { StatBadge, CTASection } from "@/components/premium";
import Image from "next/image";

// Force static generation and prebuild all known project slugs to avoid 404s on some hosts
export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

const BLUR = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

export default function WorkDetailPage({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) return notFound();

  return (
    <div className="flex-1 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Cinematic Banner */}
        <div className="rounded-2xl overflow-hidden glass-strong relative">
          <div className="aspect-[16/8] relative">
            <Image
              src={project.thumbnail}
              alt=""
              className="w-full h-full object-cover"
              fill
              placeholder="blur"
              blurDataURL={BLUR}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{project.title}</h1>
                <p className="text-white/90 text-lg">{project.outcome}</p>
              </div>
              
              {project.metric && (
                <div className="glass-strong rounded-full px-4 py-2">
                  <span className="text-[var(--mint)] font-semibold">{project.metric}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatBadge
            value={project.timeline}
            label="Timeline"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            }
          />
          
          <StatBadge
            value={project.stack.split(',')[0].trim()}
            label="Primary Stack"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            }
            gradient="from-[var(--cyan)] to-[var(--coral)]"
          />
          
          <StatBadge
            value={project.result.split(' ')[0]}
            label="Key Result"
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            }
            gradient="from-[var(--coral)] to-[var(--mint)]"
          />
        </div>

        {/* Category-specific Content */}
        {project.category === "Websites" && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--txt-primary)]">Live Website Preview</h2>
            <div className="glass-strong rounded-2xl overflow-hidden">
              <div className="bg-[var(--bg-2)] p-3 border-b border-white/10 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="bg-[var(--bg-1)] rounded-lg px-3 py-1 text-xs text-[var(--txt-secondary)]">
                  {project.title.toLowerCase().replace(/\s+/g, '')}.com
                </div>
              </div>
              <div className="aspect-[16/10] relative bg-white">
                <Image
                  src={project.thumbnail}
                  alt={`${project.title} website preview`}
                  className="w-full h-full object-cover"
                  fill
                />
              </div>
            </div>
          </section>
        )}

        {project.category === "Apps" && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--txt-primary)]">Interactive App Demo</h2>
            <div className="flex justify-center">
              <div className="relative">
                {/* iPhone Frame */}
                <div className="w-[300px] h-[600px] bg-black rounded-[50px] p-2 shadow-2xl">
                  <div className="w-full h-full bg-[var(--bg-1)] rounded-[42px] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-8 bg-black/20 flex items-center justify-between px-6 text-white text-xs">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <span>100%</span>
                      </div>
                    </div>
                    
                    {/* App Content */}
                    <div className="pt-8 h-full">
                      <Image
                        src={project.thumbnail}
                        alt={`${project.title} app interface`}
                        className="w-full h-full object-cover"
                        fill
                      />
                    </div>
                  </div>
                </div>
                
                {/* Hover Indicator */}
                <div className="absolute inset-0 bg-transparent hover:bg-mint-400/10 rounded-[50px] transition-colors cursor-pointer flex items-center justify-center">
                  <div className="opacity-0 hover:opacity-100 transition-opacity bg-mint-400/20 backdrop-blur-sm rounded-full p-4">
                    <svg className="w-8 h-8 text-mint-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {project.category === "Agents" && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--txt-primary)]">Agent Analytics & Capabilities</h2>
            
            {/* Performance Dashboard */}
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-mint-500 to-cyan-400 flex items-center justify-center mb-2">
                    <span className="text-black font-bold text-lg">95%</span>
                  </div>
                  <p className="text-sm text-[var(--txt-secondary)]">Accuracy Rate</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-2">
                    <span className="text-white font-bold text-lg">2.3s</span>
                  </div>
                  <p className="text-sm text-[var(--txt-secondary)]">Response Time</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-2">
                    <span className="text-white font-bold text-lg">24/7</span>
                  </div>
                  <p className="text-sm text-[var(--txt-secondary)]">Availability</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-2">
                    <span className="text-white font-bold text-lg">1000+</span>
                  </div>
                  <p className="text-sm text-[var(--txt-secondary)]">Daily Queries</p>
                </div>
              </div>
            </div>

            {/* Capabilities List */}
            <div className="glass-strong rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">Agent Capabilities</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Natural language processing",
                  "Context-aware responses", 
                  "Multi-language support",
                  "Integration with existing systems",
                  "Learning from interactions",
                  "Escalation to human agents",
                  "Real-time analytics",
                  "Custom workflow automation"
                ].map((capability, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-mint-500 to-cyan-400"></div>
                    <span className="text-[var(--txt-secondary)]">{capability}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Image Grid with Lightbox */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-[var(--txt-primary)]">Project Gallery</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.images.map((src, i) => (
              <div key={i} className="group rounded-xl overflow-hidden glass hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="aspect-[4/3] relative">
                  <Image
                    src={src}
                    alt={`${project.title} screenshot ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    fill
                    placeholder="blur"
                    blurDataURL={BLUR}
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Result Callout */}
        <section className="glass-strong rounded-2xl p-8 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[var(--mint)] to-[var(--cyan)] flex items-center justify-center">
              <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--txt)]">Result</h3>
            <p className="text-lg text-[var(--txt)] font-semibold">{project.result}</p>
          </div>
        </section>

        {/* Next Step CTA */}
        <CTASection
          title="See the live example for this project"
          description="Open the interactive example tailored to this project category."
          primaryAction={{
            text: "View live example",
            href: `/examples?slug=${project.slug}`,
          }}
          secondaryAction={{
            text: "Start your build",
            href: "/build",
          }}
        />
      </div>
    </div>
  );
}
