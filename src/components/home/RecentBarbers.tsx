import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { Star, RotateCcw, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import type { MockBarber } from '@/constants/mockData';

interface RecentBarbersProps {
  barbers: MockBarber[];
  onBarberPress: (barber: MockBarber) => void;
  onSeeAllPress: () => void;
}

export function RecentBarbers({
  barbers,
  onBarberPress,
  onSeeAllPress,
}: RecentBarbersProps): React.JSX.Element | null {
  if (barbers.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <RotateCcw size={18} color={COLORS.textSecondary} />
          <Text style={styles.title}>Recent Barbers</Text>
        </View>
        <TouchableOpacity onPress={onSeeAllPress} style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
          <ChevronRight size={16} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {barbers.map((barber, index) => (
          <Animated.View
            key={barber.id}
            entering={FadeInRight.delay(index * 100).duration(400)}
          >
            <TouchableOpacity
              style={styles.card}
              onPress={() => onBarberPress(barber)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: barber.avatarUrl || 'https://via.placeholder.com/60' }}
                style={styles.avatar}
              />
              <Text style={styles.name} numberOfLines={1}>
                {barber.displayName.split(' ')[0]}
              </Text>
              <View style={styles.ratingRow}>
                <Star size={10} color={COLORS.gold} fill={COLORS.gold} />
                <Text style={styles.rating}>{barber.rating.toFixed(1)}</Text>
              </View>
              <TouchableOpacity style={styles.bookAgainButton}>
                <Text style={styles.bookAgainText}>Book</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: COLORS.gold,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  card: {
    width: 90,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    ...SHADOWS.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.backgroundSecondary,
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: SPACING.xs,
  },
  rating: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
  },
  bookAgainButton: {
    backgroundColor: COLORS.goldMuted,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.full,
  },
  bookAgainText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: COLORS.goldDark,
  },
});
