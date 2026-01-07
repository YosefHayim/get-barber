import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  ArrowLeft,
  MoreHorizontal,
  Check,
  Search,
  MapPin,
  Navigation,
  Home,
} from 'lucide-react-native';
import { DARK_COLORS } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SERVICES = [
  {
    id: '1',
    title: 'Standard Haircut',
    duration: '45 mins',
    description: 'Includes wash',
    price: 120,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200',
  },
  {
    id: '2',
    title: 'Beard Trim',
    duration: '20 mins',
    description: 'Shape up',
    price: 60,
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=200',
  },
  {
    id: '3',
    title: 'Hot Towel Shave',
    duration: '30 mins',
    description: 'Traditional',
    price: 80,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200',
  },
  {
    id: '4',
    title: 'Hair & Beard Combo',
    duration: '60 mins',
    description: 'Full grooming',
    price: 160,
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200',
  },
];

const generateDates = () => {
  const dates = [];
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      day: dayNames[date.getDay()],
      date: date.getDate(),
      isToday: i === 0,
    });
  }
  return dates;
};

const DATES = generateDates();

const TIME_SLOTS = [
  { time: '09:00 AM', available: false },
  { time: '10:00 AM', available: true },
  { time: '11:00 AM', available: true },
  { time: '12:00 PM', available: true },
  { time: '01:00 PM', available: true },
  { time: '02:30 PM', available: true },
  { time: '03:30 PM', available: true },
  { time: '04:30 PM', available: false },
  { time: '05:30 PM', available: true },
];

const STEPS = ['Service', 'Details', 'Confirm'];

