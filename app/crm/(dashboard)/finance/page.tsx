'use client';

import { Suspense } from 'react';
import { Briefcase, FileDown, Hash, Search, Filter, ChevronRight, UserPlus, PhoneCall, MessageCircle, AlertCircle, MapPin, Phone, Check, X, Eye, Target, Send, Trash2 } from 'lucide-react';
import { useCRM } from '../context';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

const WA_TEMPLATES = [
  { id: 'followup', label: 'Loan Follow-up', message: (name: string, loan: string) => `Hi ${name}, regarding your ${loan?.replace(/-/g, ' ')} enquiry at Rachakonda Solutions — our team is ready to assist you. Please share your convenient time for a call.` },
  { id: 'documents', label: 'Document Request', message: (name: string, loan: string) => `Hi ${name}, to process your ${loan?.replace(/-/g, ' ')} application, we need the following documents:\n1. Aadhaar Card\n2. PAN Card\n3. Income Proof\n4. Bank Statements (6 months)\nPlease share at your earliest convenience.` },
  { id: 'approval', label: 'Approval Message', message: (name: string, loan: string) => `Congratulations ${name}! 🎉 Your ${loan?.replace(/-/g, ' ')} application has been approved by Rachakonda Solutions. Our team will contact you with the next steps.` },
  { id: 'rejection', label: 'Rejection Message', message: (name: string, loan: string) => `Hi ${name}, after careful review, we are unable to proceed with your ${loan?.replace(/-/g, ' ')} application at this time. Please contact us for alternative options.` },
];

