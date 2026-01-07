import { useState, useEffect, useCallback } from 'react';
import {
  getShabbatStatus,
  formatTimeUntil,
  formatShabbatTime,
  type ShabbatStatus,
} from '../utils/shabbatCalculator';

interface UseShabbatStatusReturn {
  isShabbat: boolean;
  status: ShabbatStatus;
  formattedTimeUntilEnd: string | null;
  formattedTimeUntilStart: string | null;
  formattedShabbatEndTime: string | null;
  formattedShabbatStartTime: string | null;
  refresh: () => void;
}

const UPDATE_INTERVAL_MS = 60000;

export function useShabbatStatus(): UseShabbatStatusReturn {
  const [status, setStatus] = useState<ShabbatStatus>(() => getShabbatStatus());

  const refresh = useCallback(() => {
    setStatus(getShabbatStatus());
  }, []);

  useEffect(() => {
    refresh();
    
    const intervalId = setInterval(refresh, UPDATE_INTERVAL_MS);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [refresh]);

  const formattedTimeUntilEnd = status.minutesUntilEnd !== null
    ? formatTimeUntil(status.minutesUntilEnd)
    : null;

  const formattedTimeUntilStart = status.minutesUntilStart !== null
    ? formatTimeUntil(status.minutesUntilStart)
    : null;

  const formattedShabbatEndTime = status.shabbatEnd
    ? formatShabbatTime(status.shabbatEnd)
    : null;

  const formattedShabbatStartTime = status.nextShabbatStart
    ? formatShabbatTime(status.nextShabbatStart)
    : null;

  return {
    isShabbat: status.isShabbat,
    status,
    formattedTimeUntilEnd,
    formattedTimeUntilStart,
    formattedShabbatEndTime,
    formattedShabbatStartTime,
    refresh,
  };
}

export function useShabbatLock(): {
  isLocked: boolean;
  lockMessage: string;
  unlockTime: string | null;
} {
  const { isShabbat, formattedTimeUntilEnd, formattedShabbatEndTime } = useShabbatStatus();

  const lockMessage = isShabbat
    ? 'The app is currently unavailable during Shabbat. Please try again after Havdalah.'
    : '';

  return {
    isLocked: isShabbat,
    lockMessage,
    unlockTime: isShabbat ? formattedShabbatEndTime : null,
  };
}
