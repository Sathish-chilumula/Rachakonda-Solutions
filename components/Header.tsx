'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, GraduationCap, MapPin, Phone, MessageCircle, Building2, BookOpen, Gift, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navGroups = [
  {
    label: 'Student Journey',
    items: [
      { name: 'After 10th', href: '/after-10th', desc: 'Stream selection & next steps' },
      { name: 'After Inter', href: '/after-inter', desc: 'Engineering, Medical, Commerce paths' },
      { name: 'After Degree', href: '/after-degree', desc: 'Jobs, PG & higher education' },
    ],
  },
  {
    label: 'Explore',
    items: [
      { name: 'Colleges', href: '/colleges', desc: 'Top colleges in TS & AP' },
      { name: 'Exams', href: '/exams', desc: 'EAMCET, NEET, TSPSC & more' },
      { name: 'Govt Jobs', href: '/government-jobs', desc: 'Latest openings by qualification' },
      { name: 'Scholarships', href: '/scholarships', desc: 'TS, AP & national schemes' },
      { name: 'Careers & Hiring', href: '/careers', desc: '★ 95 Staff Openings • Walk-in Drive' },
    ],
  },
  {
    label: 'Guidance',
    items: [
      { name: 'Career Guidance', href: '/career-guidance', desc: 'Free career roadmaps' },
      { name: 'Resources', href: '/resources', desc: 'Papers, syllabus & study tools' },
      { name: 'Courses', href: '/education', desc: 'Skill & professional courses' },
    ],
  },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  const isLight = isScrolled || pathname !== '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isLight
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 py-2'
          : 'bg-transparent py-3 sm:py-4'
      }`}
    >
      {/* Top bar — service area (Desktop only) */}
      {!isScrolled && pathname === '/' && (
        <div className="bg-blue-600 py-1.5 text-center text-xs font-medium text-white hidden md:block">
          <span className="flex items-center justify-center gap-1.5">
            <MapPin className="w-3 h-3" />
            Serving students across <strong>Telangana &amp; Andhra Pradesh</strong>
            <span className="mx-2 text-blue-300">|</span>
            <Phone className="w-3 h-3" />
            <a href="tel:+919640333313" className="hover:text-blue-200 transition-colors">+91 9640333313</a>
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-sm bg-white p-1 border border-slate-200 group-hover:scale-105 transition-transform shrink-0">
              <Image
                src="/images/logo.webp"
                alt="Rachakonda Solutions Logo"
                fill
                className="object-contain p-0.5"
                unoptimized
              />
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-sm sm:text-lg tracking-tight leading-none block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Rachakonda <span className="text-amber-500">Solutions</span>
              </span>
              <span className={`text-[9px] sm:text-[10px] font-bold tracking-wider mt-0.5 ${isLight ? 'text-slate-500' : 'text-blue-200'}`}>
                ESTD 2012 &bull; TS &amp; AP
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav ref={dropdownRef} className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname === '/'
                  ? 'text-blue-600 bg-blue-50'
                  : isLight
                  ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Home
            </Link>

            {navGroups.map((group) => {
              const isGroupActive = group.items.some(item => pathname.startsWith(item.href));
              return (
                <div key={group.label} className="relative">
                  <button
                    onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isGroupActive
                        ? 'text-blue-600 bg-blue-50'
                        : isLight
                        ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {group.label}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        openGroup === group.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {openGroup === group.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
                      >
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0 ${
                              pathname.startsWith(item.href) ? 'bg-blue-50' : ''
                            }`}
                          >
                            <span className={`text-sm font-semibold ${pathname.startsWith(item.href) ? 'text-blue-600' : 'text-slate-800'}`}>
                              {item.name}
                            </span>
                            <span className="text-xs text-slate-500 mt-0.5">{item.desc}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Direct Careers Highlight Link */}
            <Link
              href="/careers"
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-xl transition-all ${
                pathname === '/careers'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : isLight
                  ? 'text-amber-800 bg-amber-50/80 hover:bg-amber-100 border border-amber-200/80'
                  : 'text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-600" />
              <span>Careers</span>
              <span className="text-[10px] bg-red-600 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-tight animate-pulse">
                95 Posts
              </span>
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className={`text-sm font-medium transition-colors ${
                isLight ? 'text-slate-500 hover:text-slate-900' : 'text-white/80 hover:text-white'
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/contact"
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4" />
              Free Counseling
            </Link>
          </div>

          {/* Mobile Controls (Clean App-Like Header) */}
          <div className="flex lg:hidden items-center gap-2">
            <a
              href="tel:+919640333313"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 active:scale-95 transition-transform"
              aria-label="Direct Phone Helpline"
            >
              <Phone className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">Call</span>
            </a>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl transition-colors ${
                isLight ? 'text-slate-800 hover:bg-slate-100 bg-slate-50' : 'text-white hover:bg-white/10 bg-white/10'
              }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer (Native App Sheet Feel) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-100 shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
              {/* Service area badge & App Greeting */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-900">Rachakonda Solutions Portal</p>
                  <p className="text-[11px] text-blue-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-blue-500" /> Serving Telangana &amp; Andhra Pradesh
                  </p>
                </div>
                <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                  ESTD 2012
                </span>
              </div>

              {/* Urgent Hiring Banner in Mobile Drawer */}
              <Link
                href="/careers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-300 rounded-2xl flex items-center justify-between shadow-xs hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      We Are Hiring 95 Staff!
                      <span className="animate-pulse inline-block w-2 h-2 rounded-full bg-red-600"></span>
                    </p>
                    <p className="text-[10px] text-amber-800 font-medium">Walk-in Interview Drive &bull; Apply Online</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-amber-950 bg-amber-300/80 px-2 py-0.5 rounded-lg shrink-0">
                  Apply &rarr;
                </span>
              </Link>

              {/* Quick App Shortcut Grid */}
              <div className="grid grid-cols-5 gap-1.5 pt-1 pb-2">
                {[
                  { label: 'Colleges', href: '/colleges', icon: Building2, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Exams', href: '/exams', icon: BookOpen, color: 'text-teal-600 bg-teal-50' },
                  { label: 'Careers', href: '/careers', icon: Briefcase, color: 'text-amber-600 bg-amber-50' },
                  { label: 'Scholarships', href: '/scholarships', icon: Gift, color: 'text-purple-600 bg-purple-50' },
                  { label: 'Govt Jobs', href: '/government-jobs', icon: Briefcase, color: 'text-slate-600 bg-slate-100' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex flex-col items-center p-1.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 active:scale-95 transition-all text-center"
                  >
                    <div className={`w-7 h-7 rounded-lg ${item.color} flex items-center justify-center mb-1`}>
                      <item.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 truncate w-full">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Navigation links */}
              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    pathname === '/' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Home
                </Link>

                {navGroups.map((group) => (
                  <div key={group.label} className="border-b border-slate-50 last:border-0 pb-1">
                    <button
                      onClick={() => setOpenMobileGroup(openMobileGroup === group.label ? null : group.label)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <span>{group.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          openMobileGroup === group.label ? 'rotate-180 text-blue-600' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {openMobileGroup === group.label && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden ml-3 mt-1 border-l-2 border-blue-200 pl-3 space-y-1"
                        >
                          {group.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                                pathname.startsWith(item.href)
                                  ? 'text-blue-600 font-semibold bg-blue-50'
                                  : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <div className="font-semibold">{item.name}</div>
                              <div className="text-[11px] text-slate-400">{item.desc}</div>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-3 text-sm font-bold text-slate-950 bg-amber-500 rounded-xl hover:bg-amber-400 shadow-md flex items-center justify-center gap-1.5"
                >
                  <GraduationCap className="w-4 h-4" />
                  Book Free Counseling Session
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:+919640333313"
                    className="py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call +91 9640333313
                  </a>
                  <a
                    href="https://wa.me/919640333313"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Support
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
