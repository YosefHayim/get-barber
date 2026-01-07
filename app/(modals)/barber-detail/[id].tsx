import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
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
  MapPin,
  BadgeCheck,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { DARK_COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { useBookingStore } from '@/stores/useBookingStore';
import { MOCK_BARBERS } from '@/constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PORTFOLIO_IMAGE_SIZE = 128;

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

  const formattedDistance =
    barber.distanceMeters < 1000
      ? `${barber.distanceMeters}m`
      : `${(barber.distanceMeters / 1000).toFixed(1)}km`;

  const priceRange = barber.priceMin <= 50 ? '$' : barber.priceMin <= 80 ? '$$' : '$$$';

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
            }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(16, 22, 34, 0.5)', DARK_COLORS.background]}
            style={styles.heroGradient}
          />

          <View style={[styles.headerNav, { paddingTop: insets.top + 8 }]}>
            <LinearGradient
              colors={['rgba(0, 0, 0, 0.6)', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.navButtonsRight}>
              <TouchableOpacity
                style={[styles.navButton, isFavorite && styles.navButtonFavorite]}
                onPress={() => setIsFavorite(!isFavorite)}
              >
                <Heart
                  size={22}
                  color={isFavorite ? DARK_COLORS.error : '#fff'}
                  fill={isFavorite ? DARK_COLORS.error : 'transparent'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton}>
                <Share2 size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroContent}>
            <View style={styles.badgesRow}>
              {barber.isOnline && (
                <View style={styles.onlineBadge}>
                  <View style={styles.onlineDot}>
                    <Animated.View
                      style={styles.onlineDotPing}
                      entering={FadeIn.duration(1000)}
                    />
                    <View style={styles.onlineDotCore} />
                  </View>
                  <Text style={styles.onlineBadgeText}>ONLINE</Text>
                </View>
              )}
              {barber.isVerified && (
                <View style={styles.verifiedBadge}>
                  <BadgeCheck size={14} color={DARK_COLORS.primary} />
                  <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
                </View>
              )}
            </View>
            <Animated.Text entering={FadeInDown.delay(100).duration(400)} style={styles.barberName}>
              {barber.displayName}
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(200).duration(400)} style={styles.barberBio}>
              {barber.specialties.join(' • ')}
            </Animated.Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{barber.rating.toFixed(1)}</Text>
              <Star size={16} color={DARK_COLORS.accent} fill={DARK_COLORS.accent} />
            </View>
            <Text style={styles.statLabel}>({barber.totalReviews} reviews)</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formattedDistance}</Text>
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
                entering={FadeIn.delay(index * 100).duration(400)}
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.servicesList}>
            {services.map((service, index) => {
              const isSelected = selectedServices.includes(service.id);
              return (
                <Animated.View
                  key={service.id}
                  entering={FadeInRight.delay(index * 100).duration(400)}
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
                        <Clock size={12} color={DARK_COLORS.textMuted} />
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
                      <Star key={i} size={12} color={DARK_COLORS.accent} fill={DARK_COLORS.accent} />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.bottomBarContent}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₪{totalPrice || barber.priceMin}</Text>
          </View>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookAppointment}
            activeOpacity={0.8}
          >
            <Text style={styles.bookButtonText}>Book Appointment</Text>
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>
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
    backgroundColor: DARK_COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  heroSection: {
    height: 320,
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
  headerNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: DARK_COLORS.primary,
    letterSpacing: 0.5,
  },
  barberName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  barberBio: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
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
    color: DARK_COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: DARK_COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
    color: DARK_COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_COLORS.primary,
  },
  portfolioScroll: {
    gap: 12,
    paddingBottom: 8,
  },
  portfolioImage: {
    width: PORTFOLIO_IMAGE_SIZE,
    height: PORTFOLIO_IMAGE_SIZE,
    borderRadius: 12,
    backgroundColor: DARK_COLORS.surface,
  },
  servicesList: {
    gap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK_COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  serviceCardSelected: {
    borderColor: 'rgba(59, 130, 246, 0.5)',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
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
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: DARK_COLORS.textPrimary,
    flex: 1,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: DARK_COLORS.textPrimary,
  },
  serviceDescription: {
    fontSize: 13,
    color: DARK_COLORS.textMuted,
    marginBottom: 8,
  },
  serviceDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceDuration: {
    fontSize: 12,
    color: DARK_COLORS.textMuted,
  },
  serviceAddButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DARK_COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceAddButtonSelected: {
    backgroundColor: DARK_COLORS.primary,
    shadowColor: DARK_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  reviewCard: {
    backgroundColor: DARK_COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    backgroundColor: DARK_COLORS.surfaceLight,
  },
  reviewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK_COLORS.textPrimary,
    marginBottom: 2,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: DARK_COLORS.textMuted,
  },
  reviewText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(16, 22, 34, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingTop: 16,
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
    color: DARK_COLORS.textMuted,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: DARK_COLORS.textPrimary,
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: DARK_COLORS.primary,
    height: 48,
    borderRadius: 12,
    shadowColor: DARK_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
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
