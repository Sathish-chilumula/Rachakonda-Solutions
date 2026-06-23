'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Briefcase, GraduationCap, Globe, BookOpen, ArrowRight,
  Phone, CheckCircle, Star, TrendingUp, Building2,
  Award, Lightbulb, Shield, ChevronRight, Users
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const pathCards = [
  {
    icon: Shield,
    title: 'Government Jobs',
    desc: 'TSPSC, APPSC, SSC, Banks, Railways, Defence & more — stable careers with good pay.',
    color: 'blue',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    href: '#govt-jobs',
  },
  {
    icon: TrendingUp,
    title: 'Competitive Exams',
    desc: 'UPSC, GATE, CAT, CLAT, NET — open doors to premium careers & higher studies.',
    color: 'teal',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    badge: 'bg-teal-100 text-teal-700',
    href: '#competitive',
  },
  {
    icon: GraduationCap,
    title: 'Higher Education',
    desc: 'MBA, M.Tech, MS Abroad, LLM, PhD — specialize & earn premium qualifications.',
    color: 'purple',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    href: '#higher-ed',
  },
];

const govtJobs = [
  { dept: 'TSPSC', desc: 'Telangana State Public Service Commission — Group 1, 2, 3, 4 exams. Engineering, Non-Engineering & Technical posts.', eligibility: 'Degree / B.Tech (varies by post)', state: 'TS' },
  { dept: 'APPSC', desc: 'AP Public Service Commission — Group 1, 2, 3 exams. Administrative & technical positions.', eligibility: 'Degree / B.Tech (varies by post)', state: 'AP' },
  { dept: 'SSC CGL/CHSL', desc: 'Staff Selection Commission for Central Govt jobs — Income Tax, CBI, CAG & more.', eligibility: 'Degree (CGL) / 12th (CHSL)', state: 'National' },
  { dept: 'SBI / IBPS', desc: 'Banking sector recruitment — PO, Clerk, SO positions. One of the most popular paths.', eligibility: 'Degree in any stream', state: 'National' },
  { dept: 'Indian Railways', desc: 'RRB NTPC, Group D, JE — large-scale recruitment across multiple departments.', eligibility: 'Degree / Diploma / 10th (varies)', state: 'National' },
  { dept: 'Defence (CDS/NCC)', desc: 'CDS for Army/Navy/Air Force officer entry. NCC Special Entry also available.', eligibility: 'Degree (Engineering/Others)', state: 'National' },
  { dept: 'TS/AP Police', desc: 'Sub-Inspector, Constable & technical posts. State-level police recruitment.', eligibility: 'Degree / Intermediate (varies)', state: 'TS/AP' },
  { dept: 'Teaching (TET/DSC)', desc: 'Teacher Eligibility Test & District Selection Committee for school teaching posts.', eligibility: 'Degree + B.Ed', state: 'TS/AP' },
];

const higherEd = [
  { course: 'MBA', desc: 'Master of Business Administration. Opens leadership roles across industries.', exam: 'ICET (TS/AP) / CAT / MAT', duration: '2 Years', icon: Briefcase },
  { course: 'M.Tech', desc: 'Advanced engineering specialization. Best path for technical excellence.', exam: 'GATE', duration: '2 Years', icon: TrendingUp },
  { course: 'MS Abroad', desc: 'Masters degree from USA, Germany, Canada, Australia. High ROI long-term.', exam: 'GRE + IELTS/TOEFL', duration: '1.5–2 Years', icon: Globe },
  { course: 'B.Ed / D.El.Ed', desc: 'Teacher education. Required for teaching in TS/AP govt & private schools.', exam: 'TS/AP EdCET', duration: '2 Years', icon: GraduationCap },
  { course: 'LLB (3-Year)', desc: 'Law degree for graduates. Strong demand in legal & corporate sectors.', exam: 'TS LAWCET / AP LAWCET', duration: '3 Years', icon: Shield },
  { course: 'M.Sc / MCA', desc: 'Specialized science or computer applications degree. Good for research & IT.', exam: 'TS PGECET / AP PGECET', duration: '2 Years', icon: Star },
  { course: 'PhD / Research', desc: 'UGC-NET / JRF qualified candidates can pursue doctoral research with fellowship.', exam: 'UGC NET / CSIR NET', duration: '3–5 Years', icon: Award },
  { course: 'CA / CMA (Final)', desc: 'Chartered Accountant or Cost Accountant final qualification. High prestige.', exam: 'ICAI / ICMAI exams', duration: '2–3 Years', icon: Briefcase },
];

const competitiveExams = [
  { name: 'UPSC Civil Services', desc: 'IAS, IPS, IFS — top-tier government leadership roles. Long preparation required.', stage: 'Prelims → Mains → Interview' },
  { name: 'GATE', desc: 'Graduate Aptitude Test in Engineering. For M.Tech admission & PSU recruitment.', stage: 'Single exam' },
  { name: 'CAT', desc: 'Common Admission Test for IIM MBA programs. Highly competitive.', stage: 'Single exam → GD/PI' },
  { name: 'UGC NET', desc: 'National Eligibility Test for Assistant Professor & JRF fellowship.', stage: 'Paper 1 + Paper 2' },
  { name: 'CLAT PG', desc: 'Common Law Admission Test for LLM in National Law Universities.', stage: 'Single exam' },
  { name: 'IBPS PO/Clerk', desc: 'Banking sector exam for Probationary Officers & Clerks. Very popular.', stage: 'Prelims → Mains → Interview' },
];

