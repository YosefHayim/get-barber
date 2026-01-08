import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { formatDistanceToNow } from 'date-fns';
import {
  Briefcase,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Navigation,
  Sparkles,
  Filter,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Avatar } from '@/components/ui/Avatar';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { useAppStore } from '@/stores/useAppStore';
import { MOCK_SERVICE_REQUESTS, type MockServiceRequest } from '@/constants/mockData';

type FilterType = 'all' | 'new' | 'viewed';

function FilterButton({
  label,
  isActive,
  onPress,
  count,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  count?: number;
}): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
    >
      <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={[styles.filterBadge, isActive && styles.filterBadgeActive]}>
          <Text style={[styles.filterBadgeText, isActive && styles.filterBadgeTextActive]}>
            {count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function RequestCard({
  request,
  onAccept,
  onDecline,
  onChat,
}: {
  request: MockServiceRequest;
  onAccept: () => void;
  onDecline: () => void;
  onChat: () => void;
}): React.JSX.Element {
  const isNew = request.status === 'new';
  const expiresIn = Math.max(
    0,
    Math.floor((new Date(request.expiresAt).getTime() - Date.now()) / 60000)
  );
  const isUrgent = expiresIn < 10;

  return (
    <Animated.View entering={FadeInDown.duration(300)}>
      <Surface style={[styles.requestCard, isNew && styles.requestCardNew]} elevation={2}>
        <View style={styles.requestHeader}>
          <View style={styles.customerInfo}>
            <Avatar uri={request.customerAvatar} name={request.customerName} size={52} />
            <View style={styles.customerDetails}>
              <View style={styles.customerNameRow}>
                <Text style={styles.customerName}>{request.customerName}</Text>
                {isNew && (
                  <View style={styles.newBadge}>
                    <Sparkles size={10} color={COLORS.charcoal} />
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}
              </View>
              <View style={styles.ratingRow}>
                <Star size={12} color={COLORS.gold} fill={COLORS.gold} />
                <Text style={styles.ratingText}>{request.customerRating}</Text>
                <Text style={styles.ratingDivider}>•</Text>
                <Text style={styles.bookingsText}>Regular customer</Text>
              </View>
            </View>
          </View>
          <View style={[styles.timerBadge, isUrgent && styles.timerBadgeUrgent]}>
            <Clock size={14} color={isUrgent ? COLORS.error : COLORS.warning} />
            <Text style={[styles.timerText, isUrgent && styles.timerTextUrgent]}>
              {expiresIn}m
            </Text>
          </View>
        </View>

        <View style={styles.servicesContainer}>
          <Text style={styles.servicesLabel}>Requested Services</Text>
          <View style={styles.servicesRow}>
            {request.services.map((service) => (
              <View key={service} style={styles.serviceChip}>
                <Text style={styles.serviceChipText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <MapPin size={16} color={COLORS.gold} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationAddress} numberOfLines={1}>
                {request.address}
              </Text>
              <Text style={styles.locationDistance}>
                {(request.distanceMeters / 1000).toFixed(1)} km away
              </Text>
            </View>
            <Pressable style={styles.navigationButton}>
              <Navigation size={18} color={COLORS.goldDark} />
            </Pressable>
          </View>
        </View>

        {request.offeredPrice && (
          <View style={styles.priceOffer}>
            <Text style={styles.priceOfferLabel}>Customer's offer</Text>
            <Text style={styles.priceOfferAmount}>₪{request.offeredPrice}</Text>
          </View>
        )}

        <View style={styles.requestActions}>
          <Button
            mode="contained"
            icon={() => <CheckCircle2 size={16} color={COLORS.textInverse} />}
            onPress={onAccept}
            style={[styles.actionButton, { backgroundColor: COLORS.success }]}
            labelStyle={styles.actionButtonLabel}
          >
            Accept
          </Button>
          <Button
            mode="outlined"
            icon={() => <MessageCircle size={16} color={COLORS.goldDark} />}
            onPress={onChat}
            style={styles.actionButton}
            labelStyle={[styles.actionButtonLabel, { color: COLORS.goldDark }]}
          >
            Negotiate
          </Button>
          <Pressable onPress={onDecline} style={styles.declineButton}>
            <XCircle size={22} color={COLORS.error} />
          </Pressable>
        </View>
      </Surface>
    </Animated.View>
  );
}

export default function BarberRequestsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const isOnline = useAppStore((s) => s.isBarberOnline);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const allRequests = MOCK_SERVICE_REQUESTS;
  const newRequests = allRequests.filter((r) => r.status === 'new');
  const viewedRequests = allRequests.filter((r) => r.status === 'viewed');

  const filteredRequests =
    activeFilter === 'new'
      ? newRequests
      : activeFilter === 'viewed'
      ? viewedRequests
      : allRequests;

  const handleAccept = useCallback((requestId: string) => {
    console.log('Accept request:', requestId);
  }, []);

  const handleDecline = useCallback((requestId: string) => {
    console.log('Decline request:', requestId);
  }, []);

  const handleChat = useCallback((requestId: string) => {
    router.push(`/(modals)/chat/${requestId}`);
  }, []);

  const renderRequest = useCallback(
    ({ item }: { item: MockServiceRequest }) => (
      <RequestCard
        request={item}
        onAccept={() => handleAccept(item.id)}
        onDecline={() => handleDecline(item.id)}
        onChat={() => handleChat(item.id)}
      />
    ),
    [handleAccept, handleDecline, handleChat]
  );

  const keyExtractor = useCallback((item: MockServiceRequest) => item.id, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Requests</Text>
          <View style={styles.headerBadge}>
            <Briefcase size={16} color={COLORS.gold} />
            <Text style={styles.headerBadgeText}>{allRequests.length} active</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          {isOnline ? 'Incoming customer requests' : 'Go online to receive requests'}
        </Text>
      </Animated.View>

      <View style={styles.filtersContainer}>
        <FilterButton
          label="All"
          count={allRequests.length}
          isActive={activeFilter === 'all'}
          onPress={() => setActiveFilter('all')}
        />
        <FilterButton
          label="New"
          count={newRequests.length}
          isActive={activeFilter === 'new'}
          onPress={() => setActiveFilter('new')}
        />
        <FilterButton
          label="Viewed"
          count={viewedRequests.length}
          isActive={activeFilter === 'viewed'}
          onPress={() => setActiveFilter('viewed')}
        />
      </View>

      {!isOnline ? (
        <View style={styles.offlineState}>
          <View style={styles.offlineIcon}>
            <Briefcase size={48} color={COLORS.textMuted} />
          </View>
          <Text style={styles.offlineTitle}>You're offline</Text>
          <Text style={styles.offlineText}>
            Go online from the dashboard to start receiving customer requests
          </Text>
        </View>
      ) : filteredRequests.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Briefcase size={48} color={COLORS.gold} />
          </View>
          <Text style={styles.emptyTitle}>No requests yet</Text>
          <Text style={styles.emptyText}>
            New customer requests will appear here
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlashList
            data={filteredRequests}
            renderItem={renderRequest}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.charcoal,
  },
  listContainer: {
    flex: 1,
  },
  header: {
    padding: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textInverse,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.goldMuted,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  headerBadgeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.gold,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.darkGray,
  },
  filterButtonActive: {
    backgroundColor: COLORS.gold,
  },
  filterButtonText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textMuted,
  },
  filterButtonTextActive: {
    color: COLORS.charcoal,
  },
  filterBadge: {
    backgroundColor: COLORS.mediumGray,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.xs,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: COLORS.charcoal,
  },
  filterBadgeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textMuted,
  },
  filterBadgeTextActive: {
    color: COLORS.gold,
  },
  listContent: {
    padding: SPACING.lg,
  },
  separator: {
    height: SPACING.md,
  },
  requestCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.darkGray,
  },
  requestCardNew: {
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  customerDetails: {
    flex: 1,
  },
  customerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  customerName: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textInverse,
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.xs,
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.charcoal,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    marginTop: SPACING.xxs,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textInverse,
    fontWeight: TYPOGRAPHY.medium,
  },
  ratingDivider: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.xxs,
  },
  bookingsText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xxs,
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  timerBadgeUrgent: {
    backgroundColor: COLORS.errorLight,
  },
  timerText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.warning,
  },
  timerTextUrgent: {
    color: COLORS.error,
  },
  servicesContainer: {
    marginTop: SPACING.lg,
  },
  servicesLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  serviceChip: {
    backgroundColor: COLORS.goldMuted,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  serviceChipText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.gold,
  },
  locationContainer: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.mediumGray,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationAddress: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textInverse,
    fontWeight: TYPOGRAPHY.medium,
  },
  locationDistance: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xxs,
  },
  navigationButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceOffer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.mediumGray,
  },
  priceOfferLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
  },
  priceOfferAmount: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.gold,
  },
  requestActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.mediumGray,
  },
  actionButton: {
    flex: 1,
    borderRadius: RADIUS.md,
  },
  actionButtonLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
  },
  declineButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING['3xl'],
  },
  offlineIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  offlineTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textInverse,
    marginBottom: SPACING.sm,
  },
  offlineText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING['3xl'],
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textInverse,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
