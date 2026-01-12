import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  HelpCircle,
  Scissors,
  Search,
  Info,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '@/constants/theme';
import { webSafeFadeInDown, webSafeFadeInUp } from '@/utils/animations';

// ============================================================================
// LIGHT THEME COLORS - Matching design system
// ============================================================================
const LIGHT_COLORS = {
  background: '#f6f8f8',
  surface: '#ffffff',
  surfaceHighlight: '#f1f5f9',
  textPrimary: '#111618',
  textSecondary: '#617f89',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  // Primary teal accent
  primary: '#11a4d4',
  primaryLight: '#e0f7fa',
  primaryMuted: 'rgba(17, 164, 212, 0.12)',
  primaryFaint: 'rgba(17, 164, 212, 0.06)',
};

// ============================================================================
// PULSING RADAR RING COMPONENT
// ============================================================================
const PulsingRing = ({
  delay,
  size,
}: {
  delay: number;
  size: number;
}) => {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1.4, {
          duration: 2400,
          easing: Easing.out(Easing.quad),
        }),
        -1,
        false
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0, {
          duration: 2400,
          easing: Easing.out(Easing.quad),
        }),
        -1,
        false
      )
    );

    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.pulsingRing,
        animatedStyle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    />
  );
};

// ============================================================================
// ANIMATED SCISSORS ICON
// ============================================================================
const AnimatedScissorsIcon = () => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        withTiming(-8, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    return () => cancelAnimation(rotation);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.scissorsIconWrapper, animatedStyle]}>
      <View style={styles.scissorsCircle}>
        <Scissors size={36} color={LIGHT_COLORS.surface} strokeWidth={2} />
      </View>
      {/* Search Badge */}
      <View style={styles.searchBadge}>
        <Search size={14} color={LIGHT_COLORS.surface} strokeWidth={2.5} />
      </View>
    </Animated.View>
  );
};

// ============================================================================
// RADAR ANIMATION CONTAINER
// ============================================================================
const RadarAnimation = () => {
  return (
    <View style={styles.radarContainer}>
      {/* Background circle */}
      <View style={styles.radarBackground} />

      {/* Pulsing rings - 3 rings with staggered delays */}
      <PulsingRing delay={0} size={200} />
      <PulsingRing delay={800} size={200} />
      <PulsingRing delay={1600} size={200} />

      {/* Center icon */}
      <AnimatedScissorsIcon />
    </View>
  );
};

// ============================================================================
// ANIMATED PROGRESS BAR
// ============================================================================
const AnimatedProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          // Hold at 85% until we find barbers
          return prev;
        }
        return prev + Math.random() * 8;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    animatedWidth.value = withTiming(progress, {
      duration: 400,
      easing: Easing.out(Easing.quad),
    });
  }, [progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Contacting Barbers</Text>
        <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>
    </View>
  );
};

// ============================================================================
// BARBER AVATAR
// ============================================================================
const BarberAvatar = ({
  color,
  isHighlighted,
  delay,
}: {
  color: string;
  isHighlighted: boolean;
  delay: number;
}) => {
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isHighlighted) {
      pulseScale.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        )
      );

      glowOpacity.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 600 }),
            withTiming(0.4, { duration: 600 })
          ),
          -1,
          true
        )
      );
    }

    return () => {
      cancelAnimation(pulseScale);
      cancelAnimation(glowOpacity);
    };
  }, [isHighlighted, delay]);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.avatarWrapper}>
      {isHighlighted && (
        <Animated.View style={[styles.avatarGlow, glowStyle]} />
      )}
      <Animated.View
        style={[
          styles.barberAvatar,
          avatarStyle,
          {
            backgroundColor: isHighlighted ? color : LIGHT_COLORS.surfaceHighlight,
            borderColor: isHighlighted ? color : LIGHT_COLORS.border,
            opacity: isHighlighted ? 1 : 0.5,
          },
        ]}
      >
        {/* Simple avatar placeholder - initials or icon */}
        <Text
          style={[
            styles.avatarText,
            { color: isHighlighted ? LIGHT_COLORS.surface : LIGHT_COLORS.textMuted },
          ]}
        >
          {isHighlighted ? 'B' : '?'}
        </Text>
      </Animated.View>
      {isHighlighted && <View style={styles.avatarRing} />}
    </View>
  );
};

// ============================================================================
// BARBER AVATAR CAROUSEL
// ============================================================================
const BarberCarousel = () => {
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightedIndex((prev) => (prev + 1) % 3);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const barberColors = ['#11a4d4', '#22c55e', '#f59e0b'];

  return (
    <View style={styles.carouselContainer}>
      <View style={styles.avatarRow}>
        {[0, 1, 2].map((index) => (
          <BarberAvatar
            key={index}
            color={barberColors[index]}
            isHighlighted={highlightedIndex === index}
            delay={index * 200}
          />
        ))}
      </View>
      <AnimatedPingingText />
    </View>
  );
};

