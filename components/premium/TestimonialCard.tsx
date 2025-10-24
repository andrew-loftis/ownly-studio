"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
  className?: string;
}

const BLUR = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

export default function TestimonialCard({ 
  quote, 
  author, 
  role, 
  company,
  avatar,
  className = "" 
}: TestimonialCardProps) {
  return (
    <motion.div
      className={`glass-strong rounded-xl p-6 relative group ${className}`}
      whileHover={{ 
        y: -4,
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
      }}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
    >
      {/* Quote mark */}
      <div className="absolute top-4 right-4 text-[var(--mint)] opacity-20 group-hover:opacity-40 transition-opacity duration-300">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
        </svg>
      </div>

      {/* Quote text */}
      <blockquote className="text-[var(--txt)] text-sm leading-relaxed mb-4 pr-8">
        "{quote}"
      </blockquote>

      {/* Author info */}
      <div className="flex items-center gap-3">
        {avatar && (
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
            <Image
              src={avatar}
              alt={author}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              placeholder="blur"
              blurDataURL={BLUR}
            />
          </div>
        )}
        <div>
          <div className="text-[var(--txt)] font-medium text-sm">
            {author}
          </div>
          <div className="text-[var(--muted)] text-xs">
            {role}{company && `, ${company}`}
          </div>
        </div>
      </div>
    </motion.div>
  );
}