import {
  CandidateInterviewState,
  parseInterviewEvaluations,
  serializeInterviewEvaluations,
} from './interview-types';

export interface CandidateItem {
  id: string;
  refId: string;
  name: string;
  fatherName: string;
  phone: string;
  email: string;
  address: string;
  qualification: string;
  gender: string;
  maritalStatus: string;
  experience: string;
  roles: string[];
  rolesString: string;
  status: 'new' | 'contacted' | 'converted' | 'rejected';
  statusLabel: string;
  priority: string;
  internalNotes: string;
  cleanNotes: string; // Human notes stripped of all machine tags
  createdAt: string;
  updatedAt?: string;
  rawRemarks: string;
  emailStatus: 'sent' | 'unsent';
  emailSentAt: string | null;
  lastEmailType: 'confirmation' | 'interview' | 'rejected' | 'offer_letter' | null;
  interviewScheduledAt?: string | null;
  interviewEvals: CandidateInterviewState;
  selectionVerdict: 'none' | 'shortlisted_hold' | 'offer_approved' | 'rejected';
  selectionNotes?: string;
}

/**
 * Strips machine/system tags out of internal_notes so only clean human text is presented to staff.
 */
export function extractCleanHumanNotes(internalNotes?: string | null): string {
  if (!internalNotes) return '';
  return internalNotes
    .replace(/\[INTERVIEW_EVALS_V1:\s*\{[\s\S]*?\}\]/gi, '')
    .replace(/\[SELECTION_DECISION:\s*\{[\s\S]*?\}\]/gi, '')
    .replace(/\[SELECTION_STATUS:\s*[^\]]+\]/gi, '')
    .replace(/\[EMAIL:\s*[^\]]+\]/gi, '')
    .replace(/\[INTERVIEW_SCHEDULED:\s*[^\]]+\]/gi, '')
    .replace(/\[STATUS:\s*[^\]]+\]/gi, '')
    .trim();
}

/**
 * Merges updated human notes back into internal_notes while safely preserving all background system tags.
 */
export function mergeHumanNotesWithTags(
  existingNotes: string | null | undefined,
  newCleanNotes: string
): string {
  if (!existingNotes) return newCleanNotes.trim();

  // Extract all system tags
  const tags: string[] = [];
  const tagPatterns = [
    /\[INTERVIEW_EVALS_V1:\s*\{[\s\S]*?\}\]/gi,
    /\[SELECTION_DECISION:\s*\{[\s\S]*?\}\]/gi,
    /\[SELECTION_STATUS:\s*[^\]]+\]/gi,
    /\[EMAIL:\s*[^\]]+\]/gi,
    /\[INTERVIEW_SCHEDULED:\s*[^\]]+\]/gi,
    /\[STATUS:\s*[^\]]+\]/gi,
  ];

  tagPatterns.forEach((pat) => {
    const matches = existingNotes.match(pat);
    if (matches) {
      matches.forEach((m) => tags.push(m.trim()));
    }
  });

  const clean = newCleanNotes.trim();
  if (tags.length === 0) return clean;
  if (!clean) return tags.join('\n');
  return `${tags.join('\n')}\n\n${clean}`;
}

/**
 * Records a selection decision tag (e.g. shortlisted_hold or offer_approved) into internal_notes.
 */
export function recordSelectionDecisionTag(
  existingNotes: string | null | undefined,
  verdict: 'shortlisted_hold' | 'offer_approved' | 'rejected',
  notes?: string
): string {
  const now = new Date().toISOString();
  const payload = JSON.stringify({ verdict, notes: notes || '', updatedAt: now });
  const tag = `[SELECTION_DECISION: ${payload}]`;
  const clean = (existingNotes || '').replace(/\[SELECTION_DECISION:\s*\{[\s\S]*?\}\]/gi, '').trim();
  return clean ? `${tag}\n${clean}` : tag;
}

/**
 * Appends an email audit tag to internal_notes while preserving lifecycle history.
 */
export function recordEmailLogTag(
  existingNotes: string | null | undefined,
  type: 'confirmation' | 'interview' | 'rejected' | 'offer_letter'
): string {
  const now = new Date().toISOString();
  const tag = `[EMAIL: ${type} | ${now}]`;
  // Clean only duplicate tags of the SAME type, but preserve other lifecycle tags
  const sameTypeRegex = new RegExp(`\\[EMAIL:\\s*${type}\\s*\\|\\s*[^\\]]+\\]`, 'gi');
  const clean = (existingNotes || '').replace(sameTypeRegex, '').trim();
  return clean ? `${tag}\n${clean}` : tag;
}

/**
 * Records an interview scheduled audit tag to internal_notes.
 */
export function recordInterviewScheduledTag(
  existingNotes: string | null | undefined,
  dateStr?: string
): string {
  const now = dateStr || new Date().toISOString();
  const tag = `[INTERVIEW_SCHEDULED: ${now}]`;
  const clean = (existingNotes || '').replace(/\[INTERVIEW_SCHEDULED:\s*[^\]]+\]/gi, '').trim();
  return clean ? `${tag}\n${clean}` : tag;
}

