'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FileText, Download, Youtube, Smartphone, Globe, BookOpen,
  ArrowRight, Phone, CheckCircle, ExternalLink, Star,
  Lightbulb, Clock, Target, Brain, TrendingUp, Laptop,
  ChevronRight, AlertCircle
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };

const resourceCategories = [
  {
    id: 'papers',
    icon: FileText,
    title: 'Previous Year Papers',
    desc: 'Download previous question papers for TS/AP entrance & competitive exams.',
    color: 'blue',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    items: [
      // TODO: Add real download links from official exam board websites
      { name: 'TS EAMCET Previous Papers (2018–2024)', link: '#', note: 'TODO: Link to JNTU official papers' },
      { name: 'AP EAMCET Previous Papers (2018–2024)', link: '#', note: 'TODO: Link to APSCHE official papers' },
      { name: 'POLYCET TS Previous Papers', link: '#', note: 'TODO: Link to SBTET TS papers' },
      { name: 'POLYCET AP Previous Papers', link: '#', note: 'TODO: Link to SBTET AP papers' },
      { name: 'TSPSC Group 2 Previous Papers', link: '#', note: 'TODO: Link to TSPSC official papers' },
      { name: 'APPSC Group 2 Previous Papers', link: '#', note: 'TODO: Link to APPSC official papers' },
      { name: 'TS TET Previous Papers', link: '#', note: 'TODO: Link to TSTET board papers' },
      { name: 'ICET Previous Papers (TS/AP)', link: '#', note: 'TODO: Link to university official papers' },
    ],
  },
  {
    id: 'syllabus',
    icon: BookOpen,
    title: 'Syllabus Downloads',
    desc: 'Official syllabus for all major TS/AP entrance and competitive exams.',
    color: 'teal',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    badge: 'bg-teal-100 text-teal-700',
    items: [
      // TODO: Add official syllabus PDF links
      { name: 'TS EAMCET 2025 Syllabus (MPC & BiPC)', link: '#', note: 'TODO: Official JNTU syllabus PDF' },
      { name: 'AP EAMCET 2025 Syllabus', link: '#', note: 'TODO: Official APSCHE syllabus PDF' },
      { name: 'TSPSC Group 1 Syllabus', link: 'https://www.tspsc.gov.in', note: 'Check TSPSC website' },
      { name: 'TSPSC Group 2 Syllabus', link: 'https://www.tspsc.gov.in', note: 'Check TSPSC website' },
      { name: 'APPSC Group 1 & 2 Syllabus', link: 'https://www.psc.ap.gov.in', note: 'Check APPSC website' },
      { name: 'TS TET Syllabus (Paper I & II)', link: '#', note: 'TODO: Official TSTET board syllabus' },
      { name: 'ICET Syllabus (MBA/MCA)', link: '#', note: 'TODO: Official university syllabus' },
      { name: 'GATE 2025 Syllabus (all branches)', link: 'https://gate2025.iitr.ac.in', note: 'Official GATE website' },
    ],
  },
  {
    id: 'youtube',
    icon: Youtube,
    title: 'Free YouTube Channels',
    desc: 'Curated YouTube channels for TS/AP exam preparation — free & quality content.',
    color: 'red',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    items: [
      // TODO: Verify channel links and add correct YouTube channel URLs
      { name: 'Narayana e-Techno School (TS EAMCET)', link: '#', note: 'TODO: Add YouTube channel link' },
      { name: 'Sri Chaitanya Online Classes', link: '#', note: 'TODO: Add YouTube channel link' },
      { name: 'TSPSC Study (Group Exams)', link: '#', note: 'TODO: Add YouTube channel link' },
      { name: 'Advent IAS (UPSC in Telugu)', link: '#', note: 'TODO: Add YouTube channel link' },
      { name: 'Examपुर Telugu (SSC/Banking)', link: '#', note: 'TODO: Add YouTube channel link' },
      { name: 'Khan Academy India (Maths/Science)', link: 'https://youtube.com/khanacademytelugu', note: 'Free & verified' },
    ],
  },
  {
    id: 'apps',
    icon: Smartphone,
    title: 'Useful Mobile Apps',
    desc: 'Official and recommended mobile apps for TS/AP students.',
    color: 'purple',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    items: [
      { name: 'DigiLocker (Official Docs)', link: 'https://digilocker.gov.in', note: 'Store mark sheets, certificates digitally' },
      { name: 'NTA Abhyas (JEE/NEET Practice)', link: 'https://www.nta.ac.in', note: 'Official NTA practice app' },
      { name: 'UMANG (Govt Services)', link: 'https://web.umang.gov.in', note: 'Access all govt services in one app' },
      { name: 'TS ePASS App', link: '#', note: 'TODO: Add Play Store link for TS scholarship app' },
      { name: 'AP ePASS App', link: '#', note: 'TODO: Add Play Store link for AP scholarship app' },
      { name: 'Duolingo / Grammarly (English Skills)', link: 'https://www.duolingo.com', note: 'Improve English for competitive exams' },
    ],
  },
  {
    id: 'websites',
    icon: Globe,
    title: 'Important Websites',
    desc: 'Essential official websites every TS/AP student should bookmark.',
    color: 'amber',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    items: [
      { name: 'TSPSC Official — tspsc.gov.in', link: 'https://www.tspsc.gov.in', note: 'All TS Group exam notifications' },
      { name: 'APPSC Official — psc.ap.gov.in', link: 'https://www.psc.ap.gov.in', note: 'All AP Group exam notifications' },
      { name: 'TS Board of Intermediate — tsbie.cgg.gov.in', link: 'https://tsbie.cgg.gov.in', note: 'TS Inter results, hall tickets' },
      { name: 'AP Board of Intermediate — bieap.gov.in', link: 'https://www.bieap.gov.in', note: 'AP Inter results, hall tickets' },
      { name: 'NTA — nta.ac.in', link: 'https://www.nta.ac.in', note: 'JEE, NEET, CUET notifications' },
      { name: 'Scholarships.gov.in (NSP)', link: 'https://scholarships.gov.in', note: 'National scholarship applications' },
      { name: 'TS ePASS — telanganaepass.cgg.gov.in', link: 'https://telanganaepass.cgg.gov.in', note: 'TS scholarship applications' },
      { name: 'ICAI — icai.org (CA)', link: 'https://www.icai.org', note: 'Chartered Accountancy admissions' },
    ],
  },
  {
    id: 'books',
    icon: BookOpen,
    title: 'Books & Study Material',
    desc: 'Recommended books for TS/AP competitive exam preparation.',
    color: 'green',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    items: [
      // TODO: Add affiliate/purchase links or library references
      { name: 'TS EAMCET Mathematics — Vikram Series', link: '#', note: 'TODO: Add purchase/PDF link' },
      { name: 'AP EAMCET Physics — Sri Krishna Series', link: '#', note: 'TODO: Add purchase/PDF link' },
      { name: 'TSPSC General Studies — Sriram IAS', link: '#', note: 'TODO: Add purchase/PDF link' },
      { name: 'Lucent GK (Telugu Medium)', link: '#', note: 'TODO: Add purchase/PDF link' },
      { name: 'Arihant POLYCET Guide', link: '#', note: 'TODO: Add purchase/PDF link' },
      { name: 'TS/AP Current Affairs Monthly (English & Telugu)', link: '#', note: 'TODO: Add online subscription link' },
    ],
  },
];

