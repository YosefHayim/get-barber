import { act } from '@testing-library/react-native';

export const waitForNextTick = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

export const flushPromises = async () => {
  await act(async () => {
    await waitForNextTick();
  });
};

export const createDateAtTime = (
  year: number,
  month: number,
  day: number,
  hours: number = 0,
  minutes: number = 0,
  timezone: string = 'Asia/Jerusalem'
): Date => {
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  return new Date(dateStr);
};

export const createFridayEvening = (hour: number = 18): Date => {
  const now = new Date();
  const currentDay = now.getDay();
  const daysUntilFriday = (5 - currentDay + 7) % 7;
  const friday = new Date(now);
  friday.setDate(friday.getDate() + daysUntilFriday);
  friday.setHours(hour, 0, 0, 0);
  return friday;
};

export const createSaturdayMorning = (hour: number = 10): Date => {
  const friday = createFridayEvening();
  const saturday = new Date(friday);
  saturday.setDate(saturday.getDate() + 1);
  saturday.setHours(hour, 0, 0, 0);
  return saturday;
};

export const mockConsole = () => {
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  beforeAll(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
    console.log = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
    console.warn = originalWarn;
    console.log = originalLog;
  });

  return {
    getErrors: () => (console.error as jest.Mock).mock.calls,
    getWarnings: () => (console.warn as jest.Mock).mock.calls,
    getLogs: () => (console.log as jest.Mock).mock.calls,
  };
};

export const formatCurrency = (amount: number, currency: string = 'ILS'): string => {
  if (currency === 'ILS') {
    return `₪${amount.toFixed(0)}`;
  }
  return `${currency} ${amount.toFixed(2)}`;
};

export const calculateLoyaltyTier = (
  bookings: number,
  spendCents: number
): 'bronze' | 'silver' | 'gold' | 'platinum' => {
  if (bookings >= 50 && spendCents >= 1000000) return 'platinum';
  if (bookings >= 25 && spendCents >= 500000) return 'gold';
  if (bookings >= 10 && spendCents >= 200000) return 'silver';
  return 'bronze';
};

export const calculatePointsEarned = (
  amountCents: number,
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
): number => {
  const multipliers = {
    bronze: 1,
    silver: 1.25,
    gold: 1.5,
    platinum: 2,
  };
  const basePoints = Math.floor(amountCents / 1000);
  return Math.floor(basePoints * multipliers[tier]);
};

export const calculateNextTierProgress = (
  currentTier: 'bronze' | 'silver' | 'gold' | 'platinum',
  bookings: number,
  spendCents: number
): { bookingsNeeded: number; spendNeeded: number; progress: number } => {
  const tierRequirements = {
    bronze: { bookings: 0, spendCents: 0 },
    silver: { bookings: 10, spendCents: 200000 },
    gold: { bookings: 25, spendCents: 500000 },
    platinum: { bookings: 50, spendCents: 1000000 },
  };

  const tierOrder: Array<'bronze' | 'silver' | 'gold' | 'platinum'> = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tierOrder.indexOf(currentTier);

  if (currentIndex === tierOrder.length - 1) {
    return { bookingsNeeded: 0, spendNeeded: 0, progress: 100 };
  }

  const nextTier = tierOrder[currentIndex + 1];
  const requirements = tierRequirements[nextTier];
  const bookingsNeeded = Math.max(0, requirements.bookings - bookings);
  const spendNeeded = Math.max(0, requirements.spendCents - spendCents);

  const bookingProgress = Math.min(100, (bookings / requirements.bookings) * 100);
  const spendProgress = Math.min(100, (spendCents / requirements.spendCents) * 100);
  const progress = Math.min(bookingProgress, spendProgress);

  return { bookingsNeeded, spendNeeded, progress };
};

export const isValidIsraeliPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s-]/g, '');
  const israeliMobileRegex = /^(\+972|972|0)?(5[0-9])[0-9]{7}$/;
  return israeliMobileRegex.test(cleaned);
};

export const formatIsraeliPhone = (phone: string): string => {
  const cleaned = phone.replace(/[\s-]/g, '');
  const match = cleaned.match(/^(\+972|972|0)?(5[0-9])([0-9]{3})([0-9]{4})$/);
  if (!match) return phone;
  return `+972-${match[2]}-${match[3]}-${match[4]}`;
};
