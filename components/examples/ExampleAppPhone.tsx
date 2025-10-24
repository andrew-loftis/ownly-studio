"use client";

import Image from "next/image";
import { useState } from "react";

export default function ExampleAppPhone({
  title,
  images,
  outcome,
  metric,
  stack,
}: {
  title: string;
  images: string[];
  outcome?: string;
  metric?: string;
  stack?: string;
}) {
  const [tab, setTab] = useState<"Home" | "Explore" | "Profile">("Home");
  const screens: Record<string, string> = {
    Home: images[0] ?? "/placeholders/placeholder-tall.svg",
    Explore: images[1] ?? "/placeholders/placeholder-tall.svg",
    Profile: images[2] ?? "/placeholders/placeholder-tall.svg",
  };
  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      <div className="relative justify-self-center">
        <div className="w-[320px] h-[660px] bg-black rounded-[50px] p-2 shadow-2xl">
          <div className="w-full h-full bg-[var(--bg-1)] rounded-[42px] overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-8 bg-black/20 flex items-center justify-between px-6 text-white text-xs">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-white rounded-full" />
                <div className="w-1 h-1 bg-white rounded-full" />
                <div className="w-1 h-1 bg-white rounded-full" />
                <span>100%</span>
              </div>
            </div>
            <div className="pt-8 h-full">
              <Image src={screens[tab]} alt={`${title} - ${tab}`} fill className="object-cover" />
            </div>
            {/* Bottom nav */}
            <div className="absolute bottom-2 left-0 right-0 flex items-center justify-around px-8 py-2">
              {["Home", "Explore", "Profile"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t as any)}
                  className={`px-3 py-1 rounded-full text-xs border btn-focus-full ${
                    tab === t ? "border-mint-400/40 bg-white/10" : "border-white/15 bg-black/20"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute inset-0 rounded-[50px] hover:bg-mint-400/10 transition-colors" />
      </div>
      {/* Side panel */}
      <aside className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--txt)]">{outcome || `${title} mobile app`}</h2>
        <p className="text-[var(--txt-secondary)]">Cinematic, fast, and intuitive. This example demonstrates the core flow and a clean, branded UI.</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Key Metric", value: metric || "↑ Retention" },
            { label: "FPS", value: "60" },
            { label: "Crash-free", value: "99.9%" },
          ].map((m) => (
            <div key={m.label} className="glass rounded-xl p-3 text-center">
              <div className="text-xs text-[var(--muted)]">{m.label}</div>
              <div className="text-lg font-semibold text-[var(--txt)]">{m.value}</div>
            </div>
          ))}
        </div>
        {stack && (
          <div className="flex flex-wrap gap-2">
            {stack.split(",").map((s, i) => (
              <span key={i} className="px-2 py-1 text-xs rounded-full border border-white/10">{s.trim()}</span>
            ))}
          </div>
        )}
        <ul className="space-y-2 text-sm text-[var(--txt-secondary)]">
          {["Onboarding flow", "Primary dashboard", "Profile & settings"].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)]" /> {f}
            </li>
          ))}
        </ul>
        <a href="/build" className="inline-block px-4 py-2 rounded-full border border-white/15 btn-focus-full hover:bg-white/5">Build something like this</a>
      </aside>
    </div>
  );
}
