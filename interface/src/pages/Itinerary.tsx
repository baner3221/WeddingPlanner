import { useEffect, useState } from 'react';
import { Clock, MapPin, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Itinerary() {
  const [events, setEvents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form
  const [eventName, setEventName] = useState('');
  const [dayNumber, setDayNumber] = useState('1');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');

  const fetchItinerary = async () => {
    try {
      const { data, error } = await supabase.from('events').select('*').order('day_number', { ascending: true }).order('start_time', { ascending: true });
      if (error) {
        // Fallback for missing table gracefully
        console.error(error);
        if (error.message.includes("relation \"events\" does not exist")) {
           toast.error('SQL Migration for Events table required!');
        }
        return;
      }
      setEvents(data || []);
    } catch (e) {
      console.error('Failed to load itinerary');
    }
  };

  useEffect(() => {
    fetchItinerary();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.from('events').insert({
        name: eventName,
        day_number: parseInt(dayNumber),
        start_time: startTime,
        end_time: endTime,
        location: location
      });
      if (error) throw error;
      toast.success('Event added successfully!');
      setEventName(''); setStartTime(''); setEndTime(''); setLocation('');
      setShowForm(false);
      fetchItinerary();
    } catch (err: any) {
      if (err.message.includes('relation "events" does not exist')) {
        toast.error('Please run CREATE TABLE events in Supabase SQL editor.');
      } else {
        toast.error('Error adding event: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      toast.success('Event deleted');
      fetchItinerary();
    } catch (err: any) {
      toast.error('Failed to delete event');
    }
  };

  // Unique days sorted
  const days = Array.from(new Set(events.map(e => e.day_number))).sort((a, b) => a - b);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Wedding Itinerary</h1>
          <p className="page-subtitle">A timeline of all your celebrations.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={18} /> Add Event
        </button>
      </header>

      {showForm && (
        <div className="card-static p-6 mb-6 border border-accent/20 bg-accent/5">
          <h3 className="text-lg font-semibold mb-4 text-text-primary">Add New Event</h3>
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end flex-wrap">
            <div className="flex-1 w-full min-w-[200px]">
              <label className="label">Event Name</label>
              <input required value={eventName} onChange={e => setEventName(e.target.value)} className="input" placeholder="e.g. Sangeet" />
            </div>
            <div className="w-full md:w-24">
              <label className="label">Day #</label>
              <input required type="number" min="1" value={dayNumber} onChange={e => setDayNumber(e.target.value)} className="input" />
            </div>
            <div className="w-full md:w-32">
              <label className="label">Start Time</label>
              <input required type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="input" />
            </div>
            <div className="w-full md:w-32">
              <label className="label">End Time</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="input" />
            </div>
            <div className="flex-1 w-full min-w-[200px]">
              <label className="label">Location</label>
              <input required value={location} onChange={e => setLocation(e.target.value)} className="input" placeholder="e.g. Grand Ballroom" />
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full md:w-auto h-[42px] mt-2 md:mt-0">
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>
      )}

      {events.length === 0 ? (
        <div className="card-static p-12 text-center text-text-tertiary">
          No events found. Click "Add Event" to start building your itinerary.
        </div>
      ) : (
        <div className="space-y-12">
          {days.map(day => {
            const dayEvents = events.filter(e => e.day_number === day);
            return (
              <section key={day} className="relative">
                <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-3">
                  <span className="bg-accent/15 text-accent px-4 py-1.5 rounded-full text-sm font-bold">
                    Day {day}
                  </span>
                </h2>

                <div className="space-y-4 pl-4 md:pl-8 border-l-2 border-border-subtle">
                  {dayEvents.map(event => (
                    <div key={event.id} className="relative group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[21px] md:-left-[37px] top-6 w-3.5 h-3.5 bg-bg-base border-[3px] border-accent rounded-full"></div>

                      <div className="card p-6 md:p-8 flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-text-primary mb-3">{event.name}</h3>
                          <div className="flex flex-wrap gap-4 text-text-secondary text-sm">
                            <div className="flex items-center gap-1.5">
                              <Clock size={15} className="text-accent" />
                              <span>{event.start_time} - {event.end_time || 'Late'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin size={15} className="text-accent" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                        </div>
                        
                        <button onClick={() => handleDelete(event.id)} className="text-text-tertiary hover:text-error transition-colors p-2 opacity-0 group-hover:opacity-100">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
