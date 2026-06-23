'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, GraduationCap, Briefcase, BookOpen, Award, ArrowRight,
  ChevronRight, MapPin, Users, Star, TrendingUp, BookMarked,
  FlaskConical, Wheat, Code2, Pill, BrainCircuit, ShieldCheck,
  Building2, Gift, CheckCircle
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
  { slug: 'ts-eamcet', name: 'TS EAMCET', body: 'JNTUH', eligibility: 'Intermediate', state: 'TS', color: 'blue' },
  { slug: 'ap-eamcet', name: 'AP EAMCET', body: 'JNTUA', eligibility: 'Intermediate', state: 'AP', color: 'blue' },
  { slug: 'tspsc-group-2', name: 'TSPSC Group 2', body: 'TSPSC', eligibility: 'Degree', state: 'TS', color: 'teal' },
  { slug: 'polycet', name: 'POLYCET', body: 'SBTET', eligibility: '10th Pass', state: 'TS/AP', color: 'amber' },
  { slug: 'icet', name: 'ICET', body: 'TSCHE/APSCHE', eligibility: 'Degree', state: 'TS/AP', color: 'purple' },
];

const popularColleges = [
  { slug: 'jntuh-hyderabad', name: 'JNTUH', location: 'Hyderabad', category: 'Engineering', color: 'blue' },
  { slug: 'osmania-university', name: 'Osmania University', location: 'Hyderabad', category: 'University', color: 'teal' },
  { slug: 'andhra-university', name: 'Andhra University', location: 'Visakhapatnam', category: 'University', color: 'purple' },
  { slug: 'gandhi-medical-college', name: 'Gandhi Medical College', location: 'Secunderabad', category: 'Medical', color: 'rose' },
];

