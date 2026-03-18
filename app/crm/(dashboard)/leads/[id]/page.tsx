'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, User, Phone, MapPin, Briefcase, DollarSign, Calendar, Clock, PhoneCall } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function LeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');

  const [showToast, setShowToast] = useState(false);

  const fetchLead = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
      router.push('/crm/leads');
      return;
    }

    setLead(data);
    setStatus(data.status);
    setRemarks(data.remarks || '');
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLead();
  }, [fetchLead]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('leads')
      .update({ 
        status, 
        remarks,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    setSaving(false);
    if (!error) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      fetchLead();
    } else {
      alert('Failed to update lead');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative pb-20 md:pb-0">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center animate-in fade-in slide-in-from-top-4">
          <Save className="w-5 h-5 mr-2" />
          <span className="font-medium">Lead saved successfully!</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-0">
        <div className="flex items-center space-x-4">
          <Link href="/crm/leads" className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lead Details</h1>
            <p className="text-sm text-slate-500 mt-1">Manage information for {lead.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <PhoneCall className="w-4 h-4 mr-2" />
              Call Now
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="hidden md:inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-70"
          >
            {saving ? 'Saving...' : 'Save Changes'}
            <Save className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-0">
        {/* Left Column: Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-500" />
              Customer Information
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Full Name</p>
                <p className="text-slate-900 font-medium">{lead.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Phone Number</p>
                <div className="flex items-center text-slate-900 font-medium">
                  <Phone className="w-4 h-4 mr-2 text-slate-400" />
                  {lead.phone || 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">City</p>
                <div className="flex items-center text-slate-900 font-medium">
                  <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                  {lead.city || 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Loan Type</p>
                <div className="flex items-center text-slate-900 font-medium">
                  <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                  {lead.loan_type || 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Requested Amount</p>
                <div className="flex items-center text-slate-900 font-medium">
                  <DollarSign className="w-4 h-4 mr-1 text-slate-400" />
                  {lead.amount ? lead.amount.toLocaleString() : 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Monthly Income</p>
                <div className="flex items-center text-slate-900 font-medium">
                  <DollarSign className="w-4 h-4 mr-1 text-slate-400" />
                  {lead.income ? lead.income.toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Remarks & Notes</h2>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none bg-slate-50 focus:bg-white"
              placeholder="Add notes about this lead..."
            />
          </div>
        </div>

        {/* Right Column: Status & Meta */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Status</h2>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-50 focus:bg-white appearance-none"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" /> Created At
                </p>
                <p className="text-sm text-slate-900">{format(new Date(lead.created_at), 'PPpp')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1 flex items-center">
                  <Clock className="w-4 h-4 mr-2" /> Last Updated
                </p>
                <p className="text-sm text-slate-900">{format(new Date(lead.updated_at), 'PPpp')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2" /> Source
                </p>
                <p className="text-sm text-slate-900 capitalize">{lead.source}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Save Button */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-30">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full inline-flex justify-center items-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-70"
        >
          {saving ? 'Saving...' : 'Save Changes'}
          <Save className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}
