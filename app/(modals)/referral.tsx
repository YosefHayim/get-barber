import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  Alert,
  Platform,
  Linking,
  ImageBackground,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import {
  ArrowLeft,
  Gift,
  Copy,
  Check,
  MessageCircle,
  Share2,
  Users,
  DollarSign,
  Clock,
  ChevronRight,
} from 'lucide-react-native';
import { COLORS, SHADOWS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';

// Light theme colors matching the design
const LIGHT_COLORS = {
  background: '#f6f8f8',
  surface: '#ffffff',
  surfaceHighlight: '#f8fafa',
  primary: '#11a4d4',
  primaryDark: '#0d8ab3',
  primaryMuted: 'rgba(17, 164, 212, 0.1)',
  textPrimary: '#111618',
  textSecondary: '#637588',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  borderDashed: '#cbd5e1',
  // Share button colors
  whatsapp: '#25D366',
  whatsappBg: 'rgba(37, 211, 102, 0.1)',
  message: '#34C759',
  messageBg: 'rgba(52, 199, 89, 0.1)',
  twitter: '#000000',
  twitterBg: 'rgba(0, 0, 0, 0.05)',
  shareBg: '#f1f5f9',
  // Reward colors
  gold: '#f59e0b',
  goldBg: 'rgba(245, 158, 11, 0.1)',
};

// User's referral code (in a real app, this would come from the backend)
const USER_REFERRAL_CODE = 'ALEX-CUTS-24';
const REWARD_AMOUNT = 10;

interface ShareOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  bgColor: string;
  onPress: () => void;
}

interface HowItWorksStep {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ReferredFriend {
  id: string;
  name: string;
  status: 'pending' | 'completed';
  date: string;
  reward?: number;
}

export default function ReferralScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState(false);
  
  // Mock data for rewards
  const friendsReferred = 0;
  const creditsEarned = 0;
  const referredFriends: ReferredFriend[] = [];

