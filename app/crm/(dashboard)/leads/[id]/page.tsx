'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, User, Phone, MapPin, Briefcase, DollarSign, Calendar, Clock, PhoneCall, AlertCircle, StickyNote, Tag, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useCRM } from '../../context';

const WA_TEMPLATES = [
  { id: 'followup', label: 'Loan Follow-up', message: (name: string, loan: string) => `Hi ${name}, regarding your ${loan?.replace(/-/g, ' ')} enquiry at Rachakonda Solutions — our team is ready to assist you.` },
  { id: 'documents', label: 'Document Request', message: (name: string, loan: string) => `Hi ${name}, to process your ${loan?.replace(/-/g, ' ')} application, we need: Aadhaar, PAN, Income Proof, Bank Statements (6 months).` },
  { id: 'approval', label: 'Approval Message', message: (name: string, loan: string) => `Congratulations ${name}! Your ${loan?.replace(/-/g, ' ')} has been approved by Rachakonda Solutions!` },
  { id: 'rejection', label: 'Rejection Notice', message: (name: string, loan: string) => `Hi ${name}, we're unable to proceed with your ${loan?.replace(/-/g, ' ')} at this time. Please contact us for alternatives.` },
];

export default function LeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [waMenuOpen, setWaMenuOpen] = useState(false);
  
  const { profile, activeRole: userRole } = useCRM();
  const [salesUsers, setSalesUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [remarks, setRemarks] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const openWhatsApp = (templateId: string) => {
    if (!lead) return;
    const template = WA_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const msg = encodeURIComponent(template.message(lead.name, lead.loan_type));
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, '_blank');
    setWaMenuOpen(false);
  };

  const fetchLead = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*, profiles(email, name)')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error(error);
      router.push('/crm/leads');
      return;
    }

    // Fetch users for assignment if admin/manager
    if (userRole === 'admin' || userRole === 'manager') {
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, email, name, role')
        .in('role', ['sales', 'manager']);
      if (usersData) setSalesUsers(usersData);
    }

    // Fetch Activity Timeline
    const { data: logsData } = await supabase
      .from('audit_logs')
      .select('*, profiles(name, email)')
      .eq('entity_id', id)
      .order('created_at', { ascending: false });
    if (logsData) setAuditLogs(logsData);

    setLead(data);
    setStatus(data.status);
    setPriority(data.priority || 'medium');
    setRemarks(data.remarks || '');
    setInternalNotes(data.internal_notes || '');
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('leads')
      .update({ 
        status, 
        priority,
        remarks,
        internal_notes: internalNotes,
      })
      .eq('id', id);

    setSaving(false);
    if (!error) {
      setToastMsg('Lead saved successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      fetchLead();
    } else {
      setToastMsg('Failed to update lead');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
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

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'new': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'contacted': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'interested': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'converted': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'hot': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cold': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative pb-20 md:pb-0">
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 ${toastMsg.includes('Failed') ? 'bg-red-500' : 'bg-green-500'} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4`}>
          <Save className="w-5 h-5" />
          <span className="font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-0">
        <div className="flex items-center space-x-4">
          <Link href="/crm/leads" className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-500 shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lead Details</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage information for <span className="font-semibold text-slate-700">{lead.name}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lead.phone && (
            <>
              <a
                href={`tel:${lead.phone}`}
                className="inline-flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                <PhoneCall className="w-4 h-4 mr-2" />
                Call Now
              </a>
              <div className="relative">
                <button
                  onClick={() => setWaMenuOpen(!waMenuOpen)}
                  className="inline-flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </button>
                {waMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setWaMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 w-56 py-2">
                      <p className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Send Template</p>
                      {WA_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.id}
                          onClick={() => openWhatsApp(tpl.id)}
                          className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="hidden md:inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-70 shadow-sm"
          >
            {saving ? 'Saving...' : 'Save Changes'}
            <Save className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-0">
        {/* Left Column: Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-500" />
              Customer Information
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                <p className="text-slate-900 font-medium text-lg">{lead.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Phone Number</p>
                <div className="flex items-center text-slate-900 font-medium">
                  <Phone className="w-4 h-4 mr-2 text-slate-400" />
                  {lead.phone || 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">City</p>
                <div className="flex items-center text-slate-900 font-medium">
                  <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                  {lead.city || 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Loan Type</p>
                <div className="flex items-center text-slate-900 font-medium capitalize">
                  <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                  {lead.loan_type?.replace(/-/g, ' ') || 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Requested Amount</p>
                <div className="flex items-center text-slate-900 font-medium">
                  <DollarSign className="w-4 h-4 mr-1 text-slate-400" />
                  ₹{lead.amount ? Number(lead.amount).toLocaleString('en-IN') : 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Monthly Income</p>
                <div className="flex items-center text-slate-900 font-medium">
                  <DollarSign className="w-4 h-4 mr-1 text-slate-400" />
                  ₹{lead.income ? Number(lead.income).toLocaleString('en-IN') : 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Employment Type</p>
                <p className="text-slate-900 font-medium capitalize">{lead.employment_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Assigned To</p>
                <p className="text-slate-900 font-medium">{lead.profiles?.name || lead.profiles?.email || 'Unassigned'}</p>
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
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none bg-slate-50 focus:bg-white text-sm"
              placeholder="Add notes about this lead — follow-up status, customer preferences, call summaries..."
            />
          </div>

          {/* Internal Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-purple-500" />
              Internal Notes (Admin Only)
            </h2>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none bg-purple-50/30 focus:bg-white text-sm"
              placeholder="Private internal notes — credit risk, verification status, etc."
            />
          </div>
        </div>

        {/* Right Column: Status & Meta */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Pipeline Status</h2>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none text-sm ${getStatusColor(status)}`}
            >
              <option value="new">🔵 New</option>
              <option value="contacted">🟡 Contacted</option>
              <option value="interested">🟣 Interested</option>
              <option value="converted">🟢 Converted</option>
              <option value="rejected">🔴 Rejected</option>
            </select>
          </div>

          {/* Priority */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <Tag className="w-5 h-5 mr-2 text-amber-500" />
              Priority
            </h2>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl font-semibold focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none text-sm ${getPriorityColor(priority)}`}
            >
              <option value="hot">🔥 Hot</option>
              <option value="medium">⚡ Medium</option>
              <option value="cold">❄️ Cold</option>
            </select>
          </div>

	          {/* Assignment Panel */}
	          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
	            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
	              <User className="w-5 h-5 mr-2 text-blue-500" />
	              Assignment
	            </h2>
	            {userRole === 'admin' || userRole === 'manager' ? (
	              <div className="space-y-4">
	                <select
	                  value={lead.assigned_to || ''}
	                  onChange={async (e) => {
	                    const newUserId = e.target.value;
	                    const { error } = await supabase
	                      .from('leads')
	                      .update({ assigned_to: newUserId || null, assigned_at: newUserId ? new Date().toISOString() : null })
	                      .eq('id', lead.id);
	                    if (!error) {
	                      await supabase.from('audit_logs').insert({
	                        user_id: profile?.id,
	                        action: `Reassigned lead to ${salesUsers.find(u => u.id === newUserId)?.name || 'unassigned'}`,
	                        entity_type: 'lead',
	                        entity_id: lead.id,
	                        details: { assigned_to: newUserId }
	                      });
	                      fetchLead();
	                    }
	                  }}
	                  className="w-full px-4 py-3 border rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none text-sm bg-slate-50 text-slate-700"
	                >
	                  <option value="">Unassigned</option>
	                  <optgroup label="Managers">
	                    {salesUsers.filter(u => u.role === 'manager').map(u => 
	                      <option key={u.id} value={u.id}>{u.name || u.email}</option>
	                    )}
	                  </optgroup>
	                  <optgroup label="Sales Agents">
	                    {salesUsers.filter(u => u.role === 'sales').map(u => 
	                      <option key={u.id} value={u.id}>{u.name || u.email}</option>
	                    )}
	                  </optgroup>
	                </select>
	              </div>
	            ) : (
	              <div>
	                {!lead.assigned_to ? (
	                  <button
	                    onClick={async () => {
	                      const { error } = await supabase.from('leads').update({ assigned_to: profile?.id, assigned_at: new Date().toISOString() }).eq('id', lead.id);
	                      if (!error) {
	                        await supabase.from('audit_logs').insert({
	                          user_id: profile?.id, action: `Self-assigned lead`, entity_type: 'lead', entity_id: lead.id
	                        });
	                        fetchLead();
	                      }
	                    }}
	                    className="w-full py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl border border-blue-200 hover:bg-blue-600 hover:text-white transition-all text-sm"
	                  >
	                    Claim this Lead
	                  </button>
	                ) : (
	                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
	                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 shadow-inner">
	                      {lead.profiles?.name?.charAt(0) || lead.profiles?.email?.charAt(0) || 'U'}
	                    </div>
	                    <div>
	                      <p className="text-sm font-bold text-slate-900">{lead.profiles?.name || lead.profiles?.email}</p>
	                      <p className="text-xs text-slate-500">Currently Assigned</p>
	                    </div>
	                  </div>
	                )}
	              </div>
	            )}
	          </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Tracking</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" /> Created
                  </p>
                  <p className="text-sm text-slate-900 font-medium">{format(new Date(lead.created_at), 'PPpp')}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5" /> Last Updated
                  </p>
                  <p className="text-sm text-slate-900 font-medium">{format(new Date(lead.updated_at), 'PPpp')}</p>
                </div>
                {lead.assigned_at && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
                      <User className="w-3.5 h-3.5 mr-1.5" /> Assigned On
                    </p>
                    <p className="text-sm text-slate-900 font-medium">{format(new Date(lead.assigned_at), 'PPpp')}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
                    <Briefcase className="w-3.5 h-3.5 mr-1.5" /> Source
                  </p>
                  <p className="text-sm text-slate-900 font-medium capitalize">{lead.source?.replace(/_/g, ' ')}</p>
                </div>
              </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-h-96 overflow-y-auto custom-scrollbar">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Activity Timeline</h2>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center">No recent activity.</p>
                ) : auditLogs.map((log: any, idx: number) => (
                  <div key={log.id} className="relative flex items-start gap-4 z-10">
                    <div className="w-4 h-4 mt-1 rounded-full bg-blue-600 border-4 border-white shadow-sm shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{log.action}</p>
                      <p className="text-xs font-medium text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-300" />
                        {log.profiles?.name || log.profiles?.email || 'System'}
                      </p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-1">
                        {format(new Date(log.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
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
