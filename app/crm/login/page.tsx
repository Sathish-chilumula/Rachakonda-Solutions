'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, hasSupabaseConfig } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, ArrowRight, User, CheckCircle2, Globe, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function CRMLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('logged_out=true')) {
      setIsLoggedOut(true);
    }
  }, []);

  useEffect(() => {
    // Check if already logged in
    const checkSession = async () => {
      if (!hasSupabaseConfig) return;
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        setSession(currentSession);
        // We no longer auto-redirect immediately, 
        // instead we show a "Continue as" UI or let them logout
      }
    };
    checkSession();
  }, []);

  const handleContinue = async () => {
    setLoading(true);
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    router.push('/crm');
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSupabaseConfig) {
      setError('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.session) {
        // Fetch role and redirect
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
        
        if (profile?.role === 'admin') {
          router.push('/crm');
        } else {
          router.push('/crm');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Top Navbar linking back to main site */}
      <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-8 sm:right-8 flex items-center justify-between z-20">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">
            R
          </div>
          <span className="text-base font-extrabold text-slate-900 tracking-tight">
            Solutions<span className="text-blue-600">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/careers"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs transition-all"
          >
            <span>Walk-in Drive (95 Posts)</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-700 bg-white hover:bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>← Back to Website</span>
          </Link>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex justify-center mb-6">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Rachakonda <span className="text-amber-500">CRM</span>
          </h2>
        </Link>
        <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-slate-900">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign in to manage your leads and performance
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full sm:max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl sm:px-10 border border-slate-100"
        >
          {isLoggedOut && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center justify-between text-xs font-bold shadow-2xs">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Signed out successfully from CRM.
              </span>
              <Link href="/" className="text-blue-700 hover:underline">Go to Website →</Link>
            </div>
          )}

          {!hasSupabaseConfig && (
            <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex items-start">
              <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-amber-600" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Setup Required</p>
                <p>Supabase environment variables are missing. Please configure them to use the CRM.</p>
              </div>
            </div>
          )}

          {session ? (
            <div className="space-y-6 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                  <User className="w-8 h-8" />
                </div>
                <p className="text-sm font-medium text-slate-900">Signed in as</p>
                <p className="text-lg font-bold text-blue-600">{session.user.email}</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleContinue}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 transition-all"
                >
                  Continue to Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-bold text-slate-500 hover:text-red-600 transition-colors"
                >
                  Sign in with a different account
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all bg-slate-50 focus:bg-white outline-none"
                    placeholder="admin@rachakondasolutions.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all bg-slate-50 focus:bg-white outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading || !hasSupabaseConfig}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                  {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                </button>
              </div>
            </form>
          )}
        </motion.div>

        <div className="mt-6 flex flex-col items-center gap-2 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-700 bg-white/90 hover:bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Return to Rachakonda Solutions Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