const skillsSection = [
  { title: 'Full Stack Development', duration: '6 Months', jobs: 'Software Developer, Web Dev', color: 'blue' },
  { title: 'Data Science & AI', duration: '4–6 Months', jobs: 'Data Analyst, ML Engineer', color: 'teal' },
  { title: 'Digital Marketing', duration: '3 Months', jobs: 'SEO/SEM, Content Marketing', color: 'amber' },
  { title: 'Cloud Computing (AWS/Azure)', duration: '3–4 Months', jobs: 'Cloud Engineer, DevOps', color: 'purple' },
];

export default function AfterDegreePage() {
  return (
    <main className="min-h-screen bg-white font-sans">
      {/* ── Hero ── */}
      <section className="bg-blue-600 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex justify-center gap-3 mb-6">
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">After Degree</span>
              <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full">TS & AP Students</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Career Options After Degree
            </motion.h1>
            <motion.p variants={fadeUp} className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Comprehensive guide for Telangana & AP graduates — government jobs, competitive exams, higher education & skill-based careers.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              <Link href="#paths" className="bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold px-6 py-3 rounded-xl transition-all">
                Explore Paths ↓
              </Link>
              <Link href="/contact" className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl border border-white/30 transition-all">
                Free Counseling Call
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Three Path Cards ── */}
      <section id="paths" className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Your Options</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Three Major Career Paths</h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {pathCards.map((p) => {
                const Icon = p.icon;
                return (
                  <motion.a key={p.title} href={p.href} variants={fadeUp} className={`rounded-2xl border-2 ${p.border} ${p.bg} p-6 shadow-sm hover:shadow-lg transition-all group block`}>
                    <div className={`w-12 h-12 rounded-xl ${p.badge} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-xl mb-2">{p.title}</h3>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">{p.desc}</p>
                    <span className={`text-sm font-semibold ${p.badge} px-3 py-1 rounded-full inline-flex items-center gap-1`}>
                      Explore <ChevronRight className="w-3 h-3" />
                    </span>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Government Jobs ── */}
      <section id="govt-jobs" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Stability & Security</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Government Job Opportunities</h2>
              <p className="text-slate-500 mt-3">Popular government departments recruiting degree holders in Telangana & AP.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-5">
              {govtJobs.map((j, i) => (
                <motion.div key={i} variants={fadeUp} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-6 h-6 text-blue-600 shrink-0" />
                      <h3 className="font-bold text-slate-800">{j.dept}</h3>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${j.state === 'TS' ? 'bg-blue-100 text-blue-700' : j.state === 'AP' ? 'bg-teal-100 text-teal-700' : j.state === 'TS/AP' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                      {j.state}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{j.desc}</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                    <span className="text-xs text-slate-500">{j.eligibility}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div variants={fadeUp} className="text-center mt-8">
              <Link href="/government-jobs" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all">
                View All Government Jobs <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Competitive Exams ── */}
      <section id="competitive" className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">High-Value Exams</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Top Competitive Exams After Degree</h2>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {competitiveExams.map((e, i) => (
                <motion.div key={i} variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">{e.name}</h3>
                  <p className="text-sm text-slate-500 mb-3 leading-relaxed">{e.desc}</p>
                  <div className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium inline-block">
                    {e.stage}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Higher Education ── */}
      <section id="higher-ed" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Post-Graduate Options</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Higher Education Pathways</h2>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {higherEd.map((h, i) => {
                const HIcon = h.icon;
                return (
                  <motion.div key={i} variants={fadeUp} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <HIcon className="w-7 h-7 text-blue-600 mb-3" />
                    <h3 className="font-bold text-slate-800 mb-1">{h.course}</h3>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">{h.desc}</p>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400">📝 {h.exam}</p>
                      <p className="text-xs text-teal-600 font-medium">⏱ {h.duration}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Skills & Placement ── */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 to-blue-950 text-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-teal-400 font-semibold text-sm uppercase tracking-wider">Industry-Ready</span>
              <h2 className="text-3xl font-bold mt-2">Skills & Placement Courses</h2>
              <p className="text-slate-400 mt-3">Short-term, industry-aligned courses to boost employability fast.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {skillsSection.map((s, i) => (
                <motion.div key={i} variants={fadeUp} className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-5 hover:bg-white/15 transition-colors">
                  <Lightbulb className="w-6 h-6 text-amber-400 mb-3" />
                  <h3 className="font-bold text-white mb-1">{s.title}</h3>
                  <p className="text-xs text-slate-400 mb-2">{s.duration}</p>
                  <p className="text-xs text-teal-400">{s.jobs}</p>
                </motion.div>
              ))}
            </div>
            <motion.div variants={fadeUp} className="text-center">
              <Link href="/education" className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold px-6 py-3 rounded-xl transition-all">
                View All Courses <ArrowRight className="w-4 h-4" />
              </Link>
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
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4">Need Career Guidance After Degree?</motion.h2>
            <motion.p variants={fadeUp} className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Our expert counselors help TS/AP graduates choose the right path — government jobs, higher studies, or private sector.
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
