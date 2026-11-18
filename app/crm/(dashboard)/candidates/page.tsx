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
import {
  CandidateItem,
  parseCandidateLead,
  exportCandidatesToCSV,
  checkCandidateSelectionEligibility,
  recordInterviewScheduledTag,
  recordEmailLogTag,
  extractCleanHumanNotes,
  mergeHumanNotesWithTags,
  recordSelectionDecisionTag,
} from '@/lib/candidate-utils';
import {
  CandidateInterviewState,
  serializeInterviewEvaluations,
} from '@/lib/interview-types';
import CandidatesTable from '@/components/crm/CandidatesTable';
import InterviewScorecardModal from '@/components/crm/InterviewScorecardModal';
import FinalCandidateDecisionModal from '@/components/crm/FinalCandidateDecisionModal';
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
  const [activeScorecardCandidate, setActiveScorecardCandidate] = useState<CandidateItem | null>(null);
  const [activeDecisionCandidate, setActiveDecisionCandidate] = useState<CandidateItem | null>(null);
  const [roundFilter, setRoundFilter] = useState<'all' | 'r1' | 'r2' | 'r3' | 'cleared' | 'shortlisted_pool' | 'interview_rejected'>('all');
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

  // ─── Two-Step Candidate Selection Verification Protocol ─────────
  const [candidateForSelection, setCandidateForSelection] = useState<CandidateItem | null>(null);
  const [selectionStep, setSelectionStep] = useState<1 | 2>(1);
  const [coolingWarning, setCoolingWarning] = useState<string | null>(null);
  const [selectionAgreed, setSelectionAgreed] = useState<boolean>(false);
  const [isConfirmingSelection, setIsConfirmingSelection] = useState<boolean>(false);

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
  // converted -> Selected / Hired (requires 2-step verification & interview pre-requisite)
  // rejected -> Rejected
  // contacted -> Interview Scheduled
  // new -> New / Reset
  const handleUpdateStatus = async (
    candidateId: string,
    candidateName: string,
    newStatus: 'converted' | 'rejected' | 'contacted' | 'new'
  ) => {
    try {
      const candidateObj = candidates.find((c) => c.id === candidateId);
      if (!candidateObj) return;

      // ─── STAGE-GATE ENFORCEMENT & 2-STEP SELECTION PROTOCOL ─────────────
      if (newStatus === 'converted') {
        const eligibility = checkCandidateSelectionEligibility(candidateObj);
        if (eligibility.statusBlocked) {
          alert(`⛔ HR Protocol Blocked:\n\n${eligibility.reason}`);
          return;
        }

        // Open the Two-Step Verification Dialog
        setCandidateForSelection(candidateObj);
        setSelectionStep(1);
        setSelectionAgreed(false);
        setCoolingWarning(eligibility.coolingPeriodActive ? eligibility.reason : null);
        return;
      }

      // If moving to Interview Scheduled, stamp audit timestamp in internal_notes
      let updatedNotes = candidateObj.internalNotes;
      if (newStatus === 'contacted') {
        updatedNotes = recordInterviewScheduledTag(updatedNotes);
      }

      const { error } = await supabase
        .from('leads')
        .update({
          status: newStatus,
          internal_notes: updatedNotes,
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
            if (newStatus === 'rejected') statusLabel = 'Rejected';
            else if (newStatus === 'contacted') statusLabel = 'Interview Scheduled';
            return {
              ...c,
              status: newStatus,
              statusLabel,
              internalNotes: updatedNotes,
              interviewScheduledAt:
                newStatus === 'contacted' ? new Date().toISOString() : c.interviewScheduledAt,
            };
          }
          return c;
        })
      );

      if (activeModalCandidate && activeModalCandidate.id === candidateId) {
        setActiveModalCandidate((prev) =>
          prev ? { ...prev, status: newStatus, internalNotes: updatedNotes } : null
        );
      }

      let label = 'Status updated';
      if (newStatus === 'rejected') label = `${candidateName} marked as REJECTED`;
      else if (newStatus === 'contacted') label = `📅 Interview Scheduled for ${candidateName}`;
      else if (newStatus === 'new') label = `${candidateName} reset to New Application`;

      showToast(label);

      // Offer to send lifecycle email on Interview / Rejection
      if (candidateObj && candidateObj.email && candidateObj.email.includes('@')) {
        if (newStatus === 'contacted') {
          const ask = window.confirm(
            `Candidate status changed to Interview Scheduled.\n\nWould you like to dispatch an official Interview Call Letter to ${candidateName} (${candidateObj.email}) right now?`
          );
          if (ask) {
            showToast(`Sending Interview Call Letter to ${candidateName}...`);
            fetch('/api/crm/candidates/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                candidateId: candidateObj.id,
                emailType: 'interview',
                interviewDate: 'Within 3 Business Days (10:00 AM - 4:00 PM)',
                customNotes: 'Report to Gajwel Campus 2nd Floor HR Desk',
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.success) {
                  showToast(`✉️ Interview Call Letter delivered to ${candidateName}!`);
                  fetchCandidates();
                } else {
                  alert(`Failed to send interview email: ${data.error}`);
                }
              })
              .catch((err) => alert(`Error sending interview email: ${err.message}`));
          }
        } else if (newStatus === 'rejected') {
          const ask = window.confirm(
            `Candidate marked as Rejected.\n\nWould you like to send a polite status update/rejection email to ${candidateName} (${candidateObj.email}) right now?`
          );
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

  // ─── Two-Step Final Selection Finalizer ───────────────────────────────────
  const handleFinalizeSelection = async () => {
    if (!candidateForSelection || !selectionAgreed) return;
    setIsConfirmingSelection(true);
    try {
      const candidateId = candidateForSelection.id;
      const candidateName = candidateForSelection.name;
      const nowIso = new Date().toISOString();
      const tag = `[STATUS: converted | ${nowIso}]`;
      const updatedNotes = candidateForSelection.internalNotes
        ? `${tag}\n${candidateForSelection.internalNotes}`
        : tag;

      const { error } = await supabase
        .from('leads')
        .update({
          status: 'converted',
          internal_notes: updatedNotes,
          updated_at: nowIso,
        })
        .eq('id', candidateId);

      if (error) {
        alert(`Failed to confirm selection: ${error.message}`);
        return;
      }

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? { ...c, status: 'converted', statusLabel: 'Selected / Hired', internalNotes: updatedNotes }
            : c
        )
      );

      if (activeModalCandidate && activeModalCandidate.id === candidateId) {
        setActiveModalCandidate((prev) =>
          prev ? { ...prev, status: 'converted', statusLabel: 'Selected / Hired', internalNotes: updatedNotes } : null
        );
      }

      showToast(`🎉 ${candidateName} officially verified and marked as SELECTED / HIRED!`);
      setCandidateForSelection(null);
      setSelectionStep(1);
      setSelectionAgreed(false);
      setCoolingWarning(null);
    } catch (e: any) {
      alert(`Selection confirmation error: ${e.message}`);
    } finally {
      setIsConfirmingSelection(false);
    }
  };

  // Save Interview Notes (preserving system tags in background)
  const handleSaveNotes = async (candidateId: string) => {
    setSavingNote(true);
    try {
      const candidateObj = candidates.find((c) => c.id === candidateId);
      const mergedNotes = mergeHumanNotesWithTags(candidateObj?.internalNotes, noteText);

      const { error } = await supabase
        .from('leads')
        .update({
          internal_notes: mergedNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', candidateId);

      if (!error) {
        const cleanNotes = extractCleanHumanNotes(mergedNotes);
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidateId ? { ...c, internalNotes: mergedNotes, cleanNotes } : c
          )
        );
        if (activeModalCandidate?.id === candidateId) {
          setActiveModalCandidate((prev) =>
            prev ? { ...prev, internalNotes: mergedNotes, cleanNotes } : null
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

  // Handle Final Candidate Decision: Shortlisted on Hold / Selected Offer Letter / Rejected
  const handleConfirmSelectionDecision = async ({
    candidateId,
    decision,
    notes,
    offerDetails,
  }: {
    candidateId: string;
    decision: 'shortlisted_hold' | 'offer_approved' | 'rejected';
    notes?: string;
    offerDetails?: {
      designation: string;
      salary: string;
      joiningDate: string;
      reportingLocation: string;
      reportingAuthority: string;
      customSubject: string;
      customMessage: string;
      sendEmail: boolean;
    };
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const candidateObj = candidates.find((c) => c.id === candidateId);
      if (!candidateObj) return { success: false, error: 'Candidate record not found' };

      const nowIso = new Date().toISOString();
      let updatedNotes = recordSelectionDecisionTag(candidateObj.internalNotes, decision, notes);
      let newLeadStatus = candidateObj.status;

      if (decision === 'offer_approved') {
        newLeadStatus = 'converted';
        updatedNotes = `[STATUS: converted | ${nowIso}]\n${updatedNotes}`;

        // Dispatch Offer Letter Email if requested
        if (
          offerDetails &&
          offerDetails.sendEmail &&
          candidateObj.email &&
          candidateObj.email.includes('@')
        ) {
          showToast(`Dispatching Official Offer Letter to ${candidateObj.name}...`);
          try {
            const emailRes = await fetch('/api/crm/candidates/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                candidateId: candidateObj.id,
                emailType: 'offer_letter',
                designation: offerDetails.designation,
                salary: offerDetails.salary,
                joiningDate: offerDetails.joiningDate,
                reportingLocation: offerDetails.reportingLocation,
                reportingAuthority: offerDetails.reportingAuthority,
                customSubject: offerDetails.customSubject,
                customMessage: offerDetails.customMessage,
              }),
            });
            const emailData = await emailRes.json();
            if (!emailData.success) {
              console.warn('Offer letter dispatch warning:', emailData.error);
            } else {
              updatedNotes = recordEmailLogTag(updatedNotes, 'offer_letter');
            }
          } catch (e: any) {
            console.warn('Offer email exception:', e.message);
          }
        }
      } else if (decision === 'shortlisted_hold') {
        newLeadStatus = candidateObj.status === 'new' ? 'contacted' : candidateObj.status;
      } else if (decision === 'rejected') {
        newLeadStatus = 'rejected';
        updatedNotes = `[STATUS: rejected | ${nowIso}]\n${updatedNotes}`;
      }

      // Update Supabase leads
      const { error: dbErr } = await supabase
        .from('leads')
        .update({
          status: newLeadStatus,
          internal_notes: updatedNotes,
          updated_at: nowIso,
        })
        .eq('id', candidateId);

      if (dbErr) return { success: false, error: dbErr.message };

      // Write to audit_logs
      try {
        await supabase.from('audit_logs').insert({
          action: `candidate_${decision}`,
          entity_type: 'candidate',
          entity_id: candidateId,
          details: {
            candidateName: candidateObj.name,
            refId: candidateObj.refId,
            decision,
            notes,
            offerDetails,
            recordedBy: profile?.email || 'CRM Admin',
          },
        });
      } catch (logErr) {
        console.warn('Audit log write skipped:', logErr);
      }

      // Update local state reactively
      const cleanNotes = extractCleanHumanNotes(updatedNotes);
      let statusLabel = candidateObj.statusLabel;
      if (newLeadStatus === 'converted') statusLabel = 'Selected / Hired';
      else if (newLeadStatus === 'rejected') statusLabel = 'Rejected';
      else if (decision === 'shortlisted_hold') statusLabel = 'Shortlisted (On Hold Pool)';

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? {
                ...c,
                status: newLeadStatus,
                statusLabel,
                internalNotes: updatedNotes,
                cleanNotes,
                selectionVerdict: decision,
                selectionNotes: notes,
                lastEmailType: decision === 'offer_approved' ? 'offer_letter' : c.lastEmailType,
              }
            : c
        )
      );

      if (activeModalCandidate?.id === candidateId) {
        setActiveModalCandidate((prev) =>
          prev
            ? {
                ...prev,
                status: newLeadStatus,
                statusLabel,
                internalNotes: updatedNotes,
                cleanNotes,
                selectionVerdict: decision,
                selectionNotes: notes,
                lastEmailType: decision === 'offer_approved' ? 'offer_letter' : prev.lastEmailType,
              }
            : null
        );
      }

      let toastMsg = 'Status recorded';
      if (decision === 'offer_approved') {
        toastMsg = `🎉 ${candidateObj.name} officially SELECTED! Offer Letter processed.`;
      } else if (decision === 'shortlisted_hold') {
        toastMsg = `🟡 ${candidateObj.name} saved in Shortlisted (On Hold) Pool.`;
      } else if (decision === 'rejected') {
        toastMsg = `Candidate ${candidateObj.name} marked as Rejected.`;
      }

      showToast(toastMsg);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error recording decision' };
    }
  };

  // Save Structured 3-Round Interview Evaluation
  const handleSaveEvaluation = async (
    candidateId: string,
    updatedState: CandidateInterviewState
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const candidateObj = candidates.find((c) => c.id === candidateId);
      if (!candidateObj) return { success: false, error: 'Candidate record not found.' };

      const updatedNotes = serializeInterviewEvaluations(candidateObj.internalNotes, updatedState);
      const nowIso = new Date().toISOString();

      let newLeadStatus = candidateObj.status;
      if (updatedState.isHaltRejected) {
        newLeadStatus = 'rejected';
      } else if (
        candidateObj.status === 'new' &&
        (updatedState.round1.completed || updatedState.round2.completed || updatedState.round3.completed)
      ) {
        newLeadStatus = 'contacted';
      }

      // Update Supabase lead record
      const { error: leadErr } = await supabase
        .from('leads')
        .update({
          internal_notes: updatedNotes,
          status: newLeadStatus,
          updated_at: nowIso,
        })
        .eq('id', candidateId);

      if (leadErr) {
        return { success: false, error: leadErr.message };
      }

      // Write audit log entry
      try {
        await supabase.from('audit_logs').insert({
          action: 'interview_round_evaluated',
          entity_type: 'candidate',
          entity_id: candidateId,
          details: {
            candidateName: candidateObj.name,
            refId: candidateObj.refId,
            currentRound: updatedState.currentRound,
            totalScore: updatedState.totalScore,
            compositeVerdict: updatedState.compositeVerdict,
            round1: updatedState.round1,
            round2: updatedState.round2,
            round3: updatedState.round3,
            evaluatedBy: profile?.email || 'CRM User',
          },
        });
      } catch (logErr) {
        console.warn('Audit log write skipped:', logErr);
      }

      // Update local state reactively
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id === candidateId) {
            let statusLabel = c.statusLabel;
            if (newLeadStatus === 'rejected') statusLabel = 'Rejected';
            else if (newLeadStatus === 'contacted') statusLabel = 'Interview Scheduled';

            return {
              ...c,
              internalNotes: updatedNotes,
              status: newLeadStatus,
              statusLabel,
              interviewEvals: updatedState,
            };
          }
          return c;
        })
      );

      if (activeModalCandidate?.id === candidateId) {
        setActiveModalCandidate((prev) =>
          prev
            ? {
                ...prev,
                internalNotes: updatedNotes,
                status: newLeadStatus,
                interviewEvals: updatedState,
              }
            : null
        );
      }

      showToast(`Evaluation saved for ${candidateObj.name} (${updatedState.totalScore}/30 pts)!`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to save evaluation.' };
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

  // Bulk Status Update (Bulk selection is strictly disabled per HR governance protocol)
  const handleBulkUpdate = async (status: 'rejected' | 'contacted') => {
    if (selectedIds.length === 0) return;
    const confirmMsg = `Are you sure you want to mark ${selectedIds.length} candidate(s) as ${
      status === 'rejected' ? 'REJECTED' : 'INTERVIEW SCHEDULED'
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

      const matchesRound =
        roundFilter === 'all' ||
        (roundFilter === 'r1' && (!item.interviewEvals?.round1.completed || item.interviewEvals.round1.status === 'pending')) ||
        (roundFilter === 'r2' && item.interviewEvals?.round1.completed && item.interviewEvals.round1.status === 'passed' && (!item.interviewEvals?.round2.completed || item.interviewEvals.round2.status === 'pending')) ||
        (roundFilter === 'r3' && item.interviewEvals?.round2.completed && item.interviewEvals.round2.status === 'passed' && (!item.interviewEvals?.round3.completed || item.interviewEvals.round3.status === 'pending')) ||
        (roundFilter === 'cleared' && item.interviewEvals?.allRoundsCleared) ||
        (roundFilter === 'shortlisted_pool' && item.selectionVerdict === 'shortlisted_hold') ||
        (roundFilter === 'interview_rejected' && item.interviewEvals?.isHaltRejected);

      return matchesStatus && matchesRole && matchesSearch && matchesEmail && matchesRound;
    });
  }, [candidates, statusFilter, roleFilter, search, emailFilter, roundFilter]);

  // Counts for KPI
  const stats = useMemo(() => {
    const total = candidates.length;
    const selected = candidates.filter((c) => c.status === 'converted').length;
    const rejected = candidates.filter((c) => c.status === 'rejected').length;
    const interviewed = candidates.filter((c) => c.status === 'contacted').length;
    const newApps = candidates.filter((c) => c.status === 'new').length;
    const emailSent = candidates.filter((c) => c.emailStatus === 'sent').length;
    const emailUnsent = candidates.filter((c) => c.emailStatus === 'unsent').length;
    const r1Pending = candidates.filter((c) => !c.interviewEvals?.round1.completed).length;
    const r2Active = candidates.filter((c) => c.interviewEvals?.round1.completed && c.interviewEvals.round1.status === 'passed' && !c.interviewEvals?.round2.completed).length;
    const r3Active = candidates.filter((c) => c.interviewEvals?.round2.completed && c.interviewEvals.round2.status === 'passed' && !c.interviewEvals?.round3.completed).length;
    const allCleared = candidates.filter((c) => c.interviewEvals?.allRoundsCleared).length;
    const shortlistedPool = candidates.filter((c) => c.selectionVerdict === 'shortlisted_hold').length;
    return { total, selected, rejected, interviewed, newApps, emailSent, emailUnsent, r1Pending, r2Active, r3Active, allCleared, shortlistedPool };
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
              <span>Multi-Provider Gateway &bull; Resend (Primary) + Brevo (Fallback)</span>
            </div>
            <h3 className="text-xl font-black text-white font-display">
              Candidate Confirmation &amp; Interview Email Automation
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              {stats.emailUnsent === 0
                ? 'All existing candidates have received their official confirmation letters. New applicants receive instant confirmations automatically upon registration via real-time triggers.'
                : `Track candidate emails in real-time. Resend provides 100/day and Brevo provides 300/day (combined 400/day). You can safely dispatch the remaining ${stats.emailUnsent} unsent candidate(s) below.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {stats.emailUnsent === 0 ? (
              <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-300">
                    All Candidates Confirmed (100%)
                  </div>
                  <div className="text-[11px] text-emerald-200/80 font-medium">
                    0 Unsent Remaining &bull; Real-time Trigger Active
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleBatchSendConfirmation(70)}
                disabled={isSendingBatch}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className={`w-4 h-4 ${isSendingBatch ? 'animate-spin' : ''}`} />
                <span>{isSendingBatch ? 'Sending Today\'s Batch...' : `Send Today's Batch (${Math.min(70, stats.emailUnsent)} Unsent)`}</span>
              </button>
            )}
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
          <div className={`${stats.emailUnsent === 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'} rounded-xl p-3 border`}>
            <span className={`text-[11px] font-bold ${stats.emailUnsent === 0 ? 'text-emerald-400' : 'text-amber-400'} uppercase tracking-wider block`}>
              {stats.emailUnsent === 0 ? '✓ Delivery Status' : '⏳ Unsent / Pending'}
            </span>
            <span className={`text-xl font-black ${stats.emailUnsent === 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
              {stats.emailUnsent === 0 ? '100% Cleared' : stats.emailUnsent}
            </span>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">Combined Daily Quota</span>
            <span className="text-xl font-black text-blue-300">400 / Day</span>
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

        {/* 3-Round Interview Lifecycle Sub-Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-500" /> Interview Stage:
          </span>
          {[
            { id: 'all', label: 'All Stages' },
            { id: 'r1', label: '1. General Round Pending', count: stats.r1Pending },
            { id: 'r2', label: '2. In HR Round', count: stats.r2Active },
            { id: 'r3', label: '3. In Manager Round', count: stats.r3Active },
            { id: 'cleared', label: '✓ All 3 Rounds Cleared', count: stats.allCleared },
            { id: 'shortlisted_pool', label: '🟡 Shortlisted (On Hold Pool)', count: stats.shortlistedPool },
            { id: 'interview_rejected', label: '❌ Rejected in Interview' },
          ].map((rTab) => (
            <button
              key={rTab.id}
              type="button"
              onClick={() => setRoundFilter(rTab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                roundFilter === rTab.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{rTab.label}</span>
              {rTab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                    roundFilter === rTab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {rTab.count}
                </span>
              )}
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
                onClick={() => handleBulkUpdate('contacted')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" /> Schedule Interviews 🟡
              </button>
              <button
                onClick={() => handleBulkUpdate('rejected')}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" /> Mark as Rejected 🔴
              </button>
              <button
                onClick={handleExportFiltered}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" /> Export Selected CSV
              </button>
              <button
                onClick={() => setIsBulkDeleting(true)}
                className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
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
            onEvaluateInterview={(c) => setActiveScorecardCandidate(c)}
            onOpenDecisionModal={(c) => setActiveDecisionCandidate(c)}
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
                  {/* Stage-Gate Action Buttons */}
                  {activeModalCandidate.status === 'new' && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          activeModalCandidate.id,
                          activeModalCandidate.name,
                          'contacted'
                        )
                      }
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer"
                      title="Shortlist and schedule for interview"
                    >
                      <Clock className="w-3.5 h-3.5" /> Schedule Interview 🟡
                    </button>
                  )}

                  {activeModalCandidate.status === 'contacted' && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          activeModalCandidate.id,
                          activeModalCandidate.name,
                          'converted'
                        )
                      }
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer"
                      title="Proceed to Two-Step Selection Protocol"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Selected 🟢
                    </button>
                  )}

                  {activeModalCandidate.status === 'converted' && (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Candidate Hired
                    </span>
                  )}

                  {activeModalCandidate.status !== 'rejected' && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          activeModalCandidate.id,
                          activeModalCandidate.name,
                          'rejected'
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Mark Rejected 🔴
                    </button>
                  )}

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

                {/* ─── 3-Round Interview Assessment Visual Scorecard ───────────── */}
                <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl border border-blue-100 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      Official 3-Round Interview Assessment
                    </span>

                    <div className="flex items-center gap-2">
                      <div className="flex items-baseline gap-1 bg-white px-2.5 py-1 rounded-xl border border-blue-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-400">Total:</span>
                        <span className="text-sm font-black text-blue-600">
                          {activeModalCandidate.interviewEvals?.totalScore || 0}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">/ 30 pts</span>
                        <span className="ml-1 text-[10px] font-extrabold text-emerald-700">
                          ({activeModalCandidate.interviewEvals?.compositeVerdict || 'In Progress'})
                        </span>
                      </div>

                      {activeModalCandidate.interviewEvals?.allRoundsCleared && (
                        <button
                          type="button"
                          onClick={() => {
                            const cand = activeModalCandidate;
                            setActiveModalCandidate(null);
                            setActiveDecisionCandidate(cand);
                          }}
                          className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black shadow-2xs flex items-center gap-1"
                        >
                          <span>Hiring / Offer Clearance</span>
                          <span>→</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3 Round Mini Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Round 1 */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-blue-600 uppercase">1. General Round</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                            activeModalCandidate.interviewEvals?.round1.completed
                              ? activeModalCandidate.interviewEvals.round1.status === 'passed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {activeModalCandidate.interviewEvals?.round1.score !== null
                            ? `${activeModalCandidate.interviewEvals?.round1.score}/10`
                            : 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 italic line-clamp-2">
                        {activeModalCandidate.interviewEvals?.round1.comments
                          ? `"${activeModalCandidate.interviewEvals.round1.comments}"`
                          : 'No evaluation remarks entered yet.'}
                      </p>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                        <span>By: {activeModalCandidate.interviewEvals?.round1.interviewerName || '—'}</span>
                        <span>{activeModalCandidate.interviewEvals?.round1.mode || 'In-Person'}</span>
                      </div>
                    </div>

                    {/* Round 2 */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-amber-600 uppercase">2. HR Round</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                            activeModalCandidate.interviewEvals?.round2.completed
                              ? activeModalCandidate.interviewEvals.round2.status === 'passed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {activeModalCandidate.interviewEvals?.round2.score !== null
                            ? `${activeModalCandidate.interviewEvals?.round2.score}/10`
                            : 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 italic line-clamp-2">
                        {activeModalCandidate.interviewEvals?.round2.comments
                          ? `"${activeModalCandidate.interviewEvals.round2.comments}"`
                          : 'No evaluation remarks entered yet.'}
                      </p>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                        <span>By: {activeModalCandidate.interviewEvals?.round2.interviewerName || '—'}</span>
                        <span>{activeModalCandidate.interviewEvals?.round2.mode || 'In-Person'}</span>
                      </div>
                    </div>

                    {/* Round 3 */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-purple-600 uppercase">3. Manager Round</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                            activeModalCandidate.interviewEvals?.round3.completed
                              ? activeModalCandidate.interviewEvals.round3.status === 'passed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {activeModalCandidate.interviewEvals?.round3.score !== null
                            ? `${activeModalCandidate.interviewEvals?.round3.score}/10`
                            : 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 italic line-clamp-2">
                        {activeModalCandidate.interviewEvals?.round3.comments
                          ? `"${activeModalCandidate.interviewEvals.round3.comments}"`
                          : 'No evaluation remarks entered yet.'}
                      </p>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                        <span>By: {activeModalCandidate.interviewEvals?.round3.interviewerName || '—'}</span>
                        <span>{activeModalCandidate.interviewEvals?.round3.mode || 'In-Person'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clean Staff Notes & Remarks (RAW JSON tags completely removed!) */}
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      Additional Staff Remarks &amp; Internal Notes
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Clean notes only &bull; System tags preserved in background
                    </span>
                  </div>

                  <textarea
                    rows={2}
                    defaultValue={activeModalCandidate.cleanNotes}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Enter additional staff observations, salary negotiation notes, joining preferences..."
                    className="w-full p-3 rounded-xl border border-amber-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                  />

                  {/* Lifecycle History Pills */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {activeModalCandidate.selectionVerdict === 'shortlisted_hold' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          🟡 Shortlisted in Reserve Pool (On Hold)
                        </span>
                      )}
                      {activeModalCandidate.lastEmailType && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ✉️ Last Email: {activeModalCandidate.lastEmailType.toUpperCase()}
                        </span>
                      )}
                      {activeModalCandidate.interviewScheduledAt && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          📅 Scheduled: {new Date(activeModalCandidate.interviewScheduledAt).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={savingNote}
                      onClick={() => handleSaveNotes(activeModalCandidate.id)}
                      className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                    >
                      {savingNote ? 'Saving...' : 'Save Remarks'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const cand = activeModalCandidate;
                      setActiveModalCandidate(null);
                      setActiveScorecardCandidate(cand);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5 shadow-xs"
                  >
                    <Award className="w-3.5 h-3.5" /> 3-Round Scorecard
                  </button>

                  {activeModalCandidate.interviewEvals?.allRoundsCleared && (
                    <button
                      type="button"
                      onClick={() => {
                        const cand = activeModalCandidate;
                        setActiveModalCandidate(null);
                        setActiveDecisionCandidate(cand);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Final Decision / Offer Letter
                    </button>
                  )}

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

      {/* ─── Two-Step Candidate Selection Verification Protocol Modal ─── */}
      <AnimatePresence>
        {candidateForSelection && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs"
              onClick={() => !isConfirmingSelection && setCandidateForSelection(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 z-10 overflow-hidden"
            >
              {/* Step indicator header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                    {selectionStep}/2
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      {selectionStep === 1
                        ? 'Step 1 of 2: Candidate & Interview Review'
                        : 'Step 2 of 2: Final Selection Authorization'}
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400">
                      Enterprise Recruitment Protocol Verification
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => !isConfirmingSelection && setCandidateForSelection(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step 1 Content */}
              {selectionStep === 1 && (
                <div className="py-4 space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Candidate
                        </div>
                        <div className="text-base font-black text-slate-900">
                          {candidateForSelection.name}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        {candidateForSelection.refId}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <span className="font-bold text-slate-800">Applied Role:</span>{' '}
                      {candidateForSelection.rolesString}
                    </div>
                    <div className="text-xs text-slate-600">
                      <span className="font-bold text-slate-800">Contact:</span>{' '}
                      {candidateForSelection.phone} | {candidateForSelection.email}
                    </div>
                  </div>

                  {coolingWarning ? (
                    <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-black text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>24-Hour Evaluation Window Advisory</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        {coolingWarning}
                      </p>
                      <p className="text-[10px] text-amber-700 font-medium">
                        * If this candidate had already completed their offline in-person interview prior to this CRM entry, you may proceed to Step 2 to sign off.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Interview stage and evaluation cooling period satisfied.</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCandidateForSelection(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectionStep(2)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Proceed to Step 2</span>
                      <span>➔</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 Content */}
              {selectionStep === 2 && (
                <div className="py-4 space-y-4">
                  <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-emerald-950 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Official Selection & Hire Authorization</span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      You are about to officially mark <strong>{candidateForSelection.name}</strong> as <strong>SELECTED / HIRED</strong> for <strong>{candidateForSelection.rolesString}</strong>.
                    </p>
                    <p className="text-[11px] text-emerald-800">
                      This will commit the status to Supabase as an approved hire and record your audit confirmation.
                    </p>
                  </div>

                  {/* Mandatory Checkbox */}
                  <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectionAgreed}
                      onChange={(e) => setSelectionAgreed(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-slate-800 leading-snug">
                      I confirm that {candidateForSelection.name} has completed the required interview, document verification has been reviewed, and this hiring decision is approved.
                    </span>
                  </label>

                  <div className="flex items-center justify-between gap-2 pt-2">
                    <button
                      type="button"
                      disabled={isConfirmingSelection}
                      onClick={() => setSelectionStep(1)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      ← Back to Step 1
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isConfirmingSelection}
                        onClick={() => setCandidateForSelection(null)}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!selectionAgreed || isConfirmingSelection}
                        onClick={handleFinalizeSelection}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isConfirmingSelection ? 'Confirming...' : 'Confirm & Mark Selected 🟢'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Enterprise 3-Round Interview Evaluation Modal ─── */}
      <InterviewScorecardModal
        isOpen={Boolean(activeScorecardCandidate)}
        onClose={() => setActiveScorecardCandidate(null)}
        candidate={activeScorecardCandidate}
        currentUser={{
          name: profile?.name || 'CRM Evaluator',
          role: profile?.role || 'Interviewer',
        }}
        onSaveEvaluation={handleSaveEvaluation}
        onOpenDecisionModal={(c) => {
          setActiveScorecardCandidate(null);
          setActiveDecisionCandidate(c);
        }}
      />

      {/* ─── Enterprise Final Selection & Offer Letter Clearance Modal ─── */}
      <FinalCandidateDecisionModal
        isOpen={Boolean(activeDecisionCandidate)}
        onClose={() => setActiveDecisionCandidate(null)}
        candidate={activeDecisionCandidate}
        currentUser={{
          name: profile?.name || 'CRM Admin',
          role: profile?.role || 'Admin',
          email: profile?.email,
        }}
        onConfirmSelectionDecision={handleConfirmSelectionDecision}
      />
    </div>
  );
}
