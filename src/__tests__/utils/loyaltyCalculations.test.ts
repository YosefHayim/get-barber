import {
  calculateLoyaltyTier,
  calculatePointsEarned,
  calculateNextTierProgress,
  formatCurrency,
  isValidIsraeliPhone,
  formatIsraeliPhone,
} from '../__helpers__/testUtils';
import { LOYALTY_TIER_INFO, POINTS_CONFIG } from '@/types/loyalty.types';

describe('Loyalty System Calculations', () => {
  describe('calculateLoyaltyTier', () => {
    it('returns bronze for new users', () => {
      expect(calculateLoyaltyTier(0, 0)).toBe('bronze');
      expect(calculateLoyaltyTier(5, 50000)).toBe('bronze');
    });

    it('returns silver when meeting silver requirements', () => {
      expect(calculateLoyaltyTier(10, 200000)).toBe('silver');
      expect(calculateLoyaltyTier(15, 300000)).toBe('silver');
    });

    it('returns gold when meeting gold requirements', () => {
      expect(calculateLoyaltyTier(25, 500000)).toBe('gold');
      expect(calculateLoyaltyTier(35, 700000)).toBe('gold');
    });

    it('returns platinum when meeting platinum requirements', () => {
      expect(calculateLoyaltyTier(50, 1000000)).toBe('platinum');
      expect(calculateLoyaltyTier(100, 2000000)).toBe('platinum');
    });

    it('requires both bookings AND spend for tier upgrade', () => {
      expect(calculateLoyaltyTier(50, 100000)).toBe('bronze');
      expect(calculateLoyaltyTier(5, 1000000)).toBe('bronze');
    });
  });

  describe('calculatePointsEarned', () => {
    it('calculates bronze tier points (1x multiplier)', () => {
      expect(calculatePointsEarned(6000, 'bronze')).toBe(6);
      expect(calculatePointsEarned(10000, 'bronze')).toBe(10);
    });

    it('calculates silver tier points (1.25x multiplier)', () => {
      expect(calculatePointsEarned(8000, 'silver')).toBe(10);
      expect(calculatePointsEarned(10000, 'silver')).toBe(12);
    });

    it('calculates gold tier points (1.5x multiplier)', () => {
      expect(calculatePointsEarned(10000, 'gold')).toBe(15);
      expect(calculatePointsEarned(6000, 'gold')).toBe(9);
    });

    it('calculates platinum tier points (2x multiplier)', () => {
      expect(calculatePointsEarned(10000, 'platinum')).toBe(20);
      expect(calculatePointsEarned(5000, 'platinum')).toBe(10);
    });

    it('rounds down partial points', () => {
      expect(calculatePointsEarned(1500, 'bronze')).toBe(1);
      expect(calculatePointsEarned(3333, 'gold')).toBe(4);
    });
  });

  describe('calculateNextTierProgress', () => {
    it('returns 100% progress for platinum users', () => {
      const progress = calculateNextTierProgress('platinum', 100, 2000000);
      expect(progress.progress).toBe(100);
      expect(progress.bookingsNeeded).toBe(0);
      expect(progress.spendNeeded).toBe(0);
    });

    it('calculates progress to silver', () => {
      const progress = calculateNextTierProgress('bronze', 5, 100000);
      expect(progress.bookingsNeeded).toBe(5);
      expect(progress.spendNeeded).toBe(100000);
      expect(progress.progress).toBe(50);
    });

    it('calculates progress to gold', () => {
      const progress = calculateNextTierProgress('silver', 15, 400000);
      expect(progress.bookingsNeeded).toBe(10);
      expect(progress.spendNeeded).toBe(100000);
      expect(progress.progress).toBe(60);
    });

    it('uses minimum progress between bookings and spend', () => {
      const progress = calculateNextTierProgress('bronze', 8, 50000);
      expect(progress.progress).toBe(25);
    });

    it('caps progress at 100%', () => {
      const progress = calculateNextTierProgress('bronze', 20, 300000);
      expect(progress.progress).toBeLessThanOrEqual(100);
    });
  });

  describe('LOYALTY_TIER_INFO constants', () => {
    it('has correct tier order', () => {
      const tiers = Object.keys(LOYALTY_TIER_INFO);
      expect(tiers).toContain('bronze');
      expect(tiers).toContain('silver');
      expect(tiers).toContain('gold');
      expect(tiers).toContain('platinum');
    });

    it('has increasing points multipliers', () => {
      expect(LOYALTY_TIER_INFO.bronze.pointsMultiplier).toBe(1);
      expect(LOYALTY_TIER_INFO.silver.pointsMultiplier).toBeGreaterThan(LOYALTY_TIER_INFO.bronze.pointsMultiplier);
      expect(LOYALTY_TIER_INFO.gold.pointsMultiplier).toBeGreaterThan(LOYALTY_TIER_INFO.silver.pointsMultiplier);
      expect(LOYALTY_TIER_INFO.platinum.pointsMultiplier).toBeGreaterThan(LOYALTY_TIER_INFO.gold.pointsMultiplier);
    });

    it('has increasing requirements', () => {
      expect(LOYALTY_TIER_INFO.bronze.minBookings).toBe(0);
      expect(LOYALTY_TIER_INFO.silver.minBookings).toBeGreaterThan(LOYALTY_TIER_INFO.bronze.minBookings);
      expect(LOYALTY_TIER_INFO.gold.minBookings).toBeGreaterThan(LOYALTY_TIER_INFO.silver.minBookings);
      expect(LOYALTY_TIER_INFO.platinum.minBookings).toBeGreaterThan(LOYALTY_TIER_INFO.gold.minBookings);
    });

    it('each tier has benefits', () => {
      expect(LOYALTY_TIER_INFO.bronze.benefits.length).toBeGreaterThan(0);
      expect(LOYALTY_TIER_INFO.silver.benefits.length).toBeGreaterThan(0);
      expect(LOYALTY_TIER_INFO.gold.benefits.length).toBeGreaterThan(0);
      expect(LOYALTY_TIER_INFO.platinum.benefits.length).toBeGreaterThan(0);
    });
  });

  describe('POINTS_CONFIG constants', () => {
    it('has positive point values', () => {
      expect(POINTS_CONFIG.pointsPerShekel).toBeGreaterThan(0);
      expect(POINTS_CONFIG.pointsPerReview).toBeGreaterThan(0);
      expect(POINTS_CONFIG.pointsPerReferral).toBeGreaterThan(0);
    });

    it('has meaningful referral bonus', () => {
      expect(POINTS_CONFIG.pointsPerReferral).toBeGreaterThan(POINTS_CONFIG.pointsPerReview);
    });
  });
});

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('formats ILS amounts with shekel symbol', () => {
      expect(formatCurrency(50)).toBe('₪50');
      expect(formatCurrency(100)).toBe('₪100');
      expect(formatCurrency(0)).toBe('₪0');
    });

    it('rounds ILS amounts to whole numbers', () => {
      expect(formatCurrency(50.5)).toBe('₪51');
      expect(formatCurrency(99.99)).toBe('₪100');
    });

    it('formats other currencies with symbol', () => {
      expect(formatCurrency(100, 'USD')).toBe('USD 100.00');
      expect(formatCurrency(50, 'EUR')).toBe('EUR 50.00');
    });
  });

  describe('isValidIsraeliPhone', () => {
    it('validates correct Israeli mobile numbers', () => {
      expect(isValidIsraeliPhone('0501234567')).toBe(true);
      expect(isValidIsraeliPhone('+972501234567')).toBe(true);
      expect(isValidIsraeliPhone('972501234567')).toBe(true);
      expect(isValidIsraeliPhone('050-123-4567')).toBe(true);
      expect(isValidIsraeliPhone('+972-50-123-4567')).toBe(true);
    });

    it('validates different mobile prefixes', () => {
      expect(isValidIsraeliPhone('0521234567')).toBe(true);
      expect(isValidIsraeliPhone('0531234567')).toBe(true);
      expect(isValidIsraeliPhone('0541234567')).toBe(true);
      expect(isValidIsraeliPhone('0551234567')).toBe(true);
      expect(isValidIsraeliPhone('0581234567')).toBe(true);
    });

    it('rejects invalid numbers', () => {
      expect(isValidIsraeliPhone('12345')).toBe(false);
      expect(isValidIsraeliPhone('0401234567')).toBe(false);
      expect(isValidIsraeliPhone('050123456')).toBe(false);
      expect(isValidIsraeliPhone('05012345678')).toBe(false);
      expect(isValidIsraeliPhone('')).toBe(false);
    });
  });

  describe('formatIsraeliPhone', () => {
    it('formats phone numbers to standard format', () => {
      expect(formatIsraeliPhone('0501234567')).toBe('+972-50-123-4567');
      expect(formatIsraeliPhone('972501234567')).toBe('+972-50-123-4567');
      expect(formatIsraeliPhone('+972501234567')).toBe('+972-50-123-4567');
    });

    it('returns original if invalid', () => {
      expect(formatIsraeliPhone('invalid')).toBe('invalid');
      expect(formatIsraeliPhone('12345')).toBe('12345');
    });
  });
});
