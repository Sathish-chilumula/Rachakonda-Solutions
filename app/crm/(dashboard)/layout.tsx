'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase, hasSupabaseConfig } from '@/lib/supabase';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  UploadCloud, 
  LogOut, 
  Menu,
  X,
  Briefcase,
  GraduationCap,
  Settings,
  ShieldCheck,
  Eye,
  FileText,
  BarChart3,
  Search,
  ChevronRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import { CRMProvider, useCRM } from './context';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!hasSupabaseConfig) {
      router.push('/crm/login');
      return;
    }

    const fetchSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        router.push('/crm/login');
        return;
      }

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        
        // If admin, fetch all users for impersonation list
        if (profileData.role === 'admin') {
          const { data: userData } = await supabase.from('profiles').select('*').order('name');
          if (userData) setAllUsers(userData);
        }
      } else {
        setProfile({ role: 'sales', email: currentSession.user.email });
      }

      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/crm/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/crm/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <CRMProvider initialProfile={profile}>
      <CRMContent allUsers={allUsers} handleLogout={handleLogout}>
        {children}
      </CRMContent>
    </CRMProvider>
  );
}

function CRMContent({ children, allUsers, handleLogout }: { children: React.ReactNode, allUsers: any[], handleLogout: () => void }) {
  const { profile, impersonatedUser, setImpersonatedUser, activeRole: role, isImpersonating } = useCRM();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showImpersonator, setShowImpersonator] = useState(false);
  const pathname = usePathname();

  const isAdmin = profile?.role === 'admin';
  const isManager = role === 'manager';
  const isStaff = (role === 'admin' || role === 'manager');

  const menuGroups = [
    {
      label: 'Main',
      items: [
        { name: 'Dashboard', href: '/crm', icon: LayoutDashboard },
      ]
    },
    {
      label: 'Finance Module',
      items: [
        { name: 'Finance Leads', href: '/crm/leads', icon: Briefcase },
        ...(isStaff ? [{ name: 'Upload Excel', href: '/crm/upload', icon: UploadCloud }] : []),
      ]
    },
    ...(isStaff ? [{
      label: 'Education Module',
      items: [
        { name: 'Edu Enrollments', href: '/crm/leads?tab=education', icon: GraduationCap },
      ]
    }] : []),
    ...(isAdmin ? [{
      label: 'Administrative',
      items: [
        { name: 'Sales Team', href: '/crm/users', icon: Users },
        { name: 'Audit Logs', href: '/crm/audit', icon: FileText },
        { name: 'Reports', href: '/crm/reports', icon: BarChart3 },
        { name: 'Settings', href: '/crm/settings', icon: Settings },
      ]
    }] : [])
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans selection:bg-blue-100">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          {/* Logo Header */}
          <div className="flex items-center justify-between h-20 px-8 border-b border-slate-100">
            <Link href="/crm" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold group-hover:rotate-6 transition-transform">
                R
              </div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                Solutions<span className="text-blue-600">.</span>
              </span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8 custom-scrollbar">
            {menuGroups.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  {group.label}
                </h3>
                <nav className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/crm');
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "group flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200",
                          isActive 
                            ? "bg-blue-50/50 text-blue-700 shadow-sm shadow-blue-100/50" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center">
                          <item.icon className={cn(
                            "mr-3.5 h-[18px] w-[18px] transition-colors",
                            isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                          )} />
                          <span className="text-[14px] font-semibold">{item.name}</span>
                        </div>
                        {isActive && <motion.div layoutId="active-nav" className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* User Profile Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/30">
            <div className="flex items-center p-3 mb-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-blue-100">
                {profile?.name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate leading-tight">{profile?.name || 'User'}</p>
                <div className="flex items-center mt-0.5">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse",
                    profile?.role === 'admin' ? "bg-amber-500" : profile?.role === 'manager' ? "bg-purple-500" : "bg-emerald-500"
                  )} />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{profile?.role}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 group"
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-6 sm:px-10 z-30 sticky top-0 shadow-sm shadow-slate-200/20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-slate-400">
              <Search className="w-4 h-4 translate-y-[1px]" />
              <input 
                type="text" 
                placeholder="Global search..." 
                className="bg-transparent border-none text-sm font-medium focus:ring-0 placeholder:text-slate-400 w-48 md:w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {isAdmin && (
              <div className="relative">
                <button 
                  onClick={() => setShowImpersonator(!showImpersonator)}
                  className={cn(
                    "hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border-2",
                    isImpersonating 
                      ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200" 
                      : "text-slate-500 border-slate-100 hover:border-slate-200 bg-white"
                  )}
                >
                  <Eye className="w-4 h-4" />
                  {isImpersonating ? `Viewing as ${impersonatedUser.name || impersonatedUser.email}` : "Impersonate"}
                </button>

                <AnimatePresence>
                  {showImpersonator && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[60]"
                    >
                       <div className="p-3 border-b border-slate-50 mb-2">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Agent Context</p>
                       </div>
                       <div className="max-h-64 overflow-y-auto custom-scrollbar">
                         <button 
                            onClick={() => { setImpersonatedUser(null); setShowImpersonator(false); }}
                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-900 flex items-center justify-between group"
                         >
                           Reset to My View
                           <ShieldCheck className="w-3.5 h-3.5 text-blue-500 opacity-0 group-hover:opacity-100" />
                         </button>
                         {allUsers.filter(u => u.id !== profile.id).map(u => (
                           <button 
                             key={u.id}
                             onClick={() => { setImpersonatedUser(u); setShowImpersonator(false); }}
                             className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 text-xs font-bold text-slate-600 hover:text-blue-700 transition-colors"
                           >
                             <div className="flex flex-col">
                               <span>{u.name || u.email}</span>
                               <span className="text-[9px] uppercase tracking-tighter opacity-50">{u.role}</span>
                             </div>
                           </button>
                         ))}
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-bold text-slate-900">{profile?.email}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {role} Access Level
                </span>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center p-0.5 shadow-sm">
                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                   <ShieldCheck className={cn(
                     "w-5 h-5",
                     isAdmin ? "text-amber-500" : "text-blue-500"
                   )} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] relative">
          {/* Breadcrumb / Top Bar */}
          <div className="px-6 py-4 sm:px-10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Rachakonda</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-blue-600">{pathname.split('/').pop() || 'Dashboard'}</span>
            </div>
            {isImpersonating && (
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-amber-500 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg shadow-amber-200"
              >
                IMPERSONATION ACTIVE
              </motion.div>
            )}
          </div>

          <div className="px-6 pb-24 sm:px-10 lg:pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
