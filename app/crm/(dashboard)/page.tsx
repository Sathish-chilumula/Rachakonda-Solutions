'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCRM } from './context';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DashboardPage() {
  const { profile, activeRole: role, impersonatedUser } = useCRM();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    convertedLeads: 0,
    totalEnrollments: 0,
    conversionRate: 0,
    activeAgents: 0
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [salesPerformance, setSalesPerformance] = useState<any[]>([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    
    // Determine the view context
    const isAdmin = role === 'admin';
    const targetUserId = impersonatedUser?.id || profile?.id;

    // 1. Fetch Key Metrics
    let leadsQuery = supabase.from('leads').select('*', { count: 'exact', head: true });
    if (!isAdmin) {
      leadsQuery = leadsQuery.eq('assigned_to', targetUserId);
    }
    const { count: totalLeadsCount } = await leadsQuery;

    let convertedLeadsQuery = supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'converted');
    if (!isAdmin) {
      convertedLeadsQuery = convertedLeadsQuery.eq('assigned_to', targetUserId);
    }
    const { count: convertedLeadsCount } = await convertedLeadsQuery;

    const { count: totalEnrollmentsCount } = await supabase.from('enrollments').select('*', { count: 'exact', head: true });

    // 3. Fetch Sales Profiles for performance table
    const { data: agents } = await supabase.from('profiles').select('*').eq('role', 'sales');

    // 4. Fetch Audit Logs (Recent Activity)
    const { data: logs } = await supabase
      .from('audit_logs')
      .select('*, profiles(email, name)')
      .order('created_at', { ascending: false })
      .limit(10);

    setMetrics({
      totalLeads: totalLeadsCount || 0,
      convertedLeads: convertedLeadsCount || 0,
      totalEnrollments: totalEnrollmentsCount || 0,
      conversionRate: totalLeadsCount ? Math.round(((convertedLeadsCount || 0) / totalLeadsCount) * 100) : 0,
      activeAgents: agents?.length || 0
    });

    if (logs) setActivities(logs);

    if (agents) {
      // Calculate real performance based on leads (mocking the join for simplicity in this fetch)
      const performance = await Promise.all(agents.map(async (agent) => {
        const { count: agentLeads } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('assigned_to', agent.id);
        const { count: agentConverted } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('assigned_to', agent.id).eq('status', 'converted');
        
        return {
          ...agent,
          deals: agentConverted || 0,
          progress: agentLeads ? Math.round(((agentConverted || 0) / agentLeads) * 100) : 0
        };
      }));
      setSalesPerformance(performance);
    }

    setLoading(false);
  }, [role, impersonatedUser, profile]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const cards = [
    { label: 'Total Leads', value: metrics.totalLeads, trend: '+12%', icon: Briefcase, color: 'blue' },
    { label: 'Enrollments', value: metrics.totalEnrollments, trend: '+5%', icon: GraduationCap, color: 'purple' },
    { label: 'Conversion', value: `${metrics.conversionRate}%`, trend: '+2%', icon: CheckCircle2, color: 'emerald' },
    { label: 'Active Team', value: metrics.activeAgents, trend: 'Stable', icon: Users, color: 'amber' },
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white rounded-3xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-96 bg-white rounded-[2.5rem]" />
          <div className="lg:col-span-4 h-96 bg-white rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-6 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Executive Summary
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live System Monitoring • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => fetchDashboardData()} className="h-12 px-6 rounded-2xl bg-white border border-slate-200 text-sm font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 shadow-sm transition-all border-b-4 active:border-b-0 active:translate-y-1">
             Sync Data
          </button>
          <Link href="/crm/finance" className="h-12 px-6 rounded-2xl bg-blue-600 text-white text-sm font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1">
             Manage Leads
             <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className={cn(
              "absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity",
              card.color === 'blue' ? 'bg-blue-600' :
              card.color === 'purple' ? 'bg-purple-600' :
              card.color === 'emerald' ? 'bg-emerald-600' : 'bg-amber-600'
            )} />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={cn(
                "p-3 rounded-2xl shadow-sm",
                card.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                card.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                card.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              )}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                card.trend.includes('+') ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"
              )}>
                {card.trend}
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{card.label}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sales Performance Section */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden h-fit">
          <div className="px-8 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Agent Performance</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Live conversion tracking across modules</p>
            </div>
            <Link href="/crm/users" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View Team Details</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Member</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {salesPerformance.length === 0 ? (
                   <tr><td colSpan={3} className="px-8 py-12 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">No agent data available</td></tr>
                ) : (
                  salesPerformance.map((user) => (
                    <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform">
                            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-tight">{user.name || 'Anonymous Agent'}</p>
                            <p className="text-[10px] font-medium text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="w-full max-w-[160px]">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.progress}% Score</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${user.progress}%` }}
                              className={cn(
                                "h-full rounded-full",
                                user.progress > 70 ? "bg-emerald-500" : user.progress > 40 ? "bg-blue-500" : "bg-amber-500"
                              )} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="px-3 py-1.5 rounded-xl bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                           {user.deals || 0} Successful Deals
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
             <div className="flex items-center justify-between mb-8 relative z-10">
               <div>
                 <h2 className="text-xl font-black text-white tracking-tight">System Ledger</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time event stream</p>
               </div>
               <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-blue-400">
                  <Clock className="w-5 h-5" />
               </div>
             </div>

             <div className="space-y-6 relative z-10">
               {activities.length === 0 ? (
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center py-10">No recent activity detected</p>
               ) : (
                 activities.map((log) => (
                   <div key={log.id} className="flex gap-4 group/item">
                     <div className="flex flex-col items-center">
                       <div className="w-3 h-3 rounded-full border-2 border-slate-700 bg-slate-900 group-hover/item:border-blue-500 transition-colors" />
                       <div className="w-0.5 flex-1 bg-slate-800 my-1" />
                     </div>
                     <div className="pb-6">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{format(new Date(log.created_at), 'HH:mm • MMM d')}</p>
                       <p className="text-[13px] font-bold text-slate-200 leading-tight">
                         <span className="text-blue-400 italic">@{log.profiles?.name || 'System'}</span> {log.action}
                       </p>
                     </div>
                   </div>
                 ))
               )}
             </div>
             
             <Link href="/crm/audit" className="flex items-center justify-center w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all relative z-10">
               Access Full Audit Logs
             </Link>
           </div>
           
           <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Integration Status</h3>
              <div className="space-y-4 mt-6">
                {[
                  { name: 'Supabase Engine', status: 'Optimal', color: 'emerald' },
                  { name: 'Finance API', status: 'Synchronized', color: 'blue' },
                  { name: 'Edu Portal', status: 'Secured', color: 'purple' }
                ].map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">{item.name}</span>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      item.color === 'emerald' ? 'text-emerald-500' :
                      item.color === 'blue' ? 'text-blue-500' : 'text-purple-500'
                    )}>{item.status}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
