'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, X, Zap } from 'lucide-react';

export default function StickyApplyCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 300px
      if (window.scrollY > 300 && !dismissed) {
        setVisible(true);
      } else if (window.scrollY <= 300) {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed]);

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[80] animate-in slide-in-from-bottom-4 fade-in duration-300">
      {/* Mobile: full bar */}
      <div className="md:hidden bg-gradient-to-r from-blue-950 to-blue-900 text-white px-4 py-3 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold">Free Career Counseling</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="px-5 py-2 bg-amber-500 text-blue-950 text-xs font-black uppercase tracking-wider rounded-full hover:bg-amber-400 transition-colors shadow-lg"
          >
            Book Now
          </Link>
          <button onClick={() => setDismissed(true)} className="p-1 text-blue-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Desktop: floating pill */}
      <div className="hidden md:flex justify-end pb-6 pr-6">
        <div className="bg-blue-950 text-white px-6 py-3.5 rounded-full shadow-2xl shadow-blue-950/40 flex items-center gap-4 border border-blue-800/50 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-bold">Limited free counseling slots today</span>
          </div>
          <Link
            href="/contact"
            className="px-5 py-2 bg-amber-500 text-blue-950 text-xs font-black uppercase tracking-widest rounded-full hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-lg"
          >
            Book Now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button onClick={() => setDismissed(true)} className="p-1 text-blue-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
