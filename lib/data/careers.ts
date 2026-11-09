export interface JobRole {
  id: string;
  no: number;
  title: string;
  qualification: string;
  priorityRequirement: string;
  genderNeeded: 'Male/Female' | 'Female' | 'Girls' | 'Boys' | 'Male';
  department: string;
  vacanciesCount?: number;
  description: string;
}

export const JOB_ROLES: JobRole[] = [
  {
    id: 'admin-manager',
    no: 1,
    title: 'Admin Manager',
    qualification: 'Any Degree (B.Tech, Degree, B.Pharm)',
    priorityRequirement: 'MBA / B.Tech Priority, Experienced',
    genderNeeded: 'Male/Female',
    department: 'Management & Operations',
    description: 'Lead office administrative operations, coordinate between departments, manage reporting schedules, and oversee daily workflow at Gajwel Head Office.',
  },
  {
    id: 'admin-executive',
    no: 2,
    title: 'Admin Executive',
    qualification: 'Any Degree',
    priorityRequirement: 'Experienced & Commanding Attitude',
    genderNeeded: 'Female',
    department: 'Administration',
    description: 'Execute administrative workflows, record-keeping, staff attendance, student filing, and campus operational coordination.',
  },
  {
    id: 'office-assistant',
    no: 3,
    title: 'Office Assistant',
    qualification: 'Any Degree',
    priorityRequirement: 'Cashier Exp + Admission Exp Priority',
    genderNeeded: 'Female',
    department: 'Office Operations',
    description: 'Handle daily documentation, front office operations, basic fee/cashier record management, and student admission desk support.',
  },
  {
    id: 'team-leads',
    no: 4,
    title: 'Team Leads',
    qualification: 'Any Degree',
    priorityRequirement: 'Communication & Commanding Attitude',
    genderNeeded: 'Female',
    department: 'Leadership & Supervision',
    description: 'Supervise telecalling and counseling teams, monitor daily student follow-ups, maintain KPI targets, and ensure smooth workflow execution.',
  },
  {
    id: 'receptionist',
    no: 5,
    title: 'Receptionist',
    qualification: 'Inter / Any Degree',
    priorityRequirement: 'Pleasing Personality & Communication Skills',
    genderNeeded: 'Female',
    department: 'Front Desk & Hospitality',
    description: 'Warmly greet visiting students and parents, manage incoming telephone inquiries, register visitors, and direct candidates to counselors.',
  },
  {
    id: 'data-entry-operator',
    no: 6,
    title: 'Data Entry Operator',
    qualification: 'Inter / Any Degree',
    priorityRequirement: 'Telugu & English Typing',
    genderNeeded: 'Male/Female',
    department: 'Data Management & IT',
    description: 'Fast and accurate data entry for student admission forms, exam scores, CRM record updates, and computer reporting in Telugu and English.',
  },
  {
    id: 'tele-callers',
    no: 7,
    title: 'Tele Callers',
    qualification: 'Inter / Any Degree',
    priorityRequirement: 'Good Communication',
    genderNeeded: 'Female',
    department: 'Student Outreach',
    description: 'Connect with prospective students and parents, explain college admission opportunities, schedule campus counseling visits, and follow up courteously.',
  },
  {
    id: 'marketing-promoters',
    no: 8,
    title: 'Marketing Promoters',
    qualification: 'Inter / Any Degree',
    priorityRequirement: 'Good Communication, Hard Work Nature',
    genderNeeded: 'Girls',
    department: 'Institutional Outreach',
    description: 'Distribute educational program awareness, represent Rachakonda Solutions in schools/junior colleges across TS/AP, and organize event desks.',
  },
  {
    id: 'marketing-executives',
    no: 9,
    title: 'Marketing Executives',
    qualification: 'Inter / Any Degree',
    priorityRequirement: 'Field Marketing, MBA Priority',
    genderNeeded: 'Boys',
    department: 'Business Development',
    description: 'Field marketing across Medak, Siddipet, Hyderabad, and neighboring districts. Build institutional relationships with colleges and coaching centers.',
  },
  {
    id: 'tutors',
    no: 10,
    title: 'Tutors / Faculty',
    qualification: 'Degree / B.Ed',
    priorityRequirement: 'Teaching Experience Priority',
    genderNeeded: 'Male/Female',
    department: 'Academics & Training',
    description: 'Deliver engaging subject tuition, competitive entrance exam coaching (EAMCET, POLYCET, foundational science/math), and student mentorship.',
  },
  {
    id: 'graphic-designers',
    no: 11,
    title: 'Graphic Designers',
    qualification: 'Degree / B.Tech / Diploma',
    priorityRequirement: 'Photoshop, Illustrator, Canva, Video Editing Priority',
    genderNeeded: 'Male/Female',
    department: 'Creative & Digital Media',
    description: 'Create high-impact social media posters, promotional banners, course brochures, YouTube thumbnails, and short reels for admissions marketing.',
  },
];

export const HIRING_OVERVIEW = {
  totalStaff: 95,
  salaryRange: '₹2.5 LPA – ₹3.0 LPA',
  salaryNote: 'Based on experience (Higher salary negotiable for deserving candidates)',
  perks: ['PF (Provident Fund)', 'ESI (Employee State Insurance)', 'Performance Incentives', 'Annual Increments'],
  dressCode: 'Mandatory Professional Dress Code',
  officeTimings: '9:00 AM to 5:30 PM',
  headOfficeAddress: 'Rachakonda Solutions, Prashantha Complex 2nd & 3rd Floor, Above LIC Office, Beside Gajwel Bus Stand Main Road, Gajwel, Telangana — 502278',
  contactNumbers: ['+91 9640333313', '08454315303'],
  hrEmail: 'hr@rachakondasolutions.com',
  interviewDateStatus: 'Interview Dates Announcing Very Soon (Walk-in & Shortlisted Call)',
};
