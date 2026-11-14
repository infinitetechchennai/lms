'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiRequest, resolveMediaUrl } from '@/lib/api';
import { Note, Subject } from '@/types';
import {
  BookOpen,
  Search,
  Download,
  FileText,
  Eye,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Maximize2,
  Layers,
} from 'lucide-react';

export default function NotesPage() {
  const searchParams = useSearchParams();
  const initialChapterId = searchParams.get('chapterId') || '';

  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [readingMode, setReadingMode] = useState<'SUMMARY' | 'PDF'>('SUMMARY');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const [subRes, notesRes] = await Promise.all([
          apiRequest<Subject[]>('/subjects'),
          apiRequest<Note[]>(
            `/notes${initialChapterId ? `?chapterId=${initialChapterId}` : ''}`
          ),
        ]);

        if (subRes.success) setSubjects(subRes.data);
        if (notesRes.success) {
          setNotes(notesRes.data);
          if (notesRes.data.length > 0) {
            setActiveNote(notesRes.data[0]);
            // If the first note has a PDF, keep default or allow easy toggle
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [initialChapterId]);

  const handleFilter = async (subjectCode: string) => {
    setSelectedSubject(subjectCode);
    setLoading(true);
    try {
      const url = subjectCode ? `/notes?subjectCode=${subjectCode}` : '/notes';
      const res = await apiRequest<Note[]>(url);
      if (res.success) {
        setNotes(res.data);
        if (res.data.length > 0) setActiveNote(res.data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = search ? `/notes?search=${encodeURIComponent(search)}` : '/notes';
      const res = await apiRequest<Note[]>(url);
      if (res.success) {
        setNotes(res.data);
        if (res.data.length > 0) setActiveNote(res.data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const attachedPdf = activeNote?.files && activeNote.files.length > 0 ? activeNote.files[0] : null;
  const resolvedPdfUrl = attachedPdf ? resolveMediaUrl(attachedPdf.fileUrl) : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">High-Yield Notes &amp; PDF Books</h1>
          <p className="text-xs text-slate-500 mt-1">
            Concise NCERT summaries, formulas, tables, and readable in-app PDF textbook chapters.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes and formulas..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] bg-white"
          />
        </form>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => handleFilter('')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
            selectedSubject === ''
              ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5]'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Subjects
        </button>
        {subjects.map((sub) => (
          <button
            key={sub.code}
            onClick={() => handleFilter(sub.code)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
              selectedSubject === sub.code
                ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5]'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {sub.name}
          </button>
        ))}
      </div>

      {/* 2-Column Reader Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Notes List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider px-1">
            Available Study Units ({notes.length})
          </h3>

          <div className="space-y-2.5 max-h-[780px] overflow-y-auto pr-1">
            {loading && (
              <div className="p-8 text-center text-xs text-slate-400">Loading notes...</div>
            )}
            {!loading && notes.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                No notes found matching your selection.
              </div>
            )}
            {notes.map((note) => {
              const isSelected = activeNote?.id === note.id;
              const hasPdf = note.files && note.files.length > 0;
              return (
                <div
                  key={note.id}
                  onClick={() => {
                    setActiveNote(note);
                  }}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#4F46E5] bg-indigo-50/70 shadow-xs ring-1 ring-indigo-300'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 mb-1">
                    <span className="text-[#4F46E5]">
                      {note.chapter?.subject?.name || 'Curriculum'}
                    </span>
                    <span>•</span>
                    <span>{note.chapter?.title}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {note.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{note.summary}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{note.viewsCount} views</span>
                    </span>
                    {hasPdf && (
                      <span className="text-indigo-600 font-bold flex items-center space-x-1 bg-indigo-50 px-2 py-0.5 rounded">
                        <FileText className="w-3 h-3" />
                        <span>PDF Book</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: In-App Document & PDF Reader */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {activeNote ? (
            <div>
              {/* Document Header */}
              <div className="border-b border-slate-200 pb-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 text-xs font-bold">
                    <span className="bg-indigo-100 text-[#4F46E5] px-2.5 py-1 rounded">
                      {activeNote.chapter?.subject?.name}
                    </span>
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
                      {activeNote.chapter?.title}
                    </span>
                  </div>

                  {/* Mode switcher if PDF attached */}
                  {attachedPdf && (
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => setReadingMode('SUMMARY')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          readingMode === 'SUMMARY'
                            ? 'bg-white text-indigo-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        📝 High-Yield Notes
                      </button>
                      <button
                        onClick={() => setReadingMode('PDF')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                          readingMode === 'PDF'
                            ? 'bg-white text-indigo-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>📖 In-App PDF Book</span>
                      </button>
                    </div>
                  )}

                  {/* PDF Download Button if permitted */}
                  {activeNote.allowDownload && attachedPdf && (
                    <a
                      href={resolvedPdfUrl || attachedPdf.fileUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 bg-[#4F46E5] hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {activeNote.title}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <strong>High-Yield Objective:</strong> {activeNote.summary}
                </p>
              </div>

              {/* VIEW 1: MARKDOWN & FORMULAE */}
              {readingMode === 'SUMMARY' && (
                <div className="py-6 prose prose-indigo max-w-none text-sm text-slate-800 leading-relaxed space-y-4">
                  <div className="whitespace-pre-wrap font-sans">
                    {activeNote.contentMarkdown}
                  </div>

                  {/* Attached PDF Banner */}
                  {attachedPdf && (
                    <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900">
                            Attached Textbook: {attachedPdf.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Complete official textbook chapter &amp; illustrated derivations.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setReadingMode('PDF')}
                        className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read Book in Viewer</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 2: IN-APP PDF VIEWER */}
              {readingMode === 'PDF' && attachedPdf && (
                <div className="py-4 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-xl text-xs font-semibold">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span>{attachedPdf.title}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <a
                        href={resolvedPdfUrl || attachedPdf.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-slate-300 hover:text-white transition-colors"
                      >
                        <span>Open in New Tab</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* PDF Iframe Element */}
                  <div className="relative w-full h-[750px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                    <iframe
                      src={`${resolvedPdfUrl || attachedPdf.fileUrl}#toolbar=1`}
                      className="w-full h-full border-0"
                      title={attachedPdf.title}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-16 text-center text-xs text-slate-400">
              Select a note from the left to read its summary and formulas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
