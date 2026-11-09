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
  ChevronRight,
  Globe,
  ExternalLink,
  Phone
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
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
      label: 'Recruitment & Admissions',
      items: [
        { name: 'Dashboard', href: '/crm', icon: LayoutDashboard },
        { name: 'Staff Hiring', href: '/crm/candidates', icon: Users, badge: '95 Posts' },
        { name: 'Student Admissions', href: '/crm/education', icon: GraduationCap },
        { name: 'All Inquiries', href: '/crm/leads', icon: Briefcase },
      ]
    },
    {
      label: 'Operations & Reports',
      items: [
        { name: 'Strategic Reports', href: '/crm/reports', icon: BarChart3 },
        { name: 'Audit Trail', href: '/crm/audit', icon: FileText },
      ]
    },
    {
      label: 'Public Website',
      items: [
        { name: 'Website Home', href: '/', icon: Globe, isExternal: true },
        { name: 'Careers Walk-in Form', href: '/careers', icon: Briefcase, isExternal: true },
        { name: 'Courses & Programs', href: '/education', icon: GraduationCap, isExternal: true },
        { name: 'Contact Office', href: '/contact', icon: Phone, isExternal: true },
      ]
    },
    {
      label: 'Personal',
      items: [
        { name: 'My Settings', href: '/crm/settings', icon: Settings },
      ]
    },
    ...(isAdmin ? [{
      label: 'System Admin',
      items: [
        { name: 'Team Directory', href: '/crm/users', icon: Users },
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
                  {group.items.map((item: any) => {
                    const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/crm' && !item.isExternal);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        target={item.isExternal ? "_blank" : undefined}
                        rel={item.isExternal ? "noopener noreferrer" : undefined}
                        className={cn(
                          "group flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200",
                          isActive 
                            ? "bg-blue-50/80 text-blue-700 font-bold shadow-xs border border-blue-200/60" 
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        )}
                      >
                        <div className="flex items-center min-w-0 pr-2">
                          <item.icon className={cn(
                            "mr-3 h-[18px] w-[18px] shrink-0 transition-colors",
                            isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                          )} />
                          <span className="text-[13px] truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                          {item.badge && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs whitespace-nowrap tracking-tight">
                              {item.badge}
                            </span>
                          )}
                          {item.isExternal && (
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                          )}
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                        </div>
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
        {/* Top header with Live Website links and prominent Sign Out */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0 shadow-sm shadow-slate-200/20">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Quick Live Site link for easy access */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs group cursor-pointer"
              title="Open Rachakonda Solutions Public Website in new tab"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Website Home</span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
            </Link>

            <Link
              href="/careers"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all shadow-2xs group cursor-pointer"
              title="Open Public Walk-in Careers Form"
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
              <span>Walk-in Form (95 Posts)</span>
              <ExternalLink className="w-3 h-3 text-amber-600" />
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAdmin && (
              <div className="relative">
                <button 
                  onClick={() => setShowImpersonator(!showImpersonator)}
                  className={cn(
                    "hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all border",
                    isImpersonating 
                      ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200" 
                      : "text-slate-500 border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {isImpersonating ? `Viewing: ${impersonatedUser.name || impersonatedUser.email}` : "Impersonate"}
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

            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

            {/* User Profile Info */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-700 flex items-center justify-center text-white font-black text-xs shadow-xs">
                {profile?.name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex flex-col text-left hidden sm:flex">
                <span className="text-xs font-extrabold text-slate-900 leading-tight truncate max-w-[140px]">
                  {profile?.name || profile?.email?.split('@')[0]}
                </span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  {role === 'admin' ? 'Super Admin' : role}
                </span>
              </div>
            </div>

            {/* TOP-RIGHT PERMANENT SIGN OUT BUTTON (No scrolling down needed!) */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 text-xs font-black transition-all shadow-2xs cursor-pointer ml-1"
              title="Sign out of CRM session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] relative">
          {/* Breadcrumb / Top Bar */}
          <div className="px-6 py-4 sm:px-10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Rachakonda</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-blue-600">{pathname?.split('/').pop() || 'Dashboard'}</span>
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

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-5">
            {[
              { name: 'Dashboard', href: '/crm', icon: LayoutDashboard },
              { name: 'Enrollments', href: '/crm/enrollments', icon: GraduationCap },
              { name: 'Education', href: '/crm/education', icon: GraduationCap },
              { name: 'Reports', href: '/crm/reports', icon: BarChart3 },
              { name: 'Settings', href: '/crm/settings', icon: Settings },
            ].map((item) => {
              const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/crm');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center py-2.5 transition-colors",
                    isActive ? "text-blue-600" : "text-slate-400"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 mb-0.5", isActive ? "text-blue-600" : "text-slate-400")} />
                  <span className={cn("text-[9px] font-bold uppercase tracking-wider", isActive ? "text-blue-600" : "text-slate-400")}>
                    {item.name}
                  </span>
                  {isActive && <div className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
