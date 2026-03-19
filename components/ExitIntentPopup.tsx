'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Zap, ArrowRight, Phone, User, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loanType, setLoanType] = useState('personal-loan');

  const triggerPopup = useCallback(() => {
    const shown = sessionStorage.getItem('exit_popup_shown');
    if (shown) return;
    setShow(true);
    sessionStorage.setItem('exit_popup_shown', 'true');
  }, []);

  useEffect(() => {
    // Desktop: detect mouse leaving viewport
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        triggerPopup();
      }
    };

    // Delay adding listener to avoid triggering on page load
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [triggerPopup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    
    setSubmitting(true);
    try {
      await supabase.from('leads').insert([{
        name,
        phone,
        loan_type: loanType,
        status: 'new',
        source: 'exit_popup',
        priority: 'hot',
      }]);
      setSubmitted(true);
    } catch {
      // Silent fail — don't block user
    }
    setSubmitting(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShow(false)} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Gradient top bar */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-800 to-amber-500" />
        
        <button
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 text-slate-400 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">You&apos;re In! 🎉</h3>
              <p className="text-sm text-slate-500">Our loan expert will call you within 30 minutes.</p>
              <button
                onClick={() => setShow(false)}
                className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full mb-4">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Don&apos;t Miss Out</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Wait! Check Your Loan<br />Eligibility First
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Get instant approval decision in just 2 minutes. No documents needed.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </div>

                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <select
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none"
                  >
                    <option value="personal-loan">Personal Loan</option>
                    <option value="home-loan">Home Loan</option>
                    <option value="business-loan">Business Loan</option>
                    <option value="gold-loan">Gold Loan</option>
                    <option value="car-loan">Car Loan</option>
                    <option value="education-loan">Education Loan</option>
                    <option value="mortgage-loan">Mortgage Loan</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Checking...' : (
                    <>Check My Eligibility <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>

                <p className="text-[10px] text-slate-400 text-center font-medium">
                  No spam. Your data is 100% secure & encrypted.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
