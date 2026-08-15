import React, { useState, useEffect } from 'react';
import { Receipt, IndianRupee, Plus, Trash2, FileText, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Expenses() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const fetchExpenses = async () => {
    const { data, error } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      if (error.message?.includes('relation "expenses" does not exist')) {
        toast.error('Please create the "expenses" table in Supabase first.');
      }
    } else {
      setExpenses(data || []);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !amount) return toast.error('Item name and amount are required');

    setIsUploading(true);
    const toastId = toast.loading('Saving expense...');

    try {
      let receipt_url = '';

      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `receipts/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, receiptFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        receipt_url = publicUrl;
      }

      const { error } = await supabase.from('expenses').insert({
        item_name: itemName,
        amount: parseFloat(amount),
        payment_date: paymentDate || null,
        paid_by: paidBy || null,
        receipt_url: receipt_url || null
      });

      if (error) throw error;

      toast.success('Expense recorded!', { id: toastId });
      setItemName(''); setAmount(''); setPaymentDate(''); setPaidBy(''); setReceiptFile(null);
      setShowForm(false);
      fetchExpenses();
    } catch (error: any) {
      toast.error('Failed to save expense: ' + error.message, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this expense record?')) return;
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      toast.success('Expense deleted');
      fetchExpenses();
    } catch (e: any) {
      toast.error('Failed to delete');
    }
  };

  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Group by paid_by for summary
  const paidBySummary: Record<string, number> = {};
  expenses.forEach(e => {
    const key = e.paid_by || 'Unspecified';
    paidBySummary[key] = (paidBySummary[key] || 0) + (Number(e.amount) || 0);
  });

  return (
    <div className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Expense Tracker</h1>
          <p className="page-subtitle">Track every payment made for the wedding.</p>
        </div>

        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={18} /> Add Expense
        </button>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <IndianRupee size={16} className="text-accent" />
            <p className="stat-label">Total Spent</p>
          </div>
          <p className="stat-value">₹{totalSpent.toLocaleString('en-IN')}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <Receipt size={16} className="text-accent" />
            <p className="stat-label">Payments</p>
          </div>
          <p className="stat-value">{expenses.length}</p>
        </div>
        {Object.entries(paidBySummary).slice(0, 2).map(([name, total]) => (
          <div key={name} className="stat-card">
            <div className="flex items-center gap-2 mb-3">
              <User size={16} className="text-accent" />
              <p className="stat-label">{name}</p>
            </div>
            <p className="stat-value">₹{(total as number).toLocaleString('en-IN')}</p>
          </div>
        ))}
      </section>

      {/* Add Form */}
      {showForm && (
        <div className="card-static p-6 border border-accent/20 bg-accent/5">
          <h3 className="text-lg font-semibold mb-4 text-text-primary">New Expense</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label">Item Name *</label>
              <input required value={itemName} onChange={e => setItemName(e.target.value)} className="input" placeholder="e.g. Decoration Advance" />
            </div>
            <div>
              <label className="label">Amount (₹) *</label>
              <input required type="number" value={amount} onChange={e => setAmount(e.target.value)} className="input" placeholder="e.g. 50000" />
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Paid By</label>
              <input value={paidBy} onChange={e => setPaidBy(e.target.value)} className="input" placeholder="e.g. Papa" />
            </div>
            <div>
              <label className="label">Receipt (Image/PDF)</label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={e => setReceiptFile(e.target.files?.[0] || null)}
                className="input text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-accent file:text-white hover:file:opacity-90 file:cursor-pointer"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={isUploading} className="btn-primary w-full justify-center h-[42px]">
                {isUploading ? 'Saving...' : 'Save Expense'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expense Table */}
      <div className="card-static min-h-[300px]">
        {expenses.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="empty-state-icon mb-4">
              <Receipt size={24} />
            </div>
            <p className="text-text-secondary font-medium">No expenses recorded yet.</p>
            <p className="text-sm text-text-tertiary mt-1">Click "Add Expense" to start tracking payments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="table-header whitespace-nowrap border-b border-border-subtle">
                  <th className="py-4 px-6 font-semibold text-text-tertiary text-sm">Item</th>
                  <th className="py-4 px-6 font-semibold text-text-tertiary text-sm">Amount</th>
                  <th className="py-4 px-6 font-semibold text-text-tertiary text-sm">Date</th>
                  <th className="py-4 px-6 font-semibold text-text-tertiary text-sm">Paid By</th>
                  <th className="py-4 px-6 font-semibold text-text-tertiary text-sm">Receipt</th>
                  <th className="py-4 px-6 font-semibold text-text-tertiary text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-border-subtle/50 last:border-0 hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6 font-medium text-text-primary">{exp.item_name}</td>
                    <td className="py-4 px-6 text-lg font-bold text-text-primary">₹{Number(exp.amount).toLocaleString('en-IN')}</td>
                    <td className="py-4 px-6 text-text-secondary text-sm">
                      {exp.payment_date ? new Date(exp.payment_date).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '-'}
                    </td>
                    <td className="py-4 px-6 text-text-secondary text-sm">{exp.paid_by || '-'}</td>
                    <td className="py-4 px-6">
                      {exp.receipt_url ? (
                        <a href={exp.receipt_url} target="_blank" rel="noreferrer" className="text-accent hover:underline text-sm flex items-center gap-1">
                          <FileText size={14} /> View
                        </a>
                      ) : (
                        <span className="text-text-tertiary text-sm">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-2 text-text-tertiary hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                      >
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
