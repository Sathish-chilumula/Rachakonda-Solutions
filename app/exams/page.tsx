'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Briefcase, Globe, GraduationCap, ArrowRight,
  Phone, Calendar, AlertCircle, CheckCircle, Filter,
  Star, Users, Clock, ChevronRight, Building2, Award
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };

type ExamType = 'All' | 'State Entrance' | 'Government Jobs' | 'National' | 'Teaching';

interface Exam {
  name: string;
  body: string;
  eligibility: string;
  frequency: string;
  approxDate: string;
  type: ExamType;
  state: string;
  color: string;
}

const exams: Exam[] = [
  // State Entrance
  { name: 'TS EAMCET', body: 'JNTU Hyderabad', eligibility: 'Intermediate MPC / BiPC (TS)', frequency: 'Annual', approxDate: 'May (TODO: Official date)', type: 'State Entrance', state: 'TS', color: 'blue' },
  { name: 'AP EAMCET', body: 'APSCHE', eligibility: 'Intermediate MPC / BiPC (AP)', frequency: 'Annual', approxDate: 'May (TODO: Official date)', type: 'State Entrance', state: 'AP', color: 'teal' },
  { name: 'TS ECET', body: 'JNTU Hyderabad', eligibility: 'Diploma / B.Sc Math (TS)', frequency: 'Annual', approxDate: 'June (TODO: Official date)', type: 'State Entrance', state: 'TS', color: 'blue' },
  { name: 'AP ECET', body: 'APSCHE', eligibility: 'Diploma / B.Sc Math (AP)', frequency: 'Annual', approxDate: 'June (TODO: Official date)', type: 'State Entrance', state: 'AP', color: 'teal' },
  { name: 'ICET (TS)', body: 'Osmania University', eligibility: 'Any Degree (TS) for MBA/MCA', frequency: 'Annual', approxDate: 'May (TODO: Official date)', type: 'State Entrance', state: 'TS', color: 'blue' },
  { name: 'ICET (AP)', body: 'Andhra University', eligibility: 'Any Degree (AP) for MBA/MCA', frequency: 'Annual', approxDate: 'May (TODO: Official date)', type: 'State Entrance', state: 'AP', color: 'teal' },
  { name: 'POLYCET (TS)', body: 'SBTET Telangana', eligibility: '10th Pass (TS) — Polytechnic admissions', frequency: 'Annual', approxDate: 'April (TODO: Official date)', type: 'State Entrance', state: 'TS', color: 'blue' },
  { name: 'POLYCET (AP)', body: 'SBTET AP', eligibility: '10th Pass (AP) — Polytechnic admissions', frequency: 'Annual', approxDate: 'April (TODO: Official date)', type: 'State Entrance', state: 'AP', color: 'teal' },
  // Government Jobs
  { name: 'TSPSC Group 1', body: 'Telangana State PSC', eligibility: 'Any Degree (TS domicile)', frequency: 'Irregular', approxDate: 'TODO: Check TSPSC website', type: 'Government Jobs', state: 'TS', color: 'blue' },
  { name: 'TSPSC Group 2', body: 'Telangana State PSC', eligibility: 'Any Degree (TS domicile)', frequency: 'Irregular', approxDate: 'TODO: Check TSPSC website', type: 'Government Jobs', state: 'TS', color: 'blue' },
  { name: 'TSPSC Group 3', body: 'Telangana State PSC', eligibility: 'Intermediate / Degree (TS)', frequency: 'Irregular', approxDate: 'TODO: Check TSPSC website', type: 'Government Jobs', state: 'TS', color: 'blue' },
  { name: 'TSPSC Group 4', body: 'Telangana State PSC', eligibility: '10th Pass / Intermediate (TS)', frequency: 'Irregular', approxDate: 'TODO: Check TSPSC website', type: 'Government Jobs', state: 'TS', color: 'blue' },
  { name: 'APPSC Group 1', body: 'Andhra Pradesh PSC', eligibility: 'Any Degree (AP domicile)', frequency: 'Irregular', approxDate: 'TODO: Check APPSC website', type: 'Government Jobs', state: 'AP', color: 'teal' },
  { name: 'APPSC Group 2', body: 'Andhra Pradesh PSC', eligibility: 'Any Degree (AP domicile)', frequency: 'Irregular', approxDate: 'TODO: Check APPSC website', type: 'Government Jobs', state: 'AP', color: 'teal' },
  { name: 'SSC CGL', body: 'Staff Selection Commission', eligibility: 'Any Degree', frequency: 'Annual', approxDate: 'TODO: Check SSC website', type: 'Government Jobs', state: 'National', color: 'slate' },
  // National
  { name: 'NEET UG', body: 'NTA', eligibility: 'Intermediate BiPC', frequency: 'Annual', approxDate: 'May (TODO: Official date)', type: 'National', state: 'National', color: 'purple' },
  { name: 'JEE Main', body: 'NTA', eligibility: 'Intermediate MPC', frequency: 'Jan & Apr', approxDate: 'January & April (TODO)', type: 'National', state: 'National', color: 'purple' },
  { name: 'GATE', body: 'IITs (rotating)', eligibility: 'B.Tech / B.Sc (Engg)', frequency: 'Annual', approxDate: 'February (TODO: Official date)', type: 'National', state: 'National', color: 'purple' },
  { name: 'CAT', body: 'IIM (rotating)', eligibility: 'Any Degree', frequency: 'Annual', approxDate: 'November (TODO: Official date)', type: 'National', state: 'National', color: 'purple' },
  { name: 'CLAT', body: 'NLU Consortium', eligibility: 'Intermediate / Degree', frequency: 'Annual', approxDate: 'December (TODO: Official date)', type: 'National', state: 'National', color: 'purple' },
  { name: 'UPSC Civil Services', body: 'UPSC', eligibility: 'Any Degree', frequency: 'Annual', approxDate: 'Prelims: May–June (TODO)', type: 'National', state: 'National', color: 'purple' },
  // Teaching
  { name: 'TS TET', body: 'TSTET Board', eligibility: 'Degree + B.Ed / D.El.Ed (TS)', frequency: 'Annual', approxDate: 'TODO: Check TS TET notification', type: 'Teaching', state: 'TS', color: 'amber' },
  { name: 'AP TET', body: 'APTET Board', eligibility: 'Degree + B.Ed / D.El.Ed (AP)', frequency: 'Annual', approxDate: 'TODO: Check AP TET notification', type: 'Teaching', state: 'AP', color: 'amber' },
  { name: 'TS DSC', body: 'Dept. of Education (TS)', eligibility: 'TET qualified candidates', frequency: 'Irregular', approxDate: 'TODO: Check TS DSC notification', type: 'Teaching', state: 'TS', color: 'amber' },
];

