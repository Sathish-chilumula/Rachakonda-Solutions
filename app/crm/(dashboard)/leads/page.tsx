'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Edit, 
  UserPlus, 
  FileDown, 
  PhoneCall, 
  CheckCircle, 
  Clock, 
  GraduationCap, 
  Briefcase,
  MoreVertical,
  MessageCircle,
  AlertCircle,
  Check,
  ChevronRight,
  User,
  Hash,
  MapPin,
  Circle,
  Phone
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useCRM } from '../context';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function LeadsContent() {
  const { profile, activeRole: userRole, impersonatedUser } = useCRM();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get('tab') === 'education' ? 'education' : 'finance';
  
  const [activeTab, setActiveTab] = useState<'finance' | 'education'>(initialTab);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [salesUsers, setSalesUsers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    // 1. Fetch Sales and Manager Profiles for assignment tasks
    if (activeTab === 'finance') {
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, email, name, role')
        .in('role', ['sales', 'manager']);
      if (usersData) setSalesUsers(usersData);
    }

    // 2. Fetch Module Data
    let query;
    if (activeTab === 'finance') {
      query = supabase.from('leads').select('*, profiles(email, name, role)');
      
      // RESTRICTION: Sales and Managers see their assigned leads ("My Work Queue") or unassigned ones (to claim)
      // Admins see everything.
      const targetUserId = impersonatedUser?.id || profile?.id;
      if (userRole === 'sales' || userRole === 'manager') {
        // Show assigned leads OR new unassigned leads they could potentially claim
        query = query.or(`assigned_to.eq.${targetUserId},and(assigned_to.is.null,status.eq.new)`);
      }
    } else {
      // RESTRICTION: Sales agents cannot access Education CRM
      if (userRole === 'sales') {
        setActiveTab('finance');
        setLoading(false);
        return;
      }
      query = supabase.from('enrollments').select('*');
    }

    const { data: results, error } = await query.order('created_at', { ascending: false });

    if (results && !error) {
      setData(results);
    } else {
      setData([]);
    }

    setLoading(false);
  }, [activeTab, userRole, impersonatedUser, profile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (tab: 'finance' | 'education') => {
    setActiveTab(tab);
    setSelectedIds([]);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`?${params.toString()}`);
  };

  const logActivity = async (action: string, entityType: string, entityId: string, details: any) => {
    await supabase.from('audit_logs').insert({
      user_id: profile?.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details
    });
  };

  const handleAssign = async (leadId: string, userId: string) => {
    if (activeTab !== 'finance') return;
    const { error } = await supabase
      .from('leads')
      .update({ assigned_to: userId || null, assigned_at: userId ? new Date().toISOString() : null })
      .eq('id', leadId);
    
    if (!error) {
      const targetUser = salesUsers.find(u => u.id === userId);
      const isSelfAssign = userId === profile?.id;
      const actionText = isSelfAssign 
        ? `Self-assigned lead` 
        : `Assigned lead to ${targetUser?.name || targetUser?.email}`;
      
      await logActivity(actionText, 'lead', leadId, { assigned_to: userId });
      fetchData();
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const table = activeTab === 'finance' ? 'leads' : 'enrollments';
    const { error } = await supabase
      .from(table)
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!error) {
      await logActivity(`Updated status to ${newStatus}`, activeTab === 'finance' ? 'lead' : 'enrollment', id, { status: newStatus });
      fetchData();
    }
  };

  const handleSmartAssign = async () => {
    if (activeTab !== 'finance' || salesUsers.length === 0) return;
    
    const unassignedLeads = data.filter(l => !l.assigned_to && l.status === 'new');
    if (unassignedLeads.length === 0) return;

    setLoading(true);
    let agentIndex = 0;
    
    for (const lead of unassignedLeads) {
      const agent = salesUsers[agentIndex];
      const { error } = await supabase
        .from('leads')
        .update({ assigned_to: agent.id, assigned_at: new Date().toISOString() })
        .eq('id', lead.id);
      
      if (!error) {
        await logActivity(`Smart-assigned lead to ${agent.name || agent.email}`, 'lead', lead.id, { automated: true });
      }
      
      agentIndex = (agentIndex + 1) % salesUsers.length;
    }
    
    fetchData();
  };

  const filteredData = data.filter((item: any) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch = 
      (item.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (item.phone || '').includes(search) ||
      (item.city?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (activeTab === 'education' && (item.course_name?.toLowerCase() || '').includes(search.toLowerCase()));
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
      case 'enrolled': return 'bg-emerald-50 text-emerald-700';
      case 'rejected': return 'bg-red-50 text-red-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Redesigned Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            {activeTab === 'finance' ? <Briefcase className="w-8 h-8 text-blue-600" /> : <GraduationCap className="w-8 h-8 text-purple-600" />}
            {activeTab === 'finance' ? 'Finance CRM' : 'Education CRM'}
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
            Managing <span className="text-slate-900">{filteredData.length}</span> active {activeTab === 'finance' ? 'leads' : 'enrollments'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Module Switcher */}
          {profile?.role === 'admin' && (
            <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <button
                onClick={() => handleTabChange('finance')}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  activeTab === 'finance' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Finance
              </button>
              <button
                onClick={() => handleTabChange('education')}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  activeTab === 'education' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Education
              </button>
            </div>
          )}
          
          <button className="h-12 px-6 rounded-2xl bg-white border border-slate-200 text-sm font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2">
             <FileDown className="w-4 h-4" />
             Export
          </button>

          {profile?.role === 'admin' && activeTab === 'finance' && (
             <button 
               onClick={handleSmartAssign}
               disabled={data.filter(l => !l.assigned_to && l.status === 'new').length === 0}
               className="h-12 px-6 rounded-2xl bg-emerald-600 text-white text-sm font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:border-slate-300"
             >
                Smart Assign
                <Hash className="w-4 h-4" />
             </button>
          )}
        </div>
      </div>

      {/* Pipeline View (Mini Dashboard) */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['new', 'contacted', 'interested', 'converted', 'rejected'].map((s) => {
          const count = data.filter(d => d.status === s).length;
          const isActive = statusFilter === s;
          return (
            <button 
              key={s}
              onClick={() => setStatusFilter(isActive ? 'all' : s)}
              className={cn(
                "p-4 rounded-3xl border transition-all text-left group",
                isActive 
                  ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200" 
                  : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 shadow-sm"
              )}
            >
              <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isActive ? "text-slate-400" : "text-slate-300 group-hover:text-blue-400")}>{s}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black">{count}</span>
                <span className={cn("text-[10px] font-bold", isActive ? "text-slate-500" : "text-slate-400")}>{Math.round((count / (data.length || 1)) * 100)}%</span>
              </div>
            </button>
          )
        })}
      </section>

      {/* Main Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Advanced Filters */}
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/20">
           <div className="relative w-full md:max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
             <input 
               type="text" 
               placeholder={`Search ${activeTab === 'finance' ? 'leads' : 'enrollments'}...`}
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
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
             
             {profile?.role !== 'sales' && (
                <button className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex-shrink-0">
                  <UserPlus className="w-5 h-5" />
                </button>
             )}
           </div>
        </div>

        {/* Dense Enterprise Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed min-w-[1200px]">
            <thead className="bg-[#FAFBFD]">
              <tr className="border-b border-slate-100">
                <th className="w-16 px-6 py-5">
                   <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="w-56 px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Identity</th>
                <th className="w-48 px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{activeTab === 'finance' ? 'Financial Profile' : 'Course Target'}</th>
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
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <AlertCircle className="w-12 h-12 text-slate-100" />
                       <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No matching records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="group hover:bg-blue-50/20 transition-all">
                    <td className="px-6 py-5">
                       <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    </td>
                    <td className="px-4 py-5">
                       <div className="flex items-center gap-3">
                         <div className={cn(
                           "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 transition-transform group-hover:scale-105",
                           activeTab === 'finance' ? "bg-blue-100 text-blue-700 shadow-sm shadow-blue-100" : "bg-purple-100 text-purple-700 shadow-sm shadow-purple-100"
                         )}>
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
                           {activeTab === 'finance' ? item.loan_type : item.course_name}
                         </p>
                         <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1 truncate">
                           <MapPin className="w-3 h-3 text-slate-300" /> {activeTab === 'finance' ? (item.city || 'Regional') : (item.email || 'Direct')}
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
                        {activeTab === 'finance' ? (
                          !item.assigned_to && (userRole === 'sales' || userRole === 'manager') ? (
                            <button 
                              onClick={() => handleAssign(item.id, profile?.id)}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all w-full text-center border border-blue-200"
                            >
                              Assign to Me
                            </button>
                          ) : item.assigned_to && userRole !== 'admin' ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                {item.profiles?.name?.charAt(0) || item.profiles?.email?.charAt(0) || 'U'}
                              </div>
                              <span className="text-[11px] font-bold text-slate-700 truncate w-24">
                                {item.assigned_to === profile?.id ? 'Me' : (item.profiles?.name || item.profiles?.email)}
                              </span>
                            </div>
                          ) : (
                            <div className="relative group/assign">
                              <select 
                                value={item.assigned_to || ''}
                                onChange={(e) => handleAssign(item.id, e.target.value)}
                                className={cn(
                                  "w-full border-none text-[11px] font-bold rounded-xl py-2 pl-3 pr-8 appearance-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer",
                                  !item.assigned_to ? "bg-red-50 text-red-600 ring-1 ring-red-200" : "bg-slate-50 text-slate-600"
                                )}
                              >
                                <option value="">Unassigned</option>
                                {/* Group by role */}
                                <optgroup label="Managers">
                                  {salesUsers.filter(u => u.role === 'manager').map(u => 
                                    <option key={u.id} value={u.id}>{u.name || u.email}</option>
                                  )}
                                </optgroup>
                                <optgroup label="Sales Agents">
                                  {salesUsers.filter(u => u.role === 'sales').map(u => 
                                    <option key={u.id} value={u.id}>{u.name || u.email}</option>
                                  )}
                                </optgroup>
                              </select>
                              <UserPlus className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            </div>
                          )
                        ) : (
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Admin Only</span>
                        )}
                    </td>
                    <td className="px-4 py-5">
                       <div className="relative">
                        <select 
                          value={item.status}
                          onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                          className={cn(
                            "w-full border-none text-[10px] font-black uppercase tracking-widest rounded-xl py-2 pl-3 pr-8 appearance-none focus:ring-2 focus:ring-blue-500/20 shadow-sm",
                            getStatusStyle(item.status)
                          )}
                        >
                          <option value="new">{activeTab === 'education' ? 'New Enrollment' : 'New Lead'}</option>
                          <option value="contacted">Contacted</option>
                          <option value="interested">Interested</option>
                          <option value={activeTab === 'education' ? 'enrolled' : 'converted'}>{activeTab === 'education' ? 'Enrolled' : 'Converted'}</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50 pointer-events-none rotate-90" />
                       </div>
                    </td>
                    <td className="px-4 py-5">
                       <div className="flex items-center gap-2">
                         <a 
                           href={`tel:${item.phone}`}
                           className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-90"
                         >
                           <PhoneCall className="w-4 h-4" />
                         </a>
                         <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white hover:shadow-lg hover:shadow-emerald-200 transition-all active:scale-90">
                           <MessageCircle className="w-4 h-4" />
                         </button>
                         <Link 
                           href={`/crm/${activeTab === 'finance' ? 'leads' : 'enrollments'}/${item.id}`}
                           className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all active:scale-90"
                         >
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

        {/* Dense Pagination Info */}
        <div className="px-8 py-5 border-t border-slate-50 flex items-center justify-between bg-slate-50/10">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {filteredData.length} records</span>
           <div className="flex items-center gap-1.5 font-bold text-xs text-slate-400">
             <button className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm flex items-center justify-center transition-all disabled:opacity-20">&lt;</button>
             <button className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-600">1</button>
             <button className="w-8 h-8 rounded-lg hover:bg-white hover:shadow-sm flex items-center justify-center transition-all">&gt;</button>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center animate-pulse flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
      <span className="text-xs font-black uppercase tracking-widest text-slate-300">Synchronizing CRM Data...</span>
    </div>}>
      <LeadsContent />
    </Suspense>
  );
}
