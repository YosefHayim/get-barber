import {
  getShabbatTimes,
  isCurrentlyShabbat,
  getShabbatStatus,
  formatTimeUntil,
  formatShabbatTime,
  TEL_AVIV_LOCATION,
} from '@/features/shabbat/utils/shabbatCalculator';

describe('shabbatCalculator', () => {
  describe('formatTimeUntil', () => {
    it('formats minutes under 60', () => {
      expect(formatTimeUntil(30)).toBe('30 minutes');
      expect(formatTimeUntil(1)).toBe('1 minute');
      expect(formatTimeUntil(59)).toBe('59 minutes');
    });

    it('formats exact hours', () => {
      expect(formatTimeUntil(60)).toBe('1 hour');
      expect(formatTimeUntil(120)).toBe('2 hours');
      expect(formatTimeUntil(180)).toBe('3 hours');
    });

    it('formats hours with remaining minutes', () => {
      expect(formatTimeUntil(90)).toBe('1h 30m');
      expect(formatTimeUntil(150)).toBe('2h 30m');
      expect(formatTimeUntil(75)).toBe('1h 15m');
    });

    it('formats exact days', () => {
      expect(formatTimeUntil(24 * 60)).toBe('1 day');
      expect(formatTimeUntil(48 * 60)).toBe('2 days');
    });

    it('formats days with remaining hours', () => {
      expect(formatTimeUntil(24 * 60 + 60)).toBe('1d 1h');
      expect(formatTimeUntil(48 * 60 + 120)).toBe('2d 2h');
    });
  });

  describe('formatShabbatTime', () => {
    it('formats time in 24-hour Hebrew format', () => {
      const date = new Date('2025-01-10T17:30:00');
      const formatted = formatShabbatTime(date);
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it('handles midnight', () => {
      const date = new Date('2025-01-10T00:00:00');
      const formatted = formatShabbatTime(date);
      expect(formatted).toMatch(/00:00/);
    });

    it('handles noon', () => {
      const date = new Date('2025-01-10T12:00:00');
      const formatted = formatShabbatTime(date);
      expect(formatted).toMatch(/12:00/);
    });
  });

  describe('getShabbatTimes', () => {
    it('returns candleLighting and havdalah times', () => {
      const times = getShabbatTimes(new Date('2025-01-08T12:00:00'), TEL_AVIV_LOCATION);
      
      expect(times.candleLighting).toBeInstanceOf(Date);
      expect(times.havdalah).toBeInstanceOf(Date);
      expect(times.havdalah.getTime()).toBeGreaterThan(times.candleLighting.getTime());
    });

    it('candle lighting is on Friday', () => {
      const wednesday = new Date('2025-01-08T12:00:00');
      const times = getShabbatTimes(wednesday, TEL_AVIV_LOCATION);
      
      expect(times.candleLighting.getDay()).toBe(5);
    });

    it('havdalah is on Saturday', () => {
      const wednesday = new Date('2025-01-08T12:00:00');
      const times = getShabbatTimes(wednesday, TEL_AVIV_LOCATION);
      
      expect(times.havdalah.getDay()).toBe(6);
    });

    it('havdalah is approximately 24+ hours after candle lighting', () => {
      const times = getShabbatTimes(new Date('2025-01-08T12:00:00'), TEL_AVIV_LOCATION);
      
      const diffHours = (times.havdalah.getTime() - times.candleLighting.getTime()) / (1000 * 60 * 60);
      expect(diffHours).toBeGreaterThanOrEqual(24);
      expect(diffHours).toBeLessThan(26);
    });

    it('returns same Shabbat times when called on Friday', () => {
      const friday = new Date('2025-01-10T10:00:00');
      const times = getShabbatTimes(friday, TEL_AVIV_LOCATION);
      
      expect(times.candleLighting.toDateString()).toBe(friday.toDateString());
    });

    it('returns next Shabbat times when called on Saturday', () => {
      const saturday = new Date('2025-01-11T10:00:00');
      const times = getShabbatTimes(saturday, TEL_AVIV_LOCATION);
      
      const nextFriday = new Date('2025-01-17');
      expect(times.candleLighting.toDateString()).toBe(nextFriday.toDateString());
    });
  });

  describe('isCurrentlyShabbat', () => {
    it('returns false on a regular Wednesday', () => {
      const wednesday = new Date('2025-01-08T12:00:00');
      expect(isCurrentlyShabbat(wednesday, TEL_AVIV_LOCATION)).toBe(false);
    });

    it('returns false on Friday morning before candle lighting', () => {
      const fridayMorning = new Date('2025-01-10T10:00:00');
      expect(isCurrentlyShabbat(fridayMorning, TEL_AVIV_LOCATION)).toBe(false);
    });

    it('returns true on Friday evening after candle lighting', () => {
      const times = getShabbatTimes(new Date('2025-01-10T12:00:00'), TEL_AVIV_LOCATION);
      const afterCandleLighting = new Date(times.candleLighting.getTime() + 60 * 60 * 1000);
      
      expect(isCurrentlyShabbat(afterCandleLighting, TEL_AVIV_LOCATION)).toBe(true);
    });

    it('returns true on Saturday during Shabbat', () => {
      const times = getShabbatTimes(new Date('2025-01-10T12:00:00'), TEL_AVIV_LOCATION);
      const saturdayNoon = new Date(times.candleLighting.getTime() + 18 * 60 * 60 * 1000);
      
      expect(isCurrentlyShabbat(saturdayNoon, TEL_AVIV_LOCATION)).toBe(true);
    });

    it('returns false on Saturday night after havdalah', () => {
      const times = getShabbatTimes(new Date('2025-01-10T12:00:00'), TEL_AVIV_LOCATION);
      const afterHavdalah = new Date(times.havdalah.getTime() + 2 * 60 * 60 * 1000);
      
      expect(isCurrentlyShabbat(afterHavdalah, TEL_AVIV_LOCATION)).toBe(false);
    });
  });

  describe('getShabbatStatus', () => {
    it('returns correct status when not Shabbat', () => {
      const wednesday = new Date('2025-01-08T12:00:00');
      const status = getShabbatStatus(wednesday, TEL_AVIV_LOCATION);
      
      expect(status.isShabbat).toBe(false);
      expect(status.nextShabbatStart).toBeInstanceOf(Date);
      expect(status.shabbatEnd).toBeNull();
      expect(status.minutesUntilStart).toBeGreaterThan(0);
      expect(status.minutesUntilEnd).toBeNull();
    });

    it('returns correct status during Shabbat', () => {
      const times = getShabbatTimes(new Date('2025-01-10T12:00:00'), TEL_AVIV_LOCATION);
      const duringShabbat = new Date(times.candleLighting.getTime() + 60 * 60 * 1000);
      const status = getShabbatStatus(duringShabbat, TEL_AVIV_LOCATION);
      
      expect(status.isShabbat).toBe(true);
      expect(status.nextShabbatStart).toBeNull();
      expect(status.shabbatEnd).toBeInstanceOf(Date);
      expect(status.minutesUntilStart).toBeNull();
      expect(status.minutesUntilEnd).toBeGreaterThan(0);
    });

    it('returns currentTime in status', () => {
      const testDate = new Date('2025-01-08T12:00:00');
      const status = getShabbatStatus(testDate, TEL_AVIV_LOCATION);
      
      expect(status.currentTime.getTime()).toBe(testDate.getTime());
    });

    it('minutesUntilEnd is never negative', () => {
      const times = getShabbatTimes(new Date('2025-01-10T12:00:00'), TEL_AVIV_LOCATION);
      const nearHavdalah = new Date(times.havdalah.getTime() - 5 * 60 * 1000);
      const status = getShabbatStatus(nearHavdalah, TEL_AVIV_LOCATION);
      
      expect(status.minutesUntilEnd).toBeGreaterThanOrEqual(0);
    });

    it('minutesUntilStart is never negative', () => {
      const times = getShabbatTimes(new Date('2025-01-10T12:00:00'), TEL_AVIV_LOCATION);
      const nearCandleLighting = new Date(times.candleLighting.getTime() - 5 * 60 * 1000);
      const status = getShabbatStatus(nearCandleLighting, TEL_AVIV_LOCATION);
      
      expect(status.minutesUntilStart).toBeGreaterThanOrEqual(0);
    });
  });
});