  const handleCopyCode = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(USER_REFERRAL_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy code');
    }
  }, []);

  const getReferralMessage = useCallback(() => {
    return `Hey! I've been using GetBarber for amazing haircuts on-demand. Use my code ${USER_REFERRAL_CODE} to get $${REWARD_AMOUNT} off your first booking! Download the app: https://getbarber.app/invite/${USER_REFERRAL_CODE}`;
  }, []);

  const handleShareWhatsApp = useCallback(async () => {
    const message = encodeURIComponent(getReferralMessage());
    const url = `whatsapp://send?text=${message}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('WhatsApp not installed', 'Please install WhatsApp to share via this method.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open WhatsApp');
    }
  }, [getReferralMessage]);

  const handleShareSMS = useCallback(async () => {
    const message = encodeURIComponent(getReferralMessage());
    const url = Platform.OS === 'ios' 
      ? `sms:&body=${message}` 
      : `sms:?body=${message}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Failed to open Messages');
    }
  }, [getReferralMessage]);

  const handleShareTwitter = useCallback(async () => {
    const message = encodeURIComponent(getReferralMessage());
    const url = `twitter://post?message=${message}`;
    const webUrl = `https://twitter.com/intent/tweet?text=${message}`;
    try {
      const supported = await Linking.canOpenURL(url);
      await Linking.openURL(supported ? url : webUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to open Twitter/X');
    }
  }, [getReferralMessage]);

  const handleShareMore = useCallback(async () => {
    try {
      await Share.share({
        message: getReferralMessage(),
        title: 'Invite Friends to GetBarber',
      });
    } catch (error) {
      if ((error as Error).message !== 'User did not share') {
        Alert.alert('Error', 'Failed to share');
      }
    }
  }, [getReferralMessage]);

  const shareOptions: ShareOption[] = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: (
        <View style={styles.whatsappIcon}>
          <MessageCircle size={24} color={LIGHT_COLORS.whatsapp} fill={LIGHT_COLORS.whatsapp} />
        </View>
      ),
      bgColor: LIGHT_COLORS.whatsappBg,
      onPress: handleShareWhatsApp,
    },
    {
      id: 'message',
      name: 'Message',
      icon: <MessageCircle size={24} color={LIGHT_COLORS.message} />,
      bgColor: LIGHT_COLORS.messageBg,
      onPress: handleShareSMS,
    },
    {
      id: 'twitter',
      name: 'X',
      icon: (
        <View style={styles.xIcon}>
          <Text style={styles.xIconText}>X</Text>
        </View>
      ),
      bgColor: LIGHT_COLORS.twitterBg,
      onPress: handleShareTwitter,
    },
    {
      id: 'more',
      name: 'More',
      icon: <Share2 size={24} color={LIGHT_COLORS.textSecondary} />,
      bgColor: LIGHT_COLORS.shareBg,
      onPress: handleShareMore,
    },
  ];

  const howItWorksSteps: HowItWorksStep[] = [
    {
      id: '1',
      number: '1',
      title: 'Share your code',
      description: 'Send your unique code to friends via WhatsApp, SMS, or social media.',
      icon: <Share2 size={20} color={LIGHT_COLORS.primary} />,
    },
    {
      id: '2',
      number: '2',
      title: 'Friend books a barber',
      description: 'When they use your code on their first booking, they get $10 off.',
      icon: <Users size={20} color={LIGHT_COLORS.primary} />,
    },
    {
      id: '3',
      number: '3',
      title: 'You both earn',
      description: 'After their appointment is complete, you get $10 credit automatically!',
      icon: <DollarSign size={20} color={LIGHT_COLORS.primary} />,
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Referral Program',
          headerStyle: { backgroundColor: LIGHT_COLORS.surface },
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
            color: LIGHT_COLORS.textPrimary,
          },
          headerShadowVisible: true,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={styles.headerButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={24} color={LIGHT_COLORS.textPrimary} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80' }}
            style={styles.heroImage}
            imageStyle={styles.heroImageStyle}
          >
            <LinearGradient
              colors={['transparent', 'rgba(16, 22, 34, 0.7)', 'rgba(16, 22, 34, 0.95)']}
              style={styles.heroGradient}
            >
              <View style={styles.heroContent}>
                <View style={styles.heroIconWrapper}>
                  <Gift size={32} color={LIGHT_COLORS.primary} />
                </View>
                <Text style={styles.heroTitle}>Give ${REWARD_AMOUNT}, Get ${REWARD_AMOUNT}</Text>
                <Text style={styles.heroSubtitle}>
                  Share your love for fresh cuts. When a friend books their first barber, you both get ${REWARD_AMOUNT} off.
                </Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Referral Code Card */}
        <Surface style={styles.codeCard} elevation={0}>
          <Text style={styles.codeLabel}>YOUR PERSONAL INVITE CODE</Text>
          <View style={styles.codeContainer}>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{USER_REFERRAL_CODE}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.copyButton,
                copied && styles.copyButtonSuccess,
                pressed && styles.copyButtonPressed,
              ]}
              onPress={handleCopyCode}
            >
              {copied ? (
                <>
                  <Check size={16} color="#FFFFFF" />
                  <Text style={styles.copyButtonText}>Copied!</Text>
                </>
              ) : (
                <>
                  <Copy size={16} color="#FFFFFF" />
                  <Text style={styles.copyButtonText}>Copy</Text>
                </>
              )}
            </Pressable>
          </View>
        </Surface>

        {/* Share Options */}
        <View style={styles.shareSection}>
          <Text style={styles.sectionTitle}>Share via</Text>
          <View style={styles.shareGrid}>
            {shareOptions.map((option) => (
              <Pressable
                key={option.id}
                style={({ pressed }) => [
                  styles.shareButton,
                  pressed && styles.shareButtonPressed,
                ]}
                onPress={option.onPress}
              >
                <View style={[styles.shareIconWrapper, { backgroundColor: option.bgColor }]}>
                  {option.icon}
                </View>
                <Text style={styles.shareButtonLabel}>{option.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Rewards Tracker */}
        <View style={styles.rewardsSection}>
          <View style={styles.rewardsHeader}>
            <Text style={styles.sectionTitle}>Your Rewards</Text>
            <Pressable style={styles.historyButton}>
              <Text style={styles.historyButtonText}>View History</Text>
            </Pressable>
          </View>

          <Surface style={styles.rewardsCard} elevation={0}>
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{friendsReferred}</Text>
                <Text style={styles.statLabel}>Friends Referred</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>${creditsEarned}</Text>
                <Text style={styles.statLabel}>Credits Earned</Text>
              </View>
            </View>

            <View style={styles.statsBottomDivider} />

            {/* Empty State or Friends List */}
            {referredFriends.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrapper}>
                  <Clock size={20} color={LIGHT_COLORS.textMuted} />
                </View>
                <View style={styles.emptyTextWrapper}>
                  <Text style={styles.emptyTitle}>No rewards yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Invite friends to start earning ${REWARD_AMOUNT} for each referral.
                  </Text>
                </View>
              </View>
            ) : (
              referredFriends.map((friend) => (
                <View key={friend.id} style={styles.friendItem}>
                  <View style={styles.friendAvatar}>
                    <Text style={styles.friendInitial}>{friend.name[0]}</Text>
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    <Text style={styles.friendDate}>{friend.date}</Text>
                  </View>
                  {friend.status === 'completed' && friend.reward && (
                    <Text style={styles.friendReward}>+${friend.reward}</Text>
                  )}
                </View>
              ))
            )}
          </Surface>
        </View>

        {/* How It Works Section */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <Surface style={styles.stepsCard} elevation={0}>
            {howItWorksSteps.map((step, index) => (
              <View key={step.id}>
                <View style={styles.stepItem}>
                  <View style={styles.stepNumberWrapper}>
                    <Text style={styles.stepNumber}>{step.number}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDescription}>{step.description}</Text>
                  </View>
                </View>
                {index < howItWorksSteps.length - 1 && (
                  <View style={styles.stepConnector} />
                )}
              </View>
            ))}
          </Surface>
        </View>

        {/* Terms Link */}
        <Pressable style={styles.termsLink}>
          <Text style={styles.termsText}>
            By sharing, you agree to our{' '}
            <Text style={styles.termsLinkText}>Referral Program Terms</Text>
          </Text>
        </Pressable>
      </ScrollView>

      {/* Floating CTA Button */}
      <View style={[styles.floatingCTA, { paddingBottom: insets.bottom + 16 }]}>
        <LinearGradient
          colors={['transparent', LIGHT_COLORS.background]}
          style={styles.floatingGradient}
          pointerEvents="none"
        />
        <Pressable
          style={({ pressed }) => [
            styles.shareMainButton,
            pressed && styles.shareMainButtonPressed,
          ]}
          onPress={handleShareMore}
        >
          <Share2 size={22} color="#FFFFFF" />
          <Text style={styles.shareMainButtonText}>Share Link</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_COLORS.background,
  },
  scrollContent: {
    gap: 16,
  },
  headerButton: {
    padding: 8,
    marginLeft: -8,
    borderRadius: 20,
  },

  // Hero Section
  heroContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroImage: {
    height: 260,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroImageStyle: {
    borderRadius: 20,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroContent: {
    padding: 24,
    alignItems: 'center',
  },
  heroIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(17, 164, 212, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(17, 164, 212, 0.3)',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },

  // Code Card
  codeCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: LIGHT_COLORS.surface,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: LIGHT_COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  codeBox: {
    flex: 1,
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: LIGHT_COLORS.borderDashed,
  },
  codeText: {
    fontSize: 18,
    fontWeight: '700',
    color: LIGHT_COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
    ...SHADOWS.md,
    shadowColor: LIGHT_COLORS.primary,
    shadowOpacity: 0.3,
  },
  copyButtonSuccess: {
    backgroundColor: '#22c55e',
  },
  copyButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Share Section
  shareSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: LIGHT_COLORS.textPrimary,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  shareGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareButton: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  shareButtonPressed: {
    opacity: 0.7,
  },
  shareIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: LIGHT_COLORS.textSecondary,
  },
  whatsappIcon: {
    // WhatsApp styling handled by icon fill
  },
  xIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xIconText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: LIGHT_COLORS.border,
    marginHorizontal: 16,
  },

  // Rewards Section
  rewardsSection: {
    paddingHorizontal: 16,
  },
  rewardsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  historyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: LIGHT_COLORS.primary,
  },
  rewardsCard: {
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    ...SHADOWS.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: LIGHT_COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: LIGHT_COLORS.textMuted,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: LIGHT_COLORS.border,
  },
  statsBottomDivider: {
    height: 1,
    backgroundColor: LIGHT_COLORS.border,
    marginVertical: 16,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  emptyIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTextWrapper: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: LIGHT_COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: 12,
    color: LIGHT_COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_COLORS.border,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LIGHT_COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: LIGHT_COLORS.primary,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
    color: LIGHT_COLORS.textPrimary,
  },
  friendDate: {
    fontSize: 12,
    color: LIGHT_COLORS.textMuted,
    marginTop: 2,
  },
  friendReward: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22c55e',
  },

  // How It Works
  howItWorksSection: {
    paddingHorizontal: 16,
  },
  stepsCard: {
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    ...SHADOWS.sm,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 16,
  },
  stepNumberWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: LIGHT_COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: LIGHT_COLORS.primary,
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: LIGHT_COLORS.textPrimary,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: LIGHT_COLORS.textSecondary,
    lineHeight: 18,
  },
  stepConnector: {
    width: 2,
    height: 20,
    backgroundColor: LIGHT_COLORS.primaryMuted,
    marginLeft: 15,
    marginVertical: 8,
  },

  // Terms
  termsLink: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: LIGHT_COLORS.textMuted,
    textAlign: 'center',
  },
  termsLinkText: {
    color: LIGHT_COLORS.primary,
    fontWeight: '500',
  },

  // Floating CTA
  floatingCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  floatingGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shareMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIGHT_COLORS.primary,
    paddingVertical: 18,
    borderRadius: 14,
    gap: 10,
    ...SHADOWS.lg,
    shadowColor: LIGHT_COLORS.primary,
    shadowOpacity: 0.4,
  },
  shareMainButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  shareMainButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
