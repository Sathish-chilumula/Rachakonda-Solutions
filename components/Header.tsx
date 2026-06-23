'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, GraduationCap, MapPin, Phone } from 'lucide-react';
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
          : 'bg-transparent py-4'
      }`}
    >
      {/* Top bar — service area */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:bg-blue-700 transition-colors">
              R
            </div>
            <div className="hidden sm:block">
              <span className={`font-bold text-lg tracking-tight leading-none block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Rachakonda <span className="text-amber-500">Solutions</span>
              </span>
              <span className={`text-[10px] font-medium tracking-wider ${isLight ? 'text-slate-500' : 'text-blue-200'}`}>
                EDUCATION &amp; CAREER GUIDANCE
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
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/crm/login"
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

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/contact"
              className="px-3 py-2 bg-amber-500 text-slate-900 rounded-lg text-xs font-bold shadow"
            >
              Counseling
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-100 shadow-xl overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {/* Service area badge */}
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-xl mb-3">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-medium text-blue-700">Serving Telangana &amp; Andhra Pradesh</span>
              </div>

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
                <div key={group.label}>
                  <button
                    onClick={() => setOpenMobileGroup(openMobileGroup === group.label ? null : group.label)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {group.label}
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        openMobileGroup === group.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openMobileGroup === group.label && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden ml-3 mt-1 border-l-2 border-blue-100 pl-3 space-y-1"
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
                            {item.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <div className="pt-2 border-t border-slate-100 mt-3 flex gap-3">
                <Link
                  href="/crm/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 text-sm font-bold text-slate-900 bg-amber-500 rounded-xl hover:bg-amber-400"
                >
                  Free Counseling
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
