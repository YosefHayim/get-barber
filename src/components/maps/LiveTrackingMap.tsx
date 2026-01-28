import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-paper';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region, AnimatedRegion } from 'react-native-maps';
import { Navigation, MapPin, Phone, MessageCircle, Clock, Car } from 'lucide-react-native';
import Animated, {
  FadeIn,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { DARK_COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { useGoogleMaps, type LatLng, type DirectionsResult } from './GoogleMapsProvider';
import { decodePolyline } from '@/utils/polyline';

interface BarberLocation {
  id: string;
  name: string;
  avatar?: string;
  location: LatLng;
  heading?: number;
  speed?: number;
  lastUpdated: string;
}

interface LiveTrackingMapProps {
  barber: BarberLocation;
  destination: LatLng;
  destinationLabel?: string;
  onCall?: () => void;
  onMessage?: () => void;
  onArrival?: () => void;
  style?: object;
}

export function LiveTrackingMap({
  barber,
  destination,
  destinationLabel = 'Your Location',
  onCall,
  onMessage,
  onArrival,
  style,
}: LiveTrackingMapProps) {
  const { getDirections, calculateDistance } = useGoogleMaps();
  const mapRef = useRef<MapView>(null);

  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);
  const [eta, setEta] = useState<string>('');
  const [isArrived, setIsArrived] = useState(false);

  // Animation for pulsing effect
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.3, { duration: 1000 }),
      -1,
      true
    );
  }, [pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  // Calculate route when barber location changes
  const updateRoute = useCallback(async () => {
    const result = await getDirections(barber.location, destination);
    if (result) {
      setDirections(result);
      const coordinates = decodePolyline(result.polyline);
      setRouteCoordinates(coordinates);
      setEta(result.duration.text);

      // Check if barber has arrived (within 50 meters)
      const distance = calculateDistance(barber.location, destination);
      if (distance < 0.05 && !isArrived) {
        setIsArrived(true);
        onArrival?.();
      }
    }
  }, [barber.location, destination, getDirections, calculateDistance, isArrived, onArrival]);

  useEffect(() => {
    updateRoute();
  }, [updateRoute]);

  // Center map on barber
  useEffect(() => {
    if (mapRef.current && routeCoordinates.length > 0) {
      mapRef.current.fitToCoordinates(
        [barber.location, destination],
        {
          edgePadding: { top: 150, right: 50, bottom: 250, left: 50 },
          animated: true,
        }
      );
    }
  }, [barber.location, destination, routeCoordinates]);

  const initialRegion: Region = useMemo(() => ({
    latitude: (barber.location.latitude + destination.latitude) / 2,
    longitude: (barber.location.longitude + destination.longitude) / 2,
    latitudeDelta: Math.abs(barber.location.latitude - destination.latitude) * 2,
    longitudeDelta: Math.abs(barber.location.longitude - destination.longitude) * 2,
  }), [barber.location, destination]);

  const distanceToDestination = calculateDistance(barber.location, destination);

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        customMapStyle={mapStyle}
      >
        {/* Barber Marker with animation */}
        <Marker
          coordinate={barber.location}
          title={barber.name}
          rotation={barber.heading || 0}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.barberMarkerContainer}>
            <Animated.View style={[styles.barberPulse, pulseStyle]} />
            <View style={styles.barberMarker}>
              {barber.avatar ? (
                <Image source={{ uri: barber.avatar }} style={styles.barberAvatar} />
              ) : (
                <Text style={styles.barberInitial}>
                  {barber.name.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
          </View>
        </Marker>

        {/* Destination Marker */}
        <Marker coordinate={destination} title={destinationLabel}>
          <View style={styles.destinationMarker}>
            <MapPin size={20} color="#FFFFFF" />
          </View>
        </Marker>

        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={5}
            strokeColor={DARK_COLORS.primary}
            lineDashPattern={[0]}
          />
        )}
      </MapView>

      {/* Barber Info Card */}
      <Animated.View entering={SlideInUp.duration(300)} style={styles.barberCard}>
        <View style={styles.barberInfo}>
          <View style={styles.barberAvatarLarge}>
            {barber.avatar ? (
              <Image source={{ uri: barber.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarInitial}>
                {barber.name.charAt(0).toUpperCase()}
              </Text>
            )}
            <View style={styles.onlineIndicator} />
          </View>

          <View style={styles.barberDetails}>
            <Text style={styles.barberName}>{barber.name}</Text>
            <View style={styles.etaContainer}>
              {isArrived ? (
                <Text style={styles.arrivedText}>Arrived!</Text>
              ) : (
                <>
                  <Clock size={14} color={DARK_COLORS.primary} />
                  <Text style={styles.etaText}>
                    {eta || 'Calculating...'} ({distanceToDestination.toFixed(1)} km)
                  </Text>
                </>
              )}
            </View>
            {barber.speed && barber.speed > 0 && (
              <View style={styles.speedContainer}>
                <Car size={12} color={DARK_COLORS.textMuted} />
                <Text style={styles.speedText}>
                  {Math.round(barber.speed)} km/h
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={onCall}>
            <Phone size={20} color={DARK_COLORS.primary} />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity style={styles.actionButton} onPress={onMessage}>
            <MessageCircle size={20} color={DARK_COLORS.primary} />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* ETA Progress */}
        {directions && !isArrived && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(
                      0,
                      100 - (distanceToDestination / (directions.distance.value / 1000)) * 100
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(distanceToDestination * 1000)}m remaining
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Arrival Overlay */}
      {isArrived && (
        <Animated.View entering={FadeIn} style={styles.arrivedOverlay}>
          <View style={styles.arrivedBadge}>
            <Navigation size={24} color={DARK_COLORS.success} />
            <Text style={styles.arrivedBadgeText}>Your barber has arrived!</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// Dark map style
const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d44' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a2e' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0e1a' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  barberMarkerContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barberPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: DARK_COLORS.primary,
  },
  barberMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DARK_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  barberAvatar: {
    width: '100%',
    height: '100%',
  },
  barberInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  destinationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DARK_COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  barberCard: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: DARK_COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  barberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  barberAvatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DARK_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: DARK_COLORS.success,
    borderWidth: 2,
    borderColor: DARK_COLORS.surface,
  },
  barberDetails: {
    flex: 1,
  },
  barberName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: DARK_COLORS.textPrimary,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  etaText: {
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.textPrimary,
  },
  arrivedText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
    color: DARK_COLORS.success,
  },
  speedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  speedText: {
    fontSize: TYPOGRAPHY.xs,
    color: DARK_COLORS.textMuted,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: DARK_COLORS.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '600',
    color: DARK_COLORS.primary,
  },
  actionDivider: {
    width: 1,
    backgroundColor: DARK_COLORS.border,
    marginVertical: SPACING.xs,
  },
  progressContainer: {
    marginTop: SPACING.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: DARK_COLORS.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: DARK_COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: TYPOGRAPHY.xs,
    color: DARK_COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  arrivedOverlay: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  arrivedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: DARK_COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: DARK_COLORS.success,
    shadowColor: DARK_COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  arrivedBadgeText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: '700',
    color: DARK_COLORS.success,
  },
});

export default LiveTrackingMap;
