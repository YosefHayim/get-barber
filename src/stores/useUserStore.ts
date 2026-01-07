import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GeoLocation, GeoLocationWithAccuracy } from '@/types/common.types';

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  location: GeoLocation;
}

interface UserState {
  currentLocation: GeoLocationWithAccuracy | null;
  savedAddresses: readonly SavedAddress[];
  preferredLanguage: string;
  
  setCurrentLocation: (location: GeoLocationWithAccuracy | null) => void;
  setLocation: (location: GeoLocation | null) => void;
  addSavedAddress: (address: SavedAddress) => void;
  removeSavedAddress: (addressId: string) => void;
  setPreferredLanguage: (lang: string) => void;
  reset: () => void;
}

const initialState = {
  currentLocation: null,
  savedAddresses: [] as readonly SavedAddress[],
  preferredLanguage: 'he',
};

export const useUserStore = create<UserState>()(
  persist(
    immer((set) => ({
      ...initialState,

      setCurrentLocation: (location) =>
        set((state) => {
          state.currentLocation = location;
        }),

      setLocation: (location) =>
        set((state) => {
          if (location) {
            state.currentLocation = {
              ...location,
              accuracy: 0,
              altitude: undefined,
              heading: undefined,
              speed: undefined,
              timestamp: Date.now(),
            };
          } else {
            state.currentLocation = null;
          }
        }),

      addSavedAddress: (address) =>
        set((state) => {
          state.savedAddresses = [...state.savedAddresses, address];
        }),

      removeSavedAddress: (addressId) =>
        set((state) => {
          state.savedAddresses = state.savedAddresses.filter(
            (address: SavedAddress) => address.id !== addressId
          );
        }),

      setPreferredLanguage: (lang) =>
        set((state) => {
          state.preferredLanguage = lang;
        }),

      reset: () =>
        set((state) => {
          Object.assign(state, initialState);
        }),
    })),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        savedAddresses: state.savedAddresses,
        preferredLanguage: state.preferredLanguage,
      }),
    }
  )
);
