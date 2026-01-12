import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  X,
  MapPin,
  Home,
  Clock,
  Check,
  Scissors,
} from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { webSafeFadeInDown } from '@/utils/animations';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS, formatPrice } from '@/constants/theme';
import { useBookingStore } from '@/stores/useBookingStore';

const LIGHT_COLORS = {
  background: '#f6f6f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  textPrimary: '#0d181b',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
};

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  duration: number;
}

const MOCK_SERVICES: ServiceItem[] = [
  { id: '1', name: 'Classic Haircut', price: 60, duration: 30 },
  { id: '2', name: 'Fade Haircut', price: 80, duration: 45 },
  { id: '3', name: 'Beard Trim', price: 40, duration: 20 },
  { id: '4', name: 'Full Service', price: 120, duration: 60 },
  { id: '5', name: 'Kids Haircut', price: 50, duration: 25 },
];

const HOME_SERVICE_SURCHARGE = 30;

export default function BookingRequestScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { barberId } = useLocalSearchParams<{ barberId?: string }>();
  const selectedBarber = useBookingStore((s) => s.selectedBarber);
  
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isHomeService, setIsHomeService] = useState(false);
  const [homeAddress, setHomeAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const services: ServiceItem[] = MOCK_SERVICES;
  const isLoading = false;

  const toggleService = useCallback((serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  }, []);

  const calculateTotal = useCallback(() => {
    const servicesTotal = selectedServices.reduce((sum, id) => {
      const service = services.find((s) => s.id === id);
      return sum + (service?.price || 0);
    }, 0);
    return isHomeService ? servicesTotal + HOME_SERVICE_SURCHARGE : servicesTotal;
  }, [selectedServices, isHomeService, services]);

  const calculateDuration = useCallback(() => {
    return selectedServices.reduce((sum, id) => {
      const service = services.find((s) => s.id === id);
      return sum + (service?.duration || 0);
    }, 0);
  }, [selectedServices, services]);

  const handleSubmit = useCallback(async () => {
    if (selectedServices.length === 0) {
      Alert.alert('Select Services', 'Please select at least one service.');
      return;
    }

    if (isHomeService && !homeAddress.trim()) {
      Alert.alert('Address Required', 'Please enter your home address for home service.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      router.push({
        pathname: '/(modals)/chat/[requestId]',
        params: { requestId: 'mock-request-id' },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedServices, isHomeService, homeAddress]);

  const total = calculateTotal();
  const duration = calculateDuration();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={LIGHT_COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {selectedBarber && (
          <Animated.View entering={webSafeFadeInDown(0, 300)} style={styles.barberInfo}>
            <View style={styles.barberAvatar}>
              <Text style={styles.barberInitials}>
                {selectedBarber.display_name?.charAt(0) || 'B'}
              </Text>
            </View>
            <View style={styles.barberDetails}>
              <Text style={styles.barberName}>{selectedBarber.display_name}</Text>
              <Text style={styles.barberRating}>
                {selectedBarber.rating?.toFixed(1)} ({selectedBarber.total_reviews} reviews)
              </Text>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={webSafeFadeInDown(100, 300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Select Services</Text>
          
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.copper} />
          ) : (
            <View style={styles.servicesList}>
              {services.map((service, index) => {
                const isSelected = selectedServices.includes(service.id);
                return (
                  <Pressable
                    key={service.id}
                    style={[styles.serviceItem, isSelected && styles.serviceItemSelected]}
                    onPress={() => toggleService(service.id)}
                  >
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected && <Check size={14} color={COLORS.textInverse} />}
                    </View>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <View style={styles.serviceMeta}>
                        <Clock size={12} color={LIGHT_COLORS.textMuted} />
                        <Text style={styles.serviceDuration}>{service.duration} min</Text>
                      </View>
                    </View>
                    <Text style={[styles.servicePrice, isSelected && styles.servicePriceSelected]}>
                      {formatPrice(service.price)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Animated.View>

        <Animated.View entering={webSafeFadeInDown(200, 300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Service Location</Text>
          
          <View style={styles.locationOptions}>
            <Pressable
              style={[styles.locationOption, !isHomeService && styles.locationOptionSelected]}
              onPress={() => setIsHomeService(false)}
            >
              <View style={[styles.locationIcon, !isHomeService && styles.locationIconSelected]}>
                <Scissors size={20} color={!isHomeService ? COLORS.textInverse : LIGHT_COLORS.textMuted} />
              </View>
              <Text style={[styles.locationLabel, !isHomeService && styles.locationLabelSelected]}>
                At Barber's Location
              </Text>
            </Pressable>

            <Pressable
              style={[styles.locationOption, isHomeService && styles.locationOptionSelected]}
              onPress={() => setIsHomeService(true)}
            >
              <View style={[styles.locationIcon, isHomeService && styles.locationIconSelected]}>
                <Home size={20} color={isHomeService ? COLORS.textInverse : LIGHT_COLORS.textMuted} />
              </View>
              <View>
                <Text style={[styles.locationLabel, isHomeService && styles.locationLabelSelected]}>
                  Home Service
                </Text>
                <Text style={styles.locationSurcharge}>+{formatPrice(HOME_SERVICE_SURCHARGE)}</Text>
              </View>
            </Pressable>
          </View>

          {isHomeService && (
            <Animated.View entering={webSafeFadeInDown(0, 200)} style={styles.addressInput}>
              <MapPin size={20} color={LIGHT_COLORS.textMuted} />
              <TextInput
                style={styles.addressTextInput}
                placeholder="Enter your home address"
                placeholderTextColor={LIGHT_COLORS.textMuted}
                value={homeAddress}
                onChangeText={setHomeAddress}
                multiline
              />
            </Animated.View>
          )}
        </Animated.View>

        <Animated.View entering={webSafeFadeInDown(300, 300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Any special requests or preferences..."
            placeholderTextColor={LIGHT_COLORS.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>
              {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} · {duration} min
            </Text>
            <Text style={styles.summaryTotal}>{formatPrice(total)}</Text>
          </View>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={selectedServices.length === 0 || isSubmitting}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
            labelStyle={styles.submitButtonLabel}
          >
            Request Booking
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: LIGHT_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_COLORS.border,
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  barberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  barberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barberInitials: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textInverse,
  },
  barberDetails: {
    marginLeft: SPACING.md,
  },
  barberName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.textPrimary,
  },
  barberRating: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textMuted,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  servicesList: {
    gap: SPACING.sm,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
  },
  serviceItemSelected: {
    borderColor: COLORS.copper,
    backgroundColor: COLORS.copperMuted,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: LIGHT_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  checkboxSelected: {
    backgroundColor: COLORS.copper,
    borderColor: COLORS.copper,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.medium,
    color: LIGHT_COLORS.textPrimary,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    marginTop: SPACING.xxs,
  },
  serviceDuration: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textMuted,
  },
  servicePrice: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textSecondary,
  },
  servicePriceSelected: {
    color: COLORS.copper,
  },
  locationOptions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  locationOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    backgroundColor: LIGHT_COLORS.surface,
    gap: SPACING.sm,
  },
  locationOptionSelected: {
    borderColor: COLORS.copper,
    backgroundColor: COLORS.copperMuted,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationIconSelected: {
    backgroundColor: COLORS.copper,
  },
  locationLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: LIGHT_COLORS.textSecondary,
  },
  locationLabelSelected: {
    color: LIGHT_COLORS.textPrimary,
  },
  locationSurcharge: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.copper,
    marginTop: 2,
  },
  addressInput: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: LIGHT_COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  addressTextInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: LIGHT_COLORS.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  notesInput: {
    backgroundColor: LIGHT_COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    fontSize: TYPOGRAPHY.base,
    color: LIGHT_COLORS.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: LIGHT_COLORS.surface,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: LIGHT_COLORS.border,
    ...SHADOWS.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textMuted,
  },
  summaryTotal: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
  },
  submitButton: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.copper,
  },
  submitButtonContent: {
    height: 48,
    paddingHorizontal: SPACING.lg,
  },
  submitButtonLabel: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
  },
});
