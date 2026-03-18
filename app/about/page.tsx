'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { Target, Eye, Shield, Users, Award, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      {/* Hero Section */}
      <section className="bg-blue-950 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/about/1920/1080')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6 font-display"
          >
            About <span className="text-amber-500">Rachakonda Solutions</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto"
          >
            We are a premier consultancy firm dedicated to empowering individuals and businesses through top-tier education and comprehensive financial services.
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
                  Founded with a vision to bridge the gap between potential and success, Rachakonda Solutions has grown into a trusted partner for thousands of students, professionals, and businesses across India.
                </p>
                <p>
                  We recognized early on that true empowerment requires a dual approach: equipping minds with the right education and fueling ambitions with the right financial backing. This led to the creation of our two core divisions: the Education Portal and the Finance Portal.
                </p>
                <p>
                  Today, we pride ourselves on our unwavering commitment to quality, transparency, and customer success. Whether you are looking to upskill for the modern workforce or seeking capital to expand your enterprise, we are here to guide you every step of the way.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl"
            >
              <Image 
                src="https://picsum.photos/seed/team/800/1000" 
                alt="Our Team" 
                fill 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 to-transparent flex items-end p-8">
                <div className="text-white">
                  <p className="text-2xl font-bold mb-2">10+ Years</p>
                  <p className="text-blue-100">Of Excellence & Trust</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-50 -mr-10 -mt-10 group-hover:bg-blue-100 transition-colors"></div>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 font-display relative z-10">Our Mission</h3>
              <p className="text-slate-600 text-lg leading-relaxed relative z-10">
                To provide accessible, high-quality education and transparent, tailored financial solutions that enable our clients to achieve their personal and professional goals.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl opacity-50 -mr-10 -mt-10 group-hover:bg-amber-100 transition-colors"></div>
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                <Eye className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 font-display relative z-10">Our Vision</h3>
              <p className="text-slate-600 text-lg leading-relaxed relative z-10">
                To be the most trusted and innovative consultancy firm in India, recognized for our commitment to excellence, integrity, and the holistic growth of our clients.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 font-display">Our Core Values</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">The principles that guide our actions and define our culture.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Integrity', desc: 'We uphold the highest standards of honesty and transparency in all our dealings.' },
              { icon: Award, title: 'Excellence', desc: 'We strive for superior quality and continuous improvement in our services.' },
              { icon: Users, title: 'Client-Centric', desc: 'Our clients success is our success. We put their needs at the heart of everything we do.' },
              { icon: TrendingUp, title: 'Innovation', desc: 'We embrace change and constantly seek new ways to deliver value.' },
            ].map((value, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-20 h-20 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
                  <value.icon className="w-10 h-10 text-blue-900" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">{value.title}</h3>
                <p className="text-slate-600">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
