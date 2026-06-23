export interface ExamDate {
  event: string;
  date: string;
}

export interface Exam {
  id: string;
  slug: string;
  name: string;
  fullName: string;
  conductingBody: string;
  level: 'State' | 'National';
  category: string;
  mode: string;
  frequency: string;
  description: string;
  eligibility: string;
  pattern: string[];
  dates: ExamDate[];
  officialWebsite: string;
}

export const examsData: Exam[] = [
  {
    id: 'e1',
    slug: 'ts-eamcet',
    name: 'TS EAMCET',
    fullName: 'Telangana State Engineering, Agriculture & Medical Common Entrance Test',
    conductingBody: 'JNTU Hyderabad on behalf of TSCHE',
    level: 'State',
    category: 'Engineering & Medical',
    mode: 'Computer Based Test (CBT)',
    frequency: 'Once a year',
    description: 'TS EAMCET is a state-level entrance exam for admission to Engineering, Agriculture, and Medical (Pharmacy, Veterinary etc.) courses offered by various colleges in Telangana.',
    eligibility: 'Candidates must have passed or appeared for the final year of Intermediate Examination (10+2 pattern) with Mathematics, Physics, and Chemistry/Biology as optional or related vocational courses.',
    pattern: [
      'Total Questions: 160 (Objective Type)',
      'Duration: 180 Minutes',
      'Mathematics/Biology: 80 Marks',
      'Physics: 40 Marks',
      'Chemistry: 40 Marks',
      'No Negative Marking'
    ],
    dates: [
      { event: 'Notification Release', date: 'February 2025' },
      { event: 'Application Start', date: 'March 2025' },
      { event: 'Exam Dates (Engineering)', date: 'May 2025' },
      { event: 'Exam Dates (Agriculture/Medical)', date: 'May 2025' }
    ],
    officialWebsite: 'https://eamcet.tsche.ac.in/'
  },
  {
    id: 'e2',
    slug: 'ap-eamcet',
    name: 'AP EAPCET (EAMCET)',
    fullName: 'Andhra Pradesh Engineering, Agriculture and Pharmacy Common Entrance Test',
    conductingBody: 'JNTU Anantapur on behalf of APSCHE',
    level: 'State',
    category: 'Engineering & Pharmacy',
    mode: 'Computer Based Test (CBT)',
    frequency: 'Once a year',
    description: 'AP EAPCET is conducted for admission into various professional courses offered in University/Private Colleges in the state of Andhra Pradesh.',
    eligibility: 'Passed or appearing in 10+2 with MPC/BiPC from Board of Intermediate Education, AP or equivalent.',
    pattern: [
      'Total Questions: 160 (Multiple Choice)',
      'Duration: 3 Hours',
      'Maths/Botany+Zoology: 80 Marks',
      'Physics: 40 Marks',
      'Chemistry: 40 Marks'
    ],
    dates: [
      { event: 'Notification Release', date: 'March 2025' },
      { event: 'Exam Dates', date: 'May 2025' }
    ],
    officialWebsite: 'https://cets.apsche.ap.gov.in/EAPCET'
  },
  {
    id: 'e3',
    slug: 'tspsc-group-2',
    name: 'TSPSC Group 2',
    fullName: 'Telangana State Public Service Commission Group-II Services',
    conductingBody: 'TSPSC',
    level: 'State',
    category: 'Government Jobs',
    mode: 'OMR Based / CBT',
    frequency: 'As per notification',
    description: 'TSPSC Group 2 is a highly competitive exam for executive and non-executive posts in the Telangana State Government, such as Deputy Tahsildar, Sub-Registrar, and Municipal Commissioner.',
    eligibility: 'A Bachelor\'s Degree from any recognized University in India. Age typically 18-44 years (relaxations apply).',
    pattern: [
      'Paper I: General Studies and General Abilities (150 Marks)',
      'Paper II: History, Polity and Society (150 Marks)',
      'Paper III: Economy and Development (150 Marks)',
      'Paper IV: Telangana Movement and State Formation (150 Marks)'
    ],
    dates: [
      { event: 'Notification', date: 'Announced' },
      { event: 'Exam Date', date: 'TBD' }
    ],
    officialWebsite: 'https://www.tspsc.gov.in/'
  }
];

export function getExamBySlug(slug: string): Exam | undefined {
  return examsData.find(e => e.slug === slug);
}
