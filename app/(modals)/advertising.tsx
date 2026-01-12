import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Star,
  TrendingUp,
  MapPin,
  Bell,
  Plus,
  Wallet,
  Play,
  Pause,
  Eye,
  MousePointer,
  Calendar,
  ChevronRight,
  X,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react-native';
import { COLORS, SHADOWS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';

const LIGHT_COLORS = {
  background: '#f6f6f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  textPrimary: '#0d181b',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
};

import {
  MOCK_CAMPAIGNS,
  MOCK_WALLET,
  MOCK_WALLET_TRANSACTIONS,
  MOCK_CAMPAIGN_STATS,
  AD_STATUS_CONFIG,
} from '@/constants/mockData';
import {
  AD_CAMPAIGN_TYPE_INFO,
  type AdCampaign,
  type AdCampaignType,
  type AdCampaignStatus,
} from '@/types/advertising.types';

const CampaignTypeIcon = ({ type, size = 24, color }: { type: AdCampaignType; size?: number; color: string }) => {
  switch (type) {
    case 'featured_placement':
      return <Star size={size} color={color} />;
    case 'search_boost':
      return <TrendingUp size={size} color={color} />;
    case 'area_dominance':
      return <MapPin size={size} color={color} />;
    case 'push_notification':
      return <Bell size={size} color={color} />;
  }
};

export default function AdvertisingScreen(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'wallet'>('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null);
  const [showCampaignDetail, setShowCampaignDetail] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');

  const activeCampaigns = useMemo(
    () => MOCK_CAMPAIGNS.filter((c) => c.status === 'active'),
    []
  );

  const totalSpent = useMemo(
    () => MOCK_CAMPAIGNS.reduce((sum, c) => sum + c.spentCents, 0),
    []
  );

  const totalImpressionsAllCampaigns = useMemo(
    () => Object.values(MOCK_CAMPAIGN_STATS).reduce((sum, s) => sum + s.impressions, 0),
    []
  );

  const formatCurrency = useCallback((cents: number) => {
    return `₪${(cents / 100).toLocaleString()}`;
  }, []);

  const formatDate = useCallback((dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IL', {
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const handleCampaignAction = useCallback((campaign: AdCampaign, action: 'pause' | 'resume' | 'cancel') => {
    const actionText = action === 'pause' ? 'pause' : action === 'resume' ? 'resume' : 'cancel';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Campaign`,
      `Are you sure you want to ${actionText} "${campaign.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => Alert.alert('Success', `Campaign ${actionText}d successfully.`) },
      ]
    );
  }, []);

  const handleTopUp = useCallback(() => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount < 10) {
      Alert.alert('Invalid Amount', 'Please enter at least ₪10.');
      return;
    }
    Alert.alert('Top Up', `Add ₪${amount.toFixed(0)} to your wallet?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: () => {
          Alert.alert('Success', 'Funds added to your wallet.');
          setTopUpAmount('');
          setShowTopUpModal(false);
        },
      },
    ]);
  }, [topUpAmount]);

  const renderCampaignCard = useCallback(
    (campaign: AdCampaign) => {
      const stats = MOCK_CAMPAIGN_STATS[campaign.id];
      const statusConfig = AD_STATUS_CONFIG[campaign.status];
      const typeInfo = AD_CAMPAIGN_TYPE_INFO[campaign.campaignType];
      const progress = campaign.totalBudgetCents
        ? (campaign.spentCents / campaign.totalBudgetCents) * 100
        : 0;

      return (
        <TouchableOpacity
          key={campaign.id}
          style={{
            backgroundColor: LIGHT_COLORS.surface,
            borderRadius: RADIUS.lg,
            padding: SPACING.lg,
            marginBottom: SPACING.md,
            ...SHADOWS.md,
          }}
          onPress={() => {
            setSelectedCampaign(campaign);
            setShowCampaignDetail(true);
          }}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: RADIUS.md,
                  backgroundColor: COLORS.goldMuted,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: SPACING.md,
                }}
              >
                <CampaignTypeIcon type={campaign.campaignType} size={22} color={COLORS.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.md,
                    fontWeight: TYPOGRAPHY.semibold,
                    color: LIGHT_COLORS.textPrimary,
                    marginBottom: 2,
                  }}
                  numberOfLines={1}
                >
                  {campaign.title || typeInfo.label}
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.sm, color: LIGHT_COLORS.textMuted }}>
                  {typeInfo.label}
                </Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: statusConfig.bgColor,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: RADIUS.sm,
              }}
            >
              <Text
                style={{
                  fontSize: TYPOGRAPHY.xs,
                  fontWeight: TYPOGRAPHY.medium,
                  color: statusConfig.color,
                }}
              >
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {stats && (
            <View style={{ flexDirection: 'row', marginBottom: SPACING.md, gap: SPACING.lg }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold, color: LIGHT_COLORS.textPrimary }}>
                  {stats.impressions.toLocaleString()}
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.xs, color: LIGHT_COLORS.textMuted }}>Impressions</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold, color: LIGHT_COLORS.textPrimary }}>
                  {stats.clicks}
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.xs, color: LIGHT_COLORS.textMuted }}>Clicks</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold, color: COLORS.gold }}>
                  {stats.bookings}
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.xs, color: LIGHT_COLORS.textMuted }}>Bookings</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold, color: LIGHT_COLORS.textPrimary }}>
                  {stats.ctr.toFixed(1)}%
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.xs, color: LIGHT_COLORS.textMuted }}>CTR</Text>
              </View>
            </View>
          )}

          <View style={{ marginBottom: SPACING.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: TYPOGRAPHY.sm, color: LIGHT_COLORS.textMuted }}>Budget Used</Text>
              <Text style={{ fontSize: TYPOGRAPHY.sm, color: LIGHT_COLORS.textSecondary }}>
                {formatCurrency(campaign.spentCents)} / {formatCurrency(campaign.totalBudgetCents || 0)}
              </Text>
            </View>
            <View
              style={{
                height: 6,
                backgroundColor: LIGHT_COLORS.border,
                borderRadius: RADIUS.full,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: progress > 80 ? COLORS.warning : COLORS.gold,
                  borderRadius: RADIUS.full,
                }}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: TYPOGRAPHY.xs, color: LIGHT_COLORS.textMuted }}>
              {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
            </Text>
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              {campaign.status === 'active' && (
                <TouchableOpacity
                  onPress={() => handleCampaignAction(campaign, 'pause')}
                  style={{
                    padding: SPACING.sm,
                    backgroundColor: LIGHT_COLORS.surfaceHighlight,
                    borderRadius: RADIUS.sm,
                  }}
                >
                  <Pause size={16} color={LIGHT_COLORS.textSecondary} />
                </TouchableOpacity>
              )}
              {campaign.status === 'paused' && (
                <TouchableOpacity
                  onPress={() => handleCampaignAction(campaign, 'resume')}
                  style={{
                    padding: SPACING.sm,
                    backgroundColor: COLORS.success,
                    borderRadius: RADIUS.sm,
                  }}
                >
                  <Play size={16} color={LIGHT_COLORS.surface} />
                </TouchableOpacity>
              )}
              <ChevronRight size={20} color={LIGHT_COLORS.textMuted} />
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [formatCurrency, formatDate, handleCampaignAction]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LIGHT_COLORS.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: SPACING.xl,
          paddingVertical: SPACING.lg,
          borderBottomWidth: 1,
          borderBottomColor: LIGHT_COLORS.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: SPACING.md }}>
          <ArrowLeft size={24} color={LIGHT_COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.semibold, color: LIGHT_COLORS.textPrimary, flex: 1 }}>
          Advertising
        </Text>
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          style={{
            backgroundColor: COLORS.gold,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            borderRadius: RADIUS.md,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Plus size={18} color={COLORS.charcoal} />
          <Text style={{ fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.semibold, color: COLORS.charcoal, marginLeft: 4 }}>
            New
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', marginHorizontal: SPACING.xl, marginTop: SPACING.lg }}>
        <TouchableOpacity
          onPress={() => setActiveTab('campaigns')}
          style={{
            flex: 1,
            paddingVertical: SPACING.md,
            alignItems: 'center',
            borderBottomWidth: 2,
            borderBottomColor: activeTab === 'campaigns' ? COLORS.gold : 'transparent',
          }}
        >
          <Text
            style={{
              fontSize: TYPOGRAPHY.md,
              fontWeight: TYPOGRAPHY.medium,
              color: activeTab === 'campaigns' ? COLORS.gold : LIGHT_COLORS.textMuted,
            }}
          >
            Campaigns
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('wallet')}
          style={{
            flex: 1,
            paddingVertical: SPACING.md,
            alignItems: 'center',
            borderBottomWidth: 2,
            borderBottomColor: activeTab === 'wallet' ? COLORS.gold : 'transparent',
          }}
        >
          <Text
            style={{
              fontSize: TYPOGRAPHY.md,
              fontWeight: TYPOGRAPHY.medium,
              color: activeTab === 'wallet' ? COLORS.gold : LIGHT_COLORS.textMuted,
            }}
          >
            Wallet
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'campaigns' && (
          <View style={{ padding: SPACING.xl }}>
            <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: LIGHT_COLORS.surface,
                  borderRadius: RADIUS.lg,
                  padding: SPACING.md,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: TYPOGRAPHY['2xl'], fontWeight: TYPOGRAPHY.bold, color: COLORS.gold }}>
                  {activeCampaigns.length}
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.xs, color: LIGHT_COLORS.textMuted }}>Active</Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: LIGHT_COLORS.surface,
                  borderRadius: RADIUS.lg,
                  padding: SPACING.md,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold, color: LIGHT_COLORS.textPrimary }}>
                  {formatCurrency(totalSpent)}
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.xs, color: LIGHT_COLORS.textMuted }}>Total Spent</Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: LIGHT_COLORS.surface,
                  borderRadius: RADIUS.lg,
                  padding: SPACING.md,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold, color: LIGHT_COLORS.textPrimary }}>
                  {(totalImpressionsAllCampaigns / 1000).toFixed(1)}k
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.xs, color: LIGHT_COLORS.textMuted }}>Impressions</Text>
              </View>
            </View>

            <Text
              style={{
                fontSize: TYPOGRAPHY.md,
                fontWeight: TYPOGRAPHY.semibold,
                color: LIGHT_COLORS.textPrimary,
                marginBottom: SPACING.md,
              }}
            >
              Your Campaigns
            </Text>

            {MOCK_CAMPAIGNS.map(renderCampaignCard)}
          </View>
        )}

        {activeTab === 'wallet' && (
          <View style={{ padding: SPACING.xl }}>
            <View
              style={{
                backgroundColor: COLORS.gold,
                borderRadius: RADIUS.xl,
                padding: SPACING.xl,
                marginBottom: SPACING.xl,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
                <Wallet size={24} color={COLORS.charcoal} />
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.sm,
                    color: COLORS.charcoal,
                    marginLeft: SPACING.sm,
                    opacity: 0.8,
                  }}
                >
                  Available Balance
                </Text>
              </View>
              <Text
                style={{
                  fontSize: TYPOGRAPHY['4xl'],
                  fontWeight: TYPOGRAPHY.bold,
                  color: COLORS.charcoal,
                  marginBottom: SPACING.lg,
                }}
              >
                {formatCurrency(MOCK_WALLET.balanceCents)}
              </Text>
              <TouchableOpacity
                onPress={() => setShowTopUpModal(true)}
                style={{
                  backgroundColor: COLORS.charcoal,
                  paddingVertical: SPACING.md,
                  borderRadius: RADIUS.lg,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.semibold, color: COLORS.gold }}>
                  Add Funds
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: LIGHT_COLORS.surface,
                  borderRadius: RADIUS.lg,
                  padding: SPACING.lg,
                }}
              >
                <Text style={{ fontSize: TYPOGRAPHY.sm, color: LIGHT_COLORS.textMuted, marginBottom: 4 }}>
                  Total Deposited
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold, color: COLORS.success }}>
                  {formatCurrency(MOCK_WALLET.totalDepositedCents)}
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: LIGHT_COLORS.surface,
                  borderRadius: RADIUS.lg,
                  padding: SPACING.lg,
                }}
              >
                <Text style={{ fontSize: TYPOGRAPHY.sm, color: LIGHT_COLORS.textMuted, marginBottom: 4 }}>
                  Total Spent
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold, color: LIGHT_COLORS.textPrimary }}>
                  {formatCurrency(MOCK_WALLET.totalSpentCents)}
                </Text>
              </View>
            </View>

            {MOCK_WALLET.autoReplenish && (
              <View
                style={{
                  backgroundColor: LIGHT_COLORS.surface,
                  borderRadius: RADIUS.lg,
                  padding: SPACING.lg,
                  marginBottom: SPACING.xl,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <CreditCard size={20} color={COLORS.gold} />
                <View style={{ marginLeft: SPACING.md, flex: 1 }}>
                  <Text style={{ fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.medium, color: LIGHT_COLORS.textPrimary }}>
                    Auto-Replenish Active
                  </Text>
                  <Text style={{ fontSize: TYPOGRAPHY.xs, color: LIGHT_COLORS.textMuted }}>
                    Adds {formatCurrency(MOCK_WALLET.autoReplenishAmountCents || 0)} when balance drops below{' '}
                    {formatCurrency(MOCK_WALLET.autoReplenishThresholdCents || 0)}
                  </Text>
                </View>
              </View>
            )}

            <Text
              style={{
                fontSize: TYPOGRAPHY.md,
                fontWeight: TYPOGRAPHY.semibold,
                color: LIGHT_COLORS.textPrimary,
                marginBottom: SPACING.md,
              }}
            >
              Recent Transactions
            </Text>

            {MOCK_WALLET_TRANSACTIONS.map((txn) => (
              <View
                key={txn.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: LIGHT_COLORS.surface,
                  borderRadius: RADIUS.md,
                  padding: SPACING.md,
                  marginBottom: SPACING.sm,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: txn.amountCents >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: SPACING.md,
                  }}
                >
                  {txn.amountCents >= 0 ? (
                    <ArrowDownRight size={18} color={COLORS.success} />
                  ) : (
                    <ArrowUpRight size={18} color={COLORS.error} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.medium, color: LIGHT_COLORS.textPrimary }}>
                    {txn.description}
                  </Text>
                  <Text style={{ fontSize: TYPOGRAPHY.xs, color: LIGHT_COLORS.textMuted }}>
                    {new Date(txn.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.md,
                    fontWeight: TYPOGRAPHY.semibold,
                    color: txn.amountCents >= 0 ? COLORS.success : LIGHT_COLORS.textPrimary,
                  }}
                >
                  {txn.amountCents >= 0 ? '+' : ''}
                  {formatCurrency(txn.amountCents)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showCampaignDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCampaignDetail(false)}
      >
        {selectedCampaign && (
          <View style={{ flex: 1, backgroundColor: LIGHT_COLORS.background }}>
            <SafeAreaView style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: SPACING.xl,
                  paddingVertical: SPACING.lg,
                  borderBottomWidth: 1,
                  borderBottomColor: LIGHT_COLORS.border,
                }}
              >
                <TouchableOpacity onPress={() => setShowCampaignDetail(false)}>
                  <X size={24} color={LIGHT_COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={{ fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.semibold, color: LIGHT_COLORS.textPrimary }}>
                  Campaign Details
                </Text>
                <View style={{ width: 24 }} />
              </View>

              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: SPACING.xl }}>
                <View style={{ alignItems: 'center', marginBottom: SPACING.xl }}>
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: RADIUS.xl,
                      backgroundColor: COLORS.goldMuted,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: SPACING.md,
                    }}
                  >
                    <CampaignTypeIcon type={selectedCampaign.campaignType} size={36} color={COLORS.gold} />
                  </View>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY['xl'],
                      fontWeight: TYPOGRAPHY.bold,
                      color: LIGHT_COLORS.textPrimary,
                      textAlign: 'center',
                    }}
                  >
                    {selectedCampaign.title || AD_CAMPAIGN_TYPE_INFO[selectedCampaign.campaignType].label}
                  </Text>
                  <View
                    style={{
                      backgroundColor: AD_STATUS_CONFIG[selectedCampaign.status].bgColor,
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: RADIUS.sm,
                      marginTop: SPACING.sm,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.sm,
                        fontWeight: TYPOGRAPHY.medium,
                        color: AD_STATUS_CONFIG[selectedCampaign.status].color,
                      }}
                    >
                      {AD_STATUS_CONFIG[selectedCampaign.status].label}
                    </Text>
                  </View>
                </View>

                {MOCK_CAMPAIGN_STATS[selectedCampaign.id] && (
                  <View style={{ marginBottom: SPACING.xl }}>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.md,
                        fontWeight: TYPOGRAPHY.semibold,
                        color: LIGHT_COLORS.textPrimary,
                        marginBottom: SPACING.md,
                      }}
                    >
                      Performance
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
                      {[
                        { label: 'Impressions', value: MOCK_CAMPAIGN_STATS[selectedCampaign.id].impressions.toLocaleString(), icon: Eye },
                        { label: 'Clicks', value: MOCK_CAMPAIGN_STATS[selectedCampaign.id].clicks.toString(), icon: MousePointer },
                        { label: 'Bookings', value: MOCK_CAMPAIGN_STATS[selectedCampaign.id].bookings.toString(), icon: Calendar },
                        { label: 'CTR', value: `${MOCK_CAMPAIGN_STATS[selectedCampaign.id].ctr.toFixed(1)}%`, icon: TrendingUp },
                      ].map((stat) => (
                        <View
                          key={stat.label}
                          style={{
                            width: '48%',
                            backgroundColor: LIGHT_COLORS.surface,
                            borderRadius: RADIUS.md,
                            padding: SPACING.md,
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <stat.icon size={14} color={LIGHT_COLORS.textMuted} />
                            <Text style={{ fontSize: TYPOGRAPHY.xs, color: LIGHT_COLORS.textMuted, marginLeft: 4 }}>
                              {stat.label}
                            </Text>
                          </View>
                          <Text style={{ fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.bold, color: LIGHT_COLORS.textPrimary }}>
                            {stat.value}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={{ marginBottom: SPACING.xl }}>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.md,
                      fontWeight: TYPOGRAPHY.semibold,
                      color: LIGHT_COLORS.textPrimary,
                      marginBottom: SPACING.md,
                    }}
                  >
                    Budget
                  </Text>
                  <View style={{ backgroundColor: LIGHT_COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                      <Text style={{ fontSize: TYPOGRAPHY.sm, color: LIGHT_COLORS.textMuted }}>Spent</Text>
                      <Text style={{ fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.semibold, color: LIGHT_COLORS.textPrimary }}>
                        {formatCurrency(selectedCampaign.spentCents)}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                      <Text style={{ fontSize: TYPOGRAPHY.sm, color: LIGHT_COLORS.textMuted }}>Total Budget</Text>
                      <Text style={{ fontSize: TYPOGRAPHY.md, color: LIGHT_COLORS.textSecondary }}>
                        {formatCurrency(selectedCampaign.totalBudgetCents || 0)}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: TYPOGRAPHY.sm, color: LIGHT_COLORS.textMuted }}>Daily Budget</Text>
                      <Text style={{ fontSize: TYPOGRAPHY.md, color: LIGHT_COLORS.textSecondary }}>
                        {formatCurrency(selectedCampaign.dailyBudgetCents || 0)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={{ marginBottom: SPACING.xl }}>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.md,
                      fontWeight: TYPOGRAPHY.semibold,
                      color: LIGHT_COLORS.textPrimary,
                      marginBottom: SPACING.md,
                    }}
                  >
                    Schedule
                  </Text>
                  <View style={{ backgroundColor: LIGHT_COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                      <Text style={{ fontSize: TYPOGRAPHY.sm, color: LIGHT_COLORS.textMuted }}>Start Date</Text>
                      <Text style={{ fontSize: TYPOGRAPHY.md, color: LIGHT_COLORS.textSecondary }}>
                        {selectedCampaign.startDate ? new Date(selectedCampaign.startDate).toLocaleDateString() : '-'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: TYPOGRAPHY.sm, color: LIGHT_COLORS.textMuted }}>End Date</Text>
                      <Text style={{ fontSize: TYPOGRAPHY.md, color: LIGHT_COLORS.textSecondary }}>
                        {selectedCampaign.endDate ? new Date(selectedCampaign.endDate).toLocaleDateString() : '-'}
                      </Text>
                    </View>
                  </View>
                </View>

                {selectedCampaign.targetNeighborhoods.length > 0 && (
                  <View style={{ marginBottom: SPACING.xl }}>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.md,
                        fontWeight: TYPOGRAPHY.semibold,
                        color: LIGHT_COLORS.textPrimary,
                        marginBottom: SPACING.md,
                      }}
                    >
                      Target Areas
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
                      {selectedCampaign.targetNeighborhoods.map((area) => (
                        <View
                          key={area}
                          style={{
                            backgroundColor: LIGHT_COLORS.surfaceHighlight,
                            paddingHorizontal: SPACING.md,
                            paddingVertical: SPACING.sm,
                            borderRadius: RADIUS.sm,
                          }}
                        >
                          <Text style={{ fontSize: TYPOGRAPHY.sm, color: LIGHT_COLORS.textSecondary }}>{area}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </ScrollView>
            </SafeAreaView>
          </View>
        )}
      </Modal>

      <Modal visible={showCreateModal} animationType="fade" transparent onRequestClose={() => setShowCreateModal(false)}>
        <View
          style={{ flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'center', padding: SPACING.xl }}
        >
          <View style={{ backgroundColor: LIGHT_COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
              <Text style={{ fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.semibold, color: LIGHT_COLORS.textPrimary }}>
                Create Campaign
              </Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={24} color={LIGHT_COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: TYPOGRAPHY.sm, color: LIGHT_COLORS.textMuted, marginBottom: SPACING.md }}>
              Select a campaign type:
            </Text>

            {(Object.keys(AD_CAMPAIGN_TYPE_INFO) as AdCampaignType[]).map((type) => {
              const info = AD_CAMPAIGN_TYPE_INFO[type];
              return (
                <TouchableOpacity
                  key={type}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: LIGHT_COLORS.surfaceHighlight,
                    borderRadius: RADIUS.md,
                    padding: SPACING.md,
                    marginBottom: SPACING.sm,
                  }}
                  onPress={() => {
                    setShowCreateModal(false);
                    Alert.alert('Coming Soon', `${info.label} campaign creation will be available soon.`);
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: RADIUS.md,
                      backgroundColor: COLORS.goldMuted,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: SPACING.md,
                    }}
                  >
                    <CampaignTypeIcon type={type} size={22} color={COLORS.gold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.medium, color: LIGHT_COLORS.textPrimary }}>
                      {info.label}
                    </Text>
                    <Text style={{ fontSize: TYPOGRAPHY.xs, color: LIGHT_COLORS.textMuted }} numberOfLines={1}>
                      {info.description}
                    </Text>
                  </View>
                  <Text style={{ fontSize: TYPOGRAPHY.sm, color: COLORS.gold }}>
                    from {formatCurrency(info.basePrice)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      <Modal visible={showTopUpModal} animationType="fade" transparent onRequestClose={() => setShowTopUpModal(false)}>
        <View style={{ flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'center', padding: SPACING.xl }}>
          <View style={{ backgroundColor: LIGHT_COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
              <Text style={{ fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.semibold, color: LIGHT_COLORS.textPrimary }}>
                Add Funds
              </Text>
              <TouchableOpacity onPress={() => setShowTopUpModal(false)}>
                <X size={24} color={LIGHT_COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: TYPOGRAPHY.sm, color: LIGHT_COLORS.textMuted, marginBottom: SPACING.md }}>
              Enter amount to add:
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg }}>
              <Text style={{ fontSize: TYPOGRAPHY['2xl'], fontWeight: TYPOGRAPHY.bold, color: LIGHT_COLORS.textPrimary, marginRight: SPACING.sm }}>
                ₪
              </Text>
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: LIGHT_COLORS.surfaceHighlight,
                  borderRadius: RADIUS.md,
                  padding: SPACING.md,
                  fontSize: TYPOGRAPHY.xl,
                  fontWeight: TYPOGRAPHY.bold,
                  color: LIGHT_COLORS.textPrimary,
                }}
                placeholder="0"
                placeholderTextColor={LIGHT_COLORS.textMuted}
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                keyboardType="numeric"
              />
            </View>

            <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg }}>
              {[50, 100, 200, 500].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  onPress={() => setTopUpAmount(amount.toString())}
                  style={{
                    flex: 1,
                    paddingVertical: SPACING.sm,
                    backgroundColor: topUpAmount === amount.toString() ? COLORS.gold : LIGHT_COLORS.surfaceHighlight,
                    borderRadius: RADIUS.sm,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.sm,
                      fontWeight: TYPOGRAPHY.medium,
                      color: topUpAmount === amount.toString() ? COLORS.charcoal : LIGHT_COLORS.textSecondary,
                    }}
                  >
                    ₪{amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: SPACING.md }}>
              <TouchableOpacity
                onPress={() => setShowTopUpModal(false)}
                style={{
                  flex: 1,
                  paddingVertical: SPACING.md,
                  borderRadius: RADIUS.lg,
                  backgroundColor: LIGHT_COLORS.surfaceHighlight,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.semibold, color: LIGHT_COLORS.textSecondary }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTopUp}
                style={{
                  flex: 1,
                  paddingVertical: SPACING.md,
                  borderRadius: RADIUS.lg,
                  backgroundColor: COLORS.gold,
                  alignItems: 'center',
                  opacity: topUpAmount ? 1 : 0.5,
                }}
                disabled={!topUpAmount}
              >
                <Text style={{ fontSize: TYPOGRAPHY.md, fontWeight: TYPOGRAPHY.semibold, color: COLORS.charcoal }}>
                  Add Funds
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
