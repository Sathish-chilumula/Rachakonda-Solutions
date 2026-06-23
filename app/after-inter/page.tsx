'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import {
  Calculator, Stethoscope, BarChart2, BookOpen,
  ChevronRight, ArrowRight, Phone, Calendar,
  CheckCircle, AlertCircle, Lightbulb, GraduationCap, Star
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

type StreamKey = 'MPC' | 'BiPC' | 'CEC' | 'HEC';

const streamData: Record<StreamKey, {
  icon: React.ElementType;
  color: string;
  tabBg: string;
  tabText: string;
  activeBg: string;
  desc: string;
  options: { title: string; desc: string; exam?: string; icon: React.ElementType }[];
}> = {
  MPC: {
    icon: Calculator,
    color: 'blue',
    tabBg: 'bg-blue-50',
    tabText: 'text-blue-700',
    activeBg: 'bg-blue-600',
    desc: 'MPC opens doors to engineering, technology, and science careers.',
    options: [
      { title: 'Engineering (B.Tech)', desc: 'Top choice for MPC students. 4-year degree in CS, ECE, Civil, Mechanical & more.', exam: 'TS EAMCET / AP EAMCET / JEE Main', icon: Calculator },
      { title: 'B.Sc (Mathematics / Physics / CS)', desc: 'Pure science degree. Great foundation for research, teaching or MSc/PhD.', exam: 'No entrance usually', icon: Star },
      { title: 'BCA (Computer Applications)', desc: 'Software-focused degree. Entry into IT industry in 3 years.', exam: 'Direct / entrance based', icon: Calculator },
      { title: 'NIT / IIT via JEE Advanced', desc: 'Premium engineering institutions. Highly competitive national-level exam.', exam: 'JEE Main → JEE Advanced', icon: Star },
      { title: 'Architecture (B.Arch)', desc: 'Design & construction of buildings. 5-year professional degree.', exam: 'NATA / JEE Paper 2', icon: Calculator },
      { title: 'Defence Services', desc: 'NDA for Navy/Air Force/Army. Written exam + SSB interview.', exam: 'NDA Exam (UPSC)', icon: GraduationCap },
    ],
  },
  BiPC: {
    icon: Stethoscope,
    color: 'teal',
    tabBg: 'bg-teal-50',
    tabText: 'text-teal-700',
    activeBg: 'bg-teal-600',
    desc: 'BiPC students lead in healthcare, life sciences, and agriculture.',
    options: [
      { title: 'MBBS (Medicine)', desc: 'Most sought-after BiPC course. 5.5 year degree to become a doctor.', exam: 'NEET UG', icon: Stethoscope },
      { title: 'B.Pharmacy', desc: '4-year professional pharmacy degree. Good scope in hospitals & pharma industry.', exam: 'TS / AP EAMCET', icon: Stethoscope },
      { title: 'B.Sc Nursing', desc: '4-year nursing degree. High demand domestically & internationally.', exam: 'TS / AP EAMCET', icon: Stethoscope },
      { title: 'BDS (Dental)', desc: 'Dentistry degree. 5-year course with strong job market.', exam: 'NEET UG', icon: Star },
      { title: 'B.Sc Agriculture', desc: '4-year agriculture degree. Growing field with government job opportunities.', exam: 'TS / AP EAMCET', icon: BookOpen },
      { title: 'B.Sc Biotechnology', desc: 'Cutting-edge field combining biology & technology. Good for research.', exam: 'Direct admission', icon: Star },
    ],
  },
  CEC: {
    icon: BarChart2,
    color: 'amber',
    tabBg: 'bg-amber-50',
    tabText: 'text-amber-700',
    activeBg: 'bg-amber-500',
    desc: 'CEC opens paths in commerce, management, law, and civil services.',
    options: [
      { title: 'B.Com (Commerce)', desc: '3-year commerce degree. Foundation for CA, MBA, banking careers.', exam: 'Direct admission', icon: BarChart2 },
      { title: 'BBA (Business Administration)', desc: '3-year management degree. MBA pathway, corporate sector entry.', exam: 'Direct / UGAT', icon: BarChart2 },
      { title: 'CA Foundation', desc: 'Chartered Accountancy — most prestigious commerce qualification.', exam: 'CA Foundation (ICAI)', icon: Star },
      { title: 'CS Foundation', desc: 'Company Secretary qualification. Corporate governance & legal compliance.', exam: 'CS Foundation (ICSI)', icon: Star },
      { title: 'B.Com (Computer Applications)', desc: 'Commerce + IT skills. Growing demand in fintech & banking sector.', exam: 'Direct admission', icon: Calculator },
      { title: 'LLB / Law Integrated', desc: '5-year integrated law program (BA LLB / BBA LLB). Legal career path.', exam: 'CLAT / TS LAWCET / AP LAWCET', icon: BookOpen },
    ],
  },
  HEC: {
    icon: BookOpen,
    color: 'purple',
    tabBg: 'bg-purple-50',
    tabText: 'text-purple-700',
    activeBg: 'bg-purple-600',
    desc: 'HEC opens doors to arts, law, education, and social sciences.',
    options: [
      { title: 'BA (Arts / Social Sciences)', desc: '3-year arts degree in History, Political Science, Sociology, Psychology etc.', exam: 'Direct admission', icon: BookOpen },
      { title: 'LLB / Integrated Law', desc: '5-year integrated law program. Premier legal career path.', exam: 'CLAT / TS LAWCET / AP LAWCET', icon: BookOpen },
      { title: 'Journalism & Mass Comm.', desc: 'BA Journalism / BMM. Career in media, PR, digital content creation.', exam: 'Direct / Entrance based', icon: Star },
      { title: 'Psychology (B.Sc/BA)', desc: 'Growing field. Leads to counseling, clinical psychology, HR.', exam: 'Direct admission', icon: Lightbulb },
      { title: 'Social Work (BSW)', desc: '3-year degree in social welfare & development. NGO/Govt sector.', exam: 'Direct admission', icon: GraduationCap },
      { title: 'Teaching (B.Ed Prep)', desc: 'BA/B.Sc first, then B.Ed. Career in teaching via TET/DSC in TS/AP.', exam: 'TS TET / AP TET after B.Ed', icon: GraduationCap },
    ],
  },
};

