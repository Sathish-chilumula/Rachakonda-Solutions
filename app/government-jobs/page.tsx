'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import {
  Search, Briefcase, GraduationCap, Building2, ArrowRight,
  Phone, AlertCircle, CheckCircle, Filter, Bell,
  Shield, Users, Star, Clock, ChevronRight, Lightbulb,
  BookOpen, Target, TrendingUp
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };

type QualFilter = 'All' | '10th Pass' | 'Intermediate' | 'Degree' | 'B.Tech' | 'PG';

const qualifications: QualFilter[] = ['All', '10th Pass', 'Intermediate', 'Degree', 'B.Tech', 'PG'];

interface JobCard {
  department: string;
  posts: string;
  vacancies: string;
  qualification: QualFilter;
  lastDate: string;
  state: 'TS' | 'AP' | 'National';
  category: string;
  salary: string;
}

const jobs: JobCard[] = [
  // TODO: Replace with real recruitment notifications from TSPSC, APPSC, and National boards
  { department: 'TSPSC Group 2', posts: 'Various Administrative Posts', vacancies: 'TODO', qualification: 'Degree', lastDate: 'TODO: Check TSPSC website', state: 'TS', category: 'Administrative', salary: 'Pay Level TODO' },
  { department: 'APPSC Group 2', posts: 'Various State Service Posts', vacancies: 'TODO', qualification: 'Degree', lastDate: 'TODO: Check APPSC website', state: 'AP', category: 'Administrative', salary: 'Pay Level TODO' },
  { department: 'TS Police Department', posts: 'Sub-Inspector (SI), Constable', vacancies: 'TODO', qualification: 'Intermediate', lastDate: 'TODO: Check TSLPRB website', state: 'TS', category: 'Police', salary: 'Pay Level TODO' },
  { department: 'AP Police Department', posts: 'Sub-Inspector (SI), Constable', vacancies: 'TODO', qualification: 'Intermediate', lastDate: 'TODO: Check SLPRB AP website', state: 'AP', category: 'Police', salary: 'Pay Level TODO' },
  { department: 'TS DSC / Teachers Recruitment', posts: 'School Assistant, SGT', vacancies: 'TODO', qualification: 'Degree', lastDate: 'TODO: Check TS DSC notification', state: 'TS', category: 'Teaching', salary: 'Pay Level TODO' },
  { department: 'AP DSC Teachers Recruitment', posts: 'Secondary Grade Teacher, SA', vacancies: 'TODO', qualification: 'Degree', lastDate: 'TODO: Check AP DSC notification', state: 'AP', category: 'Teaching', salary: 'Pay Level TODO' },
  { department: 'TSRTC', posts: 'Driver, Conductor, Junior Assistant', vacancies: 'TODO', qualification: '10th Pass', lastDate: 'TODO: Check TSRTC website', state: 'TS', category: 'Transport', salary: 'Pay Level TODO' },
  { department: 'SSC CGL 2024-25', posts: 'Income Tax Inspector, CBI, CAG etc.', vacancies: 'TODO', qualification: 'Degree', lastDate: 'TODO: Check SSC website', state: 'National', category: 'Central Govt', salary: 'Grade Pay 4200–4800' },
];

const departments = [
  { name: 'TSPSC', desc: 'Group 1, 2, 3, 4 exams for TS State Services', icon: Shield, state: 'TS', link: 'https://www.tspsc.gov.in' },
  { name: 'APPSC', desc: 'Group 1, 2, 3 exams for AP State Services', icon: Shield, state: 'AP', link: 'https://www.psc.ap.gov.in' },
  { name: 'TSRTC', desc: 'Telangana State Road Transport Corporation', icon: Building2, state: 'TS', link: '#' },
  { name: 'TS Police (TSLPRB)', desc: 'Police SI, Constable, SCT ASI recruitment', icon: Shield, state: 'TS', link: 'https://www.tslprb.in' },
  { name: 'AP Police', desc: 'Police SI, Constable & technical posts', icon: Shield, state: 'AP', link: '#' },
  { name: 'Teaching (TS/AP DSC)', desc: 'Teacher recruitment for school posts', icon: BookOpen, state: 'TS/AP', link: '#' },
  { name: 'Banks (IBPS/SBI)', desc: 'PO, Clerk, SO in nationalised banks', icon: Building2, state: 'National', link: '#' },
  { name: 'Indian Railways (RRB)', desc: 'NTPC, Group D, JE, ALP vacancies', icon: Building2, state: 'National', link: '#' },
];

const prepTips = [
  {
    icon: Target,
    title: 'Know the Syllabus',
    desc: 'Download the official syllabus from TSPSC/APPSC/SSC website and make a chapter-wise study plan before starting.',
    color: 'blue',
  },
  {
    icon: BookOpen,
    title: 'Previous Year Papers',
    desc: 'Solve last 5–10 years of previous question papers. It reveals the pattern, repeated topics, and difficulty level.',
    color: 'teal',
  },
  {
    icon: TrendingUp,
    title: 'Consistent Daily Practice',
    desc: 'Study 4–6 hours daily. Focus on GK/Current Affairs for govt exams. Use newspapers + monthly magazines.',
    color: 'amber',
  },
];

