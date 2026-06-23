'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen, FlaskConical, TrendingUp, Palette, GraduationCap,
  ChevronRight, Star, MapPin, Phone, CheckCircle, ArrowRight,
  Building2, Users, Award, Lightbulb, Briefcase, Clock
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const streams = [
  {
    id: 'mpc',
    name: 'MPC',
    full: 'Mathematics, Physics & Chemistry',
    icon: TrendingUp,
    color: 'blue',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English'],
    careers: ['Engineering (B.Tech)', 'B.Sc Mathematics/Physics', 'Defence Services', 'Data Science', 'Architecture'],
    choose: 'Strong interest in mathematics, logical reasoning & problem-solving. Aspiring engineers & scientists.',
  },
  {
    id: 'bipc',
    name: 'BiPC',
    full: 'Biology, Physics & Chemistry',
    icon: FlaskConical,
    color: 'teal',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    badge: 'bg-teal-100 text-teal-700',
    subjects: ['Biology', 'Physics', 'Chemistry', 'English'],
    careers: ['MBBS / Medicine (NEET)', 'B.Pharmacy', 'Nursing (B.Sc)', 'Agriculture (B.Sc)', 'Biotechnology'],
    choose: 'Passionate about life sciences, healthcare, and biology. Aspiring doctors, nurses & pharmacists.',
  },
  {
    id: 'cec',
    name: 'CEC',
    full: 'Commerce, Economics & Civics',
    icon: Briefcase,
    color: 'amber',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    subjects: ['Commerce', 'Economics', 'Civics', 'English'],
    careers: ['B.Com / BBA', 'CA / CS / CMA Foundation', 'Banking & Finance', 'Civil Services (IAS/IPS)', 'MBA'],
    choose: 'Interested in business, finance, law, and administration. Future entrepreneurs & civil servants.',
  },
  {
    id: 'hec',
    name: 'HEC',
    full: 'History, Economics & Civics',
    icon: Palette,
    color: 'purple',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    subjects: ['History', 'Economics', 'Civics', 'English'],
    careers: ['BA (Arts)', 'Law (LLB / CLAT)', 'Journalism & Mass Comm.', 'Social Work', 'Teaching (TET/DSC)'],
    choose: 'Interested in social sciences, history, literature & law. Future lawyers, journalists & educators.',
  },
];

const pathways = [
  {
    title: 'Intermediate (11th & 12th)',
    duration: '2 Years',
    cost: '₹10K–₹80K/yr',
    pros: ['Opens all degree & professional courses', 'Stream-based (MPC/BiPC/CEC/HEC)', 'Required for EAMCET, NEET, JEE'],
    cons: ['2 years before higher education', 'Board exam pressure'],
    bestFor: 'Students targeting engineering, medicine, CA, or any degree course',
    color: 'blue',
  },
  {
    title: 'Polytechnic Diploma',
    duration: '3 Years',
    cost: '₹15K–₹50K/yr',
    pros: ['Job-ready in 3 years', 'Lateral entry to B.Tech (2nd year)', 'Industry-recognized diploma'],
    cons: ['Limited to technical fields', 'Lower starting salary vs B.Tech'],
    bestFor: 'Students who want early employment in technical fields',
    color: 'teal',
  },
  {
    title: 'ITI Courses',
    duration: '1–2 Years',
    cost: '₹5K–₹20K/yr',
    pros: ['Fastest path to employment', 'Trade certificates valued by industry', 'Apprenticeship opportunities'],
    cons: ['Limited career growth without further education', 'Sector-specific'],
    bestFor: 'Students who need quick employment in trades (electrician, fitter, welder etc.)',
    color: 'amber',
  },
  {
    title: 'Direct Employment',
    duration: 'Immediate',
    cost: 'N/A',
    pros: ['Immediate income', 'Skill development on the job'],
    cons: ['Limited growth without qualifications', 'Lower salary bands'],
    bestFor: 'Students in financially critical situations (can pursue open school simultaneously)',
    color: 'slate',
  },
];

const colleges = [
  // TODO: Replace with actual college data from TS/AP education boards
  { name: 'Narayana Junior College', location: 'Hyderabad, Telangana', type: 'Private', streams: 'MPC, BiPC' },
  { name: 'Sri Chaitanya Junior College', location: 'Vijayawada, AP', type: 'Private', streams: 'MPC, BiPC' },
  { name: 'Government Junior College, Warangal', location: 'Warangal, Telangana', type: 'Government', streams: 'MPC, BiPC, CEC, HEC' },
  { name: 'Bhashyam Junior College', location: 'Guntur, AP', type: 'Private', streams: 'MPC, BiPC, CEC' },
  { name: 'Government Model Junior College', location: 'Karimnagar, Telangana', type: 'Government', streams: 'MPC, BiPC, CEC, HEC' },
  { name: 'Vignan Junior College', location: 'Vizag, AP', type: 'Private', streams: 'MPC, BiPC' },
];

const schemes = [
  {
    name: 'TS ePASS Scholarship',
    state: 'Telangana',
    desc: 'Post-matric scholarship for SC, ST, BC, EBC and Minority students studying in TS institutions.',
    color: 'blue',
  },
  {
    name: 'Jagananna Vidya Deevena (AP)',
    state: 'Andhra Pradesh',
    desc: 'Full fee reimbursement for students in AP from SC/ST/BC/EBC/Minority/Kapu categories.',
    color: 'teal',
  },
  {
    name: 'Telangana Pre-Matric Scholarship',
    state: 'Telangana',
    desc: 'Financial support for students in classes 9 & 10 from weaker sections.',
    color: 'amber',
  },
  {
    name: 'YSR Vidya Deevena (AP)',
    state: 'Andhra Pradesh',
    desc: 'Complete fee reimbursement for eligible students pursuing intermediate & degree.',
    color: 'purple',
  },
];

