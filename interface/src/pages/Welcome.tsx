import { Link } from 'react-router-dom';
import { PublicNavbar } from '../components/PublicNavbar';
import { ArrowRight, CheckCircle2, Users, Calendar, MapPin, Heart, Sparkles, Gem } from 'lucide-react';

export default function Welcome() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans selection:bg-accent/30">
      <PublicNavbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-6 overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-5xl mx-auto text-center relative z-10 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-8">
              <Sparkles size={16} />
              The AI-Powered Wedding OS
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold font-serif leading-tight mb-8">
              Plan your dream wedding, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-600">
                without the stress.
              </span>
            </h1>
            
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12">
              Everything you need to manage your guest list, room allocations, budget, and vendors in one beautiful dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="btn-primary text-base px-8 py-4">
                Start Planning Free
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-8 py-4">
                View Demo
              </Link>
            </div>
          </div>
        </section>

        {/* Dashboard Preview / Social Proof */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-3xl border border-border-default bg-bg-elevated/50 p-2 shadow-2xl relative">
               <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-transparent z-10 rounded-3xl" />
               <img 
                 src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2000&auto=format&fit=crop" 
                 alt="Wedding Planning Interface Preview" 
                 className="rounded-2xl w-full h-[600px] object-cover opacity-80"
               />
               <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-20">
                 <p className="text-2xl font-serif text-white mb-4 drop-shadow-lg">"The only tool you need to manage a big Indian wedding."</p>
                 <div className="flex items-center gap-2 text-accent">
                   {[1, 2, 3, 4, 5].map(i => <Heart key={i} size={20} fill="currentColor" />)}
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6 bg-bg-elevated">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif font-bold mb-4">Everything in one place</h2>
              <p className="text-text-secondary text-lg">Powerful tools built specifically for modern wedding planning.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Users, title: 'Smart Guest List', desc: 'Group by families, track RSVPs, dietary needs, and side (bride/groom).' },
                { icon: MapPin, title: 'Room Allocations', desc: 'Manage hotel blocks, room types, and check-in dates flawlessly.' },
                { icon: Calendar, title: 'Timeline & Runsheet', desc: 'Minute-by-minute itinerary for you, your family, and vendors.' },
                { icon: CheckCircle2, title: 'Checklists', desc: 'Never miss a deadline with our comprehensive, customizable checklists.' },
                { icon: Sparkles, title: 'AI Assistant', desc: 'Upload vendor quotes and let AI extract pricing and details instantly.' },
                { icon: Heart, title: 'Inspiration Board', desc: 'Save all your Pinterest finds and share them with decorators directly.' }
              ].map((feature, idx) => (
                <div key={idx} className="card p-8 group">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon size={24} className="text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8">Ready to start planning?</h2>
            <Link to="/signup" className="btn-primary text-lg px-10 py-5 shadow-[0_0_40px_rgba(245,158,11,0.3)]">
              Create your free workspace
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Gem size={20} className="text-accent" />
            <span className="font-serif font-bold text-xl">PlanLex</span>
          </div>
          <p className="text-text-tertiary text-sm">
            © {new Date().getFullYear()} PlanLex OS. Built for personal use.
          </p>
        </div>
      </footer>
    </div>
  );
}