function FinanceContent() {
  const { profile, activeRole: userRole, impersonatedUser } = useCRM();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [salesUsers, setSalesUsers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loanTypeFilter, setLoanTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [waMenuOpen, setWaMenuOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    const { data: usersData } = await supabase
      .from('profiles')
      .select('id, email, name')
      .eq('role', 'sales');
    if (usersData) setSalesUsers(usersData);

    let query = supabase.from('leads').select('*, profiles(email, name)').eq('source', 'website');

    const { data: results, error } = await query.order('created_at', { ascending: false });
    if (results && !error) setData(results);
    setLoading(false);
  }, [userRole, impersonatedUser, profile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (!error) {
      showToast('Lead deleted', 'success');
      fetchData();
      if (selectedLead?.id === id) setSelectedLead(null);
    } else {
      showToast('Error deleting lead', 'error');
    }
  };

  const handleAssign = async (leadId: string, userId: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ assigned_to: userId || null })
      .eq('id', leadId);
    
    if (!error) fetchData();
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

  const handleMarkContacted = async (id: string) => {
    await handleStatusUpdate(id, 'contacted');
  };

  const handleSmartAssign = async () => {
    if (salesUsers.length === 0) return;
    const unassignedLeads = data.filter(l => !l.assigned_to && l.status === 'new');
    if (unassignedLeads.length === 0) return;

    setLoading(true);
    let agentIndex = 0;
    for (const lead of unassignedLeads) {
      const agent = salesUsers[agentIndex];
      await supabase.from('leads').update({ assigned_to: agent.id }).eq('id', lead.id);
      agentIndex = (agentIndex + 1) % salesUsers.length;
    }
    fetchData();
    showToast(`${unassignedLeads.length} leads assigned`, 'success');
  };

  const openWhatsApp = (phone: string, name: string, loanType: string, templateId: string) => {
    const template = WA_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const msg = encodeURIComponent(template.message(name, loanType));
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, '_blank');
    setWaMenuOpen(null);
    showToast('WhatsApp opened', 'success');
  };

  // Get unique loan types for filter
  const loanTypes = [...new Set(data.map(d => d.loan_type).filter(Boolean))];

  const filteredData = data.filter((item: any) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesLoanType = loanTypeFilter === 'all' || item.loan_type === loanTypeFilter;
    const matchesSearch = 
      (item.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (item.phone || '').includes(search) ||
      (item.city?.toLowerCase() || '').includes(search.toLowerCase());
    return matchesStatus && matchesLoanType && matchesSearch;
  });

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
      case 'converted': return 'bg-emerald-50 text-emerald-700';
      case 'rejected': return 'bg-red-50 text-red-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2`}>
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-600" />
            Finance CRM
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
            Managing <span className="text-slate-900">{filteredData.length}</span> active leads
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="h-12 px-6 rounded-2xl bg-white border border-slate-200 text-sm font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Export
          </button>

          {userRole !== 'sales' && (
            <button 
              onClick={handleSmartAssign}
              disabled={data.filter(l => !l.assigned_to && l.status === 'new').length === 0}
              className="h-12 px-6 rounded-2xl bg-emerald-600 text-white text-sm font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 disabled:opacity-50"
            >
              Smart Assign
              <Hash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Cards */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['new', 'contacted', 'interested', 'converted', 'rejected'].map((s) => {
          const count = data.filter(d => d.status === s).length;
          const isActive = statusFilter === s;
          return (
            <button 
              key={s}
              onClick={() => setStatusFilter(isActive ? 'all' : s)}
              className={cn(
                "p-4 rounded-3xl border transition-all text-left",
                isActive 
                  ? "bg-slate-900 text-white border-slate-900 shadow-xl" 
                  : "bg-white border-slate-100 hover:border-blue-200 shadow-sm"
              )}
            >
              <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isActive ? "text-slate-400" : "text-slate-300")}>{s}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black">{count}</span>
                <span className={cn("text-[10px] font-bold", isActive ? "text-slate-500" : "text-slate-400")}>{Math.round((count / (data.length || 1)) * 100)}%</span>
              </div>
            </button>
          )
        })}
      </section>

      {/* Data Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/20">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="relative flex-1 md:w-48">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold appearance-none outline-none focus:ring-4 focus:ring-blue-500/5 transition-all uppercase tracking-widest text-slate-500"
              >
                <option value="all">Pipeline Status</option>
                <option value="new">New Entry</option>
                <option value="contacted">Contacted</option>
                <option value="interested">Interested</option>
                <option value="converted">Converted</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none rotate-90" />
            </div>

            {/* Loan Type Filter */}
            {loanTypes.length > 0 && (
              <div className="relative flex-1 md:w-48">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <select 
                  value={loanTypeFilter}
                  onChange={(e) => setLoanTypeFilter(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold appearance-none outline-none focus:ring-4 focus:ring-blue-500/5 transition-all uppercase tracking-widest text-slate-500"
                >
                  <option value="all">All Loan Types</option>
                  {loanTypes.map(lt => (
                    <option key={lt} value={lt}>{lt?.replace(/-/g, ' ')}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none rotate-90" />
              </div>
            )}
            
            {userRole !== 'sales' && (
              <button className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all flex-shrink-0">
                <UserPlus className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed min-w-[1200px]">
            <thead className="bg-[#FAFBFD]">
              <tr className="border-b border-slate-100">
                <th className="w-16 px-6 py-5">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="w-56 px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Identity</th>
                <th className="w-48 px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Financial Profile</th>
                <th className="w-32 px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Priority</th>
                <th className="w-40 px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assignment</th>
                <th className="w-40 px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pipeline</th>
                <th className="w-44 px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-8"><div className="h-6 bg-slate-50 rounded-lg w-full" /></td>
                  </tr>
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-300 font-black uppercase tracking-widest">No matching records found</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="group hover:bg-blue-50/20 transition-all">
                    <td className="px-6 py-5">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs shrink-0 transition-transform group-hover:scale-105">
                          {item.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                          <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-300" /> {item.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-700 truncate uppercase tracking-tight">
                          {item.loan_type?.replace(/-/g, ' ')}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1 truncate">
                          <MapPin className="w-3 h-3 text-slate-300" /> {item.city || 'Regional'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <span className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-transparent shadow-sm",
                        getPriorityColor(item.priority || 'medium')
                      )}>
                        {item.priority || 'medium'}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <select 
                        value={item.assigned_to || ''}
                        onChange={(e) => handleAssign(item.id, e.target.value)}
                        className="w-full bg-slate-50 border-none text-[11px] font-bold text-slate-600 rounded-xl py-2 pl-3 pr-8 appearance-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {salesUsers.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-5">
                      <select 
                        value={item.status}
                        onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                        className={cn(
                          "w-full border-none text-[10px] font-black uppercase tracking-widest rounded-xl py-2 pl-3 pr-8 appearance-none shadow-sm",
                          getStatusStyle(item.status)
                        )}
                      >
                        <option value="new">New Lead</option>
                        <option value="contacted">Contacted</option>
                        <option value="interested">Interested</option>
                        <option value="converted">Converted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-1.5 relative">
                        {/* Call */}
                        <a href={`tel:${item.phone}`} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all" title="Call">
                          <PhoneCall className="w-4 h-4" />
                        </a>

                        {/* WhatsApp with template menu */}
                        <div className="relative">
                          <button
                            onClick={() => setWaMenuOpen(waMenuOpen === item.id ? null : item.id)}
                            className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white transition-all"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          {waMenuOpen === item.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setWaMenuOpen(null)} />
                              <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 w-56 py-2 overflow-hidden">
                                <p className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Send Template</p>
                                {WA_TEMPLATES.map((tpl) => (
                                  <button
                                    key={tpl.id}
                                    onClick={() => openWhatsApp(item.phone, item.name, item.loan_type, tpl.id)}
                                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                                  >
                                    {tpl.label}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Mark Contacted Quick Action */}
                        {item.status === 'new' && (
                          <button
                            onClick={() => handleMarkContacted(item.id)}
                            className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-amber-500 hover:text-white transition-all"
                            title="Mark Contacted"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {/* Detail Link */}
                        <button 
                          onClick={() => setSelectedLead(item)}
                          className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all outline-none"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all outline-none"
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
              {/* Header */}
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

              {/* Content */}
              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Basic Info */}
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
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Salary</p>
                        <p className="text-sm font-bold text-slate-700">₹{selectedLead.income?.toLocaleString() || '0'}</p>
                      </div>
                      <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Address</p>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed">{selectedLead.address || selectedLead.city || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Loan Info */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">Loan Requirements</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-50/50">
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Required Amount</p>
                        <p className="text-sm font-black text-blue-700">₹{selectedLead.amount?.toLocaleString() || '0'}</p>
                      </div>
                      <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tenure / EMI</p>
                        <p className="text-sm font-bold text-slate-700">{selectedLead.tenure || 'N/A'} • ₹{selectedLead.emi?.toLocaleString() || '0'}/mo</p>
                      </div>
                      <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
                        <p className="text-sm font-bold text-slate-700">
                          {selectedLead.completed_emi ? `${selectedLead.completed_emi} EMIs Paid` : 'New Application'}
                          {selectedLead.pending_emi ? ` • ${selectedLead.pending_emi} Pending` : ''}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Previous History</p>
                        <p className="text-xs font-bold text-slate-500 italic leading-relaxed">{selectedLead.previous_loan || 'No previous history recorded'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const text = `*Client Details (Rachakonda Solutions)*\n\n` +
                        `*Name:* ${selectedLead.name}\n` +
                        `*Phone:* ${selectedLead.phone}\n` +
                        `*Designation:* ${selectedLead.designation || 'N/A'}\n` +
                        `*Salary:* ₹${selectedLead.income || 0}\n` +
                        `*Address:* ${selectedLead.address || selectedLead.city || 'N/A'}\n\n` +
                        `*Loan Req:* ₹${selectedLead.amount || 0}\n` +
                        `*Tenure:* ${selectedLead.tenure || 'N/A'}\n` +
                        `*EMI:* ₹${selectedLead.emi || 0}\n` +
                        `*EMIs:* ${selectedLead.completed_emi || 0} Paid / ${selectedLead.pending_emi || 0} Pending\n\n` +
                        `*History:* ${selectedLead.previous_loan || 'None'}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="h-12 px-6 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Forward WhatsApp
                  </button>
                  <button 
                    onClick={() => {
                      const subject = `Lead Details: ${selectedLead.name}`;
                      const body = `Client Details:\n\nName: ${selectedLead.name}\nPhone: ${selectedLead.phone}\nDesignation: ${selectedLead.designation || 'N/A'}\nSalary: ₹${selectedLead.income || 0}\nAddress: ${selectedLead.address || selectedLead.city || 'N/A'}\n\nLoan Req: ₹${selectedLead.amount || 0}\nTenure: ${selectedLead.tenure || 'N/A'}\nEMI: ₹${selectedLead.emi || 0}\nEMIs: ${selectedLead.completed_emi || 0} Paid / ${selectedLead.pending_emi || 0} Pending\n\nHistory: ${selectedLead.previous_loan || 'None'}`;
                      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    }}
                    className="h-12 px-5 rounded-2xl bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Email
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
                   <p className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">Mark as:</p>
                   {['contacted', 'interested'].map(s => (
                     <button 
                       key={s}
                       onClick={() => {
                         handleStatusUpdate(selectedLead.id, s);
                         setSelectedLead(null);
                       }}
                       className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm"
                     >
                       {s}
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

export default function FinanceCRMPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading Finance Data...</div>}>
      <FinanceContent />
    </Suspense>
  );
}
