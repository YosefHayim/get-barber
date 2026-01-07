import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  UserType,
  CustomerOnboardingData,
  BarberOnboardingData,
  OnboardingProgress,
  ServicePreference,
  HaircutFrequency,
  PreferredTimeOfDay,
  YearsExperience,
  BarberSpecialty,
} from '@/types/onboarding.types';

const CUSTOMER_TOTAL_STEPS = 7;
const BARBER_TOTAL_STEPS = 9;

const initialCustomerData: CustomerOnboardingData = {
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
};

const initialBarberData: BarberOnboardingData = {
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
};

const initialProgress: OnboardingProgress = {
  userType: null,
  currentStep: 1,
  totalSteps: CUSTOMER_TOTAL_STEPS,
  completedSteps: [],
  isCompleted: false,
};

interface OnboardingState {
  progress: OnboardingProgress;
  customerData: CustomerOnboardingData;
  barberData: BarberOnboardingData;
  
  setUserType: (type: UserType) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  markStepComplete: (step: number) => void;
  completeOnboarding: () => void;
  
  updateCustomerData: (data: Partial<CustomerOnboardingData>) => void;
  setCustomerFullName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  setCustomerAvatar: (uri: string | null) => void;
  setCustomerHomeAddress: (address: string, location: { latitude: number; longitude: number } | null) => void;
  setCustomerWorkAddress: (address: string, location: { latitude: number; longitude: number } | null) => void;
  toggleCustomerService: (service: ServicePreference) => void;
  setCustomerFrequency: (frequency: HaircutFrequency) => void;
  setCustomerPreferredTime: (time: PreferredTimeOfDay) => void;
  setCustomerNotifications: (key: keyof Pick<CustomerOnboardingData, 'notifyBookingUpdates' | 'notifyPromotions' | 'notifyNewBarbers' | 'notifyReminders'>, value: boolean) => void;
  
