'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Video, Subject } from '@/types';
import {
  Play,
  Pause,
  RotateCcw,
  Heart,
  BookOpen,
  HelpCircle,
  Eye,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function ShortVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const url = selectedSubject ? `/videos?subjectCode=${selectedSubject}` : '/videos';
      const [vidsRes, subsRes] = await Promise.all([
        apiRequest<Video[]>(url),
        apiRequest<Subject[]>('/subjects'),
      ]);

      if (vidsRes.success) {
        setVideos(vidsRes.data);
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
  }, [selectedSubject]);

  const currentVideo = videos[currentVideoIndex];

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Micro-Concept Video Reels
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            30–40 second high-yield capsules covering essential formulas, tricks, and mechanisms.
          </p>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex space-x-2 overflow-x-auto pb-1">
          <button
            onClick={() => {
              setSelectedSubject('');
              setCurrentVideoIndex(0);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedSubject === ''
                ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5]'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            All
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.code}
              onClick={() => {
                setSelectedSubject(sub.code);
                setCurrentVideoIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                selectedSubject === sub.code
                  ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading micro-videos...</div>
      ) : videos.length === 0 ? (
        <div className="p-16 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
          <p className="font-bold text-slate-700">No videos available in this category yet.</p>
          <p className="text-xs text-slate-500">Select another subject to watch concept capsules.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Vertical Video Player Reel (Phone/Feed ratio) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[340px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 flex flex-col justify-between">
              {/* HTML5 Video element */}
              <video
                ref={videoRef}
                src={currentVideo.videoUrl}
                poster={currentVideo.thumbnailUrl || undefined}
                autoPlay
                playsInline
                loop
                onClick={togglePlay}
                className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              />

              {/* Top Video Overlay */}
              <div className="relative z-10 p-4 bg-gradient-to-b from-black/80 via-black/30 to-transparent flex items-center justify-between text-white text-xs">
                <span className="bg-[#4F46E5] px-2 py-0.5 rounded font-bold text-[10px]">
                  {currentVideo.subject?.name}
                </span>
                <span className="text-[11px] text-slate-300">
                  {currentVideo.durationSeconds}s Capsule
                </span>
              </div>

              {/* Side Floating Action Controls */}
              <div className="relative z-10 self-end p-4 flex flex-col items-center space-y-4 text-white">
                <button
                  onClick={handleToggleFavorite}
                  className="p-2.5 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all flex flex-col items-center"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      currentVideo.isFavorited ? 'text-rose-500 fill-rose-500' : 'text-white'
                    }`}
                  />
                  <span className="text-[10px] mt-1">Like</span>
                </button>

                <button
                  onClick={handleReplay}
                  className="p-2.5 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all flex flex-col items-center"
                >
                  <RotateCcw className="w-5 h-5 text-white" />
                  <span className="text-[10px] mt-1">Replay</span>
                </button>

                <button
                  onClick={togglePlay}
                  className="p-2.5 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all flex flex-col items-center"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <span className="text-[10px] mt-1">{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
              </div>

              {/* Bottom Video Meta Overlay */}
              <div className="relative z-10 p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white space-y-2">
                <h3 className="font-bold text-sm leading-snug">{currentVideo.title}</h3>
                <p className="text-[11px] text-slate-300 line-clamp-2">
                  {currentVideo.description}
                </p>
                <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-1">
                  <Eye className="w-3 h-3" />
                  <span>{currentVideo.viewsCount} views</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Playlist & Related Learning Assets */}
          <div className="lg:col-span-6 space-y-6">
            {/* Reel Navigation */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">Micro-Reels Queue</h3>
                <span className="text-xs font-semibold text-slate-500">
                  {currentVideoIndex + 1} of {videos.length}
                </span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {videos.map((vid, idx) => (
                  <button
                    key={vid.id}
                    onClick={() => {
                      setCurrentVideoIndex(idx);
                      setIsPlaying(true);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                      idx === currentVideoIndex
                        ? 'border-[#4F46E5] bg-indigo-50 font-bold text-indigo-950'
                        : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="truncate">{vid.title}</span>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                      {vid.durationSeconds}s
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Related Educational Assets Linked to this Video */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#4F46E5]" />
                <span>Connected Learning Material</span>
              </h3>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#4F46E5]">
                    <BookOpen className="w-4 h-4" />
                    <span>Associated High-Yield Notes</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Deepen your understanding with comprehensive diagrams and NCERT references.
                  </p>
                  <Link
                    href={`/dashboard/notes?chapterId=${currentVideo.chapterId || ''}`}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-[#4F46E5] hover:underline"
                  >
                    <span>Open related summary note</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-600">
                    <HelpCircle className="w-4 h-4" />
                    <span>Practice Connected PYQs</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Apply this 30-second trick on real NEET/JEE previous year questions.
                  </p>
                  <Link
                    href={`/dashboard/pyq?chapterId=${currentVideo.chapterId || ''}`}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-700 hover:underline"
                  >
                    <span>Practice topic questions</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

