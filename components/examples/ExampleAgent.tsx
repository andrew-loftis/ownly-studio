export default function ExampleAgent({
  title,
  outcome,
  metric,
  stack,
}: {
  title: string;
  outcome?: string;
  metric?: string;
  stack?: string;
}) {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="glass-strong rounded-2xl p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--txt)] mb-2">{title}</h1>
        <p className="text-[var(--txt-secondary)]">{outcome || "A production-ready agent example with metrics, capabilities, and sample flows."}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Accuracy", value: metric || "95%" },
          { label: "Median Response", value: "2.2s" },
          { label: "Daily Sessions", value: "1,240" },
          { label: "CSAT", value: "4.8/5" },
        ].map((m) => (
          <div key={m.label} className="glass rounded-xl p-4 text-center">
            <div className="text-sm text-[var(--muted)]">{m.label}</div>
            <div className="text-xl font-semibold text-[var(--txt)]">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Integrations & Config */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-strong rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[var(--txt)] mb-3">Integrations</h3>
          <div className="flex flex-wrap gap-2">
            {["CRM", "Stripe", "Slack", "Zendesk", "Shopify"].map((i) => (
              <span key={i} className="px-2 py-1 text-xs rounded-full border border-white/10">{i}</span>
            ))}
          </div>
          {stack && <p className="text-[var(--muted)] text-xs mt-3">Stack: {stack}</p>}
        </div>
        <div className="glass-strong rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[var(--txt)] mb-3">Configuration</h3>
          <ul className="space-y-2 text-sm text-[var(--txt-secondary)]">
            {["Tone: brand-safe, helpful", "Languages: EN, ES", "Escalation: email + Slack", "Memory: 30 days"].map((c) => (
              <li key={c} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)]" /> {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sample flow */}
      <div className="glass-strong rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-[var(--txt)] mb-3">Sample Conversation</h3>
        <div className="space-y-3">
          <div className="rounded-xl bg-white/5 p-3"><span className="text-[var(--muted)]">User:</span> How do I reset my password?</div>
          <div className="rounded-xl bg-white/10 p-3"><span className="text-[var(--muted)]">Agent:</span> Tap Settings → Security → Reset Password. I can also send a link to your email on file.</div>
          <div className="rounded-xl bg-white/5 p-3"><span className="text-[var(--muted)]">User:</span> Send the link.</div>
          <div className="rounded-xl bg-white/10 p-3"><span className="text-[var(--muted)]">Agent:</span> Done. Check your inbox. The link expires in 15 minutes.</div>
        </div>
        <a href="/build" className="mt-4 inline-block px-4 py-2 rounded-full border border-white/15 btn-focus-full hover:bg-white/5">Launch an agent like this</a>
      </div>
    </div>
  );
}
