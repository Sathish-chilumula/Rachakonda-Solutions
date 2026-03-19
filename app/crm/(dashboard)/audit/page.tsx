'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Activity,
  ChevronRight,
  Hash,
  Database,
  ExternalLink,
  Clock,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { format } from 'date-fns';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, profiles(email, name)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter(log => {
    const matchesType = typeFilter === 'all' || log.entity_type === typeFilter;
    const matchesSearch = 
      (log.action?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (log.profiles?.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (log.profiles?.name?.toLowerCase() || '').includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getEntityIcon = (type: string) => {
    switch(type) {
      case 'lead': return <Briefcase className="w-4 h-4 text-blue-500" />;
      case 'enrollment': return <GraduationCap className="w-4 h-4 text-purple-500" />;
      case 'profile': return <User className="w-4 h-4 text-amber-500" />;
      default: return <Database className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-slate-900" />
            Audit Ledger
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
            Immutable tracking of <span className="text-slate-900">{logs.length}</span> security & operational events
          </p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative w-full md:w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
             <input 
               type="text" 
               placeholder="Search activity..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/5 outline-none transition-all shadow-sm"
             />
           </div>
           
           <select 
             value={typeFilter}
             onChange={(e) => setTypeFilter(e.target.value)}
             className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 outline-none hover:border-slate-300 transition-colors shadow-sm"
           >
             <option value="all">Every Object</option>
             <option value="lead">Finance Leads</option>
             <option value="enrollment">Edu Enrollments</option>
             <option value="profile">User Accounts</option>
           </select>
        </div>
      </div>

      {/* Main Ledger Feed */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Initiator</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Event Action</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Object Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan={5} className="h-20 bg-slate-50/30" /></tr>)
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                     <Clock className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                     <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No activity found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, i) => (
                  <tr 
                    key={log.id} 
                    className="group hover:bg-slate-50/80 transition-all cursor-default"
                  >
                    <td className="px-8 py-5">
                       <div className="flex flex-col">
                         <span className="text-xs font-bold text-slate-900 leading-none">{format(new Date(log.created_at), 'HH:mm:ss')}</span>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">{format(new Date(log.created_at), 'MMM dd, yyyy')}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-500 text-[10px] group-hover:bg-slate-900 group-hover:text-white transition-all">
                           {log.profiles?.email?.charAt(0).toUpperCase()}
                         </div>
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 leading-none">{log.profiles?.name || 'System'}</span>
                            <span className="text-[10px] font-bold text-slate-400 lowercase">{log.profiles?.email}</span>
                         </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-200" />
                         <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{log.action}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-2">
                         {getEntityIcon(log.entity_type)}
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{log.entity_type}</span>
                         <span className="text-[10px] font-black text-blue-500 font-mono">#{log.entity_id.slice(0, 8)}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2">
                         <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                           Success
                         </div>
                         {log.details && (
                           <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                             <ExternalLink className="w-3.5 h-3.5" />
                           </button>
                         )}
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
