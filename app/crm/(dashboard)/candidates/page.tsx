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
import CandidatesTable from '@/components/crm/CandidatesTable';
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

  // Email status filter & batch sending states
  const [emailFilter, setEmailFilter] = useState<'all' | 'sent' | 'unsent'>('all');
  const [isSendingBatch, setIsSendingBatch] = useState<boolean>(false);
  const [emailModalCandidate, setEmailModalCandidate] = useState<CandidateItem | null>(null);
  const [emailTypeToDispatch, setEmailTypeToDispatch] = useState<'confirmation' | 'interview' | 'rejected'>('confirmation');
  const [interviewDateInput, setInterviewDateInput] = useState<string>('Within 3 Business Days (10:00 AM - 4:00 PM)');
  const [customNotesInput, setCustomNotesInput] = useState<string>('');
  const [isDispatchingSingleEmail, setIsDispatchingSingleEmail] = useState<boolean>(false);

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

      // Offer to send lifecycle email on Interview / Rejection
      const candidateObj = candidates.find((c) => c.id === candidateId);
      if (candidateObj && candidateObj.email && candidateObj.email.includes('@')) {
        if (newStatus === 'contacted') {
          const ask = window.confirm(`Candidate status changed to Interview Scheduled.\n\nWould you like to dispatch an official Interview Call Letter to ${candidateName}?`);
          if (ask) {
            setEmailModalCandidate(candidateObj);
            setEmailTypeToDispatch('interview');
          }
        } else if (newStatus === 'rejected') {
          const ask = window.confirm(`Candidate marked as Rejected.\n\nWould you like to send a polite status update/rejection email to ${candidateName} (${candidateObj.email}) right now?`);
          if (ask) {
            showToast(`Sending rejection email to ${candidateName}...`);
            fetch('/api/crm/candidates/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                candidateId: candidateObj.id,
                emailType: 'rejected',
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.success) {
                  showToast(`✉️ Rejection email delivered to ${candidateName}!`);
                  fetchCandidates();
                } else {
                  alert(`Failed to send rejection email: ${data.error}`);
                }
              })
              .catch((err) => alert(`Error sending rejection email: ${err.message}`));
          }
        }
      }
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
        (Array.isArray(item.roles) && item.roles.some((r) => String(r || '').toLowerCase().includes(roleFilter.toLowerCase()))) ||
        String(item.rolesString || '').toLowerCase().includes(roleFilter.toLowerCase());

      const q = (search || '').toLowerCase();
      const matchesSearch =
        !search ||
        String(item.name || '').toLowerCase().includes(q) ||
        String(item.phone || '').includes(q) ||
        String(item.email || '').toLowerCase().includes(q) ||
        String(item.refId || '').toLowerCase().includes(q) ||
        String(item.fatherName || '').toLowerCase().includes(q) ||
        String(item.address || '').toLowerCase().includes(q) ||
        String(item.rolesString || '').toLowerCase().includes(q);

      const matchesEmail =
        emailFilter === 'all' ||
        (emailFilter === 'sent' && item.emailStatus === 'sent') ||
        (emailFilter === 'unsent' && item.emailStatus === 'unsent');

      return matchesStatus && matchesRole && matchesSearch && matchesEmail;
    });
  }, [candidates, statusFilter, roleFilter, search, emailFilter]);

  // Counts for KPI
  const stats = useMemo(() => {
    const total = candidates.length;
    const selected = candidates.filter((c) => c.status === 'converted').length;
    const rejected = candidates.filter((c) => c.status === 'rejected').length;
    const interviewed = candidates.filter((c) => c.status === 'contacted').length;
    const newApps = candidates.filter((c) => c.status === 'new').length;
    const emailSent = candidates.filter((c) => c.emailStatus === 'sent').length;
    const emailUnsent = candidates.filter((c) => c.emailStatus === 'unsent').length;
    return { total, selected, rejected, interviewed, newApps, emailSent, emailUnsent };
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

  // Batch Email Sender (Sends in safe chunks of 20 to prevent Cloudflare Worker 50-subrequest timeout)
  const handleBatchSendConfirmation = async (targetTotal = 70) => {
    if (stats.emailUnsent === 0) {
      alert('All candidates have already received their confirmation emails! Zero pending.');
      return;
    }

    const countToSend = Math.min(targetTotal, stats.emailUnsent);
    const confirmed = window.confirm(
      `Send confirmation emails to the next ${countToSend} unsent candidates?\n\n` +
      `• Sender: careers@rachakondasolutions.com\n` +
      `• Dispatched in safe Cloudflare chunks of 20\n` +
      `• Target count: ${countToSend}\n` +
      `• Remaining after this run: ${Math.max(0, stats.emailUnsent - countToSend)}\n` +
      `• Duplicates protection: Enabled (already sent candidates are automatically skipped).`
    );

    if (!confirmed) return;

    setIsSendingBatch(true);
    let totalDispatched = 0;
    let remaining = countToSend;

    try {
      while (remaining > 0) {
        const chunkSize = Math.min(remaining, 20);
        showToast(`Sending batch... (${totalDispatched}/${countToSend} completed)`);

        const res = await fetch('/api/crm/candidates/batch-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batchSize: chunkSize }),
        });

        const data = await res.json();
        if (res.ok && data.success && data.sentInThisBatch > 0) {
          totalDispatched += data.sentInThisBatch;
          remaining -= data.sentInThisBatch;
          if (data.sentInThisBatch < chunkSize) {
            break;
          }
        } else {
          alert(`Batch stopped: ${data.error || 'Failed to dispatch batch chunk'}`);
          break;
        }

        // Brief delay between chunks
        await new Promise((r) => setTimeout(r, 600));
      }

      showToast(`🎉 Batch finished! Successfully dispatched ${totalDispatched} confirmation emails.`);
      fetchCandidates();
    } catch (e: any) {
      alert(`Batch exception: ${e.message}`);
      fetchCandidates();
    } finally {
      setIsSendingBatch(false);
    }
  };

  // Dispatch individual email from Modal
  const handleDispatchSingleEmail = async () => {
    if (!emailModalCandidate) return;
    setIsDispatchingSingleEmail(true);
    try {
      const res = await fetch('/api/crm/candidates/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: emailModalCandidate.id,
          emailType: emailTypeToDispatch,
          interviewDate: interviewDateInput || undefined,
          customNotes: customNotesInput || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✉️ Email dispatched to ${emailModalCandidate.name}!`);
        setEmailModalCandidate(null);
        fetchCandidates();
      } else {
        alert(`Email dispatch error: ${data.error || 'Failed to dispatch email'}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsDispatchingSingleEmail(false);
    }
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

      {/* ─── Email Dispatch & Quota Manager ──────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-blue-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-400/30 text-blue-300 text-xs font-bold">
              <Mail className="w-3.5 h-3.5" />
              <span>Resend Official Gateway &bull; careers@rachakondasolutions.com</span>
            </div>
            <h3 className="text-xl font-black text-white font-display">
              Candidate Confirmation &amp; Interview Email Automation
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Track candidate emails in real-time. Resend free tier permits <strong>100 emails/day</strong>. You can safely dispatch today&apos;s batch of up to 90 emails with automatic duplicate protection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleBatchSendConfirmation(70)}
              disabled={isSendingBatch || stats.emailUnsent === 0}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className={`w-4 h-4 ${isSendingBatch ? 'animate-spin' : ''}`} />
              <span>{isSendingBatch ? 'Sending Today\'s Batch...' : `Send Today's Batch (${Math.min(70, stats.emailUnsent)} Unsent)`}</span>
            </button>
          </div>
        </div>

        {/* Mini Email Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Candidates</span>
            <span className="text-xl font-black text-white">{stats.total}</span>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">✓ Confirmation Sent</span>
            <span className="text-xl font-black text-emerald-300">{stats.emailSent}</span>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">⏳ Unsent / Pending</span>
            <span className="text-xl font-black text-amber-300">{stats.emailUnsent}</span>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">Daily Free Quota</span>
            <span className="text-xl font-black text-blue-300">100 / Day</span>
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

        {/* Search, Role & Email Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          {/* Search Box */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by candidate name, phone, ref ID, role..."
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
          <div className="md:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">All Positions (11 Roles)</option>
              {JOB_ROLES.map((role) => (
                <option key={role.id} value={role.title}>
                  #{role.no} - {role.title}
                </option>
              ))}
            </select>
          </div>

          {/* Email Status Filter */}
          <div className="md:col-span-3">
            <select
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">Email: All ({stats.total})</option>
              <option value="unsent">⏳ Unsent / Pending ({stats.emailUnsent})</option>
              <option value="sent">✓ Confirmation Sent ({stats.emailSent})</option>
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
      <div className="glass-panel rounded-3xl overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-500 font-display">Loading candidate applications...</p>
          </div>
        ) : (
          <CandidatesTable
            candidates={filteredCandidates}
            selectedIds={selectedIds}
            onToggleSelect={(id) => toggleSelectOne(id)}
            onToggleSelectAll={toggleSelectAll}
            onViewCandidate={(c) => setActiveModalCandidate(c)}
            onUpdateStatus={(id, status) => {
              const c = candidates.find((item) => item.id === id);
              handleUpdateStatus(id, c?.name || 'Candidate', status);
            }}
            onDeleteRequest={(c) => setCandidateToDelete(c)}
            onSendEmailRequest={(c) => {
              setEmailModalCandidate(c);
              setEmailTypeToDispatch(c.status === 'contacted' ? 'interview' : c.status === 'rejected' ? 'rejected' : 'confirmation');
            }}
          />
        )}

        {/* Footer summary */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-semibold gap-2">
          <span>
            Showing <strong className="text-slate-900 tabular-nums">{filteredCandidates.length}</strong> of{' '}
            <strong className="text-slate-900 tabular-nums">{candidates.length}</strong> total candidate applications
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

      {/* ─── Email Dispatcher Modal ─── */}
      <AnimatePresence>
        {emailModalCandidate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => !isDispatchingSingleEmail && setEmailModalCandidate(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 z-10 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200 text-[11px] font-bold mb-2">
                    <Mail className="w-3.5 h-3.5" />
                    <span>From: careers@rachakondasolutions.com</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    Dispatch Email to Candidate
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    To: <strong>{emailModalCandidate.name}</strong> ({emailModalCandidate.email})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailModalCandidate(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Template Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Email Template:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      type: 'confirmation',
                      label: '1. Application Confirmation Receipt',
                      desc: 'Sends Ref ID, summary of roles, and hiring roadmap.',
                    },
                    {
                      type: 'interview',
                      label: '2. Official Interview Call Letter',
                      desc: 'Invites candidate to Gajwel Campus with schedule & document list.',
                    },
                    {
                      type: 'rejected',
                      label: '3. Polite Status Update / Rejection',
                      desc: 'Courteous message keeping candidate in talent pool.',
                    },
                  ].map((tmpl) => (
                    <label
                      key={tmpl.type}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        emailTypeToDispatch === tmpl.type
                          ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="emailType"
                        value={tmpl.type}
                        checked={emailTypeToDispatch === tmpl.type}
                        onChange={() => setEmailTypeToDispatch(tmpl.type as any)}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{tmpl.label}</div>
                        <div className="text-[11px] text-slate-500 leading-relaxed">{tmpl.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Extra Inputs for Interview Call Letter */}
              {emailTypeToDispatch === 'interview' && (
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">
                      Interview Date &amp; Reporting Time:
                    </label>
                    <input
                      type="text"
                      value={interviewDateInput}
                      onChange={(e) => setInterviewDateInput(e.target.value)}
                      placeholder="e.g. 18th Nov 2026 at 10:30 AM"
                      className="w-full text-xs font-semibold px-3 py-2 bg-white border border-amber-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-amber-900 block mb-1">
                      Special Instructions (Optional):
                    </label>
                    <input
                      type="text"
                      value={customNotesInput}
                      onChange={(e) => setCustomNotesInput(e.target.value)}
                      placeholder="e.g. Report to 2nd Floor HR Desk, Ask for Mr. Ramesh"
                      className="w-full text-xs font-semibold px-3 py-2 bg-white border border-amber-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDispatchingSingleEmail}
                  onClick={() => setEmailModalCandidate(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDispatchingSingleEmail}
                  onClick={handleDispatchSingleEmail}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{isDispatchingSingleEmail ? 'Dispatching...' : 'Send Official Email'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
