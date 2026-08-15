import { useState } from 'react';
import { UserPlus } from 'lucide-react';

const familyMembers = [
  { id: 1, name: 'Ms. Meghomita Brahmachari', role: 'Bride', side: 'Bride' },
  { id: 2, name: 'Mr. Ashutosh Kadyan', role: 'Groom', side: 'Groom' },
  { id: 3, name: 'Dr. Debjyoti Brahmachari', role: 'Father of Bride', side: 'Bride' },
  { id: 4, name: 'Dr. Swagata Brahmachari', role: 'Mother of Bride', side: 'Bride' },
  { id: 5, name: 'Mr. Anand Kadyan', role: 'Father of Groom', side: 'Groom' },
];

export default function Family() {
  const [members] = useState(familyMembers);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Core Family & Team</h1>
          <p className="page-subtitle">Manage access and roles for your close family members.</p>
        </div>
        
        <button className="btn-primary">
          <UserPlus size={18} />
          Invite Member
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map(member => (
          <div key={member.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center text-accent text-xl font-bold font-serif">
                {member.name.charAt(0)}
              </div>
              <span className={`badge ${member.side === 'Bride' ? 'badge-info' : 'badge-warning'}`}>
                {member.side}'s Side
              </span>
            </div>
            
            <h3 className="text-xl font-semibold text-text-primary mb-1">{member.name}</h3>
            <p className="text-sm font-medium text-text-tertiary mb-4">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
