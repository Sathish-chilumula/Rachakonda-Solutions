'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-10 md:p-16 shadow-2xl max-w-2xl w-full text-center border border-slate-100"
      >
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-display">Thank You!</h1>
        <p className="text-xl text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
          Your application has been successfully submitted. Our financial expert will review your details and contact you within the next 24 hours.
        </p>
        
        <div className="bg-slate-50 rounded-2xl p-6 mb-10 text-left border border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-4">What happens next?</h3>
          <ul className="space-y-3 text-slate-600 text-sm">
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 shrink-0">1</span>
              Our team reviews your application and eligibility.
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 shrink-0">2</span>
              We contact you to discuss the best loan options and rates.
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 shrink-0">3</span>
              You submit the required documents online or via our executive.
            </li>
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 shrink-0">4</span>
              Loan is approved and disbursed to your account.
            </li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/finance" className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 px-8 rounded-full transition-colors flex items-center justify-center">
            Explore More Loans
          </Link>
          <Link href="/" className="w-full sm:w-auto bg-white text-blue-900 border border-slate-200 hover:bg-slate-50 font-bold py-4 px-8 rounded-full transition-colors flex items-center justify-center">
            Return Home <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