export default function After10thPage() {
  return (
    <main className="min-h-screen bg-white font-sans">
      {/* ── Hero ── */}
      <section className="bg-blue-600 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex justify-center gap-3 mb-6">
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">Telangana</span>
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">Andhra Pradesh</span>
              <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full">Free Guide</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              What to Do After 10th Class?
            </motion.h1>
            <motion.p variants={fadeUp} className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Complete guide for students in Telangana & Andhra Pradesh — streams, pathways, colleges, and government schemes to help you make the right choice.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              <Link href="#streams" className="bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold px-6 py-3 rounded-xl transition-all">
                Explore Streams ↓
              </Link>
              <Link href="/contact" className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all border border-white/30">
                Free Counseling Call
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stream Selection ── */}
      <section id="streams" className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Step 1 — Choose Your Stream</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Intermediate Stream Guide</h2>
              <p className="text-slate-500 mt-3 max-w-xl mx-auto">Understand each stream, its subjects, and the career paths it opens for TS/AP students.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-6">
              {streams.map((s) => {
                const Icon = s.icon;
                return (
                  <motion.div key={s.id} variants={fadeUp} className={`rounded-2xl border-2 ${s.border} ${s.bg} p-6 shadow-sm hover:shadow-md transition-shadow`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-xl ${s.badge}`}><Icon className="w-5 h-5" /></div>
                      <div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.badge}`}>{s.name}</span>
                        <p className="text-slate-500 text-xs mt-0.5">{s.full}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Subjects</p>
                        <div className="flex flex-wrap gap-2">
                          {s.subjects.map(sub => (
                            <span key={sub} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-lg">{sub}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Career Paths</p>
                        <ul className="space-y-1">
                          {s.careers.map(c => (
                            <li key={c} className="flex items-center gap-2 text-sm text-slate-700">
                              <CheckCircle className="w-3.5 h-3.5 text-teal-500 shrink-0" />{c}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white/70 rounded-xl p-3 border border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-1">Who Should Choose?</p>
                        <p className="text-sm text-slate-700">{s.choose}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Path Comparison ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Step 2 — Pick a Pathway</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Pathway Comparison</h2>
              <p className="text-slate-500 mt-3 max-w-xl mx-auto">Compare Intermediate, Polytechnic, ITI & more to find the right fit for your goals.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {pathways.map((p) => (
                <motion.div key={p.title} variants={fadeUp} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col">
                  <div className="mb-4">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2">{p.title}</h3>
                    <div className="flex gap-2 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-slate-500"><Clock className="w-3 h-3" />{p.duration}</span>
                      <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">{p.cost}</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-green-600 mb-1">✅ Pros</p>
                      <ul className="space-y-1">
                        {p.pros.map(pro => <li key={pro} className="text-xs text-slate-600">• {pro}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-500 mb-1">⚠ Cons</p>
                      <ul className="space-y-1">
                        {p.cons.map(con => <li key={con} className="text-xs text-slate-500">• {con}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">Best For:</p>
                    <p className="text-xs text-slate-700 mt-1">{p.bestFor}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Popular Colleges ── */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Institutions</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Popular Colleges After 10th</h2>
              <p className="text-slate-500 mt-2 text-sm">/* TODO: Update with verified college data from TS/AP education board listings */</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {colleges.map((col, i) => (
                <motion.div key={i} variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <Building2 className="w-8 h-8 text-blue-600 shrink-0" />
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${col.type === 'Government' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {col.type}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1">{col.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-2"><MapPin className="w-3 h-3" />{col.location}</p>
                  <p className="text-xs text-teal-600 font-medium">{col.streams}</p>
                </motion.div>
              ))}
            </div>
            <motion.p variants={fadeUp} className="text-center text-slate-400 text-sm mt-6">
              {/* TODO: Add 50+ colleges with verified details, NAAC ratings, and admission links */}
              Want personalized college recommendations? <Link href="/contact" className="text-blue-600 font-semibold underline">Talk to our counselor →</Link>
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Government Schemes ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Financial Aid</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Government Scholarships & Schemes</h2>
              <p className="text-slate-500 mt-2">Don't let finances stop you — TS & AP governments offer extensive support for students.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-5">
              {schemes.map((s, i) => (
                <motion.div key={i} variants={fadeUp} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="w-6 h-6 text-amber-500" />
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.state === 'Telangana' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>{s.state}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-2">{s.name}</h3>
                  <p className="text-sm text-slate-600 mb-3">{s.desc}</p>
                  <p className="text-xs text-slate-400">
                    {/* TODO: Add exact eligibility, income limits, amount and application portal links */}
                    Application details & eligibility — <Link href="/scholarships" className="text-blue-600 underline font-medium">View Scholarships Page →</Link>
                  </p>
                </motion.div>
              ))}
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
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4">Not Sure Which Path to Take?</motion.h2>
            <motion.p variants={fadeUp} className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Our expert counselors specialize in TS/AP education pathways. Get personalized, free guidance — no obligations.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/contact" className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl">
                Book a Free Counseling Call <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
