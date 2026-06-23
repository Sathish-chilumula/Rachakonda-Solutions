'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import {
  Search, MapPin, Building2, Award, Filter, ArrowRight,
  Phone, Star, BookOpen, Microscope, Scale, Leaf, Heart,
  GraduationCap, ChevronRight, CheckCircle, Users
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

type StateFilter = 'All' | 'TS' | 'AP';
type CategoryFilter = 'All' | 'Engineering' | 'Medical' | 'Degree' | 'Pharmacy' | 'Agriculture' | 'Nursing' | 'Law';

const colleges = [
  // TODO: Replace with verified college data from TS/AP NAAC & university records
  { name: 'Osmania University', location: 'Hyderabad', district: 'Hyderabad', state: 'TS', category: 'Degree', accreditation: 'NAAC A++', courses: ['BA', 'B.Com', 'B.Sc', 'Law', 'MBA'], established: 1918, type: 'Government' },
  { name: 'JNTU Hyderabad', location: 'Hyderabad', district: 'Hyderabad', state: 'TS', category: 'Engineering', accreditation: 'NAAC A', courses: ['B.Tech', 'M.Tech', 'MBA', 'MCA'], established: 1972, type: 'Government' },
  { name: 'Andhra University', location: 'Visakhapatnam', district: 'Visakhapatnam', state: 'AP', category: 'Degree', accreditation: 'NAAC A+', courses: ['BA', 'B.Sc', 'B.Com', 'Engineering', 'Law'], established: 1926, type: 'Government' },
  { name: 'NIT Warangal', location: 'Warangal', district: 'Warangal', state: 'TS', category: 'Engineering', accreditation: 'NAAC A++', courses: ['B.Tech', 'M.Tech', 'MBA', 'PhD'], established: 1959, type: 'Government' },
  { name: 'Sri Venkateswara University', location: 'Tirupati', district: 'Tirupati', state: 'AP', category: 'Degree', accreditation: 'NAAC A', courses: ['BA', 'B.Sc', 'B.Com', 'MBA', 'M.Sc'], established: 1954, type: 'Government' },
  { name: 'Gandhi Medical College', location: 'Hyderabad', district: 'Hyderabad', state: 'TS', category: 'Medical', accreditation: 'MCI Approved', courses: ['MBBS', 'MD', 'MS', 'Super Specialty'], established: 1954, type: 'Government' },
  { name: 'BITS Pilani Hyderabad', location: 'Hyderabad', district: 'Hyderabad', state: 'TS', category: 'Engineering', accreditation: 'NAAC A', courses: ['B.Tech', 'M.Tech', 'MBA', 'PhD'], established: 2008, type: 'Private' },
  { name: 'Acharya Nagarjuna University', location: 'Guntur', district: 'Guntur', state: 'AP', category: 'Degree', accreditation: 'NAAC A+', courses: ['BA', 'B.Sc', 'B.Com', 'MBA', 'Law'], established: 1976, type: 'Government' },
  { name: 'KIMS College of Medicine', location: 'Hyderabad', district: 'Hyderabad', state: 'TS', category: 'Medical', accreditation: 'NMC Approved', courses: ['MBBS', 'MD/MS'], established: 1958, type: 'Private' },
  { name: 'VIT-AP University', location: 'Amaravati', district: 'Guntur', state: 'AP', category: 'Engineering', accreditation: 'NAAC A+', courses: ['B.Tech', 'MBA', 'M.Tech'], established: 2017, type: 'Private' },
  { name: 'Kakatiya University', location: 'Warangal', district: 'Warangal', state: 'TS', category: 'Degree', accreditation: 'NAAC B++', courses: ['BA', 'B.Sc', 'B.Com', 'MBA'], established: 1976, type: 'Government' },
  { name: 'JNTUA Anantapur', location: 'Anantapur', district: 'Anantapur', state: 'AP', category: 'Engineering', accreditation: 'NAAC A', courses: ['B.Tech', 'M.Tech', 'MBA', 'MCA'], established: 2008, type: 'Government' },
];

const tsDistricts = ['Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Nalgonda'];
const apDistricts = ['Vijayawada', 'Visakhapatnam', 'Guntur', 'Tirupati', 'Anantapur', 'Kurnool'];

