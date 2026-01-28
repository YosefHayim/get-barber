import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import type { MapViewProps } from './types';

export type { MapRegion, MapMarkerData, MapViewProps } from './types';

const NativeMapView: React.FC<MapViewProps> = ({
  initialRegion,
  markers = [],
  onMarkerPress,
  customMapStyle,
  showsUserLocation = true,
  renderMarker,
  selectedMarkerId,
  mapRef,
}) => {
  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFillObject}
      provider={PROVIDER_GOOGLE}
      initialRegion={initialRegion}
      customMapStyle={customMapStyle}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={false}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={marker.coordinate}
          onPress={() => onMarkerPress?.(marker.id)}
        >
          {renderMarker ? renderMarker(marker, selectedMarkerId === marker.id) : null}
        </Marker>
      ))}
    </MapView>
  );
};

export default NativeMapView;
