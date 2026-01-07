import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
  verified?: boolean;
}

const GOLD = '#DAA520';
const DARK_GOLD = '#B8860B';
const BURGUNDY = '#722F37';

export function Avatar({
  uri,
  name,
  size = 48,
  showOnlineIndicator = false,
  isOnline = false,
  verified = false,
}: AvatarProps): React.JSX.Element {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  const indicatorSize = Math.max(size * 0.25, 12);
  const borderWidth = Math.max(size * 0.06, 3);
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (isOnline) {
      pulseScale.value = withRepeat(
        withTiming(1.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [isOnline, pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  return (
    <View style={[styles.container, { width: size + borderWidth * 2, height: size + borderWidth * 2 }]}>
      <View
        style={[
          styles.ring,
          {
            width: size + borderWidth * 2,
            height: size + borderWidth * 2,
            borderRadius: (size + borderWidth * 2) / 2,
            borderWidth: borderWidth,
            borderColor: verified ? GOLD : 'transparent',
          },
        ]}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={[
              styles.image,
              { width: size, height: size, borderRadius: size / 2 },
            ]}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { width: size, height: size, borderRadius: size / 2 },
            ]}
          >
            <Text style={[styles.initials, { fontSize: size * 0.38 }]}>
              {initials}
            </Text>
          </View>
        )}
      </View>
      {showOnlineIndicator && (
        <View style={[styles.indicatorContainer, { bottom: 0, right: 0 }]}>
          {isOnline && (
            <Animated.View
              style={[
                styles.pulse,
                pulseStyle,
                {
                  width: indicatorSize,
                  height: indicatorSize,
                  borderRadius: indicatorSize / 2,
                  backgroundColor: '#10B981',
                },
              ]}
            />
          )}
          <View
            style={[
              styles.indicator,
              {
                width: indicatorSize,
                height: indicatorSize,
                borderRadius: indicatorSize / 2,
                backgroundColor: isOnline ? '#10B981' : '#9CA3AF',
              },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    backgroundColor: '#E5E7EB',
  },
  placeholder: {
    backgroundColor: BURGUNDY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 1,
  },
  indicatorContainer: {
    position: 'absolute',
  },
  pulse: {
    position: 'absolute',
  },
  indicator: {
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
