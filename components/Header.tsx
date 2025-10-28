"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Button from "./ui/Button";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`relative text-sm font-medium transition-colors duration-200 ${
          active ? "text-[var(--txt)]" : "text-[var(--txt-tertiary)] hover:text-[var(--txt)]"
        }`}
      >
        <span className="inline-block py-1">
          {children}
          <span
            className={`absolute left-0 -bottom-0.5 h-px bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] transition-all duration-300 ${
              active ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
            }`}
          />
        </span>
      </Link>
    );
  };

  return (
    <header className={`sticky top-0 z-50 transition-all ${scrolled ? 'shadow-[0_2px_0_rgba(255,255,255,0.05)]' : ''}`}>
      <div className={`relative border-b border-white/10 backdrop-blur-xl transition-colors ${scrolled ? 'bg-black/60' : 'bg-black/40'}`}>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--mint)]/40 to-transparent" />

  <div className={`max-w-[1400px] xl:max-w-[1600px] mx-auto px-4 ${scrolled ? 'py-2 md:py-3' : 'py-3 md:py-4'} transition-all`}>
          <nav className="flex items-center justify-between">
            {/* Brand */}
            <Link
              href="/"
              className={`font-bold text-[var(--txt-primary)] transition-all duration-200 group ${scrolled ? 'text-base md:text-lg' : 'text-lg md:text-xl'}`}
            >
              <span className="inline-flex items-center gap-2">
                <div className={`rounded-lg bg-gradient-to-br from-[var(--mint)] to-[var(--cyan)] flex items-center justify-center transition-transform duration-200 ${scrolled ? 'w-5 h-5' : 'w-6 h-6'} group-hover:scale-110`}>
                  <span className={`text-black font-bold ${scrolled ? 'text-xs' : 'text-sm'}`}>ø</span>
                </div>
                ownly studio
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              <NavLink href="/services">Services</NavLink>
              <NavLink href="/work">Work</NavLink>
              <Link href="/build" className="relative group text-sm font-medium text-[var(--txt-tertiary)] hover:text-[var(--mint)] transition-colors duration-200">
                <span className="inline-block py-1">Build</span>
                <div className="absolute -top-1 -right-2 w-2 h-2 bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] rounded-full animate-pulse" />
              </Link>
              <NavLink href="/account">Account</NavLink>
            </div>

            {/* Mobile menu button */}
            <Button
              aria-label="Open menu"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(true)}
              className="md:hidden border border-white/10 hover:border-white/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </nav>
        </div>
      </div>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative bg-[rgb(10,12,14)/0.9] backdrop-blur-xl border-b border-white/10 shadow-xl"
            >
              <div className="px-4 py-3 flex items-center justify-between">
                <Link href="/" className="text-base font-semibold text-[var(--txt)]" onClick={() => setOpen(false)}>
                  ownly studio
                </Link>
                <Button aria-label="Close menu" variant="ghost" size="sm" onClick={() => setOpen(false)} className="border border-white/10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
              <div className="px-4 pb-4 grid gap-2">
                <Link href="/services" className="px-2 py-2 rounded-lg border border-white/10 text-[var(--txt-secondary)] hover:text-[var(--txt)]" onClick={() => setOpen(false)}>Services</Link>
                <Link href="/work" className="px-2 py-2 rounded-lg border border-white/10 text-[var(--txt-secondary)] hover:text-[var(--txt)]" onClick={() => setOpen(false)}>Work</Link>
                <Link href="/build" className="px-2 py-2 rounded-lg border border-white/10 text-[var(--txt-secondary)] hover:text-[var(--mint)]" onClick={() => setOpen(false)}>Build</Link>
                <Link href="/account" className="px-2 py-2 rounded-lg border border-white/10 text-[var(--txt-secondary)] hover:text-[var(--txt)]" onClick={() => setOpen(false)}>Account</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
