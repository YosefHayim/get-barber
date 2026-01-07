/**
 * BarberConnect Premium Theme
 * A luxurious, warm theme inspired by upscale barbershops
 */

// Primary Colors - Gold/Bronze Palette
export const COLORS = {
  // Gold Spectrum
  gold: '#DAA520',
  goldLight: '#F5DEB3',
  goldDark: '#B8860B',
  goldMuted: 'rgba(218, 165, 32, 0.15)',
  goldAccent: '#FFD700',
  
  // Rich Accent Colors
  burgundy: '#722F37',
  burgundyLight: '#8B3A42',
  burgundyDark: '#5A252C',
  
  // Warm Neutrals
  cream: '#FDF8E8',
  ivory: '#FFFFF0',
  warmWhite: '#FAF9F6',
  
  // Dark Tones
  charcoal: '#1A1A1A',
  darkGray: '#2D2D2D',
  mediumGray: '#4A4A4A',
  
  // Text Colors
  textPrimary: '#1A1A1A',
  textSecondary: '#4A4A4A',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Background Colors
  background: '#FAF9F6',
  backgroundSecondary: '#F5F5F0',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  
  // Status Colors
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  
  // Chat Bubbles
  bubbleOwn: '#1A1A1A',
  bubbleOther: '#FFFFFF',
  bubbleOffer: '#F0F9FF',
  
  // Booking Status
  statusPending: '#F59E0B',
  statusConfirmed: '#10B981',
  statusInProgress: '#3B82F6',
  statusCompleted: '#059669',
  statusCancelled: '#EF4444',
  
  // Barber Status
  online: '#10B981',
  offline: '#9CA3AF',
  busy: '#F59E0B',
  
  // Border Colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

// Typography
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
} as const;

// Spacing
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
} as const;

// Border Radius
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

// Shadows
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
  gold: {
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
} as const;

// Animation Durations
export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 400,
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
} as const;

// Common Style Patterns
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
  goldGradient: {
    colors: [COLORS.gold, COLORS.goldDark],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;

// User Modes
export type UserMode = 'customer' | 'barber';

// Booking Status Types
export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

// Get status color helper
export function getStatusColor(status: BookingStatus): string {
  const statusColors: Record<BookingStatus, string> = {
    pending: COLORS.statusPending,
    confirmed: COLORS.statusConfirmed,
    in_progress: COLORS.statusInProgress,
    completed: COLORS.statusCompleted,
    cancelled: COLORS.statusCancelled,
  };
  return statusColors[status];
}

// Get status label helper
export function getStatusLabel(status: BookingStatus): string {
  const statusLabels: Record<BookingStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return statusLabels[status];
}
