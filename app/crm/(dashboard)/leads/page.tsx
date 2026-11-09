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
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useCRM } from '../context';
import { CandidateItem, parseCandidateLead, exportCandidatesToCSV } from '@/lib/candidate-utils';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
        alert(`Error: ${err.error}`);
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
      showToast(`Inquiry marked as ${status}`);
    }
  };

  // Export handlers
  const handleExportCandidates = () => {
    exportCandidatesToCSV(candidates, 'Rachakonda_Candidates_95_Staff');
  };

  const handleExportStudents = () => {
    if (students.length === 0) return alert('No students to export.');
    const headers = ['S.No', 'Student Name', 'Phone', 'Email', 'Course', 'Category', 'Status', 'Date'];
    const rows = students.map((s, idx) => [
      `"${idx + 1}"`,
      `"${s.name || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.email || ''}"`,
      `"${s.course_name || ''}"`,
      `"${s.category || ''}"`,
      `"${s.status || ''}"`,
      `"${new Date(s.created_at).toLocaleDateString('en-IN')}"`,
    ]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rachakonda_Student_Enrollments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleExportCounseling = () => {
    if (counselingLeads.length === 0) return alert('No inquiries to export.');
    const headers = ['S.No', 'Visitor Name', 'Phone', 'Subject', 'Details / Message', 'Status', 'Date'];
    const rows = counselingLeads.map((l, idx) => [
      `"${idx + 1}"`,
      `"${l.name || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.designation || 'General'}"`,
      `"${(l.remarks || '').replace(/"/g, '""')}"`,
      `"${l.status || 'new'}"`,
      `"${new Date(l.created_at).toLocaleDateString('en-IN')}"`,
    ]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rachakonda_Counseling_Inquiries_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Filtered views
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.rolesString.toLowerCase().includes(q) ||
        c.refId.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [candidates, statusFilter, search]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        (s.name || '').toLowerCase().includes(q) ||
        (s.phone || '').includes(q) ||
        (s.course_name || '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [students, statusFilter, search]);

  const filteredCounseling = useMemo(() => {
    return counselingLeads.filter((l) => {
      const matchStatus = statusFilter === 'all' || l.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        (l.name || '').toLowerCase().includes(q) ||
        (l.phone || '').includes(q) ||
        (l.city || '').toLowerCase().includes(q);
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
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200">
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
              onClick={() => fetchData()}
              className="h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>

            {activeTab === 'candidates' ? (
              <button
                onClick={handleExportCandidates}
                className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" /> Export Candidates ({filteredCandidates.length})
              </button>
            ) : activeTab === 'students' ? (
              <button
                onClick={handleExportStudents}
                className="h-11 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
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
            className={`pb-3 px-4 text-sm font-black transition-all border-b-2 flex items-center gap-2 ${
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
            className={`pb-3 px-4 text-sm font-black transition-all border-b-2 flex items-center gap-2 ${
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
            className={`pb-3 px-4 text-sm font-black transition-all border-b-2 flex items-center gap-2 ${
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
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
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

      {/* ─── Content Tab 1: Candidates ───────────────────────────────── */}
      {activeTab === 'candidates' && (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-sm font-bold text-slate-500">Loading candidates...</div>
          ) : filteredCandidates.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500 font-medium">
              No candidates found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-4 px-4">Candidate &amp; Father Name</th>
                    <th className="py-4 px-4">Applied Role(s)</th>
                    <th className="py-4 px-4">Contact</th>
                    <th className="py-4 px-4">Qualification &amp; Exp</th>
                    <th className="py-4 px-4">Applied Date</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-center">Admin Selection Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredCandidates.map((c) => {
                    const isSelected = c.status === 'converted';
                    const isRejected = c.status === 'rejected';
                    const isInterview = c.status === 'contacted';

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/70">
                        <td className="py-4 px-4">
                          <p className="font-extrabold text-slate-900">{c.name}</p>
                          <p className="text-xs text-slate-500">S/o: {c.fatherName} &bull; <span className="font-mono text-blue-700">{c.refId}</span></p>
                        </td>

                        <td className="py-4 px-4 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {c.roles.map((r, i) => (
                              <span key={i} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs">{c.phone}</span>
                            <a
                              href={`https://wa.me/91${c.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${c.name}, Greetings from Rachakonda Solutions.`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            >
                              WhatsApp
                            </a>
                          </div>
                        </td>

                        <td className="py-4 px-4 min-w-[180px]">
                          <p className="text-xs font-black text-slate-900">{c.qualification}</p>
                          <div className="mt-1">
                            {c.experience.toLowerCase() === 'fresher' ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                Fresher
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300">
                                💼 {c.experience}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900">
                              {new Date(c.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            {new Date(c.createdAt).toDateString() === new Date().toDateString() && (
                              <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                                Today
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-blue-700 font-bold block">
                            {new Date(c.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                            isSelected ? 'bg-emerald-100 text-emerald-800' : isRejected ? 'bg-red-100 text-red-800' : isInterview ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {c.statusLabel}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                            <button
                              onClick={() => handleCandidateStatus(c.id, c.name, 'converted')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              Select 🟢
                            </button>
                            <button
                              onClick={() => handleCandidateStatus(c.id, c.name, 'contacted')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                isInterview ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-700 hover:bg-amber-100'
                              }`}
                            >
                              Interview 🟡
                            </button>
                            <button
                              onClick={() => handleCandidateStatus(c.id, c.name, 'rejected')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                isRejected ? 'bg-red-600 text-white shadow-xs' : 'text-red-700 hover:bg-red-100'
                              }`}
                            >
                              Reject 🔴
                            </button>
                            <button
                              type="button"
                              onClick={() => setCandidateToDelete(c)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer text-red-600 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 shadow-2xs"
                              title="Permanently Delete Candidate (Confirmation required)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Content Tab 2: Students ─────────────────────────────────── */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-sm font-bold text-slate-500">Loading student enrollments...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500 font-medium">
              No student enrollments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-4 px-4">Student Name</th>
                    <th className="py-4 px-4">Course Name &amp; Category</th>
                    <th className="py-4 px-4">Contact</th>
                    <th className="py-4 px-4">Enrollment Date</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70">
                      <td className="py-4 px-4 font-bold text-slate-900">{s.name}</td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-blue-900 text-xs">{s.course_name}</p>
                        <p className="text-[11px] text-slate-500">{s.category}</p>
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold">
                        <a href={`tel:${s.phone}`} className="hover:text-blue-600">{s.phone}</a>
                        {s.email && <p className="text-slate-400">{s.email}</p>}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600">
                        {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          s.status === 'converted' ? 'bg-emerald-100 text-emerald-800' : s.status === 'contacted' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <select
                          value={s.status}
                          onChange={(e) => handleStudentStatus(s.id, e.target.value)}
                          className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1"
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

      {/* ─── Content Tab 3: Counseling Requests ──────────────────────── */}
      {activeTab === 'counseling' && (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-sm font-bold text-slate-500">Loading counseling requests...</div>
          ) : filteredCounseling.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500 font-medium">
              No counseling requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-4 px-4">Visitor Name</th>
                    <th className="py-4 px-4">Inquiry Subject</th>
                    <th className="py-4 px-4">Contact Info</th>
                    <th className="py-4 px-4">Message / Details</th>
                    <th className="py-4 px-4">Received Date</th>
                    <th className="py-4 px-4">Inquiry Status</th>
                    <th className="py-4 px-4 text-center">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredCounseling.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center justify-center shrink-0">
                            {l.name ? l.name.charAt(0).toUpperCase() : 'V'}
                          </div>
                          <span>{l.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200/60">
                          {l.designation || 'General Counseling'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <a href={`tel:${l.phone}`} className="font-bold text-slate-900 hover:text-blue-600 text-xs flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {l.phone}
                            </a>
                            <a
                              href={`https://wa.me/91${(l.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Hello ${l.name}, Greetings from Rachakonda Solutions regarding your counseling inquiry.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" /> WhatsApp
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 max-w-xs">
                        <p className="line-clamp-2 leading-relaxed" title={l.remarks}>
                          {l.remarks || 'No additional message.'}
                        </p>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">
                            {new Date(l.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          {new Date(l.created_at).toDateString() === new Date().toDateString() && (
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Today
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={l.status || 'new'}
                          onChange={(e) => handleCounselingStatus(l.id, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                            l.status === 'converted'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : l.status === 'contacted'
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
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setCandidateToDelete({ id: l.id, name: l.name, phone: l.phone, rolesString: l.designation || 'Inquiry', refId: 'INQUIRY' })}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 shadow-2xs transition-all cursor-pointer flex items-center gap-1 mx-auto"
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
      {/* Accidental Deletion Protection Modal */}
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
                Permanently Delete Application?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                To prevent accidental deletion, please confirm before removing this candidate:
              </p>

              <div className="p-3 my-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <p><span className="text-slate-400 font-semibold">Candidate:</span> <strong className="text-slate-900">{candidateToDelete.name}</strong></p>
                <p><span className="text-slate-400 font-semibold">Mobile:</span> <strong className="text-slate-800">{candidateToDelete.phone}</strong></p>
              </div>

              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-800 text-[11px] font-semibold mb-5 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>This application will be permanently removed from Supabase. This cannot be undone.</span>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setCandidateToDelete(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDeleteCandidate}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Application'}
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
