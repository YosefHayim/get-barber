import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Linking,
  Animated,
  Easing,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  X,
  Phone,
  MessageCircle,
  ArrowLeft,
  HelpCircle,
  Scissors,
  Clock,
  MapPin,
  Star,
  CheckCircle,
  Navigation,
  Calendar,
  ChevronRight,
  Info,
  Shield,
  Crosshair,
} from 'lucide-react-native';
import { BarberMapView } from '@/features/map/components';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS, formatPrice } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Light theme colors matching the designs
const COLORS = {
  // Backgrounds
  background: '#f6f8f8',
  surface: '#ffffff',
  surfaceLight: '#f8f9fa',
  surfaceHover: '#f1f3f5',
  
  // Primary (teal/cyan from app theme)
  primary: '#11a4d4',
  primaryMuted: 'rgba(17, 164, 212, 0.12)',
  primaryDark: '#0d8ab3',
  
  // Text
  textPrimary: '#111618',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  
  // Status
  success: '#22c55e',
  successMuted: 'rgba(34, 197, 94, 0.12)',
  warning: '#f59e0b',
  error: '#ef4444',
  
  // Borders
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  
  // Card
  card: '#ffffff',
  cardDark: '#192233',
} as const;

// Booking state types for the tracker
type TrackerStatus = 'searching' | 'en_route' | 'arrived' | 'completed';

interface BookingData {
  id: string;
  orderNumber: string;
  barberId: string;
  barberName: string;
  barberAvatar: string;
  barberPhone: string;
  barberRating: number;
  barberCuts: number;
  barberVehicle?: string;
  barberPlate?: string;
  status: TrackerStatus;
  serviceName: string;
  serviceDuration: number;
  totalAmount: number;
  depositPaid: number;
  estimatedArrival: number;
  distance: string;
  trafficStatus?: string;
  barberLocation: {
    latitude: number;
    longitude: number;
  };
  customerLocation: {
    latitude: number;
    longitude: number;
  };
  customerAddress: string;
  scheduledDate?: string;
  scheduledTime?: string;
  services: Array<{ name: string; price: number }>;
}

const MOCK_BOOKING: BookingData = {
  id: 'booking-1',
  orderNumber: '#2481',
  barberId: 'barber-1',
  barberName: 'Alex The Fade Master',
  barberAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  barberPhone: '+972501234567',
  barberRating: 4.9,
  barberCuts: 500,
  barberVehicle: 'Blue Scooter',
  barberPlate: '821-XJ',
  status: 'en_route',
  serviceName: 'Skin Fade + Beard Trim',
  serviceDuration: 45,
  totalAmount: 45,
  depositPaid: 10,
  estimatedArrival: 12,
  distance: '1.2km',
  trafficStatus: 'Heavy traffic',
  barberLocation: {
    latitude: 32.0853 + 0.005,
    longitude: 34.7818 + 0.003,
  },
  customerLocation: {
    latitude: 32.0853,
    longitude: 34.7818,
  },
  customerAddress: '123 Main Street, Apt 4B, Tel Aviv',
  scheduledDate: 'Friday, Oct 24',
  scheduledTime: '14:00 - 15:00',
  services: [
    { name: 'Skin Fade', price: 35 },
    { name: 'Beard Trim', price: 10 },
  ],
};

