import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Platform,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  X,
  Calendar,
  MapPin,
  MessageCircle,
  Star,
  CheckCircle,
  BadgeCheck,
  HelpCircle,
  Sparkles,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS, formatPrice } from '@/constants/theme';
import { webSafeFadeInDown, webSafeFadeInUp, webSafeZoomIn } from '@/utils/animations';

// ============================================================================
// LIGHT THEME COLORS - Clean, celebratory aesthetic
// ============================================================================
const LIGHT_COLORS = {
  background: '#f6f8f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  surfaceMuted: '#f8fafc',
  textPrimary: '#0d181c',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  // Success green for confirmation
  success: '#22c55e',
  successLight: '#dcfce7',
  successMuted: 'rgba(34, 197, 94, 0.12)',
  // Primary teal accent
  primary: '#11a4d4',
  primaryLight: '#e0f7fa',
  primaryMuted: 'rgba(17, 164, 212, 0.12)',
  // Star/rating gold
  gold: '#f59e0b',
  goldMuted: 'rgba(245, 158, 11, 0.15)',
};

// ============================================================================
// CONFETTI PARTICLE COMPONENT
// ============================================================================
const ConfettiParticle = ({ 
  delay, 
  startX, 
  color,
  size = 8,
}: { 
  delay: number; 
  startX: number; 
  color: string;
  size?: number;
}) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    const randomXOffset = (Math.random() - 0.5) * 120;
    const randomRotation = Math.random() * 720 - 360;
    
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(1200, withTiming(0, { duration: 400 }))
    ));
    
    scale.value = withDelay(delay, withSpring(1, { 
      damping: 8, 
      stiffness: 150 
    }));
    
    translateY.value = withDelay(delay, withTiming(400, { 
      duration: 1800, 
      easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
    }));
    
    translateX.value = withDelay(delay, withTiming(startX + randomXOffset, { 
      duration: 1800,
      easing: Easing.out(Easing.quad)
    }));
    
    rotate.value = withDelay(delay, withTiming(randomRotation, { 
      duration: 1800 
    }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      style={[
        styles.confettiParticle, 
        animatedStyle,
        { 
          backgroundColor: color,
          width: size,
          height: size,
          borderRadius: Math.random() > 0.5 ? size / 2 : 2,
        }
      ]} 
    />
  );
};

// ============================================================================
// CONFETTI BURST COMPONENT
// ============================================================================
const ConfettiBurst = () => {
  const colors = [
    '#22c55e', // Green
    '#11a4d4', // Teal
    '#f59e0b', // Gold
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
  ];

  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    delay: Math.random() * 300,
    startX: (Math.random() - 0.5) * 200,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 6,
  }));

  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {particles.map((particle) => (
        <ConfettiParticle
          key={particle.id}
          delay={particle.delay}
          startX={particle.startX}
          color={particle.color}
          size={particle.size}
        />
      ))}
    </View>
  );
};

// ============================================================================
// SUCCESS CHECKMARK ANIMATION
// ============================================================================
const AnimatedCheckmark = () => {
  const scale = useSharedValue(0);
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(0);
  const innerScale = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);

  useEffect(() => {
    // Main circle pop in
    scale.value = withDelay(200, withSpring(1, { 
      damping: 12, 
      stiffness: 180 
    }));
    
    // Inner icon with bounce
    innerScale.value = withDelay(400, withSpring(1, { 
      damping: 8, 
      stiffness: 200 
    }));
    
    // Expanding ring effect
    ringScale.value = withDelay(300, withTiming(1.6, { 
      duration: 600, 
      easing: Easing.out(Easing.quad) 
    }));
    ringOpacity.value = withDelay(300, withSequence(
      withTiming(0.6, { duration: 100 }),
      withTiming(0, { duration: 500 })
    ));

    // Sparkle effect
    sparkleOpacity.value = withDelay(500, withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(400, withTiming(0, { duration: 300 }))
    ));
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  return (
    <View style={styles.checkmarkWrapper}>
      {/* Expanding ring effect */}
      <Animated.View style={[styles.expandingRing, ringStyle]} />
      
      {/* Main success circle */}
      <Animated.View style={[styles.checkmarkCircle, circleStyle]}>
        <Animated.View style={iconStyle}>
          <CheckCircle size={52} color="#ffffff" strokeWidth={2.5} fill="#ffffff" />
        </Animated.View>
      </Animated.View>

      {/* Sparkle decorations */}
      <Animated.View style={[styles.sparkleContainer, sparkleStyle]}>
        <View style={[styles.sparkle, styles.sparkleTopLeft]}>
          <Sparkles size={16} color={LIGHT_COLORS.gold} />
        </View>
        <View style={[styles.sparkle, styles.sparkleTopRight]}>
          <Sparkles size={14} color={LIGHT_COLORS.primary} />
        </View>
        <View style={[styles.sparkle, styles.sparkleBottomRight]}>
          <Sparkles size={12} color={LIGHT_COLORS.success} />
        </View>
      </Animated.View>
    </View>
  );
};

