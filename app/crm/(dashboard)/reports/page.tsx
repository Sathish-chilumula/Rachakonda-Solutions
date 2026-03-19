'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { BarChart3, TrendingUp, Download, FileText, Users, Briefcase, GraduationCap, CheckCircle2, XCircle, Clock, Printer } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface ReportMetrics {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  interestedLeads: number;
  convertedLeads: number;
  rejectedLeads: number;
  totalEnrollments: number;
  enrolledCount: number;
  conversionRate: number;
  agentPerformance: { name: string; email: string; assigned: number; converted: number; pending: number }[];
  recentLeads: { name: string; loan_type: string; status: string; city: string; created_at: string }[];
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchReportData = useCallback(async () => {
    setLoading(true);

    // Fetch all leads
    const { data: leads } = await supabase.from('leads').select('*, profiles(name, email)').order('created_at', { ascending: false });
    const { data: enrollments } = await supabase.from('enrollments').select('*');
    const { data: agents } = await supabase.from('profiles').select('*').eq('role', 'sales');

    const allLeads = leads || [];
    const allEnrollments = enrollments || [];
    const allAgents = agents || [];

    const convertedLeads = allLeads.filter(l => l.status === 'converted').length;

    // Agent performance
    const agentPerformance = allAgents.map(agent => {
      const agentLeads = allLeads.filter(l => l.assigned_to === agent.id);
      return {
        name: agent.name || 'Unnamed',
        email: agent.email,
        assigned: agentLeads.length,
        converted: agentLeads.filter(l => l.status === 'converted').length,
        pending: agentLeads.filter(l => l.status === 'new' || l.status === 'contacted' || l.status === 'interested').length,
      };
    });

    setMetrics({
      totalLeads: allLeads.length,
      newLeads: allLeads.filter(l => l.status === 'new').length,
      contactedLeads: allLeads.filter(l => l.status === 'contacted').length,
      interestedLeads: allLeads.filter(l => l.status === 'interested').length,
      convertedLeads,
      rejectedLeads: allLeads.filter(l => l.status === 'rejected').length,
      totalEnrollments: allEnrollments.length,
      enrolledCount: allEnrollments.filter(e => e.status === 'enrolled').length,
      conversionRate: allLeads.length ? Math.round((convertedLeads / allLeads.length) * 100) : 0,
      agentPerformance,
      recentLeads: allLeads.slice(0, 10).map(l => ({
        name: l.name,
        loan_type: l.loan_type,
        status: l.status,
        city: l.city || 'N/A',
        created_at: l.created_at,
      })),
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleDownloadPDF = (reportType: string) => {
    setGenerating(reportType);
    
    // Use window.print() with the hidden printable div
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to download the report.');
      setGenerating(null);
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Rachakonda Solutions — ${reportType} Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; }
            h1 { font-size: 24px; margin-bottom: 4px; color: #1e3a8a; }
            h2 { font-size: 16px; margin: 24px 0 12px; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
            .subtitle { font-size: 12px; color: #94a3b8; margin-bottom: 24px; }
            .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
            .kpi { padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; }
            .kpi-value { font-size: 28px; font-weight: 800; color: #1e3a8a; }
            .kpi-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; border-bottom: 2px solid #e2e8f0; }
            td { padding: 10px 12px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
            .badge-new { background: #dbeafe; color: #1d4ed8; }
            .badge-contacted { background: #fef3c7; color: #b45309; }
            .badge-interested { background: #f3e8ff; color: #7c3aed; }
            .badge-converted { background: #d1fae5; color: #059669; }
            .badge-rejected { background: #fee2e2; color: #dc2626; }
            .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
            .pipeline { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 24px; }
            .pipeline-item { padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; }
            .pipeline-count { font-size: 20px; font-weight: 800; }
            .pipeline-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-top: 2px; }
          </style>
        </head>
        <body>
          <h1>Rachakonda Solutions</h1>
          <p class="subtitle">CRM ${reportType} Report • Generated ${format(new Date(), 'PPpp')}</p>
          
          <div class="kpis">
            <div class="kpi">
              <div class="kpi-value">${metrics?.totalLeads || 0}</div>
              <div class="kpi-label">Total Finance Leads</div>
            </div>
            <div class="kpi">
              <div class="kpi-value">${metrics?.convertedLeads || 0}</div>
              <div class="kpi-label">Converted Leads</div>
            </div>
            <div class="kpi">
              <div class="kpi-value">${metrics?.conversionRate || 0}%</div>
              <div class="kpi-label">Conversion Rate</div>
            </div>
            <div class="kpi">
              <div class="kpi-value">${metrics?.totalEnrollments || 0}</div>
              <div class="kpi-label">Education Enrollments</div>
            </div>
          </div>

          <h2>Lead Pipeline Status</h2>
          <div class="pipeline">
            <div class="pipeline-item"><div class="pipeline-count" style="color:#1d4ed8">${metrics?.newLeads || 0}</div><div class="pipeline-label">New</div></div>
            <div class="pipeline-item"><div class="pipeline-count" style="color:#b45309">${metrics?.contactedLeads || 0}</div><div class="pipeline-label">Contacted</div></div>
            <div class="pipeline-item"><div class="pipeline-count" style="color:#7c3aed">${metrics?.interestedLeads || 0}</div><div class="pipeline-label">Interested</div></div>
            <div class="pipeline-item"><div class="pipeline-count" style="color:#059669">${metrics?.convertedLeads || 0}</div><div class="pipeline-label">Converted</div></div>
            <div class="pipeline-item"><div class="pipeline-count" style="color:#dc2626">${metrics?.rejectedLeads || 0}</div><div class="pipeline-label">Rejected</div></div>
          </div>

          <h2>Sales Agent Performance</h2>
          <table>
            <thead><tr><th>Agent</th><th>Assigned</th><th>Converted</th><th>Pending</th><th>Rate</th></tr></thead>
            <tbody>
              ${metrics?.agentPerformance.map(a => `
                <tr>
                  <td><strong>${a.name}</strong><br/><span style="color:#94a3b8;font-size:10px">${a.email}</span></td>
                  <td>${a.assigned}</td>
                  <td>${a.converted}</td>
                  <td>${a.pending}</td>
                  <td>${a.assigned ? Math.round((a.converted / a.assigned) * 100) : 0}%</td>
                </tr>
              `).join('') || '<tr><td colspan="5" style="text-align:center;color:#94a3b8">No agents found</td></tr>'}
            </tbody>
          </table>

          <h2>Recent Leads (Last 10)</h2>
          <table>
            <thead><tr><th>Name</th><th>Loan Type</th><th>City</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              ${metrics?.recentLeads.map(l => `
                <tr>
                  <td>${l.name}</td>
                  <td style="text-transform:capitalize">${l.loan_type?.replace(/-/g, ' ') || 'N/A'}</td>
                  <td>${l.city}</td>
                  <td><span class="badge badge-${l.status}">${l.status}</span></td>
                  <td>${format(new Date(l.created_at), 'MMM d, yyyy')}</td>
                </tr>
              `).join('') || '<tr><td colspan="5" style="text-align:center;color:#94a3b8">No leads found</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            Rachakonda Solutions CRM • Confidential Report • ${format(new Date(), 'PPPP')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      setGenerating(null);
    }, 500);
  };

  const kpiCards = metrics ? [
    { label: 'Finance Leads', value: metrics.totalLeads, icon: Briefcase, color: 'blue' },
    { label: 'Converted', value: metrics.convertedLeads, icon: CheckCircle2, color: 'emerald' },
    { label: 'Conversion Rate', value: `${metrics.conversionRate}%`, icon: TrendingUp, color: 'purple' },
    { label: 'Enrollments', value: metrics.totalEnrollments, icon: GraduationCap, color: 'amber' },
  ] : [];

  const reports = [
    { title: 'Monthly Lead Conversion', type: 'Lead Conversion', icon: TrendingUp, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Agent Efficiency Ledger', type: 'Agent Performance', icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { title: 'Financial Pipeline Forecast', type: 'Pipeline Forecast', icon: Briefcase, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { title: 'Education Enrollment Report', type: 'Education Enrollment', icon: GraduationCap, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  ];

  if (loading) {
    return (
      <div className="space-y-8 max-w-[1400px] mx-auto animate-pulse">
        <div className="h-12 bg-slate-100 rounded-2xl w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white rounded-3xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-white rounded-[2.5rem]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Strategic Reports
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
            Real-time analytics from <span className="text-slate-900">{metrics?.totalLeads || 0}</span> leads and <span className="text-slate-900">{metrics?.totalEnrollments || 0}</span> enrollments
          </p>
        </div>

        <button
          onClick={() => handleDownloadPDF('Complete CRM')}
          className="h-12 px-6 rounded-2xl bg-blue-600 text-white text-sm font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Full Report
        </button>
      </div>

      {/* Live KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-2xl ${
              card.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              card.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
              card.color === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'
            } flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-900">{card.value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Pipeline Breakdown Bar */}
      {metrics && metrics.totalLeads > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Pipeline Distribution</p>
          <div className="flex rounded-2xl overflow-hidden h-4">
            {[
              { count: metrics.newLeads, color: 'bg-blue-500', label: 'New' },
              { count: metrics.contactedLeads, color: 'bg-amber-500', label: 'Contacted' },
              { count: metrics.interestedLeads, color: 'bg-purple-500', label: 'Interested' },
              { count: metrics.convertedLeads, color: 'bg-emerald-500', label: 'Converted' },
              { count: metrics.rejectedLeads, color: 'bg-red-500', label: 'Rejected' },
            ].filter(s => s.count > 0).map((seg) => (
              <div
                key={seg.label}
                className={`${seg.color} transition-all`}
                style={{ width: `${(seg.count / metrics.totalLeads) * 100}%` }}
                title={`${seg.label}: ${seg.count}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            {[
              { label: 'New', count: metrics.newLeads, color: 'bg-blue-500' },
              { label: 'Contacted', count: metrics.contactedLeads, color: 'bg-amber-500' },
              { label: 'Interested', count: metrics.interestedLeads, color: 'bg-purple-500' },
              { label: 'Converted', count: metrics.convertedLeads, color: 'bg-emerald-500' },
              { label: 'Rejected', count: metrics.rejectedLeads, color: 'bg-red-500' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                <span className="text-[10px] font-bold text-slate-500">{s.label}: {s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, i) => (
          <div
            key={i}
            className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${report.bgColor} group-hover:shadow-lg transition-all ${report.color}`}>
                <report.icon className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Data
              </span>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 uppercase">{report.title}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.type} Analysis</p>
            
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {metrics?.totalLeads || 0} records analyzed
                </span>
              </div>
              <button
                onClick={() => handleDownloadPDF(report.type)}
                disabled={generating === report.type}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                {generating === report.type ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Performance Table */}
      {metrics && metrics.agentPerformance.length > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50">
            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Sales Performance Summary</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Tracking {metrics.agentPerformance.length} agents</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Agent</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assigned</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Converted</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Conv. Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {metrics.agentPerformance.map((agent) => (
                  <tr key={agent.email} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4">
                      <p className="text-sm font-bold text-slate-900">{agent.name}</p>
                      <p className="text-[10px] text-slate-400">{agent.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{agent.assigned}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">{agent.converted}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold">{agent.pending}</span>
                    </td>
                    <td className="px-8 py-4 text-sm font-black text-blue-600">
                      {agent.assigned ? Math.round((agent.converted / agent.assigned) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hidden print target */}
      <div ref={printRef} className="hidden" />
    </div>
  );
}
