'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search, GraduationCap, Briefcase, BookOpen, Award, ArrowRight,
  ChevronRight, MapPin, Users, Star, TrendingUp, BookMarked,
  FlaskConical, Wheat, Code2, Pill, BrainCircuit, ShieldCheck,
  Building2, FileText, Gift, Bell
} from 'lucide-react';
import { useState } from 'react';

// ─── Data ───────────────────────────────────────────────────────────────────

const quickActions = [
  { label: 'Colleges', href: '/colleges', icon: Building2, color: 'bg-blue-50 text-blue-600 border-blue-100', hover: 'hover:bg-blue-600 hover:text-white hover:border-blue-600' },
  { label: 'Exams', href: '/exams', icon: BookOpen, color: 'bg-teal-50 text-teal-600 border-teal-100', hover: 'hover:bg-teal-600 hover:text-white hover:border-teal-600' },
  { label: 'Govt Jobs', href: '/government-jobs', icon: Briefcase, color: 'bg-amber-50 text-amber-600 border-amber-100', hover: 'hover:bg-amber-500 hover:text-white hover:border-amber-500' },
  { label: 'Scholarships', href: '/scholarships', icon: Gift, color: 'bg-purple-50 text-purple-600 border-purple-100', hover: 'hover:bg-purple-600 hover:text-white hover:border-purple-600' },
  { label: 'Career Guidance', href: '/career-guidance', icon: TrendingUp, color: 'bg-green-50 text-green-600 border-green-100', hover: 'hover:bg-green-600 hover:text-white hover:border-green-600' },
];

const journeyStages = [
  {
    id: 'after-10th',
    label: 'After 10th',
    href: '/after-10th',
    paths: [
      { name: 'Intermediate (MPC/BiPC/CEC/HEC)', icon: BookOpen, color: 'blue', desc: 'The standard path — 2 years, leads to engineering, medicine, commerce degrees.' },
      { name: 'Polytechnic Diploma', icon: GraduationCap, color: 'teal', desc: '3-year diploma in engineering — faster route to technical jobs.' },
      { name: 'ITI Courses', icon: Award, color: 'amber', desc: 'Skill-based trades: electrician, fitter, mechanic. Quick employment.' },
      { name: 'Short-Term Skill Courses', icon: Star, color: 'purple', desc: 'Computer, typing, vocational programs. 3–12 months.' },
    ],
  },
  {
    id: 'after-inter',
    label: 'After Inter',
    href: '/after-inter',
    paths: [
      { name: 'Engineering (TS/AP EAMCET / JEE)', icon: Code2, color: 'blue', desc: 'B.Tech in CS, ECE, Mechanical, Civil and more.' },
      { name: 'Medical & Allied (NEET)', icon: FlaskConical, color: 'teal', desc: 'MBBS, BDS, BAMS, Nursing, Pharmacy via NEET.' },
      { name: 'Commerce & Management', icon: Briefcase, color: 'amber', desc: 'B.Com, BBA, CA Foundation, CS Foundation.' },
      { name: 'Arts, Law & Humanities', icon: BookMarked, color: 'purple', desc: 'BA, Law (CLAT/TS LAWCET), Psychology, Journalism.' },
    ],
  },
  {
    id: 'after-degree',
    label: 'After Degree',
    href: '/after-degree',
    paths: [
      { name: 'Government Jobs (TSPSC/APPSC)', icon: ShieldCheck, color: 'blue', desc: 'Group exams, TET, DSC, Police, Banks, Railways.' },
      { name: 'MBA (ICET/CAT)', icon: TrendingUp, color: 'teal', desc: 'Management programs at top TS/AP B-schools.' },
      { name: 'M.Tech (GATE)', icon: GraduationCap, color: 'amber', desc: 'Postgraduate engineering + PSU jobs through GATE.' },
      { name: 'MS Abroad / Study Abroad', icon: Award, color: 'purple', desc: 'GRE + IELTS/TOEFL for US, UK, Germany, Canada.' },
    ],
  },
  {
    id: 'after-pg',
    label: 'After PG',
    href: '/career-guidance/postgraduate',
    paths: [
      { name: 'Research (PhD / JRF / SRF)', icon: FlaskConical, color: 'blue', desc: 'UGC-NET, CSIR, ICMR fellowships for research careers.' },
      { name: 'Teaching Careers', icon: Users, color: 'teal', desc: 'Professor, lecturer roles through SET/NET/PhD.' },
      { name: 'Government Scientist / Officer', icon: ShieldCheck, color: 'amber', desc: 'DRDO, ISRO, ICAR, IFS and civil services.' },
      { name: 'Entrepreneurship & Startups', icon: TrendingUp, color: 'purple', desc: 'TSIC, APSCHE incubation, angel networks.' },
    ],
  },
];

