import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Navigation, MapPin, Clock, Car, RefreshCw } from 'lucide-react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { DARK_COLORS, SPACING, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { useGoogleMaps, type LatLng, type DirectionsResult } from './GoogleMapsProvider';
import { decodePolyline } from '@/utils/polyline';

interface DirectionsMapProps {
  origin: LatLng;
  destination: LatLng;
  originLabel?: string;
  destinationLabel?: string;
  showRouteInfo?: boolean;
  onRouteCalculated?: (result: DirectionsResult) => void;
  style?: object;
}

export function DirectionsMap({
  origin,
  destination,
  originLabel = 'Start',
  destinationLabel = 'Destination',
  showRouteInfo = true,
  onRouteCalculated,
  style,
}: DirectionsMapProps) {
  const { getDirections, calculateDistance } = useGoogleMaps();
  const mapRef = useRef<MapView>(null);

  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate route
  const calculateRoute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getDirections(origin, destination);
      if (result) {
        setDirections(result);
        // Decode polyline to coordinates
        const coordinates = decodePolyline(result.polyline);
        setRouteCoordinates(coordinates);
        onRouteCalculated?.(result);
      } else {
        setError('Could not calculate route');
      }
    } catch (err) {
      setError('Failed to get directions');
    } finally {
      setIsLoading(false);
    }
  }, [origin, destination, getDirections, onRouteCalculated]);

  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  // Fit map to show route
  useEffect(() => {
    if (routeCoordinates.length > 0 && mapRef.current) {
      const padding = { top: 100, right: 50, bottom: 150, left: 50 };
      mapRef.current.fitToCoordinates(routeCoordinates, {
        edgePadding: padding,
        animated: true,
      });
    }
  }, [routeCoordinates]);

  const initialRegion: Region = {
    latitude: (origin.latitude + destination.latitude) / 2,
    longitude: (origin.longitude + destination.longitude) / 2,
    latitudeDelta: Math.abs(origin.latitude - destination.latitude) * 1.5,
    longitudeDelta: Math.abs(origin.longitude - destination.longitude) * 1.5,
  };

  const straightLineDistance = calculateDistance(origin, destination);

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        customMapStyle={mapStyle}
      >
        {/* Origin Marker */}
        <Marker coordinate={origin} title={originLabel}>
          <View style={styles.originMarker}>
            <Navigation size={16} color="#FFFFFF" />
          </View>
        </Marker>

        {/* Destination Marker */}
        <Marker coordinate={destination} title={destinationLabel}>
          <View style={styles.destinationMarker}>
            <MapPin size={16} color="#FFFFFF" />
          </View>
        </Marker>

        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor={DARK_COLORS.primary}
            lineDashPattern={[0]}
          />
        )}
      </MapView>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={DARK_COLORS.primary} />
          <Text style={styles.loadingText}>Calculating route...</Text>
        </View>
      )}

      {/* Error */}
      {error && (
        <Animated.View entering={FadeIn} style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={calculateRoute}>
            <RefreshCw size={16} color={DARK_COLORS.primary} />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Route Info Card */}
      {showRouteInfo && directions && !isLoading && (
        <Animated.View entering={SlideInUp.duration(300)} style={styles.routeCard}>
          <View style={styles.routeInfo}>
            <View style={styles.routeInfoItem}>
              <View style={styles.routeInfoIcon}>
                <Clock size={18} color={DARK_COLORS.primary} />
              </View>
              <View>
                <Text style={styles.routeInfoValue}>{directions.duration.text}</Text>
                <Text style={styles.routeInfoLabel}>Travel time</Text>
              </View>
            </View>

            <View style={styles.routeInfoDivider} />

            <View style={styles.routeInfoItem}>
              <View style={styles.routeInfoIcon}>
                <Car size={18} color={DARK_COLORS.primary} />
              </View>
              <View>
                <Text style={styles.routeInfoValue}>{directions.distance.text}</Text>
                <Text style={styles.routeInfoLabel}>Distance</Text>
              </View>
            </View>
          </View>

          {/* Route steps preview */}
          {directions.steps.length > 0 && (
            <View style={styles.nextStep}>
              <Text style={styles.nextStepLabel}>Next:</Text>
              <Text style={styles.nextStepText} numberOfLines={1}>
                {directions.steps[0].instruction}
              </Text>
            </View>
          )}
        </Animated.View>
      )}

      {/* Straight line distance fallback */}
      {!directions && !isLoading && !error && (
        <View style={styles.fallbackCard}>
          <Text style={styles.fallbackText}>
            Approx. {straightLineDistance.toFixed(1)} km away
          </Text>
        </View>
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
  originMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  destinationMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DARK_COLORS.primary,
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.textMuted,
  },
  errorContainer: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: DARK_COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: DARK_COLORS.error,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.error,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  retryText: {
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.primary,
    fontWeight: '600',
  },
  routeCard: {
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
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  routeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  routeInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DARK_COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeInfoValue: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: DARK_COLORS.textPrimary,
  },
  routeInfoLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: DARK_COLORS.textMuted,
  },
  routeInfoDivider: {
    width: 1,
    height: 40,
    backgroundColor: DARK_COLORS.border,
  },
  nextStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: DARK_COLORS.border,
  },
  nextStepLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '600',
    color: DARK_COLORS.textMuted,
  },
  nextStepText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.textPrimary,
  },
  fallbackCard: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: DARK_COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  fallbackText: {
    fontSize: TYPOGRAPHY.sm,
    color: DARK_COLORS.textMuted,
  },
});

export default DirectionsMap;
