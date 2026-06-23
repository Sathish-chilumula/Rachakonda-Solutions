'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import {
  Calculator,
  FlaskConical,
  BookText,
  Palette,
  ArrowRight,
  Phone,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

// ─── Stream path data ─────────────────────────────────────────────────────────
const streamPaths = [
  {
    id: 'mpc',
    icon: <Calculator className="h-7 w-7" />,
    name: 'MPC Stream',
    color: 'from-blue-600 to-blue-500',
    badgeColor: 'bg-blue-100 text-blue-700',
    paths: [
      {
        title: 'Engineering (B.Tech) via TS/AP EAMCET',
        highlight: true,
        desc: 'The most popular path for MPC students. TS EAMCET and AP EAMCET are conducted every year for admission to B.Tech programmes in state government and private engineering colleges.',
        exams: ['TS EAMCET (JNTUH)', 'AP EAMCET (JNTUA)'],
        colleges: ['Osmania University', 'JNTUH', 'JNTUA', 'Top private colleges in Hyderabad'],
        duration: '4 years',
        // TODO: Add actual cutoff ranks
        note: 'Rank matters — aim for under 10,000 for top colleges.',
      },
      {
        title: 'IIT / NIT via JEE Main & Advanced',
        highlight: false,
        desc: 'JEE Main is a national entrance for NITs and IITs (via Advanced). Highly competitive but highly rewarding for dedicated students in TS/AP.',
        exams: ['JEE Main (NTA)', 'JEE Advanced (IIT Council)'],
        colleges: ['IIT Hyderabad', 'NIT Warangal', 'NIT Andhra Pradesh', 'NIT Calicut'],
        duration: '4 years',
        note: 'Prepare 2 years before with dedicated coaching.',
      },
      {
        title: 'B.Sc Mathematics / Physics / Statistics',
        highlight: false,
        desc: 'Excellent for students who enjoy pure science. Opens paths to research, data science, and GATE-based M.Sc / M.Tech admissions.',
        exams: ['University admissions (merit-based)'],
        colleges: ['Osmania University', 'Andhra University', 'Central universities'],
        duration: '3 years',
        note: 'Follow up with M.Sc and NET/JRF for teaching/research careers.',
      },
    ],
  },
  {
    id: 'bipc',
    icon: <FlaskConical className="h-7 w-7" />,
    name: 'BiPC Stream',
    color: 'from-teal-500 to-teal-400',
    badgeColor: 'bg-teal-100 text-teal-700',
    paths: [
      {
        title: 'MBBS / BDS via NEET-UG',
        highlight: true,
        desc: 'NEET-UG is the single national entrance for all MBBS and BDS seats across India, including government medical colleges in Telangana and Andhra Pradesh.',
        exams: ['NEET-UG (NTA)'],
        colleges: ['Osmania Medical College', 'Gandhi Medical College', 'NTR University colleges', 'KIMS, AIG (private)'],
        duration: '5.5 years (MBBS) / 5 years (BDS)',
        note: '550+ marks needed for government college seats in TS/AP.',
      },
      {
        title: 'B.Pharm via TS/AP EAMCET (BiPC)',
        highlight: false,
        desc: 'Pharmacy is a growing field. BiPC students can join B.Pharm through TS/AP EAMCET and later pursue M.Pharm, PharmD, or regulatory affairs careers.',
        exams: ['TS EAMCET', 'AP EAMCET'],
        colleges: ['BITS Pilani (Hyderabad)', 'Osmania University', 'JSP colleges AP'],
        duration: '4 years',
        note: 'Strong industry demand in Hyderabad pharma corridor.',
      },
      {
        title: 'B.Sc Agriculture via TS/AP EAMCET (BiPC)',
        highlight: false,
        desc: 'Great for students from agricultural families or those interested in agri-business, horticulture, or government agriculture officer roles.',
        exams: ['TS EAMCET (AgriStream)', 'AP EAMCET (AgriStream)'],
        colleges: ['PJTSAU (Hyderabad)', 'ANGRAU (Andhra Pradesh)'],
        duration: '4 years',
        note: 'Good government job opportunities via TSPSC / APPSC Agriculture Officer.',
      },
      {
        title: 'B.Sc Life Sciences (Biotech / Microbiology)',
        highlight: false,
        desc: 'For students who love biology but may not clear NEET. Opens research, biotech industry, and higher study paths.',
        exams: ['University merit / CUET'],
        colleges: ['Osmania University', 'University of Hyderabad', 'JNTU colleges'],
        duration: '3 years',
        note: 'Complement with M.Sc and NET/JRF for research careers.',
      },
    ],
  },
  {
    id: 'cec',
    icon: <BookText className="h-7 w-7" />,
    name: 'CEC Stream',
    color: 'from-amber-500 to-amber-400',
    badgeColor: 'bg-amber-100 text-amber-700',
    paths: [
      {
        title: 'B.Com / BBA (Business & Commerce)',
        highlight: false,
        desc: 'Foundation for banking, finance, and business careers. B.Com with CA Foundation is the gold standard for commerce students in TS/AP.',
        exams: ['University direct admission / merit'],
        colleges: ['Osmania University', 'Andhra University', 'Nizam College', 'top autonomous colleges'],
        duration: '3 years',
        note: 'Pursue CA Foundation alongside B.Com for best career outcomes.',
      },
      {
        title: 'CA Foundation → Chartered Accountant',
        highlight: true,
        desc: 'The CA qualification by ICAI is one of India\'s most respected professional credentials. Start with CA Foundation registration during or after Intermediate.',
        exams: ['CA Foundation (ICAI)', 'CA Inter', 'CA Final'],
        colleges: ['ICAI registered coaching — Hyderabad, Vijayawada, Visakhapatnam'],
        duration: '3–5 years (varies)',
        note: 'Register on the ICAI portal as soon as Intermediate results are declared.',
      },
      {
        title: 'CS Foundation → Company Secretary',
        highlight: false,
        desc: 'CS is a growing professional qualification. Company secretaries are essential for corporate governance, legal compliance, and board management.',
        exams: ['CS Foundation (ICSI)', 'CS Executive', 'CS Professional'],
        colleges: ['ICSI chapters — Hyderabad, Vijayawada'],
        duration: '3–4 years',
        note: 'Can be pursued alongside B.Com for dual qualification.',
      },
      {
        title: 'Law (CLAT / TS LAWCET / AP LAWCET)',
        highlight: false,
        desc: 'Law is an excellent path for CEC students. CLAT for NLUs and TS/AP LAWCET for state law colleges. 5-year integrated BA-LLB or 3-year LLB after any degree.',
        exams: ['CLAT', 'TS LAWCET', 'AP LAWCET'],
        colleges: ['NALSAR University of Law (Hyderabad)', 'DSNLU (Visakhapatnam)', 'Osmania Law College'],
        duration: '5 years (integrated) or 3 years (after graduation)',
        note: 'NALSAR is one of India\'s top 5 law schools.',
      },
    ],
  },
  {
    id: 'hec',
    icon: <Palette className="h-7 w-7" />,
    name: 'HEC Stream',
    color: 'from-purple-600 to-purple-500',
    badgeColor: 'bg-purple-100 text-purple-700',
    paths: [
      {
        title: 'BA (Arts & Social Sciences)',
        highlight: false,
        desc: 'BA in History, Political Science, Economics, Sociology, or Psychology provides a strong foundation for civil services, teaching, and research.',
        exams: ['University merit / CUET'],
        colleges: ['Osmania University', 'Andhra University', 'University of Hyderabad'],
        duration: '3 years',
        note: 'Pair with civil services coaching for IAS/IPS preparation.',
      },
      {
        title: 'Law via CLAT / TS LAWCET / AP LAWCET',
        highlight: true,
        desc: 'HEC students are well-prepared for law due to their background in history and civics. 5-year integrated BA-LLB is the preferred route.',
        exams: ['CLAT', 'TS LAWCET', 'AP LAWCET'],
        colleges: ['NALSAR (Hyderabad)', 'DSNLU (Vizag)', 'Osmania Law College'],
        duration: '5 years (integrated BA-LLB)',
        note: 'NALSAR ranks in top 3 law schools nationally.',
      },
      {
        title: 'Journalism & Mass Communication (BJMC)',
        highlight: false,
        desc: 'An emerging field with opportunities in digital media, broadcasting, PR, and content creation. Strong spoken Telugu and Telugu media ecosystem in TS/AP.',
        exams: ['University entrance / merit'],
        colleges: ['Osmania University (MJMC)', 'University of Hyderabad', 'Andhra University'],
        duration: '3 years',
        note: 'Internships with Telugu news channels are highly recommended.',
      },
      {
        title: 'UPSC / TSPSC / APPSC Civil Services Prep',
        highlight: false,
        desc: 'Many HEC students target civil services directly. Start graduation in relevant subjects and begin optional subject preparation in Year 2 of UG.',
        exams: ['UPSC CSE', 'TSPSC Group 1', 'APPSC Group 1'],
        colleges: ['Self-study + coaching — Hyderabad (Abids), Vijayawada'],
        duration: 'Ongoing (parallel with degree)',
        note: 'Telugu medium optional (History/Polity) is available in UPSC CSE.',
      },
    ],
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function After12thPage() {
  const [activeStream, setActiveStream] = useState<string>('mpc');
  const currentStream = streamPaths.find((s) => s.id === activeStream)!;

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
            <span className="text-white font-medium">After Intermediate</span>
          </motion.nav>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5"
          >
            Your Options After{' '}
            <span className="text-teal-300">Intermediate (12th)</span>
            {' '}in Telangana &amp; AP
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2 }}
            className="text-blue-100 text-lg max-w-2xl mx-auto"
          >
            Engineering, medicine, law, commerce or civil services — every path explained
            with entrance exams, top colleges, and realistic timelines.
          </motion.p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 20C1200 55 960 0 720 25C480 50 240 5 0 30Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Stream Selector + Paths */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
              Select Your Stream
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Career Paths After Intermediate</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Click on your stream to see all available career paths, entrance exams, and top colleges.
            </p>
          </div>

          {/* Stream tabs */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {streamPaths.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStream(s.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold border text-sm transition-all ${
                  activeStream === s.id
                    ? `bg-gradient-to-r ${s.color} text-white border-transparent shadow-md`
                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {s.icon} {s.name}
              </button>
            ))}
          </div>

          {/* Path cards */}
          <motion.div
            key={activeStream}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {currentStream.paths.map((path) => (
              <div
                key={path.title}
                className={`rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow ${path.highlight ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}`}
              >
                {path.highlight && (
                  <span className="inline-block text-xs font-bold uppercase tracking-wide text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full mb-3">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-slate-900 mb-2">{path.title}</h3>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">{path.desc}</p>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Entrance Exams</p>
                    <div className="flex flex-wrap gap-2">
                      {path.exams.map((e) => (
                        <span key={e} className="text-xs bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full">{e}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Top Colleges</p>
                    <ul className="space-y-0.5">
                      {path.colleges.map((c) => (
                        <li key={c} className="flex items-center gap-1.5 text-slate-600">
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal-500 shrink-0" /> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">Duration:</span> {path.duration}
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    💡 {path.note}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Vocational / Skills Alternatives */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="text-center mb-10">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
                Alternative Routes
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Vocational &amp; Skill Courses</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-sm">
                Degree isn&apos;t the only path. Skill-based programs lead to strong careers in tech, hospitality, and more.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { title: 'Full Stack Web Development', duration: '6–12 months', outcome: '₹3–8 LPA entry-level', link: '/education' },
                { title: 'Data Science & Machine Learning', duration: '6–12 months', outcome: '₹4–10 LPA entry-level', link: '/education' },
                { title: 'Diploma in ITI / Polytechnic', duration: '1–2 years', outcome: 'Govt jobs + private industry', link: '#' },
                { title: 'Paramedical & Nursing Courses', duration: '1–3 years', outcome: 'Healthcare sector demand', link: '#' },
              ].map((course) => (
                <Link
                  key={course.title}
                  href={course.link}
                  className="flex items-start gap-4 bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-blue-300 transition-all group"
                >
                  <GraduationCap className="h-6 w-6 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">{course.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Duration: {course.duration}</p>
                    <p className="text-xs text-teal-700 font-semibold mt-1">{course.outcome}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-500 ml-auto shrink-0 mt-0.5" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Exam dates table */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Key Exam Dates (Quick Reference)</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  {['Exam', 'For Stream', 'Approx Month', 'For Admission To'].map((h) => (
                    <th key={h} className="text-left px-5 py-4 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  // TODO: Update with accurate dates from official notifications
                  { exam: 'TS EAMCET', stream: 'MPC / BiPC', month: 'May (TODO)', admission: 'B.Tech / B.Pharm / B.Sc Ag (TS)' },
                  { exam: 'AP EAMCET', stream: 'MPC / BiPC', month: 'May (TODO)', admission: 'B.Tech / B.Pharm / B.Sc Ag (AP)' },
                  { exam: 'NEET-UG', stream: 'BiPC', month: 'May (TODO)', admission: 'MBBS / BDS / B.Sc Nursing' },
                  { exam: 'JEE Main', stream: 'MPC', month: 'Jan & Apr (TODO)', admission: 'NITs, IITs, IIITs' },
                  { exam: 'CLAT', stream: 'Any', month: 'December (TODO)', admission: 'National Law Universities (NLUs)' },
                  { exam: 'CA Foundation', stream: 'CEC / MPC', month: 'June & December (TODO)', admission: 'Chartered Accountancy programme' },
                ].map((row, i) => (
                  <tr key={row.exam} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-5 py-4 font-bold text-slate-900">{row.exam}</td>
                    <td className="px-5 py-4 text-slate-600">{row.stream}</td>
                    <td className="px-5 py-4 text-teal-700 font-medium">{row.month}</td>
                    <td className="px-5 py-4 text-slate-600">{row.admission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">
            * All months are approximate. Check official websites for exact dates. <Link href="/career-guidance/entrance-exams" className="text-blue-600 underline">Full exam calendar →</Link>
          </p>
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
            Confused About Which Path to Take?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Our expert counselors help Intermediate students in TS &amp; AP find the best career path for their interests and marks.
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
