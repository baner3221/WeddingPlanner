import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, CheckSquare, Wallet, Users, Store, 
  Calendar, FolderOpen, BookMarked, ClipboardList, 
  BedDouble, BarChart3, UserPlus, Gem, LogOut, Receipt,
  Menu, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Checklist', path: '/checklist', icon: CheckSquare },
  { name: 'Budget', path: '/budget', icon: Wallet },
  { name: 'Guest List', path: '/guests', icon: Users },
  { name: 'Vendors', path: '/vendors', icon: Store },
  { name: 'Timeline', path: '/timeline', icon: Calendar },
  { name: 'Documents', path: '/documents', icon: FolderOpen },
  { name: 'Bookings', path: '/bookings', icon: BookMarked },
  { name: 'Run Sheet', path: '/runsheet', icon: ClipboardList },
  { name: 'Rooms', path: '/rooms', icon: BedDouble },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Expenses', path: '/expenses', icon: Receipt },
  { name: 'Family', path: '/family', icon: UserPlus },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/welcome');
  };

  return (
    <div className="flex h-screen bg-bg-base font-sans overflow-hidden">
      
      {/* Mobile Header */}
      <header className="md:hidden absolute top-0 left-0 w-full h-16 bg-bg-elevated border-b border-border-subtle flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-600 via-amber-500 to-yellow-600 flex items-center justify-center shadow-sm">
            <Gem size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-text-primary">
            PlanLex
          </span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-bg-elevated border-r border-border-subtle shrink-0 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Logo Area */}
        <div className="px-6 py-5 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-600 via-amber-500 to-yellow-600 flex items-center justify-center shadow-md">
              <Gem size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-text-primary">
              PlanLex
            </span>
          </div>
          {/* Mobile close button */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1 text-text-tertiary hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-white/10 text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                <Icon size={17} className={isActive ? 'text-accent' : ''} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="px-4 py-4 border-t border-border-subtle flex items-center justify-between">
          <div className="text-[11px] text-text-tertiary">
            PlanLex · Wedding OS
          </div>
          <button onClick={handleSignOut} className="text-text-tertiary hover:text-text-primary transition-colors p-1" title="Sign out">
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative pt-16 md:pt-0 w-full">
        <Outlet />
      </main>

    </div>
  );
}
