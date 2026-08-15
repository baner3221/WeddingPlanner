import { Users, IndianRupee } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Insights into your guest demographics and spending.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-static p-6 md:p-8 flex flex-col items-center justify-center min-h-[300px]">
          <Users size={32} className="text-text-tertiary mb-4" />
          <h3 className="font-medium text-text-primary mb-2">Guest RSVPs</h3>
          <p className="text-sm text-text-secondary">Charts will generate once RSVPs are sent.</p>
        </div>
        
        <div className="card-static p-6 md:p-8 flex flex-col items-center justify-center min-h-[300px]">
          <IndianRupee size={32} className="text-text-tertiary mb-4" />
          <h3 className="font-medium text-text-primary mb-2">Budget Allocation</h3>
          <p className="text-sm text-text-secondary">Charts will generate once vendor quotes are approved.</p>
        </div>
      </div>
    </div>
  );
}
