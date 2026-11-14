'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { ExamType } from '@/types';
import {
  Calendar,
  Plus,
  CheckCircle2,
  Trash2,
  Edit,
  Clock,
  Layers,
  Search,
  BookOpen,
  ChevronRight,
  HelpCircle,
  X,
  Target,
} from 'lucide-react';

interface StudyPlanTask {
  id?: string;
  dayNumber: number;
  subjectCode: string;
  chapterName: string;
  taskType: 'STUDY' | 'PYQ_PRACTICE' | 'REVISION';
  title: string;
  durationMin: number;
}

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  targetExam: string;
  durationWeeks: number;
  isPublished: boolean;
  createdAt: string;
  tasks: StudyPlanTask[];
}

export default function AdminPlansPage() {
  const [tab, setTab] = useState<'LIST' | 'CREATE'>('LIST');
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Inspect / View Tasks modal
  const [inspectingPlan, setInspectingPlan] = useState<StudyPlan | null>(null);

  // Create form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetExam, setTargetExam] = useState<'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED'>('NEET');
  const [durationWeeks, setDurationWeeks] = useState(12);

  // New task builder items inside create form
  const [tasks, setTasks] = useState<
    {
      dayNumber: number;
      subjectCode: string;
      chapterName: string;
      taskType: 'STUDY' | 'PYQ_PRACTICE' | 'REVISION';
      title: string;
      durationMin: number;
    }[]
  >([
    {
      dayNumber: 1,
      subjectCode: 'BIOLOGY',
      chapterName: 'Principles of Inheritance & Variation',
      taskType: 'STUDY',
      title: "Mendelian Genetics & Law of Segregation Notes",
      durationMin: 60,
    },
    {
      dayNumber: 2,
      subjectCode: 'PHYSICS',
      chapterName: 'Current Electricity',
      taskType: 'PYQ_PRACTICE',
      title: "Solve 20 Past Year Kirchhoff Loop Questions",
      durationMin: 60,
    },
  ]);

  // Edit modal state
  const [editingPlan, setEditingPlan] = useState<StudyPlan | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTargetExam, setEditTargetExam] = useState<'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED'>('NEET');
  const [editDurationWeeks, setEditDurationWeeks] = useState(12);
  const [editIsPublished, setEditIsPublished] = useState(true);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<StudyPlan[]>('/admin/plans-list');
      if (res.success) {
        setPlans(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleAddTaskRow = () => {
    setTasks((prev) => [
      ...prev,
      {
        dayNumber: prev.length + 1,
        subjectCode: 'CHEMISTRY',
        chapterName: 'Chemical Bonding',
        taskType: 'STUDY',
        title: 'Hybridization & Molecular Geometry Drill',
        durationMin: 60,
      },
    ]);
  };

  const handleRemoveTaskRow = (index: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await apiRequest('/admin/plans', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          targetExam,
          durationWeeks,
          tasks,
        }),
      });

      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Master Study Plan created and published!' });
        setTitle('');
        setDescription('');
        setTab('LIST');
        loadPlans();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to create plan' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (plan: StudyPlan) => {
    setEditingPlan(plan);
    setEditTitle(plan.title);
    setEditDescription(plan.description);
    setEditTargetExam(plan.targetExam as any);
    setEditDurationWeeks(plan.durationWeeks);
    setEditIsPublished(plan.isPublished);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    setLoading(true);
    try {
      const res = await apiRequest(`/admin/plans/${editingPlan.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          targetExam: editTargetExam,
          durationWeeks: editDurationWeeks,
          isPublished: editIsPublished,
        }),
      });

      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Plan details updated successfully!' });
        setEditingPlan(null);
        loadPlans();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update plan' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this master study plan?')) return;

    try {
      const res = await apiRequest(`/admin/plans/${id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setPlans((prev) => prev.filter((p) => p.id !== id));
        setStatusMsg({ type: 'success', text: 'Study plan removed.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete plan' });
    }
  };

  const filteredPlans = plans.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.targetExam.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Master Study Plans &amp; Timetables
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Curate 90-day and 12-week comprehensive examination timetables, revision schedules, and daily targets for NEET &amp; JEE.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setTab('LIST')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              tab === 'LIST'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Master Plans ({plans.length})
          </button>
          <button
            onClick={() => setTab('CREATE')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 ${
              tab === 'CREATE'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Plan</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {tab === 'LIST' ? (
        /* TAB 1: ALL PLANS TABLE */
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search plans by title or target exam..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Plan Title &amp; Description</th>
                    <th className="px-5 py-3.5">Target Track</th>
                    <th className="px-5 py-3.5">Duration</th>
                    <th className="px-5 py-3.5">Curated Targets</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPlans.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400">
                        No master study plans found. Click &quot;Create New Plan&quot; to publish one.
                      </td>
                    </tr>
                  ) : (
                    filteredPlans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-900 leading-snug">{plan.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {plan.description}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              plan.targetExam === 'NEET'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {plan.targetExam.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-medium">
                          <span className="flex items-center space-x-1 text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{plan.durationWeeks} Weeks</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900">
                          <button
                            onClick={() => setInspectingPlan(plan)}
                            className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            <span>{plan.tasks?.length ?? 0} Daily Tasks</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setInspectingPlan(plan)}
                              title="View Roadmap Tasks"
                              className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                            >
                              <Layers className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStartEdit(plan)}
                              title="Edit Plan"
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePlan(plan.id)}
                              title="Delete Plan"
                              className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: CREATE PLAN FORM */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <form onSubmit={handleCreatePlan} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Examination Track
                </label>
                <select
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="NEET">NEET (Medical Track)</option>
                  <option value="JEE_MAIN">JEE Main (Engineering Track)</option>
                  <option value="JEE_ADVANCED">JEE Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Duration (Weeks)
                </label>
                <input
                  type="number"
                  min={1}
                  max={52}
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 90-Day NEET Ultimate Sprint & Revision Roadmap"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description &amp; Strategy
              </label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Systematic daily study schedule covering NCERT Class 11 and 12 high-weightage chapters..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* Daily Tasks Builder */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Daily Roadmap Targets ({tasks.length} Configured)
                </label>
                <button
                  type="button"
                  onClick={handleAddTaskRow}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Target Row</span>
                </button>
              </div>

              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {tasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                  >
                    <div className="sm:col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 block">Day</span>
                      <input
                        type="number"
                        min={1}
                        value={task.dayNumber}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setTasks((p) =>
                            p.map((t, i) => (i === idx ? { ...t, dayNumber: val } : t))
                          );
                        }}
                        className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <span className="text-[10px] font-bold text-slate-400 block">Subject</span>
                      <select
                        value={task.subjectCode}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTasks((p) =>
                            p.map((t, i) => (i === idx ? { ...t, subjectCode: val } : t))
                          );
                        }}
                        className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="BIOLOGY">Biology</option>
                        <option value="PHYSICS">Physics</option>
                        <option value="CHEMISTRY">Chemistry</option>
                        <option value="MATHEMATICS">Mathematics</option>
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <span className="text-[10px] font-bold text-slate-400 block">Task Goal</span>
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTasks((p) =>
                            p.map((t, i) => (i === idx ? { ...t, title: val } : t))
                          );
                        }}
                        placeholder="e.g. Study Mendelian Genetics"
                        className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 block">Type</span>
                      <select
                        value={task.taskType}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setTasks((p) =>
                            p.map((t, i) => (i === idx ? { ...t, taskType: val } : t))
                          );
                        }}
                        className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="STUDY">Study</option>
                        <option value="PYQ_PRACTICE">PYQ Drill</option>
                        <option value="REVISION">Revision</option>
                      </select>
                    </div>

                    <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveTaskRow(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{loading ? 'Creating...' : 'Publish Master Study Plan'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INSPECT ROADMAP TASKS MODAL */}
      {inspectingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {inspectingPlan.title} Roadmap
                </h3>
                <p className="text-[11px] text-slate-500">
                  {inspectingPlan.targetExam} • {inspectingPlan.durationWeeks} Weeks • {inspectingPlan.tasks?.length ?? 0} Daily Slots
                </p>
              </div>
              <button
                onClick={() => setInspectingPlan(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2 text-xs">
              {inspectingPlan.tasks && inspectingPlan.tasks.length > 0 ? (
                inspectingPlan.tasks.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                        D{t.dayNumber}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">{t.title}</p>
                        <p className="text-[10px] text-slate-500">
                          {t.subjectCode} • {t.chapterName} • {t.durationMin} mins
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-600">
                      {t.taskType.replace('_', ' ')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400">
                  No daily tasks added to this plan yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">Edit Study Plan</h3>
              <button
                onClick={() => setEditingPlan(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plan Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Exam
                  </label>
                  <select
                    value={editTargetExam}
                    onChange={(e) => setEditTargetExam(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                  >
                    <option value="NEET">NEET</option>
                    <option value="JEE_MAIN">JEE Main</option>
                    <option value="JEE_ADVANCED">JEE Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration (Weeks)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={editDurationWeeks}
                    onChange={(e) => setEditDurationWeeks(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

