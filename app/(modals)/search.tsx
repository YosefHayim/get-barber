import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Keyboard,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Search,
  X,
  SlidersHorizontal,
  Star,
  MapPin,
  Verified,
  ChevronDown,
  Check,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { COLORS, DARK_COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { MOCK_BARBERS, MOCK_SERVICES, type MockBarber } from '@/constants/mockData';
import { useBookingStore } from '@/stores/useBookingStore';
import { useDebounce } from '@/hooks';
import { useRecentSearches, RecentSearches, SearchSuggestions } from '@/features/search';

type SortOption = 'distance' | 'rating' | 'price_low' | 'price_high' | 'most_booked';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'distance', label: 'Nearest' },
  { id: 'rating', label: 'Top Rated' },
  { id: 'price_low', label: 'Price: Low to High' },
  { id: 'price_high', label: 'Price: High to Low' },
  { id: 'most_booked', label: 'Most Booked' },
];

const DISTANCE_OPTIONS = [1, 5, 10, 15, 25];

export default function SearchScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const setSelectedBarber = useBookingStore((s) => s.setSelectedBarber);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(25);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableNow, setAvailableNow] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 300);

  const {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  } = useRecentSearches();

  const showRecentAndSuggestions = !debouncedQuery.trim() && !showFilters && !hasSearched;

  const filteredBarbers = useMemo(() => {
    let results = [...MOCK_BARBERS];

    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase();
      results = results.filter(
        (b) =>
          b.displayName.toLowerCase().includes(query) ||
          b.specialties.some((s) => s.toLowerCase().includes(query)) ||
          b.bio.toLowerCase().includes(query)
      );
    }

    if (selectedServices.length > 0) {
      results = results.filter((b) =>
        selectedServices.some((s) =>
          b.specialties.some((sp) => sp.toLowerCase().includes(s.toLowerCase()))
        )
      );
    }

    if (minRating > 0) {
      results = results.filter((b) => b.rating >= minRating);
    }

    if (maxDistance < 25) {
      results = results.filter((b) => b.distanceMeters <= maxDistance * 1000);
    }

    results = results.filter(
      (b) => b.priceMin >= priceRange[0] && b.priceMax <= priceRange[1]
    );

    if (verifiedOnly) {
      results = results.filter((b) => b.isVerified);
    }

    if (availableNow) {
      results = results.filter((b) => b.isOnline);
    }

    switch (sortBy) {
      case 'distance':
        results.sort((a, b) => a.distanceMeters - b.distanceMeters);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'price_low':
        results.sort((a, b) => a.priceMin - b.priceMin);
        break;
      case 'price_high':
        results.sort((a, b) => b.priceMax - a.priceMax);
        break;
      case 'most_booked':
        results.sort((a, b) => b.totalReviews - a.totalReviews);
        break;
    }

    return results;
  }, [
    debouncedQuery,
    selectedServices,
    minRating,
    maxDistance,
    priceRange,
    verifiedOnly,
    availableNow,
    sortBy,
  ]);

  const handleBarberPress = useCallback(
    (barber: MockBarber) => {
      if (searchQuery.trim()) {
        addRecentSearch(searchQuery, 'barber');
      }

      setSelectedBarber({
        id: barber.id,
        user_id: barber.userId,
        display_name: barber.displayName,
        avatar_url: barber.avatarUrl,
        bio: barber.bio,
        rating: barber.rating,
        total_reviews: barber.totalReviews,
        is_verified: barber.isVerified,
        distance_meters: barber.distanceMeters,
        price_min: barber.priceMin,
        price_max: barber.priceMax,
      });
      router.push({
        pathname: '/(modals)/barber-detail/[id]',
        params: { id: barber.id },
      });
    },
    [setSelectedBarber, searchQuery, addRecentSearch]
  );

  const handleRecentSearchPress = useCallback((query: string) => {
    setSearchQuery(query);
    setHasSearched(true);
    Keyboard.dismiss();
  }, []);

  const handleSuggestionPress = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    setHasSearched(true);
    addRecentSearch(suggestion, 'service');
    Keyboard.dismiss();
  }, [addRecentSearch]);

  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const clearFilters = () => {
    setSelectedServices([]);
    setMinRating(0);
    setMaxDistance(25);
    setPriceRange([0, 500]);
    setVerifiedOnly(false);
    setAvailableNow(false);
    setSortBy('distance');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedServices.length > 0) count++;
    if (minRating > 0) count++;
    if (maxDistance < 25) count++;
    if (priceRange[0] > 0 || priceRange[1] < 500) count++;
    if (verifiedOnly) count++;
    if (availableNow) count++;
    return count;
  }, [selectedServices, minRating, maxDistance, priceRange, verifiedOnly, availableNow]);

  const renderBarberItem = ({ item, index }: { item: MockBarber; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(300)}>
      <TouchableOpacity
        style={styles.barberCard}
        onPress={() => handleBarberPress(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.avatarUrl || 'https://via.placeholder.com/70' }}
          style={styles.barberAvatar}
        />
        <View style={styles.barberInfo}>
          <View style={styles.barberNameRow}>
            <Text style={styles.barberName} numberOfLines={1}>
              {item.displayName}
            </Text>
            {item.isVerified && (
              <Verified size={14} color={DARK_COLORS.accent} fill={DARK_COLORS.primaryMuted} />
            )}
          </View>
          <View style={styles.barberStats}>
            <Star size={12} color={DARK_COLORS.accent} fill={DARK_COLORS.accent} />
            <Text style={styles.barberRating}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.barberReviews}>({item.totalReviews})</Text>
            <View style={styles.statDivider} />
            <MapPin size={12} color={DARK_COLORS.textMuted} />
            <Text style={styles.barberDistance}>
              {item.distanceMeters < 1000
                ? `${item.distanceMeters}m`
                : `${(item.distanceMeters / 1000).toFixed(1)}km`}
            </Text>
          </View>
          <View style={styles.barberSpecialties}>
            {item.specialties.slice(0, 2).map((s) => (
              <View key={s} style={styles.specialtyChip}>
                <Text style={styles.specialtyText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.barberPriceSection}>
          <Text style={styles.priceLabel}>From</Text>
          <Text style={styles.priceValue}>{item.priceMin}</Text>
          <View
            style={[
              styles.onlineIndicator,
              { backgroundColor: item.isOnline ? DARK_COLORS.success : DARK_COLORS.offline },
            ]}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={DARK_COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search barbers, services..."
            placeholderTextColor={DARK_COLORS.textMuted}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text.trim()) {
                setHasSearched(true);
              }
            }}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <X size={18} color={DARK_COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal
            size={20}
            color={activeFilterCount > 0 ? DARK_COLORS.primary : DARK_COLORS.textSecondary}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color={DARK_COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.filtersContainer}>
          <ScrollView
            horizontal={false}
            showsVerticalScrollIndicator={false}
            style={styles.filtersScroll}
          >
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Services</Text>
              <View style={styles.serviceChips}>
                {MOCK_SERVICES.map((service) => (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.serviceChip,
                      selectedServices.includes(service.name) && styles.serviceChipActive,
                    ]}
                    onPress={() => toggleService(service.name)}
                  >
                    <Text
                      style={[
                        styles.serviceChipText,
                        selectedServices.includes(service.name) && styles.serviceChipTextActive,
                      ]}
                    >
                      {service.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Minimum Rating</Text>
              <View style={styles.ratingOptions}>
                {[0, 4, 4.5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingOption,
                      minRating === rating && styles.ratingOptionActive,
                    ]}
                    onPress={() => setMinRating(rating)}
                  >
                    <Star
                      size={14}
                      color={minRating === rating ? DARK_COLORS.accent : DARK_COLORS.textMuted}
                      fill={minRating === rating ? DARK_COLORS.accent : 'transparent'}
                    />
                    <Text
                      style={[
                        styles.ratingOptionText,
                        minRating === rating && styles.ratingOptionTextActive,
                      ]}
                    >
                      {rating === 0 ? 'Any' : `${rating}+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>
                Maximum Distance: {maxDistance}km
              </Text>
              <View style={styles.distanceOptions}>
                {DISTANCE_OPTIONS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.distanceOption,
                      maxDistance === d && styles.distanceOptionActive,
                    ]}
                    onPress={() => setMaxDistance(d)}
                  >
                    <Text
                      style={[
                        styles.distanceOptionText,
                        maxDistance === d && styles.distanceOptionTextActive,
                      ]}
                    >
                      {d}km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>
                Price Range: {priceRange[0]} - {priceRange[1]}
              </Text>
              <View style={styles.sliderContainer}>
                <Slider
                  minimumValue={0}
                  maximumValue={500}
                  step={10}
                  value={priceRange[1]}
                  onValueChange={(value) => setPriceRange([priceRange[0], value])}
                  minimumTrackTintColor={DARK_COLORS.primary}
                  maximumTrackTintColor={DARK_COLORS.border}
                  thumbTintColor={DARK_COLORS.primary}
                />
              </View>
            </View>

            <View style={styles.filterSection}>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Verified Only</Text>
                <TouchableOpacity
                  style={[styles.toggle, verifiedOnly && styles.toggleActive]}
                  onPress={() => setVerifiedOnly(!verifiedOnly)}
                >
                  {verifiedOnly && <Check size={14} color="#FFFFFF" />}
                </TouchableOpacity>
              </View>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Available Now</Text>
                <TouchableOpacity
                  style={[styles.toggle, availableNow && styles.toggleActive]}
                  onPress={() => setAvailableNow(!availableNow)}
                >
                  {availableNow && <Check size={14} color="#FFFFFF" />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      )}

      {showRecentAndSuggestions ? (
        <ScrollView style={styles.suggestionsContainer} showsVerticalScrollIndicator={false}>
          <RecentSearches
            searches={recentSearches}
            onSearchPress={handleRecentSearchPress}
            onRemove={removeRecentSearch}
            onClearAll={clearRecentSearches}
          />
          <SearchSuggestions
            query=""
            onSuggestionPress={handleSuggestionPress}
          />
        </ScrollView>
      ) : (
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {filteredBarbers.length} barber{filteredBarbers.length !== 1 ? 's' : ''} found
            </Text>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowSortDropdown(!showSortDropdown)}
            >
              <Text style={styles.sortText}>
                {SORT_OPTIONS.find((o) => o.id === sortBy)?.label}
              </Text>
              <ChevronDown size={16} color={DARK_COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {showSortDropdown && (
            <Animated.View entering={FadeIn.duration(200)} style={styles.sortDropdown}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.sortOption,
                    sortBy === option.id && styles.sortOptionActive,
                  ]}
                  onPress={() => {
                    setSortBy(option.id);
                    setShowSortDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.sortOptionText,
                      sortBy === option.id && styles.sortOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {sortBy === option.id && <Check size={16} color={DARK_COLORS.primary} />}
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}

          <FlatList
            data={filteredBarbers}
            renderItem={renderBarberItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={Keyboard.dismiss}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Search size={48} color={DARK_COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No barbers found</Text>
                <Text style={styles.emptyText}>
                  Try adjusting your filters or search query
                </Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: DARK_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: DARK_COLORS.borderLight,
    gap: SPACING.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK_COLORS.surfaceLight,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 44,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.md,
    color: DARK_COLORS.textPrimary,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: DARK_COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: DARK_COLORS.primaryMuted,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: DARK_COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: SPACING.xs,
  },
  suggestionsContainer: {
    flex: 1,
    backgroundColor: DARK_COLORS.background,
  },
  filtersContainer: {
    backgroundColor: DARK_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: DARK_COLORS.borderLight,
    maxHeight: 350,
  },
  filtersScroll: {
    padding: SPACING.lg,
  },
  filterSection: {
    marginBottom: SPACING.lg,
  },
  filterTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: DARK_COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  serviceChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  serviceChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: DARK_COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  serviceChipActive: {
    backgroundColor: DARK_COLORS.primaryMuted,
    borderColor: DARK_COLORS.primary,
  },
  serviceChipText: {
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.textSecondary,
  },
  serviceChipTextActive: {
    color: DARK_COLORS.primary,
    fontWeight: '600',
  },
  ratingOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  ratingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: DARK_COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  ratingOptionActive: {
    backgroundColor: DARK_COLORS.primaryMuted,
    borderColor: DARK_COLORS.accent,
  },
  ratingOptionText: {
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.textSecondary,
  },
  ratingOptionTextActive: {
    color: DARK_COLORS.accent,
    fontWeight: '600',
  },
  distanceOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  distanceOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: DARK_COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  distanceOptionActive: {
    backgroundColor: DARK_COLORS.primaryMuted,
    borderColor: DARK_COLORS.primary,
  },
  distanceOptionText: {
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.textSecondary,
  },
  distanceOptionTextActive: {
    color: DARK_COLORS.primary,
    fontWeight: '600',
  },
  sliderContainer: {
    paddingHorizontal: SPACING.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  toggleLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.textPrimary,
  },
  toggle: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.xs,
    borderWidth: 2,
    borderColor: DARK_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: DARK_COLORS.primary,
    borderColor: DARK_COLORS.primary,
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  clearButtonText: {
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.error,
    fontWeight: '600',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  resultsCount: {
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.textSecondary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  sortText: {
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.textSecondary,
  },
  sortDropdown: {
    position: 'absolute',
    top: 160,
    right: SPACING.lg,
    backgroundColor: DARK_COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
    zIndex: 100,
    minWidth: 180,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: DARK_COLORS.borderLight,
  },
  sortOptionActive: {
    backgroundColor: DARK_COLORS.primaryMuted,
  },
  sortOptionText: {
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.textPrimary,
  },
  sortOptionTextActive: {
    color: DARK_COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  barberCard: {
    flexDirection: 'row',
    backgroundColor: DARK_COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  barberAvatar: {
    width: 70,
    height: 70,
    borderRadius: RADIUS.md,
    backgroundColor: DARK_COLORS.surfaceLight,
  },
  barberInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  barberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  barberName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '600',
    color: DARK_COLORS.textPrimary,
  },
  barberStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    marginTop: SPACING.xxs,
  },
  barberRating: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: DARK_COLORS.textPrimary,
  },
  barberReviews: {
    fontSize: TYPOGRAPHY.xs,
    color: DARK_COLORS.textMuted,
  },
  statDivider: {
    width: 1,
    height: 10,
    backgroundColor: DARK_COLORS.border,
    marginHorizontal: SPACING.xs,
  },
  barberDistance: {
    fontSize: TYPOGRAPHY.xs,
    color: DARK_COLORS.textMuted,
  },
  barberSpecialties: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  specialtyChip: {
    backgroundColor: DARK_COLORS.surfaceLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  specialtyText: {
    fontSize: TYPOGRAPHY.xs,
    color: DARK_COLORS.textSecondary,
  },
  barberPriceSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: DARK_COLORS.textMuted,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: DARK_COLORS.primary,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING['4xl'],
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '600',
    color: DARK_COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});
