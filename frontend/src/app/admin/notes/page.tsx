'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Subject, Chapter, Note } from '@/types';
import {
  FileText,
  Plus,
  CheckCircle2,
  Trash2,
  Edit,
  Eye,
  Download,
  Search,
  BookOpen,
} from 'lucide-react';

export default function AdminNotesPage() {
  const [tab, setTab] = useState<'LIST' | 'CREATE'>('LIST');
  const [notes, setNotes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState('');

  // Create form state
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [contentMarkdown, setContentMarkdown] = useState('');
  const [allowDownload, setAllowDownload] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Edit Modal state
  const [editingNote, setEditingNote] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editContentMarkdown, setEditContentMarkdown] = useState('');
  const [editAllowDownload, setEditAllowDownload] = useState(true);

  // Search filter
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [notesRes, subsRes] = await Promise.all([
        apiRequest<any[]>('/admin/notes-list'),
        apiRequest<Subject[]>('/subjects'),
      ]);

      if (notesRes.success) setNotes(notesRes.data);
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

  useEffect(() => {
    async function loadChapters() {
      const selected = subjects.find((s) => s.id === selectedSubjectId);
      if (!selected) return;

      try {
        const res = await apiRequest<{ chapters: Chapter[] }>(
          `/subjects/${selected.code}/chapters`
        );
        if (res.success && res.data.chapters) {
          setChapters(res.data.chapters);
          if (res.data.chapters.length > 0) {
            setSelectedChapterId(res.data.chapters[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadChapters();
  }, [selectedSubjectId, subjects]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapterId || !title || !contentMarkdown) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await apiRequest('/admin/notes', {
        method: 'POST',
        body: JSON.stringify({
          chapterId: selectedChapterId,
          title,
          summary,
          contentMarkdown,
          allowDownload,
        }),
      });

      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Study note published successfully!' });
        setTitle('');
        setSummary('');
        setContentMarkdown('');
        setTab('LIST');
        loadData();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to publish note' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (note: any) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditSummary(note.summary);
    setEditContentMarkdown(note.contentMarkdown);
    setEditAllowDownload(note.allowDownload);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;

    setLoading(true);
    try {
      const res = await apiRequest(`/admin/notes/${editingNote.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle,
          summary: editSummary,
          contentMarkdown: editContentMarkdown,
          allowDownload: editAllowDownload,
        }),
      });

      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Note updated successfully!' });
        setEditingNote(null);
        loadData();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update note' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this study note?')) return;

    try {
      const res = await apiRequest(`/admin/notes/${id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        setStatusMsg({ type: 'success', text: 'Note deleted.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete note' });
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.chapter?.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.chapter?.subject?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Notes & Formulae Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            View all uploaded notes, edit content/formulas, modify permissions, or publish new chapters.
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
            All Published Notes ({notes.length})
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
            <span>Publish New Note</span>
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
        /* TAB 1: ALL PUBLISHED NOTES TABLE */
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes by title or chapter..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium shrink-0">
              Showing {filteredNotes.length} notes
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Note Details</th>
                  <th className="py-3.5 px-4">Discipline & Chapter</th>
                  <th className="py-3.5 px-4">Views</th>
                  <th className="py-3.5 px-4">Download</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Loading notes...
                    </td>
                  </tr>
                ) : filteredNotes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No notes found.
                    </td>
                  </tr>
                ) : (
                  filteredNotes.map((note) => (
                    <tr key={note.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-slate-900 leading-snug">{note.title}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{note.summary}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                          {note.chapter?.subject?.name || 'Subject'}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1 truncate">
                          {note.chapter?.title} ({note.chapter?.targetClass})
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {note.viewsCount} views
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            note.allowDownload
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {note.allowDownload ? 'Allowed' : 'Restricted'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleStartEdit(note)}
                          className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="inline-flex items-center space-x-1 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TAB 2: PUBLISH NEW NOTE FORM */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
          <h3 className="font-bold text-sm text-slate-900">Upload & Publish Study Note</h3>
          <form onSubmit={handleCreateNote} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chapter</label>
                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Note Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chemical Bonding: VSEPR Theory and MOT Cheat Sheet"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                High-Yield Summary
              </label>
              <input
                type="text"
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Core concepts, formula shortcuts, and exceptions for NEET/JEE..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Content Markdown (Definitions, Equations, Tables)
              </label>
              <textarea
                required
                rows={8}
                value={contentMarkdown}
                onChange={(e) => setContentMarkdown(e.target.value)}
                placeholder="## 1. Key Principles..."
                className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="allowDownload"
                checked={allowDownload}
                onChange={(e) => setAllowDownload(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <label htmlFor="allowDownload" className="text-xs font-semibold text-slate-700">
                Permit students to download offline PDF document
              </label>
            </div>

            <div className="flex justify-end pt-2 space-x-3">
              <button
                type="button"
                onClick={() => setTab('LIST')}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{loading ? 'Publishing...' : 'Publish Study Note'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT NOTE MODAL */}
      {editingNote && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Edit Study Note</h3>
              <button
                onClick={() => setEditingNote(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Summary</label>
                <input
                  type="text"
                  required
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Content Markdown
                </label>
                <textarea
                  required
                  rows={8}
                  value={editContentMarkdown}
                  onChange={(e) => setEditContentMarkdown(e.target.value)}
                  className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editAllowDownload"
                  checked={editAllowDownload}
                  onChange={(e) => setEditAllowDownload(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="editAllowDownload" className="text-xs font-semibold text-slate-700">
                  Allow PDF download
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
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