// ============================================================================
// ANIMATED PINGING TEXT
// ============================================================================
const AnimatedPingingText = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <Text style={styles.pingingText}>Pinging nearby pros{dots}</Text>
  );
};

// ============================================================================
// DID YOU KNOW TIP CARD
// ============================================================================
const DidYouKnowCard = () => {
  const tips = [
    'Our barbers complete an average of 50+ haircuts per month!',
    'You can save your favorite barbers for faster booking next time.',
    'Home service barbers bring all their own professional equipment.',
  ];

  const [currentTip] = useState(tips[Math.floor(Math.random() * tips.length)]);

  return (
    <Animated.View entering={webSafeFadeInUp(600, 400)} style={styles.tipCard}>
      <View style={styles.tipHeader}>
        <View style={styles.tipIconContainer}>
          <Info size={16} color={LIGHT_COLORS.primary} />
        </View>
        <Text style={styles.tipTitle}>Did you know?</Text>
      </View>
      <Text style={styles.tipText}>{currentTip}</Text>
    </Animated.View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function SearchingBarberScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleCancel = () => {
    router.back();
  };

  const handleHelp = () => {
    // TODO: Open help modal
    console.log('Help pressed');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={webSafeFadeInDown(0, 400)} style={styles.header}>
        <Pressable onPress={handleCancel} style={styles.headerButton}>
          <ChevronLeft size={24} color={LIGHT_COLORS.textPrimary} />
        </Pressable>

        <View style={styles.searchingBadge}>
          <View style={styles.searchingDot} />
          <Text style={styles.searchingText}>Searching...</Text>
        </View>

        <Pressable onPress={handleHelp} style={styles.headerButton}>
          <HelpCircle size={22} color={LIGHT_COLORS.textSecondary} />
        </Pressable>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Radar Animation */}
        <Animated.View entering={webSafeFadeInDown(100, 500)}>
          <RadarAnimation />
        </Animated.View>

        {/* Title Section */}
        <Animated.View entering={webSafeFadeInUp(200, 400)} style={styles.titleSection}>
          <Text style={styles.title}>Finding your barber...</Text>
          <Text style={styles.subtitle}>
            Scanning within 5km of your location
          </Text>
        </Animated.View>

        {/* Progress Bar */}
        <Animated.View entering={webSafeFadeInUp(300, 400)} style={styles.progressWrapper}>
          <AnimatedProgressBar />
        </Animated.View>

        {/* Barber Carousel */}
        <Animated.View entering={webSafeFadeInUp(400, 400)}>
          <BarberCarousel />
        </Animated.View>

        {/* Did You Know Card */}
        <DidYouKnowCard />
      </View>

      {/* Cancel Button */}
      <Animated.View
        entering={webSafeFadeInUp(500, 400)}
        style={[styles.footer, { paddingBottom: insets.bottom + SPACING.lg }]}
      >
        <Pressable onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel Request</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: LIGHT_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    ...SHADOWS.sm,
  },
  searchingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_COLORS.primaryMuted,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
  },
  searchingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: LIGHT_COLORS.primary,
  },
  searchingText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.primary,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Radar
  radarContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  radarBackground: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: LIGHT_COLORS.primaryFaint,
  },
  pulsingRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: LIGHT_COLORS.primary,
  },
  scissorsIconWrapper: {
    position: 'relative',
  },
  scissorsCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: LIGHT_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
    shadowColor: LIGHT_COLORS.primary,
    shadowOpacity: 0.4,
  },
  searchBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: LIGHT_COLORS.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: LIGHT_COLORS.background,
  },

  // Title Section
  titleSection: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  title: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
    textAlign: 'center',
  },

  // Progress
  progressWrapper: {
    width: '100%',
    marginBottom: SPACING['2xl'],
  },
  progressContainer: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: LIGHT_COLORS.textPrimary,
  },
  progressPercent: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.primary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: LIGHT_COLORS.surfaceHighlight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: LIGHT_COLORS.primary,
    borderRadius: 4,
  },

  // Carousel
  carouselContainer: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  avatarRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  avatarWrapper: {
    position: 'relative',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: LIGHT_COLORS.primaryMuted,
  },
  barberAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
  },
  avatarRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: LIGHT_COLORS.primary,
    borderStyle: 'dashed',
  },
  pingingText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.medium,
  },

  // Tip Card
  tipCard: {
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    ...SHADOWS.sm,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tipIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: LIGHT_COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
    color: LIGHT_COLORS.textPrimary,
  },
  tipText: {
    fontSize: TYPOGRAPHY.sm,
    color: LIGHT_COLORS.textSecondary,
    lineHeight: 20,
  },

  // Footer
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  cancelButton: {
    backgroundColor: LIGHT_COLORS.surface,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border,
    ...SHADOWS.sm,
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: LIGHT_COLORS.textPrimary,
  },
});
