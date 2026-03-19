'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  Shield, 
  Trash2, 
  Users, 
  UserCog,
  Search,
  Check,
  AlertCircle,
  Eye,
  ShieldAlert,
  KeyRound,
  X,
  Calendar
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
  
  // Create user form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('sales');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [search, setSearch] = useState('');

  // Edit/Password reset modal
  const [editTarget, setEditTarget] = useState<any>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

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
        body: JSON.stringify({ email, password, role, name, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccess(true);
      setEmail('');
      setPassword('');
      setName('');
      setPhone('');
      setRole('sales');
      fetchUsers();
      showToast('User created successfully', 'success');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (userId === myProfile?.id) return;

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
    
    if (!error) {
      fetchUsers();
      showToast('Role updated', 'success');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === myProfile?.id) return;
    if (!confirm('Are you sure? This will permanently delete the user account.')) return;

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
      showToast('User deleted', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleEditUser = async () => {
    if (!editTarget) return;

    setEditing(true);
    setEditError(null);

    try {
      const payload: any = { userId: editTarget.id };
      if (editEmail && editEmail !== editTarget.email) payload.email = editEmail;
      if (editName !== editTarget.name) payload.name = editName;
      if (editPhone !== editTarget.phone) payload.phone = editPhone;
      if (resetPassword) {
        if (resetPassword.length < 6) throw new Error('Password must be at least 6 characters');
        payload.newPassword = resetPassword;
      }

      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to update user');

      setEditSuccess(true);
      showToast(`User ${editName || editEmail} updated successfully`, 'success');
      fetchUsers();
      
      setTimeout(() => {
        setEditTarget(null);
        setEditSuccess(false);
      }, 2000);
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditing(false);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (u.name?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const getRoleColor = (r: string) => {
    switch(r) {
      case 'admin': return 'text-amber-600 bg-amber-50/30 border-amber-100';
      case 'manager': return 'text-purple-600 bg-purple-50/30 border-purple-100';
      default: return 'text-blue-600 bg-blue-50/30 border-blue-100';
    }
  };

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto py-6">
      {/* Global Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4`}>
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Edit User Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => { setEditTarget(null); setEditError(null); setEditSuccess(false); }} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 mx-4 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => { setEditTarget(null); setEditError(null); setEditSuccess(false); }}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <UserCog className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Edit Member</h3>
                <p className="text-xs text-slate-500">Update details or reset password</p>
              </div>
            </div>

            {editSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-bold flex items-center gap-2">
                <Check className="w-5 h-5" />
                Updated successfully!
              </div>
            ) : (
              <>
                {editError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {editError}
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email <span className="text-amber-500 lowercase normal-case">(Login ID)</span></label>
                    <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mobile Number</label>
                    <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Reset Password (Optional)</label>
                    <input type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="Leave blank to keep current" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all" />
                  </div>
                </div>

                <button
                  onClick={handleEditUser}
                  disabled={editing}
                  className="w-full h-12 bg-blue-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {editing ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
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
        {/* Create User Panel */}
        <div className="xl:col-span-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm sticky top-28">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Onboard Member</h2>
            </div>

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Check className="w-4 h-4" /> Account created successfully
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="block w-full pl-5 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" placeholder="First Last" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Mobile Number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="block w-full pl-5 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" placeholder="+91 90000 00000" />
              </div>
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
          </div>
        </div>

        {/* Users Table */}
        <div className="xl:col-span-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px]">
            <div className="px-8 py-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">System Ledger</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Permission mapping & real-time monitoring</p>
              </div>
              <div className="flex gap-2">
                <div className="px-4 py-2 bg-blue-50 rounded-xl text-[10px] font-black text-blue-600 uppercase tracking-widest">
                  {users.length} Users
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/10">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Principal</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clearance</th>
                    <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mobile</th>
                    <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Created</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Governance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    [1,2,3,4].map(i => <tr key={i} className="animate-pulse"><td colSpan={4} className="h-20 bg-slate-50/50" /></tr>)
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">No records found</td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
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
                          <div className="relative w-40">
                            <select 
                              value={user.role}
                              onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                              disabled={user.id === myProfile?.id}
                              className={cn(
                                "w-full bg-white border text-[10px] font-black uppercase tracking-widest rounded-xl py-2 pl-3 pr-8 appearance-none focus:ring-4 focus:ring-blue-500/5 transition-all outline-none cursor-pointer",
                                getRoleColor(user.role)
                              )}
                            >
                              <option value="sales">Sales Agent</option>
                              <option value="manager">Lead Manager</option>
                              <option value="admin">Super Admin</option>
                            </select>
                            <Shield className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-30 pointer-events-none" />
                          </div>
                        </td>
                        <td className="px-4 py-6">
                          <p className="text-xs font-bold text-slate-600">{user.phone || '—'}</p>
                        </td>
                        <td className="px-4 py-6">
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Calendar className="w-3.5 h-3.5" />
                            {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'N/A'}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setImpersonatedUser(user)}
                              disabled={user.id === myProfile?.id}
                              className="h-9 px-3 rounded-xl bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-0"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>

                            <button 
                              onClick={() => { 
                                setEditTarget(user); 
                                setEditEmail(user.email || ''); 
                                setEditName(user.name || ''); 
                                setEditPhone(user.phone || ''); 
                                setResetPassword(''); 
                                setEditError(null); 
                                setEditSuccess(false); 
                              }}
                              disabled={user.id === myProfile?.id}
                              className="h-9 px-3 rounded-xl bg-slate-50 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-0"
                            >
                              <UserCog className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.id === myProfile?.id}
                              className="p-2.5 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all disabled:opacity-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
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
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-relaxed max-w-md">Deletions are permanent. Password resets are immediate and the user will need the new password to log in.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
