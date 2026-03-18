'use client';

import { BarChart3, TrendingUp, Calendar, Download, PieChart, LineChart, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReportsPage() {
  const reports = [
    { title: 'Monthly Lead Conversion', type: 'Performance', icon: TrendingUp, color: 'text-blue-600' },
    { title: 'Agent Efficiency Ledger', type: 'Audit', icon: FileText, color: 'text-purple-600' },
    { title: 'Financial Pipeline Forecast', type: 'Projection', icon: LineChart, color: 'text-emerald-600' },
    { title: 'Education Enrollment Demographics', type: 'Analytics', icon: PieChart, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Strategic Reports
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
            Advanced analytics and performance insights
          </p>
        </div>

        <button className="h-12 px-6 rounded-2xl bg-white border border-slate-200 text-sm font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2">
           <Calendar className="w-4 h-4" />
           Date Range
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
               <div className={`p-4 rounded-2xl bg-slate-50 group-hover:bg-white group-hover:shadow-lg transition-all ${report.color}`}>
                 <report.icon className="w-6 h-6" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">BI Generated</span>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 uppercase">{report.title}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.type} Perspective</p>
            
            <div className="mt-8 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data Ready</span>
               </div>
               <button className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center gap-2">
                 <Download className="w-3.5 h-3.5" />
                 Download PDF
               </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-12 text-center relative overflow-hidden group">
         <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-full scale-150 group-hover:scale-110 transition-transform duration-1000" />
         <div className="relative z-10">
            <h3 className="text-white text-2xl font-black tracking-tight mb-4 uppercase">Custom BI Integration</h3>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest max-w-md mx-auto">Requires manual synchronization for customized performance metrics over a rolling 12-month period.</p>
            <button className="mt-8 px-10 py-4 rounded-2xl bg-white text-slate-900 text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">
               Request Custom Analysis
            </button>
         </div>
      </div>
    </div>
  );
}
