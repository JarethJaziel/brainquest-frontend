import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer(initialSeconds?: number, onTimeUp?: () => void) {
  const [timeLeft, setTimeLeft] = useState<number | undefined>(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<any>(null);

  const start = useCallback(() => {
    if (timeLeft === undefined || timeLeft > 0) {
      setIsRunning(true);
    }
  }, [timeLeft]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((newSeconds?: number) => {
    setIsRunning(false);
    setTimeLeft(newSeconds !== undefined ? newSeconds : initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isRunning && timeLeft !== undefined) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === undefined) return undefined;
          if (prev <= 1) {
            setIsRunning(false);
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            if (onTimeUp) {
              onTimeUp();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, onTimeUp, timeLeft]);

  return {
    timeLeft,
    isRunning,
    start,
    pause,
    reset,
  };
}

export default useTimer;
