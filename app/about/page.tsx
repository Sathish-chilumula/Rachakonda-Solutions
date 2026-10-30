'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Target, Eye, Shield, Users, Award, TrendingUp, MapPin, GraduationCap, Phone, Mail, Navigation, ExternalLink } from 'lucide-react';

const counselors = [
  {
    name: 'S. Chilumula',
    role: 'Managing Director & Senior Career Mentor',
    credentials: 'Postgraduate & Higher Education Advisor',
    specialization: 'Engineering, Degree & Competitive Exam Strategies',
    initial: 'SC',
    color: 'bg-blue-600 text-white',
  },
  {
    name: 'Academic Advisory Panel',
    role: 'Admissions & University Guidance',
    credentials: 'Experienced Counselors & Subject Specialists',
    specialization: 'TS EAMCET, AP EAPCET, POLYCET & DOST Web Options',
    initial: 'AA',
    color: 'bg-teal-600 text-white',
  },
  {
    name: 'Govt & Competitive Exam Faculty',
    role: 'Civil & State Exams Mentor',
    credentials: 'Expert Trainers for TSPSC, APPSC & Banking',
    specialization: 'Group Exams, General Studies, Reasoning & Syllabus Mastery',
    initial: 'GF',
    color: 'bg-amber-600 text-white',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none" style={{ backgroundImage: "url('/images/abstract_education_bg.webp')" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6"
          >
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">Gajwel Campus, Telangana &bull; Serving TS &amp; AP</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 font-display tracking-tight"
          >
            About <span className="text-amber-400">Rachakonda Solutions</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto font-medium leading-relaxed"
          >
            Dedicated to providing transparent, high-impact education counseling, competitive exam preparation, and career navigation for students across Telangana and Andhra Pradesh.
          </motion.p>
        </div>
      </section>

      {/* Our Story with Real Photos */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7"
            >
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 mb-4">
                Our Mission &amp; Roots
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 font-display tracking-tight">
                Empowering Students Through Genuine Mentorship
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed text-base sm:text-lg font-medium">
                <p>
                  Established in Gajwel, Telangana, Rachakonda Solutions was founded with a singular conviction: every student deserves honest, professional, and accessible career counseling tailored to their strengths, passions, and economic realities.
                </p>
                <p>
                  Over the past decade, we have mentored thousands of students navigating crucial turning points: choosing intermediate and polytechnic streams after 10th, securing top engineering and medical colleges through EAMCET/NEET, and cracking premier state (TSPSC/APPSC) and central government examinations.
                </p>
                <p>
                  Our learning center features modern smart classrooms, comprehensive study resources, and one-on-one personal guidance sessions designed to take students from confusion to clarity.
                </p>
              </div>

              {/* Campus Address Card */}
              <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" /> Headquarters &amp; Learning Center
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed mb-3">
                  Prashantha Complex, 2nd &amp; 3rd Floor, Above LIC Office, Beside Gajwel Bus Stand Main Road, Gajwel, Telangana — 502278
                </p>
                <a
                  href="https://maps.app.goo.gl/Udj1B5VZeBn2jo5dA?g_st=aw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" /> Open Location in Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>

            {/* Visual Photo Grid */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 grid grid-cols-2 gap-4"
            >
              <div className="space-y-4">
                <div className="relative aspect-4/5 rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-slate-100">
                  <Image
                    src="/gallery/item-6.webp"
                    alt="Classroom interactive training"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 text-white text-xs font-bold">Interactive Learning</span>
                </div>
                <div className="bg-blue-600 rounded-3xl p-6 text-white text-center shadow-md">
                  <p className="text-3xl font-black mb-1">10,000+</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-100">Students Guided</p>
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <div className="bg-amber-500 rounded-3xl p-6 text-slate-950 text-center shadow-md">
                  <p className="text-3xl font-black mb-1">10+ Years</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-900/80">Educational Excellence</p>
                </div>
                <div className="relative aspect-4/5 rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-slate-100">
                  <Image
                    src="/gallery/item-1.webp"
                    alt="Student batch celebration"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 text-white text-xs font-bold">Student Success</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200/80 relative overflow-hidden group hover:shadow-xl transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-50 -mr-10 -mt-10" />
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 font-display relative z-10">Our Mission</h3>
              <p className="text-slate-600 text-lg leading-relaxed relative z-10 font-medium">
                To provide transparent, data-driven education counseling and competitive exam training that empowers students across Telangana and Andhra Pradesh to achieve their fullest career potential.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200/80 relative overflow-hidden group hover:shadow-xl transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl opacity-50 -mr-10 -mt-10" />
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                <Eye className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 font-display relative z-10">Our Vision</h3>
              <p className="text-slate-600 text-lg leading-relaxed relative z-10 font-medium">
                To be the most trustworthy and transformative education and career guidance destination for Telugu students, bridging the opportunity gap between rural and urban aspirants.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Advisory Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 font-display">Our Mentorship &amp; Counseling Team</h2>
            <p className="text-base sm:text-lg text-slate-600 font-medium">Expert guidance from seasoned educators who understand TS and AP academic frameworks.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {counselors.map((counselor, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all text-center group"
              >
                <div className={`w-20 h-20 rounded-2xl ${counselor.color} flex items-center justify-center mx-auto mb-5 text-xl font-black shadow-md group-hover:scale-105 transition-transform`}>
                  {counselor.initial}
                </div>
                <h3 className="font-bold text-slate-900 text-xl mb-1">{counselor.name}</h3>
                <p className="text-blue-600 font-semibold text-sm mb-2">{counselor.role}</p>
                <p className="text-slate-500 text-xs mb-4 font-medium">{counselor.credentials}</p>
                <div className="bg-slate-50 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 border border-slate-100">
                  {counselor.specialization}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 font-display">Talk to Our Counselors in Gajwel</h2>
          <p className="text-blue-100 mb-8 text-base sm:text-lg font-medium">Get a personalized counseling session for college admissions or exam roadmaps.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold py-4 px-10 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
            >
              <GraduationCap className="w-5 h-5" />
              Book Free Counseling
            </Link>
            <a
              href="tel:+919640333313"
              className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 px-10 rounded-full transition-colors border border-blue-500"
            >
              <Phone className="w-5 h-5" />
              +91 9640333313
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