export default function GovernmentJobsPage() {
  const [qualFilter, setQualFilter] = useState<QualFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');

  const filtered = jobs.filter((j) => {
    const matchQual = qualFilter === 'All' || j.qualification === qualFilter;
    const matchSearch = searchQuery === '' ||
      j.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.posts.toLowerCase().includes(searchQuery.toLowerCase());
    return matchQual && matchSearch;
  });

  return (
    <main className="min-h-screen bg-white font-sans">
      {/* ── Hero ── */}
      <section className="bg-blue-600 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex justify-center gap-3 mb-6">
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">Telangana</span>
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">Andhra Pradesh</span>
              <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full">2024-25</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Government Jobs in TS & AP
            </motion.h1>
            <motion.p variants={fadeUp} className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Latest government job notifications for Telangana & Andhra Pradesh — TSPSC, APPSC, Police, Teaching, Banks & Central Govt vacancies.
            </motion.p>
            {/* Search */}
            <motion.div variants={fadeUp} className="max-w-xl mx-auto relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search department or post..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Browse by Qualification ── */}
      <section className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-slate-500 text-sm font-medium shrink-0 flex items-center gap-1">
              <GraduationCap className="w-4 h-4" /> Qualification:
            </span>
            {qualifications.map((q) => (
              <button
                key={q}
                onClick={() => setQualFilter(q)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${qualFilter === q ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest Notifications ── */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Latest Job Notifications</h2>
                <p className="text-slate-400 text-sm mt-1">
                  {/* TODO: Connect to live job notification API or update manually from TSPSC/APPSC */}
                  Showing sample notifications — {filtered.length} result(s)
                </p>
              </div>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-5">
              {filtered.map((job, i) => (
                <motion.div key={i} variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${job.state === 'TS' ? 'bg-blue-100' : job.state === 'AP' ? 'bg-teal-100' : 'bg-slate-100'}`}>
                        <Building2 className={`w-5 h-5 ${job.state === 'TS' ? 'text-blue-600' : job.state === 'AP' ? 'text-teal-600' : 'text-slate-600'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-base">{job.department}</h3>
                        <p className="text-xs text-slate-500">{job.category}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${job.state === 'TS' ? 'bg-blue-100 text-blue-700' : job.state === 'AP' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>
                      {job.state}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 font-medium mb-4">{job.posts}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span className="text-xs text-slate-500">Vacancies: <span className="font-medium text-slate-700">{job.vacancies}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span className="text-xs text-slate-500">Qualification: <span className="font-medium text-slate-700">{job.qualification}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-xs text-amber-600 font-medium">Last Date: {job.lastDate}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Popular Departments ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Key Departments</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Popular Recruiting Departments</h2>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {departments.map((dept, i) => {
                const DIcon = dept.icon;
                return (
                  <motion.div key={i} variants={fadeUp} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:shadow-md transition-all hover:border-blue-200 group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${dept.state === 'TS' ? 'bg-blue-100' : dept.state === 'AP' ? 'bg-teal-100' : 'bg-slate-200'}`}>
                      <DIcon className={`w-5 h-5 ${dept.state === 'TS' ? 'text-blue-600' : dept.state === 'AP' ? 'text-teal-600' : 'text-slate-600'}`} />
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full mb-2 inline-block ${dept.state === 'TS' ? 'bg-blue-100 text-blue-700' : dept.state === 'AP' ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-600'}`}>
                      {dept.state}
                    </span>
                    <h3 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{dept.name}</h3>
                    <p className="text-xs text-slate-500">{dept.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Preparation Tips ── */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Get Ready</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">How to Prepare for Govt Exams</h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {prepTips.map((tip, i) => {
                const TIcon = tip.icon;
                return (
                  <motion.div key={i} variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow text-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${tip.color === 'blue' ? 'bg-blue-100' : tip.color === 'teal' ? 'bg-teal-100' : 'bg-amber-100'}`}>
                      <TIcon className={`w-7 h-7 ${tip.color === 'blue' ? 'text-blue-600' : tip.color === 'teal' ? 'text-teal-600' : 'text-amber-600'}`} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-3">{tip.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{tip.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Notification Subscription ── */}
      <section className="py-16 px-4 bg-blue-50 border-y border-blue-100">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="flex justify-center mb-4">
              <Bell className="w-10 h-10 text-blue-600" />
            </motion.div>
            <motion.h3 variants={fadeUp} className="text-2xl font-bold text-slate-900 mb-2">Get Job Notifications</motion.h3>
            <motion.p variants={fadeUp} className="text-slate-500 text-sm mb-6">
              {/* TODO: Implement email subscription with backend integration */}
              Enter your email to receive alerts for new TSPSC / APPSC / SSC notifications.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
              <button
                onClick={() => {
                  // TODO: Implement subscription API call
                  alert('Subscription feature coming soon!');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all shrink-0"
              >
                Subscribe
              </button>
            </motion.div>
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
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4">Need Coaching Guidance?</motion.h2>
            <motion.p variants={fadeUp} className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Our counselors help TS/AP students choose the right govt exam, find quality coaching & build a preparation plan.
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
