'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  Phone,
  ChevronRight,
  CheckCircle2,
  School,
  Building2,
  University,
  BookOpen,
  Cpu,
  Languages,
  Database,
  Trophy,
  MapPin,
  Wallet,
  Star,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

// ─── 5 Factors ───────────────────────────────────────────────────────────────
const factors = [
  {
    icon: <Star className="h-6 w-6" />,
    title: 'Your Interest & Aptitude',
    desc: 'Choose a field you genuinely enjoy. Passion sustains effort over 3–4 years of study. Take aptitude tests or speak to professionals in the field before deciding.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: <Trophy className="h-6 w-6" />,
    title: 'Career Scope & Job Market',
    desc: 'Research job market trends for the next 5–10 years. Tech, healthcare, and government sectors show strong demand in Telangana and AP.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: <School className="h-6 w-6" />,
    title: 'College Quality & Accreditation',
    desc: 'Check NAAC grades, NBA accreditation, placement records, and faculty quality. An autonomous or A-grade college adds significant value to your degree.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: <Wallet className="h-6 w-6" />,
    title: 'Fee & Scholarship Availability',
    desc: 'Government colleges in TS/AP offer highly subsidized fees. Check for SC/ST/OBC scholarships, PMSS, and state welfare scholarships that cover full tuition.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: 'Location & Campus Life',
    desc: 'Consider proximity to home, hostel facilities, campus safety, and alumni network. Hyderabad, Vijayawada, and Visakhapatnam are major education hubs.',
    color: 'bg-indigo-50 text-indigo-600',
  },
];

// ─── College types ────────────────────────────────────────────────────────────
const collegeTypes = [
  {
    icon: <University className="h-7 w-7" />,
    name: 'Autonomous Colleges',
    desc: 'Design their own syllabus and conduct their own exams. Often updated with industry trends. Examples: Osmania, St. Francis, Vignan in TS/AP.',
    pros: ['Industry-aligned syllabus', 'Internal assessment flexibility', 'Strong alumni networks'],
    color: 'border-blue-200 bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: <School className="h-7 w-7" />,
    name: 'Affiliated Colleges',
    desc: 'Follow the parent university syllabus (JNTUH, JNTUA, OU, AU, etc.). Large number of seats and widely accessible across TS/AP districts.',
    pros: ['Wide availability', 'Standardized syllabus', 'Lower fees generally'],
    color: 'border-teal-200 bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    icon: <Building2 className="h-7 w-7" />,
    name: 'Deemed Universities',
    desc: 'Operate independently with UGC approval. Examples: BITS Pilani (Hyderabad), GITAM, Amrita, KL University, SRM, VIT in AP/TS region.',
    pros: ['Flexible programs', 'Strong placements', 'Research opportunities'],
    color: 'border-purple-200 bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    icon: <BookOpen className="h-7 w-7" />,
    name: 'Central Universities',
    desc: 'UoH (University of Hyderabad), EFLU, NALSAR. Highest academic quality, merit-based admission, strong research culture.',
    pros: ['Prestigious degrees', 'Merit-based fair admissions', 'Excellent faculty'],
    color: 'border-amber-200 bg-amber-50',
    iconColor: 'text-amber-600',
  },
];

