'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2, BookOpen, Compass, GraduationCap, PhoneCall } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  isActive: (pathname: string) => boolean;
  isSpecial?: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
    isActive: (p) => p === '/',
  },
  {
    label: 'Colleges',
    href: '/colleges',
    icon: Building2,
    isActive: (p) => p.startsWith('/colleges'),
  },
  {
    label: 'Exams',
    href: '/exams',
    icon: BookOpen,
    isActive: (p) => p.startsWith('/exams'),
  },
  {
    label: 'Guidance',
    href: '/career-guidance',
    icon: Compass,
    isActive: (p) => p.startsWith('/career-guidance') || p.startsWith('/after-'),
  },
  {
    label: 'Counseling',
    href: '/contact',
    icon: GraduationCap,
    isActive: (p) => p.startsWith('/contact'),
    isSpecial: true,
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Don't display in CRM portal
  if (pathname?.startsWith('/crm')) return null;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden pb-[max(env(safe-area-inset-bottom),6px)]"
    >
      <div className="grid grid-cols-5 items-center px-1 pt-1.5 pb-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;

          if (item.isSpecial) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center relative group py-1"
              >
                <div
                  className={`w-10 h-10 -mt-3 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-90 ${
                    active
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                      : 'bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 shadow-amber-500/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold tracking-tight mt-1 ${
                    active ? 'text-amber-600 font-extrabold' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center py-1 relative transition-colors"
            >
              <div
                className={`w-9 h-7 rounded-xl flex items-center justify-center transition-all ${
                  active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
              </div>
              <span
                className={`text-[10px] tracking-tight leading-none mt-1 transition-colors ${
                  active
                    ? 'font-bold text-blue-600'
                    : 'font-medium text-slate-500'
                }`}
              >
                {item.label}
              </span>
              {active && (
                <motion.div
                  layoutId="activeBottomTab"
                  className="absolute -bottom-1 w-4 h-0.5 bg-blue-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