const popularExams = [
  { name: 'TS EAMCET', body: 'JNTUH', eligibility: 'Intermediate (MPC/BiPC)', state: 'TS', color: 'blue' },
  { name: 'AP EAMCET', body: 'JNTUA', eligibility: 'Intermediate (MPC/BiPC)', state: 'AP', color: 'blue' },
  { name: 'TSPSC Group 2', body: 'TSPSC', eligibility: 'Degree', state: 'TS', color: 'teal' },
  { name: 'APPSC Group 2', body: 'APPSC', eligibility: 'Degree', state: 'AP', color: 'teal' },
  { name: 'POLYCET', body: 'SBTET', eligibility: '10th Pass', state: 'TS/AP', color: 'amber' },
  { name: 'ICET', body: 'TSCHE/APSCHE', eligibility: 'Degree', state: 'TS/AP', color: 'purple' },
  { name: 'NEET-UG', body: 'NTA', eligibility: 'Intermediate (BiPC)', state: 'National', color: 'green' },
  { name: 'GATE', body: 'IIT', eligibility: 'B.Tech / Final Year', state: 'National', color: 'orange' },
  { name: 'SSC CGL', body: 'SSC', eligibility: 'Degree', state: 'National', color: 'red' },
];

const collegeCategories = [
  { name: 'Engineering', icon: Code2, count: '200+ colleges', color: 'blue', href: '/colleges' },
  { name: 'Medical & Pharmacy', icon: Pill, count: '80+ colleges', color: 'teal', href: '/colleges' },
  { name: 'Agriculture', icon: Wheat, count: '40+ colleges', color: 'green', href: '/colleges' },
  { name: 'Arts & Science', icon: BookMarked, count: '500+ colleges', color: 'purple', href: '/colleges' },
];

const careerRoadmaps = [
  { title: 'Computer Science & IT', icon: Code2, desc: 'B.Tech → Full Stack/AI → MNC/Startup', color: 'blue', href: '/career-guidance' },
  { title: 'AI & Data Science', icon: BrainCircuit, desc: 'EAMCET → CS degree → Data roles', color: 'teal', href: '/career-guidance' },
  { title: 'Government Service', icon: ShieldCheck, desc: 'Degree → TSPSC/APPSC → Gazetted Officer', color: 'amber', href: '/career-guidance' },
  { title: 'Agriculture', icon: Wheat, desc: 'BiPC → B.Sc Agri → KVK/ICAR/AO', color: 'green', href: '/career-guidance' },
  { title: 'Pharmacy', icon: Pill, desc: 'BiPC → B.Pharm → Hospital/Industry', color: 'purple', href: '/career-guidance' },
  { title: 'Biotechnology', icon: FlaskConical, desc: 'BiPC → B.Tech Biotech → Research/Industry', color: 'rose', href: '/career-guidance' },
];

const latestNotifications = [
  { type: 'Exam', title: 'TS EAMCET 2025 Notification Released', time: 'Just Now', badge: 'TS', color: 'blue' },
  { type: 'Scholarship', title: 'TS ePass 2024-25 Applications Open', time: '2 hours ago', badge: 'TS', color: 'purple' },
  { type: 'Govt Job', title: 'TSPSC Group 2 Prelims Schedule Announced', time: 'Today', badge: 'TS', color: 'teal' },
  { type: 'Exam', title: 'AP POLYCET Hall Tickets Available', time: 'Yesterday', badge: 'AP', color: 'amber' },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  teal: 'bg-teal-50 text-teal-600 border-teal-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  green: 'bg-green-50 text-green-600 border-green-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  rose: 'bg-rose-50 text-rose-600 border-rose-100',
};

