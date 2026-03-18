'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  Shield, 
  Trash2, 
  ShieldCheck, 
  Users, 
  UserCog,
  Search,
  Check,
  AlertCircle,
  Eye,
  ShieldAlert
} from 'lucide-react';
import { format } from 'date-fns';
import { useCRM } from '../context';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function UsersPage() {
  const { profile: myProfile, setImpersonatedUser } = useCRM();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('sales');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('role', { ascending: true })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccess(true);
      setEmail('');
      setPassword('');
      setRole('sales');
      fetchUsers();
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (userId === myProfile?.id) return; // Self-protection

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
    
    if (!error) {
       fetchUsers();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === myProfile?.id) return;
    if (!confirm('Are you absolutely sure? This will permanently delete the user account.')) return;

    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Deletion failed');
      }

      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (u.name?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto py-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <UserCog className="w-8 h-8 text-blue-600" />
            Active Directory
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
            Governance & Access Control for <span className="text-slate-900">{users.length}</span> members
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input 
            type="text" 
            placeholder="Search directory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-500/5 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Create User Section */}
        <div className="xl:col-span-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm sticky top-28"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Onboard Member</h2>
            </div>

            <AnimatePresence mode="wait">
              {success && (
                <motion.div 
                   className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Account created successfully
                </motion.div>
              )}

              {error && (
                <motion.div 
                   className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Member Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                    placeholder="email@rachakonda.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Access Token (Pass)</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Clearance Level</label>
                <div className="grid grid-cols-2 gap-3">
                  {['sales', 'manager', 'admin'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        "py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                        role === r 
                          ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full h-14 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 mt-4"
              >
                {creating ? 'Processing...' : 'Provision Member'}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Users List Table Section */}
        <div className="xl:col-span-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px]">
            <div className="px-8 py-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">System Ledger</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Permission mapping & real-time monitoring</p>
              </div>
              <div className="flex gap-2">
                <div className="px-4 py-2 bg-blue-50 rounded-xl text-[10px] font-black text-blue-600 uppercase tracking-widest">
                  Secure
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/10">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Principal</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clearance</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Governance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    [1,2,3,4].map(i => <tr key={i} className="animate-pulse px-8 py-10"><td colSpan={3} className="h-20 bg-slate-50/50" /></tr>)
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">No records found</td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, i) => (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={user.id} 
                        className="group hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-white text-sm group-hover:bg-blue-600 transition-all">
                              {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 leading-tight">{user.name || 'Anonymous Principal'}</p>
                              <p className="text-xs font-semibold text-slate-400 lowercase truncate max-w-[180px]">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="relative w-40 group/role">
                            <select 
                              value={user.role}
                              onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                              disabled={user.id === myProfile?.id}
                              className={cn(
                                "w-full bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest rounded-xl py-2 pl-3 pr-8 appearance-none focus:ring-4 focus:ring-blue-500/5 transition-all outline-none cursor-pointer",
                                user.role === 'admin' ? "text-amber-600 bg-amber-50/30 border-amber-100" : 
                                user.role === 'manager' ? "text-purple-600 bg-purple-50/30 border-purple-100" :
                                "text-blue-600 bg-blue-50/30 border-blue-100"
                              )}
                            >
                              <option value="sales">Sales Agent</option>
                              <option value="manager">Lead Manager</option>
                              <option value="admin">Super Admin</option>
                            </select>
                            <Shield className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30 pointer-events-none group-hover/role:opacity-60 transition-opacity" />
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center justify-end gap-3">
                             <button 
                               onClick={() => setImpersonatedUser(user)}
                               disabled={user.id === myProfile?.id}
                               className="h-10 px-4 rounded-xl bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 group/imp disabled:opacity-0"
                             >
                               <Eye className="w-3.5 h-3.5" />
                               View As
                             </button>
                             
                             <button 
                               onClick={() => handleDeleteUser(user.id)}
                               disabled={user.id === myProfile?.id}
                               className="p-3 rounded-xl bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-8 bg-slate-50/50 border-t border-slate-50 mt-auto">
               <div className="flex items-start gap-4">
                 <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                 <div>
                   <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Protocol Warning</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-relaxed max-w-md">Deletions are permanent. Impersonation sessions bypass local RLS for auditing purposes. All administrative actions are recorded in the System Ledger.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
