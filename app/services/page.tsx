"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/SectionHeading";

const services = [
  {
    name: "Launch",
    description: "Launch fast with core features.",
    features: ["MVP in 2 weeks", "Core features only", "Mobile-first"],
    price: "Quick start",
    gradient: "from-[var(--mint)] to-[var(--cyan)]",
  },
  {
    name: "Pro",
    description: "Auth, dashboards, integrations—complete solution.",
    features: ["User management", "Admin panels", "API connections", "Analytics"],
    price: "Full featured",
    gradient: "from-[var(--cyan)] to-[var(--coral)]",
    popular: true,
  },
  {
    name: "Platform",
    description: "Full stack, AI, ops—enterprise ready.",
    features: ["Custom AI models", "DevOps pipeline", "Multi-tenant", "White label"],
    price: "Enterprise ready",
    gradient: "from-[var(--coral)] to-[var(--mint)]",
  },
];

export default function ServicesPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <main className="flex-1 py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <SectionHeading 
            kicker="Services"
            title="Pick your speed"
            className="mb-4"
          />
          <p className="text-[var(--muted)] text-lg max-w-2xl mx-auto">
            From rapid prototypes to enterprise platforms. All roads lead to shipped.
          </p>
        </div>

        {/* Service cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <div
              key={service.name}
              className="relative group cursor-pointer"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                transform: hoveredCard === index ? 'perspective(1000px) rotateX(5deg) rotateY(-5deg) translateY(-10px)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Popular badge */}
              {service.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] text-black text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Card */}
              <div className="glass-strong h-full p-8 rounded-2xl relative overflow-hidden">
                {/* Light sweep effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`,
                    transform: hoveredCard === index ? 'translateX(100%)' : 'translateX(-100%)',
                    transition: 'transform 0.6s ease-out',
                  }}
                />

                {/* Content */}
                <div className="relative z-10 space-y-6">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6`}>
                    <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                      {index === 0 && (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      )}
                      {index === 1 && (
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      )}
                      {index === 2 && (
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      )}
                    </svg>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--txt)] mb-2">{service.name}</h3>
                    <p className="text-[var(--muted)] text-lg">{service.description}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-[var(--txt)]">
                        <svg className="w-4 h-4 text-[var(--mint)] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Price */}
                  <div className="pt-4 border-t border-white/10">
                    <span className="text-[var(--muted)] text-sm">{service.price}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/build">
            <Button variant="primary" size="lg">
              Request proposal
            </Button>
          </Link>
          <p className="text-[var(--muted)] text-sm mt-4">
            30-minute discovery call. No commitment required.
          </p>
        </div>
      </div>
    </main>
  );
}
