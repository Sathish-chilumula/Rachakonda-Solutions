'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function WebsitePreloader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if splash was already shown this session
    const hasLoaded = sessionStorage.getItem('rs_splash_shown');
    if (hasLoaded) {
      setLoading(false);
      return;
    }

    // Animate progress smoothly
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
            sessionStorage.setItem('rs_splash_shown', 'true');
          }, 300);
          return 100;
        }
        // Random natural increment
        const increment = Math.floor(Math.random() * 25) + 15;
        return Math.min(prev + increment, 100);
      });
    }, 140);

    return () => clearInterval(interval);
  }, []);

  if (!loading) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden select-none"
      >
        {/* Ambient Animated Backlight */}
        <div className="absolute w-[450px] h-[450px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
        <div className="absolute w-[300px] h-[300px] bg-amber-500/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
          
          {/* Logo Emblem with Glow Ring */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-6"
          >
            {/* Outer Pulsing Aura */}
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-teal-500 to-amber-500 rounded-3xl blur-md opacity-60 animate-pulse" />
            
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-3xl p-3 shadow-2xl flex items-center justify-center border border-white/20">
              <Image
                src="/images/logo.webp"
                alt="Rachakonda Solution Logo"
                fill
                priority
                className="object-contain p-2"
                unoptimized
              />
            </div>
          </motion.div>

          {/* Brand Name & Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="space-y-1 mb-8"
          >
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider font-display">
              RACHAKONDA <span className="text-amber-400">SOLUTIONS</span>
            </h1>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest">
              All Questions &bull; One Place &bull; One Solution
            </p>
            <p className="text-[10px] font-bold text-blue-400 tracking-wider">
              ESTD - 2012 &bull; TELANGANA &amp; ANDHRA PRADESH
            </p>
          </motion.div>

          {/* High Precision Progress Bar */}
          <div className="w-48 sm:w-56 h-1.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/10 mb-3 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-teal-400 to-amber-400 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.2 }}
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[11px] font-medium text-slate-500 tracking-wider"
          >
            {progress < 40 && 'Initializing Education Portal...'}
            {progress >= 40 && progress < 80 && 'Loading Career Roadmaps...'}
            {progress >= 80 && 'Welcome to Rachakonda Solutions'}
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
