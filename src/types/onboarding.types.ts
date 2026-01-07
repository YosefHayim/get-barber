export type UserType = 'customer' | 'barber';

export type HaircutFrequency = 'every_2_weeks' | 'monthly' | 'every_6_weeks' | 'occasionally';

export type PreferredTimeOfDay = 'morning' | 'afternoon' | 'evening' | 'flexible';

export type YearsExperience = 'less_than_1' | '1_to_3' | '3_to_5' | '5_to_10' | 'more_than_10';

export type BarberSpecialty = 
  | 'classic_cuts'
  | 'fades'
  | 'beard_styling'
  | 'hot_towel_shave'
  | 'hair_design'
  | 'kids_haircuts'
  | 'coloring'
  | 'premium_grooming';

export type ServicePreference =
  | 'haircut'
  | 'beard_trim'
  | 'hot_towel_shave'
  | 'fade'
  | 'coloring'
  | 'kids_cut';

export interface CustomerOnboardingData {
  fullName: string;
  phone: string;
  avatarUri: string | null;
  homeAddress: string | null;
  workAddress: string | null;
  homeLocation: { latitude: number; longitude: number } | null;
  workLocation: { latitude: number; longitude: number } | null;
  preferredServices: ServicePreference[];
  haircutFrequency: HaircutFrequency | null;
  preferredTimeOfDay: PreferredTimeOfDay | null;
  notifyBookingUpdates: boolean;
  notifyPromotions: boolean;
  notifyNewBarbers: boolean;
  notifyReminders: boolean;
}

export interface BarberOnboardingData {
  businessName: string;
  phone: string;
  avatarUri: string | null;
  yearsExperience: YearsExperience | null;
  specialties: BarberSpecialty[];
  certifications: string;
  servicesOffered: string[];
  priceMin: number;
  priceMax: number;
  workingDays: number[];
  morningAvailable: boolean;
  afternoonAvailable: boolean;
  eveningAvailable: boolean;
  baseAddress: string;
  baseLocation: { latitude: number; longitude: number } | null;
  maxTravelDistanceKm: number;
  portfolioImages: string[];
  instagramHandle: string;
  equipmentConfirmed: boolean;
  idImageUri: string | null;
  termsAccepted: boolean;
}

export interface OnboardingProgress {
  userType: UserType | null;
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  isCompleted: boolean;
}

export const CUSTOMER_ONBOARDING_STEPS = [
  'welcome',
  'user_type',
  'basic_profile',
  'location_setup',
  'preferences',
  'notifications',
  'completion',
] as const;

export const BARBER_ONBOARDING_STEPS = [
  'welcome',
  'user_type',
  'business_profile',
  'professional_background',
  'services_pricing',
  'work_preferences',
  'portfolio',
  'verification',
  'completion',
] as const;

export type CustomerOnboardingStep = typeof CUSTOMER_ONBOARDING_STEPS[number];
export type BarberOnboardingStep = typeof BARBER_ONBOARDING_STEPS[number];

export const SERVICE_PREFERENCES: { id: ServicePreference; label: string; labelHe: string; icon: string }[] = [
  { id: 'haircut', label: 'Haircut', labelHe: 'תספורת', icon: 'scissors' },
  { id: 'beard_trim', label: 'Beard Trim', labelHe: 'זקן', icon: 'user' },
  { id: 'hot_towel_shave', label: 'Hot Towel Shave', labelHe: 'גילוח מגבת חמה', icon: 'droplet' },
  { id: 'fade', label: 'Fade', labelHe: 'פייד', icon: 'layers' },
  { id: 'coloring', label: 'Coloring', labelHe: 'צביעה', icon: 'palette' },
  { id: 'kids_cut', label: 'Kids Cut', labelHe: 'תספורת ילדים', icon: 'smile' },
];

export const BARBER_SPECIALTIES: { id: BarberSpecialty; label: string; labelHe: string }[] = [
  { id: 'classic_cuts', label: 'Classic Cuts', labelHe: 'תספורות קלאסיות' },
  { id: 'fades', label: 'Fades', labelHe: 'פיידים' },
  { id: 'beard_styling', label: 'Beard Styling', labelHe: 'עיצוב זקן' },
  { id: 'hot_towel_shave', label: 'Hot Towel Shave', labelHe: 'גילוח מגבת חמה' },
  { id: 'hair_design', label: 'Hair Design', labelHe: 'עיצוב שיער' },
  { id: 'kids_haircuts', label: 'Kids Haircuts', labelHe: 'תספורות ילדים' },
  { id: 'coloring', label: 'Coloring', labelHe: 'צביעה' },
  { id: 'premium_grooming', label: 'Premium Grooming', labelHe: 'טיפוח פרימיום' },
];

export const HAIRCUT_FREQUENCIES: { id: HaircutFrequency; label: string; labelHe: string }[] = [
  { id: 'every_2_weeks', label: 'Every 2 weeks', labelHe: 'כל שבועיים' },
  { id: 'monthly', label: 'Monthly', labelHe: 'פעם בחודש' },
  { id: 'every_6_weeks', label: 'Every 6 weeks', labelHe: 'כל 6 שבועות' },
  { id: 'occasionally', label: 'Occasionally', labelHe: 'מדי פעם' },
];

export const TIME_OF_DAY_OPTIONS: { id: PreferredTimeOfDay; label: string; labelHe: string; icon: string }[] = [
  { id: 'morning', label: 'Morning', labelHe: 'בוקר', icon: 'sunrise' },
  { id: 'afternoon', label: 'Afternoon', labelHe: 'צהריים', icon: 'sun' },
  { id: 'evening', label: 'Evening', labelHe: 'ערב', icon: 'sunset' },
  { id: 'flexible', label: 'Flexible', labelHe: 'גמיש', icon: 'clock' },
];

export const YEARS_EXPERIENCE_OPTIONS: { id: YearsExperience; label: string; labelHe: string }[] = [
  { id: 'less_than_1', label: 'Less than 1 year', labelHe: 'פחות משנה' },
  { id: '1_to_3', label: '1-3 years', labelHe: '1-3 שנים' },
  { id: '3_to_5', label: '3-5 years', labelHe: '3-5 שנים' },
  { id: '5_to_10', label: '5-10 years', labelHe: '5-10 שנים' },
  { id: 'more_than_10', label: '10+ years', labelHe: '10+ שנים' },
];
