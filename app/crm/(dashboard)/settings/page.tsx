'use client';

import { Settings, Shield, User, Bell, Globe, Save, Lock, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useCRM } from '../context';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { profile } = useCRM();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile state
  const [name, setName] = useState(profile?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    const { error } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', profile?.id);

    setSavingProfile(false);
    if (!error) {
      showToast('Profile updated successfully', 'success');
    } else {
      showToast('Failed to update profile', 'error');
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword) {
      showToast('Please enter your current password', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setChangingPassword(true);

    // Verify old password by attempting a re-login
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile?.email || '',
      password: oldPassword
    });

    if (signInError) {
      setChangingPassword(false);
      showToast('Incorrect current password', 'error');
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);

    if (!updateError) {
      showToast('Password changed successfully', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      showToast(updateError.message || 'Failed to change password', 'error');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: User },
    { id: 'security', name: 'Security & Access', icon: Shield },
    { id: 'notifications', name: 'System Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2`}>
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-slate-600" />
          Settings
        </h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
          Configure your workspace and account preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                  : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-400' : 'text-slate-300'}`} />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-12">
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">System Identity</h3>
                <p className="text-sm text-slate-500 mt-1">Manage your administrative profile</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Official Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/5 outline-none transition-all focus:bg-white"
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Primary Email</label>
                  <input 
                    type="email" 
                    defaultValue={profile?.email || ''}
                    disabled
                    className="w-full px-6 py-4 bg-slate-100 border border-slate-100 rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">Timezone & Localization</h4>
                  <p className="text-xs font-semibold text-blue-700 mt-1 opacity-70">Detecting: Asia/Kolkata (IST)</p>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="h-14 px-10 rounded-2xl bg-slate-900 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-105 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Security & Password</h3>
                <p className="text-sm text-slate-500 mt-1">Update your credentials</p>
              </div>

              {/* Current Access Level */}
              <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-blue-500">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Current Access Level</p>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">{profile?.role} Clearance</p>
                  </div>
                </div>
              </div>

              {/* Change Password Form */}
              <div className="space-y-6 p-6 bg-slate-50/50 border border-slate-100 rounded-3xl">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Change Password</h4>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Required for verification"
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                      />
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-red-500 text-xs font-bold px-1">Passwords do not match</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword || newPassword.length < 6 || newPassword !== confirmPassword}
                  className="w-full h-14 rounded-2xl bg-blue-600 text-white text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Bell className="w-16 h-16 text-slate-100 mb-4" />
              <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Notification Engine Synced</p>
              <p className="text-xs text-slate-400 mt-2">Alerts are delivered in-app. Email notifications coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
