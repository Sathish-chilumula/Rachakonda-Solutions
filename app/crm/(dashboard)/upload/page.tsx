'use client';

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Database,
  ArrowRight,
  Info,
  X,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ success?: number, total?: number, error?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus(null);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseCSV(text);
      };
      reader.readAsText(selectedFile);
    }
  };

  const parseCSV = (text: string) => {
    try {
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) throw new Error('CSV file is empty or missing headers.');

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const entry: any = {};
        headers.forEach((header, index) => {
          if (header.includes('name')) entry.name = values[index];
          else if (header.includes('phone') || header.includes('mobile')) entry.phone = values[index];
          else if (header.includes('city')) entry.city = values[index];
          else if (header.includes('address')) entry.address = values[index];
          else if (header.includes('designation')) entry.designation = values[index];
          else if (header.includes('loan') || header.includes('type')) entry.loan_type = values[index];
          else if (header.includes('amount') || header.includes('req')) entry.amount = parseFloat(values[index]) || 0;
          else if (header.includes('income') || header.includes('salary')) entry.income = parseFloat(values[index]) || 0;
          else if (header.includes('tenure')) entry.tenure = values[index];
          else if (header.includes('emi')) entry.emi = parseFloat(values[index]) || 0;
          else if (header.includes('pending')) entry.pending_emi = parseFloat(values[index]) || 0;
          else if (header.includes('completed')) entry.completed_emi = parseFloat(values[index]) || 0;
          else if (header.includes('previous') || header.includes('history')) entry.previous_loan = values[index];
        });
        
        if (!entry.name || !entry.phone) return null;
        
        return {
          ...entry,
          status: 'new',
          source: 'excel',
          priority: 'medium'
        };
      }).filter(Boolean);

      setPreviewData(data);
    } catch (err: any) {
      setUploadStatus({ error: err.message });
    }
  };

  const handleUpload = async () => {
    if (previewData.length === 0) return;
    setIsUploading(true);
    setUploadStatus(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.from('leads').insert(previewData).select();

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: session?.user.id,
        action: `Imported ${previewData.length} leads via Excel`,
        entity_type: 'lead',
        entity_id: session?.user.id as any,
        details: { count: previewData.length }
      });

      setUploadStatus({ success: data.length, total: previewData.length });
      setPreviewData([]);
      setFile(null);
    } catch (err: any) {
      setUploadStatus({ error: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <UploadCloud className="w-8 h-8 text-blue-600" />
            Bulk Data Engine
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
            High-speed CSV parser & lead migration tool
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        <div className="xl:col-span-12">
          {!file ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-16 flex flex-col items-center text-center group hover:border-blue-200 transition-all cursor-pointer bg-slate-50/20"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
              <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform shadow-2xl shadow-blue-500/10">
                <FileSpreadsheet className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Drop CSV File Here</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-[300px] mx-auto leading-relaxed italic">
                Supported Schema: Name, Phone, City, Loan Type, Amount
              </p>
              <button className="mt-10 px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all">
                Select file
              </button>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Data Preview</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Found <span className="text-blue-600 font-black italic">{previewData.length}</span> candidates</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setFile(null); setPreviewData([]); }} className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 transition-all shadow-sm">
                      <X className="w-5 h-5" />
                    </button>
                    <button onClick={handleUpload} disabled={isUploading || previewData.length === 0} className="h-14 px-10 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all">
                      {isUploading ? 'Migrating...' : 'Start Lead Import'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-[#FAFBFD] z-10 border-b border-slate-50">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Validated Name</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Node</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Financial Target</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Volume</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Integrity Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {previewData.map((row, i) => (
                        <tr key={i} className="group hover:bg-blue-50/30 transition-colors">
                          <td className="px-8 py-4"><span className="text-sm font-bold text-slate-900">{row.name}</span></td>
                          <td className="px-6 py-4"><div className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-slate-300" /><span className="text-xs font-semibold text-slate-600">{row.phone}</span></div></td>
                          <td className="px-6 py-4"><span className="text-xs font-black text-blue-600 uppercase tracking-tight">{row.loan_type || 'N/A'}</span></td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-600">₹{row.amount?.toLocaleString() || '0'}</td>
                          <td className="px-8 py-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Ready</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              <div className="p-6 bg-slate-900 border border-slate-800 rounded-[2rem] flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Automation Warning</h3>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">Upon import, these leads will be tagged as <span className="text-blue-400">#Excel-Source</span>.</p>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {uploadStatus && (
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={cn("fixed bottom-10 right-10 p-8 rounded-[2rem] shadow-2xl flex items-center gap-6 z-50 border-4", uploadStatus.error ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100")}>
                <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg", uploadStatus.error ? "bg-red-600 text-white" : "bg-emerald-600 text-white")}>
                  {uploadStatus.error ? <AlertCircle className="w-8 h-8" /> : <Database className="w-8 h-8" />}
                </div>
                <div>
                  <h3 className={cn("text-lg font-black uppercase tracking-tight", uploadStatus.error ? "text-red-900" : "text-emerald-900")}>{uploadStatus.error ? 'Migration Collision' : 'Migration Success'}</h3>
                  <p className={cn("text-sm font-bold opacity-70", uploadStatus.error ? "text-red-700" : "text-emerald-700")}>{uploadStatus.error || `Successfully integrated ${uploadStatus.success} leads.`}</p>
                </div>
                <button onClick={() => setUploadStatus(null)} className="ml-4 p-2 hover:bg-black/5 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
