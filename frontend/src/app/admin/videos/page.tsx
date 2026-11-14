'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest, uploadFile } from '@/lib/api';
import { Subject, Chapter } from '@/types';
import UniversalVideoPlayer from '@/components/video/UniversalVideoPlayer';
import {
  Video as VideoIcon,
  Plus,
  CheckCircle2,
  Trash2,
  Edit,
  Play,
  Search,
  Clock,
  ExternalLink,
  X,
  UploadCloud,
  Film,
  Smartphone,
  Tv,
} from 'lucide-react';

export default function AdminVideosPage() {
  const [tab, setTab] = useState<'LIST' | 'CREATE'>('LIST');
  const [videos, setVideos] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState('');

  // Create form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoType, setVideoType] = useState<'SHORT' | 'FULL'>('SHORT');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [durationSeconds, setDurationSeconds] = useState(35);
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<'LINK' | 'FILE'>('FILE');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Edit modal state
  const [editingVideo, setEditingVideo] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editVideoType, setEditVideoType] = useState<'SHORT' | 'FULL'>('SHORT');
  const [editDurationSeconds, setEditDurationSeconds] = useState(35);
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editThumbnailUrl, setEditThumbnailUrl] = useState('');

  // Preview player modal state
  const [previewVideo, setPreviewVideo] = useState<any | null>(null);

  // Search and Type filter
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SHORT' | 'FULL'>('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const [videosRes, subsRes] = await Promise.all([
        apiRequest<any[]>('/admin/videos-list'),
        apiRequest<Subject[]>('/subjects'),
      ]);

      if (videosRes.success) setVideos(videosRes.data);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMsg(null);
    try {
      const res = await uploadFile(file);
      if (res.success) {
        setVideoUrl(res.data.fileUrl);
        setUploadedFileName(file.name);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
        }
        setStatusMsg({ type: 'success', text: `Uploaded "${file.name}" successfully!` });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'File upload failed' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !title || !videoUrl) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const computedDuration =
        videoType === 'FULL' ? durationMinutes * 60 : durationSeconds;

      const res = await apiRequest('/admin/videos', {
        method: 'POST',
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          chapterId: selectedChapterId || null,
          title,
          description,
          videoType,
          durationSeconds: computedDuration,
          videoUrl,
          thumbnailUrl: thumbnailUrl || null,
        }),
      });

      if (res.success) {
        setStatusMsg({
          type: 'success',
          text: `${videoType === 'FULL' ? 'Full lecture' : 'Micro-video'} published successfully!`,
        });
        setTitle('');
        setDescription('');
        setVideoUrl('');
        setThumbnailUrl('');
        setUploadedFileName('');
        setTab('LIST');
        loadData();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to publish video' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (video: any) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditDescription(video.description || '');
    setEditVideoType(video.videoType || 'SHORT');
    setEditDurationSeconds(video.durationSeconds || 35);
    setEditVideoUrl(video.videoUrl);
    setEditThumbnailUrl(video.thumbnailUrl || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    setLoading(true);
    try {
      const res = await apiRequest(`/admin/videos/${editingVideo.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          videoType: editVideoType,
          durationSeconds: editDurationSeconds,
          videoUrl: editVideoUrl,
          thumbnailUrl: editThumbnailUrl || null,
        }),
      });

      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Video details updated successfully!' });
        setEditingVideo(null);
        loadData();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update video' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this video?')) return;

    try {
      const res = await apiRequest(`/admin/videos/${id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setVideos((prev) => prev.filter((v) => v.id !== id));
        setStatusMsg({ type: 'success', text: 'Video deleted from student feed.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete video' });
    }
  };

  const filteredVideos = videos.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.subject?.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.chapter?.title?.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      typeFilter === 'ALL' ||
      (typeFilter === 'SHORT' && (v.videoType === 'SHORT' || !v.videoType)) ||
      (typeFilter === 'FULL' && v.videoType === 'FULL');

    return matchesSearch && matchesType;
  });

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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Video Lecture & Reel Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload & publish both 30-90s Micro-Concept Reels and Full-Length Chapter Lectures (MP4 files or YouTube/Vimeo URLs).
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
            All Published Videos ({videos.length})
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
            <span>Upload New Video</span>
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
        /* TAB 1: ALL PUBLISHED VIDEOS TABLE */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, subject, or chapter..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* Video Type Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setTypeFilter('ALL')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  typeFilter === 'ALL'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter('SHORT')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 ${
                  typeFilter === 'SHORT'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>Short Reels</span>
              </button>
              <button
                onClick={() => setTypeFilter('FULL')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 ${
                  typeFilter === 'FULL'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Tv className="w-3 h-3" />
                <span>Full Lectures</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Video Title & Format</th>
                    <th className="px-5 py-3.5">Subject & Chapter</th>
                    <th className="px-5 py-3.5">Duration</th>
                    <th className="px-5 py-3.5">Views</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredVideos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400">
                        No videos match your search or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredVideos.map((video) => (
                      <tr key={video.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setPreviewVideo(video)}
                              className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 hover:bg-indigo-600 transition-colors shadow-sm group"
                              title="Play / Preview Video"
                            >
                              <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                            </button>
                            <div>
                              <p className="font-bold text-slate-900 leading-snug line-clamp-1">
                                {video.title}
                              </p>
                              <div className="flex items-center space-x-2 mt-0.5">
                                <span
                                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                    video.videoType === 'FULL'
                                      ? 'bg-purple-100 text-purple-700'
                                      : 'bg-indigo-100 text-indigo-700'
                                  }`}
                                >
                                  {video.videoType === 'FULL' ? (
                                    <>
                                      <Tv className="w-2.5 h-2.5" />
                                      <span>Full Lecture</span>
                                    </>
                                  ) : (
                                    <>
                                      <Smartphone className="w-2.5 h-2.5" />
                                      <span>Short Reel</span>
                                    </>
                                  )}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate max-w-[220px]">
                                  {video.videoUrl}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-slate-800">
                            {video.subject?.name || 'General'}
                          </span>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {video.chapter?.title || 'Standalone Topic'}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 font-medium">
                          <span className="flex items-center space-x-1 text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatDurationDisplay(video.durationSeconds)}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900">
                          {video.viewsCount.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setPreviewVideo(video)}
                              title="Play Video"
                              className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStartEdit(video)}
                              title="Edit Video"
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              title="Delete Video"
                              className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 2: CREATE / UPLOAD VIDEO FORM */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <form onSubmit={handleCreateVideo} className="space-y-5">
            {/* Step 1: Select Format (Short vs Full) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                1. Select Video Class Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setVideoType('SHORT')}
                  className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                    videoType === 'SHORT'
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-200'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900">
                      📱 Micro-Concept Reel (Short)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      30–90 second bite-sized capsule for key tricks, mnemonic rules, and formulas.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVideoType('FULL')}
                  className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                    videoType === 'FULL'
                      ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-200'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Tv className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900">
                      🎬 Full-Length Lecture (Full Video)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Comprehensive 10–120 minute full chapter class with derivations and problem sets.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Subject & Chapter */}
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
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="">-- Standalone (No Specific Chapter) --</option>
                  {chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Video Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  videoType === 'FULL'
                    ? 'e.g. Current Electricity Full Lecture: Kirchhoff & Potentiometer Masterclass'
                    : 'e.g. 30-Sec Hack: Solve Dihybrid Cross Ratios Instantly'
                }
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description & Learning Objectives
              </label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key concepts, formula shortcuts, and topics taught in this video..."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* Step 3: Video Source - Upload File or Paste Link */}
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Video Source: Upload File or Provide Link
                </label>
                <div className="flex bg-white border border-slate-200 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setUploadMode('FILE')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      uploadMode === 'FILE'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Direct Upload (.mp4/.webm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('LINK')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      uploadMode === 'LINK'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Paste Link (YouTube/MP4)
                  </button>
                </div>
              </div>

              {uploadMode === 'FILE' ? (
                <div>
                  <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-white rounded-xl cursor-pointer transition-all">
                    <UploadCloud className="w-8 h-8 text-indigo-500 mb-2" />
                    <span className="text-xs font-bold text-slate-700">
                      {isUploading
                        ? 'Uploading video file to server...'
                        : uploadedFileName
                        ? `Selected: ${uploadedFileName}`
                        : 'Click to select video file (.mp4, .webm, .mkv)'}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      Max file size: 250MB (Uploads directly to your platform storage)
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      disabled={isUploading}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {videoUrl && (
                    <p className="text-[11px] text-emerald-700 font-semibold mt-2 truncate">
                      ✓ Ready: {videoUrl}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    required
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://.../video.mp4"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supports YouTube videos, YouTube Shorts, Vimeo, and direct MP4/WebM video links.
                  </p>
                </div>
              )}
            </div>

            {/* Duration Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videoType === 'SHORT' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration in Seconds (15–90s)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={120}
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lecture Duration in Minutes (10–180m)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thumbnail Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... (Cover image)"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading || isUploading || !videoUrl}
                className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {loading
                    ? 'Publishing...'
                    : videoType === 'FULL'
                    ? 'Publish Full Lecture'
                    : 'Publish Micro-Video'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">Edit Video Details</h3>
              <button
                onClick={() => setEditingVideo(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Video Format
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditVideoType('SHORT')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                      editVideoType === 'SHORT'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Short Reel
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditVideoType('FULL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                      editVideoType === 'FULL'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Full Lecture
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Video Title
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Video URL
                  </label>
                  <input
                    type="text"
                    required
                    value={editVideoUrl}
                    onChange={(e) => setEditVideoUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration (Total Seconds)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={14400}
                    value={editDurationSeconds}
                    onChange={(e) => setEditDurationSeconds(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thumbnail URL (Optional)
                </label>
                <input
                  type="url"
                  value={editThumbnailUrl}
                  onChange={(e) => setEditThumbnailUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
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

      {/* UNIVERSAL VIDEO PREVIEW MODAL */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className={`relative bg-black rounded-3xl overflow-hidden shadow-2xl ${
              previewVideo.videoType === 'SHORT'
                ? 'max-w-sm w-full aspect-[9/16]'
                : 'max-w-3xl w-full aspect-video'
            }`}
          >
            <button
              onClick={() => setPreviewVideo(null)}
              className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <UniversalVideoPlayer
              videoUrl={previewVideo.videoUrl}
              thumbnailUrl={previewVideo.thumbnailUrl}
              title={previewVideo.title}
              aspectRatio={previewVideo.videoType === 'SHORT' ? 'reel' : 'widescreen'}
              autoPlay={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
