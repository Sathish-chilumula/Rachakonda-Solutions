'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  FileDown,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  MoreVertical,
  Check,
  ChevronDown,
  RefreshCw,
  Eye,
  Award,
  FileText,
  Printer,
  X,
  Share2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { JOB_ROLES } from '@/lib/data/careers';
import { CandidateItem, parseCandidateLead, exportCandidatesToCSV } from '@/lib/candidate-utils';
import Link from 'next/link';
import { useCRM } from '../context';

export default function CandidatesAdminPage() {
  const { profile } = useCRM();
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'converted' | 'rejected'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeModalCandidate, setActiveModalCandidate] = useState<CandidateItem | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [savingNote, setSavingNote] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [candidateToDelete, setCandidateToDelete] = useState<CandidateItem | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('source', 'careers_portal')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching candidate leads:', error);
      } else if (data) {
        const parsed = data.map(parseCandidateLead);
        setCandidates(parsed);
      }
    } catch (e) {
      console.error('Fetch candidates exception:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCandidates();
  };

  // Status updates:
  // converted -> Selected / Hired
  // rejected -> Rejected
  // contacted -> Interview Scheduled
  // new -> New / Reset
  const handleUpdateStatus = async (
    candidateId: string,
    candidateName: string,
    newStatus: 'converted' | 'rejected' | 'contacted' | 'new'
  ) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', candidateId);

      if (error) {
        alert(`Failed to update status: ${error.message}`);
        return;
      }

      // Update state locally
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id === candidateId) {
            let statusLabel = 'New Application';
            if (newStatus === 'converted') statusLabel = 'Selected / Hired';
            else if (newStatus === 'rejected') statusLabel = 'Rejected';
            else if (newStatus === 'contacted') statusLabel = 'Interview Scheduled';
            return { ...c, status: newStatus, statusLabel };
          }
          return c;
        })
      );

      if (activeModalCandidate && activeModalCandidate.id === candidateId) {
        setActiveModalCandidate((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }

      let label = 'Status updated';
      if (newStatus === 'converted') label = `🎉 ${candidateName} marked as SELECTED / HIRED!`;
      else if (newStatus === 'rejected') label = `${candidateName} marked as REJECTED`;
      else if (newStatus === 'contacted') label = `📅 Interview Scheduled for ${candidateName}`;
      else if (newStatus === 'new') label = `${candidateName} reset to New Application`;

      showToast(label);
    } catch (err: any) {
      alert(`Error updating candidate: ${err?.message}`);
    }
  };

  // Save Interview Notes
  const handleSaveNotes = async (candidateId: string) => {
    setSavingNote(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          internal_notes: noteText,
          updated_at: new Date().toISOString(),
        })
        .eq('id', candidateId);

      if (!error) {
        setCandidates((prev) =>
          prev.map((c) => (c.id === candidateId ? { ...c, internalNotes: noteText } : c))
        );
        if (activeModalCandidate?.id === candidateId) {
          setActiveModalCandidate((prev) =>
            prev ? { ...prev, internalNotes: noteText } : null
          );
        }
        setEditingNotesId(null);
        showToast('Interview notes saved successfully.');
      } else {
        alert(`Failed to save notes: ${error.message}`);
      }
    } finally {
      setSavingNote(false);
    }
  };

  // Safe Delete Handlers with confirmation
  const handleConfirmDeleteSingle = async () => {
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
        if (activeModalCandidate?.id === candidateToDelete.id) {
          setActiveModalCandidate(null);
        }
        showToast(`Candidate "${candidateToDelete.name}" permanently deleted.`);
        setCandidateToDelete(null);
      } else {
        const err = await res.json();
        alert(`Failed to delete candidate: ${err.error}`);
      }
    } catch (e: any) {
      alert(`Error deleting candidate: ${e.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteBulk = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/careers/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (res.ok) {
        setCandidates((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
        showToast(`Successfully deleted ${selectedIds.length} candidate applications.`);
        setSelectedIds([]);
        setIsBulkDeleting(false);
      } else {
        const err = await res.json();
        alert(`Failed to delete candidates: ${err.error}`);
      }
    } catch (e: any) {
      alert(`Error deleting candidates: ${e.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk Status Update
  const handleBulkUpdate = async (status: 'converted' | 'rejected' | 'contacted') => {
    if (selectedIds.length === 0) return;
    const confirmMsg = `Are you sure you want to mark ${selectedIds.length} candidate(s) as ${
      status === 'converted' ? 'SELECTED' : status === 'rejected' ? 'REJECTED' : 'INTERVIEW SCHEDULED'
    }?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', selectedIds);

      if (!error) {
        showToast(`Updated ${selectedIds.length} candidates!`);
        setSelectedIds([]);
        fetchCandidates();
      } else {
        alert(`Bulk update failed: ${error.message}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesRole =
        roleFilter === 'all' ||
        item.roles.some((r) => r.toLowerCase().includes(roleFilter.toLowerCase())) ||
        item.rolesString.toLowerCase().includes(roleFilter.toLowerCase());

      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(q) ||
        item.phone.includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.refId.toLowerCase().includes(q) ||
        item.fatherName.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.rolesString.toLowerCase().includes(q);

      return matchesStatus && matchesRole && matchesSearch;
    });
  }, [candidates, statusFilter, roleFilter, search]);

  // Counts for KPI
  const stats = useMemo(() => {
    const total = candidates.length;
    const selected = candidates.filter((c) => c.status === 'converted').length;
    const rejected = candidates.filter((c) => c.status === 'rejected').length;
    const interviewed = candidates.filter((c) => c.status === 'contacted').length;
    const newApps = candidates.filter((c) => c.status === 'new').length;
    return { total, selected, rejected, interviewed, newApps };
  }, [candidates]);

  const handleExportAll = () => {
    exportCandidatesToCSV(candidates, 'Rachakonda_All_Candidates_95_Staff');
  };

  const handleExportFiltered = () => {
    const dataToExport = selectedIds.length > 0
      ? candidates.filter((c) => selectedIds.includes(c.id))
      : filteredCandidates;
    exportCandidatesToCSV(
      dataToExport,
      selectedIds.length > 0 ? 'Rachakonda_Selected_Candidates' : 'Rachakonda_Filtered_Candidates'
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCandidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCandidates.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {actionSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 font-semibold text-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Top Header & Primary Actions ─────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-200/60 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-black text-amber-800 uppercase tracking-widest">
                Walk-in Drive &bull; Total 95 Staff Openings
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Candidate Recruitment Manager
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Review walk-in applicants, schedule interviews, mark candidates as <strong className="text-emerald-700">Selected</strong> or <strong className="text-red-700">Rejected</strong>, and export complete lists for Excel.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Refresh list"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <Link
              href="/careers"
              target="_blank"
              className="h-11 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Careers Form
            </Link>

            <button
              onClick={handleExportFiltered}
              className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              Export to CSV / Excel {selectedIds.length > 0 ? `(${selectedIds.length})` : `(${filteredCandidates.length})`}
            </button>
          </div>
        </div>

        {/* ─── KPI Stats Bar ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Applicants</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total}</span>
              <span className="text-xs font-bold text-slate-400">candidates</span>
            </div>
          </div>

          <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-100">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Selected / Hired
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700">{stats.selected}</span>
              <span className="text-xs font-bold text-emerald-600">/ 95 Posts</span>
            </div>
          </div>

          <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-100">
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Interview Scheduled
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-700">{stats.interviewed}</span>
              <span className="text-xs font-bold text-amber-600">in process</span>
            </div>
          </div>

          <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-100">
            <p className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              New Pending
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-blue-700">{stats.newApps}</span>
              <span className="text-xs font-bold text-blue-600">to review</span>
            </div>
          </div>

          <div className="bg-red-50/70 rounded-2xl p-4 border border-red-100 col-span-2 sm:col-span-1">
            <p className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              Rejected
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-red-700">{stats.rejected}</span>
              <span className="text-xs font-bold text-red-600">archived</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Search, Filters & Bulk Actions ─────────────────────────────── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/80 space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Candidates', count: stats.total, badge: 'bg-slate-100 text-slate-800' },
            { id: 'new', label: 'New Applications', count: stats.newApps, badge: 'bg-blue-100 text-blue-800' },
            { id: 'contacted', label: 'Interview Scheduled', count: stats.interviewed, badge: 'bg-amber-100 text-amber-800' },
            { id: 'converted', label: 'Selected / Hired', count: stats.selected, badge: 'bg-emerald-100 text-emerald-800' },
            { id: 'rejected', label: 'Rejected', count: stats.rejected, badge: 'bg-red-100 text-red-800' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : tab.badge
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Role Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          {/* Search Box */}
          <div className="md:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by candidate name, phone, father's name, ref ID, address, or role..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="md:col-span-5">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">Filter by Applied Position (All 11 Roles)</option>
              {JOB_ROLES.map((role) => (
                <option key={role.id} value={role.title}>
                  #{role.no} - {role.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Action Bar (when candidates are checked) */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-blue-900 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-xs">
                {selectedIds.length} Selected
              </span>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Deselect All
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleBulkUpdate('converted')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark All as Selected 🟢
              </button>
              <button
                onClick={() => handleBulkUpdate('contacted')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Clock className="w-3.5 h-3.5" /> Schedule Interviews 🟡
              </button>
              <button
                onClick={() => handleBulkUpdate('rejected')}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <XCircle className="w-3.5 h-3.5" /> Mark as Rejected 🔴
              </button>
              <button
                onClick={handleExportFiltered}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <FileDown className="w-3.5 h-3.5" /> Export Selected CSV
              </button>
              <button
                onClick={() => setIsBulkDeleting(true)}
                className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedIds.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Candidates Table / List ─────────────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-500">Loading candidate applications...</p>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="py-20 text-center px-4">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No candidate applications found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {search || statusFilter !== 'all' || roleFilter !== 'all'
                ? 'Try adjusting your search criteria or clear the filters to see all applications.'
                : 'No candidates have submitted applications yet. When visitors fill the walk-in drive form on /careers, they will appear here instantly!'}
            </p>
            {(search || statusFilter !== 'all' || roleFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setRoleFilter('all');
                }}
                className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-4 px-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredCandidates.length > 0 &&
                        selectedIds.length === filteredCandidates.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-4">Candidate &amp; Father Name</th>
                  <th className="py-4 px-4">Applied Position(s)</th>
                  <th className="py-4 px-4">Contact Info</th>
                  <th className="py-4 px-4">Qual &amp; Experience</th>
                  <th className="py-4 px-4">Address</th>
                  <th className="py-4 px-4">Applied Date &amp; Time</th>
                  <th className="py-4 px-4">Recruitment Status</th>
                  <th className="py-4 px-4 text-center">Admin Selection Actions</th>
                  <th className="py-4 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredCandidates.map((candidate) => {
                  const isSelected = selectedIds.includes(candidate.id);
                  const isSelectedHired = candidate.status === 'converted';
                  const isRejected = candidate.status === 'rejected';
                  const isInterview = candidate.status === 'contacted';

                  return (
                    <tr
                      key={candidate.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : isSelectedHired ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(candidate.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                        />
                      </td>

                      {/* Candidate Name & Father */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 hover:text-blue-600 cursor-pointer" onClick={() => setActiveModalCandidate(candidate)}>
                              {candidate.name}
                            </span>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {candidate.gender}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 mt-0.5 font-medium">
                            S/o: <strong className="text-slate-700">{candidate.fatherName}</strong>
                          </span>
                          <span className="text-[10px] font-mono font-bold text-blue-700 mt-1">
                            {candidate.refId}
                          </span>
                        </div>
                      </td>

                      {/* Applied Positions (Multi-select badges) */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1.5">
                          {candidate.roles.map((r, i) => (
                            <span
                              key={i}
                              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200/60 leading-tight"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Contact Info (Phone + WhatsApp + Mail) */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${candidate.phone}`}
                              className="font-bold text-slate-900 hover:text-blue-600 text-xs flex items-center gap-1"
                            >
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {candidate.phone}
                            </a>
                            <a
                              href={`https://wa.me/91${candidate.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Hello ${candidate.name}, Greetings from Rachakonda Solutions Pvt Ltd regarding your job application (${candidate.refId}) for ${candidate.rolesString}.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" /> WhatsApp
                            </a>
                          </div>
                          {candidate.email && candidate.email !== 'N/A' && (
                            <a
                              href={`mailto:${candidate.email}`}
                              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 truncate max-w-[180px]"
                            >
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              {candidate.email}
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Qualification & Experience */}
                      <td className="py-4 px-4 min-w-[200px]">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900">
                            {candidate.qualification}
                          </span>
                          <div className="mt-1">
                            {candidate.experience.toLowerCase() === 'fresher' ? (
                              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                Fresher
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center text-[11px] font-bold px-2 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 leading-tight"
                                title={candidate.experience}
                              >
                                💼 {candidate.experience}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="py-4 px-4 max-w-[160px]">
                        <p className="text-xs text-slate-600 truncate font-medium" title={candidate.address}>
                          {candidate.address}
                        </p>
                      </td>

                      {/* Applied Date & Time */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900">
                              {new Date(candidate.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            {new Date(candidate.createdAt).toDateString() === new Date().toDateString() && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Today
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-blue-700 font-bold mt-0.5">
                            {new Date(candidate.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Current Status Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isSelectedHired && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Selected / Hired 🟢
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            Rejected 🔴
                          </span>
                        )}
                        {isInterview && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Interview Scheduled 🟡
                          </span>
                        )}
                        {!isSelectedHired && !isRejected && !isInterview && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-200">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            New Application 🔵
                          </span>
                        )}
                      </td>

                      {/* ─── Admin Selection Actions (The core requirement) ─── */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                          {/* Mark Selected Button */}
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(candidate.id, candidate.name, 'converted')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                              isSelectedHired
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-emerald-700 hover:bg-emerald-100'
                            }`}
                            title="Mark candidate as Selected / Hired"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Select</span>
                          </button>

                          {/* Schedule Interview */}
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(candidate.id, candidate.name, 'contacted')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                              isInterview
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-amber-700 hover:bg-amber-100'
                            }`}
                            title="Schedule for interview"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Interview</span>
                          </button>

                          {/* Mark Rejected Button */}
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(candidate.id, candidate.name, 'rejected')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                              isRejected
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'text-red-700 hover:bg-red-100'
                            }`}
                            title="Mark candidate as Rejected"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>

                          {/* Permanently Delete Button (With Confirmation Safeguard) */}
                          <button
                            type="button"
                            onClick={() => setCandidateToDelete(candidate)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer text-red-600 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 shadow-2xs"
                            title="Permanently Delete Candidate (Confirmation required)"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500 group-hover:text-white" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>

                      {/* Details & Delete View */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setActiveModalCandidate(candidate)}
                            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Full Application Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setCandidateToDelete(candidate)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Permanently Delete Application"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Footer summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-semibold gap-2">
          <span>
            Showing <strong className="text-slate-900">{filteredCandidates.length}</strong> of{' '}
            <strong className="text-slate-900">{candidates.length}</strong> total candidate applications
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> {stats.selected} Selected
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> {stats.interviewed} In Interview
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> {stats.rejected} Rejected
            </span>
          </div>
        </div>
      </div>

      {/* ─── Candidate Detail Modal (All 10 Handwritten Fields) ─────────── */}
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
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-t-3xl relative">
                <button
                  onClick={() => setActiveModalCandidate(null)}
                  className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> Official Application Slip
                </div>
                <h3 className="text-2xl font-black">{activeModalCandidate.name}</h3>
                <p className="text-xs text-blue-200 mt-1 font-mono">
                  Ref ID: {activeModalCandidate.refId} &bull; Applied on{' '}
                  {new Date(activeModalCandidate.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>

              {/* Status Banner */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Current Status:</span>
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full ${
                      activeModalCandidate.status === 'converted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : activeModalCandidate.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : activeModalCandidate.status === 'contacted'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {activeModalCandidate.statusLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleUpdateStatus(
                        activeModalCandidate.id,
                        activeModalCandidate.name,
                        'converted'
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Selected 🟢
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateStatus(
                        activeModalCandidate.id,
                        activeModalCandidate.name,
                        'rejected'
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center gap-1 shadow-xs"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Mark Rejected 🔴
                  </button>

                  <button
                    onClick={() => setCandidateToDelete(activeModalCandidate)}
                    className="px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Application 🗑️
                  </button>
                </div>
              </div>

              {/* 10 Fields Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      1. Full Name
                    </span>
                    <span className="text-sm font-black text-slate-900">{activeModalCandidate.name}</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      2. Father&apos;s Name
                    </span>
                    <span className="text-sm font-black text-slate-900">{activeModalCandidate.fatherName}</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 sm:col-span-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      3. Residential Address
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{activeModalCandidate.address}</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      4. Marital Status
                    </span>
                    <span className="text-sm font-black text-slate-900">{activeModalCandidate.maritalStatus}</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      5. Gender
                    </span>
                    <span className="text-sm font-black text-slate-900">{activeModalCandidate.gender}</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      6. Qualification
                    </span>
                    <span className="text-sm font-black text-slate-900">{activeModalCandidate.qualification}</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      7. Mobile Number
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900">{activeModalCandidate.phone}</span>
                      <a
                        href={`https://wa.me/91${activeModalCandidate.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md hover:bg-emerald-100"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      8. Email Address
                    </span>
                    <span className="text-sm font-bold text-slate-900">{activeModalCandidate.email}</span>
                  </div>

                  <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                        9. Prior Work Experience &amp; Details
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        activeModalCandidate.experience.toLowerCase() === 'fresher'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {activeModalCandidate.experience.toLowerCase() === 'fresher' ? 'Fresher' : 'Has Experience'}
                      </span>
                    </div>
                    <p className="text-sm font-black text-slate-900 mt-1 leading-relaxed">
                      {activeModalCandidate.experience}
                    </p>
                  </div>

                  <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 sm:col-span-2">
                    <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-1">
                      10. Applied Position(s)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeModalCandidate.roles.map((r, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Admin Interview Notes Section */}
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      Internal Interview Notes &amp; Remarks
                    </span>
                  </div>

                  <textarea
                    rows={3}
                    defaultValue={activeModalCandidate.internalNotes}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Enter interview date, salary offered, test score, or selection feedback..."
                    className="w-full p-3 rounded-xl border border-amber-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={savingNote}
                      onClick={() => handleSaveNotes(activeModalCandidate.id)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                    >
                      {savingNote ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Slip
                  </button>
                  <button
                    type="button"
                    onClick={() => setCandidateToDelete(activeModalCandidate)}
                    className="px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Application
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalCandidate(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* ─── Accidental Deletion Protection Modal (Single) ─── */}
      <AnimatePresence>
        {candidateToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4 shadow-xs">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Permanently Delete Application?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                To prevent accidental deletion, please review candidate information before confirming:
              </p>

              <div className="p-3.5 my-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <p><span className="text-slate-400 font-semibold">Candidate:</span> <strong className="text-slate-900 font-black">{candidateToDelete.name}</strong></p>
                <p><span className="text-slate-400 font-semibold">Ref ID:</span> <strong className="text-blue-700 font-mono font-bold">{candidateToDelete.refId}</strong></p>
                <p><span className="text-slate-400 font-semibold">Mobile:</span> <strong className="text-slate-800 font-bold">{candidateToDelete.phone}</strong></p>
                <p><span className="text-slate-400 font-semibold">Roles:</span> <strong className="text-slate-800">{candidateToDelete.rolesString}</strong></p>
              </div>

              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-800 text-[11px] font-semibold mb-5 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>This application will be permanently removed from the Supabase database and Excel exports. This cannot be undone.</span>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setCandidateToDelete(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel (Keep)
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDeleteSingle}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Permanently Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Accidental Deletion Protection Modal (Bulk) ─── */}
      <AnimatePresence>
        {isBulkDeleting && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => !isDeleting && setIsBulkDeleting(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border-2 border-red-200 z-10"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4 shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Delete {selectedIds.length} Candidate Applications?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                You have selected <strong className="text-slate-900">{selectedIds.length}</strong> applications for permanent deletion.
              </p>

              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-800 text-[11px] font-semibold my-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>All {selectedIds.length} records will be permanently erased from Supabase.</span>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setIsBulkDeleting(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDeleteBulk}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : `Yes, Delete All ${selectedIds.length}`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
