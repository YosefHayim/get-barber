import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonButton } from './Skeleton';
import { DARK_COLORS, SPACING, RADIUS } from '@/constants/theme';

// Barber card skeleton
export function BarberCardSkeleton() {
  return (
    <View style={styles.barberCard}>
      <View style={styles.barberCardImage}>
        <Skeleton width="100%" height="100%" borderRadius={RADIUS.lg} />
      </View>
      <View style={styles.barberCardContent}>
        <SkeletonText lines={1} lineHeight={20} />
        <View style={styles.barberCardRow}>
          <Skeleton width={60} height={14} variant="text" />
          <Skeleton width={80} height={14} variant="text" />
        </View>
        <SkeletonText lines={1} lineHeight={14} />
      </View>
    </View>
  );
}

// Barber list item skeleton
export function BarberListItemSkeleton() {
  return (
    <View style={styles.listItem}>
      <SkeletonAvatar size={56} />
      <View style={styles.listItemContent}>
        <Skeleton width="60%" height={18} variant="text" />
        <Skeleton width="40%" height={14} variant="text" style={{ marginTop: 4 }} />
        <Skeleton width="80%" height={12} variant="text" style={{ marginTop: 4 }} />
      </View>
      <Skeleton width={70} height={32} variant="rounded" />
    </View>
  );
}

// Booking card skeleton
export function BookingCardSkeleton() {
  return (
    <View style={styles.bookingCard}>
      <View style={styles.bookingCardHeader}>
        <SkeletonAvatar size={48} />
        <View style={styles.bookingCardHeaderText}>
          <Skeleton width="50%" height={16} variant="text" />
          <Skeleton width="70%" height={12} variant="text" style={{ marginTop: 4 }} />
        </View>
        <Skeleton width={60} height={24} variant="rounded" />
      </View>
      <View style={styles.bookingCardDivider} />
      <View style={styles.bookingCardDetails}>
        <View style={styles.bookingCardDetail}>
          <Skeleton width={16} height={16} variant="circular" />
          <Skeleton width="60%" height={14} variant="text" />
        </View>
        <View style={styles.bookingCardDetail}>
          <Skeleton width={16} height={16} variant="circular" />
          <Skeleton width="40%" height={14} variant="text" />
        </View>
      </View>
      <SkeletonButton height={44} />
    </View>
  );
}

// Service item skeleton
export function ServiceItemSkeleton() {
  return (
    <View style={styles.serviceItem}>
      <View style={styles.serviceItemContent}>
        <Skeleton width="50%" height={16} variant="text" />
        <Skeleton width="80%" height={12} variant="text" style={{ marginTop: 4 }} />
        <View style={styles.serviceItemMeta}>
          <Skeleton width={40} height={14} variant="text" />
          <Skeleton width={50} height={14} variant="text" />
        </View>
      </View>
      <Skeleton width={24} height={24} variant="circular" />
    </View>
  );
}

// Review skeleton
export function ReviewSkeleton() {
  return (
    <View style={styles.review}>
      <View style={styles.reviewHeader}>
        <SkeletonAvatar size={40} />
        <View style={styles.reviewHeaderText}>
          <Skeleton width="40%" height={14} variant="text" />
          <Skeleton width="30%" height={12} variant="text" style={{ marginTop: 2 }} />
        </View>
        <Skeleton width={70} height={16} variant="rounded" />
      </View>
      <SkeletonText lines={3} lineHeight={14} spacing={6} lastLineWidth="80%" />
    </View>
  );
}

// Home screen hero skeleton
export function HomeHeroSkeleton() {
  return (
    <View style={styles.homeHero}>
      <Skeleton width="100%" height={200} borderRadius={RADIUS.xl} />
      <View style={styles.homeHeroOverlay}>
        <Skeleton width="70%" height={24} variant="text" />
        <Skeleton width="50%" height={16} variant="text" style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

// Category pills skeleton
export function CategoryPillsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.categoryPills}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          width={80 + Math.random() * 40}
          height={36}
          variant="rounded"
        />
      ))}
    </View>
  );
}

