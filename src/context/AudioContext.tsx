import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Howl } from 'howler';
import { SOUNDS } from '../config/constants';

interface AudioContextType {
  soundEnabled: boolean;
  volume: number;
  toggleSound: () => void;
  setVolume: (vol: number) => void;
  playClick: () => void;
  playCorrect: () => void;
  playIncorrect: () => void;
  playComplete: () => void;
  playStar: () => void;
  playLevelUp: () => void;
  playAchievement: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const raw = localStorage.getItem('brainquest_sound_enabled');
    return raw !== null ? JSON.parse(raw) : true;
  });

  const [volume, setVolumeState] = useState(() => {
    const raw = localStorage.getItem('brainquest_volume');
    return raw !== null ? JSON.parse(raw) : 0.8;
  });

  const [sounds, setSounds] = useState<Record<string, Howl>>({});

  // Initialize sounds
  useEffect(() => {
    const loadedSounds: Record<string, Howl> = {};
    Object.entries(SOUNDS).forEach(([key, path]) => {
      loadedSounds[key] = new Howl({
        src: [path],
        volume: volume,
        preload: true,
      });
    });
    setSounds(loadedSounds);

    return () => {
      Object.values(loadedSounds).forEach(s => s.unload());
    };
  }, []);

  // Sync volume change to Howl instances
  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    localStorage.setItem('brainquest_volume', JSON.stringify(vol));
    Object.values(sounds).forEach(s => s.volume(vol));
  }, [sounds]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev: boolean) => {
      const next = !prev;
      localStorage.setItem('brainquest_sound_enabled', JSON.stringify(next));
      return next;
    });
  }, []);

  const playSound = useCallback((name: keyof typeof SOUNDS) => {
    if (!soundEnabled) return;
    const sound = sounds[name];
    if (sound) {
      try {
        sound.stop();
        sound.play();
      } catch (err) {
        console.warn(`Could not play sound ${name}:`, err);
      }
    }
  }, [sounds, soundEnabled]);

  const playClick = useCallback(() => playSound('CLICK'), [playSound]);
  const playCorrect = useCallback(() => playSound('CORRECT'), [playSound]);
  const playIncorrect = useCallback(() => playSound('INCORRECT'), [playSound]);
  const playComplete = useCallback(() => playSound('COMPLETE'), [playSound]);
  const playStar = useCallback(() => playSound('STAR'), [playSound]);
  const playLevelUp = useCallback(() => playSound('LEVEL_UP'), [playSound]);
  const playAchievement = useCallback(() => playSound('ACHIEVEMENT'), [playSound]);

  return (
    <AudioContext.Provider
      value={{
        soundEnabled,
        volume,
        toggleSound,
        setVolume,
        playClick,
        playCorrect,
        playIncorrect,
        playComplete,
        playStar,
        playLevelUp,
        playAchievement,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
