'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  Clock,
  Send,
  Award,
  Briefcase,
  Calendar,
  Building,
  User,
  Phone,
  Mail,
  ShieldCheck,
  AlertTriangle,
  FileText,
  DollarSign,
  Sparkles,
  BookmarkPlus
} from 'lucide-react';
import type { CandidateItem } from '@/lib/candidate-utils';

interface FinalCandidateDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateItem | null;
  currentUser?: { name?: string; role?: string; email?: string };
  onConfirmSelectionDecision: (params: {
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
  }) => Promise<{ success: boolean; error?: string }>;
}

export default function FinalCandidateDecisionModal({
  isOpen,
  onClose,
  candidate,
  currentUser,
  onConfirmSelectionDecision,
}: FinalCandidateDecisionModalProps) {
  const [decision, setDecision] = useState<'shortlisted_hold' | 'offer_approved' | 'rejected'>(
    'offer_approved'
  );

  // Shortlisted Pool state
  const [holdNotes, setHoldNotes] = useState(
    'Candidate cleared all 3 interview rounds. Kept in the shortlisted reserve pool pending final hiring quota allocation for this position.'
  );

  // Offer Letter Form states (fully editable)
  const [designation, setDesignation] = useState('');
  const [salary, setSalary] = useState('₹25,000 / Month');
  const [joiningDate, setJoiningDate] = useState('');
  const [reportingLocation, setReportingLocation] = useState(
    'Rachakonda Solutions Gajwel Campus, 2nd Floor HR Department'
  );
  const [reportingAuthority, setReportingAuthority] = useState('Managing Director / HR Head');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState(
    'We are pleased to welcome you to the Rachakonda Solutions family! Your compensation package, reporting schedule, and onboarding checklist are detailed below. Please reply to this email to confirm your acceptance.'
  );
  const [sendEmail, setSendEmail] = useState(true);

  // Rejection state
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [sendRejectionEmail, setSendRejectionEmail] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Initialize form when candidate is opened
  useEffect(() => {
    if (candidate) {
      const defaultRole = candidate.roles[0] || candidate.rolesString || 'Staff Position';
      setDesignation(defaultRole);

      // Default joining date: 7 days from today
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setJoiningDate(d.toISOString().split('T')[0]);

      setCustomSubject(
        `🎉 Official Offer of Employment: ${defaultRole} - Rachakonda Solutions [Ref: ${candidate.refId}]`
      );

      // If already in shortlisted pool, default to that selection
      if (candidate.selectionVerdict === 'shortlisted_hold') {
        setDecision('shortlisted_hold');
        if (candidate.selectionNotes) setHoldNotes(candidate.selectionNotes);
      } else {
        setDecision('offer_approved');
      }

      setActionError(null);
    }
  }, [candidate]);

  if (!isOpen || !candidate) return null;

  const evals = candidate.interviewEvals;
  const totalScore = evals?.totalScore || 0;
  const percentScore = Math.round((totalScore / 30) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    if (decision === 'offer_approved') {
      if (!designation.trim()) {
        setActionError('Please specify the offered job designation.');
        return;
      }
      if (!salary.trim()) {
        setActionError('Please specify the offered salary / compensation.');
        return;
      }
      if (!joiningDate) {
        setActionError('Please specify the date of joining.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await onConfirmSelectionDecision({
        candidateId: candidate.id,
        decision,
        notes: decision === 'shortlisted_hold' ? holdNotes : decision === 'rejected' ? rejectionNotes : undefined,
        offerDetails:
          decision === 'offer_approved'
            ? {
                designation: designation.trim(),
                salary: salary.trim(),
                joiningDate,
                reportingLocation: reportingLocation.trim(),
                reportingAuthority: reportingAuthority.trim(),
                customSubject: customSubject.trim(),
                customMessage: customMessage.trim(),
                sendEmail,
              }
            : undefined,
      });

      if (res.success) {
        onClose();
      } else {
        setActionError(res.error || 'Failed to record decision.');
      }
    } catch (err: any) {
      setActionError(err?.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Final Hiring Decision &amp; Offer Protocol</h2>
              <p className="text-xs text-slate-400">Post-Interview Selection, Reserve Pool or Offer Letter Dispatch</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto grow">
          {/* Candidate Dossier & Performance Snapshot */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {candidate.refId}
                  </span>
                  <h3 className="text-base font-black text-slate-900">{candidate.name}</h3>
                </div>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                  <span>{candidate.phone}</span>
                  <span>&bull;</span>
                  <span>{candidate.email}</span>
                </div>
              </div>

              {/* Assessment Score Badge */}
              <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Score</span>
                  <div className="text-sm font-black text-blue-600">
                    {totalScore} <span className="text-xs font-semibold text-slate-400">/ 30 ({percentScore}%)</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {evals?.compositeVerdict || 'Cleared'}
                </span>
              </div>
            </div>

            {/* 3-Round Summary Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-blue-700">
                  <span>Round 1 (General)</span>
                  <span>{evals?.round1.score !== null ? `${evals?.round1.score}/10` : '—'} ✓</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 truncate italic">
                  &ldquo;{evals?.round1.comments || 'No comments'}&rdquo;
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-700">
                  <span>Round 2 (HR)</span>
                  <span>{evals?.round2.score !== null ? `${evals?.round2.score}/10` : '—'} ✓</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 truncate italic">
                  &ldquo;{evals?.round2.comments || 'No comments'}&rdquo;
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-purple-700">
                  <span>Round 3 (Manager)</span>
                  <span>{evals?.round3.score !== null ? `${evals?.round3.score}/10` : '—'} ✓</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 truncate italic">
                  &ldquo;{evals?.round3.comments || 'No comments'}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Decision Selector: 3 Pathways */}
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
              Select Management Verdict for this Candidate:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1: Shortlisted on Hold */}
              <button
                type="button"
                onClick={() => setDecision('shortlisted_hold')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  decision === 'shortlisted_hold'
                    ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/30 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-amber-700 font-extrabold text-xs">
                  <BookmarkPlus className="w-4 h-4 shrink-0" />
                  <span>Shortlist (On Hold Pool)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Keep candidate in reserved pool until final candidates for this position are compared.
                </p>
              </button>

              {/* Option 2: Finalize Selection & Offer */}
              <button
                type="button"
                onClick={() => setDecision('offer_approved')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  decision === 'offer_approved'
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-emerald-800 font-black text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Select &amp; Send Offer</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Final candidate selected for hire. Customize terms and dispatch official Offer Letter email.
                </p>
              </button>

              {/* Option 3: Reject */}
              <button
                type="button"
                onClick={() => setDecision('rejected')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  decision === 'rejected'
                    ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-500/30 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-rose-700 font-extrabold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Reject Candidate</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Do not select. Optionally send a polite status update / rejection email.
                </p>
              </button>
            </div>
          </div>

          {/* Conditional View 1: Shortlisted on Hold */}
          {decision === 'shortlisted_hold' && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                  Candidate Reserved in Shortlisted Pool
                </h4>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                The candidate will be marked as <strong>Shortlisted (On Hold Pool)</strong>. No offer email will be
                sent yet. When you are ready to finalize who receives the position, you can reopen this modal and
                dispatch the offer letter.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  HR / Manager Deliberation Notes
                </label>
                <textarea
                  rows={2}
                  value={holdNotes}
                  onChange={(e) => setHoldNotes(e.target.value)}
                  placeholder="Record why candidate is kept on reserve (e.g. Waiting for 2 more interviews for Admin Manager role)..."
                  className="w-full p-3 rounded-xl border border-amber-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>
          )}

          {/* Conditional View 2: Offer Letter Composer (Fully Editable) */}
          {decision === 'offer_approved' && (
            <div className="p-4 sm:p-5 bg-emerald-50/40 border border-emerald-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                    Customizable Employment Offer Letter
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Editable Before Send
                </span>
              </div>

              {/* Offer Parameters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Offered Job Designation <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Admin Manager"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-slate-300 font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Offered Monthly Compensation (CTC) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g. ₹25,000 / Month + Incentives"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-slate-300 font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date of Joining <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-slate-300 font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reporting Authority / Manager
                  </label>
                  <input
                    type="text"
                    value={reportingAuthority}
                    onChange={(e) => setReportingAuthority(e.target.value)}
                    placeholder="e.g. Managing Director / HR Head"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-slate-300 font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reporting Office Location
                  </label>
                  <input
                    type="text"
                    value={reportingLocation}
                    onChange={(e) => setReportingLocation(e.target.value)}
                    placeholder="e.g. Rachakonda Solutions Gajwel Campus, 2nd Floor HR Department"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-slate-300 font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Editable Email Subject & Message */}
              <div className="space-y-3 pt-2 border-t border-emerald-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Subject (Editable)
                  </label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-slate-300 font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Custom Welcome Paragraph / Additional Terms (Editable)
                  </label>
                  <textarea
                    rows={3}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add custom welcome remarks, shift timings, probation terms, or special joining notes..."
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Dispatch Email Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="text-xs font-bold text-slate-900 block">
                        ✉️ Send Official Offer Letter Email to{' '}
                        <strong className="text-blue-700">{candidate.email}</strong>
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                        From: hr@rachakondasolutions.com
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Dispatched from official <strong className="text-slate-700">Rachakonda HR &lt;hr@rachakondasolutions.com&gt;</strong> with branded letterhead, offer terms breakdown, and onboarding checklist.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Conditional View 3: Rejection */}
          {decision === 'rejected' && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
              <div>
                <label className="block text-xs font-bold text-rose-950 mb-1">
                  Reason for Rejection / Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  placeholder="Record why candidate was rejected (e.g. Better candidate selected for this position, compensation constraint)..."
                  className="w-full p-3 rounded-xl border border-rose-200 bg-white text-xs font-medium text-slate-800"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-white border border-rose-200">
                <input
                  type="checkbox"
                  checked={sendRejectionEmail}
                  onChange={(e) => setSendRejectionEmail(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-rose-950">
                  ✉️ Send polite application status update email to candidate
                </span>
              </label>
            </div>
          )}

          {/* Error Banner */}
          {actionError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              {actionError}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2.5 rounded-xl text-xs font-black shadow-md flex items-center gap-2 text-white transition-all disabled:opacity-50 ${
                decision === 'offer_approved'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : decision === 'shortlisted_hold'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {submitting ? (
                <span>Processing...</span>
              ) : decision === 'offer_approved' ? (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendEmail ? 'Confirm Selection & Send Offer Letter ✉️' : 'Confirm Selection (No Email)'}</span>
                </>
              ) : decision === 'shortlisted_hold' ? (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Save to Shortlisted (On Hold Pool) 🟡</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Confirm Rejection 🔴</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