// Stats card skeleton
export function StatsCardSkeleton() {
  return (
    <View style={styles.statsCard}>
      <Skeleton width={40} height={40} variant="circular" />
      <View style={styles.statsCardContent}>
        <Skeleton width={60} height={24} variant="text" />
        <Skeleton width={80} height={14} variant="text" style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

// Dashboard stats skeleton
export function DashboardStatsSkeleton() {
  return (
    <View style={styles.dashboardStats}>
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
    </View>
  );
}

// Chat message skeleton
export function ChatMessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <View style={[styles.chatMessage, isUser && styles.chatMessageUser]}>
      {!isUser && <SkeletonAvatar size={32} />}
      <View
        style={[
          styles.chatBubble,
          isUser ? styles.chatBubbleUser : styles.chatBubbleOther,
        ]}
      >
        <SkeletonText
          lines={2}
          lineHeight={14}
          spacing={4}
          lastLineWidth={isUser ? '40%' : '60%'}
        />
      </View>
      {isUser && <SkeletonAvatar size={32} />}
    </View>
  );
}

// Full page loader with multiple skeletons
export function PageLoaderSkeleton({
  variant = 'list',
}: {
  variant?: 'list' | 'cards' | 'dashboard';
}) {
  if (variant === 'dashboard') {
    return (
      <View style={styles.pageSkeleton}>
        <DashboardStatsSkeleton />
        <View style={{ marginTop: SPACING.lg }}>
          <Skeleton width={120} height={20} variant="text" />
        </View>
        <View style={{ marginTop: SPACING.md, gap: SPACING.md }}>
          <BookingCardSkeleton />
          <BookingCardSkeleton />
        </View>
      </View>
    );
  }

  if (variant === 'cards') {
    return (
      <View style={styles.pageSkeleton}>
        <HomeHeroSkeleton />
        <CategoryPillsSkeleton />
        <View style={{ marginTop: SPACING.lg, gap: SPACING.md }}>
          <BarberCardSkeleton />
          <BarberCardSkeleton />
        </View>
      </View>
    );
  }

  // Default list
  return (
    <View style={styles.pageSkeleton}>
      <View style={{ gap: SPACING.md }}>
        <BarberListItemSkeleton />
        <BarberListItemSkeleton />
        <BarberListItemSkeleton />
        <BarberListItemSkeleton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barberCard: {
    backgroundColor: DARK_COLORS.surface,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  barberCardImage: {
    height: 160,
  },
  barberCardContent: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  barberCardRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: DARK_COLORS.surface,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
  },
  listItemContent: {
    flex: 1,
  },
  bookingCard: {
    backgroundColor: DARK_COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  bookingCardHeaderText: {
    flex: 1,
  },
  bookingCardDivider: {
    height: 1,
    backgroundColor: DARK_COLORS.border,
  },
  bookingCardDetails: {
    gap: SPACING.sm,
  },
  bookingCardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: DARK_COLORS.surface,
    borderRadius: RADIUS.lg,
  },
  serviceItemContent: {
    flex: 1,
  },
  serviceItemMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  review: {
    padding: SPACING.md,
    backgroundColor: DARK_COLORS.surface,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  reviewHeaderText: {
    flex: 1,
  },
  homeHero: {
    position: 'relative',
  },
  homeHeroOverlay: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  categoryPills: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    flexWrap: 'wrap',
  },
  statsCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: DARK_COLORS.surface,
    borderRadius: RADIUS.lg,
  },
  statsCardContent: {
    flex: 1,
  },
  dashboardStats: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  chatMessage: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  chatMessageUser: {
    flexDirection: 'row-reverse',
  },
  chatBubble: {
    maxWidth: '70%',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  chatBubbleUser: {
    backgroundColor: DARK_COLORS.primaryMuted,
  },
  chatBubbleOther: {
    backgroundColor: DARK_COLORS.surface,
  },
  pageSkeleton: {
    padding: SPACING.lg,
  },
});

export default {
  BarberCardSkeleton,
  BarberListItemSkeleton,
  BookingCardSkeleton,
  ServiceItemSkeleton,
  ReviewSkeleton,
  HomeHeroSkeleton,
  CategoryPillsSkeleton,
  StatsCardSkeleton,
  DashboardStatsSkeleton,
  ChatMessageSkeleton,
  PageLoaderSkeleton,
};
