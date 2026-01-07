import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  X,
  Phone,
  MessageCircle,
  Navigation,
} from 'lucide-react-native';
import { BarberMapView } from '@/features/map/components';
import { BookingTracker, BookingStatusBadge } from '@/features/booking/components';
import { COLORS, DARK_COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS, formatPrice } from '@/constants/theme';
import type { BookingStatus } from '@/constants/theme';
import type { GeoLocation } from '@/types/common.types';

const MOCK_BOOKING = {
  id: 'booking-1',
  barberId: 'barber-1',
  barberName: 'Yossi Cohen',
  barberAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  status: 'barber_en_route' as BookingStatus,
  serviceName: 'Classic Haircut + Beard Trim',
  totalAmount: 100,
  depositPaid: 10,
  estimatedArrival: 12,
  barberLocation: {
    latitude: 32.0853 + 0.005,
    longitude: 34.7818 + 0.003,
  },
  customerLocation: {
    latitude: 32.0853,
    longitude: 34.7818,
  },
};

export default function BookingTrackerScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [booking, setBooking] = useState(MOCK_BOOKING);
  const [currentStep, setCurrentStep] = useState(2);

  useEffect(() => {
    const interval = setInterval(() => {
      setBooking((prev) => ({
        ...prev,
        barberLocation: {
          latitude: prev.barberLocation.latitude - 0.0002,
          longitude: prev.barberLocation.longitude - 0.0001,
        },
        estimatedArrival: Math.max(0, prev.estimatedArrival - 1),
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleCall = useCallback(() => {
    console.log('Calling barber...');
  }, []);

  const handleMessage = useCallback(() => {
    router.push({
      pathname: '/(modals)/chat/[requestId]',
      params: { requestId: id || 'unknown' },
    });
  }, [id]);

  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  const initials = booking.barberName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={DARK_COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <BookingStatusBadge status={booking.status} />
      </View>

      <View style={styles.mapContainer}>
        <BarberMapView
          userLocation={booking.customerLocation}
          barbers={[]}
          selectedBarberId={null}
          onBarberSelect={() => {}}
        />
        
        <View style={styles.barberMarkerOverlay}>
          <View style={styles.barberMarker}>
            {booking.barberAvatar ? (
              <Image source={{ uri: booking.barberAvatar }} style={styles.barberAvatar} />
            ) : (
              <Text style={styles.barberInitials}>{initials}</Text>
            )}
          </View>
          <View style={styles.markerPointer} />
        </View>
      </View>

      <View style={[styles.infoPanel, { paddingBottom: insets.bottom + SPACING.md }]}>
        <View style={styles.barberInfo}>
          <View style={styles.barberAvatarSmall}>
            {booking.barberAvatar ? (
              <Image source={{ uri: booking.barberAvatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <View style={styles.barberDetails}>
            <Text style={styles.barberName}>{booking.barberName}</Text>
            <Text style={styles.serviceName}>{booking.serviceName}</Text>
          </View>
          <View style={styles.actionButtons}>
            <Pressable style={styles.actionBtn} onPress={handleCall}>
              <Phone size={20} color={DARK_COLORS.primary} />
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={handleMessage}>
              <MessageCircle size={20} color={DARK_COLORS.primary} />
            </Pressable>
          </View>
        </View>

        <BookingTracker
          status={booking.status}
          barberName={booking.barberName}
          estimatedArrival={booking.estimatedArrival}
          currentStep={currentStep}
        />

        <View style={styles.paymentInfo}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Total</Text>
            <Text style={styles.paymentValue}>{formatPrice(booking.totalAmount)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Deposit Paid</Text>
            <Text style={styles.paymentPaid}>-{formatPrice(booking.depositPaid)}</Text>
          </View>
          <View style={[styles.paymentRow, styles.paymentDue]}>
            <Text style={styles.paymentDueLabel}>Due on Arrival</Text>
            <Text style={styles.paymentDueValue}>
              {formatPrice(booking.totalAmount - booking.depositPaid)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: DARK_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: DARK_COLORS.borderLight,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DARK_COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: DARK_COLORS.textPrimary,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  barberMarkerOverlay: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    alignItems: 'center',
    transform: [{ translateX: -25 }, { translateY: -50 }],
  },
  barberMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: DARK_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: DARK_COLORS.background,
    shadowColor: DARK_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  barberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  barberInitials: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: '#FFFFFF',
  },
  markerPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: DARK_COLORS.primary,
    marginTop: -2,
  },
  infoPanel: {
    backgroundColor: DARK_COLORS.surface,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: DARK_COLORS.border,
  },
  barberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: DARK_COLORS.borderLight,
  },
  barberAvatarSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DARK_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: '#FFFFFF',
  },
  barberDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  barberName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: DARK_COLORS.textPrimary,
  },
  serviceName: {
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.textMuted,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DARK_COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: {
    marginTop: SPACING.lg,
    backgroundColor: DARK_COLORS.surfaceLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  paymentLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.textMuted,
  },
  paymentValue: {
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.textPrimary,
  },
  paymentPaid: {
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.success,
  },
  paymentDue: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: DARK_COLORS.border,
  },
  paymentDueLabel: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: DARK_COLORS.textPrimary,
  },
  paymentDueValue: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: DARK_COLORS.primary,
  },
});
