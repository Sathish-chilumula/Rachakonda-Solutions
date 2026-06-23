'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  Phone,
  ChevronRight,
  CheckCircle2,
  Globe,
  GraduationCap,
  Briefcase,
  FlaskConical,
  Scale,
  TrendingUp,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

// ─── PG Path data ─────────────────────────────────────────────────────────────
const pgPaths = [
  {
    id: 'mba',
    icon: <Briefcase className="h-7 w-7" />,
    title: 'MBA',
    tagline: 'Management & Business Leadership',
    color: 'from-blue-600 to-blue-500',
    badgeColor: 'bg-blue-100 text-blue-700',
    overview:
      'MBA remains one of the most sought-after postgraduate programs among graduates in TS & AP. TS ICET and AP ICET are the primary gateway exams for MBA admissions in state colleges, while CAT and XAT open doors to top national B-schools.',
    exams: [
      { name: 'TS ICET', by: 'Osmania University', eligibility: 'Any degree (50% marks)', note: 'State-level — for TS MBA colleges' },
      { name: 'AP ICET', by: 'Sri Venkateswara University', eligibility: 'Any degree (50% marks)', note: 'State-level — for AP MBA colleges' },
      { name: 'CAT', by: 'IIMs (rotating)', eligibility: 'Any degree (50% marks)', note: 'National — IIMs, FMS, MDI, SPJIMR' },
      { name: 'XAT', by: 'XLRI Jamshedpur', eligibility: 'Any degree', note: 'For XLRI and 150+ B-schools' },
    ],
    topColleges: [
      'IIM Calcutta / Bangalore (via CAT)',
      'XLRI Jamshedpur (via XAT)',
      'University of Hyderabad School of Management',
      'Osmania University MBA (via TS ICET)',
      'ISB Hyderabad (Executive MBA)',
      'GITAM Institute of Management, Vizag',
    ],
    duration: '2 years',
    salary: '₹5–25 LPA (varies by college)',
  },
  {
    id: 'mtech',
    icon: <TrendingUp className="h-7 w-7" />,
    title: 'M.Tech',
    tagline: 'Advanced Engineering & Technology',
    color: 'from-teal-500 to-teal-400',
    badgeColor: 'bg-teal-100 text-teal-700',
    overview:
      'M.Tech through GATE is the premium postgraduate route for B.Tech graduates. JNTUH, JNTUA, Osmania University, and NITs in TS/AP offer excellent M.Tech programs. GATE score is also valid for PSU recruitment.',
    exams: [
      { name: 'GATE', by: 'IITs (rotating)', eligibility: 'B.Tech / B.E. / B.Sc (Engineering)', note: 'National-level; valid for IITs, NITs, PSUs' },
      { name: 'TS PGECET', by: 'Osmania University', eligibility: 'B.Tech (TS students)', note: 'State-level M.Tech entrance for TS' },
      { name: 'AP PGECET', by: 'Andhra University', eligibility: 'B.Tech (AP students)', note: 'State-level M.Tech entrance for AP' },
    ],
    topColleges: [
      'IIT Hyderabad — multiple M.Tech specializations',
      'NIT Warangal — top 10 nationally',
      'NIT Andhra Pradesh (Tadepalligudem)',
      'JNTUH (Hyderabad) — wide M.Tech options',
      'JNTUA (Anantapur)',
      'Osmania University, Hyderabad',
    ],
    duration: '2 years',
    salary: '₹6–20 LPA (IIT M.Tech graduates)',
  },
  {
    id: 'ms',
    icon: <Globe className="h-7 w-7" />,
    title: 'MS Abroad',
    tagline: 'International Masters Degree',
    color: 'from-indigo-600 to-indigo-500',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    overview:
      'Thousands of students from Telangana and Andhra Pradesh pursue MS degrees in the USA, UK, Canada, and Australia every year. With proper GRE / IELTS / TOEFL scores and a strong Statement of Purpose, students from top TS/AP engineering colleges secure admissions and scholarships.',
    exams: [
      { name: 'GRE', by: 'ETS', eligibility: 'Any UG degree', note: 'Required for US, Canadian universities' },
      { name: 'IELTS', by: 'British Council / IDP', eligibility: 'Any UG degree', note: 'English proficiency — UK, Australia, Canada' },
      { name: 'TOEFL', by: 'ETS', eligibility: 'Any UG degree', note: 'English proficiency — primarily USA' },
    ],
    topColleges: [
      // TODO: Update with specific university names and rankings
      'USA: State Universities of NY, Texas, Arizona',
      'UK: University of Bristol, Sheffield, Southampton',
      'Canada: University of Waterloo, McMaster',
      'Australia: University of Melbourne, UNSW',
      'Germany: Technical University Munich (tuition-free)',
    ],
    duration: '1.5–2 years',
    salary: 'USD 70,000–120,000 (USA entry level)',
  },
  {
    id: 'msc',
    icon: <FlaskConical className="h-7 w-7" />,
    title: 'M.Sc / M.Com / MA',
    tagline: 'Pure Science, Commerce & Arts Masters',
    color: 'from-purple-600 to-purple-500',
    badgeColor: 'bg-purple-100 text-purple-700',
    overview:
      'M.Sc programs in Mathematics, Physics, Chemistry, Biotech, and CS are offered by Osmania, Andhra University, and IIT Hyderabad. M.Com and MA programs open paths to teaching, research, and public sector roles.',
    exams: [
      { name: 'CUET-PG', by: 'NTA', eligibility: 'Relevant UG degree', note: 'For central university M.Sc admissions' },
      { name: 'IIT JAM', by: 'IITs', eligibility: 'B.Sc in relevant subject', note: 'For M.Sc at IITs and NITs' },
      { name: 'State Entrance / Merit', by: 'OU / AU / SVU', eligibility: 'Relevant UG with 50%+', note: 'TS/AP state university admissions' },
    ],
    topColleges: [
      'IIT Hyderabad — M.Sc Chemistry, Physics, Maths',
      'University of Hyderabad — sciences, humanities',
      'Osmania University — M.Sc, M.Com, MA programmes',
      'Andhra University — M.Sc, MA, M.Com',
    ],
    duration: '2 years',
    salary: '₹3–8 LPA; higher after PhD / NET-JRF',
  },
  {
    id: 'law',
    icon: <Scale className="h-7 w-7" />,
    title: 'LLM (Law PG)',
    tagline: 'Postgraduate Law Studies',
    color: 'from-amber-600 to-amber-500',
    badgeColor: 'bg-amber-100 text-amber-700',
    overview:
      'LLM is the postgraduate law degree for those who completed their LLB. Specializations include Constitutional Law, Corporate Law, Criminal Law, and International Law. Strong demand in legal firms and the judiciary.',
    exams: [
      { name: 'CLAT-PG', by: 'Consortium of NLUs', eligibility: 'LLB degree', note: 'For NLU LLM admissions nationally' },
      { name: 'TS LAWCET (PG)', by: 'OU', eligibility: 'LLB degree', note: 'For TS state law colleges' },
      { name: 'AP LAWCET (PG)', by: 'ANU', eligibility: 'LLB degree', note: 'For AP state law colleges' },
    ],
    topColleges: [
      'NALSAR University of Law, Hyderabad (top 3 nationally)',
      'DSNLU, Visakhapatnam',
      'Osmania University Law College',
      'Andhra University Law Department',
    ],
    duration: '1–2 years',
    salary: '₹5–20 LPA (senior advocate: much higher)',
  },
  {
    id: 'phd',
    icon: <GraduationCap className="h-7 w-7" />,
    title: 'PhD & Research Fellowships',
    tagline: 'Doctoral Research & NET/JRF',
    color: 'from-slate-700 to-slate-600',
    badgeColor: 'bg-slate-100 text-slate-700',
    overview:
      'For students passionate about research, a PhD opens paths to academic and industry research careers. UGC-NET/JRF fellowship provides ₹31,000–35,000/month stipend during PhD. CSIR-NET, DBT-JRF, and ICMR fellowships are available for science students.',
    exams: [
      { name: 'UGC-NET / JRF', by: 'NTA', eligibility: 'Masters degree in relevant subject', note: 'Eligibility for PhD + JRF fellowship funding' },
      { name: 'CSIR-NET', by: 'CSIR', eligibility: 'M.Sc Science', note: 'For science research & junior research fellowship' },
      { name: 'GATE (PhD route)', by: 'IITs', eligibility: 'B.Tech / M.Sc', note: 'For PhD at IITs/NITs with MHRD fellowship' },
    ],
    topColleges: [
      'IIT Hyderabad — research-intensive environment',
      'University of Hyderabad — humanities, science, social science',
      'CSIR-IICT (Hyderabad) — Chemistry & Biotech research',
      'ICRISAT (Hyderabad) — Agriculture research',
      'Osmania University — multidisciplinary PhD programs',
    ],
    duration: '3–5 years',
    salary: 'JRF: ₹31,000–35,000/month during PhD; ₹6–20 LPA post-PhD',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PostgraduatePage() {
  const [activeId, setActiveId] = useState<string>('mba');
  const active = pgPaths.find((p) => p.id === activeId)!;

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
            <span className="text-white font-medium">Postgraduate</span>
          </motion.nav>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5"
          >
            Masters &amp; Postgraduate Options{' '}
            <span className="text-teal-300">in Telangana &amp; AP</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2 }}
            className="text-blue-100 text-lg max-w-2xl mx-auto"
          >
            MBA, M.Tech, MS Abroad, PhD and more — entrance exams, top colleges, timelines,
            and real salary data for graduates from TS &amp; AP.
          </motion.p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 20C1200 55 960 0 720 25C480 50 240 5 0 30Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* PG Path Explorer */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
              PG Paths
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Choose Your Postgraduate Path</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Click a path below to explore entrance exams, top colleges, duration, and salary expectations.
            </p>
          </div>
        </motion.div>

        {/* Path tab buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {pgPaths.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border transition-all ${
                activeId === p.id
                  ? `bg-gradient-to-r ${p.color} text-white border-transparent shadow-md`
                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {p.icon} {p.title}
            </button>
          ))}
        </div>

        {/* Active path detail */}
        <motion.div
          key={activeId}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden"
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${active.color} p-8 text-white`}>
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-white/20 rounded-xl p-3">{active.icon}</div>
              <div>
                <p className="text-white/70 text-sm">{active.tagline}</p>
                <h2 className="text-3xl font-extrabold">{active.title}</h2>
              </div>
            </div>
            <p className="text-white/90 text-sm max-w-3xl leading-relaxed">{active.overview}</p>
            <div className="mt-4 flex flex-wrap gap-4">
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                ⏱ Duration: {active.duration}
              </span>
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                💰 {active.salary}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Exams */}
            <div>
              <h3 className="font-bold text-slate-900 mb-4 text-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> Entrance Exams
              </h3>
              <div className="space-y-3">
                {active.exams.map((exam) => (
                  <div key={exam.name} className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{exam.name}</h4>
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full shrink-0">{exam.by}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Eligibility: {exam.eligibility}</p>
                    <p className="text-xs text-teal-700 mt-1 font-medium">→ {exam.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Colleges */}
            <div>
              <h3 className="font-bold text-slate-900 mb-4 text-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" /> Top Colleges
              </h3>
              <ul className="space-y-2">
                {active.topColleges.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-slate-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                    {c}
                    {/* TODO: Add individual college links */}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Study Abroad CTA */}
      <section className="bg-indigo-50 border-y border-indigo-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <Globe className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Planning to Study Abroad?</h2>
            <p className="text-slate-600 mb-6 max-w-lg mx-auto text-sm">
              We offer dedicated Study Abroad counseling — from shortlisting universities to SOP review, visa guidance, and scholarship applications.
              {/* TODO: Link to /education/study-abroad once page is created */}
            </p>
            <Link
              href="/education"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-3 rounded-xl transition-colors shadow-md"
            >
              Explore Study Abroad Guidance <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quick comparison table */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">PG Programs — Quick Comparison</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  {['Program', 'Key Exam', 'Duration', 'Best For', 'Avg Starting Salary'].map((h) => (
                    <th key={h} className="text-left px-5 py-4 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pgPaths.map((p, i) => (
                  <tr key={p.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-5 py-4 font-bold text-slate-900">{p.title}</td>
                    <td className="px-5 py-4 text-slate-600">{p.exams[0].name}</td>
                    <td className="px-5 py-4 text-slate-600">{p.duration}</td>
                    <td className="px-5 py-4 text-slate-600">{p.tagline}</td>
                    <td className="px-5 py-4 text-teal-700 font-semibold">{p.salary.split(';')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-slate-900">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="max-w-2xl mx-auto px-4 text-center"
        >
          <Phone className="h-10 w-10 text-teal-300 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Get Personalized PG Guidance
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Our counselors help you choose the right PG program based on your UG marks, interests, and career goals — free of charge.
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
