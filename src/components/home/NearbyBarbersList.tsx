import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { Star, MapPin, Verified, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import type { MockBarber } from '@/constants/mockData';

interface NearbyBarbersListProps {
  barbers: MockBarber[];
  onBarberPress: (barber: MockBarber) => void;
  onViewMapPress: () => void;
}

export function NearbyBarbersList({
  barbers,
  onBarberPress,
  onViewMapPress,
}: NearbyBarbersListProps): React.JSX.Element {
  const renderItem = ({ item, index }: { item: MockBarber; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 80).duration(400)}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => onBarberPress(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.avatarUrl || 'https://via.placeholder.com/60' }}
          style={styles.avatar}
        />

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.displayName}
            </Text>
            {item.isVerified && (
              <Verified size={14} color={COLORS.gold} fill={COLORS.goldMuted} />
            )}
          </View>

          <View style={styles.ratingRow}>
            <Star size={12} color={COLORS.gold} fill={COLORS.gold} />
            <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({item.totalReviews})</Text>
            <View style={styles.divider} />
            <MapPin size={12} color={COLORS.textMuted} />
            <Text style={styles.distance}>
              {item.distanceMeters < 1000
                ? `${item.distanceMeters}m`
                : `${(item.distanceMeters / 1000).toFixed(1)}km`}
            </Text>
          </View>

          <View style={styles.specialtiesRow}>
            {item.specialties.slice(0, 2).map((specialty) => (
              <View key={specialty} style={styles.specialtyChip}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>From</Text>
          <Text style={styles.price}>₪{item.priceMin}</Text>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: item.isOnline ? COLORS.success : COLORS.offline },
            ]}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Barbers</Text>
        <TouchableOpacity onPress={onViewMapPress} style={styles.mapButton}>
          <Text style={styles.mapButtonText}>View Map</Text>
          <ChevronRight size={16} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={barbers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  mapButtonText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: COLORS.gold,
  },
  listContent: {
    gap: SPACING.sm,
  },
  separator: {
    height: SPACING.sm,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
    marginRight: SPACING.md,
  },
  info: {
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
    fontSize: TYPOGRAPHY.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    marginBottom: SPACING.xs,
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
  divider: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xs,
  },
  distance: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
  },
  specialtiesRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  specialtyChip: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  specialtyText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
  },
  priceSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
  },
  price: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.goldDark,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: SPACING.xs,
  },
});