// ─── Course Finder ───────────────────────────────────────────────────────────
const courseFinderData: Record<string, Record<string, string[]>> = {
  mpc: {
    'technology': ['B.Tech Computer Science', 'B.Tech AI & Data Science', 'B.Tech Electronics', 'B.Sc Computer Science'],
    'mathematics': ['B.Sc Mathematics (Hons)', 'B.Sc Statistics', 'B.Sc Data Science'],
    'design': ['B.Arch (Architecture)', 'B.Des (Design — CEPT)', 'B.Tech Civil Engineering'],
    'research': ['B.Sc Physics', 'B.Sc Chemistry', 'Integrated M.Sc (IIT/NIT)'],
  },
  bipc: {
    'medicine': ['MBBS', 'BDS', 'BAMS (Ayurveda)', 'BHMS (Homeopathy)'],
    'pharmacy': ['B.Pharm', 'D.Pharm', 'PharmD'],
    'agriculture': ['B.Sc Agriculture', 'B.Sc Horticulture', 'B.F.Sc (Fisheries)'],
    'research': ['B.Sc Biotechnology', 'B.Sc Microbiology', 'B.Sc Zoology / Botany'],
  },
  cec: {
    'finance': ['B.Com (Hons)', 'BBA Finance', 'CA Foundation', 'CS Foundation'],
    'law': ['BA-LLB (5yr integrated)', 'BBA-LLB', 'B.Com + LLB'],
    'management': ['BBA', 'B.Com (Business Management)', 'Diploma in Hotel Management'],
    'government': ['B.Com + UPSC prep', 'Economics (Hons)', 'BA Economics'],
  },
  hec: {
    'civil_services': ['BA Political Science', 'BA History', 'BA Public Administration'],
    'law': ['BA-LLB', 'BA Criminology', 'Political Science + CLAT'],
    'media': ['BJMC (Journalism)', 'BA Mass Communication', 'BA English Literature'],
    'social_work': ['BSW (Social Work)', 'BA Sociology', 'BA Psychology'],
  },
};

const streamLabels: Record<string, string> = { mpc: 'MPC', bipc: 'BiPC', cec: 'CEC', hec: 'HEC' };
const interestLabels: Record<string, Record<string, string>> = {
  mpc: { technology: 'Technology & Coding', mathematics: 'Mathematics & Statistics', design: 'Design & Architecture', research: 'Research & Pure Science' },
  bipc: { medicine: 'Medicine & Healthcare', pharmacy: 'Pharmacy & Drug Research', agriculture: 'Agriculture & Food Science', research: 'Life Science Research' },
  cec: { finance: 'Finance & Accounting', law: 'Law & Legal Services', management: 'Business Management', government: 'Government & Economics' },
  hec: { civil_services: 'Civil Services & Governance', law: 'Law & Advocacy', media: 'Media & Journalism', social_work: 'Social Work & NGO' },
};