const categoryIcons: Record<string, React.ElementType> = {
  Engineering: Building2,
  Medical: Microscope,
  Degree: GraduationCap,
  Pharmacy: Heart,
  Agriculture: Leaf,
  Nursing: Heart,
  Law: Scale,
};

const categoryColors: Record<string, string> = {
  Engineering: 'bg-blue-100 text-blue-700',
  Medical: 'bg-red-100 text-red-700',
  Degree: 'bg-teal-100 text-teal-700',
  Pharmacy: 'bg-purple-100 text-purple-700',
  Agriculture: 'bg-green-100 text-green-700',
  Nursing: 'bg-pink-100 text-pink-700',
  Law: 'bg-amber-100 text-amber-700',
};

const categories: CategoryFilter[] = ['All', 'Engineering', 'Medical', 'Degree', 'Pharmacy', 'Agriculture', 'Nursing', 'Law'];

export default function CollegesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<StateFilter>('All');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');

  const filtered = colleges.filter((c) => {
    const matchState = stateFilter === 'All' || c.state === stateFilter;
    const matchCategory = categoryFilter === 'All' || c.category === categoryFilter;
    const matchSearch = searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchState && matchCategory && matchSearch;
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
              <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full">Free Guide</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Top Colleges in TS & AP
            </motion.h1>
            <motion.p variants={fadeUp} className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
              Explore universities, engineering colleges, medical institutes & more across Telangana and Andhra Pradesh.
            </motion.p>
            {/* Search Bar */}
            <motion.div variants={fadeUp} className="max-w-xl mx-auto relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search college, district, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-slate-800 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Filter Bar ── */}
      <section className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 text-slate-500 shrink-0">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            {/* State Filter */}
            <div className="flex gap-2">
              {(['All', 'TS', 'AP'] as StateFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStateFilter(s)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${stateFilter === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {s === 'All' ? 'All States' : s}
                </button>
              ))}
            </div>
            <div className="w-px h-5 bg-slate-200 hidden sm:block" />
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${categoryFilter === cat ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── College Grid ── */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {filtered.length} College{filtered.length !== 1 ? 's' : ''} Found
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {/* TODO: Expand to 200+ colleges with verified data from NAAC, UGC & state boards */}
                  Showing sample data — contact us for complete college database
                </p>
              </div>
            </motion.div>

            {filtered.length === 0 ? (
              <motion.div variants={fadeUp} className="text-center py-20">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No colleges found matching your search.</p>
                <button onClick={() => { setSearchQuery(''); setStateFilter('All'); setCategoryFilter('All'); }} className="mt-4 text-blue-600 font-medium text-sm underline">
                  Clear filters
                </button>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((col, i) => {
                  const CatIcon = categoryIcons[col.category] || Building2;
                  const catColor = categoryColors[col.category] || 'bg-slate-100 text-slate-700';
                  return (
                    <motion.div key={i} variants={fadeUp} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-lg transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-2 rounded-xl ${catColor}`}>
                          <CatIcon className="w-5 h-5" />
                        </div>
                        <div className="flex gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${col.state === 'TS' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>
                            {col.state}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${col.type === 'Government' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {col.type}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors">{col.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                        <MapPin className="w-3.5 h-3.5" />{col.location}, Est. {col.established}
                      </p>
                      <div className="flex items-center gap-1.5 mb-4">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-semibold text-amber-600">{col.accreditation}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {col.courses.slice(0, 3).map((course) => (
                          <span key={course} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">{course}</span>
                        ))}
                        {col.courses.length > 3 && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg font-medium">+{col.courses.length - 3} more</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Browse by District ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Browse by Location</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Colleges by District</h2>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-blue-700 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span> Telangana Districts
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {tsDistricts.map((d) => (
                    <button key={d} onClick={() => setSearchQuery(d)} className="flex items-center justify-between bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-xl px-4 py-3 text-sm font-medium transition-colors text-left">
                      <span>{d}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-teal-700 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-teal-600 inline-block"></span> Andhra Pradesh Districts
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {apDistricts.map((d) => (
                    <button key={d} onClick={() => setSearchQuery(d)} className="flex items-center justify-between bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 rounded-xl px-4 py-3 text-sm font-medium transition-colors text-left">
                      <span>{d}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
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
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4">Need Admission Guidance?</motion.h2>
            <motion.p variants={fadeUp} className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Our counselors help TS/AP students choose the right college based on rank, budget, and career goals. Free consultation.
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
