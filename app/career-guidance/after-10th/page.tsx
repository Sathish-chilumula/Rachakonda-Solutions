'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import {
  Calculator,
  FlaskConical,
  BookText,
  Palette,
  ChevronRight,
  ArrowRight,
  Phone,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

// ─── Stream data ──────────────────────────────────────────────────────────────
const streams = [
  {
    id: 'mpc',
    icon: <Calculator className="h-8 w-8" />,
    name: 'MPC',
    full: 'Mathematics, Physics, Chemistry',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    headerGrad: 'from-blue-600 to-blue-500',
    description:
      'MPC is the gateway to engineering, technology, and applied sciences. Ideal for students who enjoy problem-solving, numbers, and logical thinking.',
    bestFor: ['Engineering (B.Tech)', 'Computer Science', 'Data Science / AI', 'Architecture (B.Arch)', 'B.Sc Mathematics / Physics'],
    entranceExams: ['TS EAMCET', 'AP EAMCET', 'JEE Main', 'JEE Advanced', 'BITSAT', 'TS POLYCET (after 10th Diploma)'],
    salaryRange: '₹3.5 – 8 LPA starting (IT sector)',
    strongIf: ['You love solving maths problems', 'You enjoy physics experiments', 'You want a B.Tech seat'],
    weakIf: ['You dislike abstract calculations', 'Biology-based careers interest you more'],
  },
  {
    id: 'bipc',
    icon: <FlaskConical className="h-8 w-8" />,
    name: 'BiPC',
    full: 'Biology, Physics, Chemistry',
    color: 'bg-teal-50 text-teal-600 border-teal-200',
    headerGrad: 'from-teal-500 to-teal-400',
    description:
      'BiPC opens doors to medicine, pharmacy, agriculture, and life sciences. It\'s the path for students passionate about living organisms and health sciences.',
    bestFor: ['MBBS / BDS via NEET', 'B.Pharm via TS/AP EAMCET', 'B.Sc Agriculture', 'B.Sc Biotech / Microbiology', 'Nursing / Physiotherapy'],
    entranceExams: ['NEET-UG', 'TS EAMCET (BiPC)', 'AP EAMCET (BiPC)', 'AIIMS', 'JIPMER'],
    salaryRange: '₹4 – 10 LPA (doctors after PG: ₹10–25 LPA)',
    strongIf: ['You dream of becoming a doctor', 'You enjoy biology / life sciences', 'Healthcare careers excite you'],
    weakIf: ['Maths-heavy engineering is your goal', 'You dislike memorization of biology'],
  },
  {
    id: 'cec',
    icon: <BookText className="h-8 w-8" />,
    name: 'CEC',
    full: 'Commerce, Economics, Civics',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    headerGrad: 'from-amber-500 to-amber-400',
    description:
      'CEC is the foundation for business, finance, law, and public administration careers. Strong choice for future entrepreneurs, bankers, and civil servants.',
    bestFor: ['B.Com / BBA', 'CA Foundation → CA', 'CS Foundation → Company Secretary', 'Economics Honours', 'Law (CLAT / TS LAWCET)', 'UPSC / TSPSC / APPSC'],
    entranceExams: ['TS ICET (for MBA)', 'AP ICET', 'CLAT (for Law)', 'TS LAWCET', 'IPCC (CA)', 'UPSC CSE'],
    salaryRange: '₹3 – 8 LPA; CAs can earn ₹8–20 LPA',
    strongIf: ['You enjoy economics and markets', 'Business / entrepreneurship interests you', 'You want a govt admin career'],
    weakIf: ['You dislike finance or accounts', 'Technical / science careers are your goal'],
  },
  {
    id: 'hec',
    icon: <Palette className="h-8 w-8" />,
    name: 'HEC',
    full: 'History, Economics, Civics',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    headerGrad: 'from-purple-600 to-purple-500',
    description:
      'HEC suits students inclined towards humanities, social sciences, arts, journalism, and public services. A creative and socially conscious stream.',
    bestFor: ['BA in History / Political Science / Sociology', 'Journalism & Mass Communication', 'Social Work (BSW)', 'Law (CLAT / TS LAWCET)', 'UPSC Civil Services', 'Teaching / Education'],
    entranceExams: ['CLAT (Law)', 'TS LAWCET', 'UPSC CSE', 'State-level journalism entrance', 'TSPSC / APPSC Group exams'],
    salaryRange: '₹2.5 – 6 LPA; IAS/IPS officers earn ₹56K–2.5L/month',
    strongIf: ['History & social sciences fascinate you', 'You want to serve society / governance', 'Writing and communication are your strengths'],
    weakIf: ['STEM careers are your goal', 'You prefer technical / quantitative work'],
  },
];

// ─── Quiz questions ───────────────────────────────────────────────────────────
type QuizAnswer = 'a' | 'b' | 'c' | 'd' | null;

