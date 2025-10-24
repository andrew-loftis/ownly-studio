import Image from "next/image";

export default function ExampleWebsite({
  title,
  images,
  outcome,
  metric,
  result,
}: {
  title: string;
  images: string[];
  outcome?: string;
  metric?: string;
  result?: string;
}) {
  const domain = `${title.toLowerCase().replace(/\s+/g, "")}.com`;
  const showcase = images?.length ? images : [
    "/placeholders/placeholder-wide.svg",
    "/placeholders/placeholder-wide.svg",
    "/placeholders/placeholder-wide.svg",
  ];

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-[var(--bg-0)] to-[var(--bg-2)] rounded-3xl overflow-hidden border border-white/10">
      {/* Top nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--mint)] to-[var(--cyan)]" />
          <span className="text-sm font-semibold text-[var(--txt)]">{title}</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-[var(--txt-secondary)]">
          <a className="hover:text-[var(--txt)]" href="#features">Features</a>
          <a className="hover:text-[var(--txt)]" href="#showcase">Showcase</a>
          <a className="hover:text-[var(--txt)]" href="#pricing">Pricing</a>
          <a className="hover:text-[var(--txt)]" href="#faq">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:block text-xs text-[var(--muted)]">{domain}</span>
          <a className="px-3 py-1.5 text-sm rounded-full border border-white/15 btn-focus-full hover:bg-white/5" href="/build">Get Started</a>
        </div>
      </div>

      {/* Hero */}
      <section className="px-8 md:px-12 py-12 md:py-16 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-[var(--txt-primary)] mb-4">
          {outcome || "A modern website for your brand"}
        </h1>
        <p className="text-[var(--txt-secondary)] max-w-2xl mx-auto">
          Built for speed, conversion and story. This example mirrors the aesthetic of the real build: clean, cinematic, and high-performing.
        </p>
        <div className="mt-8 grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { label: "Key Metric", value: metric || "↑ Conversion" },
            { label: "Load Time", value: "0.6s" },
            { label: "SEO", value: "98" },
          ].map((m) => (
            <div key={m.label} className="glass rounded-xl p-4">
              <div className="text-sm text-[var(--muted)]">{m.label}</div>
              <div className="text-xl font-semibold text-[var(--txt)]">{m.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Showcase carousel (simple) */}
      <section id="showcase" className="px-6 md:px-10 pb-12">
        <div className="grid md:grid-cols-2 gap-4">
          {showcase.slice(0, 3).map((src, i) => (
            <div key={i} className="rounded-2xl overflow-hidden glass-strong">
              <div className="aspect-[16/9] relative bg-white">
                <Image src={src} alt={`Showcase ${i + 1}`} fill className="object-cover" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 md:px-10 pb-12">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              title: "Cinematic visuals",
              copy: "Elegant gradients, glass and stone textures. Beautiful by default.",
            },
            {
              title: "Conversion-first",
              copy: "Clear CTAs, fast loads, and a layout tuned for action.",
            },
            {
              title: "SEO + performance",
              copy: "Semantic markup and responsive images out of the box.",
            },
          ].map((f) => (
            <div key={f.title} className="glass rounded-xl p-5">
              <h3 className="text-[var(--txt)] font-semibold mb-1">{f.title}</h3>
              <p className="text-[var(--txt-secondary)] text-sm">{f.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="px-6 md:px-10 pb-12">
        <div className="glass-strong rounded-2xl p-6 md:p-8 text-center">
          <p className="text-lg md:text-xl text-[var(--txt)] italic max-w-3xl mx-auto">“{result || "The redesign paid for itself in weeks. Our conversions jumped and support tickets fell."}”</p>
          <p className="text-[var(--muted)] mt-2">— Client Team</p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 md:px-10 pb-12">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "Starter", price: "$5k", points: ["3 pages", "Brand styling", "Basic SEO"] },
            { name: "Growth", price: "$10k", points: ["6–8 pages", "CMS", "Analytics & A/B"] },
            { name: "Scale", price: "$18k+", points: ["Custom pages", "Integrations", "Performance budget"] },
          ].map((t, i) => (
            <div key={t.name} className={`rounded-2xl p-6 border glass ${i === 1 ? "border-mint-400/40 bg-white/5" : "border-white/10"}`}>
              <h3 className="text-[var(--txt)] font-semibold">{t.name}</h3>
              <div className="text-3xl font-bold text-[var(--txt)] mt-2">{t.price}</div>
              <ul className="mt-4 space-y-2 text-sm text-[var(--txt-secondary)]">
                {t.points.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)]" />
                    {p}
                  </li>
                ))}
              </ul>
              <a href="/build" className="mt-6 inline-block px-4 py-2 rounded-full border border-white/15 btn-focus-full hover:bg-white/5">Start</a>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 md:px-10 pb-12">
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { q: "How fast is it?", a: "Most pages load under 1 second on modern devices." },
            { q: "Is it editable?", a: "Yes — we wire CMS where needed so your team can update content." },
            { q: "Do you integrate analytics?", a: "We ship with best-practice analytics and optional A/B testing." },
            { q: "What about SEO?", a: "Semantic markup, sitemaps, metadata — all covered." },
          ].map((f) => (
            <div key={f.q} className="glass rounded-xl p-5">
              <h4 className="text-[var(--txt)] font-semibold mb-1">{f.q}</h4>
              <p className="text-[var(--txt-secondary)] text-sm">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-6 md:px-10 pb-12">
        <div className="glass-strong rounded-2xl p-6 md:p-8 text-center">
          <h3 className="text-xl font-semibold text-[var(--txt)] mb-2">Like what you see?</h3>
          <p className="text-[var(--txt-secondary)] mb-4">This is a representative example. We tailor every build to your brand and goals.</p>
          <a className="inline-block px-5 py-2 rounded-full border border-white/15 btn-focus-full hover:bg-white/5" href="/build">Start your build</a>
        </div>
      </section>
    </div>
  );
}
