import React, { useRef, useState, useEffect } from 'react';
import type { AudioQuestion } from '../../../models/question-types';
import type { QuestionRendererProps } from './index';
import QuestionRenderer from '../components/QuestionRenderer';
import MaterialIcon from '../../../components/ui/MaterialIcon';

export const AudioQuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  selectedAnswer,
  disabled,
  showFeedback,
}) => {
  const q = question as AudioQuestion;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playCount, setPlayCount] = useState(0);

  // Auto-play support
  useEffect(() => {
    if (q.autoPlay && audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setPlayCount(1);
          })
          .catch(() => {
            // Autoplay blocked by browser policy
            console.log('Autoplay blocked by browser policy. User action required.');
          });
      }
    }
  }, [q.autoPlay, q.audioUrl]);

  // Audio events
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Check playCount constraint
      if (q.maxPlays && playCount >= q.maxPlays && !isPlaying) {
        return;
      }
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
          // Increment playCount only when starting new play
          if (currentTime === 0) {
            setPlayCount(prev => prev + 1);
          }
        }).catch(err => {
          console.error('Playback failed', err);
        });
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const isPlayDisabled = disabled || (q.maxPlays ? (playCount >= q.maxPlays && !isPlaying) : false);

  return (
    <div className="flex flex-col gap-6">
      {/* Audio Player Container */}
      <div className="w-full bg-surface-container-low border-2 border-solid border-outline-variant p-4 rounded-3xl clay-card select-none flex flex-col gap-4">
        <audio
          ref={audioRef}
          src={q.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
        />

        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <button
            type="button"
            disabled={isPlayDisabled}
            onClick={togglePlay}
            className={`
              w-14 h-14 rounded-full border-2 border-solid flex items-center justify-center transition-all cursor-pointer shrink-0
              ${isPlaying
                ? 'bg-primary text-white border-primary shadow-[0_4px_0_0_#2b35a3]'
                : isPlayDisabled
                  ? 'bg-outline-variant border-outline-variant text-outline/40 cursor-not-allowed shadow-none'
                  : 'bg-primary-container text-primary border-primary/20 hover:scale-105 active:translate-y-1 active:shadow-none shadow-[0_4px_0_0_#3d4ad8]'
              }
            `}
          >
            <MaterialIcon name={isPlaying ? 'pause' : 'play_arrow'} className="text-3xl font-black" />
          </button>

          {/* Player controls */}
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-black text-outline">
              <span>Escucha con atención</span>
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>

            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleProgressChange}
              disabled={disabled}
              className="w-full h-2 rounded-full accent-primary bg-outline-variant cursor-pointer outline-none"
            />
          </div>

          {/* Soundwave or Plays Badge */}
          <div className="flex flex-col items-center gap-1 min-w-[70px]">
            {isPlaying ? (
              <div className="flex items-end gap-1 h-6">
                <div className="w-1.5 bg-primary rounded-full soundwave-bar" style={{ animationDelay: '0.1s' }} />
                <div className="w-1.5 bg-primary rounded-full soundwave-bar" style={{ animationDelay: '0.3s' }} />
                <div className="w-1.5 bg-primary rounded-full soundwave-bar" style={{ animationDelay: '0.2s' }} />
              </div>
            ) : q.maxPlays ? (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border border-solid ${playCount >= q.maxPlays ? 'bg-red-50 text-red-600 border-red-200' : 'bg-primary/5 text-primary border-primary/20'}`}>
                {playCount}/{q.maxPlays} Repr.
              </span>
            ) : (
              <MaterialIcon name="volume_up" className="text-2xl text-outline-variant" />
            )}
          </div>
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

export default AudioQuestionRenderer;
