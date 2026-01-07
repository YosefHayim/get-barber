import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, X, Trash2 } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import type { RecentSearch } from '../hooks/useRecentSearches';

interface RecentSearchesProps {
  searches: RecentSearch[];
  onSearchPress: (query: string) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export function RecentSearches({
  searches,
  onSearchPress,
  onRemove,
  onClearAll,
}: RecentSearchesProps): React.JSX.Element | null {
  if (searches.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Searches</Text>
        <TouchableOpacity onPress={onClearAll} style={styles.clearAllButton}>
          <Trash2 size={14} color={COLORS.textMuted} />
          <Text style={styles.clearAllText}>Clear all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchesList}>
        {searches.map((search) => (
          <TouchableOpacity
            key={search.id}
            style={styles.searchItem}
            onPress={() => onSearchPress(search.query)}
          >
            <Clock size={16} color={COLORS.textMuted} />
            <Text style={styles.searchText} numberOfLines={1}>
              {search.query}
            </Text>
            <TouchableOpacity
              onPress={() => onRemove(search.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  clearAllText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
  },
  searchesList: {
    gap: SPACING.sm,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  searchText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
  },
});
