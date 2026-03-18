'use client';

import { Settings, Shield, User, Bell, Globe, Save, AlertTriangle } from 'lucide-react';
import { useCRM } from '../context';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { profile } = useCRM();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: User },
    { id: 'security', name: 'Security & Access', icon: Shield },
    { id: 'notifications', name: 'System Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
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

        {/* Content Area */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-12">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
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
                      defaultValue={profile?.name || ''}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
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
                  <button className="h-14 px-10 rounded-2xl bg-slate-900 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-105 transition-all active:scale-95 flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Save Profile
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Advanced Security</h3>
                  <p className="text-sm text-slate-500 mt-1">Credentials and access control</p>
                </div>

                <div className="space-y-4">
                  <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between group hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-blue-500">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Current Access Level</p>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">{profile?.role} Clearance</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-4">
                     <AlertTriangle className="w-6 h-6 text-amber-600 mt-1" />
                     <div>
                        <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">System Credential Rotation</h4>
                        <p className="text-xs font-semibold text-amber-700 mt-1">It is recommended to update your CRM password every 90 days for production security.</p>
                     </div>
                  </div>
                </div>

                <button className="w-full h-14 rounded-2xl bg-white border-2 border-slate-200 text-slate-900 text-sm font-black uppercase tracking-widest hover:border-slate-900 transition-all active:scale-95">
                  Initiate Password Reset
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
               <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Bell className="w-16 h-16 text-slate-100 mb-4" />
                  <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Notification Engine Synced</p>
               </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
