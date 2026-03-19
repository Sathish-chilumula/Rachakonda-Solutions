'use client';

import { Suspense } from 'react';
import { GraduationCap, FileDown, Search, Filter, ChevronRight, PhoneCall, MessageCircle, AlertCircle, BookOpen, User } from 'lucide-react';
import { useCRM } from '../context';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function EducationContent() {
  const { profile, activeRole: userRole } = useCRM();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: results, error } = await supabase
      .from('enrollments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (results && !error) setData(results);
    setLoading(false);
  }, [userRole]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('enrollments')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!error) fetchData();
  };

  const filteredData = data.filter((item: any) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch = 
      (item.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (item.phone || '').includes(search) ||
      (item.course_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (item.email?.toLowerCase() || '').includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'new': return 'bg-blue-50 text-blue-700';
      case 'contacted': return 'bg-amber-50 text-amber-700';
      case 'enrolled': return 'bg-emerald-50 text-emerald-700';
      case 'rejected': return 'bg-red-50 text-red-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };


  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-purple-600" />
            Education CRM
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
            Managing <span className="text-slate-900">{filteredData.length}</span> active enrollments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-12 px-6 rounded-2xl bg-white border border-slate-200 text-sm font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2">
             <FileDown className="w-4 h-4" />
             Export
          </button>
        </div>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {['new', 'contacted', 'enrolled', 'rejected'].map((s) => {
          const count = data.filter(d => d.status === s).length;
          const isActive = statusFilter === s;
          return (
            <button 
              key={s}
              onClick={() => setStatusFilter(isActive ? 'all' : s)}
              className={cn(
                "p-4 rounded-3xl border transition-all text-left",
                isActive 
                  ? "bg-purple-900 text-white border-purple-900 shadow-xl shadow-purple-200" 
                  : "bg-white border-slate-100 hover:border-purple-200 shadow-sm"
              )}
            >
              <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isActive ? "text-purple-300" : "text-slate-300")}>{s}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black">{count}</span>
                <span className={cn("text-[10px] font-bold", isActive ? "text-purple-400" : "text-slate-400")}>{Math.round((count / (data.length || 1)) * 100)}%</span>
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
               placeholder="Search enrollments..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all"
             />
           </div>

           <div className="flex items-center gap-3">
             <div className="relative w-48">
               <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
               <select 
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold appearance-none outline-none transition-all uppercase tracking-widest text-slate-500"
               >
                 <option value="all">Enrollment Status</option>
                 <option value="new">New Entry</option>
                 <option value="contacted">Contacted</option>
                 <option value="enrolled">Enrolled</option>
                 <option value="rejected">Rejected</option>
               </select>
               <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none rotate-90" />
             </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed min-w-[1200px]">
            <thead className="bg-[#FAFBFD]">
              <tr className="border-b border-slate-100">
                <th className="w-16 px-6 py-5">
                   <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                </th>
                <th className="w-56 px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Identity</th>
                <th className="w-48 px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Course Selection</th>
                <th className="w-40 px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Details</th>
                <th className="w-40 px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Enrollment Status</th>
                <th className="w-32 px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                 [1,2,3,4,5].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-8"><div className="h-6 bg-slate-50 rounded-lg w-full" /></td>
                    </tr>
                 ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-300 font-black uppercase tracking-widest">No matching enrollments found</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="group hover:bg-purple-50/20 transition-all">
                    <td className="px-6 py-5">
                       <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                    </td>
                    <td className="px-4 py-5">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs shrink-0 transition-transform group-hover:scale-105">
                           {item.name?.charAt(0).toUpperCase()}
                         </div>
                         <div className="min-w-0">
                           <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                           <p className="text-[11px] font-bold text-slate-400">{item.email}</p>
                         </div>
                       </div>
                    </td>
                    <td className="px-4 py-5">
                       <div className="min-w-0">
                         <p className="text-xs font-black text-slate-700 truncate uppercase tracking-tight">
                           {item.course_name}
                         </p>
                         <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1 truncate">
                           <BookOpen className="w-3 h-3 text-slate-300" /> {item.category || 'General'}
                         </p>
                       </div>
                    </td>
                    <td className="px-4 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900">{item.phone}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Primary Phone</span>
                        </div>
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
                          <option value="new">New Entry</option>
                          <option value="contacted">Contacted</option>
                          <option value="enrolled">Enrolled</option>
                          <option value="rejected">Rejected</option>
                        </select>
                    </td>
                    <td className="px-4 py-5">
                       <div className="flex items-center gap-2">
                         <a href={`tel:${item.phone}`} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-purple-600 hover:text-white transition-all">
                           <PhoneCall className="w-4 h-4" />
                         </a>
                         <Link href={`/crm/enrollments/${item.id}`} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
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

export default function EducationCRMPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading Education Data...</div>}>
      <EducationContent />
    </Suspense>
  );
}
