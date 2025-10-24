import Link from "next/link";
import Button from "./ui/Button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-[var(--border-1)] backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Brand */}
          <Link 
            href="/" 
            className="text-xl font-bold text-[var(--txt-primary)] hover:text-[var(--mint)] transition-all duration-200 group"
          >
            <span className="inline-flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[var(--mint)] to-[var(--cyan)] flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-black text-sm font-bold">ø</span>
              </div>
              ownly studio
            </span>
          </Link>
          
          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/services" 
              className="text-[var(--txt-tertiary)] hover:text-[var(--txt-primary)] hover:scale-105 transition-all duration-200 font-medium"
            >
              Services
            </Link>
            <Link 
              href="/work" 
              className="text-[var(--txt-tertiary)] hover:text-[var(--txt-primary)] hover:scale-105 transition-all duration-200 font-medium"
            >
              Work
            </Link>
            <Link 
              href="/build" 
              className="relative text-[var(--txt-tertiary)] hover:text-[var(--mint)] hover:scale-105 transition-all duration-200 font-medium"
            >
              Build
              <div className="absolute -top-1 -right-2 w-2 h-2 bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] rounded-full animate-pulse" />
            </Link>
            <Link 
              href="/account" 
              className="text-[var(--txt-tertiary)] hover:text-[var(--txt-primary)] hover:scale-105 transition-all duration-200 font-medium"
            >
              Account
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <Button variant="ghost" size="sm" className="md:hidden border-[var(--border-1)] hover:border-[var(--border-accent)]">
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </Button>
        </nav>
      </div>
    </header>
  );
}
