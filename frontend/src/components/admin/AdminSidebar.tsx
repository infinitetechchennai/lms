'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FolderTree,
  FileText,
  HelpCircle,
  Video,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Admin Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Students Roster', href: '/admin/students', icon: Users },
    { label: 'Curriculum Chapters', href: '/admin/chapters', icon: FolderTree },
    { label: 'Notes & Formulae', href: '/admin/notes', icon: FileText },
    { label: 'PYQ Question Bank', href: '/admin/questions', icon: HelpCircle },
    { label: 'Video Lectures & Reels', href: '/admin/videos', icon: Video },
    { label: 'Master Study Plans', href: '/admin/plans', icon: Calendar },
    { label: 'Platform Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800">
      <div>
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base text-white tracking-tight">
              Smartway <span className="text-indigo-400 text-xs font-mono">ADMIN</span>
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile Footer */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="p-2.5 rounded-xl bg-slate-800/60 text-xs">
          <p className="font-bold text-white truncate">
            {user?.profile && 'fullName' in user.profile
              ? user.profile.fullName
              : 'Administrator'}
          </p>
          <p className="text-[10px] text-indigo-400">
            {user?.profile && 'department' in user.profile
              ? user.profile.department
              : 'Curriculum Director'}
          </p>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Admin Portal</span>
        </button>
      </div>
    </aside>
  );
}