const vocationalOptions = [
  { title: 'Diploma in Computer Applications', duration: '1 Year', outcome: 'IT/Office jobs' },
  { title: 'Fashion Design Diploma', duration: '1–2 Years', outcome: 'Fashion industry' },
  { title: 'Hotel Management Diploma', duration: '1–3 Years', outcome: 'Hospitality sector' },
  { title: 'Animation & Multimedia', duration: '1–2 Years', outcome: 'Media & Gaming' },
  { title: 'Automobile Engineering', duration: '1 Year', outcome: 'Auto industry jobs' },
  { title: 'Healthcare Assistant', duration: '6M–1 Year', outcome: 'Hospitals & Clinics' },
];

const examTimeline = [
  { exam: 'TS EAMCET', month: 'May (approx)', body: 'JNTU Hyderabad', stream: 'MPC / BiPC' },
  { exam: 'AP EAMCET', month: 'May (approx)', body: 'APSCHE', stream: 'MPC / BiPC' },
  { exam: 'NEET UG', month: 'May (National)', body: 'NTA', stream: 'BiPC' },
  { exam: 'JEE Main', month: 'Jan & Apr', body: 'NTA', stream: 'MPC' },
  { exam: 'TS POLYCET', month: 'April (approx)', body: 'SBTET TS', stream: 'All streams' },
  { exam: 'CLAT', month: 'December', body: 'NLU Consortium', stream: 'CEC / HEC' },
];

export default function AfterInterPage() {
  const [activeStream, setActiveStream] = useState<StreamKey>('MPC');

  const current = streamData[activeStream];
  const Icon = current.icon;

  return (
    <main className="min-h-screen bg-white font-sans">
      {/* ── Hero ── */}
      <section className="bg-blue-600 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex justify-center gap-3 mb-6">
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">After Intermediate</span>
              <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full">TS & AP Students</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              What to Do After Intermediate?
            </motion.h1>
            <motion.p variants={fadeUp} className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Explore all career options after 12th based on your stream — MPC, BiPC, CEC, or HEC. Tailored for Telangana & AP students.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              <Link href="#options" className="bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold px-6 py-3 rounded-xl transition-all">
                Explore My Options ↓
              </Link>
              <Link href="/contact" className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl border border-white/30 transition-all">
                Free Counseling Call
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Tabbed Stream Options ── */}
      <section id="options" className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Stream-wise Career Guide</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Options Based on Your Stream</h2>
              <p className="text-slate-500 mt-3">Select your intermediate stream to see personalized career pathways.</p>
            </motion.div>

            {/* Tab Buttons */}
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 mb-10">
              {(Object.keys(streamData) as StreamKey[]).map((key) => {
                const SIcon = streamData[key].icon;
                const isActive = activeStream === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveStream(key)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
                      isActive
                        ? `${streamData[key].activeBg} text-white shadow-md scale-105`
                        : `${streamData[key].tabBg} ${streamData[key].tabText} hover:scale-105`
                    }`}
                  >
                    <SIcon className="w-4 h-4" /> {key}
                  </button>
                );
              })}
            </motion.div>

            {/* Tab Content */}
            <motion.div
              key={activeStream}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-xl ${current.tabBg}`}>
                    <Icon className={`w-6 h-6 ${current.tabText}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-xl">{activeStream} Stream Options</h3>
                    <p className="text-slate-500 text-sm">{current.desc}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {current.options.map((opt, i) => {
                    const OIcon = opt.icon;
                    return (
                      <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <OIcon className={`w-4 h-4 ${current.tabText}`} />
                          <h4 className="font-semibold text-slate-800 text-sm">{opt.title}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mb-3 leading-relaxed">{opt.desc}</p>
                        {opt.exam && (
                          <div className={`text-xs font-medium px-2 py-1 rounded-lg ${current.tabBg} ${current.tabText} inline-block`}>
                            📝 {opt.exam}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Vocational Alternatives ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Skill-Based Paths</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Vocational & Diploma Alternatives</h2>
              <p className="text-slate-500 mt-3">Not interested in a traditional degree? These short-term courses offer great career prospects.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vocationalOptions.map((v, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:shadow-sm transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">{v.title}</h4>
                    <p className="text-xs text-slate-500">{v.duration} • {v.outcome}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Entrance Exam Timeline ── */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Important Exams</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Entrance Exam Calendar</h2>
              <p className="text-slate-400 text-sm mt-2">
                {/* TODO: Update with official 2025-26 exam dates from NTA, JNTU, APSCHE websites */}
                Approximate months shown — verify official dates before applying
              </p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {examTimeline.map((e, i) => (
                <motion.div key={i} variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-1 rounded-full">{e.stream}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1">{e.exam}</h3>
                  <p className="text-xs text-slate-500 mb-1">Conducted by: {e.body}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs text-amber-600 font-medium">{e.month}</span>
                  </div>
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
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4">Confused About Your Next Step?</motion.h2>
            <motion.p variants={fadeUp} className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Our counselors help TS/AP intermediate students find the right course, college & career path — completely free.
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
