import { useCallback, useEffect, useRef, useState } from 'react';
import type { PomodoroSettings } from '../types';

export type TimerMode = 'focus' | 'short-break' | 'long-break';

interface UsePomodoroTimerArgs {
  settings: PomodoroSettings;
  onFocusComplete: () => void;
}

const modeDurationSeconds = (mode: TimerMode, settings: PomodoroSettings): number => {
  switch (mode) {
    case 'focus':
      return settings.focusMinutes * 60;
    case 'short-break':
      return settings.shortBreakMinutes * 60;
    case 'long-break':
      return settings.longBreakMinutes * 60;
  }
};

const playChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.6);
    oscillator.onended = () => ctx.close();
  } catch {
    // Ignore environments without audio support.
  }
};

export const usePomodoroTimer = ({ settings, onFocusComplete }: UsePomodoroTimerArgs) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(modeDurationSeconds('focus', settings));
  const [completedFocusSessions, setCompletedFocusSessions] = useState(0);

  const endTimeRef = useRef<number | null>(null);
  const onFocusCompleteRef = useRef(onFocusComplete);
  onFocusCompleteRef.current = onFocusComplete;

  useEffect(() => {
    if (!isRunning) {
      setSecondsLeft(modeDurationSeconds(mode, settings));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, mode]);

  const advanceMode = useCallback((finishedMode: TimerMode) => {
    if (finishedMode === 'focus') {
      onFocusCompleteRef.current();
      setCompletedFocusSessions(prev => {
        const next = prev + 1;
        const nextMode: TimerMode = next % settings.sessionsBeforeLongBreak === 0 ? 'long-break' : 'short-break';
        setMode(nextMode);
        setSecondsLeft(modeDurationSeconds(nextMode, settings));
        return next;
      });
    } else {
      setMode('focus');
      setSecondsLeft(modeDurationSeconds('focus', settings));
    }
    setIsRunning(false);
    playChime();
  }, [settings]);

  useEffect(() => {
    if (!isRunning) return;
    endTimeRef.current = Date.now() + secondsLeft * 1000;

    const tick = () => {
      if (endTimeRef.current === null) return;
      const remaining = Math.round((endTimeRef.current - Date.now()) / 1000);
      if (remaining <= 0) {
        setSecondsLeft(0);
        advanceMode(mode);
      } else {
        setSecondsLeft(remaining);
      }
    };

    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSecondsLeft(modeDurationSeconds(mode, settings));
  }, [mode, settings]);

  const skip = useCallback(() => {
    advanceMode(mode);
  }, [mode, advanceMode]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setSecondsLeft(modeDurationSeconds(newMode, settings));
  }, [settings]);

  return {
    mode,
    isRunning,
    secondsLeft,
    totalSeconds: modeDurationSeconds(mode, settings),
    completedFocusSessions,
    start,
    pause,
    reset,
    skip,
    switchMode,
  };
};
