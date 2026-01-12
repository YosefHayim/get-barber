import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Star,
  Clock,
  Heart,
  Share2,
  ChevronRight,
  Check,
  Plus,
  BadgeCheck,
} from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { webSafeFadeIn, webSafeFadeInDown, webSafeFadeInRight } from '@/utils/animations';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';

const LIGHT_THEME = {
  background: COLORS.background,
  surface: COLORS.surface,
  primary: COLORS.primary,
  textPrimary: COLORS.textPrimary,
  textSecondary: COLORS.textSecondary,
  textMuted: COLORS.textMuted,
  border: COLORS.border,
  accent: COLORS.accent,
  error: '#ef4444',
  success: '#22c55e',
};
import { useBookingStore } from '@/stores/useBookingStore';
import { MOCK_BARBERS } from '@/constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PORTFOLIO_IMAGE_SIZE = 128;
const HEADER_HEIGHT = 320;

const MOCK_PORTFOLIO = [
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=300',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300',
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300',
  'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=300',
];

const MOCK_REVIEWS = [
  {
    id: '1',
    customerName: 'Michael R.',
    rating: 5,
    text: 'Alex is the real deal. Arrived right on time at my apartment and set up in minutes. The fade is cleaner than any shop I\'ve been to. Highly recommend!',
    date: '2d ago',
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100',
  },
];

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
}

