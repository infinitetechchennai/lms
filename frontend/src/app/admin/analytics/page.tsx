'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { BarChart3, Users, Activity, CheckCircle2, TrendingUp } from 'lucide-react';

export default function AdminAnalyticsPage() {
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Platform Telemetry & Health</h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time academic activity tracking, questions attempted, and daily student engagement.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-semibold text-slate-500">Total Question Attempts</p>
          <p className="text-3xl font-extrabold text-indigo-600 mt-1">
            {stats?.totalAttempts ?? 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Logged across all modules</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-semibold text-slate-500">Active Daily Learners</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">
            {stats?.activeTodayCount ?? 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Active in past 24 hours</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-semibold text-slate-500">Curriculum Volume</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">
            {(stats?.totalNotes ?? 0) + (stats?.totalQuestions ?? 0) + (stats?.totalVideos ?? 0)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Notes, PYQs, and Video Assets</p>
        </div>
      </div>

      {/* Recent Enrollments Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900">Recent Student Sign-ups</h3>
        <div className="space-y-3">
          {stats?.recentRegistrations?.map((r: any) => (
            <div
              key={r.id}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-slate-900">{r.studentProfile?.fullName || 'Aspirant'}</p>
                <p className="text-[11px] text-slate-500">{r.email}</p>
              </div>
              <span className="font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded">
                {r.studentProfile?.targetExam || 'NEET'} Track
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
