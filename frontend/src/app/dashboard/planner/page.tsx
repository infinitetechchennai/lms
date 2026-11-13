'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { PersonalTask } from '@/types';
import {
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Layers,
  Sparkles,
  ArrowRight,
  Flame,
} from 'lucide-react';

export default function StudyPlannerPage() {
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'CURATED'>('PERSONAL');
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionRate: 0,
  });
  const [curatedPlans, setCuratedPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New task modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState('BIOLOGY');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

  const fetchPlannerData = async () => {
    setLoading(true);
    try {
      const [tasksRes, plansRes] = await Promise.all([
        apiRequest<{ stats: any; tasks: PersonalTask[] }>('/planner/tasks'),
        apiRequest<any[]>('/planner/curated-plans'),
      ]);

      if (tasksRes.success) {
        setTasks(tasksRes.data.tasks);
        setStats(tasksRes.data.stats);
      }
      if (plansRes.success) {
        setCuratedPlans(plansRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerData();
  }, []);

  const handleToggleTask = async (id: string) => {
    try {
      const res = await apiRequest(`/planner/tasks/${id}/toggle`, {
        method: 'PATCH',
      });
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
        );
        fetchPlannerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await apiRequest(`/planner/tasks/${id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        fetchPlannerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/planner/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title,
          subjectCode,
          dueDate: new Date(dueDate).toISOString(),
          estimatedMinutes,
          priority,
        }),
      });

      if (res.success) {
        setCreateModalOpen(false);
        setTitle('');
        fetchPlannerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dual Study Planner</h1>
          <p className="text-xs text-slate-500 mt-1">
            Personal task tracking synchronized with platform-curated master exam timetables.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center space-x-1.5 bg-[#4F46E5] hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Study Task</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('PERSONAL')}
          className={`pb-2 text-xs font-bold transition-all relative ${
            activeTab === 'PERSONAL'
              ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Personal Study Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('CURATED')}
          className={`pb-2 text-xs font-bold transition-all relative ${
            activeTab === 'CURATED'
              ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Curated Master Timetables ({curatedPlans.length})
        </button>
      </div>

      {activeTab === 'PERSONAL' ? (
        <div className="space-y-6">
          {/* Progress Overview Bar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="border-r border-slate-100 last:border-none">
              <p className="text-xs text-slate-400 font-semibold">Total Planned</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalTasks}</p>
            </div>
            <div className="border-r border-slate-100 last:border-none">
              <p className="text-xs text-slate-400 font-semibold">Completed</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.completedTasks}</p>
            </div>
            <div className="border-r border-slate-100 last:border-none">
              <p className="text-xs text-slate-400 font-semibold">Pending</p>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.pendingTasks}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold">Completion Rate</p>
              <p className="text-2xl font-extrabold text-[#4F46E5] mt-1">{stats.completionRate}%</p>
            </div>
          </div>

          {/* Tasks List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900">Today & Upcoming Schedule</h3>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading planner tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No tasks scheduled. Click "+ Add Study Task" to plan your next session.
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                      task.isCompleted
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className="text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-sm font-bold ${
                              task.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              task.priority === 'HIGH'
                                ? 'bg-rose-100 text-rose-700'
                                : task.priority === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                          {task.subjectCode && <span>Subject: {task.subjectCode}</span>}
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{task.estimatedMinutes} mins</span>
                          </span>
                          <span>•</span>
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Curated Master Timetables */
        <div className="space-y-6">
          {curatedPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-[#4F46E5] bg-indigo-50 px-2.5 py-1 rounded">
                    Official {plan.targetExam} Master Plan
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">{plan.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-slate-900">
                    {plan.durationWeeks} Weeks Roadmap
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Curated Daily Schedule Template:
                </h4>
                {plan.tasks?.map((pt: any) => (
                  <div
                    key={pt.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                        Day {pt.dayNumber}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">{pt.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {pt.subjectCode} • {pt.chapterName} ({pt.taskType})
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-slate-600">{pt.durationMin} mins</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Schedule Study Task</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Solve 20 questions on Kirchhoff Loop Law"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  >
                    <option value="BIOLOGY">Biology</option>
                    <option value="CHEMISTRY">Chemistry</option>
                    <option value="PHYSICS">Physics</option>
                    <option value="MATHEMATICS">Mathematics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

