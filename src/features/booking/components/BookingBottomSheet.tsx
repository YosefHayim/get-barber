import React, { useCallback, useMemo, forwardRef } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { ChevronUp, MapPin, Send } from 'lucide-react-native';
import { BarberCard } from './BarberCard';
import { ServiceSelector } from './ServiceSelector';
import { useBookingStore, useTotalEstimatedPrice, useSelectedServicesCount } from '@/stores/useBookingStore';
import type { Tables } from '@/services/supabase/database.types';

type Service = Tables<'services'>;

interface NearbyBarber {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  distance_meters: number;
  price_min: number | null;
  price_max: number | null;
}

interface BookingBottomSheetProps {
  barbers: NearbyBarber[];
  services: Service[];
  isLoadingBarbers: boolean;
  isLoadingServices: boolean;
  onBarberSelect: (barber: NearbyBarber) => void;
  onRequestBarber: () => void;
  isRequesting: boolean;
  userAddress?: string;
}

const SNAP_POINTS = ['15%', '40%', '70%', '90%'];

export const BookingBottomSheet = forwardRef<BottomSheet, BookingBottomSheetProps>(
  function BookingBottomSheet(
    {
      barbers,
      services,
      isLoadingBarbers,
      isLoadingServices,
      onBarberSelect,
      onRequestBarber,
      isRequesting,
      userAddress,
    },
    ref
  ): React.JSX.Element {
    const selectedBarber = useBookingStore((s) => s.selectedBarber);
    const bottomSheetSnapIndex = useBookingStore((s) => s.bottomSheetSnapIndex);
    const setBottomSheetSnapIndex = useBookingStore((s) => s.setBottomSheetSnapIndex);
    const totalPrice = useTotalEstimatedPrice();
    const servicesCount = useSelectedServicesCount();

    const handleSheetChanges = useCallback((index: number) => {
      setBottomSheetSnapIndex(index);
    }, [setBottomSheetSnapIndex]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={1}
          appearsOnIndex={2}
          opacity={0.5}
        />
      ),
      []
    );

    const renderBarberItem = useCallback(({ item }: { item: NearbyBarber }) => (
      <BarberCard
        barber={item}
        onPress={onBarberSelect}
        isSelected={selectedBarber?.id === item.id}
      />
    ), [onBarberSelect, selectedBarber]);

    const keyExtractor = useCallback((item: NearbyBarber) => item.id, []);

    const canRequest = servicesCount > 0;

    const collapsedContent = useMemo(() => (
      <View style={styles.collapsedContent}>
        <View style={styles.handle} />
        <View style={styles.collapsedHeader}>
          <ChevronUp size={20} color="#6B7280" />
          <Text style={styles.collapsedTitle}>
            {servicesCount > 0
              ? `${servicesCount} service${servicesCount > 1 ? 's' : ''} - ${totalPrice} ILS`
              : 'Select services to get started'}
          </Text>
        </View>
        {userAddress && (
          <View style={styles.locationRow}>
            <MapPin size={14} color="#3B82F6" />
            <Text style={styles.locationText} numberOfLines={1}>
              {userAddress}
            </Text>
          </View>
        )}
      </View>
    ), [servicesCount, totalPrice, userAddress]);

    const expandedContent = useMemo(() => (
      <View style={styles.expandedContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Barbers</Text>
          {isLoadingBarbers && <ActivityIndicator size="small" />}
        </View>

        <FlatList
          data={barbers}
          renderItem={renderBarberItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.barberList}
          ListEmptyComponent={
            !isLoadingBarbers ? (
              <Text style={styles.emptyText}>No barbers nearby</Text>
            ) : null
          }
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Services</Text>
        </View>

        <View style={styles.servicesContainer}>
          <ServiceSelector
            services={services}
            isLoading={isLoadingServices}
          />
        </View>

        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={onRequestBarber}
            loading={isRequesting}
            disabled={!canRequest || isRequesting}
            icon={() => <Send size={18} color="#FFFFFF" />}
            contentStyle={styles.buttonContent}
            style={styles.requestButton}
          >
            {selectedBarber
              ? `Request ${selectedBarber.display_name}`
              : 'Find Available Barbers'}
          </Button>
        </View>
      </View>
    ), [
      barbers,
      services,
      isLoadingBarbers,
      isLoadingServices,
      selectedBarber,
      canRequest,
      isRequesting,
      onRequestBarber,
      renderBarberItem,
      keyExtractor,
    ]);

    return (
      <BottomSheet
        ref={ref}
        index={bottomSheetSnapIndex}
        snapPoints={SNAP_POINTS}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.sheetBackground}
        enablePanDownToClose={false}
      >
        <BottomSheetView style={styles.contentContainer}>
          {bottomSheetSnapIndex === 0 ? collapsedContent : expandedContent}
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handleIndicator: {
    backgroundColor: '#D1D5DB',
    width: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  collapsedContent: {
    paddingHorizontal: 20,
  },
  collapsedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  collapsedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  locationText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  expandedContent: {
    flex: 1,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  barberList: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  servicesContainer: {
    flex: 1,
    minHeight: 200,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    paddingHorizontal: 20,
  },
  footer: {
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  requestButton: {
    borderRadius: 12,
  },
  buttonContent: {
    height: 52,
  },
});
