'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { StudentAnalytics } from '@/types';
import {
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Bookmark,
  Calendar,
} from 'lucide-react';

export default function ProgressPage() {
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiRequest<StudentAnalytics>('/analytics/dashboard');
        if (res.success) {
          setAnalytics(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !analytics) {
    return <div className="p-16 text-center text-xs text-slate-400">Loading progress telemetry...</div>;
  }

  const { overview, subjectBreakdown, weeklyActivity } = analytics;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Personal Learning Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Data-driven diagnostic metrics on your accuracy, streak, and subject-wise exam readiness.
        </p>
      </div>

      {/* High-Level Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-semibold text-slate-500">Overall Accuracy</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">{overview.accuracyPercentage}%</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {overview.correctAnswers} of {overview.totalQuestionsAttempted} correct
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-semibold text-slate-500">Active Study Streak</p>
          <p className="text-3xl font-extrabold text-amber-500 mt-1">{overview.currentStreakDays} Days</p>
          <p className="text-[11px] text-slate-400 mt-1">Unbroken daily dedication</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-semibold text-slate-500">Study Duration</p>
          <p className="text-3xl font-extrabold text-[#4F46E5] mt-1">
            {Math.floor(overview.studyDurationMinutes / 60)}h {overview.studyDurationMinutes % 60}m
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Logged practice hours</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-semibold text-slate-500">Mistakes Tracked</p>
          <p className="text-3xl font-extrabold text-rose-600 mt-1">{overview.totalBookmarks}</p>
          <p className="text-[11px] text-slate-400 mt-1">In Mistake Vault</p>
        </div>
      </div>

      {/* Subject-Wise Accuracy Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-[#4F46E5]" />
            <span>Subject-Wise Performance & Balance</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">NCERT Target: 85%+</span>
        </div>

        <div className="space-y-5">
          {subjectBreakdown.map((sub) => (
            <div key={sub.subjectCode} className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-800">{sub.name}</span>
                <span style={{ color: sub.color }}>
                  {sub.accuracyPercentage}% ({sub.correctCount}/{sub.attemptsCount} attempts)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max(sub.accuracyPercentage, 5)}%`,
                    backgroundColor: sub.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Activity Heatmap / Bar Simulation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <span>Past 7 Days Question Practice Volume</span>
        </h3>

        <div className="grid grid-cols-7 gap-3 pt-4 text-center">
          {weeklyActivity.map((w, i) => (
            <div key={i} className="space-y-2 flex flex-col items-center">
              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl h-28 flex flex-col justify-end p-2">
                <div
                  className="bg-[#4F46E5] w-full rounded-lg transition-all"
                  style={{ height: `${Math.min(100, w.questionsAttempted * 3.5)}%` }}
                  title={`${w.questionsAttempted} questions solved`}
                />
              </div>
              <span className="text-xs font-bold text-slate-700">{w.day}</span>
              <span className="text-[10px] text-slate-400 font-medium">
                {w.questionsAttempted} Qs
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

