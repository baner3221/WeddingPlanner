import { CheckCircle } from 'lucide-react';

export default function RunSheet() {
  const events = [
    { time: '08:00 AM', task: 'Makeup Artist Arrives', owner: 'Bride', status: 'pending' },
    { time: '09:30 AM', task: 'Photographer Arrives', owner: 'Media Team', status: 'pending' },
    { time: '10:00 AM', task: 'Haldi Ceremony Begins', owner: 'All', status: 'pending' },
    { time: '01:00 PM', task: 'Lunch Service', owner: 'Catering', status: 'pending' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <header className="flex justify-between items-end">
        <div className="page-header mb-0">
          <h1 className="page-title">Run Sheet</h1>
          <p className="page-subtitle">Minute-by-minute timeline for the big day.</p>
        </div>
        <button className="btn-primary">Download PDF</button>
      </header>

      <div className="card-static p-6 md:p-8">
        <div className="space-y-6">
          {events.map((e, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="w-24 shrink-0 text-right font-medium text-accent pt-1">{e.time}</div>
              <div className="flex-1 pb-6 border-b border-border-subtle">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{e.task}</h3>
                    <p className="text-sm text-text-secondary mt-1">Owner: {e.owner}</p>
                  </div>
                  <button className="btn-ghost p-2 rounded-full">
                    <CheckCircle size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
