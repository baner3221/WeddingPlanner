import { BookMarked } from 'lucide-react';

export default function Bookings() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="page-header mb-0">
        <h1 className="page-title">Bookings & Contracts</h1>
        <p className="page-subtitle">Manage your vendor agreements and payment milestones.</p>
      </header>

      <div className="card-static p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="empty-state-icon mb-4">
          <BookMarked size={24} />
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-1">No Bookings Yet</h3>
        <p className="text-text-secondary text-sm max-w-md">
          Once you approve a vendor quote in the Quotations tab, it will appear here for contract management.
        </p>
      </div>
    </div>
  );
}