/**
 * Enforces enterprise recruitment protocol rules:
 * 1. Candidate must be in 'contacted' (Interview Scheduled) state. Direct hire from 'new' is blocked.
 * 2. Mandates at least a 24-hour evaluation cooling period between interview scheduling and selection.
 */
export function checkCandidateSelectionEligibility(candidate: CandidateItem): {
  eligible: boolean;
  statusBlocked?: boolean;
  coolingPeriodActive?: boolean;
  hoursRemaining?: number;
  scheduledAt?: string;
  reason: string;
} {
  if (candidate.status === 'new') {
    return {
      eligible: false,
      statusBlocked: true,
      reason:
        'Candidates cannot be selected directly from "New Application". Official HR protocol requires the candidate to be shortlisted and scheduled for an interview first.',
    };
  }

  if (candidate.status === 'rejected') {
    return {
      eligible: false,
      statusBlocked: true,
      reason:
        'Candidate is currently marked as "Rejected". If you wish to reconsider them, schedule an interview first.',
    };
  }

  if (candidate.status === 'converted') {
    return {
      eligible: false,
      statusBlocked: true,
      reason: 'Candidate is already marked as Selected / Hired.',
    };
  }

  // ─── MANDATORY 3-ROUND INTERVIEW LIFECYCLE CHECK ─────────────────────────
  const evals = candidate.interviewEvals;
  if (!evals || !evals.allRoundsCleared) {
    const r1Desc = evals?.round1.completed
      ? (evals.round1.status === 'passed' ? `✅ Passed (${evals.round1.score}/10)` : `❌ ${evals.round1.status.toUpperCase()}`)
      : '⏳ Pending';
    const r2Desc = evals?.round2.completed
      ? (evals.round2.status === 'passed' ? `✅ Passed (${evals.round2.score}/10)` : `❌ ${evals.round2.status.toUpperCase()}`)
      : '🔒 Locked / Pending';
    const r3Desc = evals?.round3.completed
      ? (evals.round3.status === 'passed' ? `✅ Passed (${evals.round3.score}/10)` : `❌ ${evals.round3.status.toUpperCase()}`)
      : '🔒 Locked / Pending';

    return {
      eligible: false,
      statusBlocked: true,
      reason: `All 3 interview rounds are strictly mandatory. Candidate cannot be selected until Round 1 (General), Round 2 (HR), and Round 3 (Manager) are all completed and passed.\n\nCurrent Interview Lifecycle:\n• Round 1 (General): ${r1Desc}\n• Round 2 (HR): ${r2Desc}\n• Round 3 (Manager): ${r3Desc}\n\nTotal Score: ${evals?.totalScore || 0} / 30`,
    };
  }

  // If candidate is in contacted (Interview Scheduled)
  const scheduledTimeStr = candidate.interviewScheduledAt;
  if (scheduledTimeStr) {
    const scheduledTime = new Date(scheduledTimeStr).getTime();
    if (!isNaN(scheduledTime)) {
      const now = Date.now();
      const elapsedHours = (now - scheduledTime) / (1000 * 60 * 60);
      if (elapsedHours < 24) {
        const hoursRemaining = Math.max(1, Math.ceil(24 - elapsedHours));
        return {
          eligible: false,
          coolingPeriodActive: true,
          hoursRemaining,
          scheduledAt: scheduledTimeStr,
          reason: `Interview was scheduled on ${new Date(scheduledTimeStr).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
          })}. HR protocol mandates at least a 24-hour evaluation and interview assessment window before an official selection can be confirmed (${hoursRemaining} hour(s) remaining in cooling window).`,
        };
      }
    }
  }

  return {
    eligible: true,
    reason: 'Candidate has satisfied all recruitment workflow stage requirements.',
  };
}

