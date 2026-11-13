'use client';

import React from 'react';
import { useAuth } from '../../lib/auth-context';
import { Flame, Bell, Search, Sparkles } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();
  const streak =
    user?.profile && 'streakDays' in user.profile ? user.profile.streakDays : 7;
  const exam =
    user?.profile && 'targetExam' in user.profile ? user.profile.targetExam : 'NEET';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Bar */}
      <div className="relative w-72 sm:w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search topics, questions, formulas..."
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Streak Counter */}
        <div className="flex items-center space-x-1.5 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full text-xs font-bold text-amber-800">
          <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
          <span>{streak} Days Streak</span>
        </div>

        {/* Target Exam Tag */}
        <div className="hidden sm:flex items-center space-x-1 bg-indigo-50 border border-indigo-200 text-[#4F46E5] px-2.5 py-1 rounded-full text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{exam} Track</span>
        </div>

        {/* Notifications */}
        <button className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#4F46E5] absolute top-1.5 right-1.5 ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}

