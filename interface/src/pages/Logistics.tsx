import React, { useState, useEffect } from 'react';
import { UploadCloud, Users, Home, MapPin, Search, Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Logistics() {
  const [activeTab, setActiveTab] = useState<'guests' | 'rooms' | 'travel'>('guests');
  const [isUploading, setIsUploading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]); // For dropdowns

  // Form State
  const [showForm, setShowForm] = useState(false);
  
  // Guest Form
  const [guestName, setGuestName] = useState('');
  const [guestSide, setGuestSide] = useState('Bride');
  const [guestPax, setGuestPax] = useState('1');
  const [guestEvents, setGuestEvents] = useState<string[]>([]);

  const WEDDING_EVENTS = ['Haldi', 'Mehendi', 'Sangeet', 'Reception', 'Wedding'];
  
  // Room/Travel Form
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [selectedGuestName, setSelectedGuestName] = useState('');
  const [roomHotel, setRoomHotel] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [travelPickup, setTravelPickup] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [travelTime, setTravelTime] = useState('');

  const fetchData = async () => {
    try {
      // Always fetch guests for dropdowns
      const { data: guestsData } = await supabase.from('guests').select('*').order('created_at', { ascending: false });
      if (guestsData) setGuests(guestsData);

      let table = 'guests';
      if (activeTab === 'rooms') table = 'room_allocations';
      if (activeTab === 'travel') table = 'travel_requests';

      const { data: result, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setData(result || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    setShowForm(false);
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    let table = 'guests';
    if (activeTab === 'rooms') table = 'room_allocations';
    if (activeTab === 'travel') table = 'travel_requests';

    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      toast.success('Record deleted');
      fetchData();
    } catch (e: any) {
      toast.error('Failed to delete: ' + e.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (activeTab === 'guests') {
        const { error } = await supabase.from('guests').insert({
          name: guestName,
          side: guestSide,
          number_of_persons: guestPax,
          events: guestEvents
        });
        if (error) throw error;
        toast.success('Guest added');
        setGuestName(''); setGuestEvents([]);
      } else if (activeTab === 'rooms') {
        // Find guest name for legacy mapping if guest_id isn't available
        const gName = guests.find(g => g.id === selectedGuestId)?.name || selectedGuestName;
        
        const { error } = await supabase.from('room_allocations').insert({
          guest_id: selectedGuestId || null, // Will be null if using name mapping
          guest_name: gName,
          hotel_name: roomHotel,
          room_number: roomNumber
        });
        if (error) throw error;
        toast.success('Room assigned');
        setRoomHotel(''); setRoomNumber('');
      } else if (activeTab === 'travel') {
        const gName = guests.find(g => g.id === selectedGuestId)?.name || selectedGuestName;
        // Build timezone-aware datetime string so Supabase doesn't assume UTC
        let travelDatetime = null;
        if (travelDate && travelTime) {
          const offsetMin = new Date().getTimezoneOffset();
          const sign = offsetMin <= 0 ? '+' : '-';
          const absH = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, '0');
          const absM = String(Math.abs(offsetMin) % 60).padStart(2, '0');
          travelDatetime = `${travelDate}T${travelTime}:00${sign}${absH}:${absM}`;
        } else if (travelDate) {
          travelDatetime = travelDate;
        }
        const { error } = await supabase.from('travel_requests').insert({
          guest_id: selectedGuestId || null,
          guest_name: gName,
          pickup_location: travelPickup,
          travel_datetime: travelDatetime
        });
        if (error) throw error;
        toast.success('Travel logged');
        setTravelPickup(''); setTravelDate(''); setTravelTime('');
      }
      
      setShowForm(false);
      fetchData();
    } catch (e: any) {
      // Handle missing columns gracefully by falling back or alerting
      if (e.message?.includes('guest_id')) {
        toast.error('Database schema missing guest_id. Please run the SQL migration!');
      } else {
        toast.error('Failed to save: ' + e.message);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    const toastId = toast.loading('AI is processing your sheet...');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/api/upload/logistics', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message || 'Sheet processed successfully!', { id: toastId });
      fetchData();
    } catch (e: any) {
      toast.error('Failed to process sheet.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Logistics Hub</h1>
          <p className="page-subtitle">Manage guests, rooms, and travel relations.</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setShowForm(!showForm)} className="btn-secondary">
            <Plus size={18} /> Add {activeTab === 'guests' ? 'Guest' : activeTab === 'rooms' ? 'Room' : 'Travel'}
          </button>
          
          <label className="cursor-pointer btn-primary shadow-lg">
            <UploadCloud size={18} />
            {isUploading ? 'Parsing...' : 'Smart Upload'}
            <input type="file" accept=".xlsx,.csv" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
          </label>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-border-subtle overflow-x-auto">
        {[
          { id: 'guests', icon: Users, label: 'Guest List' },
          { id: 'rooms', icon: Home, label: 'Room Allocations' },
          { id: 'travel', icon: MapPin, label: 'Travel & Pickups' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`tab flex items-center gap-2 ${activeTab === tab.id ? 'tab-active' : ''}`}
          >
            <tab.icon size={17} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card-static p-6 mb-6 border border-accent/20 bg-accent/5">
          <h3 className="text-lg font-semibold mb-4 text-text-primary capitalize">Add New {activeTab}</h3>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
            
            {activeTab === 'guests' && (
              <>
                <div className="flex-1 w-full">
                  <label className="label">Guest Name</label>
                  <input required value={guestName} onChange={e => setGuestName(e.target.value)} className="input" placeholder="e.g. Rahul Sharma" />
                </div>
                <div className="w-full md:w-32">
                  <label className="label">Side</label>
                  <select value={guestSide} onChange={e => setGuestSide(e.target.value)} className="select">
                    <option>Bride</option>
                    <option>Groom</option>
                  </select>
                </div>
                <div className="w-full md:w-24">
                  <label className="label">Pax</label>
                  <input type="number" min="1" value={guestPax} onChange={e => setGuestPax(e.target.value)} className="input" />
                </div>
                <div className="w-full">
                  <label className="label">Invited to Events</label>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary hover:text-text-primary transition-colors">
                      <input
                        type="checkbox"
                        checked={guestEvents.length === WEDDING_EVENTS.length}
                        onChange={e => {
                          if (e.target.checked) setGuestEvents([...WEDDING_EVENTS]);
                          else setGuestEvents([]);
                        }}
                        className="accent-amber-500 w-4 h-4"
                      />
                      All
                    </label>
                    {WEDDING_EVENTS.map(ev => (
                      <label key={ev} className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary hover:text-text-primary transition-colors">
                        <input
                          type="checkbox"
                          checked={guestEvents.includes(ev)}
                          onChange={e => {
                            if (e.target.checked) setGuestEvents(prev => [...prev, ev]);
                            else setGuestEvents(prev => prev.filter(x => x !== ev));
                          }}
                          className="accent-amber-500 w-4 h-4"
                        />
                        {ev}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {(activeTab === 'rooms' || activeTab === 'travel') && (
              <div className="flex-1 w-full">
                <label className="label">Select Guest (Relation)</label>
                <select 
                  required 
                  value={selectedGuestName} 
                  onChange={e => {
                    setSelectedGuestName(e.target.value);
                    const found = guests.find(g => g.name === e.target.value);
                    if (found) setSelectedGuestId(found.id);
                  }} 
                  className="select"
                >
                  <option value="">-- Choose a Guest --</option>
                  {guests.map(g => <option key={g.id} value={g.name}>{g.name} ({g.side})</option>)}
                </select>
              </div>
            )}

            {activeTab === 'rooms' && (
              <>
                <div className="flex-1 w-full">
                  <label className="label">Hotel Name</label>
                  <input required value={roomHotel} onChange={e => setRoomHotel(e.target.value)} className="input" placeholder="e.g. Taj Mahal Palace" />
                </div>
                <div className="w-full md:w-32">
                  <label className="label">Room #</label>
                  <input value={roomNumber} onChange={e => setRoomNumber(e.target.value)} className="input" placeholder="e.g. 401" />
                </div>
              </>
            )}

            {activeTab === 'travel' && (
              <>
                <div className="flex-1 w-full">
                  <label className="label">Pickup Location</label>
                  <input required value={travelPickup} onChange={e => setTravelPickup(e.target.value)} className="input" placeholder="e.g. Airport T2" />
                </div>
                <div className="w-full md:w-40">
                  <label className="label">Date</label>
                  <input type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)} className="input" />
                </div>
                <div className="w-full md:w-32">
                  <label className="label">Time</label>
                  <input type="time" value={travelTime} onChange={e => setTravelTime(e.target.value)} className="input" />
                </div>
              </>
            )}

            <button type="submit" className="btn-primary w-full md:w-auto h-[42px]">Save</button>
          </form>
        </div>
      )}

      {/* Content Area */}
      <div className="card-static p-6 md:p-8 min-h-[400px]">
        {data.length === 0 ? (
          <div className="empty-state flex-1 py-12">
            <div className="empty-state-icon">
              <Users size={24} />
            </div>
            <p className="text-text-secondary font-medium">No {activeTab} yet</p>
            <p className="text-sm text-text-tertiary mt-1">Click Add above or use Smart Upload.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="table-header whitespace-nowrap">
                  <th className="pb-3 px-4">Name</th>
                  {activeTab === 'guests' && (
                    <>
                      <th className="pb-3 px-4">Side</th>
                      <th className="pb-3 px-4">Persons</th>
                      <th className="pb-3 px-4">Events</th>
                    </>
                  )}
                  {activeTab === 'rooms' && (
                    <>
                      <th className="pb-3 px-4">Hotel</th>
                      <th className="pb-3 px-4">Room #</th>
                    </>
                  )}
                  {activeTab === 'travel' && (
                    <>
                      <th className="pb-3 px-4">Pickup</th>
                      <th className="pb-3 px-4">Date & Time</th>
                    </>
                  )}
                  <th className="pb-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => (
                  <tr key={i} className="table-row whitespace-nowrap group">
                    <td className="py-3.5 px-4 font-medium text-text-primary">{item.name || item.guest_name}</td>
                    
                    {activeTab === 'guests' && (
                      <>
                        <td className="py-3.5 px-4 text-text-secondary capitalize">{item.side || '-'}</td>
                        <td className="py-3.5 px-4 text-text-secondary">{item.number_of_persons || '-'}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {(item.events || []).map((ev: string) => (
                              <span key={ev} className="text-[10px] font-medium uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                                {ev}
                              </span>
                            ))}
                            {(!item.events || item.events.length === 0) && <span className="text-text-tertiary text-sm">-</span>}
                          </div>
                        </td>
                      </>
                    )}
                    
                    {activeTab === 'rooms' && (
                      <>
                        <td className="py-3.5 px-4 text-text-secondary">{item.hotel_name || '-'}</td>
                        <td className="py-3.5 px-4 text-text-secondary">{item.room_number || '-'}</td>
                      </>
                    )}

                    {activeTab === 'travel' && (
                      <>
                        <td className="py-3.5 px-4 text-text-secondary">{item.pickup_location || '-'}</td>
                        <td className="py-3.5 px-4 text-text-secondary">
                          {item.travel_datetime ? new Date(item.travel_datetime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                        </td>
                      </>
                    )}
                    
                    <td className="py-3.5 px-4 text-right">
                      <button onClick={() => handleDelete(item.id)} className="text-text-tertiary hover:text-error transition-colors p-2">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
