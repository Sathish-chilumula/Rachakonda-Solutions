'use client';

import { useEffect, useState, useCallback, Suspense, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  FileDown,
  PhoneCall,
  CheckCircle,
  Clock,
  GraduationCap,
  Briefcase,
  Users,
  MessageCircle,
  MessageSquare,
  AlertCircle,
  Check,
  ChevronRight,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  XCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  FileText,
  Trash2,
  AlertTriangle,
  Award,
  Printer,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useCRM } from '../context';
import { CandidateItem, parseCandidateLead, exportCandidatesToCSV } from '@/lib/candidate-utils';
import CandidatesTable from '@/components/crm/CandidatesTable';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function formatSafeDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatSafeTime(dateStr?: string | null): string {
  if (!dateStr) return '';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function isSafeToday(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.toDateString() === new Date().toDateString();
}

function LeadsContent() {
  const { profile } = useCRM();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get('tab') || 'candidates';

  const [activeTab, setActiveTab] = useState<'candidates' | 'students' | 'counseling'>(
    initialTab === 'students' ? 'students' : initialTab === 'counseling' ? 'counseling' : 'candidates'
  );

  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [counselingLeads, setCounselingLeads] = useState<any[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [activeModalCandidate, setActiveModalCandidate] = useState<CandidateItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [candidateToDelete, setCandidateToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      if (activeTab === 'candidates') {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('source', 'careers_portal')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setCandidates(data.map(parseCandidateLead));
        }
      } else if (activeTab === 'students') {
        const { data, error } = await supabase
          .from('enrollments')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setStudents(data);
        }
      } else {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .neq('source', 'careers_portal')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setCounselingLeads(data);
        }
      }
    } catch (e) {
      console.error('Error fetching CRM data:', e);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'students' || tabParam === 'counseling' || tabParam === 'candidates') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (tab: 'candidates' | 'students' | 'counseling') => {
    setActiveTab(tab);
    setStatusFilter('all');
    setSearch('');
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`?${params.toString()}`);
  };

  // Status updates for candidate
  const handleConfirmDeleteCandidate = async () => {
    if (!candidateToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/careers/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: candidateToDelete.id }),
      });
      if (res.ok) {
        setCandidates((prev) => prev.filter((c) => c.id !== candidateToDelete.id));
        setCounselingLeads((prev) => prev.filter((c) => c.id !== candidateToDelete.id));
        showToast(`Record for "${candidateToDelete.name}" permanently deleted.`);
        setCandidateToDelete(null);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to delete'}`);
      }
    } catch (e: any) {
      alert(`Delete error: ${e.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCandidateStatus = async (
    id: string,
    name: string,
    status: 'converted' | 'rejected' | 'contacted' | 'new'
  ) => {
    const { error } = await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            let statusLabel = 'New Application';
            if (status === 'converted') statusLabel = 'Selected / Hired';
            else if (status === 'rejected') statusLabel = 'Rejected';
            else if (status === 'contacted') statusLabel = 'Interview Scheduled';
            return { ...c, status, statusLabel };
          }
          return c;
        })
      );

      const label =
        status === 'converted'
          ? `🎉 ${name} marked as SELECTED!`
          : status === 'rejected'
          ? `${name} marked as REJECTED`
          : status === 'contacted'
          ? `Interview scheduled for ${name}`
          : `${name} reset to New`;
      showToast(label);
    } else {
      alert(`Error updating status: ${error.message}`);
    }
  };

  // Status update for student enrollment
  const handleStudentStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('enrollments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      );
      showToast(`Student status updated to ${status}`);
    } else {
      alert(`Error: ${error.message}`);
    }
  };

  // Status update for counseling inquiry
  const handleCounselingStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setCounselingLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l))
      );
      showToast(`Inquiry status updated to ${status}`);
    } else {
      alert(`Error: ${error.message}`);
    }
  };

  // Export handlers
  const handleExportCandidates = () => {
    exportCandidatesToCSV(
      filteredCandidates,
      'Rachakonda_Candidates_Walkin_95_Staff'
    );
  };

  const handleExportStudents = () => {
    if (students.length === 0) return alert('No students to export.');
    const headers = ['Student Name', 'Course', 'Category', 'Status', 'Date'];
    const rows = students.map((s) => [
      `"${s.name || ''}"`,
      `"${s.course_name || ''}"`,
      `"${s.category || ''}"`,
      `"${s.status || ''}"`,
      `"${formatSafeDate(s.created_at)}"`,
    ]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rachakonda_Student_Admissions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleExportCounseling = () => {
    if (counselingLeads.length === 0) return alert('No inquiries to export.');
    const headers = ['Name', 'Phone', 'City', 'Subject', 'Message', 'Status', 'Date'];
    const rows = counselingLeads.map((l) => [
      `"${l.name || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.city || ''}"`,
      `"${l.designation || 'General'}"`,
      `"${(l.remarks || '').replace(/"/g, '""')}"`,
      `"${l.status || 'new'}"`,
      `"${formatSafeDate(l.created_at)}"`,
    ]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rachakonda_Counseling_Inquiries_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Filtered views with crash-proof String() conversions
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const q = (search || '').toLowerCase();
      const matchSearch =
        !search ||
        String(c.name || '').toLowerCase().includes(q) ||
        String(c.phone || '').includes(q) ||
        String(c.rolesString || '').toLowerCase().includes(q) ||
        String(c.refId || '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [candidates, statusFilter, search]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const q = (search || '').toLowerCase();
      const matchSearch =
        !search ||
        String(s?.name || '').toLowerCase().includes(q) ||
        String(s?.phone || '').includes(q) ||
        String(s?.course_name || '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [students, statusFilter, search]);

  const filteredCounseling = useMemo(() => {
    return counselingLeads.filter((l) => {
      const matchStatus = statusFilter === 'all' || l.status === statusFilter;
      const q = (search || '').toLowerCase();
      const matchSearch =
        !search ||
        String(l?.name || '').toLowerCase().includes(q) ||
        String(l?.phone || '').includes(q) ||
        String(l?.city || '').toLowerCase().includes(q) ||
        String(l?.designation || '').toLowerCase().includes(q) ||
        String(l?.remarks || '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [counselingLeads, statusFilter, search]);

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-16">
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-wider mb-2">
              Education &amp; Walk-in Hiring Operations
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-blue-600" />
              Inquiries &amp; Applications Manager
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Centralized inbox for walk-in job candidates, student admissions, and counseling requests.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Refresh current list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {activeTab === 'candidates' ? (
              <button
                onClick={handleExportCandidates}
                className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <FileDown className="w-4 h-4" /> Export Candidates ({filteredCandidates.length})
              </button>
            ) : activeTab === 'students' ? (
              <button
                onClick={handleExportStudents}
                className="h-11 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <FileDown className="w-4 h-4" /> Export Students ({filteredStudents.length})
              </button>
            ) : (
              <button
                onClick={handleExportCounseling}
                className="h-11 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <FileDown className="w-4 h-4" /> Export Inquiries ({filteredCounseling.length})
              </button>
            )}
          </div>
        </div>

        {/* ─── Main Tabs ───────────────────────────────────────────────── */}
        <div className="flex border-b border-slate-200 mt-6 gap-2">
          <button
            onClick={() => handleTabChange('candidates')}
            className={`pb-3 px-4 text-sm font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'candidates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Job Candidates (95 Openings)</span>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
              {candidates.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('students')}
            className={`pb-3 px-4 text-sm font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'students'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Admissions</span>
            <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
              {students.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('counseling')}
            className={`pb-3 px-4 text-sm font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'counseling'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Counseling &amp; Contact Requests</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
              {counselingLeads.length}
            </span>
          </button>
        </div>
      </div>

      {/* ─── Search & Status Filters ─────────────────────────────────── */}
      <div className="glass-panel rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, ref ID, course, or role..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
          {['all', 'new', 'contacted', 'converted', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'converted' ? 'Selected / Hired 🟢' : s === 'contacted' ? 'Interview / In-Touch 🟡' : s === 'rejected' ? 'Rejected 🔴' : s}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Content Tab 1: Candidates (Unified Responsive CandidatesTable) ───────────────────────────────── */}
      {activeTab === 'candidates' && (
        <div className="glass-panel rounded-3xl overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-sm font-bold text-slate-500 font-display">Loading candidates...</div>
          ) : (
            <CandidatesTable
              candidates={filteredCandidates}
              selectedIds={selectedCandidateIds}
              onToggleSelect={(id) =>
                setSelectedCandidateIds((prev) =>
                  prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
                )
              }
              onToggleSelectAll={() => {
                if (selectedCandidateIds.length === filteredCandidates.length) {
                  setSelectedCandidateIds([]);
                } else {
                  setSelectedCandidateIds(filteredCandidates.map((c) => c.id));
                }
              }}
              onViewCandidate={(c) => setActiveModalCandidate(c)}
              onUpdateStatus={(id, status) => {
                const c = candidates.find((item) => item.id === id);
                handleCandidateStatus(id, c?.name || 'Candidate', status);
              }}
              onDeleteRequest={(c) => setCandidateToDelete(c)}
            />
          )}
        </div>
      )}

      {/* ─── Content Tab 2: Students ─────────────────────────────────── */}
      {activeTab === 'students' && (
        <div className="glass-panel rounded-3xl overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-sm font-bold text-slate-500 font-display">Loading student enrollments...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500 font-medium">
              No student enrollments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="sticky left-0 z-20 bg-slate-50/90 py-4 px-4 shadow-[4px_0_12px_-4px_rgba(15,23,42,0.06)]">Student Name</th>
                    <th className="py-4 px-4 min-w-[170px]">Course Name &amp; Category</th>
                    <th className="py-4 px-4 min-w-[160px]">Contact</th>
                    <th className="py-4 px-4 min-w-[140px]">Enrollment Date</th>
                    <th className="py-4 px-4 min-w-[150px]">Status</th>
                    <th className="sticky right-0 z-20 bg-slate-50/90 py-4 px-4 text-center shadow-[-4px_0_12px_-4px_rgba(15,23,42,0.06)]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="group hover:bg-slate-50/70 transition-colors">
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 py-4 px-4 font-bold text-slate-900 shadow-[4px_0_12px_-4px_rgba(15,23,42,0.06)]">
                        {s?.name ? String(s.name) : 'Unnamed Student'}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-blue-900 text-xs">{s?.course_name ? String(s.course_name) : 'Course'}</p>
                        <p className="text-[11px] text-slate-500">{s?.category ? String(s.category) : 'General'}</p>
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold">
                        <a href={`tel:${s?.phone ?? ''}`} className="hover:text-blue-600 tabular-nums">
                          {s?.phone ? String(s.phone) : '—'}
                        </a>
                        {s?.email && <p className="text-slate-400 truncate max-w-[160px]">{String(s.email)}</p>}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 tabular-nums">
                        {formatSafeDate(s?.created_at)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          s?.status === 'converted' ? 'bg-emerald-100 text-emerald-800' : s?.status === 'contacted' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {s?.status ? String(s.status) : 'new'}
                        </span>
                      </td>
                      <td className="sticky right-0 z-10 bg-white group-hover:bg-slate-50/80 py-4 px-4 text-center shadow-[-4px_0_12px_-4px_rgba(15,23,42,0.06)]">
                        <select
                          value={s?.status ?? 'new'}
                          onChange={(e) => handleStudentStatus(s.id, e.target.value)}
                          className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-hidden"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="converted">Enrolled / Paid</option>
                          <option value="rejected">Rejected / Dropped</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Content Tab 3: Counseling Requests (Safe & Crash-Proof) ──────────────────────── */}
      {activeTab === 'counseling' && (
        <div className="glass-panel rounded-3xl overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-sm font-bold text-slate-500 font-display">Loading counseling requests...</div>
          ) : filteredCounseling.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500 font-medium">
              No counseling requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="sticky left-0 z-20 bg-slate-50/90 py-4 px-4 shadow-[4px_0_12px_-4px_rgba(15,23,42,0.06)]">Visitor Name</th>
                    <th className="py-4 px-4 min-w-[160px]">Inquiry Subject</th>
                    <th className="py-4 px-4 min-w-[170px]">Contact Info</th>
                    <th className="py-4 px-4 min-w-[220px]">Message / Details</th>
                    <th className="py-4 px-4 min-w-[140px]">Received Date</th>
                    <th className="py-4 px-4 min-w-[150px]">Inquiry Status</th>
                    <th className="sticky right-0 z-20 bg-slate-50/90 py-4 px-4 text-center shadow-[-4px_0_12px_-4px_rgba(15,23,42,0.06)]">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredCounseling.map((l) => (
                    <tr key={l.id} className="group hover:bg-slate-50/70 transition-colors">
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 py-4 px-4 font-bold text-slate-900 shadow-[4px_0_12px_-4px_rgba(15,23,42,0.06)]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center justify-center shrink-0">
                            {l?.name ? String(l.name).charAt(0).toUpperCase() : 'V'}
                          </div>
                          <span className="truncate">{l?.name ? String(l.name) : 'Anonymous Inquiry'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200/60">
                          {l?.designation ? String(l.designation) : 'General Counseling'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <a href={`tel:${l?.phone ?? ''}`} className="font-bold text-slate-900 hover:text-blue-600 text-xs flex items-center gap-1 tabular-nums">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {l?.phone ? String(l.phone) : 'N/A'}
                            </a>
                            {l?.phone && (
                              <a
                                href={`https://wa.me/91${String(l.phone).replace(/\D/g, '')}?text=${encodeURIComponent(
                                  `Hello ${l.name || 'there'}, Greetings from Rachakonda Solutions regarding your counseling inquiry.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare className="w-3 h-3" /> WhatsApp
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 max-w-xs">
                        <p className="line-clamp-2 leading-relaxed" title={l?.remarks ? String(l.remarks) : ''}>
                          {l?.remarks ? String(l.remarks) : 'No additional message.'}
                        </p>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-xs tabular-nums">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">
                            {formatSafeDate(l?.created_at)}
                          </span>
                          {isSafeToday(l?.created_at) && (
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-blue-700 font-medium">{formatSafeTime(l?.created_at)}</div>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={l?.status ?? 'new'}
                          onChange={(e) => handleCounselingStatus(l.id, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border transition-colors cursor-pointer focus:outline-hidden ${
                            l?.status === 'converted'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : l?.status === 'contacted'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          <option value="new">New 🔵</option>
                          <option value="contacted">Contacted 🟡</option>
                          <option value="converted">Resolved 🟢</option>
                          <option value="rejected">Archived ⚪</option>
                        </select>
                      </td>
                      <td className="sticky right-0 z-10 bg-white group-hover:bg-slate-50/80 py-4 px-4 text-center shadow-[-4px_0_12px_-4px_rgba(15,23,42,0.06)]">
                        <button
                          type="button"
                          onClick={() => setCandidateToDelete({ id: l.id, name: l?.name ? String(l.name) : 'Anonymous', phone: l?.phone ? String(l.phone) : 'N/A', rolesString: l?.designation ? String(l.designation) : 'Inquiry', refId: 'INQUIRY' })}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 shadow-2xs transition-all cursor-pointer mx-auto"
                          title="Delete inquiry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Candidate Detail Modal Slip ─────────────────────────── */}
      <AnimatePresence>
        {activeModalCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setActiveModalCandidate(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 z-10"
            >
              <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-t-3xl relative">
                <button
                  onClick={() => setActiveModalCandidate(null)}
                  className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> Official Application Slip
                </div>
                <h3 className="text-2xl font-black">{activeModalCandidate.name}</h3>
                <p className="text-xs text-blue-200 mt-1 font-mono">
                  Ref ID: {activeModalCandidate.refId} &bull; Applied on {formatSafeDate(activeModalCandidate.createdAt)}
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Mobile</span>
                    <span className="font-bold text-slate-900 tabular-nums">{activeModalCandidate.phone || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Email</span>
                    <span className="font-bold text-slate-900 truncate block">{activeModalCandidate.email || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Father's Name</span>
                    <span className="font-bold text-slate-900">{activeModalCandidate.fatherName || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Qualification</span>
                    <span className="font-bold text-slate-900">{activeModalCandidate.qualification || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Experience</span>
                    <span className="font-bold text-slate-900">{activeModalCandidate.experience || 'Fresher'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Location / Address</span>
                    <span className="font-bold text-slate-900">{activeModalCandidate.address || 'N/A'}</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/60">
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block mb-2">Applied Roles</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeModalCandidate.roles.map((r) => (
                      <span key={r} className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white text-blue-900 border border-blue-200 shadow-2xs">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModalCandidate(null)}
                    className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Accidental Deletion Protection Modal ──────────────────────── */}
      <AnimatePresence>
        {candidateToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => !isDeleting && setCandidateToDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border-2 border-red-200 z-10"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {candidateToDelete.refId === 'INQUIRY' ? 'Permanently Delete Inquiry?' : 'Permanently Delete Application?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                To prevent accidental deletion, please confirm before removing this {candidateToDelete.refId === 'INQUIRY' ? 'inquiry' : 'candidate'}:
              </p>

              <div className="p-3 my-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <p><span className="text-slate-400 font-semibold">{candidateToDelete.refId === 'INQUIRY' ? 'Visitor:' : 'Candidate:'}</span> <strong className="text-slate-900">{candidateToDelete.name}</strong></p>
                <p><span className="text-slate-400 font-semibold">Mobile:</span> <strong className="text-slate-800">{candidateToDelete.phone}</strong></p>
                {candidateToDelete.rolesString && (
                  <p><span className="text-slate-400 font-semibold">{candidateToDelete.refId === 'INQUIRY' ? 'Subject:' : 'Role(s):'}</span> <strong className="text-blue-700">{candidateToDelete.rolesString}</strong></p>
                )}
              </div>

              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-800 text-[11px] font-semibold mb-5 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>This record will be permanently removed from Supabase. This cannot be undone.</span>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setCandidateToDelete(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDeleteCandidate}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : (candidateToDelete.refId === 'INQUIRY' ? 'Yes, Delete Inquiry' : 'Yes, Delete Application')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-slate-400">Loading...</div>}>
      <LeadsContent />
    </Suspense>
  );
}