const quizQuestions = [
  {
    id: 'q1',
    question: 'Which subject do you enjoy the most right now?',
    options: [
      { value: 'a', label: 'Maths & Physics — I love solving problems' },
      { value: 'b', label: 'Biology & Chemistry — understanding living things' },
      { value: 'c', label: 'Economics & Business — markets and trade' },
      { value: 'd', label: 'History & Civics — society and governance' },
    ],
  },
  {
    id: 'q2',
    question: 'What is your dream career?',
    options: [
      { value: 'a', label: 'Engineer / Software Developer / Scientist' },
      { value: 'b', label: 'Doctor / Pharmacist / Agricultural Officer' },
      { value: 'c', label: 'CA / Banker / Entrepreneur / Lawyer' },
      { value: 'd', label: 'IAS/IPS Officer / Journalist / Teacher' },
    ],
  },
  {
    id: 'q3',
    question: 'Which type of work excites you?',
    options: [
      { value: 'a', label: 'Building apps, machines, or solving equations' },
      { value: 'b', label: 'Treating patients, running lab tests, growing crops' },
      { value: 'c', label: 'Running a business, managing accounts, advising clients' },
      { value: 'd', label: 'Writing, public speaking, or serving communities' },
    ],
  },
];

const streamMap: Record<string, string> = { a: 'MPC', b: 'BiPC', c: 'CEC', d: 'HEC' };

