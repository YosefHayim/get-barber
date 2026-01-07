import { act } from '@testing-library/react-native';
import { useBookingStore } from '@/stores/useBookingStore';
import { useAppStore } from '@/stores/useAppStore';
import { useUserStore } from '@/stores/useUserStore';
import {
  createMockService,
  createMockLocationWithAccuracy,
  resetIdCounter,
  createMockBooking,
} from '../__helpers__';
import {
  calculatePointsEarned,
  calculateLoyaltyTier,
} from '../__helpers__/testUtils';

describe('Customer Booking Flow', () => {
  beforeEach(() => {
    resetIdCounter();
    act(() => {
      useBookingStore.setState({
        activeRequestId: null,
        selectedServices: [],
        selectedBarber: null,
        isBottomSheetOpen: false,
        bottomSheetSnapIndex: 0,
      });
      useAppStore.setState({
        userMode: 'customer',
        isBarberOnline: false,
        hasCompletedOnboarding: true,
      });
      useUserStore.setState({
        currentLocation: null,
        savedAddresses: [],
        preferredLanguage: 'he',
      });
    });
  });

  describe('Scenario: Customer selects services and requests a barber', () => {
    it('should allow customer to select multiple services', () => {
      const haircut = createMockService({ id: 'svc-haircut', name: 'Haircut', base_price: 60 });
      const beardTrim = createMockService({ id: 'svc-beard', name: 'Beard Trim', base_price: 35 });

      act(() => {
        useBookingStore.getState().addService(haircut);
        useBookingStore.getState().addService(beardTrim);
      });

      const { selectedServices } = useBookingStore.getState();
      expect(selectedServices).toHaveLength(2);
      expect(selectedServices.map(s => s.name)).toContain('Haircut');
      expect(selectedServices.map(s => s.name)).toContain('Beard Trim');
    });

    it('should calculate correct total price', () => {
      const haircut = createMockService({ id: 'svc-1', name: 'Haircut', base_price: 60 });
      const beardTrim = createMockService({ id: 'svc-2', name: 'Beard Trim', base_price: 35 });
      const shave = createMockService({ id: 'svc-3', name: 'Hot Towel Shave', base_price: 50 });

      act(() => {
        useBookingStore.getState().addService(haircut);
        useBookingStore.getState().addService(beardTrim);
        useBookingStore.getState().addService(shave);
      });

      const total = useBookingStore.getState().selectedServices.reduce(
        (sum, s) => sum + s.base_price,
        0
      );
      expect(total).toBe(145);
    });

    it('should set customer location before requesting', () => {
      const location = createMockLocationWithAccuracy({
        latitude: 32.0853,
        longitude: 34.7818,
      });

      act(() => {
        useUserStore.getState().setCurrentLocation(location);
      });

      const { currentLocation } = useUserStore.getState();
      expect(currentLocation).not.toBeNull();
      expect(currentLocation?.latitude).toBe(32.0853);
    });

    it('should create active request after selecting barber', () => {
      const barber = {
        id: 'barber-1',
        user_id: 'user-1',
        display_name: 'Yossi Cohen',
        avatar_url: null,
        bio: 'Master barber',
        rating: 4.9,
        total_reviews: 328,
        is_verified: true,
        distance_meters: 450,
        price_min: 60,
        price_max: 150,
      };

      act(() => {
        useBookingStore.getState().setSelectedBarber(barber);
        useBookingStore.getState().setActiveRequestId('request-123');
      });

      expect(useBookingStore.getState().selectedBarber?.display_name).toBe('Yossi Cohen');
      expect(useBookingStore.getState().activeRequestId).toBe('request-123');
    });
  });

  describe('Scenario: Customer modifies service selection', () => {
    it('should allow removing services from selection', () => {
      const haircut = createMockService({ id: 'svc-1', name: 'Haircut', base_price: 60 });
      const beardTrim = createMockService({ id: 'svc-2', name: 'Beard Trim', base_price: 35 });

      act(() => {
        useBookingStore.getState().addService(haircut);
        useBookingStore.getState().addService(beardTrim);
        useBookingStore.getState().removeService('svc-1');
      });

      expect(useBookingStore.getState().selectedServices).toHaveLength(1);
      expect(useBookingStore.getState().selectedServices[0].name).toBe('Beard Trim');
    });

    it('should not add duplicate services', () => {
      const haircut = createMockService({ id: 'svc-1', name: 'Haircut', base_price: 60 });

      act(() => {
        useBookingStore.getState().addService(haircut);
        useBookingStore.getState().addService(haircut);
        useBookingStore.getState().addService(haircut);
      });

      expect(useBookingStore.getState().selectedServices).toHaveLength(1);
    });

    it('should clear all services at once', () => {
      const haircut = createMockService({ id: 'svc-1', base_price: 60 });
      const beardTrim = createMockService({ id: 'svc-2', base_price: 35 });
      const shave = createMockService({ id: 'svc-3', base_price: 50 });

      act(() => {
        useBookingStore.getState().addService(haircut);
        useBookingStore.getState().addService(beardTrim);
        useBookingStore.getState().addService(shave);
        useBookingStore.getState().clearServices();
      });

      expect(useBookingStore.getState().selectedServices).toHaveLength(0);
    });
  });

  describe('Scenario: Customer cancels booking', () => {
    it('should reset all booking state when cancelled', () => {
      const haircut = createMockService({ id: 'svc-1', base_price: 60 });
      const barber = {
        id: 'barber-1',
        user_id: 'user-1',
        display_name: 'Test Barber',
        avatar_url: null,
        bio: null,
        rating: 4.5,
        total_reviews: 50,
        is_verified: true,
        distance_meters: 500,
        price_min: 50,
        price_max: 150,
      };

      act(() => {
        useBookingStore.getState().addService(haircut);
        useBookingStore.getState().setSelectedBarber(barber);
        useBookingStore.getState().setActiveRequestId('request-123');
        useBookingStore.getState().setBottomSheetOpen(true);
      });

      expect(useBookingStore.getState().selectedServices).toHaveLength(1);
      expect(useBookingStore.getState().selectedBarber).not.toBeNull();
      expect(useBookingStore.getState().activeRequestId).not.toBeNull();

      act(() => {
        useBookingStore.getState().resetBooking();
      });

      expect(useBookingStore.getState().selectedServices).toHaveLength(0);
      expect(useBookingStore.getState().selectedBarber).toBeNull();
      expect(useBookingStore.getState().activeRequestId).toBeNull();
      expect(useBookingStore.getState().isBottomSheetOpen).toBe(false);
    });
  });

  describe('Scenario: Loyalty points from booking', () => {
    it('should calculate points earned from completed booking', () => {
      const booking = createMockBooking({
        totalPrice: 95,
        status: 'completed',
      });

      const pointsEarned = calculatePointsEarned(booking.totalPrice * 100, 'bronze');
      expect(pointsEarned).toBe(9);
    });

    it('should apply tier multipliers to points', () => {
      const bookingPrice = 10000;
      
      const bronzePoints = calculatePointsEarned(bookingPrice, 'bronze');
      const silverPoints = calculatePointsEarned(bookingPrice, 'silver');
      const goldPoints = calculatePointsEarned(bookingPrice, 'gold');
      const platinumPoints = calculatePointsEarned(bookingPrice, 'platinum');

      expect(bronzePoints).toBe(10);
      expect(silverPoints).toBe(12);
      expect(goldPoints).toBe(15);
      expect(platinumPoints).toBe(20);
    });

    it('should upgrade tier after enough bookings', () => {
      expect(calculateLoyaltyTier(9, 180000)).toBe('bronze');
      expect(calculateLoyaltyTier(10, 200000)).toBe('silver');
    });
  });

  describe('Scenario: Using saved addresses', () => {
    it('should save home address for future bookings', () => {
      const homeAddress = {
        id: 'addr-home',
        label: 'Home',
        address: 'Dizengoff 150, Tel Aviv',
        location: { latitude: 32.0853, longitude: 34.7818 },
      };

      act(() => {
        useUserStore.getState().addSavedAddress(homeAddress);
      });

      const { savedAddresses } = useUserStore.getState();
      expect(savedAddresses).toHaveLength(1);
      expect(savedAddresses[0].label).toBe('Home');
    });

    it('should allow multiple saved addresses', () => {
      const home = {
        id: 'addr-home',
        label: 'Home',
        address: 'Dizengoff 150, Tel Aviv',
        location: { latitude: 32.0853, longitude: 34.7818 },
      };
      const work = {
        id: 'addr-work',
        label: 'Work',
        address: 'Rothschild 45, Tel Aviv',
        location: { latitude: 32.0641, longitude: 34.7748 },
      };

      act(() => {
        useUserStore.getState().addSavedAddress(home);
        useUserStore.getState().addSavedAddress(work);
      });

      const { savedAddresses } = useUserStore.getState();
      expect(savedAddresses).toHaveLength(2);
      expect(savedAddresses.map(a => a.label)).toContain('Home');
      expect(savedAddresses.map(a => a.label)).toContain('Work');
    });

    it('should remove saved address', () => {
      const home = {
        id: 'addr-home',
        label: 'Home',
        address: 'Dizengoff 150',
        location: { latitude: 32.0853, longitude: 34.7818 },
      };

      act(() => {
        useUserStore.getState().addSavedAddress(home);
        useUserStore.getState().removeSavedAddress('addr-home');
      });

      expect(useUserStore.getState().savedAddresses).toHaveLength(0);
    });
  });

  describe('Scenario: Bottom sheet interactions', () => {
    it('should open bottom sheet when selecting services', () => {
      const haircut = createMockService({ id: 'svc-1', base_price: 60 });

      act(() => {
        useBookingStore.getState().addService(haircut);
        useBookingStore.getState().setBottomSheetOpen(true);
      });

      expect(useBookingStore.getState().isBottomSheetOpen).toBe(true);
    });

    it('should update snap index for different views', () => {
      act(() => {
        useBookingStore.getState().setBottomSheetSnapIndex(0);
      });
      expect(useBookingStore.getState().bottomSheetSnapIndex).toBe(0);

      act(() => {
        useBookingStore.getState().setBottomSheetSnapIndex(1);
      });
      expect(useBookingStore.getState().bottomSheetSnapIndex).toBe(1);

      act(() => {
        useBookingStore.getState().setBottomSheetSnapIndex(2);
      });
      expect(useBookingStore.getState().bottomSheetSnapIndex).toBe(2);
    });
  });
});
