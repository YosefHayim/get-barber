import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
} from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Star,
  User,
  DollarSign,
  Filter,
} from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, getStatusColor, getStatusLabel } from '@/constants/theme';
import type { BookingStatus } from '@/constants/theme';
import { MOCK_BOOKINGS_BARBER } from '@/constants/mockData';

const LIGHT_COLORS = {
  background: '#f6f6f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  textPrimary: '#0d181b',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
};

type FilterType = 'all' | BookingStatus;

interface BookingItemProps {
  booking: typeof MOCK_BOOKINGS_BARBER[0];
}

function BookingItem({ booking }: BookingItemProps): React.JSX.Element {
  const statusColor = getStatusColor(booking.status);
  const statusLabel = getStatusLabel(booking.status);
  
  const scheduledDate = new Date(booking.scheduledAt);
  const formattedDate = scheduledDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Pressable style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.customerInfo}>
          <Avatar
            uri={booking.customerAvatar}
            name={booking.customerName}
            size={48}
          />
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{booking.customerName}</Text>
            <View style={styles.servicesRow}>
              {booking.services.map((service, index) => (
                <Text key={index} style={styles.serviceName}>
                  {service}
                  {index < booking.services.length - 1 && ', '}
                </Text>
              ))}
            </View>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Calendar size={14} color={LIGHT_COLORS.textMuted} />
          <Text style={styles.detailText}>{formattedDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={14} color={LIGHT_COLORS.textMuted} />
          <Text style={styles.detailText}>{formattedTime}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={14} color={LIGHT_COLORS.textMuted} />
          <Text style={styles.detailText} numberOfLines={1}>{booking.address}</Text>
        </View>
      </View>

      <View style={styles.bookingFooter}>
        <View style={styles.priceContainer}>
          <DollarSign size={16} color={COLORS.gold} />
          <Text style={styles.priceText}>{booking.totalPrice}</Text>
        </View>
        {booking.rating && (
          <View style={styles.ratingContainer}>
            <Star size={14} color={COLORS.gold} fill={COLORS.gold} />
            <Text style={styles.ratingText}>{booking.rating}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function BookingsHistoryScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterType>('all');

  const allBookings = [...MOCK_BOOKINGS_BARBER].sort(
    (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  );

  const filteredBookings = filter === 'all'
    ? allBookings
    : allBookings.filter((b) => b.status === filter);

  const stats = {
    total: allBookings.length,
    completed: allBookings.filter((b) => b.status === 'completed').length,
    pending: allBookings.filter((b) => b.status === 'pending').length,
    confirmed: allBookings.filter((b) => b.status === 'confirmed').length,
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Bookings History',
          headerStyle: { backgroundColor: LIGHT_COLORS.surface },
          headerTitleStyle: { fontWeight: '700', color: LIGHT_COLORS.textPrimary },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={COLORS.gold} />
            </Pressable>
          ),
        }}
      />
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats.total}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                {stats.completed}
              </Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: COLORS.info }]}>
                {stats.confirmed}
              </Text>
              <Text style={styles.summaryLabel}>Confirmed</Text>
            </View>
          </View>
        </View>

        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {filters.map((f) => (
              <Pressable
                key={f.key}
                style={[
                  styles.filterChip,
                  filter === f.key && styles.filterChipActive,
                ]}
                onPress={() => setFilter(f.key)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filter === f.key && styles.filterChipTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color={LIGHT_COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Bookings Found</Text>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? 'You have no bookings yet'
                : `No ${filter} bookings found`}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredBookings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <BookingItem booking={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_COLORS.background,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  summaryCard: {
    backgroundColor: LIGHT_COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.gold,
    marginBottom: SPACING.xxs,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: LIGHT_COLORS.textMuted,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: LIGHT_COLORS.border,
  },
  filtersContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  filtersContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: LIGHT_COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: LIGHT_COLORS.textPrimary,
  },
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  bookingCard: {
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  customerName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.textPrimary,
    marginBottom: SPACING.xxs,
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceName: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textMuted,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
  },
  bookingDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: LIGHT_COLORS.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textMuted,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.gold,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.goldMuted,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.xs,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.gold,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING['3xl'],
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textMuted,
    textAlign: 'center',
  },
});
