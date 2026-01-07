import React from 'react';
import { View, StyleSheet, Modal, Dimensions } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Moon, Clock, Sparkles } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useShabbatLock } from '../hooks/useShabbatStatus';

interface ShabbatOverlayProps {
  children: React.ReactNode;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function ShabbatScreen(): React.JSX.Element {
  const { lockMessage, unlockTime } = useShabbatLock();
  
  const moonScale = useSharedValue(1);
  const starsOpacity = useSharedValue(0.3);

  React.useEffect(() => {
    moonScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    starsOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [moonScale, starsOpacity]);

  const moonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: moonScale.value }],
  }));

  const starsStyle = useAnimatedStyle(() => ({
    opacity: starsOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <Animated.View style={[styles.starsContainer, starsStyle]}>
          {Array.from({ length: 20 }).map((_, i) => (
            <Sparkles
              key={i}
              size={8 + Math.random() * 8}
              color="#FBBF24"
              style={{
                position: 'absolute',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </Animated.View>
      </View>

      <Surface style={styles.card} elevation={4}>
        <Animated.View style={moonStyle}>
          <View style={styles.moonContainer}>
            <Moon size={80} color="#FBBF24" fill="#FBBF24" />
          </View>
        </Animated.View>

        <Text style={styles.title}>Shabbat Shalom</Text>
        <Text style={styles.hebrewTitle}>!Shabbat Shalom</Text>

        <Text style={styles.message}>{lockMessage}</Text>

        {unlockTime && (
          <View style={styles.timeContainer}>
            <Clock size={18} color="#6B7280" />
            <Text style={styles.timeLabel}>Havdalah at</Text>
            <Text style={styles.time}>{unlockTime}</Text>
          </View>
        )}

        <View style={styles.candlesContainer}>
          <View style={styles.candle}>
            <View style={styles.flame} />
            <View style={styles.candleBody} />
          </View>
          <View style={styles.candle}>
            <View style={styles.flame} />
            <View style={styles.candleBody} />
          </View>
        </View>
      </Surface>
    </View>
  );
}

export function ShabbatOverlay({ children }: ShabbatOverlayProps): React.JSX.Element {
  const { isLocked } = useShabbatLock();

  return (
    <>
      {children}
      <Modal
        visible={isLocked}
        animationType="fade"
        transparent={false}
        statusBarTranslucent
      >
        <ShabbatScreen />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    width: SCREEN_WIDTH - 48,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  moonContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 4,
  },
  hebrewTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 20,
  },
  message: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 32,
  },
  timeLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  time: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  candlesContainer: {
    flexDirection: 'row',
    gap: 24,
  },
  candle: {
    alignItems: 'center',
  },
  flame: {
    width: 12,
    height: 20,
    backgroundColor: '#F59E0B',
    borderRadius: 6,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginBottom: -4,
  },
  candleBody: {
    width: 16,
    height: 48,
    backgroundColor: '#FEF3C7',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
});
