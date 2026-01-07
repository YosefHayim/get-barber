import React, { useCallback, useMemo, forwardRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { ChevronUp, Star, MapPin, Clock, Home } from 'lucide-react-native';
import {
  COLORS,
  SHADOWS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  BOTTOM_SHEET_SNAPS,
  formatPrice,
  formatDistance,
} from '@/constants/theme';
import type { BarberStatus } from '@/constants/theme';

export interface MapBarber {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  distanceMeters: number;
  priceMin: number | null;
  priceMax: number | null;
  status: BarberStatus;
  homeServiceAvailable?: boolean;
}

interface MapBottomSheetProps {
  barbers: MapBarber[];
  isLoading: boolean;
  selectedBarberId: string | null;
  onBarberSelect: (barber: MapBarber) => void;
  onBarberPress: (barber: MapBarber) => void;
}

const SNAP_POINTS = [
  BOTTOM_SHEET_SNAPS.collapsed,
  BOTTOM_SHEET_SNAPS.partial,
  BOTTOM_SHEET_SNAPS.expanded,
];

function HorizontalBarberCard({
  barber,
  isSelected,
  onPress,
}: {
  barber: MapBarber;
  isSelected: boolean;
  onPress: () => void;
}) {
  const initials = barber.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.horizontalCard,
        isSelected && styles.horizontalCardSelected,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.horizontalCardContent}>
        {barber.avatarUrl ? (
          <Image source={{ uri: barber.avatarUrl }} style={styles.horizontalAvatar} />
        ) : (
          <View style={styles.horizontalAvatarFallback}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
        <View style={styles.horizontalInfo}>
          <Text style={styles.horizontalName} numberOfLines={1}>
            {barber.displayName}
          </Text>
          <View style={styles.ratingRow}>
            <Star size={12} color={COLORS.brass} fill={COLORS.brass} />
            <Text style={styles.ratingText}>{barber.rating.toFixed(1)}</Text>
          </View>
        </View>
        {barber.status === 'available' && (
          <View style={styles.availableDot} />
        )}
      </View>
    </Pressable>
  );
}

function VerticalBarberCard({
  barber,
  isSelected,
  onPress,
}: {
  barber: MapBarber;
  isSelected: boolean;
  onPress: () => void;
}) {
  const initials = barber.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const priceRange = barber.priceMin && barber.priceMax
    ? `${formatPrice(barber.priceMin)} - ${formatPrice(barber.priceMax)}`
    : barber.priceMin
    ? `From ${formatPrice(barber.priceMin)}`
    : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.verticalCard,
        isSelected && styles.verticalCardSelected,
        pressed && styles.cardPressed,
      ]}
    >
      {barber.avatarUrl ? (
        <Image source={{ uri: barber.avatarUrl }} style={styles.verticalAvatar} />
      ) : (
        <View style={[styles.verticalAvatar, styles.verticalAvatarFallback]}>
          <Text style={styles.avatarTextLarge}>{initials}</Text>
        </View>
      )}
      
      <View style={styles.verticalContent}>
        <View style={styles.verticalHeader}>
          <Text style={styles.verticalName} numberOfLines={1}>
            {barber.displayName}
          </Text>
          {barber.isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>PRO</Text>
            </View>
          )}
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Star size={14} color={COLORS.brass} fill={COLORS.brass} />
            <Text style={styles.statText}>
              {barber.rating.toFixed(1)} ({barber.totalReviews})
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MapPin size={14} color={COLORS.textMuted} />
            <Text style={styles.statText}>{formatDistance(barber.distanceMeters)}</Text>
          </View>
          {barber.homeServiceAvailable && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Home size={14} color={COLORS.copper} />
              </View>
            </>
          )}
        </View>
        
        {priceRange && (
          <Text style={styles.priceRange}>{priceRange}</Text>
        )}
        
        {barber.bio && (
          <Text style={styles.bio} numberOfLines={2}>
            {barber.bio}
          </Text>
        )}
      </View>
      
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusBadge,
            barber.status === 'available' && styles.statusAvailable,
            barber.status === 'busy' && styles.statusBusy,
            barber.status === 'offline' && styles.statusOffline,
          ]}
        >
          <Text style={styles.statusText}>
            {barber.status === 'available' ? 'Available' : barber.status === 'busy' ? 'Busy' : 'Offline'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export const MapBottomSheet = forwardRef<BottomSheet, MapBottomSheetProps>(
  function MapBottomSheet(
    { barbers, isLoading, selectedBarberId, onBarberSelect, onBarberPress },
    ref
  ): React.JSX.Element {
    const [snapIndex, setSnapIndex] = React.useState(0);

    const handleSheetChanges = useCallback((index: number) => {
      setSnapIndex(index);
    }, []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={1}
          appearsOnIndex={2}
          opacity={0.3}
        />
      ),
      []
    );

    const availableCount = useMemo(
      () => barbers.filter((b) => b.status === 'available').length,
      [barbers]
    );

    const renderHorizontalItem = useCallback(
      ({ item }: { item: MapBarber }) => (
        <HorizontalBarberCard
          barber={item}
          isSelected={item.id === selectedBarberId}
          onPress={() => onBarberSelect(item)}
        />
      ),
      [selectedBarberId, onBarberSelect]
    );

    const collapsedContent = (
      <View style={styles.collapsedContent}>
        <View style={styles.collapsedHeader}>
          <ChevronUp size={20} color={COLORS.copper} />
          <Text style={styles.collapsedTitle}>
            {availableCount > 0
              ? `${availableCount} barber${availableCount > 1 ? 's' : ''} available`
              : 'No barbers available'}
          </Text>
          {isLoading && <ActivityIndicator size="small" color={COLORS.copper} />}
        </View>
        
        <FlatList
          data={barbers.slice(0, 5)}
          renderItem={renderHorizontalItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
    );

    const expandedContent = (
      <BottomSheetScrollView contentContainerStyle={styles.expandedContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Barbers</Text>
          <Text style={styles.sectionCount}>{barbers.length} found</Text>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.copper} />
          </View>
        ) : barbers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No barbers found in your area</Text>
          </View>
        ) : (
          barbers.map((barber) => (
            <VerticalBarberCard
              key={barber.id}
              barber={barber}
              isSelected={barber.id === selectedBarberId}
              onPress={() => onBarberPress(barber)}
            />
          ))
        )}
      </BottomSheetScrollView>
    );

    return (
      <BottomSheet
        ref={ref}
        index={0}
        snapPoints={SNAP_POINTS}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.sheetBackground}
        enablePanDownToClose={false}
      >
        <BottomSheetView style={styles.contentContainer}>
          {snapIndex === 0 ? collapsedContent : expandedContent}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  sheetBackground: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    ...SHADOWS.xl,
  },
  handleIndicator: {
    backgroundColor: COLORS.copper,
    width: 48,
    height: 5,
    borderRadius: 3,
  },
  collapsedContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  collapsedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  collapsedTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  horizontalList: {
    gap: SPACING.sm,
  },
  horizontalCard: {
    width: 100,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  horizontalCardSelected: {
    borderColor: COLORS.copper,
    borderWidth: 2,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  horizontalCardContent: {
    alignItems: 'center',
  },
  horizontalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: SPACING.xs,
  },
  horizontalAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  avatarText: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
  },
  horizontalInfo: {
    alignItems: 'center',
  },
  horizontalName: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
  },
  availableDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.online,
  },
  expandedContent: {
    paddingBottom: SPACING['3xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  sectionCount: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
  },
  loadingContainer: {
    padding: SPACING['3xl'],
    alignItems: 'center',
  },
  emptyContainer: {
    padding: SPACING['3xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textMuted,
  },
  verticalCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  verticalCardSelected: {
    borderColor: COLORS.copper,
    borderWidth: 2,
  },
  verticalAvatar: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.md,
  },
  verticalAvatarFallback: {
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextLarge: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
  },
  verticalContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  verticalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  verticalName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: COLORS.copper,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  verifiedText: {
    color: COLORS.textInverse,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.bold,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.border,
  },
  priceRange: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.navy,
    marginTop: SPACING.xs,
  },
  bio: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    lineHeight: TYPOGRAPHY.sm * 1.4,
  },
  statusContainer: {
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  statusAvailable: {
    backgroundColor: COLORS.successLight,
  },
  statusBusy: {
    backgroundColor: COLORS.warningLight,
  },
  statusOffline: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  statusText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
});