export default function BarberDetailScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const selectedBarber = useBookingStore((s) => s.selectedBarber);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const barber = MOCK_BARBERS.find((b) => b.id === id) || {
    id: id || 'unknown',
    displayName: selectedBarber?.display_name || 'Demo Barber',
    avatarUrl: selectedBarber?.avatar_url || null,
    bio: selectedBarber?.bio || 'Professional barber with years of experience.',
    rating: selectedBarber?.rating || 4.8,
    totalReviews: selectedBarber?.total_reviews || 124,
    isVerified: selectedBarber?.is_verified || true,
    distanceMeters: selectedBarber?.distance_meters || 2500,
    priceMin: selectedBarber?.price_min || 50,
    priceMax: selectedBarber?.price_max || 150,
    isOnline: true,
    specialties: ['Classic Cuts', 'Fades', 'Beard Styling'],
    yearsExperience: 10,
    userId: '',
    homeServiceAvailable: true,
    homeServiceSurcharge: 30,
  };

  const services: ServiceItem[] = [
    { id: '1', name: 'Skin Fade', price: barber.priceMin, duration: '45 min', description: 'Precise fade with straight razor lineup.' },
    { id: '2', name: 'Beard Sculpt & Trim', price: Math.round(barber.priceMin * 0.7), duration: '25 min', description: 'Shape up, trim, and hot towel finish.' },
    { id: '3', name: 'The Full Experience', price: barber.priceMax, duration: '60 min', description: 'Haircut, beard trim, wash & style.' },
    { id: '4', name: 'Kids Cut', price: Math.round(barber.priceMin * 0.7), duration: '30 min', description: 'Patient and stylish cuts for under 12s.' },
  ];

  const toggleService = useCallback((serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  }, []);

  const totalPrice = services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  const handleBookAppointment = useCallback(() => {
    router.back();
  }, []);

  const priceRange = barber.priceMin <= 50 ? '$' : barber.priceMin <= 80 ? '$$' : '$$$';

  return (
    <View style={styles.container}>
      {/* Fixed Header Navigation - overlays the image */}
      <View style={[styles.fixedHeaderNav, { paddingTop: insets.top + 8 }]}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.6)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.navButtonsRight}>
          <TouchableOpacity
            style={[styles.navButton, isFavorite && styles.navButtonFavorite]}
            onPress={() => setIsFavorite(!isFavorite)}
            activeOpacity={0.7}
          >
            <Heart
              size={22}
              color={isFavorite ? LIGHT_THEME.error : '#fff'}
              fill={isFavorite ? LIGHT_THEME.error : 'transparent'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} activeOpacity={0.7}>
            <Share2 size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Full-Width Header Image */}
        <View style={styles.heroSection}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
            }}
            style={styles.heroImage}
          />
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(246, 246, 248, 0.5)', LIGHT_THEME.background]}
            locations={[0, 0.5, 1]}
            style={styles.heroGradient}
          />

          {/* Barber Info Overlay at bottom of header */}
          <View style={styles.heroContent}>
            {/* Status Badges */}
            <View style={styles.badgesRow}>
              {barber.isOnline && (
                <View style={styles.onlineBadge}>
                  <View style={styles.onlineDot}>
                    <Animated.View
                      style={styles.onlineDotPing}
                      entering={webSafeFadeIn(1000)}
                    />
                    <View style={styles.onlineDotCore} />
                  </View>
                  <Text style={styles.onlineBadgeText}>ONLINE</Text>
                </View>
              )}
              {barber.isVerified && (
                <View style={styles.verifiedBadge}>
                  <BadgeCheck size={16} color={LIGHT_THEME.primary} />
                  <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
                </View>
              )}
            </View>
            {/* Barber Name */}
            <Animated.Text entering={webSafeFadeInDown(100, 400)} style={styles.barberName}>
              {barber.displayName}
            </Animated.Text>
            {/* Specialty Text */}
            <Animated.Text entering={webSafeFadeInDown(200, 400)} style={styles.barberBio}>
              Specialist in {barber.specialties.slice(0, 2).join(' & ').toLowerCase()}
            </Animated.Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{barber.rating.toFixed(1)}</Text>
              <Star size={18} color={LIGHT_THEME.accent} fill={LIGHT_THEME.accent} />
            </View>
            <Text style={styles.statLabel}>({barber.totalReviews} reviews)</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>
                {barber.distanceMeters < 1000
                  ? barber.distanceMeters
                  : (barber.distanceMeters / 1000).toFixed(1)}
              </Text>
              <Text style={styles.statUnit}>
                {barber.distanceMeters < 1000 ? 'm' : 'km'}
              </Text>
            </View>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{priceRange}</Text>
            <Text style={styles.statLabel}>Price Range</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Work</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.portfolioScroll}
          >
            {MOCK_PORTFOLIO.map((imageUrl, index) => (
              <Animated.View
                key={index}
                entering={webSafeFadeIn(400)}
              >
                <TouchableOpacity
                  onPress={() => setSelectedImage(imageUrl)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: imageUrl }} style={styles.portfolioImage} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.servicesSectionTitle}>Services</Text>
          <View style={styles.servicesList}>
            {services.map((service, index) => {
              const isSelected = selectedServices.includes(service.id);
              return (
                <Animated.View
                  key={service.id}
                  entering={webSafeFadeInRight(index * 100, 400)}
                >
                  <TouchableOpacity
                    style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
                    onPress={() => toggleService(service.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.serviceInfo}>
                      <View style={styles.serviceHeader}>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <Text style={styles.servicePrice}>₪{service.price}</Text>
                      </View>
                      <Text style={styles.serviceDescription} numberOfLines={1}>
                        {service.description}
                      </Text>
                      <View style={styles.serviceDurationRow}>
                        <Clock size={12} color={LIGHT_THEME.textMuted} />
                        <Text style={styles.serviceDuration}>{service.duration}</Text>
                      </View>
                    </View>
                    <View style={[styles.serviceAddButton, isSelected && styles.serviceAddButtonSelected]}>
                      {isSelected ? (
                        <Check size={18} color="#fff" />
                      ) : (
                        <Plus size={18} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What clients say</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View all {barber.totalReviews}</Text>
            </TouchableOpacity>
          </View>
          {MOCK_REVIEWS.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Image
                  source={{ uri: review.avatarUrl || 'https://via.placeholder.com/40' }}
                  style={styles.reviewAvatar}
                />
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewerName}>{review.customerName}</Text>
                  <View style={styles.reviewStars}>
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} size={12} color={LIGHT_THEME.accent} fill={LIGHT_THEME.accent} />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <Text style={styles.reviewText}>"{review.text}"</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={[StyleSheet.absoluteFill, styles.bottomBarBackground]} />
        <View style={styles.bottomBarContent}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${totalPrice || barber.priceMin}.00</Text>
          </View>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookAppointment}
            activeOpacity={0.85}
          >
            <Text style={styles.bookButtonText}>Book Appointment</Text>
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Home Indicator Area */}
        <View style={styles.homeIndicator}>
          <View style={styles.homeIndicatorBar} />
        </View>
      </View>

      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View style={styles.imageModal}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setSelectedImage(null)}
          >
            <ArrowLeft size={28} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_THEME.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  // Fixed header navigation that overlays the image
  fixedHeaderNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 50,
  },
  heroSection: {
    height: HEADER_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  navButtonFavorite: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  navButtonsRight: {
    flexDirection: 'row',
    gap: 12,
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  onlineDot: {
    width: 8,
    height: 8,
    position: 'relative',
  },
  onlineDotPing: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(74, 222, 128, 0.75)',
  },
  onlineDotCore: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  onlineBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4ade80',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(17, 164, 212, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(17, 164, 212, 0.3)',
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: LIGHT_THEME.primary,
    letterSpacing: 0.5,
  },
  barberName: {
    fontSize: 30,
    fontWeight: '700',
    color: LIGHT_THEME.textPrimary,
    marginBottom: 4,
  },
  barberBio: {
    fontSize: 14,
    color: LIGHT_THEME.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.border,
    backgroundColor: LIGHT_THEME.surface,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: LIGHT_THEME.textPrimary,
  },
  statUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: LIGHT_THEME.textMuted,
    marginLeft: 2,
  },
  statLabel: {
    fontSize: 12,
    color: LIGHT_THEME.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: LIGHT_THEME.border,
  },
  section: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: LIGHT_THEME.textPrimary,
  },
  servicesSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: LIGHT_THEME.textPrimary,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: LIGHT_THEME.primary,
  },
  portfolioScroll: {
    gap: 12,
    paddingBottom: 8,
  },
  portfolioImage: {
    width: PORTFOLIO_IMAGE_SIZE,
    height: PORTFOLIO_IMAGE_SIZE,
    borderRadius: 12,
    backgroundColor: LIGHT_THEME.surface,
  },
  servicesList: {
    gap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_THEME.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
  },
  serviceCardSelected: {
    borderColor: 'rgba(17, 164, 212, 0.5)',
    backgroundColor: 'rgba(17, 164, 212, 0.05)',
    shadowColor: LIGHT_THEME.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceInfo: {
    flex: 1,
    paddingRight: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: LIGHT_THEME.textPrimary,
    flex: 1,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: LIGHT_THEME.textPrimary,
  },
  serviceDescription: {
    fontSize: 14,
    color: LIGHT_THEME.textMuted,
    marginBottom: 0,
  },
  serviceDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  serviceDuration: {
    fontSize: 12,
    color: LIGHT_THEME.textMuted,
  },
  serviceAddButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: LIGHT_THEME.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceAddButtonSelected: {
    backgroundColor: LIGHT_THEME.primary,
    shadowColor: LIGHT_THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  reviewCard: {
    backgroundColor: LIGHT_THEME.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LIGHT_THEME.border,
  },
  reviewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '700',
    color: LIGHT_THEME.textPrimary,
    marginBottom: 2,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: LIGHT_THEME.textMuted,
  },
  reviewText: {
    fontSize: 14,
    color: LIGHT_THEME.textSecondary,
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: LIGHT_THEME.border,
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 50,
    overflow: 'hidden',
  },
  bottomBarBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  totalSection: {
    alignItems: 'flex-start',
  },
  totalLabel: {
    fontSize: 12,
    color: LIGHT_THEME.textMuted,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: LIGHT_THEME.textPrimary,
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: LIGHT_THEME.primary,
    height: 48,
    borderRadius: 8,
    shadowColor: LIGHT_THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  homeIndicator: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  homeIndicatorBar: {
    width: '33%',
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
  },
  imageModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 16,
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
});
