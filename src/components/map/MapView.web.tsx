import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { DARK_COLORS } from '@/constants/theme';
import type { MapViewProps, MapRegion, MapMarkerData } from './types';

export type { MapRegion, MapMarkerData, MapViewProps };

const WebMapView: React.FC<MapViewProps> = ({
  initialRegion,
  markers = [],
  onMarkerPress,
  selectedMarkerId,
}) => {
  return (
    <View style={styles.webMapContainer}>
      <View style={styles.webMapPlaceholder}>
        <Text style={styles.webMapTitle}>📍 Map View</Text>
        <Text style={styles.webMapSubtitle}>
          Location: {initialRegion.latitude.toFixed(4)}, {initialRegion.longitude.toFixed(4)}
        </Text>
        <Text style={styles.webMapNote}>
          {markers.length} barbers nearby
        </Text>
      </View>
      
      <View style={styles.webMarkerList}>
        {markers.slice(0, 5).map((marker) => (
          <Pressable
            key={marker.id}
            style={[
              styles.webMarkerItem,
              selectedMarkerId === marker.id && styles.webMarkerItemSelected,
            ]}
            onPress={() => onMarkerPress?.(marker.id)}
          >
            <Text style={styles.webMarkerIcon}>✂️</Text>
            <View style={styles.webMarkerInfo}>
              <Text style={styles.webMarkerTitle}>{marker.title || `Barber ${marker.id}`}</Text>
              <Text style={styles.webMarkerCoords}>
                {marker.coordinate.latitude.toFixed(4)}, {marker.coordinate.longitude.toFixed(4)}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default WebMapView;

const styles = StyleSheet.create({
  webMapContainer: {
    flex: 1,
    backgroundColor: DARK_COLORS.surfaceLight,
  },
  webMapPlaceholder: {
    height: 200,
    backgroundColor: DARK_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: DARK_COLORS.border,
  },
  webMapTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: DARK_COLORS.textPrimary,
    marginBottom: 8,
  },
  webMapSubtitle: {
    fontSize: 14,
    color: DARK_COLORS.textSecondary,
    marginBottom: 4,
  },
  webMapNote: {
    fontSize: 12,
    color: DARK_COLORS.textMuted,
  },
  webMarkerList: {
    flex: 1,
    padding: 16,
  },
  webMarkerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: DARK_COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DARK_COLORS.border,
  },
  webMarkerItemSelected: {
    borderColor: DARK_COLORS.primary,
    backgroundColor: DARK_COLORS.primaryMuted,
  },
  webMarkerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  webMarkerInfo: {
    flex: 1,
  },
  webMarkerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_COLORS.textPrimary,
  },
  webMarkerCoords: {
    fontSize: 12,
    color: DARK_COLORS.textMuted,
  },
});
