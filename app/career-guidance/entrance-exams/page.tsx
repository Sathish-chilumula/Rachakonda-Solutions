'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, Calendar, ChevronRight, ExternalLink } from 'lucide-react';

// TODO: Replace placeholder dates with actual exam dates when available
const exams = [
  {
    name: 'TS EAMCET',
    body: 'JNTU Hyderabad',
    eligibility: 'Intermediate (MPC/BiPC)',
    month: 'TODO: May 2025',
    state: 'TS',
    type: 'Entrance',
    url: '#',
  },
  {
    name: 'AP EAMCET',
    body: 'JNTU Kakinada',
    eligibility: 'Intermediate (MPC/BiPC)',
    month: 'TODO: May 2025',
    state: 'AP',
    type: 'Entrance',
    url: '#',
  },
  {
    name: 'TS ECET',
    body: 'Osmania University',
    eligibility: 'Diploma / B.Sc (Maths)',
    month: 'TODO: May 2025',
    state: 'TS',
    type: 'Entrance',
    url: '#',
  },
  {
    name: 'TS ICET',
    body: 'Kakatiya University',
    eligibility: 'Degree (Any Stream)',
    month: 'TODO: June 2025',
    state: 'TS',
    type: 'Entrance',
    url: '#',
  },
  {
    name: 'AP ICET',
    body: 'Sri Krishnadevaraya University',
    eligibility: 'Degree (Any Stream)',
    month: 'TODO: May 2025',
    state: 'AP',
    type: 'Entrance',
    url: '#',
  },
  {
    name: 'TSPSC Group 2',
    body: 'TSPSC',
    eligibility: 'Degree',
    month: 'TODO: August 2025',
    state: 'TS',
    type: 'Govt Jobs',
    url: '#',
  },
  {
    name: 'APPSC Group 2',
    body: 'APPSC',
    eligibility: 'Degree',
    month: 'TODO: TBD',
    state: 'AP',
    type: 'Govt Jobs',
    url: '#',
  },
  {
    name: 'NEET-UG',
    body: 'NTA',
    eligibility: 'Intermediate (BiPC)',
    month: 'TODO: May 2025',
    state: 'National',
    type: 'Entrance',
    url: '#',
  },
  {
    name: 'JEE Main',
    body: 'NTA',
    eligibility: 'Intermediate (MPC)',
    month: 'TODO: Jan/Apr 2025',
    state: 'National',
    type: 'Entrance',
    url: '#',
  },
];

export default function EntranceExamsPage() {
  const [filterState, setFilterState] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [search, setSearch] = useState('');

  const filteredExams = exams.filter(exam => {
    const matchState = filterState === 'All' || exam.state === filterState;
    const matchType = filterType === 'All' || exam.type === filterType;
    const matchSearch = exam.name.toLowerCase().includes(search.toLowerCase()) || 
                        exam.body.toLowerCase().includes(search.toLowerCase());
    return matchState && matchType && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4 font-display"
          >
            Entrance Exam <span className="text-amber-400">Calendar</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 max-w-2xl mx-auto"
          >
            Keep track of important exam dates, eligibility criteria, and official links for TS & AP students.
          </motion.p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search exams or boards..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select 
            value={filterState} 
            onChange={(e) => setFilterState(e.target.value)}
            className="py-3 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="All">All States</option>
            <option value="TS">Telangana</option>
            <option value="AP">Andhra Pradesh</option>
            <option value="National">National</option>
          </select>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="py-3 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="All">All Types</option>
            <option value="Entrance">Entrance Exams</option>
            <option value="Govt Jobs">Govt Jobs</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                  <th className="py-4 px-6 font-semibold">Exam Name</th>
                  <th className="py-4 px-6 font-semibold">State / Type</th>
                  <th className="py-4 px-6 font-semibold">Eligibility</th>
                  <th className="py-4 px-6 font-semibold">Approx. Month</th>
                  <th className="py-4 px-6 font-semibold">Official Link</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{exam.name}</div>
                      <div className="text-xs text-slate-500">{exam.body}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">{exam.state}</span>
                        <span className="text-slate-500 text-xs">{exam.type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-700">{exam.eligibility}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
                        <Calendar className="w-4 h-4" />
                        {exam.month}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <a href={exam.url} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium">
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
                {filteredExams.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No exams found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-blue-600 py-16 text-center text-white">
        <h2 className="text-3xl font-bold mb-4 font-display">Need Help Choosing the Right Exam?</h2>
        <p className="text-blue-100 mb-8 max-w-2xl mx-auto">Talk to our counselors for free guidance on eligibility, preparation strategies, and applying to the right exams.</p>
        <Link href="/contact" className="inline-block bg-white text-blue-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-slate-50 transition-colors">
          Book a Free Counseling Call
        </Link>
      </section>
    </div>
  );
}
