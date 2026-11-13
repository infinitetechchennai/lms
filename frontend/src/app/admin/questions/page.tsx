'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Subject, Chapter } from '@/types';
import {
  HelpCircle,
  Plus,
  Upload,
  Download,
  CheckCircle2,
  Trash2,
  Edit,
  Search,
  Filter,
  X,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

export default function AdminQuestionsPage() {
  const [tab, setTab] = useState<'LIST' | 'MANUAL' | 'CSV'>('LIST');
  const [questions, setQuestions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState('');

  // Manual Question state
  const [content, setContent] = useState('');
  const [examType, setExamType] = useState('NEET');
  const [examYear, setExamYear] = useState(2023);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('B');
  const [explanation, setExplanation] = useState('');
  const [formula, setFormula] = useState('');

  // CSV Bulk Import state
  const [csvContent, setCsvContent] = useState('');
  const [bulkResult, setBulkResult] = useState<string | null>(null);

  // Edit Modal state
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editExamType, setEditExamType] = useState('NEET');
  const [editExamYear, setEditExamYear] = useState(2023);
  const [editDifficulty, setEditDifficulty] = useState('MEDIUM');
  const [editOptions, setEditOptions] = useState<any[]>([]);
  const [editExplanation, setEditExplanation] = useState('');
  const [editFormula, setEditFormula] = useState('');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterExam, setFilterExam] = useState('ALL');

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [questionsRes, subsRes] = await Promise.all([
        apiRequest<any[]>('/admin/questions-list'),
        apiRequest<Subject[]>('/subjects'),
      ]);

      if (questionsRes.success) setQuestions(questionsRes.data);
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

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapterId || !content || !optionA || !optionB) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await apiRequest('/admin/questions', {
        method: 'POST',
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          chapterId: selectedChapterId,
          content,
          examType,
          examYear,
          difficulty,
          marks: 4,
          negativeMarks: 1,
          options: [
            { label: 'A', content: optionA, isCorrect: correctOption === 'A' },
            { label: 'B', content: optionB, isCorrect: correctOption === 'B' },
            { label: 'C', content: optionC, isCorrect: correctOption === 'C' },
            { label: 'D', content: optionD, isCorrect: correctOption === 'D' },
          ],
          explanation: {
            content: explanation,
            formula: formula || null,
          },
        }),
      });

      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Question added to practice bank successfully!' });
        setContent('');
        setOptionA('');
        setOptionB('');
        setOptionC('');
        setOptionD('');
        setExplanation('');
        setFormula('');
        setTab('LIST');
        loadData();
      }
    } catch (e: any) {
      setStatusMsg({ type: 'error', text: e.message || 'Failed to add question' });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = async () => {
    if (!csvContent) return;
    setLoading(true);
    setBulkResult(null);

    try {
      const lines = csvContent.trim().split('\n');
      const parsedQuestions = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts.length >= 7) {
          parsedQuestions.push({
            subjectId: selectedSubjectId,
            chapterId: selectedChapterId,
            content: parts[0],
            optionA: parts[1],
            optionB: parts[2],
            optionC: parts[3],
            optionD: parts[4],
            correctOption: parts[5].toUpperCase(),
            explanation: parts[6] || '',
            examType,
            examYear,
          });
        }
      }

      const res = await apiRequest('/admin/questions/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ questions: parsedQuestions }),
      });

      if (res.success) {
        setBulkResult(`Success: ${res.data.importedCount} questions successfully imported.`);
        setCsvContent('');
        loadData();
      }
    } catch (err: any) {
      setBulkResult(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const csvHeader =
      'QuestionText,OptionA,OptionB,OptionC,OptionD,CorrectOption,Explanation\n"What is the power dissipated in a resistor R with current I?","I*R","I^2*R","V/I","R/I","B","Power P = I^2 * R derived from Joule heating"';
    const blob = new Blob([csvHeader], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smartway_pyq_template.csv';
    a.click();
  };

  const handleStartEdit = (q: any) => {
    setEditingQuestion(q);
    setEditContent(q.content);
    setEditExamType(q.examType || 'NEET');
    setEditExamYear(q.examYear || 2023);
    setEditDifficulty(q.difficulty || 'MEDIUM');
    setEditOptions(q.options || []);
    setEditExplanation(q.explanation?.content || '');
    setEditFormula(q.explanation?.formula || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    setLoading(true);
    try {
      const res = await apiRequest(`/admin/questions/${editingQuestion.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          content: editContent,
          examType: editExamType,
          examYear: editExamYear,
          difficulty: editDifficulty,
          options: editOptions,
          explanation: {
            content: editExplanation,
            formula: editFormula || null,
          },
        }),
      });

      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Question updated successfully!' });
        setEditingQuestion(null);
        loadData();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update question' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this PYQ question?')) return;

    try {
      const res = await apiRequest(`/admin/questions/${id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        setStatusMsg({ type: 'success', text: 'Question removed from question bank.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete question' });
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.content.toLowerCase().includes(search.toLowerCase()) ||
      q.chapter?.title?.toLowerCase().includes(search.toLowerCase()) ||
      q.subject?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesSubject = filterSubject === 'ALL' || q.subject?.code === filterSubject;
    const matchesExam = filterExam === 'ALL' || q.examType === filterExam;

    return matchesSearch && matchesSubject && matchesExam;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">PYQ Question Bank Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse published questions, edit options and solutions, delete duplicates, or author new items.
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
            Question Bank ({questions.length})
          </button>
          <button
            onClick={() => setTab('MANUAL')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 ${
              tab === 'MANUAL'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual Entry</span>
          </button>
          <button
            onClick={() => setTab('CSV')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 ${
              tab === 'CSV'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk CSV Import</span>
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
        /* TAB 1: ALL QUESTIONS LIST WITH SEARCH & FILTERS */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions by text or chapter..."
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
                value={filterExam}
                onChange={(e) => setFilterExam(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="ALL">All Exams</option>
                <option value="NEET">NEET</option>
                <option value="JEE_MAIN">JEE Main</option>
                <option value="JEE_ADVANCED">JEE Advanced</option>
              </select>

              <span className="text-xs text-slate-500 font-medium shrink-0 ml-2">
                Showing {filteredQuestions.length}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
                No questions found matching your search and filter criteria.
              </div>
            ) : (
              filteredQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-md text-[10px]">
                          {q.examType} {q.examYear}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md text-[10px]">
                          {q.subject?.name}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 font-medium rounded-md text-[10px]">
                          {q.chapter?.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            q.difficulty === 'EASY'
                              ? 'bg-emerald-50 text-emerald-700'
                              : q.difficulty === 'HARD'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900 text-xs sm:text-sm pt-1">
                        {q.content}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(q)}
                        title="Edit Question"
                        className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        title="Delete Question"
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 4 Choices */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options?.map((opt: any) => (
                      <div
                        key={opt.id || opt.label}
                        className={`px-3 py-2 rounded-xl text-xs flex items-center space-x-2 border ${
                          opt.isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            opt.isCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {opt.label}
                        </span>
                        <span className="line-clamp-2">{opt.content}</span>
                      </div>
                    ))}
                  </div>

                  {/* Explanation Preview */}
                  {q.explanation && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                      <span className="font-bold text-slate-800">Official Explanation:</span>{' '}
                      {q.explanation.content}
                      {q.explanation.formula && (
                        <div className="font-mono text-indigo-700 font-semibold pt-1">
                          Key formula: {q.explanation.formula}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : tab === 'MANUAL' ? (
        /* TAB 2: MANUAL QUESTION ENTRY */
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Select Subject & Chapter Hierarchy
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Subject
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Chapter
                </label>
                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Exam Track
                </label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="NEET">NEET</option>
                  <option value="JEE_MAIN">JEE Main</option>
                  <option value="JEE_ADVANCED">JEE Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Exam Year
                </label>
                <input
                  type="number"
                  value={examYear}
                  onChange={(e) => setExamYear(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Question Problem Text
                </label>
                <textarea
                  required
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type the full question prompt or clinical case scenario..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* 4 Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {['A', 'B', 'C', 'D'].map((label) => (
                  <div
                    key={label}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Option {label}</span>
                      <label className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="correctChoice"
                          checked={correctOption === label}
                          onChange={() => setCorrectOption(label as any)}
                          className="text-emerald-600"
                        />
                        <span className="text-[11px] text-emerald-700">Correct Answer</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      value={
                        label === 'A'
                          ? optionA
                          : label === 'B'
                          ? optionB
                          : label === 'C'
                          ? optionC
                          : optionD
                      }
                      onChange={(e) => {
                        if (label === 'A') setOptionA(e.target.value);
                        if (label === 'B') setOptionB(e.target.value);
                        if (label === 'C') setOptionC(e.target.value);
                        if (label === 'D') setOptionD(e.target.value);
                      }}
                      placeholder={`Option ${label} answer text`}
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                ))}
              </div>

              {/* Explanation & Formula */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detailed Step-by-Step Explanation
                  </label>
                  <textarea
                    rows={3}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Explain why the option is correct, citing NCERT chapter/page or physical mechanism..."
                    className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Key Formula / Shortcut
                  </label>
                  <input
                    type="text"
                    value={formula}
                    onChange={(e) => setFormula(e.target.value)}
                    placeholder="e.g. R' = R * (L'/L)^2"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{loading ? 'Adding...' : 'Add Question'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* TAB 3: CSV BULK IMPORTER */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Bulk CSV Upload Engine</h3>
              <p className="text-xs text-slate-500">
                Paste comma-separated rows or download template
              </p>
            </div>

            <button
              onClick={downloadSampleTemplate}
              className="inline-flex items-center space-x-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {bulkResult && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                bulkResult.startsWith('Success')
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{bulkResult}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Paste CSV Content (with headers: QuestionText, OptionA, OptionB, OptionC, OptionD,
              CorrectOption, Explanation)
            </label>
            <textarea
              rows={8}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="QuestionText,OptionA,OptionB,OptionC,OptionD,CorrectOption,Explanation"
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleBulkImport}
              disabled={loading || !csvContent}
              className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>{loading ? 'Importing Questions...' : 'Import CSV Callset'}</span>
            </button>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">Edit PYQ Question Details</h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Exam Type
                  </label>
                  <select
                    value={editExamType}
                    onChange={(e) => setEditExamType(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="NEET">NEET</option>
                    <option value="JEE_MAIN">JEE Main</option>
                    <option value="JEE_ADVANCED">JEE Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Exam Year
                  </label>
                  <input
                    type="number"
                    value={editExamYear}
                    onChange={(e) => setEditExamYear(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={editDifficulty}
                    onChange={(e) => setEditDifficulty(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Question Prompt Text
                </label>
                <textarea
                  rows={3}
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Edit Options */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Multiple Choice Options
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {editOptions.map((opt, idx) => (
                    <div
                      key={opt.id || idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Option {opt.label}</span>
                        <label className="flex items-center space-x-1 cursor-pointer">
                          <input
                            type="radio"
                            name="editCorrectOption"
                            checked={opt.isCorrect}
                            onChange={() => {
                              setEditOptions((prev) =>
                                prev.map((o, i) => ({
                                  ...o,
                                  isCorrect: i === idx,
                                }))
                              );
                            }}
                            className="text-emerald-600"
                          />
                          <span className="text-[11px] text-emerald-700">Correct</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={opt.content}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditOptions((prev) =>
                            prev.map((o, i) => (i === idx ? { ...o, content: val } : o))
                          );
                        }}
                        className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit Explanation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Explanation
                </label>
                <textarea
                  rows={2}
                  value={editExplanation}
                  onChange={(e) => setEditExplanation(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Formula / Shortcut
                </label>
                <input
                  type="text"
                  value={editFormula}
                  onChange={(e) => setEditFormula(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
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
