'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api';
import { StudentAnalytics, Subject, PersonalTask } from '@/types';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  ArrowRight,
  BookOpen,
  HelpCircle,
  PlaySquare,
  Layers,
  Calendar,
  AlertCircle,
  Plus,
  ListTodo,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Task Creation state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('MATHEMATICS');
  const [newTaskPriority, setNewTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [newTaskMinutes, setNewTaskMinutes] = useState(45);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [analyticsRes, subjectsRes, tasksRes] = await Promise.all([
        apiRequest<StudentAnalytics>('/analytics/dashboard'),
        apiRequest<Subject[]>('/subjects'),
        apiRequest<{ stats: any; tasks: PersonalTask[] }>('/planner/tasks'),
      ]);

      if (analyticsRes.success) {
        setAnalytics(analyticsRes.data);
      }
      if (subjectsRes.success) {
        setSubjects(subjectsRes.data);
      }
      if (tasksRes.success) {
        setTasks(tasksRes.data.tasks);
      }
    } catch (e) {
      console.error('Failed to load dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleToggleTask = async (taskId: string) => {
    try {
      const res = await apiRequest(`/planner/tasks/${taskId}/toggle`, {
        method: 'PATCH',
      });
      if (res.success) {
        // Optimistically update local task state
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t))
        );
        // Refresh analytics in background to keep counters in sync
        const analyticsRes = await apiRequest<StudentAnalytics>('/analytics/dashboard');
        if (analyticsRes.success) {
          setAnalytics(analyticsRes.data);
        }
      }
    } catch (e) {
      console.error('Failed to toggle task', e);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsSubmittingTask(true);
    try {
      const res = await apiRequest('/planner/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: newTaskTitle,
          subjectCode: newTaskSubject,
          priority: newTaskPriority,
          estimatedMinutes: newTaskMinutes,
          dueDate: new Date().toISOString(),
        }),
      });

      if (res.success) {
        setShowAddModal(false);
        setNewTaskTitle('');
        loadDashboardData();
      }
    } catch (e) {
      console.error('Failed to create task', e);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const studentName = user?.profile?.fullName || 'Student';
  const targetExam = user?.profile && 'targetExam' in user.profile ? user.profile.targetExam : 'NEET';
  const targetClass = user?.profile && 'targetClass' in user.profile ? user.profile.targetClass : 'CLASS_12';

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const completedTasksList = tasks.filter((t) => t.isCompleted);
  const pendingTasksList = tasks.filter((t) => !t.isCompleted);
  const totalTasksCount = tasks.length;
  const completedCount = completedTasksList.length;
  const pendingCount = pendingTasksList.length;
  const taskCompletionRate =
    totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  const totalAttempted = analytics?.overview.totalQuestionsAttempted ?? 0;
  const correctCount = analytics?.overview.correctAnswers ?? 0;
  const accuracyPct = analytics?.overview.accuracyPercentage ?? 0;
  const studyMins = analytics?.overview.studyDurationMinutes ?? 0;
  const totalBookmarks = analytics?.overview.totalBookmarks ?? 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* SECTION A: WELCOME BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/30 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{todayStr} • Daily Target Board</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {studentName}!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-xl">
              "Consistency beats raw talent. You have{' '}
              <strong className="text-white underline">{pendingCount} pending task{pendingCount !== 1 ? 's' : ''}</strong>{' '}
              today to conquer your target {targetExam} exam!"
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 text-center">
              <p className="text-[10px] text-indigo-200 uppercase font-semibold">Track</p>
              <p className="text-sm font-extrabold text-white">{targetExam}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 text-center">
              <p className="text-[10px] text-indigo-200 uppercase font-semibold">Standard</p>
              <p className="text-sm font-extrabold text-white">{targetClass.replace('_', ' ')}</p>
            </div>
            <Link
              href="/dashboard/pyq"
              className="bg-white hover:bg-slate-100 text-indigo-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow"
            >
              <span>Practice PYQs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION B: ACCURATE DAILY LEARNING OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Targets Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-slate-500 font-semibold">Today's Targets</p>
            <p className="text-xl font-extrabold text-slate-900">
              {completedCount} / {totalTasksCount}
            </p>
            <p className="text-[11px] font-medium text-emerald-600">
              {totalTasksCount > 0 ? `${taskCompletionRate}% Completed` : 'No targets scheduled'}
            </p>
          </div>
        </div>

        {/* PYQ Accuracy Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-slate-500 font-semibold">PYQ Accuracy</p>
            <p className="text-xl font-extrabold text-slate-900">
              {totalAttempted > 0 ? `${accuracyPct}%` : '0%'}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {totalAttempted > 0
                ? `${correctCount} of ${totalAttempted} correct`
                : 'Start your first PYQ drill'}
            </p>
          </div>
        </div>

        {/* Study Duration Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-slate-500 font-semibold">Study Duration</p>
            <p className="text-xl font-extrabold text-slate-900">
              {Math.floor(studyMins / 60)}h {studyMins % 60}m
            </p>
            <p className="text-[11px] text-amber-700 font-medium truncate">
              {studyMins > 0 ? 'Logged this week' : 'Practice to log time'}
            </p>
          </div>
        </div>

        {/* Mistake Vault Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-slate-500 font-semibold">Mistake Vault</p>
            <p className="text-xl font-extrabold text-slate-900">
              {totalBookmarks} Question{totalBookmarks !== 1 ? 's' : ''}
            </p>
            <Link
              href="/dashboard/bookmarks?category=MISTAKE"
              className="text-[11px] text-[#4F46E5] font-semibold hover:underline"
            >
              {totalBookmarks > 0 ? 'Review mistakes →' : '0 mistakes tagged'}
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION: TODAY'S TARGET & PENDING TASKS (INTERACTIVE CHECKLIST) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-bold">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">Today's Target & Tasks</h2>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingCount} Pending
                </span>
                {completedCount > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                    {completedCount} Done
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Click any task checkbox to mark it completed or pending.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-1.5 bg-[#4F46E5] hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Target</span>
            </button>
            <Link
              href="/dashboard/planner"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all"
            >
              <span>Full Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Task Checklist Items */}
        {tasks.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <p className="text-sm font-bold text-slate-700">No tasks created yet</p>
            <p className="text-xs text-slate-500">
              Click "+ Add New Target" above to schedule your study goals for today.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Pending Tasks First */}
            {pendingTasksList.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all flex items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className="mt-0.5 text-slate-300 hover:text-emerald-600 transition-colors shrink-0"
                    title="Click to mark completed"
                  >
                    <Circle className="w-5 h-5 hover:stroke-emerald-600" />
                  </button>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">{task.title}</p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          task.priority === 'HIGH'
                            ? 'bg-rose-100 text-rose-700'
                            : task.priority === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {task.subjectCode && (
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                          {task.subjectCode}
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{task.estimatedMinutes} mins</span>
                      </span>
                      <span>•</span>
                      <span className="text-amber-600 font-semibold">Pending Target</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            ))}

            {/* Completed Tasks Accordion / Section */}
            {completedTasksList.length > 0 && (
              <div className="pt-2 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Completed Targets ({completedTasksList.length})
                </p>
                {completedTasksList.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-4 opacity-70"
                  >
                    <div className="flex items-center space-x-3.5">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className="text-emerald-600 shrink-0"
                        title="Click to unmark"
                      >
                        <CheckCircle2 className="w-5 h-5 fill-emerald-100 text-emerald-600" />
                      </button>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 line-through">
                          {task.title}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {task.subjectCode} • {task.estimatedMinutes} mins • Completed
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Undo
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION C: 4 CORE CURRICULUM SUBJECTS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Curriculum Subjects</h2>
          <Link
            href="/dashboard/learning"
            className="text-xs font-semibold text-[#4F46E5] hover:underline"
          >
            View all chapters →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.map((sub) => {
            return (
              <div
                key={sub.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-400 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm mb-3"
                    style={{ backgroundColor: `${sub.color}15`, color: sub.color }}
                  >
                    {sub.code.substring(0, 3)}
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{sub.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sub.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {sub._count?.chapters ?? 0} Chapters
                  </span>
                  <Link
                    href={`/dashboard/pyq?subjectCode=${sub.code}`}
                    className="text-xs font-bold text-[#4F46E5] hover:underline"
                  >
                    Practice →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION D, E, F: 2-COLUMN BOTTOM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Continue Learning & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-4">Continue Learning</h3>
            <div className="space-y-3">
              {subjects.slice(0, 3).map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${sub.color}20`, color: sub.color }}
                    >
                      {sub.name} • {targetClass.replace('_', ' ')}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      {sub.name} High-Yield NCERT Curriculum
                    </h4>
                    <p className="text-xs text-slate-500">
                      {sub._count?.chapters ?? 0} Chapters • {sub._count?.questions ?? 0} Verified PYQs
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/pyq?subjectCode=${sub.code}`}
                    className="bg-[#4F46E5] hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-all"
                  >
                    Solve PYQs
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-4">Recent Academic Activities</h3>
            <div className="space-y-3">
              {(analytics?.recentActivities && analytics.recentActivities.length > 0
                ? analytics.recentActivities
                : [
                    {
                      id: '1',
                      actionType: 'ENROLL',
                      title: `Welcome to Smartway! Target set to ${targetExam}.`,
                      createdAt: new Date().toISOString(),
                    },
                    {
                      id: '2',
                      actionType: 'TARGET_INIT',
                      title: `${totalTasksCount} Daily study targets scheduled.`,
                      createdAt: new Date().toISOString(),
                    },
                  ]
              ).map((act) => (
                <div key={act.id} className="flex items-start space-x-3 text-xs text-slate-600 py-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#4F46E5] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{act.title}</p>
                    <p className="text-[10px] text-slate-400">Activity logged</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Today's Timetable / Schedule */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#4F46E5]" />
                <span>Today's Timetable</span>
              </h3>
              <Link href="/dashboard/planner" className="text-xs text-[#4F46E5] font-semibold hover:underline">
                Full Plan →
              </Link>
            </div>

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No scheduled slots</p>
              ) : (
                tasks.slice(0, 3).map((t, idx) => (
                  <div
                    key={t.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      t.isCompleted
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-indigo-50/50 border-indigo-100'
                    }`}
                  >
                    <div className="flex justify-between font-semibold">
                      <span className="text-indigo-800">
                        Session {idx + 1} ({t.estimatedMinutes} mins)
                      </span>
                      <span
                        className={t.isCompleted ? 'text-emerald-600 font-bold' : 'text-[#4F46E5] font-bold'}
                      >
                        {t.isCompleted ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900">{t.title}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Micro Concept Video Reel CTA */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-300">
              <PlaySquare className="w-4 h-4" />
              <span>30-Sec Concept Capsules</span>
            </div>
            <h4 className="text-sm font-bold">Quick Concept Video Reels</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Watch bite-sized micro-reels explaining high-yield formulas, tricks, and mechanisms.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/videos"
                className="inline-block bg-[#4F46E5] hover:bg-indigo-600 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-all"
              >
                Watch Video Reels →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ADD TASK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add Today's Study Target</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Solve 20 questions on Definite Integrals"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#4F46E5] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
                  >
                    <option value="MATHEMATICS">Mathematics</option>
                    <option value="PHYSICS">Physics</option>
                    <option value="CHEMISTRY">Chemistry</option>
                    <option value="BIOLOGY">Biology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Duration</label>
                <div className="flex gap-2">
                  {[30, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setNewTaskMinutes(mins)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        newTaskMinutes === mins
                          ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTask}
                  className="px-5 py-2 bg-[#4F46E5] hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                >
                  {isSubmittingTask ? 'Adding...' : 'Add Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
