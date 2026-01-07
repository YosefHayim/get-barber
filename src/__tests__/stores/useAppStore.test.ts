import { act } from '@testing-library/react-native';
import { useAppStore, useUserMode, useIsBarberMode, useIsCustomerMode, useIsBarberOnline } from '@/stores/useAppStore';

describe('useAppStore', () => {
  const getInitialState = () => ({
    userMode: 'customer' as const,
    isBarberOnline: false,
    hasCompletedOnboarding: false,
  });

  beforeEach(() => {
    act(() => {
      useAppStore.setState(getInitialState());
    });
  });

  describe('userMode', () => {
    it('defaults to customer mode', () => {
      expect(useAppStore.getState().userMode).toBe('customer');
    });

    it('setUserMode changes mode to barber', () => {
      act(() => {
        useAppStore.getState().setUserMode('barber');
      });
      expect(useAppStore.getState().userMode).toBe('barber');
    });

    it('setUserMode changes mode to customer', () => {
      act(() => {
        useAppStore.getState().setUserMode('barber');
        useAppStore.getState().setUserMode('customer');
      });
      expect(useAppStore.getState().userMode).toBe('customer');
    });

    it('toggleUserMode switches from customer to barber', () => {
      expect(useAppStore.getState().userMode).toBe('customer');
      act(() => {
        useAppStore.getState().toggleUserMode();
      });
      expect(useAppStore.getState().userMode).toBe('barber');
    });

    it('toggleUserMode switches from barber to customer', () => {
      act(() => {
        useAppStore.getState().setUserMode('barber');
      });
      expect(useAppStore.getState().userMode).toBe('barber');
      act(() => {
        useAppStore.getState().toggleUserMode();
      });
      expect(useAppStore.getState().userMode).toBe('customer');
    });
  });

  describe('isBarberOnline', () => {
    it('defaults to false', () => {
      expect(useAppStore.getState().isBarberOnline).toBe(false);
    });

    it('setBarberOnline sets to true', () => {
      act(() => {
        useAppStore.getState().setBarberOnline(true);
      });
      expect(useAppStore.getState().isBarberOnline).toBe(true);
    });

    it('setBarberOnline sets to false', () => {
      act(() => {
        useAppStore.getState().setBarberOnline(true);
        useAppStore.getState().setBarberOnline(false);
      });
      expect(useAppStore.getState().isBarberOnline).toBe(false);
    });

    it('toggleBarberOnline toggles from false to true', () => {
      act(() => {
        useAppStore.getState().toggleBarberOnline();
      });
      expect(useAppStore.getState().isBarberOnline).toBe(true);
    });

    it('toggleBarberOnline toggles from true to false', () => {
      act(() => {
        useAppStore.getState().setBarberOnline(true);
        useAppStore.getState().toggleBarberOnline();
      });
      expect(useAppStore.getState().isBarberOnline).toBe(false);
    });
  });

  describe('hasCompletedOnboarding', () => {
    it('defaults to false', () => {
      expect(useAppStore.getState().hasCompletedOnboarding).toBe(false);
    });

    it('setOnboardingComplete sets to true', () => {
      act(() => {
        useAppStore.getState().setOnboardingComplete(true);
      });
      expect(useAppStore.getState().hasCompletedOnboarding).toBe(true);
    });

    it('setOnboardingComplete sets to false', () => {
      act(() => {
        useAppStore.getState().setOnboardingComplete(true);
        useAppStore.getState().setOnboardingComplete(false);
      });
      expect(useAppStore.getState().hasCompletedOnboarding).toBe(false);
    });
  });

  describe('derived state via getState', () => {
    it('can check if user is barber mode via getState', () => {
      expect(useAppStore.getState().userMode).toBe('customer');
      act(() => {
        useAppStore.getState().setUserMode('barber');
      });
      expect(useAppStore.getState().userMode).toBe('barber');
    });

    it('can check if user is customer mode via getState', () => {
      expect(useAppStore.getState().userMode).toBe('customer');
      act(() => {
        useAppStore.getState().setUserMode('barber');
      });
      expect(useAppStore.getState().userMode).toBe('barber');
      act(() => {
        useAppStore.getState().setUserMode('customer');
      });
      expect(useAppStore.getState().userMode).toBe('customer');
    });

    it('can check barber online status via getState', () => {
      expect(useAppStore.getState().isBarberOnline).toBe(false);
      act(() => {
        useAppStore.getState().setBarberOnline(true);
      });
      expect(useAppStore.getState().isBarberOnline).toBe(true);
    });
  });
});