// Nearby barbers for searching state animation
const NEARBY_BARBERS = [
  { id: 1, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', active: false },
  { id: 2, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', active: true },
  { id: 3, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', active: false },
];

export default function BookingTrackerScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [booking, setBooking] = useState<BookingData>(MOCK_BOOKING);
  const [searchProgress, setSearchProgress] = useState(45);
  const [etaMinutes, setEtaMinutes] = useState(MOCK_BOOKING.estimatedArrival);

  // Animations
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const radarAnim1 = useRef(new Animated.Value(0)).current;
  const radarAnim2 = useRef(new Animated.Value(0)).current;
  const radarAnim3 = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const markerPulseAnim = useRef(new Animated.Value(0)).current;

  // Marker pulse animation for en route state
  useEffect(() => {
    if (booking.status === 'en_route') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(markerPulseAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(markerPulseAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();

      const etaInterval = setInterval(() => {
        setEtaMinutes(prev => {
          if (prev <= 1) {
            clearInterval(etaInterval);
            return 1;
          }
          return prev - 1;
        });
      }, 10000);

      return () => clearInterval(etaInterval);
    }
  }, [booking.status, markerPulseAnim]);

  // Radar animation for searching state
  useEffect(() => {
    if (booking.status === 'searching') {
      const createRadarAnimation = (anim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 2500,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const animations = [
        createRadarAnimation(radarAnim1, 0),
        createRadarAnimation(radarAnim2, 800),
        createRadarAnimation(radarAnim3, 1600),
      ];

      animations.forEach(anim => anim.start());

      // Pulse animation for center icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Progress simulation
      const progressInterval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
              setBooking(prev => ({ ...prev, status: 'en_route' }));
            }, 500);
            return 100;
          }
          return prev + 2;
        });
      }, 200);

      return () => {
        clearInterval(progressInterval);
        animations.forEach(anim => anim.stop());
      };
    }
  }, [booking.status, radarAnim1, radarAnim2, radarAnim3, pulseAnim]);

  // Bounce animation for arrived state
  useEffect(() => {
    if (booking.status === 'arrived') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [booking.status, bounceAnim]);

  useEffect(() => {
    if (booking.status === 'en_route') {
      const arrivalTimer = setTimeout(() => {
        setBooking(prev => ({ ...prev, status: 'arrived' }));
      }, 20000);

      return () => clearTimeout(arrivalTimer);
    }
  }, [booking.status]);

  const handleCall = useCallback(() => {
    if (booking.barberPhone) {
      Linking.openURL(`tel:${booking.barberPhone}`);
    }
  }, [booking.barberPhone]);

  const handleMessage = useCallback(() => {
    router.push({
      pathname: '/(modals)/chat/[requestId]',
      params: { requestId: id || 'unknown' },
    });
  }, [id]);

  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  const handleComplete = useCallback(() => {
    setBooking(prev => ({ ...prev, status: 'completed' }));
  }, []);

  const handleDone = useCallback(() => {
    router.replace('/(tabs)/home');
  }, []);

  const handleHelp = useCallback(() => {
  }, []);

  const initials = booking.barberName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const getRadarStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 0],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1.5],
        }),
      },
    ],
  });

  // Calculate progress percentage based on status
  const getProgressPercent = () => {
    if (etaMinutes > 10) return 30;
    if (etaMinutes > 5) return 50;
    if (etaMinutes > 2) return 70;
    return 90;
  };

  // ============================================
  // RENDER: SEARCHING STATE
  // ============================================
  const renderSearchingState = () => (
    <View style={styles.searchingContainer}>
      {/* Background Map (faded) */}
      <View style={styles.mapBackgroundFaded}>
        <BarberMapView
          userLocation={booking.customerLocation}
          barbers={[]}
          selectedBarberId={null}
          onBarberSelect={() => {}}
        />
        <View style={styles.mapOverlay} />
      </View>

      {/* Header */}
      <View style={[styles.searchHeader, { paddingTop: insets.top + SPACING.sm }]}>
        <Pressable onPress={handleCancel} style={styles.headerButton}>
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </Pressable>
        <View style={styles.searchingBadge}>
          <Text style={styles.searchingBadgeText}>Searching...</Text>
        </View>
        <Pressable onPress={handleHelp} style={styles.headerButton}>
          <HelpCircle size={20} color={COLORS.textPrimary} />
        </Pressable>
      </View>

      {/* Radar Animation */}
      <View style={styles.radarContainer}>
        <View style={styles.radarWrapper}>
          {/* Radar rings */}
          <Animated.View style={[styles.radarRing, getRadarStyle(radarAnim1)]} />
          <Animated.View style={[styles.radarRing, getRadarStyle(radarAnim2)]} />
          <Animated.View style={[styles.radarRing, getRadarStyle(radarAnim3)]} />

          {/* Center icon */}
          <View style={styles.radarCenter}>
            <Animated.View
              style={[
                styles.radarPulse,
                {
                  opacity: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.1],
                  }),
                },
              ]}
            />
            <Scissors size={40} color={COLORS.primary} />
            <View style={styles.searchIconBadge}>
              <Text style={styles.searchIconBadgeText}>...</Text>
            </View>
          </View>
        </View>

        {/* Status Text */}
        <Text style={styles.searchTitle}>Finding your barber...</Text>
        <Text style={styles.searchSubtitle}>Scanning within 5km of your location</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Contacting Barbers</Text>
            <Text style={styles.progressPercent}>{searchProgress}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${searchProgress}%` }]} />
          </View>
        </View>

        {/* Nearby Barbers */}
        <View style={styles.nearbyBarbers}>
          {NEARBY_BARBERS.map((barber) => (
            <View
              key={barber.id}
              style={[
                styles.nearbyBarberAvatar,
                barber.active && styles.nearbyBarberActive,
                !barber.active && styles.nearbyBarberInactive,
              ]}
            >
              <Image source={{ uri: barber.avatar }} style={styles.nearbyBarberImage} />
              {barber.active && <View style={styles.nearbyBarberPulse} />}
            </View>
          ))}
        </View>
        <Text style={styles.pingingText}>Pinging nearby pros...</Text>
      </View>

      {/* Bottom Section */}
      <View style={[styles.searchFooter, { paddingBottom: insets.bottom + SPACING.lg }]}>
        {/* Tip Card */}
        <View style={styles.tipCard}>
          <Info size={20} color={COLORS.primary} />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Did you know?</Text>
            <Text style={styles.tipText}>Most barbers respond within 45 seconds during business hours.</Text>
          </View>
        </View>

        {/* Cancel Button */}
        <Pressable style={styles.cancelButton} onPress={handleCancel}>
          <X size={20} color={COLORS.textSecondary} />
          <Text style={styles.cancelButtonText}>Cancel Request</Text>
        </Pressable>
      </View>
    </View>
  );

  // ============================================
  // RENDER: EN ROUTE STATE (Main Focus)
  // ============================================
  const renderEnRouteState = () => {
    const progressPercent = getProgressPercent();
    const estimatedTime = new Date();
    estimatedTime.setMinutes(estimatedTime.getMinutes() + etaMinutes);
    const formattedTime = estimatedTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });

    return (
      <View style={styles.container}>
        {/* Full Screen Map Layer */}
        <View style={styles.mapContainer}>
          <BarberMapView
            userLocation={booking.customerLocation}
            barbers={[]}
            selectedBarberId={null}
            onBarberSelect={() => {}}
          />

          {/* Barber Marker with Pulse */}
          <View style={styles.barberMarkerContainer}>
            {/* Outer pulse ring */}
            <Animated.View
              style={[
                styles.markerPulseRing,
                {
                  opacity: markerPulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 0],
                  }),
                  transform: [
                    {
                      scale: markerPulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2],
                      }),
                    },
                  ],
                },
              ]}
            />
            {/* Inner pulse ring */}
            <View style={styles.markerPulseInner} />
            {/* Marker body */}
            <View style={styles.barberMarker}>
              <Scissors size={20} color="#FFFFFF" />
            </View>
            {/* Label */}
            <View style={styles.markerLabel}>
              <Text style={styles.markerLabelText}>{booking.barberName.split(' ')[0]}</Text>
            </View>
          </View>

          {/* User Home Marker */}
          <View style={styles.homeMarkerContainer}>
            <View style={styles.homeMarkerIcon}>
              <MapPin size={32} color={COLORS.primary} fill={COLORS.primary} />
            </View>
            <View style={styles.markerLabel}>
              <Text style={styles.markerLabelText}>Home</Text>
            </View>
          </View>
        </View>

        {/* Top Floating UI */}
        <View style={[styles.floatingHeader, { paddingTop: insets.top + SPACING.sm }]}>
          <Pressable onPress={handleCancel} style={styles.floatingButton}>
            <ArrowLeft size={20} color={COLORS.textPrimary} />
          </Pressable>
          <Pressable onPress={handleHelp} style={styles.floatingButton}>
            <HelpCircle size={20} color={COLORS.textPrimary} />
          </Pressable>
        </View>

        {/* Floating ETA Card */}
        <View style={styles.etaCardContainer}>
          <View style={styles.etaCard}>
            <View style={styles.etaIconContainer}>
              <Clock size={20} color={COLORS.primary} />
            </View>
            <View style={styles.etaContent}>
              <Text style={styles.etaTitle}>Arriving in {etaMinutes} min</Text>
              <Text style={styles.etaSubtitle}>{booking.distance} away - {booking.trafficStatus}</Text>
            </View>
          </View>
        </View>

        {/* Bottom Sheet */}
        <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + SPACING.lg }]}>
          {/* Handle */}
          <View style={styles.sheetHandle} />

          {/* Header Section */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Barber is en route</Text>
              <Text style={styles.sheetSubtitle}>Order {booking.orderNumber}</Text>
            </View>
            {/* Live Badge */}
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          {/* Barber Profile Card */}
          <View style={styles.barberCard}>
            <View style={styles.barberAvatarContainer}>
              {booking.barberAvatar ? (
                <Image source={{ uri: booking.barberAvatar }} style={styles.barberCardAvatar} />
              ) : (
                <View style={styles.barberCardAvatarPlaceholder}>
                  <Text style={styles.barberCardInitials}>{initials}</Text>
                </View>
              )}
              <View style={styles.verifiedBadge}>
                <CheckCircle size={16} color={COLORS.primary} fill={COLORS.primaryMuted} />
              </View>
            </View>
            <View style={styles.barberCardInfo}>
              <Text style={styles.barberCardName}>{booking.barberName}</Text>
              <View style={styles.barberCardStats}>
                <View style={styles.ratingBadge}>
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.ratingText}>{booking.barberRating}</Text>
                </View>
                <Text style={styles.statDivider}>-</Text>
                <Text style={styles.cutsText}>{booking.barberCuts}+ cuts</Text>
              </View>
            </View>
          </View>

          {/* Progress Stepper */}
          <View style={styles.progressStepper}>
            <View style={styles.stepperLabels}>
              <Text style={styles.stepLabel}>Packing</Text>
              <Text style={styles.stepLabelActive}>On the way</Text>
              <Text style={styles.stepLabel}>Arrived</Text>
            </View>
            <View style={styles.stepperTrack}>
              <View style={[styles.stepperFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>

          {/* Service Details */}
          <View style={styles.serviceCard}>
            <View style={styles.serviceIcon}>
              <Scissors size={18} color={COLORS.textSecondary} />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{booking.serviceName}</Text>
              <Text style={styles.serviceDuration}>approx. {booking.serviceDuration} min</Text>
            </View>
            <Text style={styles.servicePrice}>{formatPrice(booking.totalAmount)}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable style={styles.messageButton} onPress={handleMessage}>
              <MessageCircle size={24} color={COLORS.textPrimary} />
              <Text style={styles.messageButtonLabel}>MESSAGE</Text>
            </Pressable>
            <Pressable style={styles.callButton} onPress={handleCall}>
              <Phone size={20} color="#FFFFFF" />
              <Text style={styles.callButtonText}>Call Barber</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  // ============================================
  // RENDER: ARRIVED STATE
  // ============================================
  const renderArrivedState = () => (
    <View style={styles.container}>
      {/* Map Layer */}
      <View style={styles.arrivedMapContainer}>
        <BarberMapView
          userLocation={booking.customerLocation}
          barbers={[]}
          selectedBarberId={null}
          onBarberSelect={() => {}}
        />
        {/* Top gradient overlay */}
        <View style={styles.mapTopGradient} />

        {/* Arrived Marker with pulse */}
        <View style={styles.arrivedMarkerContainer}>
          <View style={styles.arrivedMarkerPulse} />
          <View style={styles.arrivedMarkerDot} />
          <Animated.View
            style={[
              styles.arrivedLabelContainer,
              { transform: [{ translateY: bounceAnim }] }
            ]}
          >
            <Text style={styles.arrivedLabelText}>
              {booking.barberName.split(' ')[0]} is here
            </Text>
          </Animated.View>
        </View>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <Pressable style={styles.mapControlButton}>
            <Crosshair size={20} color={COLORS.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Header */}
      <View style={[styles.arrivedHeader, { paddingTop: insets.top }]}>
        <Pressable onPress={handleCancel} style={styles.arrivedBackButton}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.arrivedHeaderTitle}>Current Order</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Bottom Sheet */}
      <View style={[styles.arrivedBottomSheet, { paddingBottom: insets.bottom + SPACING.lg }]}>
        {/* Handle */}
        <View style={styles.sheetHandle} />

        {/* Arrival Message */}
        <View style={styles.arrivalMessage}>
          <Text style={styles.arrivalTitle}>Your barber has arrived!</Text>
          <Text style={styles.arrivalSubtitle}>
            Please meet <Text style={styles.arrivalBarberName}>{booking.barberName.split(' ')[0]}.</Text> at the entrance.
          </Text>
        </View>

        {/* Barber Card */}
        <View style={styles.arrivedBarberCard}>
          <View style={styles.arrivedBarberAvatarContainer}>
            {booking.barberAvatar ? (
              <Image source={{ uri: booking.barberAvatar }} style={styles.arrivedBarberAvatar} />
            ) : (
              <View style={styles.arrivedBarberAvatarPlaceholder}>
                <Text style={styles.arrivedBarberInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.arrivedCheckBadge}>
              <CheckCircle size={12} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.arrivedBarberInfo}>
            <View style={styles.arrivedBarberNameRow}>
              <Text style={styles.arrivedBarberName}>{booking.barberName.split(' ')[0]}.</Text>
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>Pro</Text>
              </View>
            </View>
            <View style={styles.arrivedBarberStats}>
              <Star size={16} color="#FACC15" fill="#FACC15" />
              <Text style={styles.arrivedRatingText}>{booking.barberRating}</Text>
              <View style={styles.statDot} />
              <Text style={styles.arrivedVehicleText}>{booking.barberVehicle} - {booking.barberPlate}</Text>
            </View>
          </View>
          <View style={styles.arrivedContactButtons}>
            <Pressable style={styles.arrivedContactButton} onPress={handleCall}>
              <Phone size={20} color={COLORS.primary} />
            </Pressable>
            <Pressable style={[styles.arrivedContactButton, styles.arrivedMessageButton]} onPress={handleMessage}>
              <MessageCircle size={20} color={COLORS.primary} />
              <View style={styles.unreadDot} />
            </Pressable>
          </View>
        </View>

        {/* Primary Action */}
        <Pressable style={styles.comingOutButton} onPress={handleComplete}>
          <Text style={styles.comingOutButtonText}>I'm coming out</Text>
          <ChevronRight size={20} color="#FFFFFF" />
        </Pressable>

        <Pressable style={styles.reportButton}>
          <Text style={styles.reportButtonText}>Report a problem</Text>
        </Pressable>
      </View>
    </View>
  );

  // ============================================
  // RENDER: COMPLETED STATE
  // ============================================
  const renderCompletedState = () => (
    <ScrollView
      style={styles.completedContainer}
      contentContainerStyle={[
        styles.completedContent,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 100 }
      ]}
    >
      {/* Header */}
      <View style={styles.completedHeader}>
        <Pressable onPress={handleDone} style={styles.completedCloseButton}>
          <X size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.completedHeaderTitle}>Confirmation</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Success Icon */}
      <View style={styles.successSection}>
        <View style={styles.successIconContainer}>
          <CheckCircle size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.successTitle}>Appointment Confirmed!</Text>
        <Text style={styles.successSubtitle}>
          Your booking ID is <Text style={styles.bookingIdText}>{booking.orderNumber}</Text>.
          {'\n'}We've sent the details to your email.
        </Text>
      </View>

      {/* Barber Card */}
      <View style={styles.completedBarberCard}>
        <View style={styles.completedBarberAvatarContainer}>
          {booking.barberAvatar ? (
            <Image source={{ uri: booking.barberAvatar }} style={styles.completedBarberAvatar} />
          ) : (
            <View style={styles.completedBarberAvatarPlaceholder}>
              <Text style={styles.completedBarberInitials}>{initials}</Text>
            </View>
          )}
          <View style={styles.completedVerifiedBadge}>
            <CheckCircle size={12} color="#FFFFFF" />
          </View>
        </View>
        <View style={styles.completedBarberInfo}>
          <Text style={styles.completedBarberName}>{booking.barberName}</Text>
          <View style={styles.completedBarberStats}>
            <Star size={16} color="#FACC15" fill="#FACC15" />
            <Text style={styles.completedRatingText}>{booking.barberRating}</Text>
            <Text style={styles.completedStatDivider}>-</Text>
            <Text style={styles.completedTravelingText}>Traveling to you</Text>
          </View>
        </View>
        <Pressable style={styles.completedChatButton} onPress={handleMessage}>
          <MessageCircle size={24} color={COLORS.primary} />
        </Pressable>
      </View>

      {/* Itinerary Card */}
      <View style={styles.itineraryCard}>
        <Text style={styles.cardSectionTitle}>ITINERARY</Text>

        {/* Date/Time */}
        <View style={styles.itineraryRow}>
          <View style={styles.itineraryIcon}>
            <Calendar size={24} color={COLORS.textPrimary} />
          </View>
          <View style={styles.itineraryInfo}>
            <Text style={styles.itineraryTitle}>{booking.scheduledDate}</Text>
            <Text style={styles.itinerarySubtitle}>{booking.scheduledTime}</Text>
          </View>
          <Pressable>
            <Text style={styles.addToCalendarText}>Add to Calendar</Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* Location */}
        <View style={styles.itineraryRow}>
          <View style={styles.itineraryIcon}>
            <MapPin size={24} color={COLORS.textPrimary} />
          </View>
          <View style={styles.itineraryLocationInfo}>
            <Text style={styles.itineraryTitle}>Home</Text>
            <Text style={styles.itinerarySubtitle}>{booking.customerAddress}</Text>

            {/* Mini Map */}
            <View style={styles.miniMapContainer}>
              <View style={styles.miniMapPlaceholder}>
                <MapPin size={36} color={COLORS.primary} fill={COLORS.primary} />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Receipt Card */}
      <View style={styles.receiptCard}>
        <Text style={styles.cardSectionTitle}>RECEIPT</Text>

        {booking.services.map((service, index) => (
          <View key={index} style={styles.receiptRow}>
            <Text style={styles.receiptItemName}>{service.name}</Text>
            <Text style={styles.receiptItemPrice}>{formatPrice(service.price)}</Text>
          </View>
        ))}

        <View style={styles.receiptDivider} />

        <View style={styles.receiptTotalRow}>
          <Text style={styles.receiptTotalLabel}>Total</Text>
          <Text style={styles.receiptTotalAmount}>{formatPrice(booking.totalAmount)}</Text>
        </View>
      </View>

      {/* Help Link */}
      <Pressable style={styles.rescheduleLink}>
        <HelpCircle size={16} color={COLORS.textMuted} />
        <Text style={styles.rescheduleLinkText}>Need to reschedule?</Text>
      </Pressable>

      {/* Done Button (Fixed) */}
      <View style={[styles.doneButtonContainer, { bottom: insets.bottom + SPACING.lg }]}>
        <Pressable style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done</Text>
        </Pressable>
      </View>
    </ScrollView>
  );

  // Render based on status
  switch (booking.status) {
    case 'searching':
      return renderSearchingState();
    case 'en_route':
      return renderEnRouteState();
    case 'arrived':
      return renderArrivedState();
    case 'completed':
      return renderCompletedState();
    default:
      return renderEnRouteState();
  }
}

const styles = StyleSheet.create({
  // ============================================
  // COMMON STYLES
  // ============================================
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ============================================
  // SEARCHING STATE STYLES
  // ============================================
  searchingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapBackgroundFaded: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    opacity: 0.6,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  searchingBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    ...SHADOWS.sm,
  },
  searchingBadgeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.primary,
  },
  radarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  radarWrapper: {
    width: 256,
    height: 256,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
  },
  radarRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  radarCenter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.xl,
  },
  radarPulse: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primaryMuted,
  },
  searchIconBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.surface,
  },
  searchIconBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: TYPOGRAPHY.bold,
  },
  searchTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  searchSubtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    maxWidth: 240,
    marginTop: SPACING['2xl'],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.primary,
  },
  progressPercent: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  nearbyBarbers: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING['3xl'],
    gap: SPACING.md,
  },
  nearbyBarberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
  },
  nearbyBarberActive: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderColor: COLORS.primary,
    transform: [{ scale: 1.1 }],
    ...SHADOWS.lg,
  },
  nearbyBarberInactive: {
    borderColor: COLORS.surface,
    opacity: 0.5,
  },
  nearbyBarberImage: {
    width: '100%',
    height: '100%',
  },
  nearbyBarberPulse: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primaryMuted,
  },
  pingingText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  searchFooter: {
    paddingHorizontal: SPACING.xl,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryMuted,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  tipText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.xl,
    height: 56,
    gap: SPACING.sm,
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textSecondary,
  },

  // ============================================
  // EN ROUTE STATE STYLES
  // ============================================
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    zIndex: 10,
  },
  floatingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  etaCardContainer: {
    position: 'absolute',
    top: 100,
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 10,
  },
  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface + 'F0',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  etaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  etaContent: {
    flex: 1,
  },
  etaTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  etaSubtitle: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  barberMarkerContainer: {
    position: 'absolute',
    top: '35%',
    left: '30%',
    alignItems: 'center',
    zIndex: 5,
  },
  markerPulseRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
  },
  markerPulseInner: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryMuted,
  },
  barberMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.surface,
    ...SHADOWS.lg,
  },
  markerLabel: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  markerLabelText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  homeMarkerContainer: {
    position: 'absolute',
    top: '60%',
    left: '70%',
    alignItems: 'center',
    zIndex: 5,
  },
  homeMarkerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface + '80',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  bottomSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    ...SHADOWS['2xl'],
  },
  sheetHandle: {
    width: 48,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  sheetTitle: {
    fontSize: 26,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  sheetSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successMuted,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  liveText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.success,
    textTransform: 'uppercase',
  },
  barberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS['2xl'],
    padding: SPACING.lg,
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  barberAvatarContainer: {
    position: 'relative',
  },
  barberCardAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  barberCardAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barberCardInitials: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 2,
  },
  barberCardInfo: {
    flex: 1,
  },
  barberCardName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  barberCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: '#B45309',
  },
  statDivider: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.xs,
  },
  cutsText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
  },
  progressStepper: {
    marginBottom: SPACING.xl,
  },
  stepperLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  stepLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textMuted,
  },
  stepLabelActive: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
  },
  stepperTrack: {
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  stepperFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  serviceIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  serviceDuration: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  servicePrice: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.xl,
    height: 56,
    gap: 4,
  },
  messageButtonLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  callButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    height: 56,
    gap: SPACING.sm,
    ...SHADOWS.lg,
  },
  callButtonText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: '#FFFFFF',
  },

  // ============================================
  // ARRIVED STATE STYLES
  // ============================================
  arrivedMapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapTopGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'transparent',
  },
  arrivedMarkerContainer: {
    position: 'absolute',
    top: '33%',
    left: '50%',
    transform: [{ translateX: -32 }],
    alignItems: 'center',
  },
  arrivedMarkerPulse: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryMuted,
  },
  arrivedMarkerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...SHADOWS.md,
  },
  arrivedLabelContainer: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    ...SHADOWS.lg,
  },
  arrivedLabelText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  mapControls: {
    position: 'absolute',
    top: 100,
    right: SPACING.lg,
  },
  mapControlButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  arrivedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
    zIndex: 10,
  },
  arrivedBackButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrivedHeaderTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  arrivedBottomSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    marginTop: -24,
    ...SHADOWS['2xl'],
  },
  arrivalMessage: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  arrivalTitle: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: -0.5,
  },
  arrivalSubtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  arrivalBarberName: {
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textSecondary,
  },
  arrivedBarberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  arrivedBarberAvatarContainer: {
    position: 'relative',
  },
  arrivedBarberAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  arrivedBarberAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrivedBarberInitials: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: '#FFFFFF',
  },
  arrivedCheckBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surfaceLight,
  },
  arrivedBarberInfo: {
    flex: 1,
  },
  arrivedBarberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  arrivedBarberName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  proBadge: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  arrivedBarberStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  arrivedRatingText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textSecondary,
  },
  statDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textMuted,
  },
  arrivedVehicleText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
  },
  arrivedContactButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  arrivedContactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  arrivedMessageButton: {
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  comingOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    height: 56,
    gap: SPACING.sm,
    ...SHADOWS.lg,
  },
  comingOutButtonText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: '#FFFFFF',
  },
  reportButton: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  reportButtonText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
  },

  // ============================================
  // COMPLETED STATE STYLES
  // ============================================
  completedContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  completedContent: {
    paddingHorizontal: SPACING.lg,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  completedCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedHeaderTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  successSection: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  successTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  successSubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  bookingIdText: {
    fontFamily: 'monospace',
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textPrimary,
  },
  completedBarberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  completedBarberAvatarContainer: {
    position: 'relative',
  },
  completedBarberAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.primaryMuted,
  },
  completedBarberAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBarberInitials: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: '#FFFFFF',
  },
  completedVerifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  completedBarberInfo: {
    flex: 1,
  },
  completedBarberName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  completedBarberStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  completedRatingText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textPrimary,
  },
  completedStatDivider: {
    color: COLORS.textMuted,
  },
  completedTravelingText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
  },
  completedChatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itineraryCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardSectionTitle: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textMuted,
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
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itineraryInfo: {
    flex: 1,
  },
  itineraryLocationInfo: {
    flex: 1,
  },
  itineraryTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  itinerarySubtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  addToCalendarText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  miniMapContainer: {
    marginTop: SPACING.md,
    height: 128,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceLight,
    overflow: 'hidden',
  },
  miniMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceHover,
  },
  receiptCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  receiptItemName: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  receiptItemPrice: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textPrimary,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  receiptTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
  },
  receiptTotalLabel: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  receiptTotalAmount: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  rescheduleLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.lg,
  },
  rescheduleLinkText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
  },
  doneButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.lg,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  doneButtonText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: '#FFFFFF',
  },
});
