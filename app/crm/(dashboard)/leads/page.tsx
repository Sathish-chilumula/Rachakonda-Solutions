'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'motion/react';
import { Search, Filter, MoreVertical, Edit, UserPlus, FileDown } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [salesUsers, setSalesUsers] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [bulkAssignUser, setBulkAssignUser] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const userRole = profile?.role || 'sales';
    setRole(userRole);

    let query = supabase.from('leads').select('*, profiles(email)');

    if (userRole === 'sales') {
      query = query.eq('assigned_to', session.user.id);
    }

    const { data: leadsData, error } = await query.order('created_at', { ascending: false });

    if (leadsData && !error) {
      setLeads(leadsData);
    }

    if (userRole === 'admin') {
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('role', 'sales');
      if (usersData) setSalesUsers(usersData);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleAssign = async (leadId: string, userId: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ assigned_to: userId || null })
      .eq('id', leadId);
    
    if (!error) {
      fetchData();
    } else {
      alert('Failed to assign lead');
    }
  };

  const handleBulkAssign = async () => {
    if (selectedLeads.length === 0 || !bulkAssignUser) return;
    
    const { error } = await supabase
      .from('leads')
      .update({ assigned_to: bulkAssignUser || null })
      .in('id', selectedLeads);
      
    if (!error) {
      setSelectedLeads([]);
      setBulkAssignUser('');
      fetchData();
    } else {
      alert('Failed to assign leads');
    }
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(lId => lId !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  const exportToCSV = () => {
    if (filteredLeads.length === 0) return;
    
    const headers = ['Name', 'Phone', 'City', 'Loan Type', 'Amount', 'Income', 'Status', 'Source', 'Created At'];
    
    const csvData = filteredLeads.map(lead => [
      lead.name || '',
      lead.phone || '',
      lead.city || '',
      lead.loan_type || '',
      lead.amount || '',
      lead.income || '',
      lead.status || '',
      lead.source || '',
      new Date(lead.created_at).toLocaleString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSearch = 
      (lead.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (lead.phone || '').includes(search) ||
      (lead.city?.toLowerCase() || '').includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-amber-100 text-amber-800';
      case 'converted': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leads</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track your leads.</p>
        </div>
        <div className="flex items-center gap-3">
          {role === 'admin' && selectedLeads.length > 0 && (
            <div className="flex items-center gap-2 mr-4 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
              <span className="text-sm font-medium text-blue-800">{selectedLeads.length} selected</span>
              <select
                value={bulkAssignUser}
                onChange={(e) => setBulkAssignUser(e.target.value)}
                className="block w-40 pl-3 pr-8 py-1 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
              >
                <option value="">Assign to...</option>
                {salesUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.email}</option>
                ))}
              </select>
              <button 
                onClick={handleBulkAssign}
                disabled={!bulkAssignUser}
                className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          )}
          <button 
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white sm:rounded-2xl shadow-sm border-y sm:border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 sticky top-0 z-10">
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex items-center w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-9 pr-8 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all outline-none appearance-none bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="converted">Converted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Card Layout */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-center text-slate-500">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 bg-slate-200 rounded w-24 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-32"></div>
              </div>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No leads found matching your criteria.
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div key={lead.id} className="p-4 bg-white hover:bg-slate-50 transition-colors">
                <Link href={`/crm/leads/${lead.id}`} className="block">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-bold shrink-0">
                        {lead.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-bold text-slate-900">{lead.name}</p>
                        <p className="text-xs text-slate-500">{lead.phone}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 inline-flex text-[10px] leading-5 font-semibold rounded-full capitalize ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Type</p>
                      <p className="text-xs font-medium text-slate-700">{lead.loan_type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">City</p>
                      <p className="text-xs font-medium text-slate-700">{lead.city || 'N/A'}</p>
                    </div>
                  </div>
                </Link>
                {role === 'admin' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-2"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => toggleSelectLead(lead.id)}
                      />
                      <span className="text-xs text-slate-500">Select</span>
                    </div>
                    <select
                      value={lead.assigned_to || ''}
                      onChange={(e) => handleAssign(lead.id, e.target.value)}
                      className="block w-32 pl-2 pr-6 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                    >
                      <option value="">Unassigned</option>
                      {salesUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.email.split('@')[0]}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {role === 'admin' && (
                  <th scope="col" className="px-6 py-3 text-left w-12">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                )}
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name / Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                {role === 'admin' && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned To</th>
                )}
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={role === 'admin' ? 7 : 6} className="px-6 py-12 text-center text-slate-500">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-4 bg-slate-200 rounded w-24 mb-4"></div>
                      <div className="h-4 bg-slate-200 rounded w-32"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={role === 'admin' ? 7 : 6} className="px-6 py-12 text-center text-slate-500">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={lead.id} 
                    className={`hover:bg-slate-50 transition-colors ${selectedLeads.includes(lead.id) ? 'bg-blue-50/50' : ''}`}
                  >
                    {role === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => toggleSelectLead(lead.id)}
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-bold shrink-0">
                          {lead.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{lead.name}</div>
                          <div className="text-sm text-slate-500">{lead.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{lead.loan_type || 'N/A'}</div>
                      <div className="text-sm text-slate-500">{lead.city || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    {role === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <select
                          value={lead.assigned_to || ''}
                          onChange={(e) => handleAssign(lead.id, e.target.value)}
                          className="block w-full pl-3 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                        >
                          <option value="">Unassigned</option>
                          {salesUsers.map(u => (
                            <option key={u.id} value={u.id}>{u.email}</option>
                          ))}
                        </select>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {format(new Date(lead.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/crm/leads/${lead.id}`} className="text-blue-600 hover:text-blue-900 inline-flex items-center">
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