  updateBarberData: (data: Partial<BarberOnboardingData>) => void;
  setBarberBusinessName: (name: string) => void;
  setBarberPhone: (phone: string) => void;
  setBarberAvatar: (uri: string | null) => void;
  setBarberExperience: (years: YearsExperience) => void;
  toggleBarberSpecialty: (specialty: BarberSpecialty) => void;
  setBarberCertifications: (certs: string) => void;
  setBarberPriceRange: (min: number, max: number) => void;
  toggleBarberWorkingDay: (day: number) => void;
  setBarberTimeAvailability: (period: 'morning' | 'afternoon' | 'evening', available: boolean) => void;
  setBarberBaseLocation: (address: string, location: { latitude: number; longitude: number } | null) => void;
  setBarberTravelDistance: (km: number) => void;
  addBarberPortfolioImage: (uri: string) => void;
  removeBarberPortfolioImage: (uri: string) => void;
  setBarberInstagram: (handle: string) => void;
  setBarberEquipmentConfirmed: (confirmed: boolean) => void;
  setBarberIdImage: (uri: string | null) => void;
  setBarberTermsAccepted: (accepted: boolean) => void;
  
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    immer((set) => ({
      progress: initialProgress,
      customerData: initialCustomerData,
      barberData: initialBarberData,

      setUserType: (type) =>
        set((state) => {
          state.progress.userType = type;
          state.progress.totalSteps = type === 'customer' ? CUSTOMER_TOTAL_STEPS : BARBER_TOTAL_STEPS;
        }),

      nextStep: () =>
        set((state) => {
          if (state.progress.currentStep < state.progress.totalSteps) {
            state.progress.currentStep += 1;
          }
        }),

      prevStep: () =>
        set((state) => {
          if (state.progress.currentStep > 1) {
            state.progress.currentStep -= 1;
          }
        }),

      goToStep: (step) =>
        set((state) => {
          if (step >= 1 && step <= state.progress.totalSteps) {
            state.progress.currentStep = step;
          }
        }),

      markStepComplete: (step) =>
        set((state) => {
          if (!state.progress.completedSteps.includes(step)) {
            state.progress.completedSteps.push(step);
          }
        }),

      completeOnboarding: () =>
        set((state) => {
          state.progress.isCompleted = true;
        }),

      updateCustomerData: (data) =>
        set((state) => {
          Object.assign(state.customerData, data);
        }),

      setCustomerFullName: (name) =>
        set((state) => {
          state.customerData.fullName = name;
        }),

      setCustomerPhone: (phone) =>
        set((state) => {
          state.customerData.phone = phone;
        }),

      setCustomerAvatar: (uri) =>
        set((state) => {
          state.customerData.avatarUri = uri;
        }),

      setCustomerHomeAddress: (address, location) =>
        set((state) => {
          state.customerData.homeAddress = address;
          state.customerData.homeLocation = location;
        }),

      setCustomerWorkAddress: (address, location) =>
        set((state) => {
          state.customerData.workAddress = address;
          state.customerData.workLocation = location;
        }),

      toggleCustomerService: (service) =>
        set((state) => {
          const idx = state.customerData.preferredServices.indexOf(service);
          if (idx === -1) {
            state.customerData.preferredServices.push(service);
          } else {
            state.customerData.preferredServices.splice(idx, 1);
          }
        }),

      setCustomerFrequency: (frequency) =>
        set((state) => {
          state.customerData.haircutFrequency = frequency;
        }),

      setCustomerPreferredTime: (time) =>
        set((state) => {
          state.customerData.preferredTimeOfDay = time;
        }),

      setCustomerNotifications: (key, value) =>
        set((state) => {
          state.customerData[key] = value;
        }),

      updateBarberData: (data) =>
        set((state) => {
          Object.assign(state.barberData, data);
        }),

      setBarberBusinessName: (name) =>
        set((state) => {
          state.barberData.businessName = name;
        }),

      setBarberPhone: (phone) =>
        set((state) => {
          state.barberData.phone = phone;
        }),

      setBarberAvatar: (uri) =>
        set((state) => {
          state.barberData.avatarUri = uri;
        }),

      setBarberExperience: (years) =>
        set((state) => {
          state.barberData.yearsExperience = years;
        }),

      toggleBarberSpecialty: (specialty) =>
        set((state) => {
          const idx = state.barberData.specialties.indexOf(specialty);
          if (idx === -1) {
            state.barberData.specialties.push(specialty);
          } else {
            state.barberData.specialties.splice(idx, 1);
          }
        }),

      setBarberCertifications: (certs) =>
        set((state) => {
          state.barberData.certifications = certs;
        }),

      setBarberPriceRange: (min, max) =>
        set((state) => {
          state.barberData.priceMin = min;
          state.barberData.priceMax = max;
        }),

      toggleBarberWorkingDay: (day) =>
        set((state) => {
          const idx = state.barberData.workingDays.indexOf(day);
          if (idx === -1) {
            state.barberData.workingDays.push(day);
            state.barberData.workingDays.sort();
          } else {
            state.barberData.workingDays.splice(idx, 1);
          }
        }),

      setBarberTimeAvailability: (period, available) =>
        set((state) => {
          if (period === 'morning') state.barberData.morningAvailable = available;
          if (period === 'afternoon') state.barberData.afternoonAvailable = available;
          if (period === 'evening') state.barberData.eveningAvailable = available;
        }),

      setBarberBaseLocation: (address, location) =>
        set((state) => {
          state.barberData.baseAddress = address;
          state.barberData.baseLocation = location;
        }),

      setBarberTravelDistance: (km) =>
        set((state) => {
          state.barberData.maxTravelDistanceKm = km;
        }),

      addBarberPortfolioImage: (uri) =>
        set((state) => {
          if (state.barberData.portfolioImages.length < 10) {
            state.barberData.portfolioImages.push(uri);
          }
        }),

      removeBarberPortfolioImage: (uri) =>
        set((state) => {
          const idx = state.barberData.portfolioImages.indexOf(uri);
          if (idx !== -1) {
            state.barberData.portfolioImages.splice(idx, 1);
          }
        }),

      setBarberInstagram: (handle) =>
        set((state) => {
          state.barberData.instagramHandle = handle;
        }),

      setBarberEquipmentConfirmed: (confirmed) =>
        set((state) => {
          state.barberData.equipmentConfirmed = confirmed;
        }),

      setBarberIdImage: (uri) =>
        set((state) => {
          state.barberData.idImageUri = uri;
        }),

      setBarberTermsAccepted: (accepted) =>
        set((state) => {
          state.barberData.termsAccepted = accepted;
        }),

      reset: () =>
        set((state) => {
          state.progress = initialProgress;
          state.customerData = initialCustomerData;
          state.barberData = initialBarberData;
        }),
    })),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
