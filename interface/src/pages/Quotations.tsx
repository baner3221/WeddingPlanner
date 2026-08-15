import React, { useState, useEffect } from 'react';
import { FileText, UploadCloud, CheckCircle, XCircle, Clock, IndianRupee, Trash2, ArrowUpDown, ArrowDownAZ, GitCompareArrows, List } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const SERVICE_TYPES = ['Catering', 'Decor', 'Photography', 'Venue', 'Makeup', 'Mehndi', 'Music/DJ', 'Videography', 'Florist', 'Invitations', 'Transport', 'Other'];

export default function Quotations() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeView, setActiveView] = useState<'all' | 'compare'>('all');

  // Form state
  const [vendorName, setVendorName] = useState('');
  const [serviceType, setServiceType] = useState('Catering');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Compare state
  const [compareServiceType, setCompareServiceType] = useState('Catering');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fetchQuotations = async () => {
    const { data, error } = await supabase.from('quotations').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else setQuotations(data || []);
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || !cost) return toast.error('Vendor name and cost are required');

    setIsUploading(true);
    const toastId = toast.loading('Uploading quotation...');

    try {
      let document_url = '';

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        document_url = publicUrl;
      }

      const { error } = await supabase.from('quotations').insert({
        vendor_name: vendorName,
        service_type: serviceType,
        cost: parseFloat(cost),
        notes: notes,
        document_url: document_url
      });

      if (error) throw error;

      toast.success('Quotation added successfully!', { id: toastId });

      // Reset form
      setVendorName('');
      setCost('');
      setNotes('');
      setFile(null);
      fetchQuotations();

    } catch (error: any) {
      console.error(error);
      toast.error('Failed to add quotation: ' + error.message, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('quotations').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      toast.success(`Quotation marked as ${newStatus}`);
      fetchQuotations();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteQuotation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quotation?')) return;
    try {
      const { error } = await supabase.from('quotations').delete().eq('id', id);
      if (error) throw error;
      toast.success('Quotation deleted successfully');
      fetchQuotations();
    } catch (error) {
      toast.error('Failed to delete quotation');
    }
  };

  const totalApproved = quotations
    .filter(q => q.status === 'approved')
    .reduce((sum, q) => sum + (Number(q.cost) || 0), 0);

  // Compare filtered + sorted data
  const filteredQuotations = quotations
    .filter(q => q.service_type === compareServiceType)
    .sort((a, b) => sortOrder === 'asc' ? a.cost - b.cost : b.cost - a.cost);

  const cheapestCost = filteredQuotations.length > 0
    ? Math.min(...filteredQuotations.map(q => Number(q.cost)))
    : 0;

  // Count how many service types have quotations
  const serviceTypesWithData = SERVICE_TYPES.filter(st => quotations.some(q => q.service_type === st));

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Quotation Manager</h1>
          <p className="page-subtitle">Track vendor quotes, PDFs, and your overall wedding budget.</p>
        </div>

        <div className="stat-card flex items-center gap-4 py-3 px-5">
          <div className="p-2.5 bg-accent/15 rounded-xl">
            <IndianRupee size={20} className="text-accent" />
          </div>
          <div>
            <p className="stat-label mb-0">Approved Budget</p>
            <p className="text-xl font-bold text-text-primary">₹{totalApproved.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </header>

      {/* View Tabs */}
      <div className="flex space-x-1 border-b border-border-subtle">
        <button
          onClick={() => setActiveView('all')}
          className={`tab flex items-center gap-2 ${activeView === 'all' ? 'tab-active' : ''}`}
        >
          <List size={17} />
          All Quotes
        </button>
        <button
          onClick={() => setActiveView('compare')}
          className={`tab flex items-center gap-2 ${activeView === 'compare' ? 'tab-active' : ''}`}
        >
          <GitCompareArrows size={17} />
          Compare
        </button>
      </div>

      {/* === ALL QUOTES VIEW === */}
      {activeView === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add New Quotation Form */}
          <div className="lg:col-span-1">
            <div className="card-static p-6 md:p-8">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-text-primary">
                <UploadCloud size={18} className="text-text-tertiary" />
                Add New Quote
              </h2>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="label">Vendor Name *</label>
                  <input
                    type="text"
                    required
                    value={vendorName}
                    onChange={e => setVendorName(e.target.value)}
                    className="input"
                    placeholder="e.g. Royal Caterers"
                  />
                </div>

                <div>
                  <label className="label">Service Type</label>
                  <select
                    value={serviceType}
                    onChange={e => setServiceType(e.target.value)}
                    className="select"
                  >
                    {SERVICE_TYPES.map(st => <option key={st}>{st}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Total Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    value={cost}
                    onChange={e => setCost(e.target.value)}
                    className="input"
                    placeholder="e.g. 500000"
                  />
                </div>

                <div>
                  <label className="label">Upload PDF/Image Quote</label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="input text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-accent file:text-white hover:file:opacity-90 file:cursor-pointer"
                  />
                </div>

                <div>
                  <label className="label">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="input resize-none"
                    placeholder="e.g. Includes GST"
                    rows={2}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="btn-primary w-full justify-center mt-4"
                >
                  {isUploading ? 'Uploading...' : 'Save Quotation'}
                </button>
              </form>
            </div>
          </div>

          {/* List of Quotations */}
          <div className="lg:col-span-2 space-y-4">
            {quotations.length === 0 ? (
              <div className="card-static p-12 flex flex-col items-center justify-center text-center h-full">
                <div className="empty-state-icon mb-4">
                  <FileText size={24} />
                </div>
                <p className="text-text-secondary font-medium">No quotations added yet.</p>
              </div>
            ) : (
              quotations.map((q) => (
                <div key={q.id} className="card p-6 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg text-text-primary">{q.vendor_name}</h3>
                      <span className="badge badge-neutral uppercase tracking-wider">
                        {q.service_type}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-text-primary">₹{Number(q.cost).toLocaleString('en-IN')}</p>
                    {q.notes && <p className="text-sm text-text-secondary">{q.notes}</p>}
                    {q.document_url && (
                      <a href={q.document_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline mt-2">
                        <FileText size={14} />
                        View Attachment
                      </a>
                    )}
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => updateStatus(q.id, 'approved')}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${q.status === 'approved' ? 'bg-success/15 text-success border border-success/30' : 'bg-white/5 text-text-secondary hover:bg-success/10 hover:text-success border border-border-subtle'}`}
                    >
                      <CheckCircle size={15} /> {q.status === 'approved' ? 'Approved' : 'Approve'}
                    </button>

                    <button
                      onClick={() => updateStatus(q.id, 'rejected')}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${q.status === 'rejected' ? 'bg-error/15 text-error border border-error/30' : 'bg-white/5 text-text-secondary hover:bg-error/10 hover:text-error border border-border-subtle'}`}
                    >
                      <XCircle size={15} /> {q.status === 'rejected' ? 'Rejected' : 'Reject'}
                    </button>

                    {q.status === 'pending' && (
                      <div className="hidden sm:flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-warning">
                        <Clock size={15} /> Pending
                      </div>
                    )}

                    <button
                      onClick={() => deleteQuotation(q.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all bg-white/5 text-error hover:bg-error/10 border border-border-subtle hover:border-error/30 mt-2 sm:mt-0"
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* === COMPARE VIEW === */}
      {activeView === 'compare' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="card-static p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <label className="label">Filter by Service Type</label>
              <select
                value={compareServiceType}
                onChange={e => setCompareServiceType(e.target.value)}
                className="select"
              >
                {SERVICE_TYPES.map(st => (
                  <option key={st} value={st}>
                    {st} {quotations.filter(q => q.service_type === st).length > 0
                      ? `(${quotations.filter(q => q.service_type === st).length} quotes)`
                      : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="btn-secondary h-[42px] mt-auto"
            >
              <ArrowUpDown size={16} />
              Cost: {sortOrder === 'asc' ? 'Low → High' : 'High → Low'}
            </button>
          </div>

          {/* Comparison Table */}
          {filteredQuotations.length === 0 ? (
            <div className="card-static p-12 flex flex-col items-center justify-center text-center">
              <div className="empty-state-icon mb-4">
                <GitCompareArrows size={24} />
              </div>
              <p className="text-text-secondary font-medium">No quotations for "{compareServiceType}" yet.</p>
              <p className="text-sm text-text-tertiary mt-1">Add quotes in the "All Quotes" tab first.</p>
            </div>
          ) : (
            <div className="card-static overflow-hidden">
              <div className="bg-accent/5 border-b border-accent/20 px-6 py-3 flex items-center gap-2 text-sm font-medium text-accent">
                <GitCompareArrows size={16} />
                Comparing {filteredQuotations.length} vendors for "{compareServiceType}"
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="table-header whitespace-nowrap border-b border-border-subtle">
                      <th className="py-4 px-6 font-semibold text-text-tertiary text-sm w-8">#</th>
                      <th className="py-4 px-6 font-semibold text-text-tertiary text-sm">Vendor</th>
                      <th className="py-4 px-6 font-semibold text-text-tertiary text-sm">Cost (₹)</th>
                      <th className="py-4 px-6 font-semibold text-text-tertiary text-sm">Status</th>
                      <th className="py-4 px-6 font-semibold text-text-tertiary text-sm">Notes</th>
                      <th className="py-4 px-6 font-semibold text-text-tertiary text-sm">Attachment</th>
                      <th className="py-4 px-6 font-semibold text-text-tertiary text-sm text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotations.map((q, idx) => {
                      const isCheapest = Number(q.cost) === cheapestCost;
                      return (
                        <tr
                          key={q.id}
                          className={`border-b border-border-subtle/50 last:border-0 hover:bg-white/5 transition-colors ${isCheapest ? 'bg-success/5 border-l-4 border-l-success' : ''}`}
                        >
                          <td className="py-4 px-6 text-text-tertiary text-sm">{idx + 1}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-text-primary">{q.vendor_name}</span>
                              {isCheapest && (
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-success/15 text-success px-2 py-0.5 rounded-full">
                                  Best Price
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-lg font-bold ${isCheapest ? 'text-success' : 'text-text-primary'}`}>
                              ₹{Number(q.cost).toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`badge text-xs uppercase tracking-wider ${
                              q.status === 'approved' ? 'bg-success/15 text-success' :
                              q.status === 'rejected' ? 'bg-error/15 text-error' :
                              'bg-warning/15 text-warning'
                            }`}>
                              {q.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-text-secondary text-sm max-w-[200px] truncate">
                            {q.notes || '-'}
                          </td>
                          <td className="py-4 px-6">
                            {q.document_url ? (
                              <a href={q.document_url} target="_blank" rel="noreferrer" className="text-accent hover:underline text-sm flex items-center gap-1">
                                <FileText size={14} /> View
                              </a>
                            ) : (
                              <span className="text-text-tertiary text-sm">-</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => updateStatus(q.id, 'approved')}
                                className={`p-2 rounded-lg transition-colors ${q.status === 'approved' ? 'bg-success/15 text-success' : 'text-text-tertiary hover:text-success bg-white/5'}`}
                                title="Approve"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => updateStatus(q.id, 'rejected')}
                                className={`p-2 rounded-lg transition-colors ${q.status === 'rejected' ? 'bg-error/15 text-error' : 'text-text-tertiary hover:text-error bg-white/5'}`}
                                title="Reject"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              <div className="border-t border-border-subtle px-6 py-4 flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="text-text-tertiary">Cheapest:</span>{' '}
                  <span className="font-bold text-success">₹{cheapestCost.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-text-tertiary">Most Expensive:</span>{' '}
                  <span className="font-bold text-text-primary">
                    ₹{(filteredQuotations.length > 0 ? Math.max(...filteredQuotations.map(q => Number(q.cost))) : 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-text-tertiary">Avg:</span>{' '}
                  <span className="font-bold text-text-primary">
                    ₹{(filteredQuotations.length > 0 ? Math.round(filteredQuotations.reduce((s, q) => s + Number(q.cost), 0) / filteredQuotations.length) : 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