// ─── Rachakonda Courses ───────────────────────────────────────────────────────
const rachakondaCourses = [
  {
    icon: <Cpu className="h-6 w-6" />,
    title: 'Full Stack Web Development',
    desc: 'Learn React, Node.js, and databases. Build job-ready projects while in college.',
    href: '/education',
    tag: 'Tech',
    color: 'bg-blue-50 border-blue-100 text-blue-600',
  },
  {
    icon: <Database className="h-6 w-6" />,
    title: 'Data Science & AI',
    desc: 'Python, ML, and data analytics — high-demand skills for any graduate.',
    href: '/education',
    tag: 'Tech',
    color: 'bg-teal-50 border-teal-100 text-teal-600',
  },
  {
    icon: <Languages className="h-6 w-6" />,
    title: 'Spoken English & Communication',
    desc: 'Improve fluency, confidence, and interview readiness during your UG years.',
    href: '/education',
    tag: 'Soft Skills',
    color: 'bg-purple-50 border-purple-100 text-purple-600',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UndergraduatePage() {
  const [selectedStream, setSelectedStream] = useState<string>('mpc');
  const [selectedInterest, setSelectedInterest] = useState<string>('');

  const interestsForStream = interestLabels[selectedStream] ?? {};
  const recommendations =
    selectedInterest && courseFinderData[selectedStream]?.[selectedInterest]
      ? courseFinderData[selectedStream][selectedInterest]
      : [];

  return (
    <main className="min-h-screen bg-white font-sans">

      {/* Hero */}
      <section className="relative bg-blue-600 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-slate-900" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-24 md:py-28 text-center">
          <motion.nav
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex justify-center items-center gap-2 text-blue-200 text-sm mb-6"
          >
            <Link href="/career-guidance" className="hover:text-white transition-colors">Career Guidance</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white font-medium">Undergraduate Programs</span>
          </motion.nav>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5"
          >
            Choosing Your{' '}
            <span className="text-teal-300">Undergraduate Program</span>
            {' '}in TS &amp; AP
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2 }}
            className="text-blue-100 text-lg max-w-2xl mx-auto"
          >
            From B.Tech to B.Com to MBBS — how to pick the right degree, the right college,
            and build skills that actually get you hired.
          </motion.p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 20C1200 55 960 0 720 25C480 50 240 5 0 30Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* 5 Factors */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
              Decision Framework
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">5 Factors for Choosing a UG Program</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Don&apos;t just follow the crowd. Evaluate every UG choice against these five dimensions.
            </p>
          </div>
        </motion.div>
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {factors.map((f, i) => (
            <motion.div key={f.title} variants={fadeUp} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${f.color}`}>
                {f.icon}
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Factor {i + 1}</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* College Types */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="text-center mb-12">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
                College Types
              </span>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Types of Colleges in TS &amp; AP</h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                Understanding the structure of higher education institutions helps you make a smarter choice.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {collegeTypes.map((ct) => (
              <motion.div key={ct.name} variants={fadeUp} className={`border rounded-2xl p-6 shadow-sm ${ct.color}`}>
                <div className={`inline-flex items-center gap-3 mb-3 ${ct.iconColor}`}>
                  {ct.icon}
                  <h3 className="text-xl font-bold text-slate-900">{ct.name}</h3>
                </div>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">{ct.desc}</p>
                <ul className="space-y-1.5">
                  {ct.pros.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-slate-700 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" /> {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Course Finder */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
              Course Finder
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Find the Right UG Program for You</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Select your stream and interest area to see recommended undergraduate programs.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Your Intermediate Stream</label>
                <select
                  value={selectedStream}
                  onChange={(e) => { setSelectedStream(e.target.value); setSelectedInterest(''); }}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  {Object.entries(streamLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Your Interest Area</label>
                <select
                  value={selectedInterest}
                  onChange={(e) => setSelectedInterest(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  <option value="">-- Select an interest --</option>
                  {Object.entries(interestsForStream).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {recommendations.length > 0 ? (
              <motion.div
                key={`${selectedStream}-${selectedInterest}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-6"
              >
                <h3 className="font-bold text-blue-800 mb-4 text-base">
                  Recommended Programs for You:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendations.map((r) => (
                    <div key={r} className="flex items-center gap-2 bg-white border border-blue-100 rounded-xl px-4 py-3 text-slate-700 text-sm font-medium shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" /> {r}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-600 mt-4">
                  {/* TODO: Link to detailed course pages once published */}
                  Book a counseling session for detailed college-wise guidance →
                </p>
              </motion.div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm">
                Select your stream and interest area above to see personalized recommendations.
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Upskilling while in college */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="text-center mb-10">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
                Upskilling
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Build In-Demand Skills While in College</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-sm">
                Rachakonda Solutions offers skill courses that complement your degree and make you job-ready from Day 1.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {rachakondaCourses.map((c) => (
                <Link
                  key={c.title}
                  href={c.href}
                  className={`group flex flex-col border rounded-2xl p-6 hover:shadow-md hover:-translate-y-1 transition-all bg-white ${c.color.split(' ').slice(1).join(' ')}`}
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${c.color}`}>
                    {c.icon}
                  </div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{c.tag}</span>
                  <h4 className="font-bold text-slate-900 text-base mb-2 group-hover:text-blue-600 transition-colors">{c.title}</h4>
                  <p className="text-slate-500 text-sm flex-1">{c.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-blue-600 text-sm font-semibold group-hover:gap-2 transition-all">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-slate-900">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="max-w-2xl mx-auto px-4 text-center"
        >
          <Phone className="h-10 w-10 text-teal-300 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Need Help Choosing a College?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Our counselors compare colleges in TS &amp; AP based on your rank, budget, and career goals — completely free.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold px-10 py-4 rounded-xl shadow-lg transition-colors text-lg"
          >
            Book a Free Counseling Call <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </section>

    </main>
  );
}
