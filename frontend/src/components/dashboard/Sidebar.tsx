'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  HelpCircle,
  Bookmark,
  Layers,
  Calendar,
  PlaySquare,
  BarChart3,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Learning', href: '/dashboard/learning', icon: GraduationCap },
    { label: 'Notes & Formulae', href: '/dashboard/notes', icon: BookOpen },
    { label: 'PYQ Practice', href: '/dashboard/pyq', icon: HelpCircle },
    { label: 'My Bookmarks', href: '/dashboard/bookmarks', icon: Bookmark },
    { label: 'Flashcards', href: '/dashboard/flashcards', icon: Layers },
    { label: 'Study Planner', href: '/dashboard/planner', icon: Calendar },
    { label: 'Short Videos', href: '/dashboard/videos', icon: PlaySquare },
    { label: 'My Progress', href: '/dashboard/progress', icon: BarChart3 },
    { label: 'Profile', href: '/dashboard/profile', icon: User },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">
              Smart<span className="text-[#4F46E5]">way</span>
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#4F46E5] text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile footer & logout */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 mb-2">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-[#4F46E5] flex items-center justify-center font-bold text-xs shrink-0">
              {user?.profile?.fullName ? user.profile.fullName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.profile?.fullName || 'Student'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {user?.profile && 'targetExam' in user.profile
                  ? user.profile.targetExam
                  : 'NEET Aspirant'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

