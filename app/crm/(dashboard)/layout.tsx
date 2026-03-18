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
  Briefcase
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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

      setSession(currentSession);

      // Fetch user profile to get role
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      } else {
        // Fallback if profile doesn't exist yet
        setProfile({ role: 'sales', email: currentSession.user.email });
      }

      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/crm/login');
      } else {
        setSession(session);
      }
    });

    // Request Notification Permission
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Supabase Realtime for Notifications
  useEffect(() => {
    if (!profile || !hasSupabaseConfig) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            const isAdmin = profile.role === 'admin';
            const isSales = profile.role === 'sales';

            if (payload.eventType === 'INSERT' && isAdmin) {
              new Notification('New Lead Created', {
                body: `${payload.new.name} just submitted a new lead.`,
              });
            }

            if (payload.eventType === 'UPDATE' && isSales && payload.new.assigned_to === profile.id && payload.old.assigned_to !== profile.id) {
              new Notification('New Lead Assigned', {
                body: `You have been assigned a new lead: ${payload.new.name}.`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/crm/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  const isAdmin = profile?.role === 'admin';

  const navigation = [
    { name: 'Dashboard', href: '/crm', icon: LayoutDashboard },
    { name: 'Leads', href: '/crm/leads', icon: Briefcase },
    ...(isAdmin ? [
      { name: 'Upload Leads', href: '/crm/upload', icon: UploadCloud },
      { name: 'Users', href: '/crm/users', icon: Users },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
            <Link href="/crm" className="text-xl font-bold text-slate-900 tracking-tight">
              CRM <span className="text-amber-500">Portal</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4">
            <div className="mb-8 px-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/crm');
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors",
                        isActive 
                          ? "bg-blue-50 text-blue-900" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <item.icon className={cn(
                        "mr-3 h-5 w-5 shrink-0",
                        isActive ? "text-blue-600" : "text-slate-400"
                      )} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center px-3 py-3 mb-2 rounded-xl bg-slate-50">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-bold shrink-0">
                {profile?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-slate-900 truncate">{profile?.email}</p>
                <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 sticky top-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-700 focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                {profile?.role} Account
              </span>
            </div>
          </div>
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 pt-4 pb-24 lg:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 pb-safe">
          <div className="flex justify-around items-center h-16 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/crm');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-full space-y-1",
                    isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "fill-blue-100" : "")} />
                  <span className="text-[10px] font-medium">{item.name}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 hover:text-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[10px] font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
