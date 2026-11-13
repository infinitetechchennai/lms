'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Question, Subject, BookmarkCategory } from '@/types';
import { useAuth } from '@/lib/auth-context';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  RotateCcw,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export default function PYQPracticePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Filter state
  const [examType, setExamType] = useState<string>(
    user?.profile && 'targetExam' in user.profile ? user.profile.targetExam : 'NEET'
  );
  const [selectedSubject, setSelectedSubject] = useState<string>(
    searchParams.get('subjectCode') || ''
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');

  // Interactive attempt state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [attemptSubmitted, setAttemptSubmitted] = useState(false);
  const [attemptResult, setAttemptResult] = useState<any>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Active question bookmark state
  const [activeBookmarkCategory, setActiveBookmarkCategory] = useState<BookmarkCategory | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const subRes = await apiRequest<Subject[]>('/subjects');
        if (subRes.success) setSubjects(subRes.data);
      } catch (e) {
        console.error(e);
      }
    }
    init();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setCurrentIndex(0);
    setAttemptSubmitted(false);
    setSelectedOptionId(null);
    setAttemptResult(null);

    try {
      const params = new URLSearchParams();
      if (examType) params.append('examType', examType);
      if (selectedSubject) params.append('subjectCode', selectedSubject);
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty);

      const res = await apiRequest<Question[]>(`/pyq/questions?${params.toString()}`);
      if (res.success) {
        setQuestions(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [examType, selectedSubject, selectedDifficulty]);

  // Question practice stopwatch timer
  useEffect(() => {
    let interval: any = null;
    if (!attemptSubmitted && questions.length > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [attemptSubmitted, currentIndex, questions.length]);

  const currentQ = questions[currentIndex];

  const handleSubmitAttempt = async () => {
    if (!currentQ || !selectedOptionId) return;
    setSubmitting(true);

    try {
      const res = await apiRequest(`/pyq/questions/${currentQ.id}/attempt`, {
        method: 'POST',
        body: JSON.stringify({
          selectedOptionId,
          timeSpentSeconds: timerSeconds,
        }),
      });

      if (res.success) {
        setAttemptResult(res.data);
        setAttemptSubmitted(true);
        if (!res.data.isCorrect) {
          setActiveBookmarkCategory('MISTAKE');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setAttemptSubmitted(false);
      setAttemptResult(null);
      setTimerSeconds(0);
      setActiveBookmarkCategory(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSelectedOptionId(null);
      setAttemptSubmitted(false);
      setAttemptResult(null);
      setTimerSeconds(0);
      setActiveBookmarkCategory(null);
    }
  };

  const handleBookmarkToggle = async (category: BookmarkCategory) => {
    if (!currentQ) return;
    try {
      const res = await apiRequest('/bookmarks/toggle', {
        method: 'POST',
        body: JSON.stringify({
          questionId: currentQ.id,
          category,
        }),
      });
      if (res.success) {
        setActiveBookmarkCategory(res.data.bookmarked ? category : null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">PYQ Practice Engine</h1>
          <p className="text-xs text-slate-500 mt-1">
            Exam simulation with instant step-by-step solutions and tri-category mistake tagging.
          </p>
        </div>

        {/* Stopwatch */}
        <div className="flex items-center space-x-2 bg-slate-900 text-white px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold shadow-sm self-start sm:self-auto">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>
            {Math.floor(timerSeconds / 60)
              .toString()
              .padStart(2, '0')}
            :{(timerSeconds % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        {/* Exam Type */}
        <select
          value={examType}
          onChange={(e) => setExamType(e.target.value)}
          className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
        >
          <option value="NEET">NEET</option>
          <option value="JEE_MAIN">JEE Main</option>
          <option value="JEE_ADVANCED">JEE Advanced</option>
        </select>

        {/* Subject Filter */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
        >
          <option value="">All Subjects</option>
          {subjects.map((sub) => (
            <option key={sub.code} value={sub.code}>
              {sub.name}
            </option>
          ))}
        </select>

        {/* Difficulty */}
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
        >
          <option value="">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>

        <span className="text-xs text-slate-500 ml-auto font-medium">
          {questions.length} questions available
        </span>
      </div>

      {/* Main Question Display Box */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="p-16 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
          <p className="font-bold text-slate-700">No questions match the current filter criteria.</p>
          <button
            onClick={() => {
              setSelectedSubject('');
              setSelectedDifficulty('');
            }}
            className="text-xs text-[#4F46E5] font-semibold hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Question Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-100 text-[#4F46E5] text-xs font-bold px-2.5 py-1 rounded-md">
                {currentQ.examType} {currentQ.examYear}
              </span>
              <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md">
                {currentQ.subject?.name} • {currentQ.chapter?.title}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase">
                {currentQ.difficulty}
              </span>
            </div>

            {/* Tri-Category Bookmark Quick Action */}
            <div className="flex items-center space-x-1">
              <span className="text-[11px] text-slate-400 mr-1 font-medium">Bookmark:</span>
              <button
                onClick={() => handleBookmarkToggle('MISTAKE')}
                title="Tag as Mistake Question"
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                  activeBookmarkCategory === 'MISTAKE'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                Mistake
              </button>
              <button
                onClick={() => handleBookmarkToggle('REVISE_LATER')}
                title="Tag to Revise Later"
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                  activeBookmarkCategory === 'REVISE_LATER'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                Revise Later
              </button>
              <button
                onClick={() => handleBookmarkToggle('IMPORTANT')}
                title="Tag as Important Question"
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                  activeBookmarkCategory === 'IMPORTANT'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                Important
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="font-extrabold text-[#4F46E5] text-base">Q{currentIndex + 1}.</span>
              <p className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
                {currentQ.content}
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const isCorrectAnswer =
                attemptResult && attemptResult.correctOptionIds?.includes(opt.id);
              const isWrongSelection = attemptSubmitted && isSelected && !isCorrectAnswer;

              return (
                <button
                  key={opt.id}
                  disabled={attemptSubmitted}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-[#4F46E5] bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-200'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                  } ${
                    isCorrectAnswer
                      ? '!border-emerald-500 !bg-emerald-50 !text-emerald-950 font-bold'
                      : ''
                  } ${isWrongSelection ? '!border-rose-500 !bg-rose-50 !text-rose-950' : ''}`}
                >
                  <span className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {opt.label}
                    </span>
                    <span>{opt.content}</span>
                  </span>

                  {isCorrectAnswer && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Correct
                    </span>
                  )}
                  {isWrongSelection && (
                    <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                      Your Choice (Incorrect)
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div>
              {!attemptSubmitted ? (
                <button
                  disabled={!selectedOptionId || submitting}
                  onClick={handleSubmitAttempt}
                  className="bg-[#4F46E5] hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  {submitting ? 'Verifying...' : 'Submit & Check Answer'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-1.5"
                >
                  <span>Proceed to Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Detailed Step-by-Step Solution Box */}
          {attemptSubmitted && attemptResult && (
            <div
              className={`p-6 rounded-2xl border space-y-3 ${
                attemptResult.isCorrect
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-rose-50/40 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {attemptResult.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                  <h4 className="font-bold text-sm text-slate-900">
                    {attemptResult.isCorrect
                      ? `Correct! (+${attemptResult.marksAwarded} Marks)`
                      : `Incorrect (${attemptResult.marksAwarded} Marks). Review Solution:`}
                  </h4>
                </div>
              </div>

              {attemptResult.explanation && (
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-900">Step-by-Step Mechanism:</p>
                  <p>{attemptResult.explanation.content}</p>
                  {attemptResult.explanation.formula && (
                    <div className="p-2 rounded bg-indigo-50 text-[#4F46E5] font-mono text-[11px] font-bold">
                      Formula: {attemptResult.explanation.formula}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

