'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, Eye, Trash2, CheckCircle2, Clock, XCircle, Sparkles, Award } from 'lucide-react';
import type { CandidateItem } from '@/lib/candidate-utils';

interface CandidatesTableProps {
  candidates: CandidateItem[] | null | undefined;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onViewCandidate: (candidate: CandidateItem) => void;
  onUpdateStatus: (id: string, status: CandidateItem['status']) => void;
  onDeleteRequest: (candidate: CandidateItem) => void;
  onSendEmailRequest?: (candidate: CandidateItem) => void;
  onEvaluateInterview?: (candidate: CandidateItem) => void;
  onOpenDecisionModal?: (candidate: CandidateItem) => void;
}

const statusStyles: Record<CandidateItem['status'], { pill: string; icon: typeof Clock }> = {
  new: { pill: 'bg-blue-50 text-blue-700 border-blue-200', icon: Sparkles },
  contacted: { pill: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  converted: { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  rejected: { pill: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
};

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

export default function CandidatesTable({
  candidates,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onViewCandidate,
  onUpdateStatus,
  onDeleteRequest,
  onSendEmailRequest,
  onEvaluateInterview,
  onOpenDecisionModal,
}: CandidatesTableProps) {
  const safeList = Array.isArray(candidates) ? candidates : [];
  const allSelected = safeList.length > 0 && safeList.every((c) => selectedIds.includes(c.id));

  if (safeList.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-10 text-center text-slate-500 font-medium">
        No candidate applications match your current filters.
      </div>
    );
  }

  return (
    <>
      {/* ─── Mobile Card View (< md) ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3.5 md:hidden">
        {safeList.map((c, idx) => {
          const style = statusStyles[c.status] ?? statusStyles.new;
          const StatusIcon = style.icon;
          const roles = Array.isArray(c.roles) ? c.roles : [];
          const isSelected = selectedIds.includes(c.id);

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.2) }}
              className={`glass-panel rounded-2xl p-4 space-y-3 transition-colors ${
                isSelected ? 'border-blue-400 bg-blue-50/30' : ''
              }`}
            >
              {/* Header with checkbox, name, ref & status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(c.id)}
                    className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    aria-label={`Select ${c.name}`}
                  />
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-mono text-slate-400 font-bold">{c.refId || 'NO-REF'}</span>
                      {c.emailStatus === 'sent' ? (
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          ✓ Email Sent
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500 border border-slate-300">
                          ⏳ Unsent
                        </span>
                      )}
                      {isSafeToday(c.createdAt) && (
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Today
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-slate-900 text-base leading-snug">{c.name || 'Unnamed Candidate'}</h3>
                    {c.fatherName && c.fatherName !== 'N/A' && (
                      <p className="text-xs text-slate-500">S/o: {c.fatherName}</p>
                    )}
                    <p className="text-xs text-slate-600 mt-0.5">
                      <span className="font-semibold text-slate-700">{c.qualification || 'N/A'}</span> &bull;{' '}
                      <span className="text-slate-500">{c.experience || 'Fresher'}</span>
                    </p>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${style.pill}`}>
                  <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>{c.statusLabel || 'New'}</span>
                </span>
              </div>

              {/* Applied Roles */}
              <div className="flex flex-wrap gap-1.5">
                {roles.length > 0 ? (
                  roles.map((r) => (
                    <span key={r} className="px-2 py-0.5 text-[11px] font-bold rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60">
                      {r}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No position specified</span>
                )}
              </div>

              {/* Status Selector for Mobile */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-bold text-slate-400">Status:</span>
                <select
                  value={c.status || 'new'}
                  onChange={(e) => onUpdateStatus(c.id, e.target.value as CandidateItem['status'])}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border cursor-pointer focus:outline-hidden w-full ${style.pill}`}
                >
                  <option value="new">New Application 🔵</option>
                  <option value="contacted">Interview Scheduled 🟡</option>
                  <option value="converted" disabled={c.status === 'new'}>
                    Selected / Hired 🟢 {c.status === 'new' ? '(Interview Required First)' : ''}
                  </option>
                  <option value="rejected">Rejected 🔴</option>
                </select>
              </div>

              {/* 3-Round Interview Lifecycle Preview for Mobile */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400">3-Round Interview Pipeline</span>
                  <span className="text-[11px] font-black text-blue-700 tabular-nums">
                    {c.interviewEvals?.totalScore || 0} / 30 pts
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${
                      c.interviewEvals?.round1.completed
                        ? c.interviewEvals.round1.status === 'passed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    R1: {c.interviewEvals?.round1.score !== null ? `${c.interviewEvals.round1.score}/10` : '—'}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${
                      c.interviewEvals?.round2.completed
                        ? c.interviewEvals.round2.status === 'passed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}
                  >
                    R2: {c.interviewEvals?.round2.score !== null ? `${c.interviewEvals.round2.score}/10` : '🔒'}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${
                      c.interviewEvals?.round3.completed
                        ? c.interviewEvals.round3.status === 'passed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}
                  >
                    R3: {c.interviewEvals?.round3.score !== null ? `${c.interviewEvals.round3.score}/10` : '🔒'}
                  </span>

                  {onEvaluateInterview && (
                    <button
                      type="button"
                      onClick={() => onEvaluateInterview(c)}
                      className="ml-auto px-2 py-0.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-2xs"
                    >
                      {c.interviewEvals?.round1.completed ? 'Scorecard' : 'Evaluate'}
                    </button>
                  )}
                </div>
              </div>

              {/* Footer with phone & action buttons */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs">
                  {c.phone ? (
                    <a
                      href={`tel:${c.phone}`}
                      className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 tabular-nums"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{c.phone}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400">No phone</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {onSendEmailRequest && (
                    <button
                      type="button"
                      onClick={() => onSendEmailRequest(c)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-all shadow-2xs"
                      title="Send Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onViewCandidate(c)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Slip</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRequest(c)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 text-xs font-bold transition-all shadow-2xs"
                    aria-label="Delete candidate"
                    title="Delete Application"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Desktop Table View (>= md) ──────────────────────────────── */}
      <div className="hidden md:block glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="sticky left-0 z-20 bg-slate-50/95 backdrop-blur-xs px-4 py-3.5 w-64 shadow-[4px_0_12px_-4px_rgba(15,23,42,0.08)]">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={onToggleSelectAll}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Candidate</span>
                  </label>
                </th>
                <th className="px-4 py-3.5 min-w-[170px]">Contact Info</th>
                <th className="px-4 py-3.5 min-w-[210px]">Applied Positions</th>
                <th className="px-4 py-3.5 min-w-[160px]">Qualification &amp; Exp</th>
                <th className="px-4 py-3.5 min-w-[210px]">Interview Pipeline (3 Rounds)</th>
                <th className="px-4 py-3.5 min-w-[170px]">Recruitment Status</th>
                <th className="px-4 py-3.5 min-w-[140px]">Applied Date</th>
                <th className="sticky right-0 z-20 bg-slate-50/95 backdrop-blur-xs px-4 py-3.5 text-center shadow-[-4px_0_12px_-4px_rgba(15,23,42,0.08)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {safeList.map((c) => {
                const isSelected = selectedIds.includes(c.id);
                const style = statusStyles[c.status] ?? statusStyles.new;
                const roles = Array.isArray(c.roles) ? c.roles : [];

                return (
                  <tr
                    key={c.id}
                    className={`group transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/80'}`}
                  >
                    {/* Sticky Left: Candidate Name & Ref ID */}
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 px-4 py-3.5 shadow-[4px_0_12px_-4px_rgba(15,23,42,0.06)]">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(c.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{c.name || 'Unnamed Candidate'}</div>
                          {c.fatherName && c.fatherName !== 'N/A' && (
                            <div className="text-[11px] text-slate-400 truncate">S/o: {c.fatherName}</div>
                          )}
                          <div className="text-[11px] font-mono text-blue-700 font-bold truncate">{c.refId || '—'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-1 text-xs">
                        {c.phone ? (
                          <div className="flex items-center gap-2">
                            <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-slate-800 hover:text-blue-600 font-bold tabular-nums">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{c.phone}</span>
                            </a>
                            <a
                              href={`https://wa.me/91${String(c.phone).replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Hello ${c.name || 'there'}, Greetings from Rachakonda Solutions regarding your job application.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              title="Chat on WhatsApp"
                            >
                              WhatsApp
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-400">No phone</span>
                        )}
                        {c.email && c.email !== 'N/A' && (
                          <div className="flex items-center gap-1.5 text-slate-500 truncate max-w-[190px]">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{c.email}</span>
                          </div>
                        )}
                        <div className="pt-0.5">
                          {c.emailStatus === 'sent' ? (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                              title={c.emailSentAt ? `Sent at: ${formatSafeDate(c.emailSentAt)}` : 'Email Sent'}
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{c.lastEmailType === 'interview' ? 'Interview Sent' : c.lastEmailType === 'rejected' ? 'Rejection Sent' : 'Email Sent'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Unsent</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Applied Roles */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {roles.slice(0, 2).map((role) => (
                          <span key={role} className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
                            {role}
                          </span>
                        ))}
                        {roles.length > 2 && (
                          <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-md bg-blue-50 text-blue-600 border border-blue-200/60">
                            +{roles.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Qualification & Experience */}
                    <td className="px-4 py-3.5 text-xs">
                      <div className="font-bold text-slate-800">{c.qualification || 'N/A'}</div>
                      <div className="text-slate-500 font-medium">
                        {String(c.experience || '').toLowerCase() === 'fresher' ? (
                          <span className="text-blue-600 font-bold">Fresher</span>
                        ) : (
                          <span>💼 {c.experience || 'Fresher'}</span>
                        )}
                      </div>
                    </td>

                    {/* Interview Pipeline (3 Rounds) */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${
                              c.interviewEvals?.round1.completed
                                ? c.interviewEvals.round1.status === 'passed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                            title={`Round 1 (General): ${c.interviewEvals?.round1.status || 'Pending'}`}
                          >
                            R1: {c.interviewEvals?.round1.score !== null ? `${c.interviewEvals.round1.score}/10` : '—'}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${
                              c.interviewEvals?.round2.completed
                                ? c.interviewEvals.round2.status === 'passed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}
                            title={`Round 2 (HR): ${c.interviewEvals?.round2.status || 'Locked/Pending'}`}
                          >
                            R2: {c.interviewEvals?.round2.score !== null ? `${c.interviewEvals.round2.score}/10` : '🔒'}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${
                              c.interviewEvals?.round3.completed
                                ? c.interviewEvals.round3.status === 'passed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}
                            title={`Round 3 (Manager): ${c.interviewEvals?.round3.status || 'Locked/Pending'}`}
                          >
                            R3: {c.interviewEvals?.round3.score !== null ? `${c.interviewEvals.round3.score}/10` : '🔒'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-blue-700 tabular-nums text-[11px]">
                            {c.interviewEvals?.totalScore || 0} / 30 pts
                          </span>
                          {onOpenDecisionModal && c.interviewEvals?.allRoundsCleared && (
                          <button
                            type="button"
                            onClick={() => onOpenDecisionModal(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer border border-emerald-200 shadow-2xs"
                            title="Final Hiring Decision & Offer Letter"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Offer</span>
                          </button>
                        )}
                        {onEvaluateInterview && (
                            <button
                              type="button"
                              onClick={() => onEvaluateInterview(c)}
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              {c.interviewEvals?.round1.completed ? 'Scorecard →' : 'Evaluate →'}
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-4 py-3.5">
                      <select
                        value={c.status || 'new'}
                        onChange={(e) => onUpdateStatus(c.id, e.target.value as CandidateItem['status'])}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border cursor-pointer focus:outline-hidden ${style.pill}`}
                      >
                        <option value="new">New Application 🔵</option>
                        <option value="contacted">Interview Scheduled 🟡</option>
                        <option value="converted" disabled={c.status === 'new'}>
                          Selected / Hired 🟢 {c.status === 'new' ? '(Interview Required First)' : ''}
                        </option>
                        <option value="rejected">Rejected 🔴</option>
                      </select>
                    </td>

                    {/* Applied Date */}
                    <td className="px-4 py-3.5 text-xs text-slate-600 tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">{formatSafeDate(c.createdAt)}</span>
                        {isSafeToday(c.createdAt) && (
                          <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-blue-700 font-medium">{formatSafeTime(c.createdAt)}</div>
                    </td>

                    {/* Sticky Right: Clear Action Buttons (NO duplicate delete!) */}
                    <td className="sticky right-0 z-10 bg-white group-hover:bg-slate-50 px-4 py-3.5 text-center shadow-[-4px_0_12px_-4px_rgba(15,23,42,0.06)]">
                      <div className="inline-flex items-center gap-1.5">
                        {onSendEmailRequest && (
                          <button
                            type="button"
                            onClick={() => onSendEmailRequest(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer border border-blue-200 shadow-2xs"
                            title="Send or Resend Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email</span>
                          </button>
                        )}
                        {onOpenDecisionModal && c.interviewEvals?.allRoundsCleared && (
                          <button
                            type="button"
                            onClick={() => onOpenDecisionModal(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer border border-emerald-200 shadow-2xs"
                            title="Final Hiring Decision & Offer Letter"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Offer</span>
                          </button>
                        )}
                        {onEvaluateInterview && (
                          <button
                            type="button"
                            onClick={() => onEvaluateInterview(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors cursor-pointer border border-amber-200 shadow-2xs"
                            title="Open 3-Round Scorecard"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Scorecard</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onViewCandidate(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                          title="View Official Application Slip"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Slip</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRequest(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                          title="Delete Candidate Application"
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
      </div>
    </>
  );
}
