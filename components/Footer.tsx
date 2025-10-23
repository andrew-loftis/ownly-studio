export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[var(--bg-2)] mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Brand */}
          <div className="text-[var(--muted)] text-sm">
            © 2025 ownly studio. crafted with intention.
          </div>
          
          {/* Links */}
          <div className="flex space-x-6 text-sm">
            <a 
              href="#" 
              className="text-[var(--muted)] hover:text-[var(--txt)] transition-colors duration-200"
            >
              Privacy
            </a>
            <a 
              href="#" 
              className="text-[var(--muted)] hover:text-[var(--txt)] transition-colors duration-200"
            >
              Terms
            </a>
            <a 
              href="#" 
              className="text-[var(--muted)] hover:text-[var(--txt)] transition-colors duration-200"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
