import { act } from '@testing-library/react-native';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useAppStore } from '@/stores/useAppStore';
import {
  createMockBarberOnboardingData,
  createMockLocation,
} from '../__helpers__';

describe('Barber Onboarding Flow', () => {
  beforeEach(() => {
    act(() => {
      useOnboardingStore.getState().reset();
      useAppStore.setState({ hasCompletedOnboarding: false, userMode: 'barber' });
    });
  });

  describe('Scenario: Complete barber registration', () => {
    it('should initialize with 9 steps for barber', () => {
      act(() => {
        useOnboardingStore.getState().setUserType('barber');
      });

      const { progress } = useOnboardingStore.getState();
      expect(progress.totalSteps).toBe(9);
      expect(progress.userType).toBe('barber');
    });

    it('should complete Step 1: Business Profile', () => {
      act(() => {
        useOnboardingStore.getState().setUserType('barber');
        useOnboardingStore.getState().setBarberBusinessName('Elite Cuts TLV');
        useOnboardingStore.getState().setBarberPhone('+972-50-123-4567');
        useOnboardingStore.getState().setBarberAvatar('file://avatar.jpg');
        useOnboardingStore.getState().markStepComplete(1);
        useOnboardingStore.getState().nextStep();
      });

      const { barberData, progress } = useOnboardingStore.getState();
      expect(barberData.businessName).toBe('Elite Cuts TLV');
      expect(barberData.phone).toBe('+972-50-123-4567');
      expect(progress.completedSteps).toContain(1);
      expect(progress.currentStep).toBe(2);
    });

    it('should complete Step 2: Professional Background', () => {
      act(() => {
        useOnboardingStore.getState().setBarberExperience('5_to_10');
        useOnboardingStore.getState().toggleBarberSpecialty('classic_cuts');
        useOnboardingStore.getState().toggleBarberSpecialty('fades');
        useOnboardingStore.getState().toggleBarberSpecialty('beard_styling');
        useOnboardingStore.getState().setBarberCertifications('Professional Barber Certificate 2020');
        useOnboardingStore.getState().markStepComplete(2);
        useOnboardingStore.getState().nextStep();
      });

      const { barberData } = useOnboardingStore.getState();
      expect(barberData.yearsExperience).toBe('5_to_10');
      expect(barberData.specialties).toHaveLength(3);
      expect(barberData.specialties).toContain('classic_cuts');
      expect(barberData.specialties).toContain('fades');
    });

    it('should complete Step 3: Services & Pricing', () => {
      act(() => {
        useOnboardingStore.getState().setBarberPriceRange(60, 200);
        useOnboardingStore.getState().markStepComplete(3);
        useOnboardingStore.getState().nextStep();
      });

      const { barberData } = useOnboardingStore.getState();
      expect(barberData.priceMin).toBe(60);
      expect(barberData.priceMax).toBe(200);
    });

    it('should complete Step 4: Schedule Setup', () => {
      act(() => {
        useOnboardingStore.getState().toggleBarberWorkingDay(5);
        useOnboardingStore.getState().setBarberTimeAvailability('evening', true);
        useOnboardingStore.getState().setBarberTimeAvailability('morning', false);
        useOnboardingStore.getState().markStepComplete(4);
        useOnboardingStore.getState().nextStep();
      });

      const { barberData } = useOnboardingStore.getState();
      expect(barberData.workingDays).toContain(5);
      expect(barberData.eveningAvailable).toBe(true);
      expect(barberData.morningAvailable).toBe(false);
    });

    it('should complete Step 5: Location Setup', () => {
      const location = createMockLocation({ latitude: 32.0853, longitude: 34.7818 });
      
      act(() => {
        useOnboardingStore.getState().setBarberBaseLocation('Dizengoff 150, Tel Aviv', location);
        useOnboardingStore.getState().setBarberTravelDistance(15);
        useOnboardingStore.getState().markStepComplete(5);
        useOnboardingStore.getState().nextStep();
      });

      const { barberData } = useOnboardingStore.getState();
      expect(barberData.baseAddress).toBe('Dizengoff 150, Tel Aviv');
      expect(barberData.baseLocation).toEqual(location);
      expect(barberData.maxTravelDistanceKm).toBe(15);
    });

    it('should complete Step 6: Portfolio', () => {
      act(() => {
        useOnboardingStore.getState().addBarberPortfolioImage('file://work1.jpg');
        useOnboardingStore.getState().addBarberPortfolioImage('file://work2.jpg');
        useOnboardingStore.getState().addBarberPortfolioImage('file://work3.jpg');
        useOnboardingStore.getState().setBarberInstagram('@elitecuts_tlv');
        useOnboardingStore.getState().markStepComplete(6);
        useOnboardingStore.getState().nextStep();
      });

      const { barberData } = useOnboardingStore.getState();
      expect(barberData.portfolioImages).toHaveLength(3);
      expect(barberData.instagramHandle).toBe('@elitecuts_tlv');
    });

    it('should complete Step 7: Verification', () => {
      act(() => {
        useOnboardingStore.getState().setBarberIdImage('file://id.jpg');
        useOnboardingStore.getState().setBarberEquipmentConfirmed(true);
        useOnboardingStore.getState().setBarberTermsAccepted(true);
        useOnboardingStore.getState().markStepComplete(7);
        useOnboardingStore.getState().nextStep();
      });

      const { barberData } = useOnboardingStore.getState();
      expect(barberData.idImageUri).toBe('file://id.jpg');
      expect(barberData.equipmentConfirmed).toBe(true);
      expect(barberData.termsAccepted).toBe(true);
    });

    it('should complete full onboarding flow', () => {
      act(() => {
        useOnboardingStore.getState().setUserType('barber');
        
        useOnboardingStore.getState().setBarberBusinessName('Elite Cuts');
        useOnboardingStore.getState().setBarberPhone('+972-50-123-4567');
        useOnboardingStore.getState().markStepComplete(1);
        useOnboardingStore.getState().nextStep();
        
        useOnboardingStore.getState().setBarberExperience('5_to_10');
        useOnboardingStore.getState().toggleBarberSpecialty('classic_cuts');
        useOnboardingStore.getState().markStepComplete(2);
        useOnboardingStore.getState().nextStep();
        
        useOnboardingStore.getState().setBarberPriceRange(60, 180);
        useOnboardingStore.getState().markStepComplete(3);
        useOnboardingStore.getState().nextStep();
        
        useOnboardingStore.getState().markStepComplete(4);
        useOnboardingStore.getState().nextStep();
        
        useOnboardingStore.getState().setBarberBaseLocation('TLV', { latitude: 32, longitude: 34 });
        useOnboardingStore.getState().markStepComplete(5);
        useOnboardingStore.getState().nextStep();
        
        useOnboardingStore.getState().addBarberPortfolioImage('file://1.jpg');
        useOnboardingStore.getState().markStepComplete(6);
        useOnboardingStore.getState().nextStep();
        
        useOnboardingStore.getState().setBarberTermsAccepted(true);
        useOnboardingStore.getState().setBarberEquipmentConfirmed(true);
        useOnboardingStore.getState().markStepComplete(7);
        useOnboardingStore.getState().nextStep();
        
        useOnboardingStore.getState().markStepComplete(8);
        
        useOnboardingStore.getState().completeOnboarding();
      });

      const { progress } = useOnboardingStore.getState();
      expect(progress.isCompleted).toBe(true);
      expect(progress.completedSteps).toHaveLength(8);
      expect(useAppStore.getState().hasCompletedOnboarding).toBe(true);
    });
  });

  describe('Scenario: Navigation between steps', () => {
    it('should allow going back to previous steps', () => {
      act(() => {
        useOnboardingStore.getState().setUserType('barber');
        useOnboardingStore.getState().nextStep();
        useOnboardingStore.getState().nextStep();
        useOnboardingStore.getState().nextStep();
      });

      expect(useOnboardingStore.getState().progress.currentStep).toBe(4);

      act(() => {
        useOnboardingStore.getState().prevStep();
        useOnboardingStore.getState().prevStep();
      });

      expect(useOnboardingStore.getState().progress.currentStep).toBe(2);
    });

    it('should allow jumping to specific step', () => {
      act(() => {
        useOnboardingStore.getState().setUserType('barber');
        useOnboardingStore.getState().goToStep(5);
      });

      expect(useOnboardingStore.getState().progress.currentStep).toBe(5);
    });

    it('should not navigate past total steps', () => {
      act(() => {
        useOnboardingStore.getState().setUserType('barber');
        for (let i = 0; i < 15; i++) {
          useOnboardingStore.getState().nextStep();
        }
      });

      expect(useOnboardingStore.getState().progress.currentStep).toBe(9);
    });

    it('should not navigate before step 1', () => {
      act(() => {
        useOnboardingStore.getState().setUserType('barber');
        useOnboardingStore.getState().prevStep();
        useOnboardingStore.getState().prevStep();
      });

      expect(useOnboardingStore.getState().progress.currentStep).toBe(1);
    });
  });

  describe('Scenario: Portfolio management', () => {
    it('should limit portfolio to 10 images', () => {
      act(() => {
        for (let i = 0; i < 15; i++) {
          useOnboardingStore.getState().addBarberPortfolioImage(`file://image${i}.jpg`);
        }
      });

      expect(useOnboardingStore.getState().barberData.portfolioImages).toHaveLength(10);
    });

    it('should allow removing portfolio images', () => {
      act(() => {
        useOnboardingStore.getState().addBarberPortfolioImage('file://1.jpg');
        useOnboardingStore.getState().addBarberPortfolioImage('file://2.jpg');
        useOnboardingStore.getState().addBarberPortfolioImage('file://3.jpg');
        useOnboardingStore.getState().removeBarberPortfolioImage('file://2.jpg');
      });

      const images = useOnboardingStore.getState().barberData.portfolioImages;
      expect(images).toHaveLength(2);
      expect(images).not.toContain('file://2.jpg');
    });
  });

  describe('Scenario: Specialty management', () => {
    it('should toggle specialties on and off', () => {
      act(() => {
        useOnboardingStore.getState().toggleBarberSpecialty('fades');
      });
      expect(useOnboardingStore.getState().barberData.specialties).toContain('fades');

      act(() => {
        useOnboardingStore.getState().toggleBarberSpecialty('fades');
      });
      expect(useOnboardingStore.getState().barberData.specialties).not.toContain('fades');
    });

    it('should allow multiple specialties', () => {
      act(() => {
        useOnboardingStore.getState().toggleBarberSpecialty('classic_cuts');
        useOnboardingStore.getState().toggleBarberSpecialty('fades');
        useOnboardingStore.getState().toggleBarberSpecialty('beard_styling');
        useOnboardingStore.getState().toggleBarberSpecialty('hot_towel_shave');
      });

      expect(useOnboardingStore.getState().barberData.specialties).toHaveLength(4);
    });
  });

  describe('Scenario: Working days configuration', () => {
    it('should start with default working days (Sun-Thu)', () => {
      expect(useOnboardingStore.getState().barberData.workingDays).toEqual([0, 1, 2, 3, 4]);
    });

    it('should add Friday when toggled', () => {
      act(() => {
        useOnboardingStore.getState().toggleBarberWorkingDay(5);
      });

      const days = useOnboardingStore.getState().barberData.workingDays;
      expect(days).toContain(5);
      expect(days).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('should remove day when toggled again', () => {
      act(() => {
        useOnboardingStore.getState().toggleBarberWorkingDay(4);
      });

      const days = useOnboardingStore.getState().barberData.workingDays;
      expect(days).not.toContain(4);
      expect(days).toEqual([0, 1, 2, 3]);
    });

    it('should keep days sorted', () => {
      act(() => {
        useOnboardingStore.getState().toggleBarberWorkingDay(6);
        useOnboardingStore.getState().toggleBarberWorkingDay(5);
      });

      const days = useOnboardingStore.getState().barberData.workingDays;
      expect(days).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });
  });

  describe('Scenario: Reset onboarding', () => {
    it('should reset all data when starting over', () => {
      const mockData = createMockBarberOnboardingData();
      
      act(() => {
        useOnboardingStore.getState().updateBarberData(mockData);
        useOnboardingStore.getState().setUserType('barber');
        useOnboardingStore.getState().nextStep();
        useOnboardingStore.getState().nextStep();
        useOnboardingStore.getState().markStepComplete(1);
        useOnboardingStore.getState().markStepComplete(2);
      });

      expect(useOnboardingStore.getState().barberData.businessName).toBe(mockData.businessName);
      expect(useOnboardingStore.getState().progress.currentStep).toBe(3);

      act(() => {
        useOnboardingStore.getState().reset();
      });

      expect(useOnboardingStore.getState().barberData.businessName).toBe('');
      expect(useOnboardingStore.getState().progress.currentStep).toBe(1);
      expect(useOnboardingStore.getState().progress.userType).toBeNull();
      expect(useOnboardingStore.getState().progress.completedSteps).toHaveLength(0);
    });
  });
});
