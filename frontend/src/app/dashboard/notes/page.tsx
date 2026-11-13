'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
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
} from 'lucide-react';

export default function NotesPage() {
  const searchParams = useSearchParams();
  const initialChapterId = searchParams.get('chapterId') || '';

  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [activeNote, setActiveNote] = useState<Note | null>(null);
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">High-Yield Notes & Formulae</h1>
          <p className="text-xs text-slate-500 mt-1">
            Concise NCERT summaries, formulas, tables, and downloadable PDF documents.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes or formulas..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          />
        </form>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => handleFilter('')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
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

      {/* 2-Column Note Reader Experience */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Notes List */}
        <div className="lg:col-span-4 space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Available Documents ({notes.length})
          </p>
          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
            {notes.map((note) => {
              const isSelected = activeNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => setActiveNote(note)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#4F46E5] bg-indigo-50/60 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 mb-1">
                    <span className="text-[#4F46E5]">
                      {note.chapter?.subject?.name || 'Curriculum'}
                    </span>
                    <span>•</span>
                    <span>{note.chapter?.targetClass?.replace('_', ' ')}</span>
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
                    {note.files && note.files.length > 0 && (
                      <span className="text-indigo-600 font-semibold flex items-center space-x-1">
                        <FileText className="w-3 h-3" />
                        <span>PDF Included</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: In-App Document & Markdown Viewer */}
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

                  {/* PDF Download Button if permitted */}
                  {activeNote.allowDownload && activeNote.files && activeNote.files[0] && (
                    <a
                      href={activeNote.files[0].fileUrl}
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

              {/* In-App Reader Content */}
              <div className="py-6 prose prose-indigo max-w-none text-sm text-slate-800 leading-relaxed space-y-4">
                <div className="whitespace-pre-wrap font-sans">
                  {activeNote.contentMarkdown}
                </div>
              </div>

              {/* In-App PDF Embed / Simulation Viewer */}
              {activeNote.files && activeNote.files.length > 0 && (
                <div className="mt-8 border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span>{activeNote.files[0].title} (In-App PDF Viewer)</span>
                    </div>
                    <span className="text-[11px] text-slate-400">PDF.js Rendering Engine</span>
                  </div>
                  <div className="p-8 bg-slate-100 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-white text-[#4F46E5] flex items-center justify-center mx-auto shadow-sm">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      Document: {activeNote.files[0].title}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      High-Yield Formulas and NCERT Tables Compiled for Quick Revision
                    </p>
                    <a
                      href={activeNote.files[0].fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#4F46E5]" />
                      <span>Open Fullscreen Document</span>
                    </a>
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

