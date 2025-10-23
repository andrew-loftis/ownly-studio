import Link from "next/link";
import Button from "./ui/Button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Brand */}
          <Link 
            href="/" 
            className="text-xl font-bold text-[var(--txt)] hover:text-[var(--mint)] transition-colors duration-200"
          >
            ø ownly studio
          </Link>
          
          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/services" 
              className="text-[var(--muted)] hover:text-[var(--txt)] transition-colors duration-200"
            >
              Services
            </Link>
            <Link 
              href="/work" 
              className="text-[var(--muted)] hover:text-[var(--txt)] transition-colors duration-200"
            >
              Work
            </Link>
            <Link 
              href="/build" 
              className="text-[var(--muted)] hover:text-[var(--txt)] transition-colors duration-200"
            >
              Build
            </Link>
            <Link 
              href="/account" 
              className="text-[var(--muted)] hover:text-[var(--txt)] transition-colors duration-200"
            >
              Account
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <Button variant="ghost" size="sm" className="md:hidden">
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
