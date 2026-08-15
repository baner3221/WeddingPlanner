import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Budget() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBudget = async () => {
      const { data, error } = await supabase.from('quotations').select('*');
      if (!error && data) {
        setQuotations(data);
      }
      setIsLoading(false);
    };
    fetchBudget();
  }, []);

  const totalEstimated = quotations.reduce((sum, q) => sum + (Number(q.cost) || 0), 0);
  const totalApproved = quotations.filter(q => q.status === 'approved').reduce((sum, q) => sum + (Number(q.cost) || 0), 0);
  const totalPending = quotations.filter(q => q.status === 'pending').reduce((sum, q) => sum + (Number(q.cost) || 0), 0);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Advanced Budget</h1>
        <p className="page-subtitle">Dynamically tracking your vendor quotations and expenses.</p>
      </header>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card border-t-4 border-t-amber-500/50">
          <div className="flex items-center gap-2 mb-2 text-text-tertiary font-medium text-sm uppercase tracking-wider">
            <TrendingUp size={16} /> Total Proposed (All Quotes)
          </div>
          <p className="text-3xl font-bold text-text-primary">₹{totalEstimated.toLocaleString('en-IN')}</p>
          <p className="text-sm text-text-secondary mt-2">Sum of every quote received</p>
        </div>
        
        <div className="stat-card border-t-4 border-t-emerald-500/50">
          <div className="flex items-center gap-2 mb-2 text-text-tertiary font-medium text-sm uppercase tracking-wider">
            <CheckCircle size={16} className="text-emerald-500" /> Total Approved
          </div>
          <p className="text-3xl font-bold text-emerald-400">₹{totalApproved.toLocaleString('en-IN')}</p>
          <p className="text-sm text-text-secondary mt-2">Locked in for your wedding</p>
        </div>
        
        <div className="stat-card border-t-4 border-t-blue-500/50">
          <div className="flex items-center gap-2 mb-2 text-text-tertiary font-medium text-sm uppercase tracking-wider">
            <Clock size={16} className="text-blue-500" /> Pending Approval
          </div>
          <p className="text-3xl font-bold text-blue-400">₹{totalPending.toLocaleString('en-IN')}</p>
          <p className="text-sm text-text-secondary mt-2">Awaiting your review in Quotations</p>
        </div>
      </div>

      <div className="card-static p-8 min-h-[300px]">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Budget Breakdown by Category</h3>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40 text-text-tertiary animate-pulse">Calculating budget...</div>
        ) : quotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-40">
            <Wallet size={24} className="text-text-tertiary mb-3" />
            <p className="text-text-secondary">No quotations found.</p>
            <p className="text-sm text-text-tertiary mt-1">Head over to the Vendor Quotes tab to add your first expense.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Group by category */}
            {Object.entries(
              quotations.reduce((acc, q) => {
                const type = q.service_type || 'Other';
                if (!acc[type]) acc[type] = { total: 0, count: 0, approved: 0 };
                acc[type].total += Number(q.cost);
                acc[type].count += 1;
                if (q.status === 'approved') acc[type].approved += Number(q.cost);
                return acc;
              }, {} as Record<string, { total: number, count: number, approved: number }>)
            )
            .sort((a: any, b: any) => b[1].total - a[1].total)
            .map(([category, stats]: [string, any]) => (
              <div key={category} className="p-4 rounded-xl bg-white/5 border border-border-subtle flex justify-between items-center hover:bg-white/10 transition-colors">
                <div>
                  <h4 className="font-medium text-text-primary uppercase tracking-wide">{category}</h4>
                  <p className="text-sm text-text-tertiary">{stats.count} vendor quote(s)</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-text-primary">₹{stats.total.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-text-secondary">₹{stats.approved.toLocaleString('en-IN')} approved</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
