'use client';

import React, { useState, useRef, useEffect } from 'react';
import { resolveMediaUrl } from '@/lib/api';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface UniversalVideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string | null;
  title?: string;
  aspectRatio?: 'reel' | 'widescreen'; // reel = 9:16, widescreen = 16:9
  autoPlay?: boolean;
  showOverlayControls?: boolean;
  className?: string;
  onEnded?: () => void;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

function extractVimeoId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
  return match ? match[1] : null;
}

export default function UniversalVideoPlayer({
  videoUrl,
  thumbnailUrl,
  title,
  aspectRatio = 'widescreen',
  autoPlay = false,
  showOverlayControls = true,
  className = '',
  onEnded,
}: UniversalVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(autoPlay); // Start muted on autoplay so browser doesn't block it
  const [hasError, setHasError] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  const resolvedUrl = resolveMediaUrl(videoUrl);
  const youtubeId = extractYouTubeId(videoUrl);
  const vimeoId = extractVimeoId(videoUrl);

  // Reset error when url changes
  useEffect(() => {
    setHasError(false);
    setIsPlaying(autoPlay);
  }, [videoUrl, autoPlay]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // If browser blocked unmuted autoplay, mute and retry
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().then(() => setIsPlaying(true));
          }
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = parseFloat(e.target.value);
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // If YouTube video
  if (youtubeId) {
    return (
      <div
        className={`relative overflow-hidden bg-black rounded-2xl shadow-lg ${
          aspectRatio === 'reel' ? 'aspect-[9/16] max-w-[340px] mx-auto' : 'aspect-video w-full'
        } ${className}`}
      >
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=${
            autoPlay ? 1 : 0
          }&rel=0&modestbranding=1&enablejsapi=1`}
          title={title || 'Smartway Video Player'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    );
  }

  // If Vimeo video
  if (vimeoId) {
    return (
      <div
        className={`relative overflow-hidden bg-black rounded-2xl shadow-lg ${
          aspectRatio === 'reel' ? 'aspect-[9/16] max-w-[340px] mx-auto' : 'aspect-video w-full'
        } ${className}`}
      >
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=${autoPlay ? 1 : 0}&dnt=1`}
          title={title || 'Smartway Video Player'}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    );
  }

  // HTML5 Video Element for direct files, MP4, WebM, and local uploads
  return (
    <div
      className={`group relative overflow-hidden bg-black rounded-2xl shadow-xl flex items-center justify-center ${
        aspectRatio === 'reel' ? 'aspect-[9/16] max-w-[340px] mx-auto' : 'aspect-video w-full'
      } ${className}`}
    >
      {hasError ? (
        <div className="p-6 text-center text-white space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <p className="text-xs font-bold text-rose-200">Unable to stream video file directly</p>
          <p className="text-[11px] text-slate-300 max-w-xs mx-auto">
            The media link might require direct access or an alternate browser codec.
          </p>
          <a
            href={resolvedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 bg-white/20 hover:bg-white/30 text-white text-xs px-3.5 py-1.5 rounded-lg transition-colors"
          >
            <span>Open Direct Media URL</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={resolvedUrl}
            poster={thumbnailUrl || undefined}
            playsInline
            muted={isMuted}
            autoPlay={autoPlay}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => {
              setIsPlaying(false);
              if (onEnded) onEnded();
            }}
            onError={() => setHasError(true)}
            onClick={togglePlay}
            className={`w-full h-full cursor-pointer ${
              aspectRatio === 'reel' ? 'object-cover' : 'object-contain bg-black'
            }`}
          />

          {/* Mute indicator banner if muted during autoplay */}
          {isMuted && isPlaying && (
            <button
              onClick={toggleMute}
              className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 hover:bg-black/80 transition-colors"
            >
              <VolumeX className="w-3.5 h-3.5 text-amber-400" />
              <span>Tap to unmute</span>
            </button>
          )}

          {/* Custom Overlay Controls for Widescreen mode */}
          {showOverlayControls && aspectRatio === 'widescreen' && (
            <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 transition-opacity duration-200 opacity-90 group-hover:opacity-100 flex flex-col space-y-2">
              {/* Progress Bar */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/30 accent-indigo-500 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between text-white text-xs">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <span className="text-[11px] text-slate-300">
                    {formatSeconds(currentTime)} / {formatSeconds(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleFullscreen}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

