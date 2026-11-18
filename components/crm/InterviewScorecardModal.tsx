'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  Clock,
  Lock,
  AlertTriangle,
  Award,
  UserCheck,
  Briefcase,
  Calendar,
  Save,
  ChevronRight,
  ShieldAlert,
  Building,
  GraduationCap
} from 'lucide-react';
import type { CandidateItem } from '@/lib/candidate-utils';
import {
  CandidateInterviewState,
  InterviewRoundEvaluation,
  isRoundUnlocked,
  computeInterviewScores,
  INITIAL_ROUND_1,
  INITIAL_ROUND_2,
  INITIAL_ROUND_3,
} from '@/lib/interview-types';

interface InterviewScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateItem | null;
  currentUser?: { name?: string; role?: string };
  onSaveEvaluation: (
    candidateId: string,
    updatedState: CandidateInterviewState
  ) => Promise<{ success: boolean; error?: string }>;
  onOpenDecisionModal?: (candidate: CandidateItem) => void;
}

export default function InterviewScorecardModal({
  isOpen,
  onClose,
  candidate,
  currentUser,
  onSaveEvaluation,
  onOpenDecisionModal,
}: InterviewScorecardModalProps) {
  const [activeRound, setActiveRound] = useState<1 | 2 | 3>(1);
  const [evalState, setEvalState] = useState<CandidateInterviewState | null>(null);

  // Form states for the currently selected round
  const [interviewerName, setInterviewerName] = useState('');
  const [interviewerRole, setInterviewerRole] = useState('');
  const [interviewMode, setInterviewMode] = useState<
    'In-Person (Gajwel Office)' | 'Google Meet / Online' | 'Telephonic Interview'
  >('In-Person (Gajwel Office)');
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [comments, setComments] = useState('');
  const [roundDecision, setRoundDecision] = useState<'passed' | 'hold' | 'rejected'>('passed');

  const [saving, setSaving] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Synchronize state when candidate opens
  useEffect(() => {
    if (candidate) {
      const state = candidate.interviewEvals;
      setEvalState(state);

      // Determine initial active round based on progression
      if (!state.round1.completed || state.round1.status !== 'passed') {
        setActiveRound(1);
      } else if (!state.round2.completed || state.round2.status !== 'passed') {
        setActiveRound(2);
      } else {
        setActiveRound(3);
      }
    }
  }, [candidate]);

  // Load round data when activeRound or evalState changes
  useEffect(() => {
    if (!evalState) return;
    const currentRoundData: InterviewRoundEvaluation =
      activeRound === 1
        ? evalState.round1
        : activeRound === 2
        ? evalState.round2
        : evalState.round3;

    setInterviewerName(currentRoundData.interviewerName || currentUser?.name || '');
    setInterviewerRole(
      currentRoundData.interviewerRole ||
        (currentUser?.role ? `${currentUser.role.toUpperCase()} Evaluator` : '')
    );
    setInterviewMode(currentRoundData.mode || 'In-Person (Gajwel Office)');
    setSelectedScore(currentRoundData.score);
    setComments(currentRoundData.comments || '');
    setRoundDecision(currentRoundData.status === 'pending' ? 'passed' : currentRoundData.status);
    setFeedbackError(null);
    setSaveSuccessMsg(null);
  }, [activeRound, evalState, currentUser]);

  if (!isOpen || !candidate || !evalState) return null;

  const currentRoundKey = activeRound === 1 ? 'round1' : activeRound === 2 ? 'round2' : 'round3';
  const currentRoundData = evalState[currentRoundKey];
  const unlockStatus = isRoundUnlocked(evalState, activeRound);

  // Handle switching rounds with strict sequential guard
  const handleSelectRound = (roundNum: 1 | 2 | 3) => {
    const check = isRoundUnlocked(evalState, roundNum);
    if (!check.unlocked) {
      alert(`⛔ Access Blocked (Mandatory Lifecycle):\n\n${check.reason}`);
      return;
    }
    setActiveRound(roundNum);
  };

  const handleScoreClick = (score: number) => {
    setSelectedScore(score);
    setFeedbackError(null);
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);

    // Validation 1: Check unlocked
    if (!unlockStatus.unlocked) {
      setFeedbackError(unlockStatus.reason || 'This round is locked.');
      return;
    }

    // Validation 2: Mandatory Interviewer Name
    if (!interviewerName.trim()) {
      setFeedbackError('Interviewer Name is mandatory to ensure evaluation accountability.');
      return;
    }

    // Validation 3: Mandatory Interviewer Role
    if (!interviewerRole.trim()) {
      setFeedbackError('Interviewer Role / Title is mandatory.');
      return;
    }

    // Validation 4: Mandatory Score (1-10)
    if (selectedScore === null || selectedScore < 1 || selectedScore > 10) {
      setFeedbackError('Mandatory: Please select a Score between 1 and 10 points for this round.');
      return;
    }

    // Validation 5: Mandatory Qualitative Comments (min 15 chars)
    if (comments.trim().length < 15) {
      setFeedbackError('Mandatory Feedback: Please provide detailed qualitative observations (minimum 15 characters).');
      return;
    }

    setSaving(true);
    try {
      const nowIso = new Date().toISOString();
      const updatedRound: InterviewRoundEvaluation = {
        ...currentRoundData,
        completed: true,
        score: selectedScore,
        comments: comments.trim(),
        interviewerName: interviewerName.trim(),
        interviewerRole: interviewerRole.trim(),
        mode: interviewMode,
        status: roundDecision,
        evaluatedAt: nowIso,
      };

      const updatedR1 = activeRound === 1 ? updatedRound : evalState.round1;
      const updatedR2 = activeRound === 2 ? updatedRound : evalState.round2;
      const updatedR3 = activeRound === 3 ? updatedRound : evalState.round3;

      const computed = computeInterviewScores(updatedR1, updatedR2, updatedR3);

      let newCurrentRound: 1 | 2 | 3 = 1;
      if (updatedR1.completed && updatedR1.status === 'passed') {
        newCurrentRound = 2;
        if (updatedR2.completed && updatedR2.status === 'passed') {
          newCurrentRound = 3;
        }
      }

      const newState: CandidateInterviewState = {
        currentRound: newCurrentRound,
        round1: updatedR1,
        round2: updatedR2,
        round3: updatedR3,
        ...computed,
      };

      const res = await onSaveEvaluation(candidate.id, newState);
      if (res.success) {
        setEvalState(newState);
        setSaveSuccessMsg(`Round ${activeRound} Evaluation successfully recorded (${selectedScore}/10 points)!`);

        // If candidate passed and next round exists, auto-advance to next round
        if (roundDecision === 'passed' && activeRound < 3) {
          setTimeout(() => {
            setActiveRound((prev) => (prev + 1) as 2 | 3);
            setSaveSuccessMsg(null);
          }, 1200);
        } else {
          setTimeout(() => setSaveSuccessMsg(null), 3500);
        }
      } else {
        setFeedbackError(res.error || 'Failed to save evaluation to database.');
      }
    } catch (err: any) {
      setFeedbackError(err.message || 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Enterprise 3-Round Interview Evaluation</h2>
              <p className="text-xs text-slate-400">Strict Sequential Stage-Gate Protocol &bull; Mandatory Scoring</p>
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

        {/* Candidate Snapshot & Composite Score Meter */}
        <div className="p-6 bg-slate-50/70 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  {candidate.refId}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    evalState.allRoundsCleared
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : evalState.isHaltRejected
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {evalState.compositeVerdict}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900">{candidate.name}</h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                <span>
                  <strong>Applied:</strong> {candidate.rolesString || 'Staff Applicant'}
                </span>
                <span>&bull;</span>
                <span>
                  <strong>Exp:</strong> {candidate.experience || 'Fresher'}
                </span>
                <span>&bull;</span>
                <span>
                  <strong>Qual:</strong> {candidate.qualification || 'N/A'}
                </span>
              </div>
            </div>

            {/* Composite Score Meter */}
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4 min-w-[210px] justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Total Score (30 pts)
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-blue-600 tabular-nums">{evalState.totalScore}</span>
                  <span className="text-xs font-bold text-slate-400">/ 30</span>
                </div>
                <div className="text-[11px] font-bold text-slate-500">
                  Avg: {evalState.averageScore} / 10
                </div>
              </div>
              <div className="w-14 h-14 rounded-full border-4 border-slate-100 flex items-center justify-center relative">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-600 transition-all duration-500"
                    strokeWidth="3.5"
                    strokeDasharray={`${Math.round((evalState.totalScore / 30) * 100)}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[11px] font-black text-slate-800">
                  {Math.round((evalState.totalScore / 30) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* All Rounds Cleared Success Banner */}
          {evalState.allRoundsCleared && onOpenDecisionModal && (
            <div className="mt-4 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-black text-emerald-950">
                    🎉 All 3 Interview Rounds Cleared ({evalState.totalScore}/30 pts)!
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    Candidate is eligible for Shortlisted Reserve Pool (On Hold) or Final Selection &amp; Offer Letter dispatch.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenDecisionModal(candidate)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs flex items-center gap-1.5 self-start sm:self-auto shrink-0"
              >
                <span>Hiring &amp; Offer Clearance</span>
                <span>→</span>
              </button>
            </div>
          )}

          {/* 3-Round Stepper Navigation with Sequential Locking */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5">
            {/* Round 1 Stepper Card */}
            <button
              type="button"
              onClick={() => handleSelectRound(1)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                activeRound === 1
                  ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-500/30'
                  : evalState.round1.completed
                  ? evalState.round1.status === 'passed'
                    ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50'
                    : 'border-rose-200 bg-rose-50/40 hover:bg-rose-50'
                  : 'border-slate-200 bg-white hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Stage 1 &bull; Screening
                </span>
                {evalState.round1.completed ? (
                  evalState.round1.status === 'passed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  )
                ) : (
                  <Clock className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div className="text-xs font-black text-slate-900">1. General Round</div>
              <div className="flex items-center justify-between text-[11px] mt-1.5">
                <span className="font-bold text-slate-600">
                  Score:{' '}
                  <b className={evalState.round1.score ? 'text-blue-700' : 'text-slate-400'}>
                    {evalState.round1.score !== null ? `${evalState.round1.score}/10` : '—'}
                  </b>
                </span>
                <span
                  className={`font-extrabold uppercase text-[10px] ${
                    evalState.round1.status === 'passed'
                      ? 'text-emerald-700'
                      : evalState.round1.status === 'rejected'
                      ? 'text-rose-700'
                      : evalState.round1.status === 'hold'
                      ? 'text-amber-700'
                      : 'text-slate-400'
                  }`}
                >
                  {evalState.round1.status}
                </span>
              </div>
            </button>

            {/* Round 2 Stepper Card */}
            {(() => {
              const r2Unlocked = isRoundUnlocked(evalState, 2).unlocked;
              return (
                <button
                  type="button"
                  onClick={() => handleSelectRound(2)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    activeRound === 2
                      ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-500/30'
                      : !r2Unlocked
                      ? 'border-slate-200 bg-slate-100/60 opacity-60 cursor-not-allowed'
                      : evalState.round2.completed
                      ? evalState.round2.status === 'passed'
                        ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50'
                        : 'border-rose-200 bg-rose-50/40 hover:bg-rose-50'
                      : 'border-slate-200 bg-white hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      Stage 2 &bull; HR &amp; Culture
                    </span>
                    {!r2Unlocked ? (
                      <Lock className="w-4 h-4 text-slate-400" />
                    ) : evalState.round2.completed ? (
                      evalState.round2.status === 'passed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      )
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span>2. HR Round</span>
                    {!r2Unlocked && <span className="text-[10px] font-normal text-slate-400">(Locked)</span>}
                  </div>
                  <div className="flex items-center justify-between text-[11px] mt-1.5">
                    <span className="font-bold text-slate-600">
                      Score:{' '}
                      <b className={evalState.round2.score ? 'text-blue-700' : 'text-slate-400'}>
                        {evalState.round2.score !== null ? `${evalState.round2.score}/10` : '—'}
                      </b>
                    </span>
                    <span
                      className={`font-extrabold uppercase text-[10px] ${
                        !r2Unlocked
                          ? 'text-slate-400'
                          : evalState.round2.status === 'passed'
                          ? 'text-emerald-700'
                          : evalState.round2.status === 'rejected'
                          ? 'text-rose-700'
                          : evalState.round2.status === 'hold'
                          ? 'text-amber-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {!r2Unlocked ? 'Locked' : evalState.round2.status}
                    </span>
                  </div>
                </button>
              );
            })()}

            {/* Round 3 Stepper Card */}
            {(() => {
              const r3Unlocked = isRoundUnlocked(evalState, 3).unlocked;
              return (
                <button
                  type="button"
                  onClick={() => handleSelectRound(3)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    activeRound === 3
                      ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-500/30'
                      : !r3Unlocked
                      ? 'border-slate-200 bg-slate-100/60 opacity-60 cursor-not-allowed'
                      : evalState.round3.completed
                      ? evalState.round3.status === 'passed'
                        ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50'
                        : 'border-rose-200 bg-rose-50/40 hover:bg-rose-50'
                      : 'border-slate-200 bg-white hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      Stage 3 &bull; Final Decision
                    </span>
                    {!r3Unlocked ? (
                      <Lock className="w-4 h-4 text-slate-400" />
                    ) : evalState.round3.completed ? (
                      evalState.round3.status === 'passed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      )
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span>3. Manager Round</span>
                    {!r3Unlocked && <span className="text-[10px] font-normal text-slate-400">(Locked)</span>}
                  </div>
                  <div className="flex items-center justify-between text-[11px] mt-1.5">
                    <span className="font-bold text-slate-600">
                      Score:{' '}
                      <b className={evalState.round3.score ? 'text-blue-700' : 'text-slate-400'}>
                        {evalState.round3.score !== null ? `${evalState.round3.score}/10` : '—'}
                      </b>
                    </span>
                    <span
                      className={`font-extrabold uppercase text-[10px] ${
                        !r3Unlocked
                          ? 'text-slate-400'
                          : evalState.round3.status === 'passed'
                          ? 'text-emerald-700'
                          : evalState.round3.status === 'rejected'
                          ? 'text-rose-700'
                          : evalState.round3.status === 'hold'
                          ? 'text-amber-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {!r3Unlocked ? 'Locked' : evalState.round3.status}
                    </span>
                  </div>
                </button>
              );
            })()}
          </div>
        </div>

        {/* Active Round Evaluation Form or Locked Warning */}
        <div className="p-6">
          {!unlockStatus.unlocked ? (
            <div className="p-8 text-center bg-amber-50/70 border border-amber-200 rounded-3xl">
              <Lock className="w-12 h-12 text-amber-600 mx-auto mb-3" />
              <h4 className="text-base font-extrabold text-slate-900">Round {activeRound} is Currently Locked</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                {unlockStatus.reason}
              </p>
              <button
                type="button"
                onClick={() => setActiveRound((activeRound - 1) as 1 | 2)}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                Go Back to Round {activeRound - 1}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitEvaluation} className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>
                      {activeRound === 1
                        ? 'Round 1: General Screening & Technical Assessment'
                        : activeRound === 2
                        ? 'Round 2: HR, Culture Fit & Background Verification'
                        : 'Round 3: Hiring Manager Leadership & Final Selection'}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeRound === 1
                      ? 'Evaluates domain literacy, basic communication, aptitude, and resume verification.'
                      : activeRound === 2
                      ? 'Evaluates cultural fit, attitude, salary expectations, notice period, and background.'
                      : 'Evaluates situational judgment, department leadership, team fit, and final offer approval.'}
                  </p>
                </div>

                {currentRoundData.completed && (
                  <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ✓ Completed on {new Date(currentRoundData.evaluatedAt || '').toLocaleDateString('en-IN')}
                  </span>
                )}
              </div>

              {/* Row 1: Interviewer Attribution & Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Interviewer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={interviewerName}
                    onChange={(e) => setInterviewerName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Interviewer Role / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={interviewerRole}
                    onChange={(e) => setInterviewerRole(e.target.value)}
                    placeholder="e.g. HR Manager / Senior Lead"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Interview Mode <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={interviewMode}
                    onChange={(e) => setInterviewMode(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="In-Person (Gajwel Office)">In-Person (Gajwel Office)</option>
                    <option value="Google Meet / Online">Google Meet / Online</option>
                    <option value="Telephonic Interview">Telephonic Interview</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Mandatory 10-Point Score Picker */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2.5">
                  <div>
                    <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span>Mandatory Score for Round {activeRound}</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Score out of 10 points (1 = Very Poor &bull; 5 = Average &bull; 8 = Excellent &bull; 10 = Exceptional)
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black tabular-nums border ${
                      selectedScore !== null
                        ? selectedScore >= 8
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : selectedScore >= 6
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : selectedScore >= 4
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-slate-200 text-slate-600 border-slate-300'
                    }`}
                  >
                    Selected: {selectedScore !== null ? `${selectedScore} / 10` : 'None'}
                  </span>
                </div>

                <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                    const isSelected = selectedScore === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleScoreClick(num)}
                        className={`py-2.5 text-center rounded-xl text-xs font-black transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md scale-105 border-2 border-blue-700'
                            : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Mandatory Qualitative Comments */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>Interviewer Observations &amp; Feedback</span>
                    <span className="text-rose-500">* (Mandatory)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Min 15 characters ({comments.trim().length} entered)
                  </span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Record key technical/communication strengths, areas of concern, job fit assessment, and your rationale for advancing or rejecting..."
                  className="w-full p-3.5 rounded-2xl text-xs bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Row 4: Round Decision & Save Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-700">Round Decision:</label>
                  <select
                    value={roundDecision}
                    onChange={(e) => setRoundDecision(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 focus:outline-hidden"
                  >
                    <option value="passed">
                      {activeRound === 3 ? '✅ Recommend for Hire / Final Clearance' : '✅ Pass & Unlock Next Round'}
                    </option>
                    <option value="hold">⏸️ Put On Hold</option>
                    <option value="rejected">❌ Reject Candidate (Halt Lifecycle)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving to Database...' : `Save Round ${activeRound} Evaluation`}</span>
                  </button>
                </div>
              </div>

              {/* Feedback Alert Banners */}
              {feedbackError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{feedbackError}</span>
                </div>
              )}

              {saveSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
