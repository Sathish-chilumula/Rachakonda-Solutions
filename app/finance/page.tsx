'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Landmark, Home, Car, Briefcase, GraduationCap, Coins, ArrowRight, ShieldCheck, Clock, Percent, Star, Zap, TrendingUp, Users, CheckCircle2, Calculator, IndianRupee, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const loanTypes = [
  { id: 'gold-loan', title: 'Gold Loan', icon: Coins, desc: 'Instant cash against your gold ornaments with minimal documentation.', rate: 'From 8.5% p.a.', popular: false },
  { id: 'personal-loan', title: 'Personal Loan', icon: Briefcase, desc: 'Quick funds for your personal needs without any collateral.', rate: 'From 10.5% p.a.', popular: true },
  { id: 'home-loan', title: 'Home Loan', icon: Home, desc: 'Make your dream home a reality with our flexible home loans.', rate: 'From 8.3% p.a.', popular: true },
  { id: 'business-loan', title: 'Business Loan', icon: Landmark, desc: 'Fuel your business growth with customized financing solutions.', rate: 'From 11.0% p.a.', popular: false },
  { id: 'mortgage-loan', title: 'Mortgage Loan', icon: ShieldCheck, desc: 'Unlock the value of your property for large financial needs.', rate: 'From 9.5% p.a.', popular: false },
  { id: 'car-loan', title: 'Car Loan', icon: Car, desc: 'Drive home your dream car with easy EMI options.', rate: 'From 8.8% p.a.', popular: false },
  { id: 'education-loan', title: 'Education Loan', icon: GraduationCap, desc: 'Invest in your future with hassle-free education financing.', rate: 'From 9.0% p.a.', popular: false },
];

const testimonials = [
  { name: 'Rajesh Kumar', city: 'Hyderabad', type: 'Home Loan', text: 'Got my home loan approved in just 48 hours. The team was incredibly supportive throughout the process. Best experience!', rating: 5 },
  { name: 'Priya Sharma', city: 'Secunderabad', type: 'Personal Loan', text: 'Needed urgent funds for medical expenses. Rachakonda Solutions processed my application same day. Truly grateful!', rating: 5 },
  { name: 'Mohammed Faisal', city: 'Warangal', type: 'Business Loan', text: 'As a small business owner, getting a loan was always difficult. They made it seamless with minimal paperwork.', rating: 4 },
];

const partnerBanks = ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak', 'IndusInd'];