const collegeCategories = [
  { name: 'Engineering', icon: Code2, count: '200+ colleges', color: 'blue', href: '/colleges' },
  { name: 'Medical & Pharmacy', icon: Pill, count: '80+ colleges', color: 'teal', href: '/colleges' },
  { name: 'Agriculture', icon: Wheat, count: '40+ colleges', color: 'green', href: '/colleges' },
  { name: 'Arts & Science', icon: BookMarked, count: '500+ colleges', color: 'purple', href: '/colleges' },
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
  const [searchType, setSearchType] = useState<'colleges' | 'exams' | 'courses'>('colleges');
  const currentStage = journeyStages.find(s => s.id === activeStage)!;

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">

      {/* ═══ PREMIUM HERO (AGI STYLE) ════════════════════════════════════════ */}
      <section className="relative pt-24 pb-16 lg:pt-36 lg:pb-32 bg-slate-900 overflow-hidden">
        {/* Background Elements */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/abstract_education_bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-blue-900/40" />
        <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content (Text & Search) */}
            <div className="text-center lg:text-left pt-10 lg:pt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2 mb-6 backdrop-blur-sm"
              >
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm font-semibold text-blue-200">Rachakonda Solutions</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1] font-display"
              >
                Find Your True <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Career Path</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg sm:text-xl text-blue-100/90 mb-10 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed"
              >
                The #1 trusted platform for students in Telangana &amp; Andhra Pradesh. Explore top colleges, latest exams, and expert career guidance.
              </motion.p>

              {/* Tabbed Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-xl p-2 sm:p-3 rounded-3xl border border-white/20 shadow-2xl max-w-2xl mx-auto lg:mx-0"
              >
                {/* Search Tabs */}
                <div className="flex items-center gap-2 mb-3 px-2">
                  {(['colleges', 'exams', 'courses'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setSearchType(type)}
                      className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize transition-colors ${
                        searchType === type 
                          ? 'bg-amber-500 text-slate-900 shadow-md' 
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Input Area */}
                <div className="relative flex items-center bg-white rounded-2xl shadow-inner overflow-hidden">
                  <Search className="absolute left-4 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search for top ${searchType} in TS & AP...`}
                    className="w-full pl-12 pr-32 py-4 sm:py-5 text-slate-900 text-sm sm:text-base font-medium outline-none bg-transparent placeholder:text-slate-400"
                  />
                  <Link
                    href={`/${searchType}${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}
                    className="absolute right-2 bg-slate-900 hover:bg-blue-700 text-white font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm transition-all shadow-md"
                  >
                    Search
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right Content (Images & Badges) */}
            <div className="relative hidden lg:block h-[600px] w-full">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
                className="absolute inset-0 z-10 flex items-center justify-center"
              >
                {/* Main Hero Image */}
                <div className="relative w-full max-w-lg aspect-square rounded-[3rem] overflow-hidden border-[8px] border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                  <Image 
                    src="/hero_students.png" 
                    alt="Students" 
                    fill 
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Trust Badge 1 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="absolute top-12 -left-12 bg-white rounded-2xl p-4 shadow-2xl border border-slate-100 flex items-center gap-4 z-20 animate-bounce-slow"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Award className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 leading-none">10k+</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Students Guided</p>
                  </div>
                </motion.div>

                {/* Trust Badge 2 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute bottom-24 -right-8 bg-white rounded-2xl p-4 shadow-2xl border border-slate-100 flex items-center gap-4 z-20 animate-bounce-slow-delayed"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 leading-none">100+</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Partner Colleges</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ QUICK ACTIONS (MOBILE FIXED) ═══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-30 mb-16">
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-4 lg:grid lg:grid-cols-5 lg:overflow-visible">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="snap-start shrink-0 w-[140px] lg:w-auto"
            >
              <Link
                href={action.href}
                className={`flex flex-col items-center gap-3 p-5 rounded-3xl border bg-white shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group ${action.hover}`}
              >
                <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center border group-hover:bg-white/20 group-hover:border-white/30 transition-colors`}>
                  <action.icon className="w-7 h-7" />
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover:text-white text-center leading-tight transition-colors">{action.label}</span>
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
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 font-display tracking-tight">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Student Journey</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Choose your stage and let our AI-driven insights guide you to the perfect career path.</p>
          </motion.div>

          {/* Stage Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2 justify-start sm:justify-center mb-10 pb-2">
            {journeyStages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 shrink-0 ${
                  activeStage === stage.id
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {stage.label}
              </button>
            ))}
          </div>

          {/* Path Cards - Animated */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <AnimatePresence mode="wait">
              {currentStage.paths.map((path, i) => (
                <motion.div
                  key={path.name + currentStage.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 rounded-2xl ${colorMap[path.color]} flex items-center justify-center mb-5 border group-hover:scale-110 transition-transform duration-300`}>
                    <path.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2 leading-snug group-hover:text-blue-600 transition-colors">{path.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{path.desc}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="text-center">
            <Link
              href={currentStage.href}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-10 py-4 rounded-full transition-all shadow-xl shadow-blue-600/20 hover:-translate-y-1"
            >
              Explore Full Guide <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ DYNAMIC CONTENT CAROUSELS (EXAMS & COLLEGES) ═══════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left: Top Exams */}
            <div>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 font-display tracking-tight">Top <span className="text-blue-600">Exams</span></h2>
                  <p className="text-slate-500 mt-1 font-medium">Click for syllabus & dates</p>
                </div>
                <Link href="/exams" className="text-blue-600 font-bold hover:text-blue-800 text-sm flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {popularExams.map((exam, i) => (
                  <motion.div
                    key={exam.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={`/exams/${exam.slug}`}
                      className="group flex items-center justify-between bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${colorMap[exam.color]} flex items-center justify-center border shrink-0`}>
                          <span className="font-black text-xs uppercase tracking-widest">{exam.state}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-lg">{exam.name}</h3>
                          <p className="text-xs text-slate-500 font-medium">{exam.conductingBody}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Featured Colleges */}
            <div>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 font-display tracking-tight">Featured <span className="text-teal-600">Colleges</span></h2>
                  <p className="text-slate-500 mt-1 font-medium">Explore top institutions</p>
                </div>
                <Link href="/colleges" className="text-teal-600 font-bold hover:text-teal-800 text-sm flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {popularColleges.map((college, i) => (
                  <motion.div
                    key={college.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={`/colleges/${college.slug}`}
                      className="block h-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-300 transition-all group"
                    >
                      <div className={`w-10 h-10 rounded-xl ${colorMap[college.color]} flex items-center justify-center border mb-4`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors mb-1 line-clamp-2">{college.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-2">
                        <MapPin className="w-3.5 h-3.5" /> {college.location}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══ LATEST NOTIFICATIONS TICKER ════════════════════════════════════ */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">Latest Updates</h2>
            </div>
            
            <div className="flex-1 w-full overflow-x-auto hide-scrollbar">
              <div className="flex gap-4 min-w-max">
                {latestNotifications.map((notif, i) => (
                  <div key={i} className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${colorMap[notif.color]} bg-white shadow-sm`}>
                    <span className="px-2 py-0.5 rounded bg-white font-black text-[10px] uppercase tracking-widest border border-current">{notif.badge}</span>
                    <span className="text-sm font-bold text-slate-800">{notif.title}</span>
                    <span className="text-xs font-medium text-slate-400 ml-2">{notif.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
