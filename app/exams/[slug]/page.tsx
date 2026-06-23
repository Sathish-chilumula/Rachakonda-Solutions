'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, FileText, CheckCircle, ChevronRight, GraduationCap, Link as LinkIcon } from 'lucide-react';
import { getExamBySlug } from '@/lib/data/exams';

export default function ExamDetailPage({ params }: { params: { slug: string } }) {
  const exam = getExamBySlug(params.slug);

  if (!exam) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO SECTION */}
      <div className="relative pt-32 pb-20 bg-blue-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex items-center gap-2 text-sm text-blue-200 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/exams" className="hover:text-white transition-colors">Exams</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{exam.name}</span>
          </div>

          <div className="flex flex-wrap items-start gap-3 mb-6">
            <span className="px-3 py-1 bg-white/10 text-white border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
              {exam.level} Level
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold tracking-wider">
              {exam.category}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight font-display">
            {exam.name}
          </h1>
          <h2 className="text-xl md:text-2xl text-blue-200 font-medium max-w-3xl mb-8">
            {exam.fullName}
          </h2>
          
          <div className="flex flex-wrap items-center gap-6 text-blue-100 text-sm">
            <span className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm">
              <span className="text-blue-300 font-bold uppercase text-xs tracking-wider">Conducting Body</span>
              {exam.conductingBody}
            </span>
            <span className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm">
              <span className="text-blue-300 font-bold uppercase text-xs tracking-wider">Mode</span>
              {exam.mode}
            </span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-10">
            
            <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> About {exam.name}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {exam.description}
              </p>
            </section>

            <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" /> Eligibility Criteria
              </h3>
              <p className="text-slate-600 leading-relaxed bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                {exam.eligibility}
              </p>
            </section>

            <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" /> Exam Pattern
              </h3>
              <ul className="space-y-3">
                {exam.pattern.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Important Dates */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" /> Important Dates
              </h3>
              <div className="space-y-4">
                {exam.dates.map((dateObj, i) => (
                  <div key={i} className="flex flex-col border-l-2 border-blue-200 pl-4 relative">
                    <div className="absolute w-2 h-2 rounded-full bg-blue-600 -left-[5px] top-1.5" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{dateObj.date}</span>
                    <span className="text-sm font-semibold text-slate-800">{dateObj.event}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Website */}
            <a 
              href={exam.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-slate-900 text-white rounded-2xl p-5 hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <LinkIcon className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-sm">Official Website</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </a>

            {/* Counseling CTA */}
            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
              <h3 className="text-lg font-bold text-amber-900 mb-2">Need Guidance?</h3>
              <p className="text-amber-800/80 text-sm mb-4">Not sure how to prepare or which colleges accept this score? Talk to our experts.</p>
              <Link 
                href={`/contact?interest=${encodeURIComponent(exam.name + ' Preparation')}`}
                className="block w-full py-3 text-center bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl transition-colors shadow-sm"
              >
                Get Free Counseling
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
