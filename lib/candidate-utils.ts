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
  rawRemarks: string;
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
  const experience = matchField(/Exp:\s*([^|]+)/i) || 'Fresher';
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
    internalNotes: lead.internal_notes || '',
    createdAt: lead.created_at || new Date().toISOString(),
    rawRemarks: remarks,
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
