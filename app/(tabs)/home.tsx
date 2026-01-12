import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Search,
  SlidersHorizontal,
  Locate,
  Layers,
  Star,
  Heart,
  Clock,
  DollarSign,
  Zap,
  ChevronDown,
  Sparkles,
  Calendar,
  MessageCircle,
  Globe,
} from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { webSafeFadeIn, webSafeFadeInDown } from '@/utils/animations';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { COLORS, MAP_STYLE, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { MOCK_BARBERS, MOCK_NOTIFICATIONS, type MockBarber } from '@/constants/mockData';
import { useBookingStore } from '@/stores/useBookingStore';
import { CrossPlatformMapView, MapRegion, MapMarkerData } from '@/components/map';
import type MapView from 'react-native-maps';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

type FilterType = 'available_now' | 'top_rated' | 'price_range' | 'type' | 'newcomers' | null;

interface BarberMarker {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  barber: MockBarber;
}

const generateMockCoordinates = (barbers: MockBarber[]): BarberMarker[] => {
  const baseLatitude = 32.0853;
  const baseLongitude = 34.7818;

  return barbers.map((barber, index) => ({
    id: barber.id,
    coordinate: {
      latitude: baseLatitude + (Math.random() - 0.5) * 0.02,
      longitude: baseLongitude + (Math.random() - 0.5) * 0.02,
    },
    barber,
  }));
};

export default function HomeScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<MapRegion>({
    latitude: 32.0853,
    longitude: 34.7818,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });

  const setSelectedBarber = useBookingStore((s) => s.setSelectedBarber);

  const snapPoints = useMemo(() => ['35%', '65%', '90%'], []);
  const barberMarkers = useMemo(() => generateMockCoordinates(MOCK_BARBERS), []);

  const filteredBarbers = useMemo(() => {
    if (!activeFilter) return MOCK_BARBERS;
    switch (activeFilter) {
      case 'available_now':
        return MOCK_BARBERS.filter((b) => b.isOnline);
      case 'top_rated':
        return MOCK_BARBERS.filter((b) => b.rating >= 4.5);
      case 'price_range':
        return MOCK_BARBERS.filter((b) => b.priceMin <= 60);
      case 'newcomers':
        return MOCK_BARBERS.filter((b) => b.yearsExperience <= 3);
      default:
        return MOCK_BARBERS;
    }
  }, [activeFilter]);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        });
      } catch (error) {
        // Log error in development, gracefully fall back to default Tel Aviv coordinates
        if (__DEV__) {
          console.warn('Location permission or fetch error:', error);
        }
        // Default coordinates already set in useState, so fallback is automatic
      }
    };

    getLocation();
  }, []);

  const handleBarberPress = useCallback(
    (barber: MockBarber) => {
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
    [setSelectedBarber]
  );

  const handleSearchPress = useCallback(() => {
    router.push('/(modals)/search');
  }, []);

  const handleMyLocation = useCallback(() => {
    mapRef.current?.animateToRegion(userLocation, 500);
  }, [userLocation]);

  const handleMarkerPress = useCallback((markerId: string) => {
    setSelectedMarkerId(markerId);
    bottomSheetRef.current?.snapToIndex(1);
  }, []);

  const handleFilterPress = useCallback((filter: FilterType) => {
    setActiveFilter((prev) => (prev === filter ? null : filter));
  }, []);

  const renderBarberCard = (barber: MockBarber, index: number) => {
    const isOnline = barber.isOnline;
    const formattedDistance =
      barber.distanceMeters < 1000
        ? `${barber.distanceMeters}m`
        : `${(barber.distanceMeters / 1000).toFixed(1)} mi`;

    return (
      <Animated.View
        key={barber.id}
        entering={webSafeFadeInDown(index * 100, 400)}
        style={styles.barberCard}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    barber.avatarUrl ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
                }}
                style={styles.avatar}
              />
              <View
                style={[
                  styles.onlineIndicator,
                  { backgroundColor: isOnline ? COLORS.success : COLORS.warning },
                ]}
              />
            </View>
            <View style={styles.barberInfo}>
              <Text style={styles.barberName}>{barber.displayName}</Text>
              <View style={styles.ratingRow}>
                <Star size={14} color={COLORS.accent} fill={COLORS.accent} />
                <Text style={styles.ratingText}>{barber.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>({barber.totalReviews} reviews)</Text>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.distance}>{formattedDistance}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.favoriteButton}>
            <Heart size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.badgesRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isOnline ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)' },
            ]}
          >
            <Clock
              size={14}
              color={isOnline ? COLORS.success : COLORS.warning}
            />
            <Text
              style={[
                styles.badgeText,
                { color: isOnline ? COLORS.success : COLORS.warning },
              ]}
            >
              {isOnline ? 'Open until 8:00 PM' : 'Closed'}
            </Text>
          </View>
          <View style={styles.priceBadge}>
            <DollarSign size={14} color={COLORS.textMuted} />
            <Text style={styles.priceBadgeText}>
              {barber.priceMin <= 50 ? '$ • Affordable' : barber.priceMin <= 80 ? '$$ • Moderate' : '$$$ • Premium'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Specialties</Text>
          <View style={styles.tagsRow}>
            {barber.specialties.slice(0, 4).map((specialty, idx) => (
              <View
                key={idx}
                style={[
                  styles.specialtyTag,
                  {
                    backgroundColor:
                      idx === 0
                        ? 'rgba(59, 130, 246, 0.15)'
                        : idx === 1
                        ? 'rgba(16, 185, 129, 0.15)'
                        : idx === 2
                        ? 'rgba(139, 92, 246, 0.15)'
                        : 'rgba(245, 158, 11, 0.15)',
                    borderColor:
                      idx === 0
                        ? 'rgba(59, 130, 246, 0.3)'
                        : idx === 1
                        ? 'rgba(16, 185, 129, 0.3)'
                        : idx === 2
                        ? 'rgba(139, 92, 246, 0.3)'
                        : 'rgba(245, 158, 11, 0.3)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.specialtyText,
                    {
                      color:
                        idx === 0
                          ? '#60a5fa'
                          : idx === 1
                          ? '#34d399'
                          : idx === 2
                          ? '#a78bfa'
                          : '#fbbf24',
                    },
                  ]}
                >
                  {specialty}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabelBold}>Portfolio</Text>
          <View style={styles.portfolioGrid}>
            {[1, 2, 3].map((_, idx) => (
              <View key={idx} style={styles.portfolioItem}>
                <Image
                  source={{
                    uri: `https://images.unsplash.com/photo-${
                      idx === 0
                        ? '1503951914875-452162b0f3f1'
                        : idx === 1
                        ? '1599351431202-1e0f0137899a'
                        : '1585747860715-2ba37e788b70'
                    }?w=200`,
                  }}
                  style={styles.portfolioImage}
                />
              </View>
            ))}
            <TouchableOpacity style={styles.viewAllPortfolio}>
              <Layers size={20} color={COLORS.textMuted} />
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.priceLabel}>Starting price</Text>
            <Text style={styles.priceValue}>
              ₪{barber.priceMin}{' '}
              <Text style={styles.priceSuffix}>/ cut</Text>
            </Text>
          </View>
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Globe size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <MessageCircle size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => handleBarberPress(barber)}
          activeOpacity={0.8}
        >
          <Calendar size={18} color="#fff" />
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const mapMarkers: MapMarkerData[] = useMemo(() => 
    barberMarkers.map((marker) => ({
      id: marker.id,
      coordinate: marker.coordinate,
      title: marker.barber.displayName,
    })),
    [barberMarkers]
  );

  const renderMapMarker = useCallback((marker: MapMarkerData, isSelected: boolean) => {
    const barberMarker = barberMarkers.find(m => m.id === marker.id);
    if (!barberMarker) return null;

    return (
      <View style={[styles.mapMarker, isSelected && styles.mapMarkerActive]}>
        {isSelected ? (
          <View style={styles.markerActiveContent}>
            <View style={styles.markerPriceTag}>
              <Text style={styles.markerPriceText}>
                ₪{barberMarker.barber.priceMin} • {Math.round(barberMarker.barber.distanceMeters / 100)}min
              </Text>
            </View>
            <View style={styles.markerActiveIcon}>
              <Text style={styles.markerIconText}>✂️</Text>
            </View>
          </View>
        ) : (
          <View style={styles.markerInactiveIcon}>
            <Text style={styles.markerIconTextSmall}>✂️</Text>
          </View>
        )}
      </View>
    );
  }, [barberMarkers]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <CrossPlatformMapView
        mapRef={mapRef}
        initialRegion={userLocation}
        customMapStyle={MAP_STYLE}
        showsUserLocation
        markers={mapMarkers}
        selectedMarkerId={selectedMarkerId}
        onMarkerPress={handleMarkerPress}
        renderMarker={renderMapMarker}
      />

      <LinearGradient
        colors={['rgba(246, 246, 248, 0.98)', 'rgba(246, 246, 248, 0.8)', 'transparent']}
        style={[styles.topGradient, { paddingTop: insets.top + 12 }]}
      >
        <Animated.View entering={webSafeFadeIn(400)} style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={handleSearchPress}
            activeOpacity={0.8}
          >
            <View style={styles.searchInputContainer}>
              <Search size={20} color={COLORS.textMuted} />
              <Text style={styles.searchPlaceholder}>Find a barber nearby...</Text>
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <SlidersHorizontal size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.mapControlButton} onPress={handleMyLocation}>
          <Locate size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapControlButton}>
          <Layers size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetHandle}
        enablePanDownToClose={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'available_now' && styles.filterChipActive,
            ]}
            onPress={() => handleFilterPress('available_now')}
          >
            <Zap
              size={14}
              color={activeFilter === 'available_now' ? '#fff' : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'available_now' && styles.filterChipTextActive,
              ]}
            >
              Available Now
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'top_rated' && styles.filterChipActive,
            ]}
            onPress={() => handleFilterPress('top_rated')}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'top_rated' && styles.filterChipTextActive,
              ]}
            >
              Rating 4.5+
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'price_range' && styles.filterChipActive,
            ]}
            onPress={() => handleFilterPress('price_range')}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'price_range' && styles.filterChipTextActive,
              ]}
            >
              Price Range
            </Text>
            <ChevronDown
              size={14}
              color={activeFilter === 'price_range' ? '#fff' : COLORS.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'type' && styles.filterChipActive]}
            onPress={() => handleFilterPress('type')}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'type' && styles.filterChipTextActive,
              ]}
            >
              Type
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'newcomers' && styles.filterChipActive,
            ]}
            onPress={() => handleFilterPress('newcomers')}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'newcomers' && styles.filterChipTextActive,
              ]}
            >
              Newcomers
            </Text>
            <Sparkles
              size={14}
              color={activeFilter === 'newcomers' ? '#fff' : COLORS.textSecondary}
            />
          </TouchableOpacity>
        </ScrollView>

        <BottomSheetScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 20}
          decelerationRate="fast"
          contentContainerStyle={styles.cardsContainer}
        >
          {filteredBarbers.map((barber, index) => renderBarberCard(barber, index))}
        </BottomSheetScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 20,
    zIndex: 10,
  },
  searchContainer: {
    width: '100%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    height: 48,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  filterButton: {
    height: '100%',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    top: '35%',
    gap: 12,
    zIndex: 10,
  },
  mapControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomSheetBackground: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomSheetHandle: {
    backgroundColor: COLORS.textMuted,
    width: 40,
    height: 4,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 20,
  },
  barberCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  barberInfo: {
    flex: 1,
  },
  barberName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  reviewCount: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  separator: {
    color: COLORS.textMuted,
    marginHorizontal: 4,
  },
  distance: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  sectionLabelBold: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specialtyTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  specialtyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  portfolioGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  portfolioItem: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  viewAllPortfolio: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  priceSuffix: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textMuted,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  mapMarker: {
    alignItems: 'center',
  },
  mapMarkerActive: {
    transform: [{ scale: 1.1 }],
  },
  markerActiveContent: {
    alignItems: 'center',
  },
  markerPriceTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  markerPriceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  markerActiveIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerIconText: {
    fontSize: 18,
  },
  markerInactiveIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerIconTextSmall: {
    fontSize: 14,
  },
});
