'use client';

import { Suspense } from 'react';
import { Briefcase, FileDown, Hash, Search, Filter, ChevronRight, UserPlus, PhoneCall, MessageCircle, AlertCircle, MapPin, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCRM } from '../context';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function FinanceContent() {
  const { profile, activeRole: userRole, impersonatedUser } = useCRM();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [salesUsers, setSalesUsers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    // Fetch Sales Profiles for assignment
    if (userRole !== 'sales') {
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, email, name')
        .eq('role', 'sales');
      if (usersData) setSalesUsers(usersData);
    }

    let query = supabase.from('leads').select('*, profiles(email, name)');
    
    const targetUserId = impersonatedUser?.id || profile?.id;
    if (userRole === 'sales') {
      query = query.eq('assigned_to', targetUserId);
    }

    const { data: results, error } = await query.order('created_at', { ascending: false });
    if (results && !error) setData(results);
    setLoading(false);
  }, [userRole, impersonatedUser, profile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    
    if (!error) fetchData();
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
  };

  const filteredData = data.filter((item: any) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch = 
      (item.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (item.phone || '').includes(search) ||
      (item.city?.toLowerCase() || '').includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
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
                <th className="w-32 px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
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
                           {item.loan_type}
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
                       <div className="flex items-center gap-2">
                         <a href={`tel:${item.phone}`} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                           <PhoneCall className="w-4 h-4" />
                         </a>
                         <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white transition-all">
                           <MessageCircle className="w-4 h-4" />
                         </button>
                         <Link href={`/crm/leads/${item.id}`} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                           <ChevronRight className="w-4 h-4" />
                         </Link>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
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
