'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, Landmark, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-blue-950">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973b0f65e59?auto=format&fit=crop&q=80&w=1920')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/80 via-blue-950/90 to-slate-50"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight font-display">
              Rachakonda <span className="text-amber-500">Solutions</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 font-light">
              Empowering Education & Financial Growth
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Divisions Cards */}
      <section className="relative -mt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Education Card */}
          <Link href="/education" className="group block">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/70 backdrop-blur-2xl rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 h-full flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-400/30 transition-colors duration-500"></div>
              
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-white/50 relative z-10 group-hover:scale-110 transition-transform duration-500">
                <GraduationCap className="w-10 h-10 text-blue-700" />
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-4 font-display relative z-10">Education</h2>
              <p className="text-slate-600 text-lg mb-10 flex-grow relative z-10">
                Comprehensive courses, expert training, tutorials, and professional consultancy to accelerate your career.
              </p>
              
              <div className="flex items-center text-blue-700 font-semibold text-lg relative z-10 group-hover:text-amber-600 transition-colors">
                Explore Education 
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>
          </Link>

          {/* Finance Card */}
          <Link href="/finance" className="group block">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/70 backdrop-blur-2xl rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 h-full flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-amber-400/30 transition-colors duration-500"></div>
              
              <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-white/50 relative z-10 group-hover:scale-110 transition-transform duration-500">
                <Landmark className="w-10 h-10 text-amber-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-4 font-display relative z-10">Finance</h2>
              <p className="text-slate-600 text-lg mb-4 flex-grow relative z-10">
                Tailored loans, comprehensive financial services, and expert advisory to secure your future.
              </p>
              <div className="flex items-center gap-2 mb-6 relative z-10">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-bold text-amber-600">Limited approval slots today</span>
              </div>
              
              <div className="flex items-center text-amber-600 font-semibold text-lg relative z-10 group-hover:text-blue-700 transition-colors">
                Explore Finance 
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>
          </Link>

        </div>
      </section>

      {/* What We Do Section (Premium Bento Grid) */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 font-display">
                What We <span className="text-amber-500">Do</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Delivering excellence across education and financial sectors with premium solutions tailored for your success.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Feature */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 relative h-[400px] rounded-3xl overflow-hidden group shadow-lg"
            >
              <Image 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200" 
                alt="Premium Education" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-2xl font-bold text-white mb-2">Premium Education</h3>
                  <p className="text-slate-200">Advanced courses and professional training designed to elevate your career to the next level.</p>
                </div>
              </div>
            </motion.div>

            {/* Small Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative h-[400px] rounded-3xl overflow-hidden group shadow-lg"
            >
              <Image 
                src="https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?auto=format&fit=crop&q=80&w=600" 
                alt="Financial Services" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-xl font-bold text-white mb-2">Financial Services</h3>
                  <p className="text-blue-100 text-sm">Expert advisory and tailored loan solutions.</p>
                </div>
              </div>
            </motion.div>
            
            {/* Small Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative h-[300px] rounded-3xl overflow-hidden group shadow-lg"
            >
              <Image 
                src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=600" 
                alt="Expert Consulting" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/90 via-amber-900/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-xl font-bold text-white mb-2">Expert Consulting</h3>
                  <p className="text-amber-100 text-sm">Strategic guidance for your business growth.</p>
                </div>
              </div>
            </motion.div>

            {/* Medium Feature */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-2 relative h-[300px] rounded-3xl overflow-hidden group shadow-lg bg-slate-900 flex items-center"
            >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200')] opacity-30 bg-cover bg-center mix-blend-overlay transition-transform duration-700 group-hover:scale-105"></div>
              <div className="relative z-10 p-10 md:p-16 w-full flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0">
                  <h3 className="text-3xl font-bold text-white mb-2">Ready to Transform?</h3>
                  <p className="text-slate-300 max-w-md">Connect with our experts today and start your journey towards excellence.</p>
                </div>
                <Link href="/contact" className="shrink-0 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-4 px-8 rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:-translate-y-1 flex items-center">
                  Contact Us Now <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* About Us Preview */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50 rounded-l-[100px] opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 font-display">
                Your Trusted Partner in <span className="text-blue-900">Growth</span>
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                At Rachakonda Solutions, we believe in a holistic approach to success. By combining top-tier educational resources with comprehensive financial services, we empower individuals and businesses to reach their full potential.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center text-slate-700">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-4 shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-medium">10+ Years of Industry Experience</span>
                </li>
                <li className="flex items-center text-slate-700">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-4 shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-medium">Expert Consultants & Advisors</span>
                </li>
                <li className="flex items-center text-slate-700">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-4 shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="font-medium">Tailored Solutions for Your Needs</span>
                </li>
              </ul>
              <Link href="/about" className="inline-flex items-center bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 px-8 rounded-full transition-colors shadow-lg">
                Learn More About Us <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl"
            >
              <Image 
                src="https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&q=80&w=800" 
                alt="Rachakonda Solutions Office" 
                fill 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Stats Counter */}
      <section className="py-12 bg-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-black text-white">2,500+</p>
              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mt-1">Happy Clients</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-amber-500">₹50Cr+</p>
              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mt-1">Disbursed</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-white">98%</p>
              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mt-1">Approval Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Partnered with India&apos;s leading banks</p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-16">
            {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak'].map((bank) => (
              <span key={bank} className="text-lg font-black text-slate-300 uppercase tracking-wider hover:text-blue-600 transition-colors cursor-default">{bank}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
