'use client';

import { Suspense } from 'react';
import { Users, FileDown, Hash, Search, Filter, ChevronRight, UserPlus, PhoneCall, MessageCircle, AlertCircle, MapPin, Phone, Check, X, Eye, Target, Send, Trash2 } from 'lucide-react';
import { useCRM } from '../context';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

const WA_TEMPLATES = [
  { id: 'followup', label: 'Client Follow-up', message: (name: string, loan: string) => `Hi ${name}, regarding your interest in Rachakonda Solutions — our team is ready to assist you. Please share your convenient time for a call.` },
  { id: 'documents', label: 'Document Request', message: (name: string, loan: string) => `Hi ${name}, to process your application at Rachakonda Solutions, we need the following documents:\n1. Aadhaar Card\n2. PAN Card\n3. Income Proof\n4. Bank Statements (6 months)\nPlease share at your earliest convenience.` },
];

function ClientsContent() {
  const { profile, activeRole: userRole } = useCRM();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Fetch leads where source is NOT website (manual or excel)
    const { data: results, error } = await supabase
      .from('leads')
      .select('*, profiles(email, name)')
      .neq('source', 'website')
      .order('created_at', { ascending: false });
    
    if (results && !error) setData(results);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) return;
    
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);
    
    if (!error) {
      showToast('Client deleted successfully', 'success');
      fetchData();
      if (selectedLead?.id === id) setSelectedLead(null);
    } else {
      showToast('Error deleting client', 'error');
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!error) {
      fetchData();
      showToast(`Status updated to ${newStatus}`, 'success');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'hot': return 'bg-red-50 text-red-700 ring-red-100 border-red-200';
      case 'medium': return 'bg-amber-50 text-amber-700 ring-amber-100 border-amber-200';
      case 'cold': return 'bg-blue-50 text-blue-700 ring-blue-100 border-blue-200';
      default: return 'bg-slate-50 text-slate-700 ring-slate-100 border-slate-200';
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'new': return 'bg-blue-50 text-blue-700';
      case 'contacted': return 'bg-amber-50 text-amber-700';
      case 'interested': return 'bg-purple-50 text-purple-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  const filteredData = data.filter((item: any) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch = 
      (item.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (item.phone || '').includes(search) ||
      (item.city?.toLowerCase() || '').includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-right duration-300`}>
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-bold tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100 text-white">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Client Database</h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Manual Entries & Bulk Uploads</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/5 outline-none w-[280px] transition-all"
            />
          </div>
          <button className="h-12 px-6 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100">
             <FileDown className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Clients', value: data.length, icon: Hash, color: 'blue' },
          { label: 'Manual Entries', value: data.filter(d => d.source === 'manual').length, icon: UserPlus, color: 'emerald' },
          { label: 'Excel Imports', value: data.filter(d => d.source === 'excel').length, icon: FileDown, color: 'purple' },
          { label: 'Contacted', value: data.filter(d => d.status === 'contacted').length, icon: PhoneCall, color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-2xl", `bg-${stat.color}-50 text-${stat.color}-600`)}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Active Filters */}
      <div className="flex flex-wrap items-center gap-3 p-2 bg-slate-100/50 rounded-2xl border border-slate-100">
        <button 
          onClick={() => setStatusFilter('all')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            statusFilter === 'all' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
          )}
        >All</button>
        {['new', 'contacted', 'interested'].map(s => (
          <button 
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              statusFilter === s ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
          >{s}</button>
        ))}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Identity</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Job & Income</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Processing Database...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No clients match filters</td></tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                          {item.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-tight">{item.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter">Source: {item.source}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-3 h-3" />
                          <span className="text-xs font-bold">{item.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px]">
                          <MapPin className="w-3 h-3" />
                          <span>{item.city || 'Location N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-xs font-bold text-slate-600">
                      <span className="block">{item.designation || 'Specialist'}</span>
                      <span className="text-[10px] text-emerald-600 font-black">₹{item.income?.toLocaleString()} /mo</span>
                    </td>
                    <td className="px-6 py-6">
                      <span className={cn(
                        "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm",
                        getStatusStyle(item.status)
                      )}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedLead(item)}
                          className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all outline-none"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2.5 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all outline-none"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLead(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-black">
                    {selectedLead.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedLead.name}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                      <Target className="w-3.5 h-3.5" /> ID: {selectedLead.id.slice(0,8)} • {selectedLead.loan_type?.replace(/-/g, ' ')}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">Client Profile</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone</p>
                        <p className="text-sm font-bold text-slate-700">{selectedLead.phone}</p>
                      </div>
                      <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Designation</p>
                        <p className="text-sm font-bold text-slate-700">{selectedLead.designation || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Address</p>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed">{selectedLead.address || selectedLead.city || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">Financial Overview</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-50/50">
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Estimated Income</p>
                        <p className="text-sm font-black text-blue-700">₹{selectedLead.income?.toLocaleString() || '0'}</p>
                      </div>
                      <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Source</p>
                        <p className="text-sm font-bold text-slate-700 uppercase tracking-widest whitespace-nowrap">{selectedLead.source}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                        const text = `*Client Details (Rachakonda Solutions)*\n\n` +
                        `*Name:* ${selectedLead.name}\n` +
                        `*Phone:* ${selectedLead.phone}\n` +
                        `*Designation:* ${selectedLead.designation || 'N/A'}\n` +
                        `*Salary:* ₹${selectedLead.income || 0}\n` +
                        `*Address:* ${selectedLead.address || selectedLead.city || 'N/A'}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="h-12 px-6 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Forward WhatsApp
                  </button>
                  <button 
                    onClick={() => handleDelete(selectedLead.id)}
                    className="h-12 px-5 rounded-2xl bg-white border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>

                <div className="flex items-center gap-2">
                   {['contacted', 'interested'].map(s => (
                     <button 
                       key={s}
                       onClick={() => {
                         handleStatusUpdate(selectedLead.id, s);
                         setSelectedLead(null);
                       }}
                       className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm"
                     >
                       Mark {s}
                     </button>
                   ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ClientsCRMPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading Client Database...</div>}>
      <ClientsContent />
    </Suspense>
  );
}