const dotColorMap: Record<string, string> = {
  blue: 'bg-blue-600',
  teal: 'bg-teal-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-600',
  green: 'bg-green-600',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  rose: 'bg-rose-500',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function Home() {
  const [activeStage, setActiveStage] = useState('after-10th');
  const [searchQuery, setSearchQuery] = useState('');
  const currentStage = journeyStages.find(s => s.id === activeStage)!;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1920')] opacity-5 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/60 to-slate-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          {/* TS/AP Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6"
          >
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">Serving Students Across Telangana &amp; Andhra Pradesh</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight font-display"
          >
            Your Complete Guide to<br />
            <span className="text-amber-400">Education &amp; Careers</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto"
          >
            Free career guidance, college search, exam info, scholarships, and government job alerts — all in one place for TS &amp; AP students.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20">
              <Search className="absolute left-5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search colleges, exams, scholarships, government jobs..."
                className="w-full pl-14 pr-36 py-5 text-slate-900 text-base outline-none bg-transparent placeholder:text-slate-400"
              />
              <Link
                href={`/exams${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}
                className="absolute right-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
              >
                Search
              </Link>
            </div>
            <p className="text-sm text-blue-300 mt-3">
              Popular: <Link href="/exams" className="underline hover:text-white">TS EAMCET</Link>
              {' · '}<Link href="/colleges" className="underline hover:text-white">Engineering Colleges</Link>
              {' · '}<Link href="/government-jobs" className="underline hover:text-white">TSPSC Group 2</Link>
              {' · '}<Link href="/scholarships" className="underline hover:text-white">TS ePass</Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ QUICK ACTIONS ══════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 mb-16">
        <div className="grid grid-cols-5 gap-3">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link
                href={action.href}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group ${action.hover}`}
              >
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center border group-hover:bg-white/20 group-hover:border-white/30 transition-colors`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-white text-center leading-tight transition-colors">{action.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ STUDENT JOURNEY ════════════════════════════════════════════════ */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 font-display">
              Your <span className="text-blue-600">Student Journey</span>
            </h2>
            <p className="text-slate-500 text-lg">Choose your stage and discover the right path forward.</p>
          </motion.div>

          {/* Stage Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {journeyStages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeStage === stage.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {stage.label}
              </button>
            ))}
          </div>

          {/* Path Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {currentStage.paths.map((path, i) => (
              <motion.div
                key={path.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-xl ${colorMap[path.color]} flex items-center justify-center mb-4 border`}>
                  <path.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-2 leading-snug">{path.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{path.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href={currentStage.href}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full transition-all shadow-md shadow-blue-600/20 hover:-translate-y-0.5"
            >
              Full Guide: {currentStage.label} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ POPULAR EXAMS ══════════════════════════════════════════════════ */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-display mb-2">
                Popular <span className="text-blue-600">Exams</span>
              </h2>
              <p className="text-slate-500">Key entrance & competitive exams for TS &amp; AP students</p>
            </div>
            <Link href="/exams" className="hidden sm:flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-800 text-sm">
              View All Exams <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {popularExams.map((exam, i) => (
              <motion.div
                key={exam.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href="/exams"
                  className="group block bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-8 h-8 rounded-lg ${colorMap[exam.color]} flex items-center justify-center border`}>
                      <div className={`w-2.5 h-2.5 rounded-full ${dotColorMap[exam.color]}`} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{exam.state}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">{exam.name}</h3>
                  <p className="text-[11px] text-slate-500 leading-snug">{exam.eligibility}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{exam.body}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-6 sm:hidden">
            <Link href="/exams" className="inline-flex items-center gap-1 text-blue-600 font-semibold text-sm">
              View All Exams <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ COLLEGE EXPLORER ═══════════════════════════════════════════════ */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-display mb-2">
                College <span className="text-blue-600">Explorer</span>
              </h2>
              <p className="text-slate-500">Find top colleges in Telangana &amp; Andhra Pradesh</p>
            </div>
            <Link href="/colleges" className="hidden sm:flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-800 text-sm">
              Browse Colleges <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {collegeCategories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={cat.href}
                  className="group block bg-slate-50 hover:bg-blue-600 rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-2xl ${colorMap[cat.color]} flex items-center justify-center mb-4 border group-hover:bg-white/20 group-hover:border-white/30 transition-colors`}>
                    <cat.icon className="w-7 h-7 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-white text-base mb-1 transition-colors">{cat.name}</h3>
                  <p className="text-sm text-slate-500 group-hover:text-blue-100 transition-colors">{cat.count}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SCHOLARSHIPS ═══════════════════════════════════════════════════ */}
      <section className="py-16 bg-gradient-to-br from-purple-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1920')] opacity-10 bg-cover bg-center" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 font-display">
              Scholarships &amp; Financial Aid
            </h2>
            <p className="text-purple-100 text-lg">Don&apos;t let finances stop your education — explore all available schemes</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Telangana Scholarships', count: 'TS ePass, Ambedkar, BC Welfare', href: '/scholarships', icon: '🏛️' },
              { label: 'AP Scholarships', count: 'YSR Vidya Deevena, AP ePass', href: '/scholarships', icon: '🎓' },
              { label: 'National Scholarships', count: 'NSP, Post-Matric, Merit-cum-Means', href: '/scholarships', icon: '🇮🇳' },
              { label: 'Research Fellowships', count: 'JRF, SRF, PDF, CSIR', href: '/scholarships', icon: '🔬' },
            ].map((scheme, i) => (
              <motion.div
                key={scheme.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={scheme.href}
                  className="group block bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="text-3xl mb-3">{scheme.icon}</div>
                  <h3 className="font-bold text-white text-sm mb-2">{scheme.label}</h3>
                  <p className="text-purple-200 text-xs leading-relaxed">{scheme.count}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/scholarships"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
            >
              <Gift className="w-4 h-4" />
              Find Your Scholarship
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ GOVERNMENT JOBS ════════════════════════════════════════════════ */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-display mb-2">
                Government <span className="text-teal-600">Jobs</span>
              </h2>
              <p className="text-slate-500">Browse openings in TS &amp; AP by your qualification</p>
            </div>
            <Link href="/government-jobs" className="hidden sm:flex items-center gap-1 text-teal-600 font-semibold hover:text-teal-800 text-sm">
              All Jobs <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {['10th Pass', 'Intermediate', 'Degree', 'B.Tech', 'M.Sc / PG', 'PhD'].map((qual, i) => (
              <motion.div
                key={qual}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <Link
                  href="/government-jobs"
                  className="block text-center bg-white border border-slate-100 hover:border-teal-300 hover:bg-teal-50 rounded-xl py-4 px-3 text-sm font-semibold text-slate-700 hover:text-teal-700 transition-all shadow-sm hover:shadow-md"
                >
                  {qual}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Latest notifications preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {latestNotifications.map((notif, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={notif.type === 'Govt Job' ? '/government-jobs' : notif.type === 'Scholarship' ? '/scholarships' : '/exams'}
                  className="group block bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-lg ${colorMap[notif.color]} flex items-center justify-center border`}>
                      <Bell className="w-3 h-3" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{notif.type}</span>
                    <span className={`ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full ${colorMap[notif.color]}`}>{notif.badge}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug mb-2">{notif.title}</p>
                  <p className="text-xs text-slate-400">{notif.time}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CAREER GUIDANCE ════════════════════════════════════════════════ */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-display mb-3">
              Career <span className="text-amber-500">Guidance</span>
            </h2>
            <p className="text-slate-500 text-lg">Free roadmaps for popular career paths in Telangana &amp; AP</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {careerRoadmaps.map((career, i) => (
              <motion.div
                key={career.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={career.href}
                  className="group flex items-center gap-4 bg-slate-50 hover:bg-blue-600 rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl ${colorMap[career.color]} flex items-center justify-center border shrink-0 group-hover:bg-white/20 group-hover:border-white/30 transition-colors`}>
                    <career.icon className="w-6 h-6 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-white text-sm transition-colors">{career.title}</h3>
                    <p className="text-xs text-slate-500 group-hover:text-blue-100 transition-colors mt-0.5">{career.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-white ml-auto shrink-0 transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/career-guidance"
              className="inline-flex items-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold px-8 py-3 rounded-full transition-all duration-300"
            >
              <TrendingUp className="w-4 h-4" />
              Explore All Career Paths
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ STATS + ABOUT PREVIEW ══════════════════════════════════════════ */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-14">
            {[
              { value: '5,000+', label: 'Students Guided', color: 'text-white' },
              { value: '20+', label: 'Expert Courses', color: 'text-amber-400' },
              { value: '10+', label: 'Years Experience', color: 'text-white' },
              { value: 'Free', label: 'Career Guidance', color: 'text-teal-400' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className={`text-4xl md:text-5xl font-black mb-2 ${stat.color}`}>{stat.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Not sure what to do next?</h3>
              <p className="text-blue-100">Book a free 30-minute counseling call. Our experts will guide you step by step.</p>
            </div>
            <Link
              href="/contact"
              className="shrink-0 bg-white text-blue-700 font-bold px-8 py-4 rounded-full shadow-lg hover:bg-blue-50 transition-colors text-sm flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              Book Free Counseling
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ OUR COURSES ════════════════════════════════════════════════════ */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-display mb-2">
                Our <span className="text-blue-600">Skill Courses</span>
              </h2>
              <p className="text-slate-500">Professional training programs for TS &amp; AP students &amp; professionals</p>
            </div>
            <Link href="/education" className="hidden sm:flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-800 text-sm">
              All Courses <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Full Stack Web Development', duration: '6 Months', mode: 'Online / Offline', icon: Code2, href: '/education/full-stack-web', tag: 'Most Popular' },
              { title: 'Data Science & Machine Learning', duration: '8 Months', mode: 'Online', icon: BrainCircuit, href: '/education/data-science', tag: 'High Demand' },
              { title: 'Study Abroad Counseling', duration: 'Flexible', mode: 'Offline', icon: Award, href: '/education/study-abroad', tag: 'Expert Guided' },
            ].map((course, i) => (
              <motion.div
                key={course.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={course.href}
                  className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="h-36 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center relative">
                    <course.icon className="w-16 h-16 text-white/30" />
                    <div className="absolute top-3 left-3 bg-amber-400 text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {course.tag}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                    <div className="flex gap-3 text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{course.duration}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.mode}</span>
                    </div>
                    <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                      View Details <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
