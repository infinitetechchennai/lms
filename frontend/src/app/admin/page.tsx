'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import {
  Users,
  BookOpen,
  HelpCircle,
  Video,
  TrendingUp,
  FolderTree,
  Plus,
  ArrowRight,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await apiRequest('/admin/stats');
        if (res.success) {
          setStats(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Platform Command Center</h1>
        <p className="text-xs text-slate-500 mt-1">
          High-level metrics across student enrollment, question attempts, and curriculum assets.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Enrolled Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.totalStudents || 1}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {stats?.activeTodayCount || 1} Active Today
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">PYQ Question Bank</span>
            <HelpCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.totalQuestions || 4}
          </p>
          <span className="text-[11px] text-slate-400">NEET & JEE Verified</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Published Notes</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.totalNotes || 3}
          </p>
          <span className="text-[11px] text-slate-400">NCERT Summary Documents</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Micro-Video Reels</span>
            <Video className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.totalVideos || 3}
          </p>
          <span className="text-[11px] text-slate-400">30-40s Concept Capsules</span>
        </div>
      </div>

      {/* Quick Admin Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900">Direct Curriculum Management</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/questions"
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 transition-all bg-slate-50 hover:bg-white flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-slate-900">Bulk Import PYQs</p>
              <p className="text-[11px] text-slate-500">Upload CSV questions spreadsheet</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#4F46E5]" />
          </Link>

          <Link
            href="/admin/chapters"
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 transition-all bg-slate-50 hover:bg-white flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-slate-900">Add New Chapter</p>
              <p className="text-[11px] text-slate-500">Add syllabus chapters dynamically</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#4F46E5]" />
          </Link>

          <Link
            href="/admin/notes"
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 transition-all bg-slate-50 hover:bg-white flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-slate-900">Publish Notes</p>
              <p className="text-[11px] text-slate-500">Markdown and PDF formula sheets</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#4F46E5]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
