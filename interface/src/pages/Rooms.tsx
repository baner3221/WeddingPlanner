import { useState, useEffect } from 'react';
import { BedDouble, Search, Users, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

type MergedData = {
  guestName: string;
  side: string;
  place: string;
  persons: number;
  hotel: string;
  room: string;
  roomType: string;
  dates: string;
};

export default function Rooms() {
  const [data, setData] = useState<MergedData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHotelData = async () => {
    try {
      const [guestsRes, roomsRes] = await Promise.all([
        supabase.from('guests').select('*'),
        supabase.from('room_allocations').select('*')
      ]);

      if (guestsRes.error) throw guestsRes.error;
      if (roomsRes.error) throw roomsRes.error;

      const guests = guestsRes.data || [];
      const rooms = roomsRes.data || [];

      // Merge data based on guest name (case insensitive)
      const merged: MergedData[] = rooms.map((r: any) => {
        const matchingGuest = guests.find(g => 
          g.name?.toLowerCase().trim() === r.guest_name?.toLowerCase().trim()
        );

        return {
          guestName: r.guest_name || matchingGuest?.name || 'Unknown',
          side: matchingGuest?.side || 'Unknown',
          place: matchingGuest?.place || '-',
          persons: matchingGuest?.number_of_persons || 1,
          hotel: r.hotel_name || '-',
          room: r.room_number || 'TBA',
          roomType: r.room_type || '-',
          dates: matchingGuest ? `${matchingGuest.arrival_date || '-'} to ${matchingGuest.departure_date || '-'}` : '-',
        };
      });

      // Also add guests who don't have a room yet
      guests.forEach((g: any) => {
        const hasRoom = merged.some(m => m.guestName.toLowerCase().trim() === g.name?.toLowerCase().trim());
        if (!hasRoom) {
          merged.push({
            guestName: g.name || 'Unknown',
            side: g.side || 'Unknown',
            place: g.place || '-',
            persons: g.number_of_persons || 1,
            hotel: 'Unassigned',
            room: '-',
            roomType: '-',
            dates: `${g.arrival_date || '-'} to ${g.departure_date || '-'}`,
          });
        }
      });

      // Sort unassigned first, then by side
      merged.sort((a, b) => {
        if (a.hotel === 'Unassigned' && b.hotel !== 'Unassigned') return -1;
        if (a.hotel !== 'Unassigned' && b.hotel === 'Unassigned') return 1;
        return a.side.localeCompare(b.side);
      });

      setData(merged);
    } catch (e) {
      toast.error('Failed to load hotel management data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHotelData();
  }, []);

  const filteredData = data.filter(d => 
    d.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.hotel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Hotel Management</h1>
          <p className="page-subtitle">Unified view of guest room allocations and sides.</p>
        </div>
        
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search guests or rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9 py-2 text-sm w-full md:w-64"
          />
        </div>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-static p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <BedDouble size={20} className="text-accent" />
          </div>
          <div>
            <p className="text-text-tertiary text-xs uppercase tracking-wider font-semibold">Total Rooms</p>
            <p className="text-xl font-bold text-text-primary">{data.filter(d => d.hotel !== 'Unassigned').length}</p>
          </div>
        </div>
        <div className="card-static p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <Users size={20} className="text-text-secondary" />
          </div>
          <div>
            <p className="text-text-tertiary text-xs uppercase tracking-wider font-semibold">Total Guests</p>
            <p className="text-xl font-bold text-text-primary">{data.reduce((acc, curr) => acc + curr.persons, 0)}</p>
          </div>
        </div>
        <div className="card-static p-4 flex items-center gap-4 border-l-[3px] border-l-blue-500">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Shield size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="text-text-tertiary text-xs uppercase tracking-wider font-semibold">Bride's Side</p>
            <p className="text-xl font-bold text-text-primary">{data.filter(d => d.side.toLowerCase() === 'bride').length} rooms</p>
          </div>
        </div>
        <div className="card-static p-4 flex items-center gap-4 border-l-[3px] border-l-amber-500">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Shield size={20} className="text-amber-500" />
          </div>
          <div>
            <p className="text-text-tertiary text-xs uppercase tracking-wider font-semibold">Groom's Side</p>
            <p className="text-xl font-bold text-text-primary">{data.filter(d => d.side.toLowerCase() === 'groom').length} rooms</p>
          </div>
        </div>
      </div>

      <div className="card-static overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-text-tertiary animate-pulse">Loading hotel roster...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="table-header whitespace-nowrap">
                  <th className="pb-3 px-4 pt-4">Guest Name</th>
                  <th className="pb-3 px-4 pt-4">Side</th>
                  <th className="pb-3 px-4 pt-4">Pax</th>
                  <th className="pb-3 px-4 pt-4">Hotel & Room</th>
                  <th className="pb-3 px-4 pt-4">Room Type</th>
                  <th className="pb-3 px-4 pt-4">Check In/Out</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-text-tertiary">No guests found</td>
                  </tr>
                ) : (
                  filteredData.map((row, i) => (
                    <tr key={i} className="table-row whitespace-nowrap group">
                      <td className="py-4 px-4 font-medium text-text-primary">{row.guestName}</td>
                      <td className="py-4 px-4">
                        <span className={`badge ${
                          row.side.toLowerCase() === 'bride' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          row.side.toLowerCase() === 'groom' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                          'badge-default'
                        }`}>
                          {row.side}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-text-secondary">{row.persons}</td>
                      <td className="py-4 px-4">
                        {row.hotel === 'Unassigned' ? (
                          <span className="text-error/80 text-sm font-medium">Needs Assignment</span>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-text-primary font-medium">{row.room}</span>
                            <span className="text-xs text-text-tertiary">{row.hotel}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-text-secondary">{row.roomType}</td>
                      <td className="py-4 px-4 text-text-secondary text-sm">{row.dates}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
