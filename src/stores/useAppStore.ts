import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserMode } from '@/constants/theme';

interface AppState {
  userMode: UserMode;
  isBarberOnline: boolean;
  hasCompletedOnboarding: boolean;
  
  setUserMode: (mode: UserMode) => void;
  toggleUserMode: () => void;
  setBarberOnline: (isOnline: boolean) => void;
  toggleBarberOnline: () => void;
  setOnboardingComplete: (complete: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    immer((set) => ({
      userMode: 'customer',
      isBarberOnline: false,
      hasCompletedOnboarding: false,

      setUserMode: (mode) =>
        set((state) => {
          state.userMode = mode;
        }),

      toggleUserMode: () =>
        set((state) => {
          state.userMode = state.userMode === 'customer' ? 'barber' : 'customer';
        }),

      setBarberOnline: (isOnline) =>
        set((state) => {
          state.isBarberOnline = isOnline;
        }),

      toggleBarberOnline: () =>
        set((state) => {
          state.isBarberOnline = !state.isBarberOnline;
        }),

      setOnboardingComplete: (complete) =>
        set((state) => {
          state.hasCompletedOnboarding = complete;
        }),
    })),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useUserMode = () => useAppStore((state) => state.userMode);
export const useIsBarberMode = () => useAppStore((state) => state.userMode === 'barber');
export const useIsCustomerMode = () => useAppStore((state) => state.userMode === 'customer');
export const useIsBarberOnline = () => useAppStore((state) => state.isBarberOnline);
