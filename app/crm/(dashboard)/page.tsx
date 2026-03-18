'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, CheckCircle, Clock, TrendingUp, BookOpen, UserPlus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';

export default function CRMDashboard() {
  const [metrics, setMetrics] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    converted: 0,
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [employeeStats, setEmployeeStats] = useState<any[]>([]);
  const [eduMetrics, setEduMetrics] = useState({ total: 0, new: 0 });

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const userRole = profile?.role || 'sales';
    setRole(userRole);

    let query = supabase.from('leads').select('*', { count: 'exact' });

    // Sales users can now see metrics for ALL finance leads

    const { data: leads, error } = await query.order('updated_at', { ascending: false });

    const { data: enrollments, error: eduError } = await supabase
      .from('enrollments')
      .select('*');

    if (enrollments && !eduError) {
      setEduMetrics({
        total: enrollments.length,
        new: enrollments.filter((e: any) => e.status === 'new').length
      });
    }

    if (leads && !error) {
      const total = leads.length;
      const newLeads = leads.filter((l: any) => l.status === 'new').length;
      const contacted = leads.filter((l: any) => l.status === 'contacted').length;
      const converted = leads.filter((l: any) => l.status === 'converted').length;

      setMetrics({ total, new: newLeads, contacted, converted });
      setRecentLeads(leads.slice(0, 5));

      if (userRole === 'admin') {
        const { data: profiles } = await supabase.from('profiles').select('id, email, name').eq('role', 'sales');
        if (profiles && leads) {
          const stats = profiles.map((p: any) => {
            const userLeads = leads.filter((l: any) => l.assigned_to === p.id);
            return {
              id: p.id,
              name: p.name || p.email.split('@')[0],
              email: p.email,
              total: userLeads.length,
              converted: userLeads.filter((l: any) => l.status === 'converted').length,
              pending: userLeads.filter((l: any) => l.status === 'new' || l.status === 'contacted').length
            };
          });
          setEmployeeStats(stats);
        }
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMetrics();
  }, [fetchMetrics]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Finance Leads',
      value: metrics.total.toString(),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      trend: '+12% from last month',
      href: '/crm/leads'
    },
    {
      name: 'Edu Enrollments',
      value: eduMetrics.total.toString(),
      icon: BookOpen,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      trend: '+5% from last month',
      href: '/crm/leads?tab=education'
    },
    {
      name: 'New (Leads + Edu)',
      value: (metrics.new + eduMetrics.new).toString(),
      icon: UserPlus,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      trend: 'Needs attention',
      href: '/crm/leads'
    },
    {
      name: 'Total Converted',
      value: metrics.converted.toString(),
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      trend: '85% success rate',
      href: '/crm/leads?status=converted'
    },
  ];

  return (
    <div className="space-y-8 px-4 sm:px-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          {role === 'admin' ? 'Company-wide lead metrics and performance.' : 'Your assigned leads and performance.'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, index) => (
          <Link href={stat.href} key={stat.name}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center hover:shadow-md transition-shadow h-full"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white shrink-0 mb-3 sm:mb-0 ${stat.color}`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {role === 'admin' && employeeStats.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Employee Performance</h2>
            <Link href="/crm/users" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Manage Users
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Leads</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Converted</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {employeeStats.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 text-xs font-bold mr-3">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{emp.name}</div>
                          <div className="text-xs text-slate-500">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">{emp.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-emerald-600 font-bold">{emp.converted}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{emp.pending}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-slate-900 mr-2">
                          {emp.total > 0 ? Math.round((emp.converted / emp.total) * 100) : 0}%
                        </span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full" 
                            style={{ width: `${emp.total > 0 ? (emp.converted / emp.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
          <Link href="/crm/leads" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        {recentLeads.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>No recent activity found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentLeads.map((lead) => (
              <Link href={`/crm/leads/${lead.id}`} key={lead.id} className="block">
                <div className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-bold shrink-0">
                      {lead.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-sm font-medium text-slate-900">{lead.name}</p>
                      <p className="text-xs text-slate-500">{lead.phone} <span className="hidden sm:inline">• {lead.city || 'Unknown City'}</span></p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
                    <span className={`px-2.5 py-1 inline-flex text-[10px] sm:text-xs leading-5 font-semibold rounded-full capitalize ${
                      lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'contacted' ? 'bg-amber-100 text-amber-800' :
                      lead.status === 'converted' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {lead.status}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-400">
                      {format(new Date(lead.updated_at), 'MMM d')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