// ============================================================================
// MOCK DATA (would come from params/store in real app)
// ============================================================================
const MOCK_BOOKING = {
  id: '#83921',
  barber: {
    name: 'Barber Mike',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    rating: 4.9,
    isVerified: true,
  },
  services: [
    { name: 'Skin Fade', price: 45 },
    { name: 'Beard Trim', price: 15 },
  ],
  date: 'Friday, Oct 24',
  time: '14:00 - 15:00',
  location: {
    type: 'home' as const,
    address: '123 Main Street, Apt 4B, New York',
  },
  isTravelingToYou: true,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function BookingConfirmedScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ bookingId?: string }>();
  
  // In real app, fetch booking details using params.bookingId
  const booking = MOCK_BOOKING;
  const totalPrice = booking.services.reduce((sum, s) => sum + s.price, 0);

  const handleAddToCalendar = () => {
    // TODO: Implement calendar integration
    console.log('Add to calendar');
  };

  const handleChat = () => {
    router.push({
      pathname: '/(modals)/chat/[requestId]',
      params: { requestId: booking.id },
    });
  };

  const handleViewBooking = () => {
    router.push({
      pathname: '/(modals)/booking-tracker/[id]',
      params: { id: booking.id.replace('#', '') },
    });
  };

  const handleGoHome = () => {
    router.dismissAll();
    router.replace('/(tabs)/home');
  };

  const handleReschedule = () => {
    // TODO: Implement reschedule flow
    console.log('Reschedule');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Confetti Animation */}
      <ConfettiBurst />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={LIGHT_COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Confirmation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Animation & Message */}
        <View style={styles.successSection}>
          <AnimatedCheckmark />
          
          <Animated.View entering={webSafeFadeInUp(400, 400)}>
            <Text style={styles.successTitle}>Appointment Confirmed!</Text>
            <Text style={styles.successSubtitle}>
              Your booking ID is{' '}
              <Text style={styles.bookingId}>{booking.id}</Text>.
              {'\n'}We've sent the details to your email.
            </Text>
          </Animated.View>
        </View>

        {/* Barber Profile Card */}
        <Animated.View 
          entering={webSafeFadeInDown(500, 400)} 
          style={styles.barberCard}
        >
          <View style={styles.barberInfo}>
            <View style={styles.avatarWrapper}>
              <Image 
                source={{ uri: booking.barber.image }} 
                style={styles.barberAvatar}
              />
              {booking.barber.isVerified && (
                <View style={styles.verifiedBadge}>
                  <BadgeCheck size={14} color="#ffffff" fill={LIGHT_COLORS.primary} />
                </View>
              )}
            </View>
            
            <View style={styles.barberDetails}>
              <Text style={styles.barberName}>{booking.barber.name}</Text>
              <View style={styles.barberMeta}>
                <Star size={16} color={LIGHT_COLORS.gold} fill={LIGHT_COLORS.gold} />
                <Text style={styles.barberRating}>{booking.barber.rating}</Text>
                <Text style={styles.barberDivider}>-</Text>
                <Text style={styles.barberTravelStatus}>
                  {booking.isTravelingToYou ? 'Traveling to you' : 'At their location'}
                </Text>
              </View>
            </View>
          </View>

          <Pressable onPress={handleChat} style={styles.chatButton}>
            <MessageCircle size={22} color={LIGHT_COLORS.primary} />
          </Pressable>
        </Animated.View>

        {/* Itinerary Card */}
        <Animated.View 
          entering={webSafeFadeInDown(600, 400)} 
          style={styles.itineraryCard}
        >
          <Text style={styles.cardLabel}>ITINERARY</Text>

          {/* Date & Time */}
          <View style={styles.itineraryRow}>
            <View style={styles.itineraryIcon}>
              <Calendar size={22} color={LIGHT_COLORS.textPrimary} />
            </View>
            <View style={styles.itineraryContent}>
              <Text style={styles.itineraryTitle}>{booking.date}</Text>
              <Text style={styles.itinerarySubtitle}>{booking.time}</Text>
            </View>
            <Pressable onPress={handleAddToCalendar} style={styles.calendarButton}>
              <Text style={styles.calendarButtonText}>Add to Calendar</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* Location */}
          <View style={styles.itineraryRow}>
            <View style={styles.itineraryIcon}>
              <MapPin size={22} color={LIGHT_COLORS.textPrimary} />
            </View>
            <View style={styles.itineraryContent}>
              <Text style={styles.itineraryTitle}>
                {booking.location.type === 'home' ? 'Home' : 'Barbershop'}
              </Text>
              <Text style={styles.itinerarySubtitle}>{booking.location.address}</Text>

              {/* Mini Map Preview */}
              <View style={styles.mapPreview}>
                <Image
                  source={{ 
                    uri: 'https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=15&size=400x200&maptype=roadmap&style=feature:all|saturation:-100&style=feature:water|color:0xcfe2ff' 
                  }}
                  style={styles.mapImage}
                  resizeMode="cover"
                />
                <View style={styles.mapPinOverlay}>
                  <View style={styles.mapPinContainer}>
                    <MapPin size={28} color={LIGHT_COLORS.primary} fill={LIGHT_COLORS.primary} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Receipt Card */}
        <Animated.View 
          entering={webSafeFadeInDown(700, 400)} 
          style={styles.receiptCard}
        >
          <Text style={styles.cardLabel}>RECEIPT</Text>
          
          {booking.services.map((service, index) => (
            <View key={index} style={styles.receiptRow}>
              <Text style={styles.receiptService}>{service.name}</Text>
              <Text style={styles.receiptPrice}>{formatPrice(service.price)}</Text>
            </View>
          ))}
          
          <View style={styles.receiptDivider} />
          
          <View style={styles.receiptTotalRow}>
            <Text style={styles.receiptTotalLabel}>Total</Text>
            <Text style={styles.receiptTotal}>{formatPrice(totalPrice)}</Text>
          </View>
        </Animated.View>

        {/* Help Link */}
        <Animated.View entering={webSafeFadeInDown(800, 400)}>
          <Pressable onPress={handleReschedule} style={styles.helpLink}>
            <HelpCircle size={16} color={LIGHT_COLORS.textMuted} />
            <Text style={styles.helpLinkText}>Need to reschedule?</Text>
          </Pressable>
        </Animated.View>

        {/* Bottom Spacing for Footer */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}>
        <Button
          mode="contained"
          onPress={handleGoHome}
          style={styles.doneButton}
          contentStyle={styles.doneButtonContent}
          labelStyle={styles.doneButtonLabel}
        >
          Done
        </Button>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_COLORS.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: `${LIGHT_COLORS.background}F2`,
    borderBottomWidth: 0,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
    letterSpacing: -0.3,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },

  // Confetti
  confettiContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    height: 200,
    alignItems: 'center',
    zIndex: 100,
    overflow: 'visible',
  },
  confettiParticle: {
    position: 'absolute',
  },

  // Success Section
  successSection: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    paddingBottom: SPACING['2xl'],
  },
  
  // Checkmark Animation
  checkmarkWrapper: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  checkmarkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: LIGHT_COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
    shadowColor: LIGHT_COLORS.success,
    shadowOpacity: 0.35,
  },
  expandingRing: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: LIGHT_COLORS.success,
  },
  sparkleContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleTopLeft: {
    top: 0,
    left: 0,
  },
  sparkleTopRight: {
    top: 8,
    right: 0,
  },
  sparkleBottomRight: {
    bottom: 12,
    right: 8,
  },

  successTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: -0.5,
  },
  successSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bookingId: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.textPrimary,
  },

  // Barber Card
  barberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    ...SHADOWS.sm,
  },
  barberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatarWrapper: {
    position: 'relative',
  },
  barberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: LIGHT_COLORS.primaryMuted,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: LIGHT_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: LIGHT_COLORS.surface,
  },
  barberDetails: {
    flex: 1,
  },
  barberName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  barberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  barberRating: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.textPrimary,
  },
  barberDivider: {
    color: LIGHT_COLORS.textMuted,
  },
  barberTravelStatus: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
  },
  chatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: LIGHT_COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Itinerary Card
  itineraryCard: {
    backgroundColor: LIGHT_COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    ...SHADOWS.sm,
  },
  cardLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: SPACING.lg,
  },
  itineraryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  itineraryIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itineraryContent: {
    flex: 1,
  },
  itineraryTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  itinerarySubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  calendarButton: {
    paddingVertical: SPACING.xs,
  },
  calendarButtonText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: LIGHT_COLORS.border,
    marginVertical: SPACING.lg,
  },

  // Map Preview
  mapPreview: {
    height: 120,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  mapPinOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPinContainer: {
    transform: [{ translateY: -14 }],
  },

  // Receipt Card
  receiptCard: {
    backgroundColor: LIGHT_COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    ...SHADOWS.sm,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  receiptService: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
  },
  receiptPrice: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: LIGHT_COLORS.textPrimary,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: LIGHT_COLORS.border,
    marginVertical: SPACING.md,
  },
  receiptTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptTotalLabel: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
  },
  receiptTotal: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
  },

  // Help Link
  helpLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
  },
  helpLinkText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textMuted,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: LIGHT_COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: LIGHT_COLORS.border,
  },
  doneButton: {
    borderRadius: RADIUS.xl,
    backgroundColor: LIGHT_COLORS.primary,
  },
  doneButtonContent: {
    height: 52,
  },
  doneButtonLabel: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    letterSpacing: 0.3,
  },
});
