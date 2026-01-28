import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Search, MapPin, Navigation, X, Clock } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { DARK_COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { useGoogleMaps, type PlacePrediction, type LatLng } from './GoogleMapsProvider';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

interface PlacesAutocompleteProps {
  placeholder?: string;
  value?: string;
  onSelect: (place: { address: string; location: LatLng; placeId: string }) => void;
  onChangeText?: (text: string) => void;
  showCurrentLocation?: boolean;
  recentSearches?: string[];
  autoFocus?: boolean;
  style?: object;
}

export function PlacesAutocomplete({
  placeholder = 'Search for a location...',
  value = '',
  onSelect,
  onChangeText,
  showCurrentLocation = true,
  recentSearches = [],
  autoFocus = false,
  style,
}: PlacesAutocompleteProps) {
  const { searchPlaces, getPlaceDetails, getCurrentLocation, reverseGeocode, userLocation } =
    useGoogleMaps();

  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Debounced search
  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchPlaces(searchQuery);
      setPredictions(results);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  // Handle query change
  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      onChangeText?.(text);
      debouncedSearch(text);
    },
    [debouncedSearch, onChangeText]
  );

  // Handle place selection
  const handleSelectPlace = useCallback(
    async (prediction: PlacePrediction) => {
      setIsLoading(true);
      try {
        const details = await getPlaceDetails(prediction.placeId);
        if (details) {
          setQuery(prediction.mainText);
          setPredictions([]);
          Keyboard.dismiss();
          onSelect({
            address: details.address,
            location: details.location,
            placeId: details.placeId,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [getPlaceDetails, onSelect]
  );

  // Handle current location
  const handleUseCurrentLocation = useCallback(async () => {
    setIsGettingCurrentLocation(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        const address = await reverseGeocode(location);
        if (address) {
          setQuery(address);
          setPredictions([]);
          Keyboard.dismiss();
          onSelect({
            address,
            location,
            placeId: 'current_location',
          });
        }
      }
    } finally {
      setIsGettingCurrentLocation(false);
    }
  }, [getCurrentLocation, reverseGeocode, onSelect]);

  // Handle recent search selection
  const handleSelectRecent = useCallback(
    (search: string) => {
      setQuery(search);
      debouncedSearch(search);
    },
    [debouncedSearch]
  );

  // Clear input
  const handleClear = useCallback(() => {
    setQuery('');
    setPredictions([]);
    onChangeText?.('');
  }, [onChangeText]);

  // Focus effect
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  // Update query when value prop changes
  useEffect(() => {
    if (value !== query) {
      setQuery(value);
    }
  }, [value]);

  const showDropdown = isFocused && (predictions.length > 0 || showCurrentLocation || recentSearches.length > 0);

  return (
    <View style={[styles.container, style]}>
      {/* Input */}
      <View style={styles.inputContainer}>
        <Search size={20} color={DARK_COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={query}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={DARK_COLORS.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          returnKeyType="search"
        />
        {isLoading && <ActivityIndicator size="small" color={DARK_COLORS.primary} />}
        {query.length > 0 && !isLoading && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <X size={18} color={DARK_COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Dropdown */}
      {showDropdown && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.dropdown}
        >
          {/* Current Location */}
          {showCurrentLocation && predictions.length === 0 && (
            <TouchableOpacity
              style={styles.currentLocationItem}
              onPress={handleUseCurrentLocation}
              disabled={isGettingCurrentLocation}
            >
              {isGettingCurrentLocation ? (
                <ActivityIndicator size="small" color={DARK_COLORS.primary} />
              ) : (
                <Navigation size={20} color={DARK_COLORS.primary} />
              )}
              <View style={styles.itemContent}>
                <Text style={styles.currentLocationText}>Use current location</Text>
                {userLocation && (
                  <Text style={styles.itemSecondary}>Based on your GPS</Text>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* Recent Searches */}
          {predictions.length === 0 && recentSearches.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Clock size={14} color={DARK_COLORS.textMuted} />
                <Text style={styles.sectionTitle}>Recent</Text>
              </View>
              {recentSearches.slice(0, 3).map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentItem}
                  onPress={() => handleSelectRecent(search)}
                >
                  <Clock size={16} color={DARK_COLORS.textMuted} />
                  <Text style={styles.recentText} numberOfLines={1}>
                    {search}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Predictions */}
          {predictions.length > 0 && (
            <FlatList
              data={predictions}
              keyExtractor={(item) => item.placeId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.predictionItem}
                  onPress={() => handleSelectPlace(item)}
                >
                  <MapPin size={20} color={DARK_COLORS.textMuted} />
                  <View style={styles.itemContent}>
                    <Text style={styles.predictionMain} numberOfLines={1}>
                      {item.mainText}
                    </Text>
                    <Text style={styles.predictionSecondary} numberOfLines={1}>
                      {item.secondaryText}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
              style={styles.predictionsList}
            />
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK_COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: TYPOGRAPHY.base,
    color: DARK_COLORS.textPrimary,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  dropdown: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: DARK_COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  currentLocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: DARK_COLORS.border,
  },
  currentLocationText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: DARK_COLORS.primary,
  },
  itemContent: {
    flex: 1,
  },
  itemSecondary: {
    fontSize: TYPOGRAPHY.xs,
    color: DARK_COLORS.textMuted,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: DARK_COLORS.textMuted,
    textTransform: 'uppercase',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  recentText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.textPrimary,
  },
  predictionsList: {
    maxHeight: 250,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: DARK_COLORS.border,
  },
  predictionMain: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500',
    color: DARK_COLORS.textPrimary,
  },
  predictionSecondary: {
    fontSize: TYPOGRAPHY.xs,
    color: DARK_COLORS.textMuted,
    marginTop: 2,
  },
});

export default PlacesAutocomplete;
