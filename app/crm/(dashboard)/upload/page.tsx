'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion } from 'framer-motion';

export default function UploadLeadsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResults(null);
      setProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null);
      setProgress(0);
    }
  };

  const processExcel = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(10);
    setResults(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);

          setProgress(30);

          let successCount = 0;
          let failedCount = 0;
          let errors: string[] = [];

          // Process in batches
          const batchSize = 50;
          for (let i = 0; i < json.length; i += batchSize) {
            const batch = json.slice(i, i + batchSize);
            
            const formattedBatch = batch.map((row: any) => ({
              name: row.Name || row.name || 'Unknown',
              phone: String(row.Phone || row.phone || ''),
              city: row.City || row.city || '',
              loan_type: row['Loan Type'] || row.loan_type || row.LoanType || '',
              amount: parseFloat(row.Amount || row.amount || 0) || null,
              income: parseFloat(row.Income || row.income || 0) || null,
              source: 'excel',
              status: 'new'
            })).filter(row => row.name !== 'Unknown' && row.phone); // Basic validation

            if (formattedBatch.length > 0) {
              const { error } = await supabase.from('leads').insert(formattedBatch);
              
              if (error) {
                failedCount += formattedBatch.length;
                errors.push(`Batch ${Math.floor(i/batchSize) + 1} failed: ${error.message}`);
              } else {
                successCount += formattedBatch.length;
                failedCount += (batch.length - formattedBatch.length);
                if (batch.length > formattedBatch.length) {
                  errors.push(`Batch ${Math.floor(i/batchSize) + 1}: ${batch.length - formattedBatch.length} rows skipped (missing Name or Phone)`);
                }
              }
            } else {
              failedCount += batch.length;
              errors.push(`Batch ${Math.floor(i/batchSize) + 1} skipped: Invalid data format (missing Name or Phone)`);
            }

            setProgress(30 + Math.floor((i / json.length) * 70));
          }

          setResults({ success: successCount, failed: failedCount, errors });
          setProgress(100);
        } catch (err: any) {
          setResults({ success: 0, failed: 0, errors: [err.message || 'Failed to parse Excel file'] });
        } finally {
          setUploading(false);
          setFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsBinaryString(file);
    } catch (err: any) {
      setResults({ success: 0, failed: 0, errors: [err.message || 'Failed to read file'] });
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Upload Leads</h1>
        <p className="text-sm text-slate-500 mt-1">Import leads from an Excel or CSV file.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Expected Format</h2>
          <p className="text-sm text-slate-600 mb-4">Your Excel file should contain the following columns:</p>
          <div className="flex flex-wrap gap-2">
            {['Name', 'Phone', 'City', 'Loan Type', 'Amount', 'Income'].map(col => (
              <span key={col} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200">
                {col}
              </span>
            ))}
          </div>
        </div>

        <div 
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' :
            file ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
            id="file-upload"
          />
          
          {!file ? (
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Click to upload or drag and drop</h3>
              <p className="text-sm text-slate-500">XLSX, XLS, or CSV (max. 10MB)</p>
            </label>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">{file.name}</h3>
              <p className="text-sm text-slate-500 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={processExcel}
                  disabled={uploading}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-70 flex items-center"
                >
                  {uploading ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    'Upload Leads'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {uploading && (
          <div className="mt-8">
            <div className="flex justify-between text-sm font-medium text-slate-700 mb-2">
              <span>Uploading and processing...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {results && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4">Upload Results</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-emerald-100 flex items-center">
                <CheckCircle className="w-8 h-8 text-emerald-500 mr-3" />
                <div>
                  <p className="text-sm text-slate-500 font-medium">Successfully Imported</p>
                  <p className="text-2xl font-bold text-slate-900">{results.success}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-red-100 flex items-center">
                <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
                <div>
                  <p className="text-sm text-slate-500 font-medium">Failed / Skipped</p>
                  <p className="text-2xl font-bold text-slate-900">{results.failed}</p>
                </div>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <h4 className="text-sm font-bold text-red-800 mb-2">Error Log</h4>
                <ul className="text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto">
                  {results.errors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
