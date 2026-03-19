'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, User, Phone, Mail, BookOpen, Calendar, Clock, PhoneCall, StickyNote, Tag } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function EnrollmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchEnrollment = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error(error);
      router.push('/crm/education');
      return;
    }

    setEnrollment(data);
    setStatus(data.status);
    setRemarks(data.remarks || '');
    setInternalNotes(data.internal_notes || '');
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchEnrollment();
  }, [fetchEnrollment]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('enrollments')
      .update({ 
        status, 
        remarks,
        internal_notes: internalNotes,
      })
      .eq('id', id);

    setSaving(false);
    if (!error) {
      setToastMsg('Enrollment saved successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      fetchEnrollment();
    } else {
      setToastMsg('Failed to update enrollment');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (!enrollment) return null;

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'new': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'contacted': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'enrolled': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative pb-20 md:pb-0">
      {/* Toast */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 ${toastMsg.includes('Failed') ? 'bg-red-500' : 'bg-green-500'} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2`}>
          <Save className="w-5 h-5" />
          <span className="font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-0">
        <div className="flex items-center space-x-4">
          <Link href="/crm/education" className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-500 shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enrollment Details</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage enrollment for <span className="font-semibold text-slate-700">{enrollment.name}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {enrollment.phone && (
            <a
              href={`tel:${enrollment.phone}`}
              className="inline-flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <PhoneCall className="w-4 h-4 mr-2" />
              Call Now
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="hidden md:inline-flex items-center px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-70 shadow-sm"
          >
            {saving ? 'Saving...' : 'Save Changes'}
            <Save className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-0">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Student Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-500" />
              Student Information
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                <p className="text-slate-900 font-medium text-lg">{enrollment.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone Number</p>
                <div className="flex items-center text-slate-900 font-medium">
                  <Phone className="w-4 h-4 mr-2 text-slate-400" />
                  {enrollment.phone || 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                <div className="flex items-center text-slate-900 font-medium">
                  <Mail className="w-4 h-4 mr-2 text-slate-400" />
                  {enrollment.email || 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Course Name</p>
                <div className="flex items-center text-slate-900 font-medium">
                  <BookOpen className="w-4 h-4 mr-2 text-slate-400" />
                  {enrollment.course_name}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</p>
                <div className="flex items-center text-slate-900 font-medium capitalize">
                  <Tag className="w-4 h-4 mr-2 text-slate-400" />
                  {enrollment.category || 'General'}
                </div>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <StickyNote className="w-5 h-5 mr-2 text-amber-500" />
              Remarks & Follow-up Notes
            </h2>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none bg-slate-50 focus:bg-white text-sm"
              placeholder="Add notes about this enrollment — counselor feedback, demo class attendance, payment status..."
            />
          </div>

          {/* Internal Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-purple-500" />
              Internal Notes (Admin Only)
            </h2>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none bg-purple-50/30 focus:bg-white text-sm"
              placeholder="Private internal notes..."
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Enrollment Status</h2>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl font-semibold focus:ring-2 focus:ring-purple-500 outline-none transition-all appearance-none text-sm ${getStatusColor(status)}`}
            >
              <option value="new">🔵 New</option>
              <option value="contacted">🟡 Contacted</option>
              <option value="enrolled">🟢 Enrolled</option>
              <option value="rejected">🔴 Rejected</option>
            </select>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Tracking</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" /> Submitted
                </p>
                <p className="text-sm text-slate-900 font-medium">{format(new Date(enrollment.created_at), 'PPpp')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1.5" /> Last Updated
                </p>
                <p className="text-sm text-slate-900 font-medium">{format(new Date(enrollment.updated_at), 'PPpp')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Source
                </p>
                <p className="text-sm text-slate-900 font-medium capitalize">{enrollment.source?.replace(/_/g, ' ')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Save */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-30">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full inline-flex justify-center items-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-70"
        >
          {saving ? 'Saving...' : 'Save Changes'}
          <Save className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}