export default function FinancePortal() {
  // Quick Apply form state
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [quickSubmitted, setQuickSubmitted] = useState(false);

  // Eligibility Checker
  const [income, setIncome] = useState('');
  const [eligibilityResult, setEligibilityResult] = useState<number | null>(null);

  const handleQuickApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName || !quickPhone) return;
    setQuickSubmitting(true);

    try {
      await supabase.from('leads').insert([{
        name: quickName,
        phone: quickPhone,
        loan_type: 'general-enquiry',
        status: 'new',
        source: 'finance_hero',
        priority: 'hot',
      }]);
    } catch { /* silent */ }

    setQuickSubmitted(true);
    setQuickSubmitting(false);
  };

  const checkEligibility = () => {
    const monthlyIncome = parseInt(income);
    if (monthlyIncome && monthlyIncome > 0) {
      setEligibilityResult(monthlyIncome * 60);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      {/* === HERO SECTION — Conversion Focused === */}
      <section className="bg-blue-950 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621503673-9a39ca532d73?auto=format&fit=crop&q=80&w=1920')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        {/* Glow effect */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              {/* Urgency badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">🔥 Limited approval slots today</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-[1.1]"
              >
                Get Your Loan<br />
                Approved in <span className="text-amber-500">24 Hours</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-blue-200 max-w-xl mb-8"
              >
                Zero-hassle loan processing with competitive rates starting at 8.3% p.a. Minimal documentation. Maximum trust.
              </motion.p>

              {/* Social proof stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-6 md:gap-10"
              >
                {[
                  { value: '2,500+', label: 'Loans Disbursed' },
                  { value: '₹50Cr+', label: 'Funded' },
                  { value: '4.8★', label: 'Google Rating' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl md:text-3xl font-black text-white">{stat.value}</p>
                    <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Quick Apply Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-8 shadow-2xl shadow-blue-950/50 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-amber-500" />
              
              {quickSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Application Received! 🎉</h3>
                  <p className="text-sm text-slate-500">Our loan expert will call you within 30 minutes.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h3 className="text-xl font-black text-slate-900">Quick Apply</h3>
                  </div>
                  <p className="text-sm text-slate-500 mb-6">Just 2 fields. Get a callback in 30 mins.</p>

                  <form onSubmit={handleQuickApply} className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={quickName}
                        onChange={(e) => setQuickName(e.target.value)}
                        placeholder="Your Full Name"
                        required
                        className="w-full pl-5 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="tel"
                        value={quickPhone}
                        onChange={(e) => setQuickPhone(e.target.value)}
                        placeholder="Phone Number"
                        required
                        className="w-full pl-5 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={quickSubmitting}
                      className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-blue-950 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-amber-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {quickSubmitting ? 'Submitting...' : (
                        <>Check Eligibility Now <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-slate-400 font-medium">
                      🔒 100% Secure. No spam calls.
                    </p>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* === TRUST BAR: Partner Banks === */}
      <section className="py-6 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] shrink-0">Partnered With</p>
            <div className="flex items-center gap-8 flex-wrap justify-center">
              {partnerBanks.map((bank) => (
                <span key={bank} className="text-sm font-black text-slate-300 uppercase tracking-wider hover:text-blue-600 transition-colors cursor-default">{bank}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* === FEATURES === */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Clock, title: '24-Hour Approval', desc: 'Get approved within a single business day.', color: 'blue' },
              { icon: Percent, title: 'Rates from 8.3%', desc: 'Industry-best rates across all loan types.', color: 'amber' },
              { icon: ShieldCheck, title: 'Bank-Grade Security', desc: 'Your data is encrypted and 100% secure.', color: 'green' },
              { icon: Users, title: 'Expert Advisors', desc: 'Dedicated loan officer assigned to you.', color: 'purple' },
            ].map((f) => (
              <div key={f.title} className="flex flex-col items-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                  f.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  f.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                  f.color === 'green' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                }`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === ELIGIBILITY CHECKER === */}
      <section className="py-16 bg-gradient-to-br from-blue-950 to-blue-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full mb-6">
            <Calculator className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">Instant Check</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
            How Much Loan Can You Get?
          </h2>
          <p className="text-blue-200 mb-10 max-w-lg mx-auto">
            Enter your monthly income below and instantly see your maximum eligible loan amount.
          </p>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md mx-auto">
            <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-1 mb-6">
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 flex-1">
                <IndianRupee className="w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  value={income}
                  onChange={(e) => { setIncome(e.target.value); setEligibilityResult(null); }}
                  placeholder="Monthly Income"
                  className="bg-transparent text-lg font-bold text-slate-900 outline-none w-full placeholder:text-slate-400"
                />
              </div>
              <button
                onClick={checkEligibility}
                disabled={!income}
                className="px-6 py-3 bg-amber-500 text-blue-950 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-amber-400 transition-colors disabled:opacity-50 shrink-0"
              >
                Check
              </button>
            </div>

            {eligibilityResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-6">
                  <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-1">You&apos;re Eligible For Up To</p>
                  <p className="text-4xl font-black text-white">
                    ₹{eligibilityResult.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-emerald-300 mt-2">
                    EMI starting at ₹{Math.round(eligibilityResult / 60).toLocaleString('en-IN')}/month (5 year tenure)
                  </p>
                </div>
                <Link 
                  href="/finance/personal-loan"
                  className="block w-full py-4 bg-amber-500 text-blue-950 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-amber-400 transition-colors text-center shadow-xl"
                >
                  Apply Now — 24 Hour Approval
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* === LOAN TYPES GRID === */}
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
                  {loan.popular && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-amber-500 text-blue-950 text-[9px] font-black uppercase tracking-widest rounded-full">
                      Popular
                    </div>
                  )}
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

      {/* === TESTIMONIALS === */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 font-display mb-3">What Our Customers Say</h2>
            <p className="text-slate-600">Real stories from people we&apos;ve helped get financial freedom.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 rounded-3xl p-8 border border-slate-100 relative"
              >
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`w-4 h-4 ${j < t.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                  ))}
                </div>
                <p className="text-slate-700 text-sm mb-6 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.type} • {t.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === BOTTOM CTA === */}
      <section className="bg-blue-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full mb-6">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">98% Approval Rate</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-6 font-display">Need Help Choosing the Right Loan?</h2>
          <p className="text-blue-100 mb-8 text-lg">Our financial experts are available to guide you and find the best rates.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact" className="inline-block bg-white text-blue-900 font-bold py-4 px-10 rounded-full shadow-lg hover:bg-slate-50 transition-colors">
              Request a Callback
            </Link>
            <a href="tel:+919876543210" className="inline-flex items-center gap-2 bg-amber-500 text-blue-950 font-bold py-4 px-10 rounded-full shadow-lg hover:bg-amber-400 transition-colors">
              <Phone className="w-5 h-5" />
              Call Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
