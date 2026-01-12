import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Image,
  Alert,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  ArrowLeft,
  SlidersHorizontal,
  Flame,
  Clock,
  Calendar,
  Copy,
  Check,
  ChevronRight,
  Ticket,
} from 'lucide-react-native';
import { SHADOWS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';

// Light theme colors matching the design
const LIGHT_COLORS = {
  background: '#f6f8f8',
  surface: '#ffffff',
  surfaceHighlight: '#f8fafa',
  primary: '#11a4d4',
  primaryDark: '#0d8ab3',
  primaryMuted: 'rgba(17, 164, 212, 0.1)',
  accent: '#f59e0b',
  accentMuted: 'rgba(245, 158, 11, 0.12)',
  accentDark: '#ea580c',
  textPrimary: '#111618',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e5e7eb',
  borderLight: '#f1f5f9',
  hotDeal: '#ef4444',
  hotDealBg: 'rgba(239, 68, 68, 0.1)',
  bundle: '#1f2937',
  success: '#10b981',
};

type Category = 'all' | 'haircuts' | 'beard' | 'packages' | 'products';

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  discountType: 'percentage' | 'fixed' | 'bundle' | 'gift';
  code?: string;
  expiresIn: string;
  image: string;
  category: Category;
  isFeatured?: boolean;
  buttonText: string;
  buttonStyle: 'primary' | 'outline';
}

interface FlashCategory {
  id: string;
  name: string;
  image: string;
  hasNew: boolean;
}

// Mock data for promotions
const FEATURED_PROMOTION: Promotion = {
  id: 'featured-1',
  title: 'Summer Special: Free Premium Kit',
  description: 'Get a free grooming kit with every home visit booking above $60.',
  discount: 'FREE',
  discountType: 'gift',
  expiresIn: '14 hours',
  image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
  category: 'all',
  isFeatured: true,
  buttonText: 'Redeem',
  buttonStyle: 'primary',
};

const PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    title: 'Morning Fresh Cut',
    description: 'Get 20% off on all haircuts booked between 8 AM - 11 AM.',
    discount: '-20%',
    discountType: 'percentage',
    code: 'MORNING20',
    expiresIn: '2 days',
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80',
    category: 'haircuts',
    buttonText: 'Book Now',
    buttonStyle: 'outline',
  },
  {
    id: 'promo-2',
    title: 'Refer a Friend',
    description: 'Invite a friend to join and you both get $10 credit on your wallet.',
    discount: '$10',
    discountType: 'fixed',
    expiresIn: 'No expiry',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80',
    category: 'all',
    buttonText: 'Invite',
    buttonStyle: 'primary',
  },
  {
    id: 'promo-3',
    title: 'The Executive Package',
    description: 'Includes haircut, beard trim, and hot towel shave. Save $15.',
    discount: 'BUNDLE',
    discountType: 'bundle',
    code: 'BOSS15',
    expiresIn: '5 days',
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80',
    category: 'packages',
    buttonText: 'Book Now',
    buttonStyle: 'outline',
  },
  {
    id: 'promo-4',
    title: 'Beard Perfection Deal',
    description: 'Premium beard trim and oil treatment at 30% off this week.',
    discount: '-30%',
    discountType: 'percentage',
    code: 'BEARD30',
    expiresIn: '3 days',
    image: 'https://images.unsplash.com/photo-1621605774941-ad4f4e58a3f4?w=800&q=80',
    category: 'beard',
    buttonText: 'Book Now',
    buttonStyle: 'outline',
  },
  {
    id: 'promo-5',
    title: 'First Time User',
    description: 'Welcome to GetBarber! Enjoy 25% off your first booking.',
    discount: '-25%',
    discountType: 'percentage',
    code: 'WELCOME25',
    expiresIn: '7 days',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
    category: 'all',
    buttonText: 'Apply',
    buttonStyle: 'primary',
  },
];