function getRecommendation(answers: (QuizAnswer)[]): string {
  const counts: Record<string, number> = { a: 0, b: 0, c: 0, d: 0 };
  answers.forEach((a) => { if (a) counts[a]++; });
  const top = Object.entries(counts).sort((x, y) => y[1] - x[1])[0][0];
  return streamMap[top];
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function After10thPage() {
  const [answers, setAnswers] = useState<QuizAnswer[]>([null, null, null]);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (qIndex: number, val: QuizAnswer) => {
    const next = [...answers];
    next[qIndex] = val;
    setAnswers(next);
  };

  const handleSubmit = () => setShowResult(true);
  const handleReset = () => { setAnswers([null, null, null]); setShowResult(false); };

  const recommendation = getRecommendation(answers);

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
            <span className="text-white font-medium">After 10th</span>
          </motion.nav>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5"
          >
            Stream Selection Guide for{' '}
            <span className="text-teal-300">SSC Students in TS &amp; AP</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2 }}
            className="text-blue-100 text-lg max-w-2xl mx-auto"
          >
            MPC, BiPC, CEC or HEC? Your Intermediate stream shapes your next 5 years.
            Here&apos;s everything you need to make the right choice.
          </motion.p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 20C1200 55 960 0 720 25C480 50 240 5 0 30Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Stream cards */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
              The Four Streams
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Know Your Options
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Each Intermediate stream in TS &amp; AP boards opens a distinct set of career doors. Understand them deeply before choosing.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {streams.map((s) => (
            <motion.div key={s.id} variants={fadeUp} className={`border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${s.color}`}>
              <div className={`bg-gradient-to-r ${s.headerGrad} p-6 text-white flex items-center gap-4`}>
                <div className="bg-white/20 rounded-xl p-3">{s.icon}</div>
                <div>
                  <p className="text-white/70 text-sm font-medium">{s.full}</p>
                  <h3 className="text-2xl font-extrabold">{s.name}</h3>
                </div>
              </div>
              <div className="bg-white p-6 space-y-5">
                <p className="text-slate-600 text-sm leading-relaxed">{s.description}</p>

                <div>
                  <h4 className="font-bold text-slate-900 mb-2 text-sm">Best Career Paths</h4>
                  <ul className="space-y-1">
                    {s.bestFor.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-slate-600 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" /> {b}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-2 text-sm">Key Entrance Exams</h4>
                  <div className="flex flex-wrap gap-2">
                    {s.entranceExams.map((e) => (
                      <span key={e} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">Choose if...</p>
                    {s.strongIf.map((x) => (
                      <p key={x} className="text-xs text-green-700 flex items-start gap-1">
                        <span className="text-green-500 font-bold mt-0.5">✓</span> {x}
                      </p>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">Reconsider if...</p>
                    {s.weakIf.map((x) => (
                      <p key={x} className="text-xs text-red-700 flex items-start gap-1">
                        <span className="text-red-400 font-bold mt-0.5">✗</span> {x}
                      </p>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                  💰 Typical Earnings: <span className="font-semibold text-slate-700">{s.salaryRange}</span>
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Quiz */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="text-center mb-10">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
                Decision Helper
              </span>
              <h2 className="text-3xl font-bold text-slate-900 mb-3 flex items-center justify-center gap-2">
                <HelpCircle className="h-7 w-7 text-blue-600" />
                Which Stream Is Right for You?
              </h2>
              <p className="text-slate-500">Answer 3 quick questions to get a personalized stream recommendation.</p>
            </div>
          </motion.div>

          {!showResult ? (
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-8">
              {quizQuestions.map((q, qi) => (
                <motion.div key={q.id} variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <p className="font-bold text-slate-900 mb-4 text-base">
                    <span className="text-blue-600 font-extrabold mr-2">Q{qi + 1}.</span> {q.question}
                  </p>
                  <div className="space-y-3">
                    {q.options.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-3 cursor-pointer rounded-xl border px-4 py-3 transition-all ${
                          answers[qi] === opt.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt.value}
                          checked={answers[qi] === opt.value}
                          onChange={() => handleAnswer(qi, opt.value as QuizAnswer)}
                          className="sr-only"
                        />
                        <span
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            answers[qi] === opt.value ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                          }`}
                        >
                          {answers[qi] === opt.value && <span className="w-2 h-2 bg-white rounded-full" />}
                        </span>
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </motion.div>
              ))}

              <div className="text-center">
                <button
                  onClick={handleSubmit}
                  disabled={answers.some((a) => a === null)}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold px-10 py-3 rounded-xl transition-colors shadow-md"
                >
                  See My Recommendation
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border-2 border-blue-200 shadow-md p-8 text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-slate-500 mb-2 text-sm">Based on your answers, we recommend</p>
              <h3 className="text-4xl font-extrabold text-blue-600 mb-3">{recommendation}</h3>
              <p className="text-slate-600 max-w-md mx-auto mb-6 text-sm">
                {/* TODO: Add personalized explanation per stream */}
                This stream aligns well with your interests and career goals. Scroll up to read the detailed guide for {recommendation}.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleReset}
                  className="border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold px-6 py-2.5 rounded-xl transition-colors"
                >
                  Retake Quiz
                </button>
                <Link
                  href="/contact"
                  className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
                >
                  Talk to a Counselor
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Career Outcomes by Stream */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
              5-Year Preview
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Career Outcomes by Stream</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Where will you be 5 years from now? Here&apos;s a realistic preview based on your stream choice.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  {['Stream', 'After Intermediate', 'UG Degree', '5-Year Career', 'Typical Pay'].map((h) => (
                    <th key={h} className="text-left px-5 py-4 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { stream: 'MPC', inter: 'TS/AP EAMCET, JEE', ug: 'B.Tech / B.Sc', career: 'Software Engineer / Data Scientist', pay: '₹5–12 LPA' },
                  { stream: 'BiPC', inter: 'NEET, TS EAMCET', ug: 'MBBS / B.Pharm / B.Sc Ag', career: 'Doctor / Pharmacist / Agri Officer', pay: '₹4–15 LPA' },
                  { stream: 'CEC', inter: 'ICET, CLAT, CA Foundation', ug: 'B.Com / BBA / CA', career: 'CA / Manager / Entrepreneur', pay: '₹4–18 LPA' },
                  { stream: 'HEC', inter: 'UPSC, TS LAWCET', ug: 'BA / Law / Journalism', career: 'IAS/IPS / Lawyer / Journalist', pay: '₹3–10 LPA' },
                ].map((row, i) => (
                  <tr key={row.stream} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-5 py-4 font-bold text-blue-600">{row.stream}</td>
                    <td className="px-5 py-4 text-slate-600">{row.inter}</td>
                    <td className="px-5 py-4 text-slate-600">{row.ug}</td>
                    <td className="px-5 py-4 text-slate-700 font-medium">{row.career}</td>
                    <td className="px-5 py-4 text-teal-700 font-semibold">{row.pay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* TS & AP Board Info */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Official Board Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                {
                  state: 'Telangana',
                  board: 'Board of Intermediate Education, Telangana (TSBIE)',
                  // TODO: Update with official TSBIE website URL
                  url: '#',
                  color: 'border-blue-200 bg-blue-50',
                  textColor: 'text-blue-700',
                },
                {
                  state: 'Andhra Pradesh',
                  board: 'Board of Intermediate Education, AP (BIEAP)',
                  // TODO: Update with official BIEAP website URL
                  url: '#',
                  color: 'border-teal-200 bg-teal-50',
                  textColor: 'text-teal-700',
                },
              ].map((b) => (
                <a
                  key={b.state}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-start gap-4 border rounded-2xl p-5 hover:shadow-md transition-shadow ${b.color}`}
                >
                  <ExternalLink className={`h-5 w-5 mt-0.5 shrink-0 ${b.textColor}`} />
                  <div>
                    <p className={`font-bold ${b.textColor}`}>{b.state} — Official Board</p>
                    <p className="text-slate-600 text-sm mt-1">{b.board}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {/* TODO: Add official URL text */}
                      Visit official website for syllabus, time-tables & results
                    </p>
                  </div>
                </a>
              ))}
            </div>
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
            Still Confused About Which Stream?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Our counselors have helped hundreds of TS &amp; AP students choose the right Intermediate stream.
            Book a free call today.
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
