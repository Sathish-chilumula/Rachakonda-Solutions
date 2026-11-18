export type InterviewRoundKey = 'round1' | 'round2' | 'round3';

export type RoundDecision = 'passed' | 'hold' | 'rejected' | 'pending';

export interface InterviewRoundEvaluation {
  roundNumber: 1 | 2 | 3;
  roundName: string;
  completed: boolean;
  score: number | null; // Mandatory 1 to 10
  comments: string; // Mandatory qualitative feedback
  interviewerName: string; // Mandatory interviewer tracking
  interviewerRole: string; // Mandatory designation
  mode: 'In-Person (Gajwel Office)' | 'Google Meet / Online' | 'Telephonic Interview';
  status: RoundDecision;
  evaluatedAt: string | null;
}

export interface CandidateInterviewState {
  currentRound: 1 | 2 | 3;
  round1: InterviewRoundEvaluation;
  round2: InterviewRoundEvaluation;
  round3: InterviewRoundEvaluation;
  totalScore: number; // 0 to 30
  averageScore: number; // 0 to 10
  isHaltRejected: boolean;
  allRoundsCleared: boolean;
  compositeVerdict: 'Not Started' | 'In Progress' | 'On Hold' | 'Strong Hire' | 'Recommended' | 'Rejected';
}

export const INITIAL_ROUND_1: InterviewRoundEvaluation = {
  roundNumber: 1,
  roundName: 'Round 1: General Round',
  completed: false,
  score: null,
  comments: '',
  interviewerName: '',
  interviewerRole: '',
  mode: 'In-Person (Gajwel Office)',
  status: 'pending',
  evaluatedAt: null,
};

export const INITIAL_ROUND_2: InterviewRoundEvaluation = {
  roundNumber: 2,
  roundName: 'Round 2: HR Round',
  completed: false,
  score: null,
  comments: '',
  interviewerName: '',
  interviewerRole: '',
  mode: 'In-Person (Gajwel Office)',
  status: 'pending',
  evaluatedAt: null,
};

export const INITIAL_ROUND_3: InterviewRoundEvaluation = {
  roundNumber: 3,
  roundName: 'Round 3: Manager Round',
  completed: false,
  score: null,
  comments: '',
  interviewerName: '',
  interviewerRole: '',
  mode: 'In-Person (Gajwel Office)',
  status: 'pending',
  evaluatedAt: null,
};

/**
 * Enforces strict sequential round progression:
 * Round 1: Always accessible.
 * Round 2: Unlocked ONLY IF Round 1 is completed and passed.
 * Round 3: Unlocked ONLY IF Round 2 is completed and passed.
 */
export function isRoundUnlocked(
  state: CandidateInterviewState,
  targetRound: 1 | 2 | 3
): { unlocked: boolean; reason?: string } {
  if (targetRound === 1) {
    return { unlocked: true };
  }

  if (targetRound === 2) {
    if (!state.round1.completed) {
      return {
        unlocked: false,
        reason: 'Round 1 (General Round) is mandatory. Candidate must be evaluated and passed in Round 1 before Round 2 can be accessed.',
      };
    }
    if (state.round1.status === 'rejected') {
      return {
        unlocked: false,
        reason: 'Candidate was Rejected in Round 1 (General Round). Interview lifecycle is halted.',
      };
    }
    if (state.round1.status !== 'passed') {
      return {
        unlocked: false,
        reason: 'Round 1 is currently marked as "On Hold" or "Pending". Candidate must pass Round 1 to unlock Round 2.',
      };
    }
    return { unlocked: true };
  }

  if (targetRound === 3) {
    // Check Round 1 first
    const r2Check = isRoundUnlocked(state, 2);
    if (!r2Check.unlocked) {
      return r2Check;
    }

    if (!state.round2.completed) {
      return {
        unlocked: false,
        reason: 'Round 2 (HR Round) is mandatory. Candidate must be evaluated and passed in Round 2 before Round 3 can be accessed.',
      };
    }
    if (state.round2.status === 'rejected') {
      return {
        unlocked: false,
        reason: 'Candidate was Rejected in Round 2 (HR Round). Interview lifecycle is halted.',
      };
    }
    if (state.round2.status !== 'passed') {
      return {
        unlocked: false,
        reason: 'Round 2 is currently marked as "On Hold" or "Pending". Candidate must pass Round 2 to unlock Round 3.',
      };
    }
    return { unlocked: true };
  }

  return { unlocked: false, reason: 'Invalid round number.' };
}

