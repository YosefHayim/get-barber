import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Tables } from '@/services/supabase/database.types';

type Service = Tables<'services'>;

interface NearbyBarber {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  distance_meters: number;
  price_min: number | null;
  price_max: number | null;
}

interface BookingState {
  activeRequestId: string | null;
  selectedServices: readonly Service[];
  selectedBarber: NearbyBarber | null;
  isBottomSheetOpen: boolean;
  bottomSheetSnapIndex: number;
  
  setActiveRequestId: (requestId: string | null) => void;
  addService: (service: Service) => void;
  removeService: (serviceId: string) => void;
  clearServices: () => void;
  setSelectedBarber: (barber: NearbyBarber | null) => void;
  setBottomSheetOpen: (isOpen: boolean) => void;
  setBottomSheetSnapIndex: (index: number) => void;
  resetBooking: () => void;
}

const initialState = {
  activeRequestId: null,
  selectedServices: [] as readonly Service[],
  selectedBarber: null,
  isBottomSheetOpen: false,
  bottomSheetSnapIndex: 0,
};

export const useBookingStore = create<BookingState>()(
  persist(
    immer((set) => ({
      ...initialState,

      setActiveRequestId: (requestId) =>
        set((state) => {
          state.activeRequestId = requestId;
        }),

      addService: (service) =>
        set((state) => {
          const exists = state.selectedServices.some((svc: Service) => svc.id === service.id);
          if (!exists) {
            state.selectedServices = [...state.selectedServices, service];
          }
        }),

      removeService: (serviceId) =>
        set((state) => {
          state.selectedServices = state.selectedServices.filter(
            (svc: Service) => svc.id !== serviceId
          );
        }),

      clearServices: () =>
        set((state) => {
          state.selectedServices = [];
        }),

      setSelectedBarber: (barber) =>
        set((state) => {
          state.selectedBarber = barber;
        }),

      setBottomSheetOpen: (isOpen) =>
        set((state) => {
          state.isBottomSheetOpen = isOpen;
        }),

      setBottomSheetSnapIndex: (index) =>
        set((state) => {
          state.bottomSheetSnapIndex = index;
        }),

      resetBooking: () =>
        set((state) => {
          Object.assign(state, initialState);
        }),
    })),
    {
      name: 'booking-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedServices: state.selectedServices,
      }),
    }
  )
);

export const useSelectedServicesCount = () =>
  useBookingStore((state) => state.selectedServices.length);

export const useHasActiveRequest = () =>
  useBookingStore((state) => state.activeRequestId !== null);

export const useTotalEstimatedPrice = () =>
  useBookingStore((state) =>
    state.selectedServices.reduce((sum, s) => sum + s.base_price, 0)
  );
