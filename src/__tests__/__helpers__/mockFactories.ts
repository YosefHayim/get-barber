import type { Tables, Database } from '@/services/supabase/database.types';
import type { LoyaltyAccount, LoyaltyTransaction, LoyaltyTier } from '@/types/loyalty.types';
import type {
  CustomerOnboardingData,
  BarberOnboardingData,
  OnboardingProgress,
  YearsExperience,
  BarberSpecialty,
  ServicePreference,
} from '@/types/onboarding.types';
import type { GeoLocation, GeoLocationWithAccuracy } from '@/types/common.types';
import type { MockBarber, MockBooking, MockClient, AppNotification, NotificationType } from '@/constants/mockData';

type Service = Tables<'services'>;
type ServiceCategory = Database['public']['Enums']['service_category'];

let idCounter = 0;
const generateId = (prefix: string) => `${prefix}-${++idCounter}`;

export const resetIdCounter = () => {
  idCounter = 0;
};

export const createMockService = (overrides: Partial<Service> = {}): Service => ({
  id: generateId('service'),
  name: 'Haircut',
  name_he: 'תספורת',
  description: 'Standard haircut',
  description_he: 'תספורת סטנדרטית',
  category: 'haircut' as ServiceCategory,
  base_price: 60,
  estimated_duration: 30,
  is_active: true,
  display_order: 1,
  icon: 'scissors',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockBarber = (overrides: Partial<MockBarber> = {}): MockBarber => ({
  id: generateId('barber'),
  userId: generateId('user'),
  displayName: 'Test Barber',
  avatarUrl: null,
  bio: 'Test bio',
  rating: 4.5,
  totalReviews: 50,
  isVerified: true,
  distanceMeters: 500,
  priceMin: 50,
  priceMax: 150,
  isOnline: true,
  specialties: ['Haircut', 'Beard Trim'],
  yearsExperience: 5,
  homeServiceAvailable: false,
  homeServiceSurcharge: 0,
  ...overrides,
});

export const createMockClient = (overrides: Partial<MockClient> = {}): MockClient => ({
  id: generateId('client'),
  displayName: 'Test Client',
  avatarUrl: null,
  phone: '+972-50-123-4567',
  email: 'test@example.com',
  isVip: false,
  tags: ['regular'],
  totalBookings: 5,
  totalSpent: 300,
  averageRating: 4.8,
  lastVisit: new Date().toISOString(),
  firstVisit: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  preferredServices: ['Haircut'],
  notes: [],
  bookingHistory: [],
  ...overrides,
});

export const createMockBooking = (overrides: Partial<MockBooking> = {}): MockBooking => ({
  id: generateId('booking'),
  barberId: 'barber-1',
  barberName: 'Test Barber',
  barberAvatar: null,
  customerId: 'customer-1',
  customerName: 'Test Customer',
  customerAvatar: null,
  services: ['Haircut'],
  totalPrice: 60,
  status: 'confirmed',
  scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  address: 'Test Address, Tel Aviv',
  createdAt: new Date().toISOString(),
  completedAt: null,
  rating: null,
  review: null,
  ...overrides,
});

export const createMockLoyaltyAccount = (overrides: Partial<LoyaltyAccount> = {}): LoyaltyAccount => ({
  id: generateId('loyalty'),
  customerId: 'customer-1',
  currentTier: 'bronze' as LoyaltyTier,
  totalPoints: 500,
  availablePoints: 400,
  lifetimeBookings: 10,
  lifetimeSpendCents: 150000,
  tierUpdatedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockLoyaltyTransaction = (
  overrides: Partial<LoyaltyTransaction> = {}
): LoyaltyTransaction => ({
  id: generateId('ltxn'),
  accountId: 'loyalty-1',
  transactionType: 'earned',
  points: 50,
  balanceAfter: 500,
  description: 'Points earned',
  referenceType: 'booking',
  referenceId: 'booking-1',
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockNotification = (
  overrides: Partial<AppNotification> = {}
): AppNotification => ({
  id: generateId('notif'),
  type: 'booking_confirmed' as NotificationType,
  title: 'Test Notification',
  body: 'This is a test notification',
  isRead: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockLocation = (overrides: Partial<GeoLocation> = {}): GeoLocation => ({
  latitude: 32.0853,
  longitude: 34.7818,
  ...overrides,
});

export const createMockLocationWithAccuracy = (
  overrides: Partial<GeoLocationWithAccuracy> = {}
): GeoLocationWithAccuracy => ({
  latitude: 32.0853,
  longitude: 34.7818,
  accuracy: 10,
  altitude: 0,
  heading: 0,
  speed: 0,
  timestamp: Date.now(),
  ...overrides,
});

export const createMockCustomerOnboardingData = (
  overrides: Partial<CustomerOnboardingData> = {}
): CustomerOnboardingData => ({
  fullName: 'Test Customer',
  phone: '+972-50-123-4567',
  avatarUri: null,
  homeAddress: 'Home Address',
  workAddress: null,
  homeLocation: { latitude: 32.0853, longitude: 34.7818 },
  workLocation: null,
  preferredServices: ['haircut', 'beard_trim'] as ServicePreference[],
  haircutFrequency: 'monthly',
  preferredTimeOfDay: 'morning',
  notifyBookingUpdates: true,
  notifyPromotions: false,
  notifyNewBarbers: false,
  notifyReminders: true,
  ...overrides,
});

export const createMockBarberOnboardingData = (
  overrides: Partial<BarberOnboardingData> = {}
): BarberOnboardingData => ({
  businessName: 'Test Barber Shop',
  phone: '+972-50-123-4567',
  avatarUri: null,
  yearsExperience: '3_to_5' as YearsExperience,
  specialties: ['classic_cuts', 'fades'] as BarberSpecialty[],
  certifications: 'Professional Barber Certificate',
  servicesOffered: [],
  priceMin: 50,
  priceMax: 150,
  workingDays: [0, 1, 2, 3, 4],
  morningAvailable: true,
  afternoonAvailable: true,
  eveningAvailable: false,
  baseAddress: 'Test Address',
  baseLocation: { latitude: 32.0853, longitude: 34.7818 },
  maxTravelDistanceKm: 10,
  portfolioImages: [],
  instagramHandle: '@testbarber',
  equipmentConfirmed: false,
  idImageUri: null,
  termsAccepted: false,
  ...overrides,
});

export const createMockOnboardingProgress = (
  overrides: Partial<OnboardingProgress> = {}
): OnboardingProgress => ({
  userType: null,
  currentStep: 1,
  totalSteps: 7,
  completedSteps: [],
  isCompleted: false,
  ...overrides,
});
