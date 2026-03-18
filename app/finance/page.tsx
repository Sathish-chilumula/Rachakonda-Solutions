'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Landmark, Home, Car, Briefcase, GraduationCap, Coins, ArrowRight, ShieldCheck, Clock, Percent } from 'lucide-react';

const loanTypes = [
  { id: 'gold-loan', title: 'Gold Loan', icon: Coins, desc: 'Instant cash against your gold ornaments with minimal documentation.', rate: 'From 8.5% p.a.' },
  { id: 'personal-loan', title: 'Personal Loan', icon: Briefcase, desc: 'Quick funds for your personal needs without any collateral.', rate: 'From 10.5% p.a.' },
  { id: 'home-loan', title: 'Home Loan', icon: Home, desc: 'Make your dream home a reality with our flexible home loans.', rate: 'From 8.3% p.a.' },
  { id: 'business-loan', title: 'Business Loan', icon: Landmark, desc: 'Fuel your business growth with customized financing solutions.', rate: 'From 11.0% p.a.' },
  { id: 'mortgage-loan', title: 'Mortgage Loan', icon: ShieldCheck, desc: 'Unlock the value of your property for large financial needs.', rate: 'From 9.5% p.a.' },
  { id: 'car-loan', title: 'Car Loan', icon: Car, desc: 'Drive home your dream car with easy EMI options.', rate: 'From 8.8% p.a.' },
  { id: 'education-loan', title: 'Education Loan', icon: GraduationCap, desc: 'Invest in your future with hassle-free education financing.', rate: 'From 9.0% p.a.' },
];

export default function FinancePortal() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      {/* Hero Section */}
      <section className="bg-blue-950 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/finance/1920/1080')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6 font-display"
          >
            Smart Financial Solutions for <span className="text-amber-500">Your Future</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 max-w-2xl mx-auto mb-10"
          >
            Get instant approval on loans with competitive interest rates and flexible repayment options.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-4"
          >
            <Link href="#loan-types" className="bg-amber-500 hover:bg-amber-600 text-blue-950 font-bold py-4 px-8 rounded-full transition-colors shadow-lg shadow-amber-500/30">
              Apply Now
            </Link>
            <Link href="/contact" className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-full backdrop-blur-sm transition-colors border border-white/20">
              Talk to Expert
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Instant Approval</h3>
              <p className="text-slate-600">Get your loan approved within minutes with minimal documentation.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Percent className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Lowest Interest Rates</h3>
              <p className="text-slate-600">Enjoy competitive interest rates starting from 8.3% p.a.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">100% Secure</h3>
              <p className="text-slate-600">Your data is encrypted and protected with bank-grade security.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Loan Types Grid */}
      <section id="loan-types" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-display mb-4">Choose Your Loan Type</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Select the loan that best fits your financial needs and apply online instantly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loanTypes.map((loan, index) => (
            <motion.div
              key={loan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/finance/${loan.id}`} className="group block h-full">
                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-slate-100 hover:border-blue-200 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-2xl opacity-50 -mr-10 -mt-10 group-hover:bg-blue-50 transition-colors duration-500"></div>
                  
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 shadow-inner relative z-10 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                    <loan.icon className="w-7 h-7 text-blue-900" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3 font-display relative z-10">{loan.title}</h3>
                  <p className="text-slate-600 text-sm mb-6 flex-grow relative z-10">{loan.desc}</p>
                  
                  <div className="flex items-center justify-between mt-auto relative z-10 pt-4 border-t border-slate-100">
                    <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">{loan.rate}</span>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-900 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-blue-900 py-16 mt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6 font-display">Need Help Choosing the Right Loan?</h2>
          <p className="text-blue-100 mb-8 text-lg">Our financial experts are available 24/7 to guide you through the process and help you find the best rates.</p>
          <Link href="/contact" className="inline-block bg-white text-blue-900 font-bold py-4 px-10 rounded-full shadow-lg hover:bg-slate-50 transition-colors">
            Request a Callback
          </Link>
        </div>
      </section>
    </div>
  );
}
