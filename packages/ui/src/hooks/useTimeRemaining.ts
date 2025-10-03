'use client';

import { useEffect, useState } from 'react';

export interface TimeRemainingResult {
  timeRemaining: number;
  isExpired: boolean;
  formattedTime: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Hook para calcular tempo restante até uma data específica
 *
 * @param targetDate - Data alvo como string ISO ou Date object
 * @returns {TimeRemainingResult} Objeto com tempo restante formatado
 *
 * @example
 * ```
 * function Countdown({ expiresAt }: { expiresAt: string }) {
 *   const { formattedTime, isExpired } = useTimeRemaining(expiresAt);
 *
 *   if (isExpired) {
 *     return <span className="text-error">Expired!</span>;
 *   }
 *
 *   return <span className="text-warning">{formattedTime}</span>;
 * }
 * ```
 */
export function useTimeRemaining(
  targetDate: string | Date
): TimeRemainingResult {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const updateTimer = (): void => {
      const now = new Date().getTime();
      const remaining = Math.max(0, target - now);
      setTimeRemaining(remaining);
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const isExpired = timeRemaining <= 0;

  // Calculate time units
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  // Format time string
  const formatTime = (): string => {
    if (isExpired) return '00:00:00';

    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    timeRemaining,
    isExpired,
    formattedTime: formatTime(),
    days,
    hours,
    minutes,
    seconds,
  };
}
