import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Star, MapPin, Verified, Sparkles } from 'lucide-react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import type { MockBarber } from '@/constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - SPACING.xl * 2;
const CARD_SPACING = SPACING.md;

interface FeaturedCarouselProps {
  barbers: MockBarber[];
  onBarberPress: (barber: MockBarber) => void;
}

export function FeaturedCarousel({ barbers, onBarberPress }: FeaturedCarouselProps): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (CARD_WIDTH + CARD_SPACING));
    setActiveIndex(index);
  };

  const renderItem = ({ item, index }: { item: MockBarber; index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 100).duration(400)}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => onBarberPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.featuredBadge}>
          <Sparkles size={12} color={COLORS.goldDark} />
          <Text style={styles.featuredText}>Featured</Text>
        </View>

        <View style={styles.cardHeader}>
          <Image
            source={{ uri: item.avatarUrl || 'https://via.placeholder.com/80' }}
            style={styles.avatar}
          />
          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {item.displayName}
              </Text>
              {item.isVerified && (
                <Verified size={16} color={COLORS.gold} fill={COLORS.goldMuted} />
              )}
            </View>
            <View style={styles.ratingRow}>
              <Star size={14} color={COLORS.gold} fill={COLORS.gold} />
              <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
              <Text style={styles.reviews}>({item.totalReviews} reviews)</Text>
            </View>
            <View style={styles.distanceRow}>
              <MapPin size={12} color={COLORS.textMuted} />
              <Text style={styles.distance}>
                {item.distanceMeters < 1000
                  ? `${item.distanceMeters}m away`
                  : `${(item.distanceMeters / 1000).toFixed(1)}km away`}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.bio} numberOfLines={2}>
          {item.bio}
        </Text>

        <View style={styles.specialtiesContainer}>
          {item.specialties.slice(0, 3).map((specialty) => (
            <View key={specialty} style={styles.specialtyChip}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Starting from</Text>
            <Text style={styles.price}>₪{item.priceMin}</Text>
          </View>
          <View style={styles.bookButton}>
            <Text style={styles.bookButtonText}>View Profile</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Featured Barbers</Text>
        <View style={styles.pagination}>
          {barbers.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={barbers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  pagination: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.borderLight,
  },
  dotActive: {
    backgroundColor: COLORS.gold,
    width: 18,
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    gap: CARD_SPACING,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.gold,
    ...SHADOWS.lg,
  },
  featuredBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    backgroundColor: COLORS.goldMuted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.full,
  },
  featuredText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.goldDark,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.backgroundSecondary,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xxs,
  },
  name: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    marginBottom: SPACING.xxs,
  },
  rating: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  reviews: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  distance: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
  },
  bio: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  specialtyChip: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.full,
  },
  specialtyText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {},
  priceLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
  },
  price: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: '700',
    color: COLORS.goldDark,
  },
  bookButton: {
    backgroundColor: COLORS.goldDark,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  bookButtonText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textInverse,
  },
});
