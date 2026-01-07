import { act } from '@testing-library/react-native';
import { useUserStore } from '@/stores/useUserStore';
import { createMockLocation, createMockLocationWithAccuracy } from '../__helpers__';

describe('useUserStore', () => {
  const getInitialState = () => ({
    currentLocation: null,
    savedAddresses: [],
    preferredLanguage: 'he',
  });

  beforeEach(() => {
    act(() => {
      useUserStore.setState(getInitialState());
    });
  });

  describe('currentLocation', () => {
    it('defaults to null', () => {
      expect(useUserStore.getState().currentLocation).toBeNull();
    });

    it('setCurrentLocation sets location with accuracy', () => {
      const location = createMockLocationWithAccuracy({
        latitude: 32.0853,
        longitude: 34.7818,
        accuracy: 10,
      });

      act(() => {
        useUserStore.getState().setCurrentLocation(location);
      });

      const stored = useUserStore.getState().currentLocation;
      expect(stored).not.toBeNull();
      expect(stored?.latitude).toBe(32.0853);
      expect(stored?.longitude).toBe(34.7818);
      expect(stored?.accuracy).toBe(10);
    });

    it('setCurrentLocation clears when set to null', () => {
      const location = createMockLocationWithAccuracy();
      
      act(() => {
        useUserStore.getState().setCurrentLocation(location);
        useUserStore.getState().setCurrentLocation(null);
      });

      expect(useUserStore.getState().currentLocation).toBeNull();
    });

    it('setLocation creates location with default accuracy values', () => {
      const location = createMockLocation({
        latitude: 31.7683,
        longitude: 35.2137,
      });

      act(() => {
        useUserStore.getState().setLocation(location);
      });

      const stored = useUserStore.getState().currentLocation;
      expect(stored).not.toBeNull();
      expect(stored?.latitude).toBe(31.7683);
      expect(stored?.longitude).toBe(35.2137);
      expect(stored?.accuracy).toBe(0);
      expect(stored?.timestamp).toBeDefined();
    });

    it('setLocation clears when set to null', () => {
      const location = createMockLocation();
      
      act(() => {
        useUserStore.getState().setLocation(location);
        useUserStore.getState().setLocation(null);
      });

      expect(useUserStore.getState().currentLocation).toBeNull();
    });
  });

  describe('savedAddresses', () => {
    it('defaults to empty array', () => {
      expect(useUserStore.getState().savedAddresses).toHaveLength(0);
    });

    it('addSavedAddress adds an address', () => {
      const address = {
        id: 'addr-1',
        label: 'Home',
        address: 'Dizengoff 150, Tel Aviv',
        location: createMockLocation(),
      };

      act(() => {
        useUserStore.getState().addSavedAddress(address);
      });

      expect(useUserStore.getState().savedAddresses).toHaveLength(1);
      expect(useUserStore.getState().savedAddresses[0].label).toBe('Home');
    });

    it('addSavedAddress adds multiple addresses', () => {
      const home = {
        id: 'addr-1',
        label: 'Home',
        address: 'Dizengoff 150, Tel Aviv',
        location: createMockLocation(),
      };
      const work = {
        id: 'addr-2',
        label: 'Work',
        address: 'Rothschild 45, Tel Aviv',
        location: createMockLocation({ latitude: 32.0641, longitude: 34.7748 }),
      };

      act(() => {
        useUserStore.getState().addSavedAddress(home);
        useUserStore.getState().addSavedAddress(work);
      });

      expect(useUserStore.getState().savedAddresses).toHaveLength(2);
    });

    it('removeSavedAddress removes address by id', () => {
      const home = {
        id: 'addr-1',
        label: 'Home',
        address: 'Dizengoff 150, Tel Aviv',
        location: createMockLocation(),
      };
      const work = {
        id: 'addr-2',
        label: 'Work',
        address: 'Rothschild 45, Tel Aviv',
        location: createMockLocation(),
      };

      act(() => {
        useUserStore.getState().addSavedAddress(home);
        useUserStore.getState().addSavedAddress(work);
        useUserStore.getState().removeSavedAddress('addr-1');
      });

      expect(useUserStore.getState().savedAddresses).toHaveLength(1);
      expect(useUserStore.getState().savedAddresses[0].id).toBe('addr-2');
    });

    it('removeSavedAddress does nothing for non-existent id', () => {
      const address = {
        id: 'addr-1',
        label: 'Home',
        address: 'Dizengoff 150, Tel Aviv',
        location: createMockLocation(),
      };

      act(() => {
        useUserStore.getState().addSavedAddress(address);
        useUserStore.getState().removeSavedAddress('non-existent');
      });

      expect(useUserStore.getState().savedAddresses).toHaveLength(1);
    });
  });

  describe('preferredLanguage', () => {
    it('defaults to Hebrew (he)', () => {
      expect(useUserStore.getState().preferredLanguage).toBe('he');
    });

    it('setPreferredLanguage changes language', () => {
      act(() => {
        useUserStore.getState().setPreferredLanguage('en');
      });

      expect(useUserStore.getState().preferredLanguage).toBe('en');
    });

    it('setPreferredLanguage can switch back', () => {
      act(() => {
        useUserStore.getState().setPreferredLanguage('en');
        useUserStore.getState().setPreferredLanguage('he');
      });

      expect(useUserStore.getState().preferredLanguage).toBe('he');
    });
  });

  describe('reset', () => {
    it('resets all state to initial values', () => {
      const location = createMockLocationWithAccuracy();
      const address = {
        id: 'addr-1',
        label: 'Home',
        address: 'Dizengoff 150, Tel Aviv',
        location: createMockLocation(),
      };

      act(() => {
        useUserStore.getState().setCurrentLocation(location);
        useUserStore.getState().addSavedAddress(address);
        useUserStore.getState().setPreferredLanguage('en');
      });

      expect(useUserStore.getState().currentLocation).not.toBeNull();
      expect(useUserStore.getState().savedAddresses).toHaveLength(1);
      expect(useUserStore.getState().preferredLanguage).toBe('en');

      act(() => {
        useUserStore.getState().reset();
      });

      expect(useUserStore.getState().currentLocation).toBeNull();
      expect(useUserStore.getState().savedAddresses).toHaveLength(0);
      expect(useUserStore.getState().preferredLanguage).toBe('he');
    });
  });
});
