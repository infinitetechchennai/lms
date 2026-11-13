'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Bell, Shield, Lock, CreditCard } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Account Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage notifications, security credentials, and subscription status.
        </p>
      </div>

      <div className="space-y-4">
        {/* Security & Password */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 text-sm font-bold text-slate-900">
            <Lock className="w-5 h-5 text-[#4F46E5]" />
            <span>Security & Password</span>
          </div>
          <p className="text-xs text-slate-500">
            Your account is secured with bcrypt password encryption and JWT sessions.
          </p>
          <div className="pt-2">
            <button className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50">
              Request Password Reset
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 text-sm font-bold text-slate-900">
            <Bell className="w-5 h-5 text-amber-500" />
            <span>Daily Reminders & Notifications</span>
          </div>
          <div className="space-y-2 text-xs text-slate-700">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded text-[#4F46E5]" />
              <span>Send morning daily target reminder email</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded text-[#4F46E5]" />
              <span>Notify when Spaced Repetition flashcards are due for review</span>
            </label>
          </div>
        </div>

        {/* Subscription Plan */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 text-sm font-bold text-slate-900">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <span>Subscription Tier</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="text-xs font-bold text-slate-900">Smartway Pro Aspirant</p>
              <p className="text-[11px] text-slate-500">Active annual membership</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