const FLASH_CATEGORIES: FlashCategory[] = [
  {
    id: 'flash-1',
    name: 'Beard Trims',
    image: 'https://images.unsplash.com/photo-1621605774941-ad4f4e58a3f4?w=400&q=80',
    hasNew: true,
  },
  {
    id: 'flash-2',
    name: 'Shaves',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80',
    hasNew: false,
  },
  {
    id: 'flash-3',
    name: 'Products',
    image: 'https://images.unsplash.com/photo-1596704017254-9759879d4eec?w=400&q=80',
    hasNew: false,
  },
  {
    id: 'flash-4',
    name: 'Combos',
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80',
    hasNew: true,
  },
  {
    id: 'flash-5',
    name: 'Tools',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80',
    hasNew: false,
  },
];

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all', label: 'All Offers' },
  { id: 'haircuts', label: 'Haircuts' },
  { id: 'beard', label: 'Beard' },
  { id: 'packages', label: 'Packages' },
  { id: 'products', label: 'Products' },
];

// Category Chip Component
const CategoryChip = ({
  category,
  isActive,
  onPress,
}: {
  category: { id: Category; label: string };
  isActive: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[
      styles.categoryChip,
      isActive && styles.categoryChipActive,
    ]}
  >
    <Text
      style={[
        styles.categoryChipText,
        isActive && styles.categoryChipTextActive,
      ]}
    >
      {category.label}
    </Text>
  </TouchableOpacity>
);

// Flash Category Circle Component
const FlashCategoryItem = ({
  item,
  index,
}: {
  item: FlashCategory;
  index: number;
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInRight.delay(index * 80).duration(400)}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.flashCategoryContainer}
      >
        <Animated.View
          style={[
            styles.flashCategoryRing,
            item.hasNew && styles.flashCategoryRingActive,
            animatedStyle,
          ]}
        >
          <View style={styles.flashCategoryImageWrapper}>
            <Image source={{ uri: item.image }} style={styles.flashCategoryImage} />
          </View>
        </Animated.View>
        <Text style={styles.flashCategoryName} numberOfLines={1}>
          {item.name}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

