'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, CheckCircle, GraduationCap, Building2, Briefcase, ChevronRight } from 'lucide-react';
import { getCollegeBySlug } from '@/lib/data/colleges';

export default function CollegeDetailPage({ params }: { params: { slug: string } }) {
  const college = getCollegeBySlug(params.slug);

  if (!college) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO SECTION */}
      <div className="relative pt-32 pb-20 bg-slate-900 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${college.imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex items-center gap-2 text-sm text-slate-300 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/colleges" className="hover:text-white">Colleges</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{college.name}</span>
          </div>

          <div className="flex flex-wrap items-start gap-4 mb-4">
            <span className="px-3 py-1 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              {college.category}
            </span>
            <span className="px-3 py-1 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold tracking-wider flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> ESTD {college.established}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight font-display">
            {college.name}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-400" /> {college.location}, {college.state}</span>
            <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-amber-400" /> {college.accreditation.join(' • ')}</span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-12">
            
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" /> Overview
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {college.description}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-blue-600" /> Courses Offered
              </h2>
              <div className="space-y-4">
                {college.courses.map((course, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{course.name}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="block text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Duration</span>
                        <span className="text-slate-700 font-medium">{course.duration}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Eligibility</span>
                        <span className="text-slate-700 font-medium">{course.eligibility}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Fees</span>
                        <span className="text-slate-700 font-medium">{course.fees}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-blue-600" /> Placements & Recruiters
              </h2>
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Highlights</h4>
                    <ul className="space-y-3">
                      {college.placementHighlights.map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700 font-medium">
                          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" /> {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Top Recruiters</h4>
                    <div className="flex flex-wrap gap-2">
                      {college.topRecruiters.map((recruiter, i) => (
                        <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold">
                          {recruiter}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-3xl p-6 border border-slate-200 shadow-xl">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Interested in {college.name}?</h3>
              <p className="text-slate-500 text-sm mb-6">Get free counseling, admission guidance, and fee structure details from our experts.</p>
              
              <Link 
                href={`/contact?interest=${encodeURIComponent(college.name)}`}
                className="block w-full py-4 text-center bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-blue-600/20"
              >
                Get Admission Guidance
              </Link>
              
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-center text-slate-400">
                  <span className="font-bold text-slate-600">Note:</span> Rachakonda Solutions is an independent educational consultancy. We provide guidance and help students secure admissions based on merit and management quotas.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
