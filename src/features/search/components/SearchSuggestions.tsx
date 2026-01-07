import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TrendingUp, Scissors, MapPin } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';

interface SearchSuggestionsProps {
  query: string;
  onSuggestionPress: (suggestion: string) => void;
}

const TRENDING_SEARCHES = [
  'Haircut',
  'Beard Trim',
  'Fade',
  'Hot Towel Shave',
  'Kids Haircut',
];

const POPULAR_SERVICES = [
  { name: 'Classic Haircut', icon: Scissors },
  { name: 'Beard Grooming', icon: Scissors },
  { name: 'Fade & Lineup', icon: Scissors },
];

export function SearchSuggestions({
  query,
  onSuggestionPress,
}: SearchSuggestionsProps): React.JSX.Element {
  const filteredTrending = query
    ? TRENDING_SEARCHES.filter((s) =>
        s.toLowerCase().includes(query.toLowerCase())
      )
    : TRENDING_SEARCHES;

  return (
    <View style={styles.container}>
      {filteredTrending.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={16} color={COLORS.gold} />
            <Text style={styles.sectionTitle}>Trending</Text>
          </View>
          <View style={styles.chipsList}>
            {filteredTrending.map((search) => (
              <TouchableOpacity
                key={search}
                style={styles.chip}
                onPress={() => onSuggestionPress(search)}
              >
                <Text style={styles.chipText}>{search}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {!query && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Scissors size={16} color={COLORS.goldDark} />
            <Text style={styles.sectionTitle}>Popular Services</Text>
          </View>
          {POPULAR_SERVICES.map((service) => (
            <TouchableOpacity
              key={service.name}
              style={styles.serviceItem}
              onPress={() => onSuggestionPress(service.name)}
            >
              <View style={styles.serviceIcon}>
                <service.icon size={16} color={COLORS.gold} />
              </View>
              <Text style={styles.serviceText}>{service.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  chipsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.goldMuted,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  chipText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.goldDark,
    fontWeight: '500',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  serviceIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textPrimary,
  },
});