// Hero Promotion Card
const HeroPromotionCard = ({ promotion }: { promotion: Promotion }) => {
  const handleRedeem = () => {
    Alert.alert('Redeem Offer', 'This offer will be applied to your next booking!', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Redeem Now', onPress: () => console.log('Redeemed') },
    ]);
  };

  return (
    <Animated.View entering={FadeInDown.duration(600).delay(200)}>
      <TouchableOpacity
        activeOpacity={0.95}
        style={styles.heroCard}
        onPress={handleRedeem}
      >
        <ImageBackground
          source={{ uri: promotion.image }}
          style={styles.heroImage}
          imageStyle={styles.heroImageStyle}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
            style={styles.heroGradient}
          >
            {/* Hot Deal Badge */}
            <View style={styles.hotDealBadge}>
              <Flame size={14} color={LIGHT_COLORS.accent} fill={LIGHT_COLORS.accent} />
              <Text style={styles.hotDealText}>HOT DEAL</Text>
            </View>

            {/* Content */}
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{promotion.title}</Text>
              <Text style={styles.heroDescription}>{promotion.description}</Text>

              {/* Divider */}
              <View style={styles.heroDivider} />

              {/* Footer */}
              <View style={styles.heroFooter}>
                <View>
                  <Text style={styles.heroExpiresLabel}>Expires in</Text>
                  <View style={styles.heroExpiresRow}>
                    <Clock size={14} color={LIGHT_COLORS.accent} />
                    <Text style={styles.heroExpiresValue}>{promotion.expiresIn}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleRedeem}
                  activeOpacity={0.8}
                  style={styles.heroRedeemButton}
                >
                  <Text style={styles.heroRedeemButtonText}>{promotion.buttonText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Promotion Card Component
const PromotionCard = ({
  promotion,
  index,
}: {
  promotion: Promotion;
  index: number;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = useCallback(async () => {
    if (promotion.code) {
      try {
        await Clipboard.setStringAsync(promotion.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        Alert.alert('Error', 'Failed to copy code');
      }
    }
  }, [promotion.code]);

  const handleBook = () => {
    Alert.alert('Book Service', `Apply promo "${promotion.title}" to your next booking?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Book Now', onPress: () => router.push('/(tabs)/home') },
    ]);
  };

  const getDiscountBadgeStyle = () => {
    switch (promotion.discountType) {
      case 'bundle':
        return { backgroundColor: LIGHT_COLORS.bundle };
      case 'gift':
        return { backgroundColor: LIGHT_COLORS.success };
      default:
        return { backgroundColor: LIGHT_COLORS.primary };
    }
  };

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(300 + index * 80)}>
      <View style={styles.promoCard}>
        {/* Image Section */}
        <View style={styles.promoImageContainer}>
          <Image source={{ uri: promotion.image }} style={styles.promoImage} />
          {/* Discount Badge */}
          <View style={[styles.discountBadge, getDiscountBadgeStyle()]}>
            <Text style={styles.discountBadgeText}>{promotion.discount}</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.promoContent}>
          <View style={styles.promoHeader}>
            <Text style={styles.promoTitle} numberOfLines={1}>
              {promotion.title}
            </Text>
            {promotion.code && (
              <TouchableOpacity
                onPress={handleCopyCode}
                activeOpacity={0.7}
                style={styles.copyIconButton}
              >
                {copied ? (
                  <Check size={18} color={LIGHT_COLORS.success} />
                ) : (
                  <Copy size={18} color={LIGHT_COLORS.primary} />
                )}
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.promoDescription} numberOfLines={2}>
            {promotion.description}
          </Text>

          {/* Footer */}
          <View style={styles.promoFooter}>
            <View style={styles.promoMeta}>
              {promotion.code && (
                <Text style={styles.promoCode}>Code: {promotion.code}</Text>
              )}
              <View style={styles.promoExpiry}>
                <Calendar size={12} color={LIGHT_COLORS.textMuted} />
                <Text style={styles.promoExpiryText}>
                  {promotion.expiresIn === 'No expiry' ? 'No expiry' : `Expires in ${promotion.expiresIn}`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleBook}
              activeOpacity={0.8}
              style={[
                styles.promoButton,
                promotion.buttonStyle === 'primary'
                  ? styles.promoButtonPrimary
                  : styles.promoButtonOutline,
              ]}
            >
              <Text
                style={[
                  styles.promoButtonText,
                  promotion.buttonStyle === 'outline' && styles.promoButtonTextOutline,
                ]}
              >
                {promotion.buttonText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

// Empty State Component
const EmptyState = () => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIconWrapper}>
      <Ticket size={48} color={LIGHT_COLORS.textMuted} />
    </View>
    <Text style={styles.emptyTitle}>No promotions available</Text>
    <Text style={styles.emptySubtitle}>
      Check back later for exciting deals and offers!
    </Text>
  </View>
);

export default function PromotionsScreen(): React.JSX.Element {
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filteredPromotions = PROMOTIONS.filter(
    (promo) => activeCategory === 'all' || promo.category === activeCategory
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBackButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={LIGHT_COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promotions</Text>
        <TouchableOpacity
          onPress={() => Alert.alert('Filter', 'Filter options coming soon!')}
          style={styles.headerFilterButton}
          activeOpacity={0.7}
        >
          <SlidersHorizontal size={22} color={LIGHT_COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Chips */}
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORIES.map((category) => (
              <CategoryChip
                key={category.id}
                category={category}
                isActive={activeCategory === category.id}
                onPress={() => setActiveCategory(category.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Hero Promotion */}
        <View style={styles.heroSection}>
          <HeroPromotionCard promotion={FEATURED_PROMOTION} />
        </View>

        {/* Flash Categories */}
        <View style={styles.flashSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Flash Categories</Text>
            <TouchableOpacity style={styles.seeAllButton} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={16} color={LIGHT_COLORS.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flashContainer}
          >
            {FLASH_CATEGORIES.map((item, index) => (
              <FlashCategoryItem key={item.id} item={item} index={index} />
            ))}
          </ScrollView>
        </View>

        {/* Promotions List */}
        <View style={styles.promosSection}>
          <Text style={styles.sectionTitle}>More Offers for You</Text>

          {filteredPromotions.length > 0 ? (
            <View style={styles.promosList}>
              {filteredPromotions.map((promotion, index) => (
                <PromotionCard key={promotion.id} promotion={promotion} index={index} />
              ))}
            </View>
          ) : (
            <EmptyState />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: LIGHT_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_COLORS.border,
  },
  headerBackButton: {
    marginRight: SPACING.md,
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
    textAlign: 'center',
    marginRight: 32, // Balance the back button
  },
  headerFilterButton: {
    padding: 4,
  },

  // Categories Section
  categoriesSection: {
    backgroundColor: LIGHT_COLORS.background,
    paddingVertical: SPACING.lg,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  categoryChip: {
    height: 36,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full,
    backgroundColor: LIGHT_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  categoryChipActive: {
    backgroundColor: LIGHT_COLORS.primary,
  },
  categoryChipText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: LIGHT_COLORS.textPrimary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.bold,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  heroCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  heroImage: {
    height: 224,
  },
  heroImageStyle: {
    borderRadius: RADIUS.xl,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  hotDealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  hotDealText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.extrabold,
    color: LIGHT_COLORS.textPrimary,
    letterSpacing: 1,
  },
  heroContent: {
    gap: SPACING.sm,
  },
  heroTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.extrabold,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  heroDescription: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: SPACING.xs,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  heroExpiresLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.medium,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroExpiresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 2,
  },
  heroExpiresValue: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.accent,
  },
  heroRedeemButton: {
    backgroundColor: LIGHT_COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOWS.md,
  },
  heroRedeemButtonText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
    color: '#FFFFFF',
  },

  // Flash Categories Section
  flashSection: {
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.primary,
  },
  flashContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.lg,
  },
  flashCategoryContainer: {
    alignItems: 'center',
    width: 72,
    gap: SPACING.sm,
  },
  flashCategoryRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 2,
    backgroundColor: LIGHT_COLORS.border,
  },
  flashCategoryRingActive: {
    backgroundColor: LIGHT_COLORS.primary,
  },
  flashCategoryImageWrapper: {
    flex: 1,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: LIGHT_COLORS.surface,
    overflow: 'hidden',
    backgroundColor: LIGHT_COLORS.surface,
  },
  flashCategoryImage: {
    width: '100%',
    height: '100%',
  },
  flashCategoryName: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.medium,
    color: LIGHT_COLORS.textPrimary,
    textAlign: 'center',
  },

  // Promotions List Section
  promosSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  promosList: {
    gap: SPACING.lg,
    marginTop: SPACING.lg,
  },
  promoCard: {
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: LIGHT_COLORS.borderLight,
    ...SHADOWS.sm,
  },
  promoImageContainer: {
    height: 160,
    position: 'relative',
  },
  promoImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    ...SHADOWS.sm,
  },
  discountBadgeText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.extrabold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  promoContent: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  copyIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: LIGHT_COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoDescription: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.regular,
    color: LIGHT_COLORS.textSecondary,
    lineHeight: 20,
  },
  promoFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: LIGHT_COLORS.borderLight,
  },
  promoMeta: {
    flex: 1,
    gap: SPACING.xs,
  },
  promoCode: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promoExpiry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 2,
  },
  promoExpiryText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.regular,
    color: LIGHT_COLORS.textMuted,
  },
  promoButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  promoButtonPrimary: {
    backgroundColor: LIGHT_COLORS.primary,
  },
  promoButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: LIGHT_COLORS.primary,
  },
  promoButtonText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: '#FFFFFF',
  },
  promoButtonTextOutline: {
    color: LIGHT_COLORS.primary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING['5xl'],
    paddingHorizontal: SPACING['3xl'],
  },
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: LIGHT_COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.regular,
    color: LIGHT_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
