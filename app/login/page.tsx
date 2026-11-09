'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle, ArrowRight, User, Eye, EyeOff, ShieldCheck, ArrowLeft, Phone } from 'lucide-react';
import { supabase, hasSupabaseConfig } from '@/lib/supabase';

export default function OfficialLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      if (!hasSupabaseConfig) return;
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      if (currentSession) {
        setSession(currentSession);
      }
    };
    checkSession();
  }, []);

  const handleContinue = async () => {
    setLoading(true);
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
      setError('Database configuration error. Please contact technical support.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) throw authError;

      if (data.session) {
        router.push('/crm');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-white selection:bg-amber-400 selection:text-slate-950">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 px-3.5 py-2 rounded-xl backdrop-blur-md transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Website
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Brand Logo & Name */}
        <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white p-1.5 shadow-lg border border-white/20 group-hover:scale-105 transition-transform shrink-0">
            <Image
              src="/images/logo.webp"
              alt="Rachakonda Solutions Official Logo"
              fill
              className="object-contain p-0.5"
              unoptimized
            />
          </div>
          <div className="text-left">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
              Rachakonda <span className="text-amber-400">Solutions</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200">
              ESTD 2012 &bull; Official Staff Portal
            </span>
          </div>
        </Link>

        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-2 font-display">
          CRM &amp; Counselor Login
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-blue-200">
          Secure access for Administrators, Managers, and Admissions Counselors
        </p>
      </div>

      <div className="mt-6 sm:mx-auto w-full sm:max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-8 border border-white/20 text-slate-900"
        >
          {session ? (
            <div className="space-y-6 text-center">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 mb-3 shadow-inner">
                  <User className="w-7 h-7" />
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Already Authenticated As</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">{session.user.email}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active Session
                </span>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  onClick={handleContinue}
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all"
                >
                  Continue to Executive CRM
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
                <button
                  onClick={handleSignOut}
                  className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors py-1.5"
                >
                  Sign in with a different account
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Official Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all font-medium text-slate-900"
                    placeholder="admin@rachakondasolutions.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all font-medium text-slate-900"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-700 text-xs bg-red-50 p-3 rounded-xl border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/25 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In to CRM Portal
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500">
              Need technical assistance or account recovery?
              <br />
              Contact Head Office IT: <a href="tel:+919640333313" className="text-blue-600 font-bold hover:underline">+91 9640333313</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
