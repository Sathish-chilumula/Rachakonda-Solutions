'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Target, Eye, Shield, Users, Award, TrendingUp, MapPin, GraduationCap, Phone, Mail } from 'lucide-react';

// TODO: Replace these placeholder counselor profiles with real staff details before launch
const counselors = [
  {
    name: 'TODO: Counselor Name',
    role: 'Senior Education Counselor',
    credentials: 'M.Ed, 10+ years experience',
    specialization: 'Engineering & Medical Admissions (TS/AP)',
    initial: 'C',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'TODO: Counselor Name',
    role: 'Career Guidance Expert',
    credentials: 'MBA, Certified Career Coach',
    specialization: 'Government Jobs & Competitive Exams',
    initial: 'C',
    color: 'bg-teal-100 text-teal-700',
  },
  {
    name: 'TODO: Counselor Name',
    role: 'Study Abroad Advisor',
    credentials: 'M.Sc (UK), IELTS Expert',
    specialization: 'MS/MBA Abroad — US, UK, Germany',
    initial: 'C',
    color: 'bg-amber-100 text-amber-700',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1920')] opacity-5 bg-cover bg-center" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6"
          >
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">Serving Telangana &amp; Andhra Pradesh</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6 font-display"
          >
            About <span className="text-amber-400">Rachakonda Solutions</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto"
          >
            A trusted education consultancy dedicated to guiding students across Telangana and Andhra Pradesh toward the right academic and career choices.
          </motion.p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-6 font-display">Our Story</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
                <p>
                  Founded in Hyderabad with a single purpose — to make quality education guidance accessible to every student in Telangana and Andhra Pradesh, regardless of their background.
                </p>
                <p>
                  Over the years, we have helped thousands of students navigate complex decisions: which stream to choose after 10th, which entrance exam to prepare for, which college suits their goals, and how to plan for a career that actually excites them.
                </p>
                <p>
                  {/* TODO: Add real founding year and specific milestones */}
                  Today, Rachakonda Solutions is a focused education consultancy — offering expert counseling, skill courses, and free career guidance resources for students at every stage of their academic journey.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { value: '5,000+', label: 'Students Guided', color: 'bg-blue-600' },
                { value: '10+', label: 'Years of Experience', color: 'bg-teal-500' },
                { value: '20+', label: 'Expert Courses', color: 'bg-amber-500' },
                { value: 'Free', label: 'Career Guidance', color: 'bg-slate-800' },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.color} rounded-2xl p-6 text-white`}>
                  <p className="text-3xl font-black mb-1">{stat.value}</p>
                  <p className="text-sm font-medium opacity-80">{stat.label}</p>
                </div>
              ))}
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
              className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-50 -mr-10 -mt-10" />
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 font-display relative z-10">Our Mission</h3>
              <p className="text-slate-600 text-lg leading-relaxed relative z-10">
                To provide accessible, high-quality education counseling and career guidance that empowers students in Telangana and Andhra Pradesh to make confident choices about their academic and professional futures.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl opacity-50 -mr-10 -mt-10" />
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                <Eye className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 font-display relative z-10">Our Vision</h3>
              <p className="text-slate-600 text-lg leading-relaxed relative z-10">
                To be the most trusted education consultancy in Telangana and Andhra Pradesh — the first place a student turns when they need honest guidance about their future.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3 font-display">Our Core Values</h2>
            <p className="text-lg text-slate-500">The principles that guide every counseling session and course we offer.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Integrity', desc: 'We give honest guidance — even when it means telling a student to choose a different path than expected.' },
              { icon: Award, title: 'Excellence', desc: 'Our counselors stay updated on the latest exam patterns, college rankings, and career trends.' },
              { icon: Users, title: 'Student-First', desc: 'Every recommendation we make is based on what is best for the student, not convenience.' },
              { icon: TrendingUp, title: 'Local Focus', desc: 'We specialize in TS &amp; AP — meaning deep knowledge of EAMCET, TSPSC, APPSC, and regional colleges.' },
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-20 h-20 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-5 border border-slate-100 shadow-sm">
                  <value.icon className="w-9 h-9 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">{value.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: value.desc }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team / Counselors */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3 font-display">Our Counseling Team</h2>
            <p className="text-lg text-slate-500">Expert guidance from people who understand the TS &amp; AP education system inside-out.</p>
          </div>
          {/* TODO: Replace placeholder cards with real counselor profiles, photos, and credentials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {counselors.map((counselor, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center"
              >
                {/* TODO: Replace with real photo using next/image */}
                <div className={`w-20 h-20 rounded-full ${counselor.color} flex items-center justify-center mx-auto mb-4 text-2xl font-bold`}>
                  <GraduationCap className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">{counselor.name}</h3>
                <p className="text-blue-600 font-semibold text-sm mb-2">{counselor.role}</p>
                <p className="text-slate-500 text-xs mb-3">{counselor.credentials}</p>
                <div className="bg-slate-50 rounded-xl px-3 py-2 text-xs font-medium text-slate-600">
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
          <h2 className="text-3xl font-bold text-white mb-4 font-display">Talk to Our Counselors</h2>
          <p className="text-blue-100 mb-8 text-lg">Get a free 30-minute session with one of our education experts. No obligation, honest advice.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold py-4 px-10 rounded-full shadow-lg hover:bg-blue-50 transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              Book Free Counseling
            </Link>
            <a
              href="tel:+919640333313"
              className="inline-flex items-center gap-2 bg-blue-700 text-white font-bold py-4 px-10 rounded-full hover:bg-blue-800 transition-colors"
            >
              <Phone className="w-4 h-4" />
              +91 9640333313
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
