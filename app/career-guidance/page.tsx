'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FlaskConical,
  Leaf,
  Code2,
  Pill,
  BrainCircuit,
  Landmark,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Newspaper,
  ArrowRight,
  CalendarDays,
  Phone,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const roadmaps = [
  {
    icon: <FlaskConical className="h-8 w-8" />,
    title: 'Biotechnology',
    desc: 'From B.Tech Biotech to research & pharma careers — mapped for TS/AP students.',
    href: '/career-guidance/articles/biotechnology-roadmap',
    iconBg: 'bg-teal-50 text-teal-600',
    border: 'border-teal-100',
    badge: 'Science',
  },
  {
    icon: <Leaf className="h-8 w-8" />,
    title: 'Agriculture',
    desc: 'B.Sc Ag, ICAR entrance, agri-business and government extension officer paths.',
    href: '/career-guidance/articles/agriculture-roadmap',
    iconBg: 'bg-green-50 text-green-600',
    border: 'border-green-100',
    badge: 'Science',
  },
  {
    icon: <Code2 className="h-8 w-8" />,
    title: 'Computer Science',
    desc: 'Software engineering, GATE/CAT, product management and startup paths post-B.Tech.',
    href: '/career-guidance/articles/computer-science-roadmap',
    iconBg: 'bg-blue-50 text-blue-600',
    border: 'border-blue-100',
    badge: 'Engineering',
  },
  {
    icon: <Pill className="h-8 w-8" />,
    title: 'Pharmacy',
    desc: 'D.Pharm, B.Pharm via TS/AP EAMCET, M.Pharm and regulatory affairs careers.',
    href: '/career-guidance/articles/pharmacy-roadmap',
    iconBg: 'bg-purple-50 text-purple-600',
    border: 'border-purple-100',
    badge: 'Health',
  },
  {
    icon: <BrainCircuit className="h-8 w-8" />,
    title: 'AI & Data Science',
    desc: 'ML, data engineering, and AI product roles — skill-first roadmap from any degree.',
    href: '/career-guidance/articles/ai-data-science-roadmap',
    iconBg: 'bg-indigo-50 text-indigo-600',
    border: 'border-indigo-100',
    badge: 'Tech',
  },
  {
    icon: <Landmark className="h-8 w-8" />,
    title: 'Government Careers',
    desc: 'TSPSC, APPSC, Group 1 & 2, DSC, TET — complete preparation roadmap.',
    href: '/career-guidance/articles/government-careers-roadmap',
    iconBg: 'bg-amber-50 text-amber-600',
    border: 'border-amber-100',
    badge: 'Govt Jobs',
  },
];

const stages = [
  {
    icon: <BookOpen className="h-7 w-7" />,
    title: 'After 10th Class',
    desc: 'MPC, BiPC, CEC or HEC? Choose the right Intermediate stream.',
    href: '/career-guidance/after-10th',
    gradient: 'from-blue-600 to-blue-500',
  },
  {
    icon: <GraduationCap className="h-7 w-7" />,
    title: 'After Intermediate',
    desc: 'Explore engineering, medicine, commerce, law and more after 12th.',
    href: '/career-guidance/after-12th',
    gradient: 'from-teal-500 to-teal-400',
  },
  {
    icon: <ClipboardList className="h-7 w-7" />,
    title: 'UG Programs',
    desc: 'Find the right college and course across TS & AP universities.',
    href: '/career-guidance/undergraduate',
    gradient: 'from-indigo-600 to-indigo-500',
  },
  {
    icon: <Landmark className="h-7 w-7" />,
    title: 'After Graduation',
    desc: 'MBA, M.Tech, MS Abroad, govt jobs — all PG paths explained.',
    href: '/career-guidance/postgraduate',
    gradient: 'from-purple-600 to-purple-500',
  },
];

// TODO: Replace with live CMS/API data for accurate exam dates
const upcomingExams = [
  { name: 'TS EAMCET', body: 'JNTUH', month: 'May 2025', type: 'Engineering / Medicine', state: 'Telangana' },
  { name: 'AP EAMCET', body: 'JNTUA', month: 'May 2025', type: 'Engineering / Medicine', state: 'Andhra Pradesh' },
  { name: 'TS ICET', body: 'Osmania University', month: 'June 2025', type: 'MBA / MCA', state: 'Telangana' },
  { name: 'NEET-UG', body: 'NTA', month: 'May 2025', type: 'Medical', state: 'National' },
  { name: 'GATE', body: 'IIT (Zonal)', month: 'Feb 2025', type: 'PG Engineering', state: 'National' },
];

