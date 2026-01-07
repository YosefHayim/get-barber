import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Award,
  Crown,
  Gift,
  Share2,
  Copy,
  Star,
  TrendingUp,
  Clock,
  Check,
  ChevronRight,
  Zap,
  Users,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import {
  MOCK_LOYALTY_ACCOUNT,
  MOCK_LOYALTY_TRANSACTIONS,
  MOCK_REFERRAL_CODE,
  MOCK_REWARDS,
  type RewardItem,
} from '@/constants/mockData';
import {
  LOYALTY_TIER_INFO,
  POINTS_CONFIG,
  type LoyaltyTier,
  type LoyaltyTransactionType,
} from '@/types/loyalty.types';

type TabType = 'overview' | 'rewards' | 'history';

const TRANSACTION_TYPE_CONFIG: Record<LoyaltyTransactionType, { icon: typeof Star; color: string; label: string }> = {
  earned: { icon: Star, color: COLORS.success, label: 'Earned' },
  redeemed: { icon: Gift, color: COLORS.warning, label: 'Redeemed' },
  expired: { icon: Clock, color: COLORS.error, label: 'Expired' },
  bonus: { icon: Zap, color: COLORS.info, label: 'Bonus' },
  referral: { icon: Users, color: COLORS.gold, label: 'Referral' },
};

