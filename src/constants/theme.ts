/**
 * BarberConnect Premium Theme - Wolt-Style Redesign
 * A sophisticated, modern barber aesthetic with navy and copper accents
 */

// =============================================================================
// PRIMARY COLORS - Modern Teal & Gold Palette (From Design System)
// =============================================================================
export const COLORS = {
  // Primary - Teal/Cyan (main brand color from designs)
  primary: '#11a4d4',
  primaryDark: '#0d8ab3',
  primaryLight: '#3bb8e0',
  primaryMuted: 'rgba(17, 164, 212, 0.15)',

  // Accent - Gold/Amber
  accent: '#f59e0b',
  accentLight: '#fbbf24',
  accentDark: '#d97706',
  accentMuted: 'rgba(245, 158, 11, 0.15)',

  // Navy Spectrum - Secondary
  navy: '#1B2838',
  navyLight: '#2C3E50',
  navyDark: '#0F1C24',
  navyMuted: 'rgba(27, 40, 56, 0.15)',

  // Copper Spectrum - Tertiary Accent
  copper: '#B87333',
  copperLight: '#D4956A',
  copperDark: '#8B5A2B',
  copperMuted: 'rgba(184, 115, 51, 0.15)',

  // Brass - Premium/VIP
  brass: '#C9A959',
  brassLight: '#E0C97A',
  brassDark: '#A08338',

  // Legacy colors (for backward compatibility)
  gold: '#f59e0b',
  goldLight: '#fbbf24',
  goldDark: '#d97706',
  goldMuted: 'rgba(245, 158, 11, 0.15)',
  goldAccent: '#C9A959',
  burgundy: '#1B2838',
  burgundyLight: '#2C3E50',
  burgundyDark: '#0F1C24',

  // Light Theme Neutrals
  cream: '#F5F0E6',
  ivory: '#FAF8F5',
  warmWhite: '#FAFAF8',

  // Dark Tones
  charcoal: '#1A1A1A',
  darkGray: '#2D2D2D',
  mediumGray: '#4A4A4A',

  // =============================================================================
  // TEXT COLORS (Light Theme)
  // =============================================================================
  textPrimary: '#111618',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  textLight: '#9aaeb5',
  textInverse: '#FFFFFF',

  // =============================================================================
  // BACKGROUND COLORS (Light Theme)
  // =============================================================================
  background: '#f6f8f8',
  backgroundSecondary: '#f1f5f5',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  surfaceHover: '#f8fafa',
  card: '#ffffff',

  // =============================================================================
  // STATUS COLORS
  // =============================================================================
  success: '#2E5A3C',
  successLight: '#D1E7DD',
  successDark: '#1E3D29',
  warning: '#B8860B',
  warningLight: '#FFF3CD',
  warningDark: '#8B6508',
  error: '#8B2942',
  errorLight: '#F8D7DA',
  errorDark: '#6B1F33',
  info: '#4A6FA5',
  infoLight: '#CFE2FF',
  infoDark: '#3A5883',

  // =============================================================================
  // BOOKING STATUS COLORS
  // =============================================================================
  statusPending: '#B8860B',
  statusConfirmed: '#2E5A3C',
  statusInProgress: '#4A6FA5',
  statusCompleted: '#1E3D29',
  statusCancelled: '#8B2942',
  statusNegotiating: '#B87333',

  // =============================================================================
  // BARBER STATUS COLORS
  // =============================================================================
  online: '#2E5A3C',
  offline: '#94A3B8',
  busy: '#B8860B',
  available: '#2E5A3C',

  // =============================================================================
  // CHAT COLORS
  // =============================================================================
  bubbleOwn: '#1B2838',
  bubbleOther: '#F5F0E6',
  bubbleOffer: '#FFF8E7',
  bubbleSystem: '#F1F5F9',

  // =============================================================================
  // BORDER COLORS
  // =============================================================================
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E1',
  borderCopper: 'rgba(184, 115, 51, 0.3)',

  // =============================================================================
  // OVERLAY COLORS
  // =============================================================================
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',

  // =============================================================================
  // MAP COLORS
  // =============================================================================
  mapMarkerAvailable: '#2E5A3C',
  mapMarkerBusy: '#B8860B',
  mapMarkerOffline: '#94A3B8',
  mapRoute: '#B87333',
  mapUserLocation: '#4A6FA5',
} as const;

