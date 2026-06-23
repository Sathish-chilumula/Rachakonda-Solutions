'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import {
  Award, ArrowRight, Phone, CheckCircle, Filter,
  ExternalLink, Star, GraduationCap, Globe, Users,
  BookOpen, ChevronRight, AlertCircle, Lightbulb
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };

type StateFilter = 'All' | 'TS' | 'AP' | 'National';
type CategoryFilter = 'All' | 'SC/ST' | 'OBC' | 'Minority' | 'Merit' | 'Girl Child' | 'Research';
type QualFilter = 'All' | '10th' | 'Intermediate' | 'Degree' | 'PG';

interface Scholarship {
  name: string;
  provider: string;
  state: StateFilter;
  category: CategoryFilter;
  qualification: QualFilter;
  eligibility: string;
  amount: string;
  applyLink: string;
  group: string;
}

const scholarships: Scholarship[] = [
  // Telangana
  { name: 'TS ePASS Post-Matric Scholarship', provider: 'Telangana BC Welfare Dept.', state: 'TS', category: 'OBC', qualification: 'Intermediate', eligibility: 'BC students studying in TS; Income limit: TODO', amount: 'TODO: Varies by course & hostel', applyLink: 'https://telanganaepass.cgg.gov.in', group: 'Telangana Scholarships' },
  { name: 'Jagananna Vidya Deevena', provider: 'AP Govt — BC Welfare', state: 'AP', category: 'OBC', qualification: 'Degree', eligibility: 'SC/ST/BC/EBC/Minority/Kapu (AP). Income TODO', amount: 'Full fee reimbursement (TODO: Exact amount)', applyLink: 'https://jaganannavidyadeevena.ap.gov.in', group: 'AP Scholarships' },
  { name: 'TS Ambedkar Overseas Scholarship', provider: 'Telangana SC Welfare Dept.', state: 'TS', category: 'SC/ST', qualification: 'Degree', eligibility: 'SC students pursuing Masters abroad; Graduation required', amount: 'TODO: Tuition + Maintenance allowance', applyLink: '#', group: 'Telangana Scholarships' },
  { name: 'TS SC/ST Pre-Matric Scholarship', provider: 'Telangana SW Dept.', state: 'TS', category: 'SC/ST', qualification: '10th', eligibility: 'SC/ST students in class 9-10. Family income below TODO', amount: 'TODO: Day scholar & hostel amounts differ', applyLink: '#', group: 'Telangana Scholarships' },
  { name: 'YSR Vidya Deevena', provider: 'AP Govt — Education Dept.', state: 'AP', category: 'OBC', qualification: 'Intermediate', eligibility: 'SC/ST/BC/EBC/Minority/Kapu in AP; Income below TODO', amount: 'Full fee reimbursement for Intermediate (TODO)', applyLink: '#', group: 'AP Scholarships' },
  { name: 'AP ePASS Scholarship', provider: 'AP BC Welfare Dept.', state: 'AP', category: 'OBC', qualification: 'Degree', eligibility: 'BC, EBC, Kapu students in AP. Income: below TODO', amount: 'Maintenance + Tuition (TODO: Exact amounts)', applyLink: '#', group: 'AP Scholarships' },
  { name: 'NBCFW Scholarship (AP)', provider: 'National BC Finance Corp (AP)', state: 'AP', category: 'OBC', qualification: 'Degree', eligibility: 'OBC students. Income: below TODO', amount: 'TODO', applyLink: '#', group: 'AP Scholarships' },
  // National
  { name: 'National Scholarship Portal (NSP)', provider: 'Ministry of Education', state: 'National', category: 'Merit', qualification: 'Intermediate', eligibility: 'All categories. Merit-based selection. Income limit: TODO', amount: 'TODO: Varies by scheme (₹10K–₹1L+)', applyLink: 'https://scholarships.gov.in', group: 'National Scholarships' },
  { name: 'Post-Matric Scholarship (SC)', provider: 'Ministry of Social Justice', state: 'National', category: 'SC/ST', qualification: 'Intermediate', eligibility: 'SC students in post-matric education. Income: below ₹2.5L', amount: 'TODO: Maintenance + Tuition fees', applyLink: 'https://scholarships.gov.in', group: 'National Scholarships' },
  { name: 'Merit-cum-Means Scholarship', provider: 'Ministry of Minority Affairs', state: 'National', category: 'Minority', qualification: 'Degree', eligibility: 'Minority students. Income: below ₹2.5L. Merit required.', amount: 'TODO: ₹20K–₹30K/year approx.', applyLink: 'https://scholarships.gov.in', group: 'National Scholarships' },
  { name: 'Maulana Azad National Fellowship', provider: 'UGC / Min. of Minority Affairs', state: 'National', category: 'Minority', qualification: 'PG', eligibility: '6 minority communities. For MPhil/PhD students only.', amount: 'TODO: JRF + SRF rates (₹31K-₹35K/month)', applyLink: 'https://manf.ucanwest.in', group: 'Minority Scholarships' },
  { name: 'Pre-Matric Scholarship (Minority)', provider: 'Ministry of Minority Affairs', state: 'National', category: 'Minority', qualification: '10th', eligibility: 'Minority community students in class 1-10. Income: below ₹1L', amount: 'TODO: ₹1K–₹10K/year', applyLink: 'https://scholarships.gov.in', group: 'Minority Scholarships' },
  { name: 'JRF — Junior Research Fellowship', provider: 'UGC / CSIR', state: 'National', category: 'Research', qualification: 'PG', eligibility: 'UGC-NET / CSIR-NET qualified candidates. All subjects.', amount: 'TODO: ₹31,000/month (JRF) + HRA', applyLink: 'https://ugcnet.nta.nic.in', group: 'Research Fellowships' },
  { name: 'SRF — Senior Research Fellowship', provider: 'UGC / CSIR', state: 'National', category: 'Research', qualification: 'PG', eligibility: 'After 2 years as JRF + good progress report.', amount: 'TODO: ₹35,000/month (SRF) + HRA', applyLink: '#', group: 'Research Fellowships' },
  { name: 'DST INSPIRE Scholarship', provider: 'Dept. of Science & Technology', state: 'National', category: 'Merit', qualification: 'Degree', eligibility: 'Top 1% in 12th or Top 10K JEE rankers. B.Sc/Integrated programs.', amount: 'TODO: ₹80,000/year', applyLink: 'https://online-inspire.gov.in', group: 'National Scholarships' },
];