const studyTips = [
  { icon: Target, title: 'Set a Study Schedule', desc: 'Create a daily timetable with fixed hours for each subject. Consistency beats intensity for TS/AP competitive exams.', color: 'blue' },
  { icon: FileText, title: 'Solve Previous Papers Daily', desc: 'Practice 1 full previous year paper every week. This is the #1 strategy for EAMCET, TSPSC & TET success.', color: 'teal' },
  { icon: Brain, title: 'Revise Every Weekend', desc: 'Spend Saturday reviewing the week\'s topics. Spaced repetition dramatically improves retention for theory subjects.', color: 'purple' },
  { icon: TrendingUp, title: 'Focus on Current Affairs', desc: 'Read a Telugu or English newspaper daily. For govt exams, 30% of questions are from current affairs.', color: 'amber' },
  { icon: Clock, title: 'Time Management in Exam', desc: 'Attempt easy questions first. For EAMCET: don\'t spend more than 90 seconds per question. Practice timed mocks.', color: 'red' },
];

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-white font-sans">
      {/* ── Hero ── */}
      <section className="bg-blue-600 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex justify-center gap-3 mb-6">
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">TS & AP</span>
              <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full">100% Free</span>
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">All Exams</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Student Resources Hub
            </motion.h1>
            <motion.p variants={fadeUp} className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Previous papers, syllabus downloads, YouTube channels, apps, websites & books — everything a TS/AP student needs to excel.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              <Link href="#resources" className="bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold px-6 py-3 rounded-xl transition-all">
                Browse Resources ↓
              </Link>
              <Link href="/contact" className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl border border-white/30 transition-all">
                Free Counseling Call
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Quick Nav ── */}
      <section className="bg-white border-b border-slate-200 py-4 px-4 overflow-x-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-3 min-w-max mx-auto justify-center">
            {resourceCategories.map((cat) => {
              const CIcon = cat.icon;
              return (
                <a key={cat.id} href={`#${cat.id}`} className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl ${cat.badge} hover:opacity-80 transition-opacity whitespace-nowrap`}>
                  <CIcon className="w-3.5 h-3.5" /> {cat.title}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Resource Categories ── */}
      <section id="resources" className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto space-y-16">
          {resourceCategories.map((cat, idx) => {
            const CatIcon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                id={cat.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
              >
                <motion.div variants={fadeUp} className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl ${cat.badge} flex items-center justify-center`}>
                    <CatIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{cat.title}</h2>
                    <p className="text-slate-500 text-sm">{cat.desc}</p>
                  </div>
                </motion.div>
                <div className="grid md:grid-cols-2 gap-3">
                  {cat.items.map((item, i) => (
                    <motion.div key={i} variants={fadeUp} className={`flex items-center justify-between rounded-xl border ${cat.border} ${cat.bg} px-4 py-3 group hover:shadow-sm transition-all`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <Download className={`w-4 h-4 ${cat.badge.split(' ')[1]} shrink-0`} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                          <p className="text-xs text-slate-400 truncate">{item.note}</p>
                        </div>
                      </div>
                      {item.link !== '#' ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className={`shrink-0 ml-3 text-xs font-bold px-3 py-1.5 rounded-lg ${cat.badge} flex items-center gap-1 hover:opacity-80`}>
                          Open <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="shrink-0 ml-3 text-xs text-slate-300 italic">Coming Soon</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Study Tips ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Expert Advice</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">5 Study Tips for TS/AP Exam Success</h2>
              <p className="text-slate-500 mt-3 max-w-xl mx-auto">Proven strategies from toppers and coaching experts for Telangana & AP competitive exams.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {studyTips.map((tip, i) => {
                const TIcon = tip.icon;
                const colorMap: Record<string, string> = {
                  blue: 'bg-blue-100 text-blue-600',
                  teal: 'bg-teal-100 text-teal-600',
                  purple: 'bg-purple-100 text-purple-600',
                  amber: 'bg-amber-100 text-amber-600',
                  red: 'bg-red-100 text-red-600',
                };
                return (
                  <motion.div key={i} variants={fadeUp} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[tip.color]}`}>
                        <TIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-400">Tip #{i + 1}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">{tip.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{tip.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <section className="py-10 px-4 bg-amber-50 border-y border-amber-200">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
            <p className="text-amber-700 text-sm leading-relaxed">
              <strong>Note:</strong> Some resource links are marked as TODO and will be updated as verified sources become available.
              For previous year papers, always prefer the official exam board websites.
              {/* TODO: Update all TODO links with verified, working download URLs */}
            </p>
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
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4">Want Personalized Study Guidance?</motion.h2>
            <motion.p variants={fadeUp} className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Our counselors create customized study plans for TS/AP entrance and government exams. Book a free session today.
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