const typeColors: Record<string, string> = {
  'State Entrance': 'bg-blue-100 text-blue-700',
  'Government Jobs': 'bg-green-100 text-green-700',
  'National': 'bg-purple-100 text-purple-700',
  'Teaching': 'bg-amber-100 text-amber-700',
};

const stateColors: Record<string, string> = {
  TS: 'bg-blue-50 border-blue-200',
  AP: 'bg-teal-50 border-teal-200',
  National: 'bg-purple-50 border-purple-200',
};

const examTypes: ExamType[] = ['All', 'State Entrance', 'Government Jobs', 'National', 'Teaching'];

const upcomingExams = [
  // TODO: Replace with real dates from official notification sources
  { exam: 'TS EAMCET 2025', date: 'TODO', status: 'Upcoming', state: 'TS' },
  { exam: 'AP EAMCET 2025', date: 'TODO', status: 'Upcoming', state: 'AP' },
  { exam: 'NEET UG 2025', date: 'TODO', status: 'Upcoming', state: 'National' },
  { exam: 'POLYCET TS 2025', date: 'TODO', status: 'Upcoming', state: 'TS' },
  { exam: 'TS TET 2025', date: 'TODO', status: 'Upcoming', state: 'TS' },
  { exam: 'TSPSC Group 2', date: 'TODO', status: 'Upcoming', state: 'TS' },
];

export default function ExamsPage() {
  const [activeType, setActiveType] = useState<ExamType>('All');

  const filtered = activeType === 'All' ? exams : exams.filter(e => e.type === activeType);

  return (
    <main className="min-h-screen bg-white font-sans">
      {/* ── Hero ── */}
      <section className="bg-blue-600 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex justify-center gap-3 mb-6">
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">TS & AP</span>
              <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full">All Exams Guide</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Entrance & Competitive Exams
            </motion.h1>
            <motion.p variants={fadeUp} className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Complete guide to all major entrance exams and government job exams for Telangana & Andhra Pradesh students — TS EAMCET, AP EAMCET, TSPSC, TET, NEET, JEE & more.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              <Link href="#exams" className="bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold px-6 py-3 rounded-xl transition-all">
                Browse All Exams ↓
              </Link>
              <Link href="/contact" className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl border border-white/30 transition-all">
                Free Counseling Call
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Filter Tabs ── */}
      <section className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3 items-center">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            {examTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
                  activeType === type
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
            <span className="text-xs text-slate-400 ml-auto">{filtered.length} exams</span>
          </div>
        </div>
      </section>

      {/* ── Exam Cards ── */}
      <section id="exams" className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            key={activeType}
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filtered.map((exam, i) => (
              <motion.div
                key={exam.name}
                variants={fadeUp}
                className={`bg-white rounded-2xl border ${stateColors[exam.state] || 'border-slate-200 bg-white'} shadow-sm p-5 hover:shadow-md transition-all`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${typeColors[exam.type]}`}>
                    {exam.type}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${exam.state === 'TS' ? 'bg-blue-100 text-blue-700' : exam.state === 'AP' ? 'bg-teal-100 text-teal-700' : 'bg-purple-100 text-purple-700'}`}>
                    {exam.state}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-xl mb-1">{exam.name}</h3>
                <p className="text-xs text-slate-500 mb-4">Conducted by: {exam.body}</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-slate-600">{exam.eligibility}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="text-xs text-slate-600">{exam.frequency}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-xs text-amber-600 font-medium">{exam.approxDate}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Upcoming Exams Timeline ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Stay Updated</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Upcoming Exam Calendar</h2>
              <p className="text-amber-600 text-sm mt-2 font-medium">
                {/* TODO: Integrate with official TS/AP notification RSS feeds for real-time dates */}
                ⚠️ Dates are indicative — always verify with official websites before applying
              </p>
            </motion.div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold">Exam Name</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold">Expected Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold">State</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {upcomingExams.map((e, i) => (
                    <motion.tr key={i} variants={fadeUp} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-800 text-sm">{e.exam}</td>
                      <td className="py-4 px-6 text-slate-500 text-sm italic">{e.date}</td>
                      <td className="py-4 px-6">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${e.state === 'TS' ? 'bg-blue-100 text-blue-700' : e.state === 'AP' ? 'bg-teal-100 text-teal-700' : 'bg-purple-100 text-purple-700'}`}>
                          {e.state}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-1 rounded-full">{e.status}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-teal-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
              <Phone className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4">Need Exam Preparation Guidance?</motion.h2>
            <motion.p variants={fadeUp} className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Our counselors help TS/AP students choose the right exams and prepare a winning strategy. Free consultation.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/contact" className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg">
                Book a Free Counseling Call <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
