import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gem, Mail, Lock, User, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Signup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    date: ''
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            wedding_date: formData.date
          }
        }
      });

      if (error) throw error;
      
      toast.success('Account created! Welcome to PlanLex.');
      navigate('/'); // Go to dashboard
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-accent/30">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-slide-up">
        <Link to="/welcome" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-600 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
            <Gem size={24} className="text-white" />
          </div>
        </Link>
        <h2 className="text-center text-3xl font-serif font-bold text-text-primary tracking-tight">
          Create your workspace
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Or <Link to="/login" className="font-medium text-accent hover:text-accent-hover transition-colors">sign in to your existing account</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-bg-elevated py-8 px-4 shadow-xl border border-border-default sm:rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSignup}>
            <div>
              <label className="label">Full Name</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-text-tertiary" />
                </div>
                <input
                  required
                  type="text"
                  className="input pl-10"
                  placeholder="e.g. John & Jane"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="label">Email address</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-text-tertiary" />
                </div>
                <input
                  required
                  type="email"
                  className="input pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-text-tertiary" />
                </div>
                <input
                  required
                  type="password"
                  className="input pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="label">Wedding Date (Optional)</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-text-tertiary" />
                </div>
                <input
                  type="date"
                  className="input pl-10"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center text-base py-3"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
