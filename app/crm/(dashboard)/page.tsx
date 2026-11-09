'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Users,
  CheckCircle2,
  Clock,
  MessageCircle,
  PhoneCall,
  XCircle,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Briefcase,
  FileDown,
  MessageSquare,
  Phone,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCRM } from './context';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { parseCandidateLead, CandidateItem, exportCandidatesToCSV } from '@/lib/candidate-utils';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DashboardPage() {
  const { profile } = useCRM();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalCandidates: 0,
    selectedCandidates: 0,
    interviewCandidates: 0,
    pendingCandidates: 0,
    rejectedCandidates: 0,
    totalEnrollments: 0,
    totalCounseling: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      // 1. Fetch Candidate leads
      const { data: candidateData } = await supabase
        .from('leads')
        .select('*')
        .eq('source', 'careers_portal')
        .order('created_at', { ascending: false });

      const parsedCandidates = (candidateData || []).map(parseCandidateLead);
      setCandidates(parsedCandidates);

      const totalCandidates = parsedCandidates.length;
      const selectedCandidates = parsedCandidates.filter((c) => c.status === 'converted').length;
      const interviewCandidates = parsedCandidates.filter((c) => c.status === 'contacted').length;
      const pendingCandidates = parsedCandidates.filter((c) => c.status === 'new').length;
      const rejectedCandidates = parsedCandidates.filter((c) => c.status === 'rejected').length;

      // 2. Fetch Student enrollments
      const { data: enrollmentData, count: totalEnrollmentsCount } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(5);

      setStudents(enrollmentData || []);

      // 2.5 Fetch Counseling Inquiries
      const { count: counselingCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .neq('source', 'careers_portal');

      // 3. Fetch Audit Logs
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*, profiles(email, name)')
        .order('created_at', { ascending: false })
        .limit(8);

      if (logs) setActivities(logs);

      setMetrics({
        totalCandidates,
        selectedCandidates,
        interviewCandidates,
        pendingCandidates,
        rejectedCandidates,
        totalEnrollments: totalEnrollmentsCount || (enrollmentData?.length || 0),
        totalCounseling: counselingCount || 0,
      });
    } catch (e) {
      console.error('Error loading CRM dashboard metrics:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleQuickStatus = async (
    candidateId: string,
    newStatus: 'converted' | 'rejected' | 'contacted'
  ) => {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', candidateId);

    if (!error) {
      fetchDashboardData();
    }
  };

  const cards = [
    {
      label: 'Job Applicants',
      value: metrics.totalCandidates,
      sub: 'Walk-in Drive 95 Staff',
      icon: Users,
      color: 'blue',
      href: '/crm/candidates',
    },
    {
      label: 'Selected / Hired',
      value: `${metrics.selectedCandidates} / 95`,
      sub: `${Math.round((metrics.selectedCandidates / 95) * 100)}% of target staff`,
      icon: CheckCircle2,
      color: 'emerald',
      href: '/crm/candidates',
    },
    {
      label: 'Interviews Scheduled',
      value: metrics.interviewCandidates,
      sub: `${metrics.pendingCandidates} new pending`,
      icon: Clock,
      color: 'amber',
      href: '/crm/candidates',
    },
    {
      label: 'Student Enrollments',
      value: metrics.totalEnrollments,
      sub: 'Active admissions',
      icon: GraduationCap,
      color: 'purple',
      href: '/crm/education',
    },
    {
      label: 'Counseling & Inquiries',
      value: metrics.totalCounseling,
      sub: 'From contact & forms',
      icon: MessageCircle,
      color: 'teal',
      href: '/crm/leads?tab=counseling',
    },
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-3xl" />
          ))}
        </div>
        <div className="h-96 bg-white rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-10 py-6 max-w-[1600px] mx-auto pb-16">
      {/* ─── Header Section ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-200 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-black text-amber-800 uppercase tracking-widest">
              Live Operations &bull; Education &amp; 95 Staff Walk-in Drive
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display">
            Executive Operations Dashboard
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
            Rachakonda Solutions Pvt Ltd &bull; Gajwel Head Office &bull; {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchDashboardData();
            }}
            disabled={refreshing}
            className="h-11 px-4 rounded-xl bg-white border border-slate-200 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-50 shadow-xs transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Data
          </button>

          <button
            onClick={() => exportCandidatesToCSV(candidates, 'Rachakonda_Candidates_95_Staff')}
            className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            Export Candidates CSV
          </button>
        </div>
      </div>

      {/* ─── Metric Cards Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all relative overflow-hidden"
          >
            <div
              className={cn(
                'absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity',
                card.color === 'blue'
                  ? 'bg-blue-600'
                  : card.color === 'purple'
                  ? 'bg-purple-600'
                  : card.color === 'emerald'
                  ? 'bg-emerald-600'
                  : 'bg-amber-600'
              )}
            />

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div
                className={cn(
                  'p-3 rounded-2xl shadow-xs',
                  card.color === 'blue'
                    ? 'bg-blue-50 text-blue-600'
                    : card.color === 'purple'
                    ? 'bg-purple-50 text-purple-600'
                    : card.color === 'emerald'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600'
                )}
              >
                <card.icon className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-widest">
                {card.sub}
              </span>
            </div>

            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                {card.label}
              </p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</h3>
            </div>
          </Link>
        ))}
      </div>

      {/* ─── Main Operations Split View ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Latest Walk-in Job Applicants */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <h2 className="text-lg font-black text-slate-900 tracking-tight font-display">
                  Recent Walk-in Job Applicants (95 Posts)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Quick actions: Review, call, chat on WhatsApp, or mark as Selected / Rejected.
              </p>
            </div>
            <Link
              href="/crm/candidates"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View All ({candidates.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {candidates.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-400 font-bold uppercase tracking-wider">
                No job applications received yet.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-3.5">Candidate</th>
                    <th className="px-4 py-3.5">Applied Position(s)</th>
                    <th className="px-4 py-3.5">Contact</th>
                    <th className="px-4 py-3.5">Applied Date</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-center">Quick Select / Reject</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {candidates.slice(0, 6).map((c) => {
                    const isSelected = c.status === 'converted';
                    const isRejected = c.status === 'rejected';
                    const isInterview = c.status === 'contacted';

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">{c.name}</p>
                          <p className="text-[11px] text-slate-500">
                            S/o: {c.fatherName} &bull; <span className="font-mono text-blue-700">{c.refId}</span>
                          </p>
                        </td>

                        <td className="px-4 py-4 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {c.roles.slice(0, 2).map((r, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200"
                              >
                                {r}
                              </span>
                            ))}
                            {c.roles.length > 2 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                +{c.roles.length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs">{c.phone}</span>
                            <a
                              href={`https://wa.me/91${c.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Hello ${c.name}, Greetings from Rachakonda Solutions.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            >
                              WA
                            </a>
                          </div>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-xs font-bold text-slate-800 block">
                            {new Date(c.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {new Date(c.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`text-[11px] font-black px-2.5 py-1 rounded-full ${
                              isSelected
                                ? 'bg-emerald-100 text-emerald-800'
                                : isRejected
                                ? 'bg-red-100 text-red-800'
                                : isInterview
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {c.statusLabel}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                            <button
                              onClick={() => handleQuickStatus(c.id, 'converted')}
                              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                                isSelected ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-100'
                              }`}
                              title="Mark as Selected"
                            >
                              Select 🟢
                            </button>
                            <button
                              onClick={() => handleQuickStatus(c.id, 'contacted')}
                              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                                isInterview ? 'bg-amber-500 text-white' : 'text-amber-700 hover:bg-amber-100'
                              }`}
                              title="Schedule Interview"
                            >
                              Interview 🟡
                            </button>
                            <button
                              onClick={() => handleQuickStatus(c.id, 'rejected')}
                              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                                isRejected ? 'bg-red-600 text-white' : 'text-red-700 hover:bg-red-100'
                              }`}
                              title="Mark as Rejected"
                            >
                              Reject 🔴
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Sidebar: Student Admissions & Quick Links */}
        <div className="lg:col-span-4 space-y-6">
          {/* 95 Posts Goal Progress */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Hiring Goal Progress
            </div>
            <h3 className="text-xl font-black">95 Staff Target</h3>
            <p className="text-xs text-blue-200 mt-1">
              {metrics.selectedCandidates} candidates selected out of 95 staff needed.
            </p>

            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span>{metrics.selectedCandidates} Hired</span>
                <span>{95 - metrics.selectedCandidates} Remaining</span>
              </div>
              <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(2, (metrics.selectedCandidates / 95) * 100))}%`,
                  }}
                />
              </div>
            </div>

            <Link
              href="/crm/candidates"
              className="mt-5 flex items-center justify-center w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black uppercase tracking-wider transition-all"
            >
              Open Recruitment Console &rarr;
            </Link>
          </div>

          {/* Recent Student Enrollments */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Recent Students
                </h3>
              </div>
              <Link
                href="/crm/education"
                className="text-xs font-bold text-purple-600 hover:text-purple-800"
              >
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {students.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4 font-bold">
                  No student enrollments yet.
                </p>
              ) : (
                students.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{s.name}</p>
                      <p className="text-[11px] text-slate-500">{s.course_name}</p>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 uppercase">
                      {s.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
