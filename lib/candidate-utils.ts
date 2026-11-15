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
  createdAt: string;
  updatedAt?: string;
  rawRemarks: string;
  emailStatus: 'sent' | 'unsent';
  emailSentAt: string | null;
  lastEmailType: 'confirmation' | 'interview' | 'rejected' | null;
  interviewScheduledAt?: string | null;
}

/**
 * Appends an email audit tag to internal_notes while preserving lifecycle history.
 */
export function recordEmailLogTag(
  existingNotes: string | null | undefined,
  type: 'confirmation' | 'interview' | 'rejected'
): string {
  const now = new Date().toISOString();
  const tag = `[EMAIL: ${type} | ${now}]`;
  // Clean only duplicate tags of the SAME type, but preserve other lifecycle tags (e.g., confirmation + interview)
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
    createdAt: lead.created_at || new Date().toISOString(),
    updatedAt: lead.updated_at || undefined,
    rawRemarks: remarks,
    emailStatus,
    emailSentAt,
    lastEmailType,
    interviewScheduledAt,
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
