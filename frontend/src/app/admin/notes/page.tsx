'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest, uploadFile, resolveMediaUrl } from '@/lib/api';
import { Subject, Chapter } from '@/types';
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
  UploadCloud,
  ExternalLink,
  X,
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

  // PDF Book Attachment state
  const [pdfUploadMode, setPdfUploadMode] = useState<'FILE' | 'LINK'>('FILE');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfSizeBytes, setPdfSizeBytes] = useState(0);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadedPdfName, setUploadedPdfName] = useState('');

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
  const [editPdfUrl, setEditPdfUrl] = useState('');
  const [editPdfTitle, setEditPdfTitle] = useState('');

  // PDF Preview Modal
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

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
          } else {
            setSelectedChapterId('');
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadChapters();
  }, [selectedSubjectId, subjects]);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPdf(true);
    setStatusMsg(null);
    try {
      const res = await uploadFile(file);
      if (res.success) {
        setPdfUrl(res.data.fileUrl);
        setPdfSizeBytes(res.data.fileSizeBytes);
        setUploadedPdfName(file.name);
        if (!pdfTitle) setPdfTitle(file.name.replace(/\.[^/.]+$/, ''));
        setStatusMsg({ type: 'success', text: `PDF "${file.name}" uploaded successfully!` });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'PDF upload failed' });
    } finally {
      setIsUploadingPdf(false);
    }
  };

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
          pdfUrl: pdfUrl || undefined,
          pdfTitle: pdfTitle || `${title} Book.pdf`,
          pdfSizeBytes,
        }),
      });

      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Study note and PDF book published successfully!' });
        setTitle('');
        setSummary('');
        setContentMarkdown('');
        setPdfUrl('');
        setPdfTitle('');
        setUploadedPdfName('');
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
    setEditSummary(note.summary || '');
    setEditContentMarkdown(note.contentMarkdown);
    setEditAllowDownload(Boolean(note.allowDownload));
    if (note.files && note.files.length > 0) {
      setEditPdfUrl(note.files[0].fileUrl);
      setEditPdfTitle(note.files[0].title);
    } else {
      setEditPdfUrl('');
      setEditPdfTitle('');
    }
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
          pdfUrl: editPdfUrl || undefined,
          pdfTitle: editPdfTitle || undefined,
        }),
      });

      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Note and attached document updated!' });
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
    if (!confirm('Are you sure you want to delete this study note and attached files?')) return;

    try {
      const res = await apiRequest(`/admin/notes/${id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        setStatusMsg({ type: 'success', text: 'Note deleted successfully.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete note' });
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.summary?.toLowerCase().includes(search.toLowerCase()) ||
      n.chapter?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Study Notes & PDF Book Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Author high-yield NCERT summary cards and upload downloadable PDF textbook chapters.
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
            <span>Create New Note & PDF</span>
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
        /* TAB 1: ALL NOTES TABLE */
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes by title or chapter..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Note Title & Summary</th>
                    <th className="px-5 py-3.5">Subject & Chapter</th>
                    <th className="px-5 py-3.5">PDF Book Attachment</th>
                    <th className="px-5 py-3.5">Views</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredNotes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400">
                        No study notes published yet. Click &quot;Create New Note &amp; PDF&quot; to publish.
                      </td>
                    </tr>
                  ) : (
                    filteredNotes.map((note) => {
                      const hasPdf = note.files && note.files.length > 0;
                      return (
                        <tr key={note.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-slate-900 leading-snug">{note.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              {note.summary}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-bold text-slate-800">
                              {note.chapter?.subject?.name || 'Subject'}
                            </span>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {note.chapter?.title}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            {hasPdf ? (
                              <button
                                onClick={() => setPreviewPdfUrl(note.files[0].fileUrl)}
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                <span className="truncate max-w-[140px]">
                                  {note.files[0].title}
                                </span>
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px]">No PDF attached</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-slate-900">
                            {note.viewsCount.toLocaleString()}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {hasPdf && (
                                <button
                                  onClick={() => setPreviewPdfUrl(note.files[0].fileUrl)}
                                  title="View PDF"
                                  className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleStartEdit(note)}
                                title="Edit Note"
                                className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                title="Delete Note"
                                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: CREATE NOTE & PDF FORM */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <form onSubmit={handleCreateNote} className="space-y-5">
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Connected Chapter
                </label>
                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="">-- Choose Chapter --</option>
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
                placeholder="e.g. Mendelian Genetics & Recombination High-Yield Summary"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Objective / High-Yield Summary
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Key concepts, formula derivations, and examination weightage..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Content (Markdown &amp; LaTeX Equations)
              </label>
              <textarea
                required
                rows={6}
                value={contentMarkdown}
                onChange={(e) => setContentMarkdown(e.target.value)}
                placeholder="# Chapter Heading&#10;&#10;## Formulae&#10;$$E = mc^2$$&#10;&#10;- Bullet point 1&#10;- Bullet point 2"
                className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* Attach PDF Book Section */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Attach PDF Textbook / Full Document (Optional)</span>
                </label>
                <div className="flex bg-white border border-slate-200 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPdfUploadMode('FILE')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      pdfUploadMode === 'FILE'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Direct Upload PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfUploadMode('LINK')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      pdfUploadMode === 'LINK'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Paste PDF Link
                  </button>
                </div>
              </div>

              {pdfUploadMode === 'FILE' ? (
                <div>
                  <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-white rounded-xl cursor-pointer transition-all">
                    <UploadCloud className="w-8 h-8 text-indigo-500 mb-2" />
                    <span className="text-xs font-bold text-slate-700">
                      {isUploadingPdf
                        ? 'Uploading PDF document...'
                        : uploadedPdfName
                        ? `Attached: ${uploadedPdfName}`
                        : 'Click to select and upload PDF book (.pdf)'}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      Uploads directly to platform storage for student in-app reading &amp; download
                    </span>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      disabled={isUploadingPdf}
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                  </label>
                  {pdfUrl && (
                    <p className="text-[11px] text-emerald-700 font-semibold mt-2 truncate">
                      ✓ Attached PDF: {pdfUrl}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="https://.../ncert-chapter-book.pdf"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  />
                </div>
              )}

              {pdfUrl && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Document Title (Displayed to Students)
                  </label>
                  <input
                    type="text"
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                    placeholder="e.g. NCERT Official Chapter PDF"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="allowDownload"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="allowDownload"
                  className="text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Allow students to download this PDF document offline
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading || isUploadingPdf}
                className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{loading ? 'Publishing...' : 'Publish Note & PDF'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">Edit Note &amp; PDF Details</h3>
              <button
                onClick={() => setEditingNote(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note Title
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Summary</label>
                <textarea
                  rows={2}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Content (Markdown &amp; LaTeX)
                </label>
                <textarea
                  required
                  rows={5}
                  value={editContentMarkdown}
                  onChange={(e) => setEditContentMarkdown(e.target.value)}
                  className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Attached PDF Document URL
                </label>
                <input
                  type="text"
                  value={editPdfUrl}
                  onChange={(e) => setEditPdfUrl(e.target.value)}
                  placeholder="https://.../document.pdf or /uploads/..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                />
                <input
                  type="text"
                  value={editPdfTitle}
                  onChange={(e) => setEditPdfTitle(e.target.value)}
                  placeholder="PDF Title (e.g. NCERT Official Chapter PDF)"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editAllowDownload"
                  checked={editAllowDownload}
                  onChange={(e) => setEditAllowDownload(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="editAllowDownload"
                  className="text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Allow offline download
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
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

      {/* PDF PREVIEW MODAL */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl overflow-hidden max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-3.5 bg-slate-900 text-white border-b border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-bold">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>PDF Document Preview</span>
              </div>
              <div className="flex items-center space-x-3">
                <a
                  href={resolveMediaUrl(previewPdfUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white text-xs flex items-center space-x-1"
                >
                  <span>Open in Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setPreviewPdfUrl(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <iframe
              src={resolveMediaUrl(previewPdfUrl)}
              className="w-full flex-1 border-0"
              title="PDF Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