export function parseCandidateLead(lead: any): CandidateItem {
  const remarks = lead.remarks || '';
  
  // Extract values using regex matching the format:
  // [CAREERS 95 STAFF] Roles: Role1, Role2 | Father: Name | Qual: Deg | Gender: M | Marital: S | Exp: Exp | Email: Mail | Ref: RefId | Notes: ...
  const matchField = (pattern: RegExp) => {
    const m = remarks.match(pattern);
    return m ? m[1].trim() : '';
  };

  const fatherName = matchField(/Father:\s*([^|]+)/i) || 'N/A';
  const qualification = matchField(/Qual:\s*([^|]+)/i) || 'N/A';
  const gender = matchField(/Gender:\s*([^|]+)/i) || 'N/A';
  const maritalStatus = matchField(/Marital:\s*([^|]+)/i) || 'N/A';
  let experience = lead.employment_type || '';
  if (!experience) {
    experience = matchField(/Exp:\s*([^|]+)/i);
  }
  if (!experience || experience.toLowerCase() === 'no' || experience.trim() === '') {
    experience = 'Fresher';
  }
  const email = matchField(/Email:\s*([^|]+)/i) || 'N/A';
  const refId = matchField(/Ref:\s*([^|]+)/i) || `RS-2026-JOB-${(lead.id || '').slice(0, 4).toUpperCase()}`;
  
  // Roles
  let rolesString = lead.designation || '';
  if (!rolesString) {
    rolesString = matchField(/Roles?:\s*([^|]+)/i) || 'Staff Applicant';
  }
  const roles = rolesString
    .split(',')
    .map((r: string) => r.trim())
    .filter(Boolean);

  // Status mapping
  let statusLabel = 'New Application';
  if (lead.status === 'converted') statusLabel = 'Selected / Hired';
  else if (lead.status === 'rejected') statusLabel = 'Rejected';
  else if (lead.status === 'contacted') statusLabel = 'Interview Scheduled';

  // Email log parsing from internal_notes or remarks
  const internalNotes = lead.internal_notes || '';
  let emailStatus: 'sent' | 'unsent' = 'unsent';
  let emailSentAt: string | null = null;
  let lastEmailType: 'confirmation' | 'interview' | 'rejected' | null = null;

  const emailMatch = internalNotes.match(/\[EMAIL:\s*(\w+)\s*\|\s*([^\]]+)\]/i);
  if (emailMatch) {
    emailStatus = 'sent';
    lastEmailType = emailMatch[1].toLowerCase() as any;
    emailSentAt = emailMatch[2].trim();
  }

  // Interview Scheduled timestamp parsing
  const interviewMatch = internalNotes.match(/\[INTERVIEW_SCHEDULED:\s*([^\]]+)\]/i);
  let interviewScheduledAt: string | null = null;
  if (interviewMatch) {
    interviewScheduledAt = interviewMatch[1].trim();
  } else if (lastEmailType === 'interview' && emailSentAt) {
    interviewScheduledAt = emailSentAt;
  } else if (lead.status === 'contacted' && lead.updated_at) {
    interviewScheduledAt = lead.updated_at;
  }

  // Parse structured 3-round interview evaluation state
  const interviewEvals = parseInterviewEvaluations(internalNotes);

  // Extract clean human notes (stripped of machine JSON tags)
  const cleanNotes = extractCleanHumanNotes(internalNotes);

  // Parse selection verdict (e.g. shortlisted_hold or offer_approved)
  let selectionVerdict: 'none' | 'shortlisted_hold' | 'offer_approved' | 'rejected' = 'none';
  let selectionNotes = '';
  const selMatch = internalNotes.match(/\[SELECTION_DECISION:\s*(\{[\s\S]*?\})\]/i);
  if (selMatch) {
    try {
      const parsed = JSON.parse(selMatch[1]);
      selectionVerdict = parsed.verdict || 'none';
      selectionNotes = parsed.notes || '';
    } catch {}
  } else if (internalNotes.includes('[SELECTION_STATUS: shortlisted_hold')) {
    selectionVerdict = 'shortlisted_hold';
  } else if (lead.status === 'converted') {
    selectionVerdict = 'offer_approved';
  }

  if (selectionVerdict === 'shortlisted_hold' && lead.status !== 'converted' && lead.status !== 'rejected') {
    statusLabel = 'Shortlisted (On Hold Pool)';
  }

  return {
    id: lead.id,
    refId,
    name: lead.name || 'Candidate',
    fatherName,
    phone: lead.phone || '',
    email,
    address: lead.address || lead.city || 'N/A',
    qualification,
    gender,
    maritalStatus,
    experience,
    roles,
    rolesString,
    status: (lead.status as any) || 'new',
    statusLabel,
    priority: lead.priority || 'hot',
    internalNotes: internalNotes,
    cleanNotes,
    createdAt: lead.created_at || new Date().toISOString(),
    updatedAt: lead.updated_at || undefined,
    rawRemarks: remarks,
    emailStatus,
    emailSentAt,
    lastEmailType,
    interviewScheduledAt,
    interviewEvals,
    selectionVerdict,
    selectionNotes,
  };
}

/**
 * Export candidates list to a downloadable CSV file with Excel-compatible UTF-8 BOM.
 */
export function exportCandidatesToCSV(candidates: CandidateItem[], filenamePrefix = 'Rachakonda_Candidates') {
  if (!candidates || candidates.length === 0) {
    alert('No candidate records available to export.');
    return;
  }

  const headers = [
    'S.No',
    'Reference ID',
    'Candidate Name',
    "Father's Name",
    'Mobile Number',
    'Email Address',
    'Gender',
    'Marital Status',
    'Qualification',
    'Experience',
    'Applied Job Positions',
    'Residential Address',
    'Recruitment Status',
    'Interview Notes',
    'Application Date',
  ];

  const escapeCSV = (val: string | number | null | undefined) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = candidates.map((c, index) => {
    const formattedDate = new Date(c.createdAt).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return [
      escapeCSV(index + 1),
      escapeCSV(c.refId),
      escapeCSV(c.name),
      escapeCSV(c.fatherName),
      escapeCSV(c.phone),
      escapeCSV(c.email),
      escapeCSV(c.gender),
      escapeCSV(c.maritalStatus),
      escapeCSV(c.qualification),
      escapeCSV(c.experience),
      escapeCSV(c.rolesString),
      escapeCSV(c.address),
      escapeCSV(c.statusLabel),
      escapeCSV(c.internalNotes),
      escapeCSV(formattedDate),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `${filenamePrefix}_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
