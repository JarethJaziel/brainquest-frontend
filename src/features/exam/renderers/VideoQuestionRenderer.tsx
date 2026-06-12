import React, { useRef, useState, useEffect } from 'react';
import type { VideoQuestion } from '../../../models/question-types';
import type { QuestionRendererProps } from './index';
import QuestionRenderer from '../components/QuestionRenderer';
import MaterialIcon from '../../../components/ui/MaterialIcon';

export const VideoQuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  selectedAnswer,
  disabled,
  showFeedback,
}) => {
  const q = question as VideoQuestion;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasPausedAtTriggered, setHasPausedAtTriggered] = useState(false);

  // Reset trigger state when question changes
  useEffect(() => {
    setHasPausedAtTriggered(false);
  }, [q.id]);

  // Handle autoPlay on mount
  useEffect(() => {
    if (q.autoPlay && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => console.log('Autoplay blocked by browser policy.'));
      }
    }
  }, [q.autoPlay, q.videoUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(err => console.error('Video playback failed', err));
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Check pauseAt trigger
    if (q.pauseAt && time >= q.pauseAt && !hasPausedAtTriggered) {
      videoRef.current.pause();
      setIsPlaying(false);
      setHasPausedAtTriggered(true);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      // If rewinding before pauseAt, reset trigger
      if (q.pauseAt && newTime < q.pauseAt) {
        setHasPausedAtTriggered(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Video Player Box */}
      <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border-4 border-solid border-outline-variant bg-black shadow-lg aspect-video select-none group">
        <video
          ref={videoRef}
          src={q.videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleVideoEnded}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer"
        />

        {/* Big play button overlay when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-200">
            <button
              onClick={togglePlay}
              disabled={disabled}
              className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center border-3 border-solid border-white hover:scale-110 active:scale-95 transition-all shadow-2xl cursor-pointer"
            >
              <MaterialIcon name="play_arrow" className="text-5xl translate-x-0.5" />
            </button>
          </div>
        )}

        {/* pauseAt notification overlay */}
        {hasPausedAtTriggered && !isPlaying && q.pauseAt && currentTime >= q.pauseAt && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500 border-2 border-solid border-white text-white px-4 py-2 rounded-full font-black text-sm flex items-center gap-2 shadow-xl animate-bounce">
            <MaterialIcon name="warning" filled />
            <span>¡Pausa! Responde la pregunta abajo</span>
          </div>
        )}

        {/* Video Custom Control Bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-250">
          <button
            onClick={togglePlay}
            disabled={disabled}
            className="text-white hover:text-primary transition-colors cursor-pointer"
          >
            <MaterialIcon name={isPlaying ? 'pause' : 'play_arrow'} className="text-3xl" />
          </button>

          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleProgressChange}
            disabled={disabled}
            className="flex-1 h-1.5 rounded-full accent-primary bg-white/30 cursor-pointer outline-none hover:h-2 transition-all"
          />

          <span className="text-white text-xs font-bold whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="border-t-2 border-dashed border-outline-variant/60 pt-4 mt-2">
        <QuestionRenderer
          question={q.innerQuestion}
          onAnswer={onAnswer}
          selectedAnswer={selectedAnswer}
          disabled={disabled}
          showFeedback={showFeedback}
        />
      </div>
    </div>
  );
};

export default VideoQuestionRenderer;
