'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Subject } from '@/types';
import {
  Plus,
  FolderTree,
  CheckCircle2,
  Trash2,
  Edit,
  Search,
  BookOpen,
  HelpCircle,
  Video,
  X,
} from 'lucide-react';

export default function AdminChaptersPage() {
  const [tab, setTab] = useState<'LIST' | 'CREATE'>('LIST');
  const [chapters, setChapters] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  // Create form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetClass, setTargetClass] = useState<'CLASS_11' | 'CLASS_12'>('CLASS_11');
  const [orderIndex, setOrderIndex] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Edit Modal state
  const [editingChapter, setEditingChapter] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTargetClass, setEditTargetClass] = useState<'CLASS_11' | 'CLASS_12'>('CLASS_11');
  const [editOrderIndex, setEditOrderIndex] = useState(1);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterClass, setFilterClass] = useState('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const [chaptersRes, subsRes] = await Promise.all([
        apiRequest<any[]>('/admin/chapters-list'),
        apiRequest<Subject[]>('/subjects'),
      ]);

      if (chaptersRes.success) setChapters(chaptersRes.data);
      if (subsRes.success && subsRes.data.length > 0) {
        setSubjects(subsRes.data);
        if (!selectedSubjectId) setSelectedSubjectId(subsRes.data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !selectedSubjectId) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const res = await apiRequest('/admin/chapters', {
        method: 'POST',
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          title,
          slug,
          description,
          targetClass,
          orderIndex,
        }),
      });

      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Chapter created and published to students!' });
        setTitle('');
        setDescription('');
        setTab('LIST');
        loadData();
      }
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Failed to create chapter' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (chap: any) => {
    setEditingChapter(chap);
    setEditTitle(chap.title);
    setEditDescription(chap.description || '');
    setEditTargetClass(chap.targetClass || 'CLASS_11');
    setEditOrderIndex(chap.orderIndex || 1);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapter) return;

    setLoading(true);
    try {
      const res = await apiRequest(`/admin/chapters/${editingChapter.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          targetClass: editTargetClass,
          orderIndex: editOrderIndex,
        }),
      });

      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Chapter updated successfully!' });
        setEditingChapter(null);
        loadData();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update chapter' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChapter = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this syllabus chapter?')) return;

    try {
      const res = await apiRequest(`/admin/chapters/${id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setChapters((prev) => prev.filter((c) => c.id !== id));
        setStatusMsg({ type: 'success', text: 'Chapter removed from curriculum.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete chapter' });
    }
  };

  const filteredChapters = chapters.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subject?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesSubject = filterSubject === 'ALL' || c.subject?.code === filterSubject;
    const matchesClass = filterClass === 'ALL' || c.targetClass === filterClass;

    return matchesSearch && matchesSubject && matchesClass;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Curriculum Chapter Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize chapters for NEET and JEE syllabi, manage topic scopes, edit details, or create new units.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setTab('LIST')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              tab === 'LIST'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Curriculum Chapters ({chapters.length})
          </button>
          <button
            onClick={() => setTab('CREATE')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 ${
              tab === 'CREATE'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Chapter</span>
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
        /* TAB 1: CURRICULUM CHAPTERS TABLE */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search chapters by title or subject..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="ALL">All Subjects</option>
                <option value="BIO">Biology</option>
                <option value="CHE">Chemistry</option>
                <option value="PHY">Physics</option>
                <option value="MAT">Mathematics</option>
              </select>

              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="ALL">All Standards</option>
                <option value="CLASS_11">Class 11</option>
                <option value="CLASS_12">Class 12</option>
              </select>

              <span className="text-xs text-slate-500 font-medium shrink-0 ml-2">
                Showing {filteredChapters.length}
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Subject & Class</th>
                    <th className="py-3 px-4">Chapter Title & Scope</th>
                    <th className="py-3 px-4 text-center">Linked Content</th>
                    <th className="py-3 px-4 text-center">Order</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredChapters.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No curriculum chapters found.
                      </td>
                    </tr>
                  ) : (
                    filteredChapters.map((chap) => (
                      <tr key={chap.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-slate-900">{chap.subject?.name}</span>
                            <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold rounded text-[10px] w-fit">
                              {chap.targetClass === 'CLASS_11' ? 'Class 11' : 'Class 12'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="max-w-md">
                            <p className="font-bold text-slate-900">{chap.title}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {chap.description || 'No description entered'}
                            </p>
                            <span className="text-[10px] font-mono text-slate-400">
                              slug: {chap.slug}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center space-x-3 text-[11px] text-slate-600">
                            <span className="flex items-center space-x-1" title="Notes">
                              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                              <span>{chap._count?.notes || 0}</span>
                            </span>
                            <span className="flex items-center space-x-1" title="Questions">
                              <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                              <span>{chap._count?.questions || 0}</span>
                            </span>
                            <span className="flex items-center space-x-1" title="Reels">
                              <Video className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{chap._count?.videos || 0}</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-600">
                          #{chap.orderIndex || 1}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center space-x-2">
                            <button
                              onClick={() => handleStartEdit(chap)}
                              title="Edit Chapter"
                              className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteChapter(chap.id)}
                              title="Delete Chapter"
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
        /* TAB 2: CREATE CHAPTER FORM */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
          <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
            <FolderTree className="w-5 h-5 text-indigo-600" />
            <span>Create New Syllabus Chapter</span>
          </h3>

          <form onSubmit={handleCreateChapter} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Discipline / Subject
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Standard / Class
                </label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="CLASS_11">Class 11</option>
                  <option value="CLASS_12">Class 12</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chapter Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Thermodynamics & Thermochemistry"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description & NCERT Scope
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summary of learning objectives, high-yield laws, and formulas covered in this chapter..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Syllabus Order Sequence
              </label>
              <input
                type="number"
                min={1}
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value, 10))}
                className="w-full sm:w-40 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{loading ? 'Publishing...' : 'Add Chapter'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">Edit Chapter Details</h3>
              <button
                onClick={() => setEditingChapter(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chapter Title
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
                  Standard / Class
                </label>
                <select
                  value={editTargetClass}
                  onChange={(e) => setEditTargetClass(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="CLASS_11">Class 11</option>
                  <option value="CLASS_12">Class 12</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description & Scope
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Order Index
                </label>
                <input
                  type="number"
                  min={1}
                  value={editOrderIndex}
                  onChange={(e) => setEditOrderIndex(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingChapter(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
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
