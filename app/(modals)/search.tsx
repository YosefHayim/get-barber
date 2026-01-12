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
  Star,
  MapPin,
  Verified,
  ChevronDown,
  Check,
  ArrowLeft,
  Heart,
  Clock,
  Zap,
  Navigation,
  Calendar,
  MessageCircle,
} from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { webSafeFadeIn, webSafeFadeInDown, webSafeFadeInUp } from '@/utils/animations';
import Slider from '@react-native-community/slider';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { MOCK_BARBERS, MOCK_SERVICES, type MockBarber } from '@/constants/mockData';
import { useBookingStore } from '@/stores/useBookingStore';
import { useDebounce } from '@/hooks';
import { useRecentSearches, RecentSearches, SearchSuggestions } from '@/features/search';

// Light theme colors
const LIGHT_THEME = {
  background: '#f6f6f8',
  surface: '#ffffff',
  primary: '#135bec',
  textPrimary: '#0d181b',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  borderLight: '#e2e8f0',
  surfaceLight: '#f6f6f8',
  error: '#ef4444',
};

type SortOption = 'distance' | 'rating' | 'price_low' | 'price_high' | 'most_booked';

type FilterChip = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
};

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
  const [activeFilterChip, setActiveFilterChip] = useState<string>('all');

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

    // Apply filter chip filters
    if (activeFilterChip === 'available') {
      results = results.filter((b) => b.isOnline);
    } else if (activeFilterChip === 'top_rated') {
      results = results.filter((b) => b.rating >= 4.5);
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
    activeFilterChip,
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
    setActiveFilterChip('all');
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

  const filterChips: FilterChip[] = [
    { id: 'all', label: 'All', active: activeFilterChip === 'all' },
    { id: 'available', label: 'Available Now', icon: <Zap size={14} color={activeFilterChip === 'available' ? '#FFFFFF' : LIGHT_THEME.primary} />, active: activeFilterChip === 'available' },
    { id: 'top_rated', label: 'Top Rated', icon: <Star size={14} color={activeFilterChip === 'top_rated' ? '#FFFFFF' : LIGHT_THEME.primary} />, active: activeFilterChip === 'top_rated' },
    { id: 'sort', label: SORT_OPTIONS.find((o) => o.id === sortBy)?.label || 'Sort', icon: <ChevronDown size={14} color={LIGHT_THEME.textSecondary} /> },
  ];

  const handleBookNow = useCallback((barber: MockBarber) => {
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
      pathname: '/(modals)/service-booking/[barberId]',
      params: { barberId: barber.id },
    });
  }, [setSelectedBarber]);

  const renderBarberItem = ({ item, index }: { item: MockBarber; index: number }) => (
    <Animated.View entering={webSafeFadeInUp(index * 50, 300)}>
      <TouchableOpacity
        style={styles.barberCard}
        onPress={() => handleBarberPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.cardContent}>
          {/* Avatar with online status */}
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: item.avatarUrl || 'https://via.placeholder.com/80' }}
              style={styles.barberAvatar}
            />
            {item.isOnline && (
              <View style={styles.onlineBadge}>
                <Text style={styles.onlineBadgeText}>ONLINE</Text>
              </View>
            )}
          </View>

          {/* Barber info */}
          <View style={styles.barberInfo}>
            <View style={styles.barberHeader}>
              <View style={styles.nameContainer}>
                <Text style={styles.barberName} numberOfLines={1}>
                  {item.displayName}
                </Text>
                {item.isVerified && (
                  <Verified size={14} color={LIGHT_THEME.primary} fill={LIGHT_THEME.primary} style={{ marginLeft: 4 }} />
                )}
              </View>
              <TouchableOpacity style={styles.favoriteButton}>
                <Heart size={20} color={LIGHT_THEME.primary} />
              </TouchableOpacity>
            </View>

            {/* Specialty */}
            <Text style={styles.specialty} numberOfLines={1}>
              {item.specialties[0] || 'Barber'}
            </Text>

            {/* Rating and distance */}
            <View style={styles.statsRow}>
              <View style={styles.ratingBadge}>
                <Star size={12} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>({item.totalReviews})</Text>
              </View>
              <View style={styles.distanceContainer}>
                <Navigation size={12} color={LIGHT_THEME.textMuted} />
                <Text style={styles.distanceText}>
                  {item.distanceMeters < 1000
                    ? `${item.distanceMeters}m`
                    : `${(item.distanceMeters / 1000).toFixed(1)} km`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom action row */}
        <View style={styles.actionRow}>
          <View style={styles.availabilityInfo}>
            {item.isOnline ? (
              <>
                <Clock size={14} color={LIGHT_THEME.primary} />
                <Text style={styles.availabilityText}>Available Now</Text>
              </>
            ) : (
              <>
                <View style={styles.offlineIndicator} />
                <Text style={styles.availabilityTextOffline}>Next: Tomorrow 9:00 AM</Text>
              </>
            )}
          </View>
          <TouchableOpacity
            style={[styles.bookButton, !item.isOnline && styles.bookButtonSecondary]}
            onPress={() => handleBookNow(item)}
          >
            <Text style={[styles.bookButtonText, !item.isOnline && styles.bookButtonTextSecondary]}>
              {item.isOnline ? 'Book Now' : 'Schedule'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={LIGHT_THEME.textPrimary} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Search size={18} color={LIGHT_THEME.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search barbers, services..."
            placeholderTextColor={LIGHT_THEME.textMuted}
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
              <X size={18} color={LIGHT_THEME.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterChipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsContent}
        >
          {filterChips.map((chip) => (
            <TouchableOpacity
              key={chip.id}
              style={[
                styles.filterChip,
                chip.active && styles.filterChipActive,
              ]}
              onPress={() => {
                if (chip.id === 'sort') {
                  setShowSortDropdown(!showSortDropdown);
                } else {
                  setActiveFilterChip(chip.id);
                }
              }}
            >
              {chip.icon && <View style={styles.filterChipIcon}>{chip.icon}</View>}
              <Text
                style={[
                  styles.filterChipText,
                  chip.active && styles.filterChipTextActive,
                ]}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort Dropdown */}
      {showSortDropdown && (
        <Animated.View entering={webSafeFadeIn(200)} style={styles.sortDropdown}>
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
              {sortBy === option.id && <Check size={16} color={LIGHT_THEME.primary} />}
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* Extended Filters Panel */}
      {showFilters && (
        <Animated.View entering={webSafeFadeInDown(0, 300)} style={styles.filtersContainer}>
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
                      color={minRating === rating ? '#f59e0b' : LIGHT_THEME.textMuted}
                      fill={minRating === rating ? '#f59e0b' : 'transparent'}
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
                  minimumTrackTintColor={LIGHT_THEME.primary}
                  maximumTrackTintColor={LIGHT_THEME.border}
                  thumbTintColor={LIGHT_THEME.primary}
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
          </View>

          <FlatList
            data={filteredBarbers}
            renderItem={renderBarberItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={Keyboard.dismiss}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Search size={40} color={LIGHT_THEME.primary} />
                </View>
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
    backgroundColor: LIGHT_THEME.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: LIGHT_THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.borderLight,
    gap: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_THEME.surfaceLight,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 44,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.md,
    color: LIGHT_THEME.textPrimary,
  },
  filterChipsContainer: {
    backgroundColor: LIGHT_THEME.background,
    paddingVertical: SPACING.sm,
  },
  filterChipsContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: LIGHT_THEME.surface,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: LIGHT_THEME.primary,
    borderColor: LIGHT_THEME.primary,
  },
  filterChipIcon: {
    marginRight: SPACING.xs,
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: LIGHT_THEME.textPrimary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  suggestionsContainer: {
    flex: 1,
    backgroundColor: LIGHT_THEME.background,
  },
  filtersContainer: {
    backgroundColor: LIGHT_THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.borderLight,
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
    color: LIGHT_THEME.textPrimary,
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
    backgroundColor: LIGHT_THEME.surfaceLight,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
  },
  serviceChipActive: {
    backgroundColor: `${LIGHT_THEME.primary}20`,
    borderColor: LIGHT_THEME.primary,
  },
  serviceChipText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_THEME.textSecondary,
  },
  serviceChipTextActive: {
    color: LIGHT_THEME.primary,
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
    backgroundColor: LIGHT_THEME.surfaceLight,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
  },
  ratingOptionActive: {
    backgroundColor: `${LIGHT_THEME.primary}20`,
    borderColor: '#f59e0b',
  },
  ratingOptionText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_THEME.textSecondary,
  },
  ratingOptionTextActive: {
    color: '#f59e0b',
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
    backgroundColor: LIGHT_THEME.surfaceLight,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
  },
  distanceOptionActive: {
    backgroundColor: `${LIGHT_THEME.primary}20`,
    borderColor: LIGHT_THEME.primary,
  },
  distanceOptionText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_THEME.textSecondary,
  },
  distanceOptionTextActive: {
    color: LIGHT_THEME.primary,
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
    color: LIGHT_THEME.textPrimary,
  },
  toggle: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.xs,
    borderWidth: 2,
    borderColor: LIGHT_THEME.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: LIGHT_THEME.primary,
    borderColor: LIGHT_THEME.primary,
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  clearButtonText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_THEME.error,
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
    color: LIGHT_THEME.textSecondary,
  },
  sortDropdown: {
    position: 'absolute',
    top: 180,
    right: SPACING.lg,
    backgroundColor: LIGHT_THEME.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
    zIndex: 100,
    minWidth: 180,
    ...SHADOWS.lg,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.borderLight,
  },
  sortOptionActive: {
    backgroundColor: `${LIGHT_THEME.primary}15`,
  },
  sortOptionText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_THEME.textPrimary,
  },
  sortOptionTextActive: {
    color: LIGHT_THEME.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  barberCard: {
    backgroundColor: LIGHT_THEME.surface,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: LIGHT_THEME.border,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  barberAvatar: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.lg,
    backgroundColor: LIGHT_THEME.surfaceLight,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    paddingVertical: 2,
    alignItems: 'center',
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
  },
  onlineBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  barberInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  barberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  barberName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '700',
    color: LIGHT_THEME.textPrimary,
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  specialty: {
    fontSize: TYPOGRAPHY.xs,
    color: LIGHT_THEME.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_THEME.surfaceLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '700',
    color: LIGHT_THEME.textPrimary,
  },
  reviewCount: {
    fontSize: TYPOGRAPHY.xs,
    color: LIGHT_THEME.textMuted,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: TYPOGRAPHY.xs,
    color: LIGHT_THEME.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: LIGHT_THEME.borderLight,
  },
  availabilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  availabilityText: {
    fontSize: TYPOGRAPHY.xs,
    color: LIGHT_THEME.textSecondary,
  },
  availabilityTextOffline: {
    fontSize: TYPOGRAPHY.xs,
    color: LIGHT_THEME.textMuted,
  },
  offlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
  },
  bookButton: {
    backgroundColor: LIGHT_THEME.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    minWidth: 100,
    alignItems: 'center',
  },
  bookButtonSecondary: {
    backgroundColor: `${LIGHT_THEME.primary}15`,
  },
  bookButtonText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bookButtonTextSecondary: {
    color: LIGHT_THEME.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING['4xl'],
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${LIGHT_THEME.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: LIGHT_THEME.textPrimary,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_THEME.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
    maxWidth: 200,
  },
});
