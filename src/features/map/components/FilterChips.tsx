import React, { useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Text,
  StyleSheet,
} from 'react-native';
import { Clock, Star, MapPin, Home, DollarSign, LucideIcon } from 'lucide-react-native';
import { COLORS, SHADOWS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';

export type FilterType = 'available_now' | 'top_rated' | 'nearby' | 'home_service' | 'best_price';

interface FilterOption {
  id: FilterType;
  label: string;
  icon: LucideIcon;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'available_now', label: 'Available Now', icon: Clock },
  { id: 'top_rated', label: 'Top Rated', icon: Star },
  { id: 'nearby', label: 'Nearby', icon: MapPin },
  { id: 'home_service', label: 'Home Service', icon: Home },
  { id: 'best_price', label: 'Best Price', icon: DollarSign },
];

interface FilterChipsProps {
  selectedFilters: FilterType[];
  onFilterChange: (filters: FilterType[]) => void;
}

export function FilterChips({
  selectedFilters,
  onFilterChange,
}: FilterChipsProps): React.JSX.Element {
  const handleFilterPress = useCallback(
    (filterId: FilterType) => {
      const isSelected = selectedFilters.includes(filterId);
      if (isSelected) {
        onFilterChange(selectedFilters.filter((id) => id !== filterId));
      } else {
        onFilterChange([...selectedFilters, filterId]);
      }
    },
    [selectedFilters, onFilterChange]
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTER_OPTIONS.map((filter) => {
          const isSelected = selectedFilters.includes(filter.id);
          const IconComponent = filter.icon;

          return (
            <Pressable
              key={filter.id}
              onPress={() => handleFilterPress(filter.id)}
              style={({ pressed }) => [
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
                pressed && styles.chipPressed,
              ]}
            >
              <IconComponent
                size={16}
                color={isSelected ? COLORS.textInverse : COLORS.navy}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  chipSelected: {
    backgroundColor: COLORS.navy,
    borderWidth: 1,
    borderColor: COLORS.navy,
  },
  chipUnselected: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  chipText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
  },
  chipTextSelected: {
    color: COLORS.textInverse,
  },
  chipTextUnselected: {
    color: COLORS.navy,
  },
});
