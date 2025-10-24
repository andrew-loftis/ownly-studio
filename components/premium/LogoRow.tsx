"use client";

import { motion } from "framer-motion";
import Marquee from "./Marquee";

interface LogoRowProps {
  logos: Array<{
    name: string;
    src: string;
    width?: number;
    height?: number;
  }>;
  title?: string;
  className?: string;
}

export default function LogoRow({ 
  logos, 
  title = "Selected work across",
  className = "" 
}: LogoRowProps) {
  return (
    <section className={`py-16 ${className}`}>
      {title && (
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-wide text-[var(--txt-tertiary)] font-medium mb-2">
            {title}
          </p>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-[var(--mint)] to-transparent mx-auto" />
        </div>
      )}
      
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-1)] via-transparent to-[var(--bg-1)] z-10 pointer-events-none" />
        <Marquee speed={40} className="opacity-50 hover:opacity-80 transition-opacity duration-500">
          {logos.map((logo, index) => (
            <motion.div
              key={`${logo.name}-${index}`}
              className="mx-8 flex items-center justify-center group"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative p-4 rounded-xl glass group-hover:glass-accent transition-all duration-300">
                <img
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width || 120}
                  height={logo.height || 60}
                  className="max-w-[120px] max-h-[60px] object-contain filter brightness-75 group-hover:brightness-100 transition-all duration-300"
                />
              </div>
            </motion.div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}