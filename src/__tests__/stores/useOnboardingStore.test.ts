import { act } from '@testing-library/react-native';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useAppStore } from '@/stores/useAppStore';

describe('useOnboardingStore', () => {
  const getInitialProgress = () => ({
    userType: null,
    currentStep: 1,
    totalSteps: 7,
    completedSteps: [],
    isCompleted: false,
  });

  const getInitialCustomerData = () => ({
    fullName: '',
    phone: '',
    avatarUri: null,
    homeAddress: null,
    workAddress: null,
    homeLocation: null,
    workLocation: null,
    preferredServices: [],
    haircutFrequency: null,
    preferredTimeOfDay: null,
    notifyBookingUpdates: true,
    notifyPromotions: false,
    notifyNewBarbers: false,
    notifyReminders: true,
  });

  const getInitialBarberData = () => ({
    businessName: '',
    phone: '',
    avatarUri: null,
    yearsExperience: null,
    specialties: [],
    certifications: '',
    servicesOffered: [],
    priceMin: 50,
    priceMax: 150,
    workingDays: [0, 1, 2, 3, 4],
    morningAvailable: true,
    afternoonAvailable: true,
    eveningAvailable: false,
    baseAddress: '',
    baseLocation: null,
    maxTravelDistanceKm: 10,
    portfolioImages: [],
    instagramHandle: '',
    equipmentConfirmed: false,
    idImageUri: null,
    termsAccepted: false,
  });

  beforeEach(() => {
    act(() => {
      useOnboardingStore.setState({
        progress: getInitialProgress(),
        customerData: getInitialCustomerData(),
        barberData: getInitialBarberData(),
      });
      useAppStore.setState({ hasCompletedOnboarding: false });
    });
  });

  describe('progress management', () => {
    it('defaults to step 1 with 7 total steps', () => {
      const { progress } = useOnboardingStore.getState();
      expect(progress.currentStep).toBe(1);
      expect(progress.totalSteps).toBe(7);
    });

    it('setUserType to customer keeps 7 steps', () => {
      act(() => {
        useOnboardingStore.getState().setUserType('customer');
      });
      const { progress } = useOnboardingStore.getState();
      expect(progress.userType).toBe('customer');
      expect(progress.totalSteps).toBe(7);
    });

    it('setUserType to barber sets 9 steps', () => {
      act(() => {
        useOnboardingStore.getState().setUserType('barber');
      });
      const { progress } = useOnboardingStore.getState();
      expect(progress.userType).toBe('barber');
      expect(progress.totalSteps).toBe(9);
    });

    it('nextStep increments currentStep', () => {
      act(() => {
        useOnboardingStore.getState().nextStep();
      });
      expect(useOnboardingStore.getState().progress.currentStep).toBe(2);
    });

    it('nextStep does not exceed totalSteps', () => {
      act(() => {
        for (let i = 0; i < 10; i++) {
          useOnboardingStore.getState().nextStep();
        }
      });
      expect(useOnboardingStore.getState().progress.currentStep).toBe(7);
    });

    it('prevStep decrements currentStep', () => {
      act(() => {
        useOnboardingStore.getState().nextStep();
        useOnboardingStore.getState().nextStep();
        useOnboardingStore.getState().prevStep();
      });
      expect(useOnboardingStore.getState().progress.currentStep).toBe(2);
    });

    it('prevStep does not go below 1', () => {
      act(() => {
        useOnboardingStore.getState().prevStep();
        useOnboardingStore.getState().prevStep();
      });
      expect(useOnboardingStore.getState().progress.currentStep).toBe(1);
    });

    it('goToStep navigates to valid step', () => {
      act(() => {
        useOnboardingStore.getState().goToStep(5);
      });
      expect(useOnboardingStore.getState().progress.currentStep).toBe(5);
    });

    it('goToStep ignores invalid step (too high)', () => {
      act(() => {
        useOnboardingStore.getState().goToStep(20);
      });
      expect(useOnboardingStore.getState().progress.currentStep).toBe(1);
    });

    it('goToStep ignores invalid step (too low)', () => {
      act(() => {
        useOnboardingStore.getState().goToStep(0);
      });
      expect(useOnboardingStore.getState().progress.currentStep).toBe(1);
    });

    it('markStepComplete adds step to completedSteps', () => {
      act(() => {
        useOnboardingStore.getState().markStepComplete(1);
        useOnboardingStore.getState().markStepComplete(2);
      });
      expect(useOnboardingStore.getState().progress.completedSteps).toContain(1);
      expect(useOnboardingStore.getState().progress.completedSteps).toContain(2);
    });

    it('markStepComplete does not add duplicates', () => {
      act(() => {
        useOnboardingStore.getState().markStepComplete(1);
        useOnboardingStore.getState().markStepComplete(1);
      });
      expect(useOnboardingStore.getState().progress.completedSteps).toHaveLength(1);
    });

    it('completeOnboarding sets isCompleted and updates app store', () => {
      act(() => {
        useOnboardingStore.getState().completeOnboarding();
      });
      expect(useOnboardingStore.getState().progress.isCompleted).toBe(true);
      expect(useAppStore.getState().hasCompletedOnboarding).toBe(true);
    });
  });

  describe('customer data management', () => {
    it('setCustomerFullName updates name', () => {
      act(() => {
        useOnboardingStore.getState().setCustomerFullName('Test Customer');
      });
      expect(useOnboardingStore.getState().customerData.fullName).toBe('Test Customer');
    });

    it('setCustomerPhone updates phone', () => {
      act(() => {
        useOnboardingStore.getState().setCustomerPhone('+972-50-123-4567');
      });
      expect(useOnboardingStore.getState().customerData.phone).toBe('+972-50-123-4567');
    });

    it('setCustomerAvatar updates avatar URI', () => {
      act(() => {
        useOnboardingStore.getState().setCustomerAvatar('file://avatar.jpg');
      });
      expect(useOnboardingStore.getState().customerData.avatarUri).toBe('file://avatar.jpg');
    });

    it('setCustomerHomeAddress updates home address and location', () => {
      const location = { latitude: 32.0853, longitude: 34.7818 };
      act(() => {
        useOnboardingStore.getState().setCustomerHomeAddress('Dizengoff 150', location);
      });
      expect(useOnboardingStore.getState().customerData.homeAddress).toBe('Dizengoff 150');
      expect(useOnboardingStore.getState().customerData.homeLocation).toEqual(location);
    });

    it('setCustomerWorkAddress updates work address and location', () => {
      const location = { latitude: 32.0641, longitude: 34.7748 };
      act(() => {
        useOnboardingStore.getState().setCustomerWorkAddress('Rothschild 45', location);
      });
      expect(useOnboardingStore.getState().customerData.workAddress).toBe('Rothschild 45');
      expect(useOnboardingStore.getState().customerData.workLocation).toEqual(location);
    });

    it('toggleCustomerService adds service when not present', () => {
      act(() => {
        useOnboardingStore.getState().toggleCustomerService('haircut');
      });
      expect(useOnboardingStore.getState().customerData.preferredServices).toContain('haircut');
    });

    it('toggleCustomerService removes service when present', () => {
      act(() => {
        useOnboardingStore.getState().toggleCustomerService('haircut');
        useOnboardingStore.getState().toggleCustomerService('haircut');
      });
      expect(useOnboardingStore.getState().customerData.preferredServices).not.toContain('haircut');
    });

    it('setCustomerFrequency updates frequency', () => {
      act(() => {
        useOnboardingStore.getState().setCustomerFrequency('monthly');
      });
      expect(useOnboardingStore.getState().customerData.haircutFrequency).toBe('monthly');
    });

    it('setCustomerPreferredTime updates preferred time', () => {
      act(() => {
        useOnboardingStore.getState().setCustomerPreferredTime('evening');
      });
      expect(useOnboardingStore.getState().customerData.preferredTimeOfDay).toBe('evening');
    });

    it('setCustomerNotifications updates notification preferences', () => {
      act(() => {
        useOnboardingStore.getState().setCustomerNotifications('notifyPromotions', true);
      });
      expect(useOnboardingStore.getState().customerData.notifyPromotions).toBe(true);
    });

    it('updateCustomerData batch updates multiple fields', () => {
      act(() => {
        useOnboardingStore.getState().updateCustomerData({
          fullName: 'Test User',
          phone: '+972-50-111-2222',
        });
      });
      expect(useOnboardingStore.getState().customerData.fullName).toBe('Test User');
      expect(useOnboardingStore.getState().customerData.phone).toBe('+972-50-111-2222');
    });
  });

  describe('barber data management', () => {
    it('setBarberBusinessName updates business name', () => {
      act(() => {
        useOnboardingStore.getState().setBarberBusinessName('Elite Cuts');
      });
      expect(useOnboardingStore.getState().barberData.businessName).toBe('Elite Cuts');
    });

    it('setBarberExperience updates experience', () => {
      act(() => {
        useOnboardingStore.getState().setBarberExperience('5_to_10');
      });
      expect(useOnboardingStore.getState().barberData.yearsExperience).toBe('5_to_10');
    });

    it('toggleBarberSpecialty adds specialty when not present', () => {
      act(() => {
        useOnboardingStore.getState().toggleBarberSpecialty('fades');
      });
      expect(useOnboardingStore.getState().barberData.specialties).toContain('fades');
    });

    it('toggleBarberSpecialty removes specialty when present', () => {
      act(() => {
        useOnboardingStore.getState().toggleBarberSpecialty('fades');
        useOnboardingStore.getState().toggleBarberSpecialty('fades');
      });
      expect(useOnboardingStore.getState().barberData.specialties).not.toContain('fades');
    });

    it('setBarberPriceRange updates min and max prices', () => {
      act(() => {
        useOnboardingStore.getState().setBarberPriceRange(60, 200);
      });
      expect(useOnboardingStore.getState().barberData.priceMin).toBe(60);
      expect(useOnboardingStore.getState().barberData.priceMax).toBe(200);
    });

    it('toggleBarberWorkingDay adds day when not present', () => {
      act(() => {
        useOnboardingStore.getState().toggleBarberWorkingDay(5);
      });
      expect(useOnboardingStore.getState().barberData.workingDays).toContain(5);
    });

    it('toggleBarberWorkingDay removes day when present and keeps sorted', () => {
      act(() => {
        useOnboardingStore.getState().toggleBarberWorkingDay(2);
      });
      expect(useOnboardingStore.getState().barberData.workingDays).not.toContain(2);
      expect(useOnboardingStore.getState().barberData.workingDays).toEqual([0, 1, 3, 4]);
    });

    it('setBarberTimeAvailability updates morning availability', () => {
      act(() => {
        useOnboardingStore.getState().setBarberTimeAvailability('morning', false);
      });
      expect(useOnboardingStore.getState().barberData.morningAvailable).toBe(false);
    });

    it('setBarberTimeAvailability updates evening availability', () => {
      act(() => {
        useOnboardingStore.getState().setBarberTimeAvailability('evening', true);
      });
      expect(useOnboardingStore.getState().barberData.eveningAvailable).toBe(true);
    });

    it('setBarberTravelDistance updates max travel distance', () => {
      act(() => {
        useOnboardingStore.getState().setBarberTravelDistance(15);
      });
      expect(useOnboardingStore.getState().barberData.maxTravelDistanceKm).toBe(15);
    });

    it('addBarberPortfolioImage adds image URI', () => {
      act(() => {
        useOnboardingStore.getState().addBarberPortfolioImage('file://image1.jpg');
      });
      expect(useOnboardingStore.getState().barberData.portfolioImages).toContain('file://image1.jpg');
    });

    it('addBarberPortfolioImage limits to 10 images', () => {
      act(() => {
        for (let i = 0; i < 12; i++) {
          useOnboardingStore.getState().addBarberPortfolioImage(`file://image${i}.jpg`);
        }
      });
      expect(useOnboardingStore.getState().barberData.portfolioImages).toHaveLength(10);
    });

    it('removeBarberPortfolioImage removes image', () => {
      act(() => {
        useOnboardingStore.getState().addBarberPortfolioImage('file://image1.jpg');
        useOnboardingStore.getState().addBarberPortfolioImage('file://image2.jpg');
        useOnboardingStore.getState().removeBarberPortfolioImage('file://image1.jpg');
      });
      expect(useOnboardingStore.getState().barberData.portfolioImages).not.toContain('file://image1.jpg');
      expect(useOnboardingStore.getState().barberData.portfolioImages).toHaveLength(1);
    });

    it('setBarberTermsAccepted updates terms acceptance', () => {
      act(() => {
        useOnboardingStore.getState().setBarberTermsAccepted(true);
      });
      expect(useOnboardingStore.getState().barberData.termsAccepted).toBe(true);
    });
  });

  describe('reset', () => {
    it('resets all state to initial values', () => {
      act(() => {
        useOnboardingStore.getState().setUserType('customer');
        useOnboardingStore.getState().setCustomerFullName('Test User');
        useOnboardingStore.getState().nextStep();
        useOnboardingStore.getState().markStepComplete(1);
      });

      act(() => {
        useOnboardingStore.getState().reset();
      });

      const { progress, customerData, barberData } = useOnboardingStore.getState();
      expect(progress).toEqual(getInitialProgress());
      expect(customerData).toEqual(getInitialCustomerData());
      expect(barberData).toEqual(getInitialBarberData());
    });
  });
});