/**
 * Calculates composite score & overall verdict across the 3 rounds.
 */
export function computeInterviewScores(
  r1: InterviewRoundEvaluation,
  r2: InterviewRoundEvaluation,
  r3: InterviewRoundEvaluation
): {
  totalScore: number;
  averageScore: number;
  isHaltRejected: boolean;
  allRoundsCleared: boolean;
  compositeVerdict: 'Not Started' | 'In Progress' | 'On Hold' | 'Strong Hire' | 'Recommended' | 'Rejected';
} {
  const scores = [r1.score, r2.score, r3.score].filter((s): s is number => typeof s === 'number' && !isNaN(s));
  const totalScore = scores.reduce((sum, s) => sum + s, 0);
  const averageScore = scores.length > 0 ? Number((totalScore / scores.length).toFixed(1)) : 0;

  const isHaltRejected = r1.status === 'rejected' || r2.status === 'rejected' || r3.status === 'rejected';
  const allRoundsCleared =
    r1.completed && r1.status === 'passed' &&
    r2.completed && r2.status === 'passed' &&
    r3.completed && r3.status === 'passed';

  let compositeVerdict: 'Not Started' | 'In Progress' | 'On Hold' | 'Strong Hire' | 'Recommended' | 'Rejected' = 'Not Started';

  if (isHaltRejected) {
    compositeVerdict = 'Rejected';
  } else if (allRoundsCleared) {
    if (totalScore >= 24) compositeVerdict = 'Strong Hire';
    else if (totalScore >= 18) compositeVerdict = 'Recommended';
    else compositeVerdict = 'On Hold';
  } else if (r1.status === 'hold' || r2.status === 'hold' || r3.status === 'hold') {
    compositeVerdict = 'On Hold';
  } else if (r1.completed || r2.completed || r3.completed) {
    compositeVerdict = 'In Progress';
  }

  return {
    totalScore,
    averageScore,
    isHaltRejected,
    allRoundsCleared,
    compositeVerdict,
  };
}

/**
 * Parses interview state from internal_notes.
 */
export function parseInterviewEvaluations(internalNotes?: string | null): CandidateInterviewState {
  const fallbackState: CandidateInterviewState = {
    currentRound: 1,
    round1: { ...INITIAL_ROUND_1 },
    round2: { ...INITIAL_ROUND_2 },
    round3: { ...INITIAL_ROUND_3 },
    totalScore: 0,
    averageScore: 0,
    isHaltRejected: false,
    allRoundsCleared: false,
    compositeVerdict: 'Not Started',
  };

  if (!internalNotes) return fallbackState;

  const match = internalNotes.match(/\[INTERVIEW_EVALS_V1:\s*({[\s\S]*?})\]/);
  if (!match) return fallbackState;

  try {
    const raw = JSON.parse(match[1]);
    const r1: InterviewRoundEvaluation = { ...INITIAL_ROUND_1, ...(raw.round1 || {}) };
    const r2: InterviewRoundEvaluation = { ...INITIAL_ROUND_2, ...(raw.round2 || {}) };
    const r3: InterviewRoundEvaluation = { ...INITIAL_ROUND_3, ...(raw.round3 || {}) };

    const computed = computeInterviewScores(r1, r2, r3);

    // Determine current active round
    let currentRound: 1 | 2 | 3 = 1;
    if (r1.completed && r1.status === 'passed') {
      currentRound = 2;
      if (r2.completed && r2.status === 'passed') {
        currentRound = 3;
      }
    }

    return {
      currentRound,
      round1: r1,
      round2: r2,
      round3: r3,
      ...computed,
    };
  } catch (err) {
    console.error('Failed to parse interview evaluation JSON:', err);
    return fallbackState;
  }
}

/**
 * Serializes interview evaluations back into internal_notes, preserving all other tags.
 */
export function serializeInterviewEvaluations(
  existingNotes: string | null | undefined,
  state: CandidateInterviewState
): string {
  const payload = {
    round1: state.round1,
    round2: state.round2,
    round3: state.round3,
    updatedAt: new Date().toISOString(),
  };

  const tag = `[INTERVIEW_EVALS_V1: ${JSON.stringify(payload)}]`;
  const clean = (existingNotes || '').replace(/\[INTERVIEW_EVALS_V1:\s*{[\s\S]*?}\]/gi, '').trim();
  return clean ? `${tag}\n${clean}` : tag;
}