const TierBadge = ({ tier, size = 'md' }: { tier: LoyaltyTier; size?: 'sm' | 'md' | 'lg' }) => {
  const tierInfo = LOYALTY_TIER_INFO[tier];
  const sizes = {
    sm: { icon: 16, text: TYPOGRAPHY.xs, padding: SPACING.xs },
    md: { icon: 20, text: TYPOGRAPHY.sm, padding: SPACING.sm },
    lg: { icon: 24, text: TYPOGRAPHY.md, padding: SPACING.md },
  };
  const s = sizes[size];
  const IconComponent = tier === 'platinum' ? Crown : Award;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${tierInfo.color}20`,
        paddingHorizontal: s.padding,
        paddingVertical: s.padding / 2,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: tierInfo.color,
      }}
    >
      <IconComponent size={s.icon} color={tierInfo.color} />
      <Text style={{ fontSize: s.text, fontWeight: TYPOGRAPHY.semibold, color: tierInfo.color, marginLeft: SPACING.xs }}>
        {tierInfo.label}
      </Text>
    </View>
  );
};

const TierProgressBar = ({ currentTier, lifetimeBookings, lifetimeSpendCents }: {
  currentTier: LoyaltyTier;
  lifetimeBookings: number;
  lifetimeSpendCents: number;
}) => {
  const tiers: LoyaltyTier[] = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tiers.indexOf(currentTier);
  const nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;

  if (!nextTier) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: SPACING.md }}>
        <Text style={{ fontSize: TYPOGRAPHY.sm, color: COLORS.gold, fontWeight: TYPOGRAPHY.semibold }}>
          You've reached the highest tier!
        </Text>
      </View>
    );
  }

  const nextTierInfo = LOYALTY_TIER_INFO[nextTier];
  const bookingsNeeded = nextTierInfo.minBookings - lifetimeBookings;
  const spendNeeded = (nextTierInfo.minSpendCents - lifetimeSpendCents) / 100;
  const bookingsProgress = Math.min((lifetimeBookings / nextTierInfo.minBookings) * 100, 100);
  const spendProgress = Math.min((lifetimeSpendCents / nextTierInfo.minSpendCents) * 100, 100);
  const overallProgress = Math.max(bookingsProgress, spendProgress);

  return (
    <View style={{ marginTop: SPACING.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
        <Text style={{ fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary }}>
          Progress to {nextTierInfo.label}
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.sm, color: COLORS.gold, fontWeight: TYPOGRAPHY.medium }}>
          {overallProgress.toFixed(0)}%
        </Text>
      </View>
      <View style={{ height: 8, backgroundColor: COLORS.border, borderRadius: RADIUS.full, overflow: 'hidden' }}>
        <View
          style={{
            height: '100%',
            width: `${overallProgress}%`,
            backgroundColor: LOYALTY_TIER_INFO[nextTier].color,
            borderRadius: RADIUS.full,
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm }}>
        <Text style={{ fontSize: TYPOGRAPHY.xs, color: COLORS.textMuted }}>
          {bookingsNeeded > 0 ? `${bookingsNeeded} more bookings` : 'Bookings met'}
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.xs, color: COLORS.textMuted }}>
          {spendNeeded > 0 ? `₪${spendNeeded.toLocaleString()} more to spend` : 'Spend met'}
        </Text>
      </View>
    </View>
  );
};

const RewardCard = ({ reward, availablePoints, onRedeem }: {
  reward: RewardItem;
  availablePoints: number;
  onRedeem: (reward: RewardItem) => void;
}) => {
  const canRedeem = availablePoints >= reward.pointsCost && reward.isAvailable;

  return (
    <View
      style={{
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: canRedeem ? COLORS.gold : COLORS.border,
        opacity: reward.isAvailable ? 1 : 0.6,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.semibold, color: COLORS.textPrimary }}>
            {reward.title}
          </Text>
          <Text style={{ fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, marginTop: SPACING.xs }}>
            {reward.description}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: canRedeem ? COLORS.gold : COLORS.border,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            borderRadius: RADIUS.md,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold, color: canRedeem ? COLORS.charcoal : COLORS.textMuted }}>
            {reward.pointsCost}
          </Text>
          <Text style={{ fontSize: TYPOGRAPHY.xs, color: canRedeem ? COLORS.charcoal : COLORS.textMuted }}>
            pts
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => canRedeem && onRedeem(reward)}
        disabled={!canRedeem}
        style={{
          marginTop: SPACING.md,
          backgroundColor: canRedeem ? COLORS.gold : COLORS.border,
          paddingVertical: SPACING.sm,
          borderRadius: RADIUS.md,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold, color: canRedeem ? COLORS.charcoal : COLORS.textMuted }}>
          {canRedeem ? 'Redeem Now' : `Need ${reward.pointsCost - availablePoints} more pts`}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function LoyaltyScreen(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const account = MOCK_LOYALTY_ACCOUNT;
  const transactions = MOCK_LOYALTY_TRANSACTIONS;
  const referralCode = MOCK_REFERRAL_CODE;
  const rewards = MOCK_REWARDS;
  const tierInfo = LOYALTY_TIER_INFO[account.currentTier];

  const handleCopyCode = useCallback(async () => {
    await Clipboard.setStringAsync(referralCode.code);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  }, [referralCode.code]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Join BarberConnect and get ${POINTS_CONFIG.refereeBonus} bonus points! Use my code: ${referralCode.code}`,
      });
    } catch {
      Alert.alert('Error', 'Failed to share referral code');
    }
  }, [referralCode.code]);

  const handleRedeem = useCallback((reward: RewardItem) => {
    Alert.alert(
      'Redeem Reward',
      `Are you sure you want to redeem "${reward.title}" for ${reward.pointsCost} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: () => {
            Alert.alert('Success!', `You've redeemed ${reward.title}. It will be applied to your next booking.`);
          },
        },
      ]
    );
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString('en-IL', { day: 'numeric', month: 'short' });
  }, []);

  const renderOverviewTab = () => (
    <View style={{ padding: SPACING.xl }}>
      <View
        style={{
          backgroundColor: COLORS.surface,
          borderRadius: RADIUS.xl,
          padding: SPACING.xl,
          alignItems: 'center',
          borderWidth: 2,
          borderColor: tierInfo.color,
        }}
      >
        <TierBadge tier={account.currentTier} size="lg" />
        <Text style={{ fontSize: TYPOGRAPHY['3xl'], fontWeight: TYPOGRAPHY.bold, color: COLORS.textPrimary, marginTop: SPACING.lg }}>
          {account.availablePoints.toLocaleString()}
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary }}>
          Available Points
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm }}>
          <Text style={{ fontSize: TYPOGRAPHY.xs, color: COLORS.textMuted }}>
            {account.totalPoints.toLocaleString()} total earned
          </Text>
        </View>
        <TierProgressBar
          currentTier={account.currentTier}
          lifetimeBookings={account.lifetimeBookings}
          lifetimeSpendCents={account.lifetimeSpendCents}
        />
      </View>

      <View style={{ marginTop: SPACING.xl }}>
        <Text style={{ fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.semibold, color: COLORS.textPrimary, marginBottom: SPACING.md }}>
          Your Benefits
        </Text>
        {tierInfo.benefits.map((benefit, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: SPACING.sm,
              borderBottomWidth: index < tierInfo.benefits.length - 1 ? 1 : 0,
              borderBottomColor: COLORS.border,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: `${tierInfo.color}20`,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: SPACING.md,
              }}
            >
              <Check size={14} color={tierInfo.color} />
            </View>
            <Text style={{ fontSize: TYPOGRAPHY.sm, color: COLORS.textPrimary, flex: 1 }}>
              {benefit}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{
          marginTop: SPACING.xl,
          backgroundColor: COLORS.surface,
          borderRadius: RADIUS.lg,
          padding: SPACING.lg,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <Share2 size={20} color={COLORS.gold} />
          <Text style={{ fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.semibold, color: COLORS.textPrimary, marginLeft: SPACING.sm }}>
            Refer a Friend
          </Text>
        </View>
        <Text style={{ fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, marginBottom: SPACING.md }}>
          Get {POINTS_CONFIG.pointsPerReferral} points for each friend who joins. They get {POINTS_CONFIG.refereeBonus} bonus points too!
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: COLORS.background,
            borderRadius: RADIUS.md,
            padding: SPACING.md,
            marginBottom: SPACING.md,
          }}
        >
          <Text style={{ flex: 1, fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold, color: COLORS.gold, letterSpacing: 2 }}>
            {referralCode.code}
          </Text>
          <TouchableOpacity onPress={handleCopyCode} style={{ padding: SPACING.sm }}>
            <Copy size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', gap: SPACING.md }}>
          <TouchableOpacity
            onPress={handleShare}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: COLORS.gold,
              paddingVertical: SPACING.md,
              borderRadius: RADIUS.md,
            }}
          >
            <Share2 size={18} color={COLORS.charcoal} />
            <Text style={{ fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold, color: COLORS.charcoal, marginLeft: SPACING.sm }}>
              Share Code
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: TYPOGRAPHY.xs, color: COLORS.textMuted, marginTop: SPACING.md, textAlign: 'center' }}>
          {referralCode.usesCount} friends have joined using your code
        </Text>
      </View>

      <View style={{ marginTop: SPACING.xl }}>
        <Text style={{ fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.semibold, color: COLORS.textPrimary, marginBottom: SPACING.md }}>
          How to Earn Points
        </Text>
        <View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, overflow: 'hidden' }}>
          {[
            { label: 'Every ₪10 spent', points: POINTS_CONFIG.pointsPerShekel * 10, icon: Star },
            { label: 'Leave a review', points: POINTS_CONFIG.pointsPerReview, icon: Star },
            { label: 'Refer a friend', points: POINTS_CONFIG.pointsPerReferral, icon: Users },
          ].map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: SPACING.md,
                borderBottomWidth: index < 2 ? 1 : 0,
                borderBottomColor: COLORS.border,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: COLORS.goldMuted,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: SPACING.md,
                }}
              >
                <item.icon size={20} color={COLORS.gold} />
              </View>
              <Text style={{ flex: 1, fontSize: TYPOGRAPHY.sm, color: COLORS.textPrimary }}>
                {item.label}
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.bold, color: COLORS.gold }}>
                +{item.points} pts
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderRewardsTab = () => (
    <View style={{ padding: SPACING.xl }}>
      <View
        style={{
          backgroundColor: COLORS.goldMuted,
          borderRadius: RADIUS.lg,
          padding: SPACING.lg,
          marginBottom: SPACING.xl,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Gift size={24} color={COLORS.gold} />
        <View style={{ marginLeft: SPACING.md }}>
          <Text style={{ fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary }}>
            Available to redeem
          </Text>
          <Text style={{ fontSize: TYPOGRAPHY.xl, fontWeight: TYPOGRAPHY.bold, color: COLORS.gold }}>
            {account.availablePoints.toLocaleString()} points
          </Text>
        </View>
      </View>

      {rewards.map((reward) => (
        <RewardCard
          key={reward.id}
          reward={reward}
          availablePoints={account.availablePoints}
          onRedeem={handleRedeem}
        />
      ))}

      <View
        style={{
          backgroundColor: COLORS.surface,
          borderRadius: RADIUS.lg,
          padding: SPACING.lg,
          marginTop: SPACING.md,
        }}
      >
        <Text style={{ fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, textAlign: 'center' }}>
          {POINTS_CONFIG.redemptionRate} points = ₪1 value
        </Text>
      </View>
    </View>
  );

  const renderHistoryTab = () => (
    <View style={{ padding: SPACING.xl }}>
      {transactions.map((transaction, index) => {
        const config = TRANSACTION_TYPE_CONFIG[transaction.transactionType];
        const IconComponent = config.icon;
        const isPositive = transaction.points > 0;

        return (
          <View
            key={transaction.id}
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: RADIUS.lg,
              padding: SPACING.lg,
              marginBottom: SPACING.md,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: `${config.color}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: SPACING.md,
                }}
              >
                <IconComponent size={22} color={config.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.medium, color: COLORS.textPrimary }}>
                  {transaction.description || config.label}
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.xs, color: COLORS.textMuted, marginTop: 2 }}>
                  {formatDate(transaction.createdAt)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.md,
                    fontWeight: TYPOGRAPHY.bold,
                    color: isPositive ? COLORS.success : COLORS.warning,
                  }}
                >
                  {isPositive ? '+' : ''}{transaction.points}
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.xs, color: COLORS.textMuted }}>
                  pts
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: SPACING.xl,
          paddingVertical: SPACING.lg,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: SPACING.md }}>
          <ArrowLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.semibold, color: COLORS.textPrimary, flex: 1 }}>
          Rewards & Loyalty
        </Text>
        <TierBadge tier={account.currentTier} size="sm" />
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, gap: SPACING.sm }}>
        {(['overview', 'rewards', 'history'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1,
              paddingVertical: SPACING.sm,
              borderRadius: RADIUS.md,
              backgroundColor: activeTab === tab ? COLORS.gold : COLORS.surface,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: TYPOGRAPHY.sm,
                fontWeight: TYPOGRAPHY.medium,
                color: activeTab === tab ? COLORS.charcoal : COLORS.textSecondary,
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'rewards' && renderRewardsTab()}
        {activeTab === 'history' && renderHistoryTab()}
      </ScrollView>
    </SafeAreaView>
  );
}
