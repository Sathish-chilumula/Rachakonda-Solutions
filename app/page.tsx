'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, GraduationCap, Briefcase, BookOpen, Award, ArrowRight,
  ChevronRight, MapPin, Users, Star, TrendingUp, BookMarked,
  FlaskConical, Wheat, Code2, Pill, ShieldCheck,
  Building2, Gift, Navigation, ExternalLink, Sparkles
} from 'lucide-react';
import { useState } from 'react';
import ContinuousGallery from '@/components/ContinuousGallery';

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
      { name: 'Intermediate (MPC/BiPC/CEC/HEC)', icon: BookOpen, color: 'blue', desc: 'The classic foundation — 2 years leading to engineering, medicine, and commerce degrees.' },
      { name: 'Polytechnic Diploma (POLYCET)', icon: GraduationCap, color: 'teal', desc: '3-year practical technical diploma with direct lateral entry into B.Tech 2nd year.' },
      { name: 'ITI Vocational Trades', icon: Award, color: 'amber', desc: 'Skill-focused trades: electrician, technician, mechanic with fast-track employment.' },
      { name: 'Short-Term Skill Certification', icon: Star, color: 'purple', desc: 'Computer, design, coding, and vocational programs from 3 to 12 months.' },
    ],
  },
  {
    id: 'after-inter',
    label: 'After Inter',
    href: '/after-inter',
    paths: [
      { name: 'Engineering (TS EAMCET / AP EAPCET / JEE)', icon: Code2, color: 'blue', desc: 'B.Tech in CSE, AI/ML, Data Science, ECE, Mechanical, Civil across top universities.' },
      { name: 'Medical & Allied (NEET UG)', icon: FlaskConical, color: 'teal', desc: 'MBBS, BDS, BAMS, BHMS, BSc Nursing, and Pharmacy programs.' },
      { name: 'Commerce & Management (DOST / BBA / CA)', icon: Briefcase, color: 'amber', desc: 'B.Com, BBA, CA Foundation, CMA, and Company Secretary tracks.' },
      { name: 'Arts, Law & Humanities (LAWCET / CLAT)', icon: BookMarked, color: 'purple', desc: '5-year Integrated Law, BA, Journalism, Civil Services foundation.' },
    ],
  },
  {
    id: 'after-degree',
    label: 'After Degree',
    href: '/after-degree',
    paths: [
      { name: 'Government Jobs (TSPSC / APPSC / SSC / RRB)', icon: ShieldCheck, color: 'blue', desc: 'Group 1, 2, 3, 4, Police SI/Constable, Banking, and Railway exams.' },
      { name: 'MBA / MCA (TS & AP ICET / CAT)', icon: TrendingUp, color: 'teal', desc: 'Postgraduate business administration and computer applications in premier institutes.' },
      { name: 'M.Tech / Higher Tech (GATE / PGECET)', icon: GraduationCap, color: 'amber', desc: 'Specialized postgraduate engineering and PSU recruitment through GATE.' },
      { name: 'MS & MBA Abroad (GRE / IELTS / TOEFL)', icon: Award, color: 'purple', desc: 'International master’s programs across USA, UK, Germany, Canada, and Australia.' },
    ],
  },
  {
    id: 'after-pg',
    label: 'After PG',
    href: '/career-guidance/postgraduate',
    paths: [
      { name: 'Doctoral Research (PhD / JRF / CSIR-NET)', icon: FlaskConical, color: 'blue', desc: 'UGC-NET, CSIR, ICMR junior research fellowships and doctoral programs.' },
      { name: 'University Teaching & Professorship', icon: Users, color: 'teal', desc: 'Assistant Professor, degree college lecturer roles through SET, NET, and PhD.' },
      { name: 'Govt Research Scientist / Officer', icon: ShieldCheck, color: 'amber', desc: 'ISRO, DRDO, ICAR, BARC scientific officers and UPSC civil services.' },
      { name: 'EdTech & Startup Leadership', icon: TrendingUp, color: 'purple', desc: 'Innovation incubation, academic leadership, and startup ventures.' },
    ],
  },
];

const popularExams = [
  { slug: 'ts-eamcet', name: 'TS EAMCET', body: 'JNTUH on behalf of TSCHE', eligibility: '10+2 with MPC/BiPC', state: 'TS', color: 'blue' },
  { slug: 'ap-eamcet', name: 'AP EAPCET', body: 'JNTUA on behalf of APSCHE', eligibility: '10+2 with MPC/BiPC', state: 'AP', color: 'blue' },
  { slug: 'tspsc-group-2', name: 'TSPSC Group 2', body: 'TSPSC Commission', eligibility: 'Graduation / Any Degree', state: 'TS', color: 'teal' },
];

const popularColleges = [
  { slug: 'jntuh-hyderabad', name: 'JNTU Hyderabad', location: 'Kukatpally, Hyderabad', category: 'Engineering', color: 'blue' },
  { slug: 'osmania-university', name: 'Osmania University', location: 'Tarnaka, Hyderabad', category: 'University', color: 'teal' },
  { slug: 'andhra-university', name: 'Andhra University', location: 'Visakhapatnam', category: 'University', color: 'purple' },
  { slug: 'gandhi-medical-college', name: 'Gandhi Medical College', location: 'Secunderabad', category: 'Medical', color: 'rose' },
];

