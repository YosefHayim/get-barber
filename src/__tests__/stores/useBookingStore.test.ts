import { act } from '@testing-library/react-native';
import { useBookingStore } from '@/stores/useBookingStore';
import { createMockService, createMockBarber, resetIdCounter } from '../__helpers__';

describe('useBookingStore', () => {
  const getInitialState = () => ({
    activeRequestId: null,
    selectedServices: [],
    selectedBarber: null,
    isBottomSheetOpen: false,
    bottomSheetSnapIndex: 0,
  });

  beforeEach(() => {
    resetIdCounter();
    act(() => {
      useBookingStore.setState(getInitialState());
    });
  });

  describe('activeRequestId', () => {
    it('defaults to null', () => {
      expect(useBookingStore.getState().activeRequestId).toBeNull();
    });

    it('setActiveRequestId sets the request id', () => {
      act(() => {
        useBookingStore.getState().setActiveRequestId('request-123');
      });
      expect(useBookingStore.getState().activeRequestId).toBe('request-123');
    });

    it('setActiveRequestId clears when set to null', () => {
      act(() => {
        useBookingStore.getState().setActiveRequestId('request-123');
        useBookingStore.getState().setActiveRequestId(null);
      });
      expect(useBookingStore.getState().activeRequestId).toBeNull();
    });
  });

  describe('selectedServices', () => {
    it('defaults to empty array', () => {
      expect(useBookingStore.getState().selectedServices).toHaveLength(0);
    });

    it('addService adds a service to selection', () => {
      const service = createMockService({ id: 'svc-1', name: 'Haircut', base_price: 60 });
      act(() => {
        useBookingStore.getState().addService(service);
      });
      expect(useBookingStore.getState().selectedServices).toHaveLength(1);
      expect(useBookingStore.getState().selectedServices[0].name).toBe('Haircut');
    });

    it('addService prevents duplicate services', () => {
      const service = createMockService({ id: 'svc-1', name: 'Haircut', base_price: 60 });
      act(() => {
        useBookingStore.getState().addService(service);
        useBookingStore.getState().addService(service);
      });
      expect(useBookingStore.getState().selectedServices).toHaveLength(1);
    });

    it('addService allows adding different services', () => {
      const haircut = createMockService({ id: 'svc-1', name: 'Haircut', base_price: 60 });
      const beardTrim = createMockService({ id: 'svc-2', name: 'Beard Trim', base_price: 35 });
      act(() => {
        useBookingStore.getState().addService(haircut);
        useBookingStore.getState().addService(beardTrim);
      });
      expect(useBookingStore.getState().selectedServices).toHaveLength(2);
    });

    it('removeService removes a service by id', () => {
      const haircut = createMockService({ id: 'svc-1', name: 'Haircut', base_price: 60 });
      const beardTrim = createMockService({ id: 'svc-2', name: 'Beard Trim', base_price: 35 });
      act(() => {
        useBookingStore.getState().addService(haircut);
        useBookingStore.getState().addService(beardTrim);
        useBookingStore.getState().removeService('svc-1');
      });
      expect(useBookingStore.getState().selectedServices).toHaveLength(1);
      expect(useBookingStore.getState().selectedServices[0].id).toBe('svc-2');
    });

    it('removeService does nothing for non-existent service', () => {
      const service = createMockService({ id: 'svc-1' });
      act(() => {
        useBookingStore.getState().addService(service);
        useBookingStore.getState().removeService('non-existent');
      });
      expect(useBookingStore.getState().selectedServices).toHaveLength(1);
    });

    it('clearServices removes all services', () => {
      const haircut = createMockService({ id: 'svc-1' });
      const beardTrim = createMockService({ id: 'svc-2' });
      act(() => {
        useBookingStore.getState().addService(haircut);
        useBookingStore.getState().addService(beardTrim);
        useBookingStore.getState().clearServices();
      });
      expect(useBookingStore.getState().selectedServices).toHaveLength(0);
    });
  });

  describe('selectedBarber', () => {
    it('defaults to null', () => {
      expect(useBookingStore.getState().selectedBarber).toBeNull();
    });

    it('setSelectedBarber sets the barber', () => {
      const barber = {
        id: 'barber-1',
        user_id: 'user-1',
        display_name: 'Test Barber',
        avatar_url: null,
        bio: 'Test bio',
        rating: 4.5,
        total_reviews: 50,
        is_verified: true,
        distance_meters: 500,
        price_min: 50,
        price_max: 150,
      };
      act(() => {
        useBookingStore.getState().setSelectedBarber(barber);
      });
      expect(useBookingStore.getState().selectedBarber).toEqual(barber);
    });

    it('setSelectedBarber clears when set to null', () => {
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
        useBookingStore.getState().setSelectedBarber(barber);
        useBookingStore.getState().setSelectedBarber(null);
      });
      expect(useBookingStore.getState().selectedBarber).toBeNull();
    });
  });

  describe('bottomSheet state', () => {
    it('isBottomSheetOpen defaults to false', () => {
      expect(useBookingStore.getState().isBottomSheetOpen).toBe(false);
    });

    it('setBottomSheetOpen sets to true', () => {
      act(() => {
        useBookingStore.getState().setBottomSheetOpen(true);
      });
      expect(useBookingStore.getState().isBottomSheetOpen).toBe(true);
    });

    it('bottomSheetSnapIndex defaults to 0', () => {
      expect(useBookingStore.getState().bottomSheetSnapIndex).toBe(0);
    });

    it('setBottomSheetSnapIndex updates index', () => {
      act(() => {
        useBookingStore.getState().setBottomSheetSnapIndex(2);
      });
      expect(useBookingStore.getState().bottomSheetSnapIndex).toBe(2);
    });
  });

  describe('resetBooking', () => {
    it('resets all booking state to initial values', () => {
      const service = createMockService({ id: 'svc-1', base_price: 60 });
      const barber = {
        id: 'barber-1',
        user_id: 'user-1',
        display_name: 'Test',
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
        useBookingStore.getState().setActiveRequestId('request-123');
        useBookingStore.getState().addService(service);
        useBookingStore.getState().setSelectedBarber(barber);
        useBookingStore.getState().setBottomSheetOpen(true);
        useBookingStore.getState().setBottomSheetSnapIndex(2);
      });

      expect(useBookingStore.getState().activeRequestId).toBe('request-123');
      expect(useBookingStore.getState().selectedServices).toHaveLength(1);
      expect(useBookingStore.getState().selectedBarber).not.toBeNull();
      expect(useBookingStore.getState().isBottomSheetOpen).toBe(true);
      expect(useBookingStore.getState().bottomSheetSnapIndex).toBe(2);

      act(() => {
        useBookingStore.getState().resetBooking();
      });

      expect(useBookingStore.getState().activeRequestId).toBeNull();
      expect(useBookingStore.getState().selectedServices).toHaveLength(0);
      expect(useBookingStore.getState().selectedBarber).toBeNull();
      expect(useBookingStore.getState().isBottomSheetOpen).toBe(false);
      expect(useBookingStore.getState().bottomSheetSnapIndex).toBe(0);
    });
  });

  describe('selector logic (via getState)', () => {
    it('selectedServices count starts at 0', () => {
      expect(useBookingStore.getState().selectedServices.length).toBe(0);
      
      const service1 = createMockService({ id: 'svc-1' });
      const service2 = createMockService({ id: 'svc-2' });
      
      act(() => {
        useBookingStore.getState().addService(service1);
        useBookingStore.getState().addService(service2);
      });
      
      expect(useBookingStore.getState().selectedServices.length).toBe(2);
    });

    it('activeRequestId is null when no request', () => {
      expect(useBookingStore.getState().activeRequestId).toBeNull();
    });

    it('activeRequestId is set when request exists', () => {
      act(() => {
        useBookingStore.getState().setActiveRequestId('request-123');
      });
      expect(useBookingStore.getState().activeRequestId).not.toBeNull();
    });

    it('total estimated price calculates sum of service prices', () => {
      const state = useBookingStore.getState();
      const initialTotal = state.selectedServices.reduce((sum, s) => sum + s.base_price, 0);
      expect(initialTotal).toBe(0);
      
      const haircut = createMockService({ id: 'svc-1', base_price: 60 });
      const beardTrim = createMockService({ id: 'svc-2', base_price: 35 });
      const shave = createMockService({ id: 'svc-3', base_price: 50 });
      
      act(() => {
        useBookingStore.getState().addService(haircut);
        useBookingStore.getState().addService(beardTrim);
        useBookingStore.getState().addService(shave);
      });
      
      const finalState = useBookingStore.getState();
      const total = finalState.selectedServices.reduce((sum, s) => sum + s.base_price, 0);
      expect(total).toBe(145);
    });
  });
});
