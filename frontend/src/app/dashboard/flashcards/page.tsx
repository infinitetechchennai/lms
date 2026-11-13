'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { Flashcard, FlashcardFolder } from '@/types';
import {
  Layers,
  RotateCw,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  FolderPlus,
  Search,
  Sparkles,
  Mic,
  MicOff,
} from 'lucide-react';

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [folders, setFolders] = useState<FlashcardFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [typeAnswerMode, setTypeAnswerMode] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [loading, setLoading] = useState(true);

  // New Flashcard Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newHint, setNewHint] = useState('');
  const [isListening, setIsListening] = useState(false);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const url = selectedFolderId
        ? `/flashcards?folderId=${selectedFolderId}`
        : '/flashcards';
      const res = await apiRequest<{ folders: FlashcardFolder[]; flashcards: Flashcard[] }>(url);
      if (res.success) {
        setFlashcards(res.data.flashcards);
        setFolders(res.data.folders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [selectedFolderId]);

  const currentCard = flashcards[currentIndex];

  const handleReview = async (remembered: boolean) => {
    if (!currentCard) return;
    try {
      const res = await apiRequest(`/flashcards/${currentCard.id}/review`, {
        method: 'POST',
        body: JSON.stringify({ remembered }),
      });

      if (res.success) {
        // Move to next card
        if (currentIndex < flashcards.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setCurrentIndex(0);
        }
        setIsFlipped(false);
        setTypedAnswer('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront || !newBack) return;

    try {
      const res = await apiRequest('/flashcards', {
        method: 'POST',
        body: JSON.stringify({
          frontContent: newFront,
          backContent: newBack,
          hint: newHint || null,
          folderId: selectedFolderId || null,
        }),
      });

      if (res.success) {
        setCreateModalOpen(false);
        setNewFront('');
        setNewBack('');
        setNewHint('');
        fetchCards();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Voice-to-Text via Web Speech API
  const handleVoiceInput = () => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNewFront((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } else {
      alert('Web Speech API is not supported in this browser. Please use text input.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Interactive 3D Flashcards</h1>
          <p className="text-xs text-slate-500 mt-1">
            Spaced Repetition System (SRS) for long-term formula and definition retention.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center space-x-1.5 bg-[#4F46E5] hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Flashcard</span>
        </button>
      </div>

      {/* Folders Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedFolderId('')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
            selectedFolderId === ''
              ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5]'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Cards ({flashcards.length})
        </button>
        {folders.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFolderId(f.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
              selectedFolderId === f.id
                ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5]'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.name} ({f._count?.cards || 0})
          </button>
        ))}
      </div>

      {/* Card Practice Controls */}
      <div className="flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTypeAnswerMode(!typeAnswerMode)}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
              typeAnswerMode
                ? 'bg-indigo-100 text-[#4F46E5] border-indigo-200'
                : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            Type-Your-Answer Mode: {typeAnswerMode ? 'ON' : 'OFF'}
          </button>
        </div>

        {flashcards.length > 0 && (
          <span className="font-bold">
            Card {currentIndex + 1} of {flashcards.length}
          </span>
        )}
      </div>

      {/* 3D Flip Card Container */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading flashcards...</div>
      ) : flashcards.length === 0 ? (
        <div className="p-16 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
          <p className="font-bold text-slate-700">No flashcards found in this folder.</p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="text-xs font-semibold text-[#4F46E5] hover:underline"
          >
            Create your first flashcard now →
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* The Flip Card */}
          <div
            onClick={() => !typeAnswerMode && setIsFlipped(!isFlipped)}
            className={`w-full min-h-[320px] rounded-3xl p-8 sm:p-10 border transition-all cursor-pointer flex flex-col justify-between shadow-md relative ${
              isFlipped
                ? 'bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white border-indigo-700'
                : 'bg-white text-slate-900 border-slate-200 hover:border-indigo-400'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span
                className={`font-bold px-2.5 py-1 rounded-md uppercase tracking-wider text-[10px] ${
                  isFlipped ? 'bg-indigo-500/30 text-indigo-200' : 'bg-indigo-50 text-[#4F46E5]'
                }`}
              >
                {currentCard.folder?.name || 'General High-Yield'}
              </span>

              <div className="flex items-center space-x-1.5">
                <RotateCw className={`w-3.5 h-3.5 ${isFlipped ? 'text-indigo-300' : 'text-slate-400'}`} />
                <span className={`text-[11px] ${isFlipped ? 'text-indigo-300' : 'text-slate-400'}`}>
                  {isFlipped ? 'Answer Revealed' : 'Click to Flip'}
                </span>
              </div>
            </div>

            <div className="py-6 text-center max-w-2xl mx-auto space-y-3">
              {!isFlipped ? (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Question / Concept
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold leading-relaxed text-slate-900 mt-2">
                    {currentCard.frontContent}
                  </h3>
                  {currentCard.hint && (
                    <p className="text-xs text-slate-400 mt-2 italic">Hint: {currentCard.hint}</p>
                  )}
                </div>
              ) : (
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                    Answer & Explanation
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold leading-relaxed text-white mt-2 whitespace-pre-wrap">
                    {currentCard.backContent}
                  </h3>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] border-t pt-4 border-slate-100/20">
              <span className={isFlipped ? 'text-indigo-300' : 'text-slate-400'}>
                Mastery Level: {currentCard.masteryLevel} / 5
              </span>
              <span className={isFlipped ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                SRS Review Interval: {currentCard.masteryLevel * 2 + 1} Days
              </span>
            </div>
          </div>

          {/* Type-your-answer input if enabled */}
          {typeAnswerMode && !isFlipped && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <label className="block text-xs font-bold text-slate-700">Type Your Recall Answer:</label>
              <textarea
                rows={2}
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Type the formula or definition here before revealing answer..."
                className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
              <button
                onClick={() => setIsFlipped(true)}
                className="bg-[#4F46E5] hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all"
              >
                Reveal Answer & Check Recall
              </button>
            </div>
          )}

          {/* SRS Evaluation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => handleReview(false)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-6 py-3 rounded-xl text-xs border border-rose-200 transition-all"
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Not Remembered (Reset Interval)</span>
            </button>

            <button
              onClick={() => handleReview(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Remembered! (Advance Mastery)</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Flashcard Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Create New Flashcard</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Front (Concept / Question)</label>
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className="inline-flex items-center space-x-1 text-[11px] font-semibold text-[#4F46E5] hover:underline"
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3.5 h-3.5 text-rose-600" />
                        <span className="text-rose-600">Listening...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5" />
                        <span>Voice-to-Text</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  required
                  rows={2}
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="e.g. What is the phenotypic ratio in incomplete dominance?"
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#4F46E5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Back (Answer / Formula)
                </label>
                <textarea
                  required
                  rows={2}
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="e.g. 1 Red : 2 Pink : 1 White (1:2:1)"
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#4F46E5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Formula Hint (Optional)
                </label>
                <input
                  type="text"
                  value={newHint}
                  onChange={(e) => setNewHint(e.target.value)}
                  placeholder="e.g. Non-Mendelian ratio in Mirabilis jalapa"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#4F46E5] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
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
                  Save Flashcard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