const latestNotifications = [
  { type: 'Exam', title: 'TS EAMCET 2025 Online Applications & Exam Dates Announced', time: 'Latest', badge: 'TS', color: 'blue' },
  { type: 'Scholarship', title: 'TS ePass & AP JVD Post-Matric Applications Open', time: 'Active', badge: 'TS/AP', color: 'purple' },
  { type: 'Govt Job', title: 'TSPSC & APPSC Upcoming Calendar Updates Released', time: 'Updated', badge: 'Govt', color: 'teal' },
  { type: 'Admissions', title: 'POLYCET & DOST Counseling Web Options Schedule', time: 'Alert', badge: 'TS/AP', color: 'amber' },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  teal: 'bg-teal-50 text-teal-600 border-teal-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  green: 'bg-green-50 text-green-600 border-green-100',
  rose: 'bg-rose-50 text-rose-600 border-rose-100',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function Home() {
  const [activeStage, setActiveStage] = useState('after-10th');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'colleges' | 'exams' | 'courses'>('colleges');
  const currentStage = journeyStages.find(s => s.id === activeStage)!;

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">

      {/* ═══ PREMIUM HERO ══════════════════════════════════════════════════════ */}
      <section className="relative pt-24 pb-16 lg:pt-36 lg:pb-32 bg-slate-900 overflow-hidden">
        {/* Optimized background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none"
          style={{ backgroundImage: "url('/images/abstract_education_bg.webp')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-blue-950/60 pointer-events-none" />
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl -translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content (Text & Search) */}
            <div className="lg:col-span-7 text-center lg:text-left pt-6 lg:pt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2 mb-6 backdrop-blur-sm shadow-xs"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-blue-200">
                  Rachakonda Solutions &bull; Telangana &amp; Andhra Pradesh
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-6 tracking-tight leading-[1.12] font-display"
              >
                Discover Your True <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-teal-300">
                  Career &amp; College
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base sm:text-lg text-blue-100/90 mb-8 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed"
              >
                The dedicated education portal for students in Telangana &amp; Andhra Pradesh. Find the right college, explore entrance exams, track scholarships, and plan your government job career.
              </motion.p>

              {/* Mobile Hero Image Card (Ensures mobile users also see the visuals!) */}
              <div className="block lg:hidden my-6">
                <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden border-2 border-white/15 shadow-xl bg-slate-800">
                  <Image 
                    src="/images/hero_students.webp" 
                    alt="Rachakonda Solutions Students" 
                    fill 
                    className="object-cover"
                    priority
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="font-bold flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-400" /> 10,000+ Students Guided
                    </span>
                    <span className="bg-blue-600/80 px-2 py-0.5 rounded text-[11px] font-semibold">
                      Gajwel Campus
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabbed Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-xl p-2 sm:p-3 rounded-3xl border border-white/20 shadow-2xl max-w-2xl mx-auto lg:mx-0"
              >
                {/* Search Tabs */}
                <div className="flex items-center gap-2 mb-2 sm:mb-3 px-2">
                  {(['colleges', 'exams', 'courses'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setSearchType(type)}
                      className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold capitalize transition-colors ${
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
                    placeholder={`Search top ${searchType} in Telangana & Andhra Pradesh...`}
                    className="w-full pl-12 pr-28 sm:pr-32 py-3.5 sm:py-4 text-slate-900 text-sm sm:text-base font-medium outline-none bg-transparent placeholder:text-slate-400"
                  />
                  <Link
                    href={`/${searchType}${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}
                    className="absolute right-1.5 sm:right-2 bg-slate-900 hover:bg-blue-700 text-white font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md"
                  >
                    Search
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right Content (Desktop Hero Image & Badges) */}
            <div className="lg:col-span-5 relative hidden lg:block h-[540px] w-full">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0 z-10 flex items-center justify-center"
              >
                {/* Main Hero Image Container */}
                <div className="relative w-full max-w-md aspect-square rounded-[2.5rem] overflow-hidden border-[6px] border-white/15 shadow-2xl bg-slate-800 rotate-2 hover:rotate-0 transition-transform duration-500">
                  <Image 
                    src="/images/hero_students.webp" 
                    alt="Rachakonda Solutions Students" 
                    fill 
                    sizes="(max-width: 1200px) 400px, 450px"
                    className="object-cover"
                    priority
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Trust Badge 1 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute top-8 -left-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-3.5 z-20 animate-bounce-slow"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-slate-900 leading-none">10,000+</p>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">Students Guided</p>
                  </div>
                </motion.div>

                {/* Trust Badge 2 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="absolute bottom-12 -right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-3.5 z-20 animate-bounce-slow-delayed"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-slate-900 leading-none">100+</p>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">Colleges &amp; Universities</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ QUICK ACTIONS (MOBILE OPTIMIZED) ═══════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-30 mb-16">
        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-4 lg:grid lg:grid-cols-5 lg:overflow-visible">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="snap-start shrink-0 w-[140px] sm:w-[160px] lg:w-auto"
            >
              <Link
                href={action.href}
                className={`flex flex-col items-center gap-3 p-5 rounded-3xl border bg-white shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group ${action.hover}`}
              >
                <div className={`w-13 h-13 rounded-2xl ${action.color} flex items-center justify-center border group-hover:bg-white/20 group-hover:border-white/30 transition-colors`}>
                  <action.icon className="w-6 h-6" />
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
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Step-by-Step Educational Roadmaps</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 font-display tracking-tight">
              Your Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Student Journey</span>
            </h2>
            <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto font-medium">
              Select your academic stage to uncover curated paths, entrance examinations, and high-growth careers.
            </p>
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

          {/* Path Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <AnimatePresence mode="wait">
              {currentStage.paths.map((path, i) => (
                <motion.div
                  key={path.name + currentStage.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
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
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-8 sm:px-10 py-3.5 sm:py-4 rounded-full transition-all shadow-xl shadow-blue-600/20 hover:-translate-y-0.5"
            >
              Explore {currentStage.label} Complete Guide <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ REAL LIFE & LEARNING CONTINUOUS GALLERY ════════════════════════ */}
      <ContinuousGallery />

      {/* ═══ DYNAMIC CONTENT: EXAMS & COLLEGES ══════════════════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Left: Top Exams */}
            <div>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 font-display tracking-tight">Key <span className="text-blue-600">Entrance Exams</span></h2>
                  <p className="text-slate-500 mt-1 font-medium text-sm">Exam patterns, syllabus, eligibility &amp; updates</p>
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
                      className="group flex items-center justify-between bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${colorMap[exam.color]} flex items-center justify-center border shrink-0`}>
                          <span className="font-black text-xs uppercase tracking-widest">{exam.state}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base sm:text-lg">{exam.name}</h3>
                          <p className="text-xs text-slate-500 font-medium">{exam.body} &bull; {exam.eligibility}</p>
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
                  <h2 className="text-3xl font-black text-slate-900 font-display tracking-tight">Featured <span className="text-teal-600">Institutions</span></h2>
                  <p className="text-slate-500 mt-1 font-medium text-sm">Top ranked universities and colleges in TS &amp; AP</p>
                </div>
                <Link href="/colleges" className="text-teal-600 font-bold hover:text-teal-800 text-sm flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="block h-full bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 hover:border-teal-300 transition-all group"
                    >
                      <div className={`w-10 h-10 rounded-xl ${colorMap[college.color]} flex items-center justify-center border mb-4`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors mb-1 line-clamp-2">{college.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {college.location}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ═══ VISIT OUR CAMPUS & GOOGLE MAPS SECTION ═════════════════════════ */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                  <Navigation className="w-3.5 h-3.5" /> Visit Us In Person
                </div>
                <h3 className="text-3xl sm:text-4xl font-black font-display tracking-tight mb-4">
                  Rachakonda Solutions <span className="text-amber-400">Gajwel Campus</span>
                </h3>
                <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed mb-6 font-medium">
                  We welcome students and parents to meet our senior counselors in person for free academic assessments, entrance exam roadmaps, and admission counseling.
                </p>

                <div className="space-y-3 text-slate-300 text-sm mb-8">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Address:</strong> Prashantha Complex, 2nd &amp; 3rd Floor, Above LIC office, Beside Gajwel Bus Stand Main Road, Gajwel, Telangana — 502278
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-teal-400 shrink-0" />
                    <span><strong className="text-white">Key Landmark:</strong> Right next to Gajwel Main Bus Terminal</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href="https://maps.app.goo.gl/Udj1B5VZeBn2jo5dA?g_st=aw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3.5 rounded-2xl transition-all shadow-lg text-sm"
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions on Google Maps
                    <ExternalLink className="w-4 h-4 ml-0.5" />
                  </a>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-2xl transition-all border border-white/15 text-sm"
                  >
                    Schedule an Appointment
                  </Link>
                </div>
              </div>

              {/* Map Preview Card */}
              <div className="lg:col-span-5">
                <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-800">
                  <iframe
                    title="Rachakonda Solutions Gajwel Campus Location"
                    src="https://maps.google.com/maps?q=Prashantha+Complex+Gajwel+Telangana&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ LATEST NOTIFICATIONS TICKER ════════════════════════════════════ */}
      <section className="py-10 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Notification Alerts</h2>
            </div>
            
            <div className="flex-1 w-full overflow-x-auto hide-scrollbar">
              <div className="flex gap-4 min-w-max">
                {latestNotifications.map((notif, i) => (
                  <div key={i} className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${colorMap[notif.color]} bg-white shadow-xs`}>
                    <span className="px-2 py-0.5 rounded bg-white font-black text-[10px] uppercase tracking-widest border border-current">{notif.badge}</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">{notif.title}</span>
                    <span className="text-xs font-semibold text-slate-400 ml-2">{notif.time}</span>
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
