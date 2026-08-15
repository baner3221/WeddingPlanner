import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { Sparkles, CheckSquare, Users, Wallet, Calendar, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState<string>('Loading latest update...');
  const [daysToGo, setDaysToGo] = useState<string>('--');

  useEffect(() => {
    api.get('/api/summary')
      .then(res => setSummary(res.data.summary))
      .catch(() => setSummary('Welcome to your wedding planner! Connect the backend to see AI-powered updates and insights.'));

    // Fetch user metadata for wedding date
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.wedding_date) {
        const weddingDate = new Date(user.user_metadata.wedding_date);
        const today = new Date();
        const diffTime = weddingDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysToGo(diffDays > 0 ? diffDays.toString() : '0');
      }
    });
  }, []);

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Command Center</h1>
        <p className="page-subtitle">Here's what's happening with your wedding.</p>
      </header>

      {/* AI Summary Card */}
      <section className="card-static p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-accent pointer-events-none">
          <Sparkles size={160} />
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-accent/15 p-2.5 rounded-xl text-accent">
            <Sparkles size={22} />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">Latest AI Update</h2>
        </div>
        <p className="text-base text-text-secondary leading-relaxed max-w-3xl relative z-10">
          {summary}
        </p>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare size={16} className="text-accent" />
            <p className="stat-label">Tasks Done</p>
          </div>
          <p className="stat-value">--</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-accent" />
            <p className="stat-label">Guests Confirmed</p>
          </div>
          <p className="stat-value">--</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <Wallet size={16} className="text-accent" />
            <p className="stat-label">Budget Spent</p>
          </div>
          <p className="stat-value">--</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-accent" />
            <p className="stat-label">Days to Go</p>
          </div>
          <p className="stat-value">{daysToGo}</p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="card-static p-6">
        <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Add Guest', path: '/guests', icon: Users },
            { label: 'Add Task', path: '/checklist', icon: CheckSquare },
            { label: 'View Timeline', path: '/timeline', icon: Calendar },
          ].map(action => (
            <a
              key={action.path}
              href={action.path}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-border-subtle transition-all group"
            >
              <action.icon size={18} className="text-accent" />
              <span className="text-sm font-medium text-text-primary">{action.label}</span>
              <ArrowRight size={14} className="text-text-tertiary ml-auto group-hover:translate-x-0.5 transition-transform" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
