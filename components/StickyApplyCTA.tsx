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
    <aside aria-label="Quick Application CTA" className="fixed bottom-0 right-0 z-30 animate-in slide-in-from-bottom-4 fade-in duration-300">
      {/* Desktop only: floating action pill (Mobile uses the native Bottom Navigation Bar) */}
      <div className="hidden md:flex justify-end pb-6 pr-6">
        <div className="bg-slate-950/95 text-white px-6 py-3.5 rounded-full shadow-2xl shadow-blue-950/40 flex items-center gap-4 border border-blue-800/50 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-bold text-slate-100">Free admission &amp; career guidance slots open today</span>
          </div>
          <Link
            href="/contact"
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-full transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
          >
            Book Free Call <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