export default function ServiceBookingScreen() {
  const { barberId } = useLocalSearchParams<{ barberId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedServices, setSelectedServices] = useState<string[]>(['1']);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>('11:00 AM');
  const [address, setAddress] = useState('123 Main St, Apt 4B');
  const [apartmentInfo, setApartmentInfo] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const totalPrice = useMemo(() => {
    return SERVICES.filter((s) => selectedServices.includes(s.id)).reduce(
      (sum, s) => sum + s.price,
      0
    );
  }, [selectedServices]);

  const selectedItemsCount = selectedServices.length;

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const clearAllServices = () => {
    setSelectedServices([]);
  };

  const handleContinue = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Sticky Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={DARK_COLORS.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Book at Home</Text>

          <TouchableOpacity style={styles.headerButton}>
            <MoreHorizontal size={24} color={DARK_COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLine} />
          <View
            style={[
              styles.progressLineActive,
              { width: `${(currentStep / 2) * 100}%` },
            ]}
          />

          {STEPS.map((step, index) => (
            <View key={step} style={styles.stepContainer}>
              <View
                style={[
                  styles.stepDot,
                  index <= currentStep && styles.stepDotActive,
                  index < currentStep && styles.stepDotCompleted,
                ]}
              >
                {index < currentStep && (
                  <Check size={10} color="#FFFFFF" strokeWidth={3} />
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.stepLabels}>
          {STEPS.map((step, index) => (
            <Text
              key={step}
              style={[
                styles.stepLabel,
                index === currentStep && styles.stepLabelActive,
              ]}
            >
              {step}
            </Text>
          ))}
        </View>
      </Animated.View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 120 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Services Section */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Services</Text>
            <TouchableOpacity onPress={clearAllServices}>
              <Text style={styles.clearAllText}>Clear all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.servicesContainer}>
            {SERVICES.map((service, index) => {
              const isSelected = selectedServices.includes(service.id);
              return (
                <Animated.View
                  key={service.id}
                  entering={FadeInDown.delay(150 + index * 50).duration(400)}
                >
                  <TouchableOpacity
                    style={[
                      styles.serviceCard,
                      isSelected && styles.serviceCardSelected,
                    ]}
                    onPress={() => toggleService(service.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.serviceContent}>
                      <Image
                        source={{ uri: service.image }}
                        style={styles.serviceImage}
                      />
                      <View style={styles.serviceInfo}>
                        <Text style={styles.serviceTitle}>{service.title}</Text>
                        <Text style={styles.serviceDuration}>
                          {service.duration} {'\u2022'} {service.description}
                        </Text>
                        <Text style={styles.servicePrice}>
                          {'\u20AA'}{service.price}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected && (
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      )}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        <View style={styles.divider} />

        {/* Date & Time Section */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>When should we arrive?</Text>
          <Text style={styles.sectionSubtitle}>
            Choose a date and start time.
          </Text>

          {/* Date Scroller */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dateScroller}
            contentContainerStyle={styles.dateScrollerContent}
          >
            {DATES.map((date, index) => (
              <Animated.View
                key={index}
                entering={FadeInRight.delay(350 + index * 30).duration(300)}
              >
                <TouchableOpacity
                  style={[
                    styles.dateCard,
                    selectedDate === index && styles.dateCardSelected,
                  ]}
                  onPress={() => setSelectedDate(index)}
                >
                  <Text
                    style={[
                      styles.dateDay,
                      selectedDate === index && styles.dateDaySelected,
                    ]}
                  >
                    {date.day}
                  </Text>
                  <Text
                    style={[
                      styles.dateNumber,
                      selectedDate === index && styles.dateNumberSelected,
                    ]}
                  >
                    {date.date}
                  </Text>
                  {date.isToday && (
                    <Text
                      style={[
                        styles.todayLabel,
                        selectedDate === index && styles.todayLabelSelected,
                      ]}
                    >
                      Today
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>

          {/* Time Grid */}
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((slot, index) => (
              <TouchableOpacity
                key={slot.time}
                style={[
                  styles.timeSlot,
                  !slot.available && styles.timeSlotDisabled,
                  selectedTime === slot.time && styles.timeSlotSelected,
                ]}
                onPress={() => slot.available && setSelectedTime(slot.time)}
                disabled={!slot.available}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    !slot.available && styles.timeSlotTextDisabled,
                    selectedTime === slot.time && styles.timeSlotTextSelected,
                  ]}
                >
                  {slot.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <View style={styles.divider} />

        {/* Location Section */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Where are we going?</Text>

          {/* Address Input */}
          <View style={styles.inputContainer}>
            <Search
              size={20}
              color={DARK_COLORS.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Search for your address..."
              placeholderTextColor={DARK_COLORS.textMuted}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          {/* Current Location Button */}
          <TouchableOpacity style={styles.currentLocationButton}>
            <Navigation size={18} color={DARK_COLORS.primary} />
            <Text style={styles.currentLocationText}>Use current location</Text>
          </TouchableOpacity>

          {/* Map Preview */}
          <View style={styles.mapPreview}>
            <Image
              source={{
                uri: 'https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/34.78,32.08,14,0/400x200?access_token=pk.placeholder',
              }}
              style={styles.mapImage}
              defaultSource={{ uri: 'https://via.placeholder.com/400x200/1C2333/3b82f6?text=Map' }}
            />
            <LinearGradient
              colors={['transparent', 'rgba(16, 22, 34, 0.9)']}
              style={styles.mapGradient}
            />
            <View style={styles.mapAddressBadge}>
              <View style={styles.mapAddressIcon}>
                <Home size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.mapAddressText}>{address}</Text>
            </View>
          </View>

          {/* Apartment Input */}
          <TextInput
            style={styles.apartmentInput}
            placeholder="Apartment, suite, etc. (optional)"
            placeholderTextColor={DARK_COLORS.textMuted}
            value={apartmentInfo}
            onChangeText={setApartmentInfo}
          />
        </Animated.View>
      </ScrollView>

      {/* Sticky Footer */}
      <Animated.View
        entering={FadeIn.delay(500).duration(300)}
        style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}
      >
        <View style={styles.footerContent}>
          {/* Order Summary */}
          <TouchableOpacity style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryLabel}>Order Summary</Text>
              <Text style={styles.summaryChevron}>{'\u25B2'}</Text>
            </View>
            <View style={styles.summaryRight}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>{'\u20AA'}{totalPrice}</Text>
            </View>
          </TouchableOpacity>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedServices.length === 0 && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={selectedServices.length === 0}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <View style={styles.itemCountBadge}>
              <Text style={styles.itemCountText}>
                {selectedItemsCount} Item{selectedItemsCount !== 1 ? 's' : ''}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_COLORS.background,
  },
  header: {
    backgroundColor: 'rgba(16, 22, 34, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: DARK_COLORS.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK_COLORS.textPrimary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
    paddingVertical: 16,
    position: 'relative',
  },
  progressLine: {
    position: 'absolute',
    left: 48,
    right: 48,
    top: '50%',
    height: 2,
    backgroundColor: DARK_COLORS.surfaceLight,
    borderRadius: 1,
  },
  progressLineActive: {
    position: 'absolute',
    left: 48,
    top: '50%',
    height: 2,
    backgroundColor: DARK_COLORS.primary,
    borderRadius: 1,
  },
  stepContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: DARK_COLORS.surfaceLight,
    borderWidth: 4,
    borderColor: DARK_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: DARK_COLORS.primary,
    shadowColor: DARK_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  stepDotCompleted: {
    backgroundColor: DARK_COLORS.primary,
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: DARK_COLORS.textMuted,
  },
  stepLabelActive: {
    color: DARK_COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: DARK_COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: DARK_COLORS.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: DARK_COLORS.primary,
  },
  servicesContainer: {
    gap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DARK_COLORS.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  serviceCardSelected: {
    borderColor: DARK_COLORS.primary,
    shadowColor: DARK_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: DARK_COLORS.surfaceLight,
  },
  serviceInfo: {
    marginLeft: 16,
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK_COLORS.textPrimary,
  },
  serviceDuration: {
    fontSize: 14,
    color: DARK_COLORS.textMuted,
    marginTop: 4,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_COLORS.primary,
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: DARK_COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: DARK_COLORS.primary,
    borderColor: DARK_COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: DARK_COLORS.border,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  dateScroller: {
    marginHorizontal: -16,
  },
  dateScrollerContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dateCard: {
    width: 64,
    height: 80,
    borderRadius: 16,
    backgroundColor: DARK_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  dateCardSelected: {
    backgroundColor: DARK_COLORS.primary,
    borderColor: DARK_COLORS.primary,
    shadowColor: DARK_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dateDay: {
    fontSize: 12,
    fontWeight: '500',
    color: DARK_COLORS.textMuted,
  },
  dateDaySelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: DARK_COLORS.textPrimary,
    marginTop: 2,
  },
  dateNumberSelected: {
    color: '#FFFFFF',
  },
  todayLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: DARK_COLORS.textMuted,
    marginTop: 4,
  },
  todayLabelSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  timeSlot: {
    width: (SCREEN_WIDTH - 32 - 24) / 3,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: DARK_COLORS.surface,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
    alignItems: 'center',
  },
  timeSlotDisabled: {
    backgroundColor: DARK_COLORS.surfaceLight,
    borderColor: 'transparent',
  },
  timeSlotSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: DARK_COLORS.primary,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
    color: DARK_COLORS.textPrimary,
  },
  timeSlotTextDisabled: {
    color: DARK_COLORS.textMuted,
  },
  timeSlotTextSelected: {
    color: DARK_COLORS.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK_COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: DARK_COLORS.textPrimary,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  currentLocationText: {
    fontSize: 14,
    fontWeight: '500',
    color: DARK_COLORS.primary,
  },
  mapPreview: {
    height: 128,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    backgroundColor: DARK_COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  mapAddressBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapAddressIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: DARK_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapAddressText: {
    fontSize: 14,
    fontWeight: '500',
    color: DARK_COLORS.textPrimary,
  },
  apartmentInput: {
    backgroundColor: DARK_COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    color: DARK_COLORS.textPrimary,
    marginTop: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 21, 21, 0.98)',
    borderTopWidth: 1,
    borderTopColor: DARK_COLORS.border,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  footerContent: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: DARK_COLORS.textMuted,
  },
  summaryChevron: {
    fontSize: 10,
    color: DARK_COLORS.textMuted,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: DARK_COLORS.textMuted,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK_COLORS.textPrimary,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DARK_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: DARK_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: DARK_COLORS.surfaceLight,
    shadowOpacity: 0,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  itemCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  itemCountText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
