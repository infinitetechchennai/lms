'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Subject, Chapter } from '@/types';
import { BookOpen, HelpCircle, Layers, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

export default function MyLearningPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('BIOLOGY');
  const [selectedClass, setSelectedClass] = useState<'CLASS_11' | 'CLASS_12'>('CLASS_12');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await apiRequest<Subject[]>('/subjects');
        if (res.success && res.data.length > 0) {
          setSubjects(res.data);
          setSelectedSubject(res.data[0].code);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchSubjects();
  }, []);

  useEffect(() => {
    async function fetchChapters() {
      if (!selectedSubject) return;
      setLoading(true);
      try {
        const res = await apiRequest<{ subject: Subject; chapters: Chapter[] }>(
          `/subjects/${selectedSubject}/chapters?targetClass=${selectedClass}`
        );
        if (res.success && res.data.chapters) {
          setChapters(res.data.chapters);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchChapters();
  }, [selectedSubject, selectedClass]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Learning & Syllabus</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse NCERT chapters, topics, notes, and previous year questions.
          </p>
        </div>

        {/* Class Level Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setSelectedClass('CLASS_11')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              selectedClass === 'CLASS_11'
                ? 'bg-white text-[#4F46E5] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Class 11
          </button>
          <button
            onClick={() => setSelectedClass('CLASS_12')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              selectedClass === 'CLASS_12'
                ? 'bg-white text-[#4F46E5] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Class 12
          </button>
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {subjects.map((sub) => (
          <button
            key={sub.code}
            onClick={() => setSelectedSubject(sub.code)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 border ${
              selectedSubject === sub.code
                ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] ring-1 ring-[#4F46E5]'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{sub.name}</span>
          </button>
        ))}
      </div>

      {/* Chapters Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading syllabus chapters...</div>
      ) : chapters.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
          <p className="text-sm font-bold text-slate-700">No chapters found for this selection</p>
          <p className="text-xs text-slate-500">Check another subject or class level.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {chapters.map((ch, idx) => (
            <div
              key={ch.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-indigo-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-lg bg-indigo-100 text-[#4F46E5] font-extrabold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{ch.title}</h3>
                    <p className="text-xs text-slate-500">{ch.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-500">
                  <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                    {ch.topics?.length ?? 0} Topics
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold">
                    NCERT High-Yield
                  </span>
                </div>
              </div>

              {/* Topics Breakdown */}
              {ch.topics && ch.topics.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                  {ch.topics.map((t, tIdx) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-center space-x-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
                      <span className="truncate">{t.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-4 text-xs font-semibold text-slate-600">
                  <span className="flex items-center space-x-1">
                    <BookOpen className="w-3.5 h-3.5 text-[#4F46E5]" />
                    <span>{ch._count?.notes ?? 0} Notes</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{ch._count?.questions ?? 0} PYQs</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{ch._count?.flashcards ?? 0} Flashcards</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    href={`/dashboard/notes?chapterId=${ch.id}`}
                    className="inline-flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  >
                    <span>Read Notes</span>
                  </Link>
                  <Link
                    href={`/dashboard/pyq?chapterId=${ch.id}`}
                    className="inline-flex items-center space-x-1 bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  >
                    <span>Practice PYQs</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

