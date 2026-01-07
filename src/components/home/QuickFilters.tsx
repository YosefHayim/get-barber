import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Zap, Star, DollarSign, Clock } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';

export type QuickFilter = 'available_now' | 'top_rated' | 'best_price' | 'nearby';

interface QuickFiltersProps {
  activeFilter: QuickFilter | null;
  onFilterChange: (filter: QuickFilter | null) => void;
}

const FILTERS: { id: QuickFilter; label: string; icon: typeof Zap }[] = [
  { id: 'available_now', label: 'Available Now', icon: Zap },
  { id: 'top_rated', label: 'Top Rated', icon: Star },
  { id: 'best_price', label: 'Best Price', icon: DollarSign },
  { id: 'nearby', label: 'Nearby', icon: Clock },
];

export function QuickFilters({ activeFilter, onFilterChange }: QuickFiltersProps): React.JSX.Element {
  return (
    <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.id;
          const IconComponent = filter.icon;

          return (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterButton, isActive && styles.filterButtonActive]}
              onPress={() => onFilterChange(isActive ? null : filter.id)}
              activeOpacity={0.7}
            >
              <IconComponent
                size={16}
                color={isActive ? COLORS.goldDark : COLORS.textSecondary}
              />
              <Text
                style={[styles.filterText, isActive && styles.filterTextActive]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.goldMuted,
    borderColor: COLORS.gold,
  },
  filterText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.goldDark,
    fontWeight: '600',
  },
});
