'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Bookmark, BookmarkCategory } from '@/types';
import {
  Bookmark as BookmarkIcon,
  Trash2,
  CheckCircle2,
  HelpCircle,
  PlayCircle,
  AlertCircle,
  RotateCw,
  Folder,
} from 'lucide-react';

export default function BookmarksPage() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get('category') as BookmarkCategory) || 'MISTAKE';

  const [activeCategory, setActiveCategory] = useState<BookmarkCategory>(initialCategory);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<{
    MISTAKE: number;
    REVISE_LATER: number;
    IMPORTANT: number;
  }>({
    MISTAKE: 0,
    REVISE_LATER: 0,
    IMPORTANT: 0,
  });
  const [loading, setLoading] = useState(true);

  // Practice modal / inline test state
  const [practiceActive, setPracticeActive] = useState<Bookmark | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [revealedSolution, setRevealedSolution] = useState(false);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{
        categories: { MISTAKE: number; REVISE_LATER: number; IMPORTANT: number };
        bookmarks: Bookmark[];
      }>(`/bookmarks?category=${activeCategory}`);

      if (res.success) {
        setBookmarks(res.data.bookmarks);
        setCategoryCounts(res.data.categories);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [activeCategory]);

  const handleRemoveBookmark = async (id: string) => {
    try {
      const res = await apiRequest(`/bookmarks/${id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
        setCategoryCounts((prev) => ({
          ...prev,
          [activeCategory]: Math.max(0, prev[activeCategory] - 1),
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Three-Category Bookmark Vault</h1>
        <p className="text-xs text-slate-500 mt-1">
          Isolate your mistakes, high-priority questions, and revise-later topics for precision review.
        </p>
      </div>

      {/* 3 Dedicated Folder Category Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveCategory('MISTAKE')}
          className={`p-5 rounded-2xl border text-left transition-all flex items-center justify-between ${activeCategory === 'MISTAKE'
              ? 'border-rose-500 bg-rose-50/70 shadow-sm ring-2 ring-rose-200'
              : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-rose-700 flex items-center space-x-1.5">
              <Folder className="w-4 h-4 fill-rose-100" />
              <span>Mistake Questions</span>
            </span>
            <p className="text-xl font-extrabold text-slate-900">{categoryCounts.MISTAKE}</p>
            <p className="text-[11px] text-slate-500">Auto-saved from incorrect attempts</p>
          </div>
        </button>

        <button
          onClick={() => setActiveCategory('REVISE_LATER')}
          className={`p-5 rounded-2xl border text-left transition-all flex items-center justify-between ${activeCategory === 'REVISE_LATER'
              ? 'border-amber-500 bg-amber-50/70 shadow-sm ring-2 ring-amber-200'
              : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-700 flex items-center space-x-1.5">
              <Folder className="w-4 h-4 fill-amber-100" />
              <span>Revise Later</span>
            </span>
            <p className="text-xl font-extrabold text-slate-900">{categoryCounts.REVISE_LATER}</p>
            <p className="text-[11px] text-slate-500">Questions marked for weekend drill</p>
          </div>
        </button>

        <button
          onClick={() => setActiveCategory('IMPORTANT')}
          className={`p-5 rounded-2xl border text-left transition-all flex items-center justify-between ${activeCategory === 'IMPORTANT'
              ? 'border-indigo-500 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-200'
              : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-indigo-700 flex items-center space-x-1.5">
              <Folder className="w-4 h-4 fill-indigo-100" />
              <span>Important Questions</span>
            </span>
            <p className="text-xl font-extrabold text-slate-900">{categoryCounts.IMPORTANT}</p>
            <p className="text-[11px] text-slate-500">High weightage recurring questions</p>
          </div>
        </button>
      </div>

      {/* Bookmarked Questions List */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading saved bookmarks...</div>
      ) : bookmarks.length === 0 ? (
        <div className="p-16 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
          <p className="font-bold text-slate-700">No questions saved in this folder yet.</p>
          <p className="text-xs text-slate-500">
            While solving PYQs, click "Mistake", "Revise Later", or "Important" to organize them here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bm, index) => (
            <div
              key={bm.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-bold text-[#4F46E5] bg-indigo-50 px-2 py-0.5 rounded">
                    {bm.question.examType} {bm.question.examYear}
                  </span>
                  <span className="font-semibold text-slate-700">
                    {bm.question.subject?.name} • {bm.question.chapter?.title}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setPracticeActive(bm);
                      setSelectedOptionId(null);
                      setRevealedSolution(false);
                    }}
                    className="inline-flex items-center space-x-1 bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Practice Question</span>
                  </button>
                  <button
                    onClick={() => handleRemoveBookmark(bm.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove from bookmark folder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                {bm.question.content}
              </p>

              {bm.notes && (
                <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-900">
                  <strong>Personal Revision Note:</strong> {bm.notes}
                </div>
              )}

              {/* Direct Practice Drawer if clicked */}
              {practiceActive?.id === bm.id && (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Instant Folder Practice Mode:
                  </h4>
                  <div className="space-y-2">
                    {bm.question.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedOptionId(opt.id)}
                        className={`w-full text-left p-3 rounded-lg border text-xs font-medium transition-all ${selectedOptionId === opt.id
                            ? 'border-[#4F46E5] bg-indigo-50 font-bold text-indigo-950'
                            : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-800'
                          } ${revealedSolution && opt.isCorrect
                            ? '!border-emerald-500 !bg-emerald-50 !text-emerald-950 font-bold'
                            : ''
                          }`}
                      >
                        <strong>{opt.label}.</strong> {opt.content}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {!revealedSolution ? (
                      <button
                        disabled={!selectedOptionId}
                        onClick={() => setRevealedSolution(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all"
                      >
                        Reveal Solution & Verify
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setPracticeActive(null);
                          setSelectedOptionId(null);
                          setRevealedSolution(false);
                        }}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        Close Practice Mode
                      </button>
                    )}
                  </div>

                  {revealedSolution && bm.question.explanation && (
                    <div className="p-4 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 space-y-2">
                      <p className="font-bold text-slate-900">Step-by-Step Explanation:</p>
                      <p>{bm.question.explanation.content}</p>
                      {bm.question.explanation.formula && (
                        <p className="text-[11px] font-mono text-[#4F46E5] font-bold">
                          Formula: {bm.question.explanation.formula}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

