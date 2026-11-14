'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Video, Subject } from '@/types';
import UniversalVideoPlayer from '@/components/video/UniversalVideoPlayer';
import {
  Play,
  RotateCcw,
  Heart,
  BookOpen,
  HelpCircle,
  Eye,
  Sparkles,
  ArrowRight,
  Smartphone,
  Tv,
  Clock,
  Search,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export default function StudentVideosPage() {
  const [activeTab, setActiveTab] = useState<'REELS' | 'FULL'>('FULL');
  const [videos, setVideos] = useState<Video[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const typeParam = activeTab === 'REELS' ? 'SHORT' : 'FULL';
      const params = new URLSearchParams();
      params.append('videoType', typeParam);
      if (selectedSubject) params.append('subjectCode', selectedSubject);
      if (search) params.append('search', search);

      const [vidsRes, subsRes] = await Promise.all([
        apiRequest<Video[]>(`/videos?${params.toString()}`),
        apiRequest<Subject[]>('/subjects'),
      ]);

      if (vidsRes.success) {
        setVideos(vidsRes.data);
        setCurrentVideoIndex(0);
      }
      if (subsRes.success) {
        setSubjects(subsRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [activeTab, selectedSubject]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVideos();
  };

  const currentVideo = videos[currentVideoIndex];

  const handleToggleFavorite = async () => {
    if (!currentVideo) return;
    try {
      const res = await apiRequest(`/videos/${currentVideo.id}/favorite`, {
        method: 'POST',
      });
      if (res.success) {
        setVideos((prev) =>
          prev.map((v, i) =>
            i === currentVideoIndex ? { ...v, isFavorited: res.data.favorited } : v
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatDurationDisplay = (seconds: number) => {
    if (seconds >= 3600) {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hrs}h ${mins}m`;
    }
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Main Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {activeTab === 'FULL' ? 'Full-Length Video Lectures' : 'Micro-Concept Video Reels'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'FULL'
              ? 'In-depth comprehensive classroom lectures, chapter marathons, and derivation sessions for NEET & JEE.'
              : '30–90 second high-yield reels covering formulas, mnemonics, and problem-solving shortcuts.'}
          </p>
        </div>

        {/* Dual Mode Switcher: Full Video vs Reels */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit shrink-0 shadow-inner">
          <button
            onClick={() => setActiveTab('FULL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'FULL'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Full Lectures</span>
          </button>
          <button
            onClick={() => setActiveTab('REELS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'REELS'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Concept Reels</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Subject Filter Pills */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedSubject('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
              selectedSubject === ''
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Subjects
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.code}
              onClick={() => setSelectedSubject(sub.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                selectedSubject === sub.code
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lectures..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 focus:bg-white"
          />
        </form>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading videos...</div>
      ) : videos.length === 0 ? (
        <div className="p-16 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
          <p className="font-bold text-slate-700">No videos available in this category.</p>
          <p className="text-xs text-slate-500">
            Try switching subject filters or toggle between Full Lectures and Concept Reels.
          </p>
        </div>
      ) : activeTab === 'FULL' ? (
        /* ================= MODE 1: FULL-LENGTH LECTURES (16:9 THEATER) ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Video Theater Player */}
          <div className="lg:col-span-8 space-y-5">
            {currentVideo && (
              <>
                <UniversalVideoPlayer
                  key={currentVideo.id}
                  videoUrl={currentVideo.videoUrl}
                  thumbnailUrl={currentVideo.thumbnailUrl}
                  title={currentVideo.title}
                  aspectRatio="widescreen"
                  autoPlay={false}
                  showOverlayControls={true}
                />

                {/* Video Info Header */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-md text-xs">
                        {currentVideo.subject?.name}
                      </span>
                      {currentVideo.chapter && (
                        <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-md text-xs">
                          {currentVideo.chapter.title}
                        </span>
                      )}
                      <span className="flex items-center space-x-1 text-slate-500 text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDurationDisplay(currentVideo.durationSeconds)}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleToggleFavorite}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                          currentVideo.isFavorited
                            ? 'border-rose-300 bg-rose-50 text-rose-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            currentVideo.isFavorited ? 'fill-rose-600 text-rose-600' : ''
                          }`}
                        />
                        <span>{currentVideo.isFavorited ? 'Liked' : 'Like'}</span>
                      </button>
                      <div className="flex items-center space-x-1 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>{currentVideo.viewsCount.toLocaleString()} views</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
                      {currentVideo.title}
                    </h2>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                      {currentVideo.description}
                    </p>
                  </div>

                  {/* Connected Academic Assets */}
                  {currentVideo.chapter && (
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                      <Link
                        href={`/dashboard/notes?chapterId=${currentVideo.chapterId || ''}`}
                        className="inline-flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read Chapter Notes</span>
                      </Link>
                      <Link
                        href={`/dashboard/pyq?chapterId=${currentVideo.chapterId || ''}`}
                        className="inline-flex items-center space-x-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Practice Chapter PYQs</span>
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Playlist of Full Lectures */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                <span>Lecture Playlist ({videos.length})</span>
                <span className="text-[11px] text-slate-500 font-normal">Click to play</span>
              </h3>

              <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                {videos.map((vid, idx) => {
                  const isCurrent = idx === currentVideoIndex;
                  return (
                    <div
                      key={vid.id}
                      onClick={() => setCurrentVideoIndex(idx)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                        isCurrent
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="relative w-16 aspect-video bg-slate-900 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-white">
                        {vid.thumbnailUrl ? (
                          <img
                            src={vid.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Play className="w-4 h-4 fill-white" />
                        )}
                        <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-[9px] px-1 rounded font-semibold">
                          {formatDurationDisplay(vid.durationSeconds)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 mb-0.5">
                          <span className="font-bold text-indigo-700">
                            {vid.subject?.name}
                          </span>
                          <span>•</span>
                          <span>{vid.chapter?.title || 'Lecture'}</span>
                        </div>
                        <h4
                          className={`text-xs font-bold line-clamp-2 leading-snug ${
                            isCurrent ? 'text-indigo-900' : 'text-slate-800'
                          }`}
                        >
                          {vid.title}
                        </h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= MODE 2: MICRO-CONCEPT REELS (VERTICAL 9:16) ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Vertical Reel Player */}
          <div className="lg:col-span-6 flex justify-center">
            {currentVideo && (
              <div className="relative w-full max-w-[340px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 flex flex-col justify-between">
                {/* Universal Reel Player */}
                <UniversalVideoPlayer
                  key={currentVideo.id}
                  videoUrl={currentVideo.videoUrl}
                  thumbnailUrl={currentVideo.thumbnailUrl}
                  title={currentVideo.title}
                  aspectRatio="reel"
                  autoPlay={true}
                  showOverlayControls={false}
                />

                {/* Top Video Overlay */}
                <div className="absolute top-0 inset-x-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/30 to-transparent flex items-center justify-between text-white text-xs pointer-events-none">
                  <span className="bg-indigo-600 px-2 py-0.5 rounded font-bold text-[10px]">
                    {currentVideo.subject?.name}
                  </span>
                  <span className="text-[11px] text-slate-300">
                    {currentVideo.durationSeconds}s Reel
                  </span>
                </div>

                {/* Side Floating Action Controls */}
                <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center space-y-3 text-white">
                  <button
                    onClick={handleToggleFavorite}
                    className="p-2.5 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 transition-all flex flex-col items-center"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        currentVideo.isFavorited ? 'text-rose-500 fill-rose-500' : 'text-white'
                      }`}
                    />
                    <span className="text-[10px] mt-1">Like</span>
                  </button>

                  <button
                    onClick={() => {
                      if (currentVideoIndex < videos.length - 1) {
                        setCurrentVideoIndex((p) => p + 1);
                      } else {
                        setCurrentVideoIndex(0);
                      }
                    }}
                    className="p-2.5 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 transition-all flex flex-col items-center"
                    title="Next Reel"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                    <span className="text-[10px] mt-1">Next</span>
                  </button>
                </div>

                {/* Bottom Video Meta Overlay */}
                <div className="absolute bottom-0 inset-x-0 z-20 p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white space-y-1.5 pointer-events-none">
                  <h3 className="font-bold text-sm leading-snug">{currentVideo.title}</h3>
                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    {currentVideo.description}
                  </p>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-1">
                    <Eye className="w-3 h-3" />
                    <span>{currentVideo.viewsCount.toLocaleString()} views</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Playlist & Related Learning Assets */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900">Concept Reels Feed</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                {videos.map((vid, idx) => (
                  <div
                    key={vid.id}
                    onClick={() => setCurrentVideoIndex(idx)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      idx === currentVideoIndex
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-indigo-200 bg-white'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                      {vid.subject?.name}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                      {vid.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {vid.durationSeconds}s • {vid.viewsCount} views
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Related notes & questions */}
            {currentVideo?.chapter && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-900">Connected Chapter Materials</h3>
                <div className="space-y-2">
                  <Link
                    href={`/dashboard/notes?chapterId=${currentVideo.chapterId || ''}`}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <span>Read {currentVideo.chapter.title} Notes</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <Link
                    href={`/dashboard/pyq?chapterId=${currentVideo.chapterId || ''}`}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span>Solve Related PYQ Practice Drill</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
