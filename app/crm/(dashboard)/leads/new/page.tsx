'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCRM } from '../../context';
import { 
  UserPlus, 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  Calendar, 
  History, 
  Save, 
  AlertCircle,
  FileSpreadsheet,
  Upload,
  Check,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

export default function ManualLeadPage() {
  const { profile } = useCRM();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    designation: '',
    income: '',
    previous_loan: '',
    amount: '',
    tenure: '',
    emi: '',
    pending_emi: '',
    completed_emi: '',
    loan_type: 'personal-loan',
    source: 'manual'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('leads').insert([
        {
          ...formData,
          amount: parseFloat(formData.amount) || 0,
          income: parseFloat(formData.income) || 0,
          emi: parseFloat(formData.emi) || 0,
          pending_emi: parseFloat(formData.pending_emi) || 0,
          completed_emi: parseFloat(formData.completed_emi) || 0,
          assigned_to: profile?.id,
          status: 'new',
          priority: 'hot'
        }
      ]);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        router.push('/crm/finance');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error creating lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-[1000px] mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-blue-600" />
            Direct Lead Entry
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
            Manually create a new client record in the system
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-12 px-6 rounded-2xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-2 border border-emerald-100 shadow-sm shadow-emerald-50">
            <FileSpreadsheet className="w-4 h-4" />
            Bulk Excel Import
          </button>
        </div>
      </div>

      {success ? (
        <div className="p-12 bg-emerald-50 border border-emerald-100 rounded-[3rem] text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-200">
            <Check className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Lead Created Successfully!</h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">The client record is now active in your database.<br/>Redirecting you to the Finance Portal...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Identity Card */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Client Identity</h3>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                    placeholder="e.g. Iaiah"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input 
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                    placeholder="e.g. 9876543210"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Address</label>
                  <textarea 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none resize-none"
                    placeholder="House no, Street, Colony, City..."
                  />
                </div>
              </div>
            </div>

            {/* Employment Card */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Employment Details</h3>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation / Company</label>
                  <input 
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                    placeholder="e.g. APGVB Employee"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Salary (₹)</label>
                  <input 
                    type="number"
                    name="income"
                    value={formData.income}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                    placeholder="e.g. 58000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Loan Category</label>
                  <select 
                    name="loan_type"
                    value={formData.loan_type}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="personal-loan">Personal Loan</option>
                    <option value="home-loan">Home Loan</option>
                    <option value="business-loan">Business Loan</option>
                    <option value="gold-loan">Gold Loan</option>
                    <option value="car-loan">Car/Vehicle Loan</option>
                    <option value="education-loan">Education Loan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial Profile Card */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 md:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Loan & Repayment Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Required Amount (₹)</label>
                  <input 
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                    placeholder="e.g. 100000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tenure</label>
                  <input 
                    name="tenure"
                    value={formData.tenure}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                    placeholder="e.g. 5 Years"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Approx. EMI (₹)</label>
                  <input 
                    type="number"
                    name="emi"
                    value={formData.emi}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                    placeholder="e.g. 14000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">EMIs Completed (Months)</label>
                  <input 
                    type="number"
                    name="completed_emi"
                    value={formData.completed_emi}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                    placeholder="e.g. 12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">EMIs Pending (Months)</label>
                  <input 
                    type="number"
                    name="pending_emi"
                    value={formData.pending_emi}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                    placeholder="e.g. 48"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Due EMI Months</label>
                  <input 
                    name="due_months"
                    type="number"
                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                    placeholder="e.g. 0"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <History className="w-4 h-4 text-slate-400" />
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Previous Loan Details (History)</label>
                </div>
                <textarea 
                  name="previous_loan"
                  value={formData.previous_loan}
                  onChange={handleChange}
                  rows={2}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-blue-500/5 transition-all outline-none resize-none"
                  placeholder="e.g. SBI Personal Loan - 5L (2022) - Nil O/S"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6">
            <button 
              type="button"
              onClick={() => router.back()}
              className="h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all ml-1"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="h-14 px-10 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all disabled:opacity-50 flex items-center gap-2 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Client Lead
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