const schemeGroups = ['Telangana Scholarships', 'AP Scholarships', 'National Scholarships', 'Minority Scholarships', 'Research Fellowships'];

const groupColors: Record<string, { bg: string; text: string; badge: string; icon: React.ElementType }> = {
  'Telangana Scholarships': { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', icon: Award },
  'AP Scholarships': { bg: 'bg-teal-50', text: 'text-teal-700', badge: 'bg-teal-100 text-teal-700', icon: Award },
  'National Scholarships': { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', icon: Globe },
  'Minority Scholarships': { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', icon: Users },
  'Research Fellowships': { bg: 'bg-slate-50', text: 'text-slate-700', badge: 'bg-slate-200 text-slate-700', icon: BookOpen },
};

const stateFilters: StateFilter[] = ['All', 'TS', 'AP', 'National'];
const categoryFilters: CategoryFilter[] = ['All', 'SC/ST', 'OBC', 'Minority', 'Merit', 'Girl Child', 'Research'];
const qualFilters: QualFilter[] = ['All', '10th', 'Intermediate', 'Degree', 'PG'];

export default function ScholarshipsPage() {
  const [stateFilter, setStateFilter] = useState<StateFilter>('All');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [qualFilter, setQualFilter] = useState<QualFilter>('All');
  const [activeGroup, setActiveGroup] = useState<string>('All');

  const filtered = scholarships.filter((s) => {
    const matchState = stateFilter === 'All' || s.state === stateFilter;
    const matchCat = categoryFilter === 'All' || s.category === categoryFilter;
    const matchQual = qualFilter === 'All' || s.qualification === qualFilter;
    const matchGroup = activeGroup === 'All' || s.group === activeGroup;
    return matchState && matchCat && matchQual && matchGroup;
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
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">National</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Scholarships for TS & AP Students
            </motion.h1>
            <motion.p variants={fadeUp} className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Don't let money stop your education. Explore all scholarships — state, national, minority & research fellowships available for Telangana and AP students.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              <Link href="#scholarships" className="bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold px-6 py-3 rounded-xl transition-all">
                Find Scholarships ↓
              </Link>
              <Link href="/contact" className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl border border-white/30 transition-all">
                Free Counseling Call
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Filter Bar ── */}
      <section className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm py-4 px-4">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 font-medium shrink-0">State:</span>
            {stateFilters.map((s) => (
              <button key={s} onClick={() => setStateFilter(s)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${stateFilter === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s}</button>
            ))}
            <div className="w-px h-4 bg-slate-200 hidden sm:block" />
            <span className="text-xs text-slate-500 font-medium">Category:</span>
            {categoryFilters.map((c) => (
              <button key={c} onClick={() => setCategoryFilter(c)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${categoryFilter === c ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{c}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-500 font-medium shrink-0 ml-5">Qualification:</span>
            {qualFilters.map((q) => (
              <button key={q} onClick={() => setQualFilter(q)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${qualFilter === q ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{q}</button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scholarship Group Tabs ── */}
      <section id="scholarships" className="py-12 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-8 justify-center">
              {['All', ...schemeGroups].map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${activeGroup === g ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}
                >
                  {g}
                </button>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="text-sm text-slate-500 mb-6">
              Showing <strong className="text-slate-800">{filtered.length}</strong> scholarship(s)
              {/* TODO: amounts should be updated from official portals — always verify before applying */}
            </motion.div>

            <div className="grid md:grid-cols-2 gap-5">
              {filtered.map((s, i) => {
                const groupStyle = groupColors[s.group] || groupColors['National Scholarships'];
                const GIcon = groupStyle.icon;
                return (
                  <motion.div key={i} variants={fadeUp} className={`rounded-2xl border border-slate-200 ${groupStyle.bg} p-5 shadow-sm hover:shadow-md transition-all`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${groupStyle.badge}`}>
                          <GIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${groupStyle.badge}`}>{s.group}</span>
                          <p className="text-xs text-slate-400 mt-0.5">{s.provider}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${s.state === 'TS' ? 'bg-blue-100 text-blue-700' : s.state === 'AP' ? 'bg-teal-100 text-teal-700' : 'bg-purple-100 text-purple-700'}`}>
                        {s.state}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-3 leading-tight">{s.name}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-xs text-slate-600">{s.eligibility}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Star className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                        <span className="text-xs text-slate-600 font-medium">Amount: {s.amount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="text-xs text-slate-500">Qualification: {s.qualification}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {s.applyLink !== '#' ? (
                        <a href={s.applyLink} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                          Apply Now <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          {/* TODO: Add official apply link */}
                          Apply link coming soon
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-20">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No scholarships found with the selected filters.</p>
                <button onClick={() => { setStateFilter('All'); setCategoryFilter('All'); setQualFilter('All'); setActiveGroup('All'); }} className="mt-3 text-blue-600 font-medium text-sm underline">
                  Clear all filters
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Important Note ── */}
      <section className="py-10 px-4 bg-amber-50 border-y border-amber-200">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-amber-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-amber-800 text-lg mb-2">Important Disclaimer</h3>
              <p className="text-amber-700 text-sm leading-relaxed">
                Scholarship amounts, income limits, and application dates are subject to annual revisions by the respective government departments.
                Always verify the latest information from the official portals — <strong>scholarships.gov.in, telanganaepass.cgg.gov.in</strong>, and your state welfare department websites — before applying.
                {/* TODO: Keep scholarship data updated yearly from official announcements */}
              </p>
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
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4">Need Help Applying for a Scholarship?</motion.h2>
            <motion.p variants={fadeUp} className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Our team helps TS/AP students find and apply for the right scholarships — ePASS, NSP, and many more. Free guidance.
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
