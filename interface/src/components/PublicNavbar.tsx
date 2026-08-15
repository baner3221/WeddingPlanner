import { Link } from 'react-router-dom';
import { Gem } from 'lucide-react';

export function PublicNavbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-bg-base/80 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/welcome" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-600 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
            <Gem size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-text-primary font-serif">
            PlanLex
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
          <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
          <a href="#about" className="hover:text-text-primary transition-colors">About</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors hidden sm:block">
            Log in
          </Link>
          <Link to="/signup" className="btn-primary">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
