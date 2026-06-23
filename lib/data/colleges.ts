export interface Course {
  name: string;
  duration: string;
  fees: string;
  eligibility: string;
}

export interface College {
  id: string;
  slug: string;
  name: string;
  location: string;
  state: 'TS' | 'AP';
  category: string;
  established: string;
  accreditation: string[];
  description: string;
  imageUrl: string;
  courses: Course[];
  placementHighlights: string[];
  topRecruiters: string[];
}

export const collegesData: College[] = [
  {
    id: 'c1',
    slug: 'jntuh-hyderabad',
    name: 'Jawaharlal Nehru Technological University Hyderabad (JNTUH)',
    location: 'Kukatpally, Hyderabad',
    state: 'TS',
    category: 'Engineering',
    established: '1972',
    accreditation: ['NAAC A Grade', 'NBA', 'UGC'],
    description: 'JNTUH is one of the premier engineering universities in India, offering top-tier B.Tech, M.Tech, and PhD programs with excellent placement records and state-of-the-art research facilities.',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1920',
    courses: [
      { name: 'B.Tech in Computer Science & Engineering', duration: '4 Years', fees: '₹50,000 / year (Govt Quota)', eligibility: 'TS EAMCET / JEE Main' },
      { name: 'B.Tech in Artificial Intelligence', duration: '4 Years', fees: '₹50,000 / year', eligibility: 'TS EAMCET' },
      { name: 'M.Tech in Software Engineering', duration: '2 Years', fees: '₹30,000 / year', eligibility: 'GATE / TS PGECET' }
    ],
    placementHighlights: ['Highest Package: 44 LPA', 'Average Package: 6.5 LPA', '95% Placement Rate for CS/IT'],
    topRecruiters: ['TCS', 'Infosys', 'Wipro', 'Amazon', 'Microsoft', 'Cognizant']
  },
  {
    id: 'c2',
    slug: 'osmania-university',
    name: 'Osmania University (OU)',
    location: 'Tarnaka, Hyderabad',
    state: 'TS',
    category: 'University',
    established: '1918',
    accreditation: ['NAAC A+ Grade', 'UGC'],
    description: 'Osmania University is the seventh oldest in India, known for its sprawling campus and comprehensive programs across Arts, Sciences, Engineering, and Commerce.',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1920',
    courses: [
      { name: 'B.E. in Electronics & Communication', duration: '4 Years', fees: '₹35,000 / year', eligibility: 'TS EAMCET' },
      { name: 'MBA', duration: '2 Years', fees: '₹50,000 / year', eligibility: 'TS ICET' },
      { name: 'B.Sc (Physical Sciences)', duration: '3 Years', fees: '₹15,000 / year', eligibility: 'DOST Admission' }
    ],
    placementHighlights: ['Highest Package: 24 LPA', 'Average Package: 5 LPA', 'Strong Alumni Network'],
    topRecruiters: ['Tech Mahindra', 'Accenture', 'Deloitte', 'HDFC Bank']
  },
  {
    id: 'c3',
    slug: 'andhra-university',
    name: 'Andhra University',
    location: 'Visakhapatnam',
    state: 'AP',
    category: 'University',
    established: '1926',
    accreditation: ['NAAC A Grade', 'UGC'],
    description: 'Andhra University is not just one of the oldest educational institutions in the country, but is also the first to be conceived as a residential and teaching-cum-affiliating University.',
    imageUrl: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&q=80&w=1920',
    courses: [
      { name: 'B.Tech in Mechanical Engineering', duration: '4 Years', fees: '₹40,000 / year', eligibility: 'AP EAMCET' },
      { name: 'B.Pharmacy', duration: '4 Years', fees: '₹45,000 / year', eligibility: 'AP EAMCET' },
      { name: 'B.A. LL.B. (Hons)', duration: '5 Years', fees: '₹25,000 / year', eligibility: 'AP LAWCET' }
    ],
    placementHighlights: ['Highest Package: 18 LPA', 'Average Package: 4.5 LPA', '85% Placements'],
    topRecruiters: ['L&T', 'TCS', 'Wipro', 'Dr. Reddy\'s Labs']
  },
  {
    id: 'c4',
    slug: 'gandhi-medical-college',
    name: 'Gandhi Medical College',
    location: 'Secunderabad',
    state: 'TS',
    category: 'Medical',
    established: '1954',
    accreditation: ['NMC', 'KNRUHS'],
    description: 'One of the most prestigious medical colleges in Telangana, affiliated to KNRUHS, providing excellent clinical exposure via Gandhi Hospital.',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1920',
    courses: [
      { name: 'MBBS', duration: '5.5 Years', fees: '₹25,000 / year (Govt)', eligibility: 'NEET UG' },
      { name: 'MD General Medicine', duration: '3 Years', fees: '₹30,000 / year', eligibility: 'NEET PG' }
    ],
    placementHighlights: ['100% Internship Placement', 'High success rate in NEET PG'],
    topRecruiters: ['Government Hospitals', 'Apollo', 'Yashoda Hospitals']
  }
];

export function getCollegeBySlug(slug: string): College | undefined {
  return collegesData.find(c => c.slug === slug);
}