export const DARK_COLORS = {
  background: '#101622',
  backgroundSecondary: '#0f1115',
  surface: '#181b21',
  surfaceLight: '#1C2333',
  surfaceElevated: '#232f48',
  surfaceHover: '#2a3a52',

  primary: '#3b82f6',
  primaryDark: '#2563eb',
  primaryLight: '#60a5fa',
  primaryMuted: 'rgba(59, 130, 246, 0.2)',

  accent: '#f59e0b',
  accentLight: '#fbbf24',
  accentDark: '#d97706',

  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textLight: '#4B5563',

  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  borderDark: 'rgba(255, 255, 255, 0.2)',

  card: '#1A2638',
  cardLight: '#1C2333',
  cardDark: '#151c28',

  input: '#232f48',
  inputFocused: '#2a3a52',

  success: '#22c55e',
  successLight: '#4ade80',
  successDark: '#16a34a',
  successMuted: 'rgba(34, 197, 94, 0.2)',

  warning: '#f59e0b',
  warningLight: '#fbbf24',
  warningDark: '#d97706',

  error: '#ef4444',
  errorLight: '#f87171',
  errorDark: '#dc2626',
  errorMuted: 'rgba(239, 68, 68, 0.2)',

  info: '#3b82f6',
  infoLight: '#60a5fa',
  infoDark: '#2563eb',

  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  overlayDark: 'rgba(0, 0, 0, 0.8)',

  online: '#22c55e',
  offline: '#6B7280',
  busy: '#f59e0b',
  available: '#22c55e',

  bubbleOwn: '#3b82f6',
  bubbleOther: '#1C2333',
  bubbleSystem: '#232f48',
} as const;

export const DARK_MAP_STYLE = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#1d2c4d' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8ec3b9' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1a3646' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#304a7d' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#255763' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2c6675' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#255763' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#283d6a' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#023e58' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0e1626' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
];

export const DARK_COMMON_STYLES = {
  screenContainer: {
    flex: 1,
    backgroundColor: DARK_COLORS.background,
  },
  card: {
    backgroundColor: DARK_COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  cardElevated: {
    backgroundColor: DARK_COLORS.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  cardInteractive: {
    backgroundColor: DARK_COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  header: {
    backgroundColor: DARK_COLORS.background,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: DARK_COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: DARK_COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  primaryGradient: {
    colors: [DARK_COLORS.primary, DARK_COLORS.primaryDark] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  accentGradient: {
    colors: [DARK_COLORS.accent, DARK_COLORS.accentDark] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;

export const TYPOGRAPHY = {
  // Font Sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,

  // Font Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,

  // Line Heights
  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.75,

  // Letter Spacing
  letterSpacingTight: -0.5,
  letterSpacingNormal: 0,
  letterSpacingWide: 0.5,
} as const;

// =============================================================================
// SPACING
// =============================================================================
export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================
export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  full: 9999,
} as const;

// =============================================================================
// SHADOWS
// =============================================================================
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  copper: {
    shadowColor: COLORS.copper,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  navy: {
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  // Legacy
  gold: {
    shadowColor: COLORS.copper,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
} as const;

// =============================================================================
// ANIMATION DURATIONS
// =============================================================================
export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  springBouncy: {
    damping: 10,
    stiffness: 200,
    mass: 0.8,
  },
} as const;

// =============================================================================
// MAP STYLE - Premium Warm Theme
// =============================================================================
export const MAP_STYLE = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#F5F0E6' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4A4A4A' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#E2E8F0' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#F5F0E6' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#CBD5E1' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#E8E4DB' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#D1E7DD' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#CFE2FF' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#E2E8F0' }],
  },
];

// =============================================================================
// COMMON STYLE PATTERNS
// =============================================================================
export const COMMON_STYLES = {
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  cardElevated: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
  },
  cardInteractive: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  navyGradient: {
    colors: [COLORS.navy, COLORS.navyDark],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  copperGradient: {
    colors: [COLORS.copper, COLORS.copperDark],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // Legacy
  goldGradient: {
    colors: [COLORS.copper, COLORS.copperDark],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;

// =============================================================================
// BOTTOM SHEET SNAP POINTS
// =============================================================================
export const BOTTOM_SHEET_SNAPS = {
  collapsed: '15%',
  partial: '50%',
  expanded: '90%',
} as const;

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================
export type UserMode = 'customer' | 'barber';

export type BookingStatus =
  | 'pending'
  | 'negotiating'
  | 'confirmed'
  | 'barber_en_route'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type BarberStatus = 'available' | 'busy' | 'offline';

export type ServiceLocationType = 'barbershop' | 'home_service';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get color for booking status
 */
export function getStatusColor(status: BookingStatus): string {
  const statusColors: Record<BookingStatus, string> = {
    pending: COLORS.statusPending,
    negotiating: COLORS.statusNegotiating,
    confirmed: COLORS.statusConfirmed,
    barber_en_route: COLORS.info,
    arrived: COLORS.info,
    in_progress: COLORS.statusInProgress,
    completed: COLORS.statusCompleted,
    cancelled: COLORS.statusCancelled,
  };
  return statusColors[status];
}

/**
 * Get label for booking status
 */
export function getStatusLabel(status: BookingStatus): string {
  const statusLabels: Record<BookingStatus, string> = {
    pending: 'Pending',
    negotiating: 'Negotiating',
    confirmed: 'Confirmed',
    barber_en_route: 'Barber En Route',
    arrived: 'Barber Arrived',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return statusLabels[status];
}

/**
 * Get color for barber status
 */
export function getBarberStatusColor(status: BarberStatus): string {
  const statusColors: Record<BarberStatus, string> = {
    available: COLORS.online,
    busy: COLORS.busy,
    offline: COLORS.offline,
  };
  return statusColors[status];
}

/**
 * Format price in Israeli Shekel
 */
export function formatPrice(amount: number): string {
  return `₪${amount.toFixed(0)}`;
}

/**
 * Format distance
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Format duration in minutes
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