// TODO: Replace with real article data from CMS
const latestArticles = [
  {
    title: 'After 10th in Telangana: Complete Guide 2025',
    category: 'After 10th',
    readTime: '8 min read',
    excerpt: 'Stream selection, college admissions, and career paths for SSC students in Telangana.',
    href: '/career-guidance/articles/after-10th-telangana-guide-2025',
  },
  {
    title: 'TS EAMCET 2025: Complete Preparation Guide',
    category: 'Entrance Exams',
    readTime: '10 min read',
    excerpt: 'Eligibility, syllabus, preparation strategy, and top colleges to target in Telangana.',
    href: '/career-guidance/articles/ts-eamcet-2025-guide',
  },
  {
    title: 'TSPSC Group 2 Preparation Strategy',
    category: 'Government Jobs',
    readTime: '12 min read',
    excerpt: 'Structured study plan, recommended books, and mock test strategy to crack Group 2.',
    href: '/career-guidance/articles/tspsc-group-2-strategy',
  },
];

function SectionTag({ label }: { label: string }) {
  return (
    <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
      {label}
    </span>
  );
}

export default function CareerGuidanceHub() {
  return (
    <main className="min-h-screen bg-white font-sans">

      {/* Hero */}
      <section className="relative bg-blue-600 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-slate-900" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-24 md:py-32 text-center">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-block text-xs font-semibold tracking-widest uppercase text-teal-300 bg-white/10 px-4 py-1.5 rounded-full mb-5"
          >
            100% Free Guidance
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-5"
          >
            Career Guidance for{' '}
            <span className="text-teal-300">TS &amp; AP Students</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10"
          >
            Expert roadmaps, entrance exam guides, and honest college advice —
            completely free for students in Telangana and Andhra Pradesh.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/career-guidance/after-10th"
              className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-lg"
            >
              Explore Roadmaps
            </Link>
            <Link
              href="/career-guidance/entrance-exams"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3 rounded-xl transition-colors backdrop-blur-sm"
            >
              Exam Calendar
            </Link>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 20C1200 55 960 0 720 25C480 50 240 5 0 30Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Featured Roadmaps */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div className="text-center mb-10">
            <SectionTag label="Career Roadmaps" />
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Explore by Field</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Detailed career paths tailored for students from Telangana and Andhra Pradesh — from entrance exams to first job.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {roadmaps.map((rm) => (
            <motion.div key={rm.title} variants={fadeUp}>
              <Link
                href={rm.href}
                className={`group flex flex-col h-full border ${rm.border} rounded-2xl p-6 bg-white transition-all hover:-translate-y-1 hover:shadow-md`}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 ${rm.iconBg}`}>
                  {rm.icon}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">{rm.badge}</span>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {rm.title}
                </h3>
                <p className="text-slate-500 text-sm flex-1">{rm.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-blue-600 text-sm font-semibold group-hover:gap-2 transition-all">
                  View Roadmap <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Browse by Stage */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="text-center mb-10">
              <SectionTag label="By Stage" />
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Browse by Your Current Stage</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                No matter where you are in your education journey, we have the right guidance.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {stages.map((s) => (
              <motion.div key={s.title} variants={fadeUp}>
                <Link
                  href={s.href}
                  className="group flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                >
                  <div className={`bg-gradient-to-br ${s.gradient} p-6 text-white flex items-center justify-center`}>
                    {s.icon}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-slate-500 text-sm flex-1">{s.desc}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-blue-600 text-sm font-semibold">
                      Explore <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Exam Calendar Preview */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <SectionTag label="Entrance Exams" />
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Upcoming Exam Calendar</h2>
              <p className="text-slate-500 mt-1 text-sm">Key exams for TS, AP and national-level tests.</p>
            </div>
            <Link
              href="/career-guidance/entrance-exams"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Full Calendar <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  {['Exam', 'Conducting Body', 'Type', 'Month', 'State'].map((h) => (
                    <th key={h} className="text-left px-5 py-4 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {upcomingExams.map((exam, i) => (
                  <tr key={exam.name} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-5 py-4 font-semibold text-slate-900">{exam.name}</td>
                    <td className="px-5 py-4 text-slate-500">{exam.body}</td>
                    <td className="px-5 py-4 text-slate-600">{exam.type}</td>
                    <td className="px-5 py-4">
                      {/* TODO: replace with live CMS date */}
                      <span className="inline-flex items-center gap-1 text-teal-700 bg-teal-50 border border-teal-100 text-xs font-medium px-2 py-1 rounded-full">
                        <CalendarDays className="h-3 w-3" /> {exam.month}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{exam.state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* Latest Articles */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div>
                <SectionTag label="Articles" />
                <h2 className="text-3xl font-bold text-slate-900 mt-2">Latest Guidance Articles</h2>
              </div>
              <Link
                href="/career-guidance/articles"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors"
              >
                All Articles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {latestArticles.map((a) => (
              <motion.div key={a.title} variants={fadeUp}>
                <Link
                  href={a.href}
                  className="group flex flex-col h-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                >
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full mb-3 self-start">
                    {a.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                    {a.title}
                  </h3>
                  <p className="text-slate-500 text-sm flex-1">{a.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <Newspaper className="h-3.5 w-3.5" /> {a.readTime}
                    </span>
                    <span className="text-blue-600 text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
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
            Not Sure Which Path Is Right for You?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Book a free 30-minute counseling call with our career experts. No cost, no obligation — just honest guidance.
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
