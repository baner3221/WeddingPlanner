import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, CheckSquare, Wallet, Users, Store, 
  Calendar, FolderOpen, BookMarked, ClipboardList, 
  BedDouble, BarChart3, UserPlus, Gem, LogOut, Receipt
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/welcome');
  };

  return (
    <div className="flex h-screen bg-bg-base font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-bg-elevated border-r border-border-subtle shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-600 via-amber-500 to-yellow-600 flex items-center justify-center shadow-md">
            <Gem size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-text-primary">
            PlanLex
          </span>
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
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative">
        <Outlet />
      </main>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 w-full bg-bg-elevated/90 backdrop-blur-xl border-t border-border-subtle flex overflow-x-auto gap-6 px-4 py-2 pb-safe z-50 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-1.5 transition-colors shrink-0 ${
                isActive ? 'text-accent' : 'text-text-tertiary'
              }`}
            >
              <Icon size={20} />
              <span className="text-[9px] font-medium mt-0.5 whitespace-nowrap">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
