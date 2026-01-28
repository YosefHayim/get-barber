import type MapView from 'react-native-maps';

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapMarkerData {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
}

export interface MapStyleElement {
  featureType?: string;
  elementType?: string;
  stylers: Array<{ [key: string]: string | number }>;
}

export interface MapViewProps {
  initialRegion: MapRegion;
  markers?: MapMarkerData[];
  onMarkerPress?: (markerId: string) => void;
  customMapStyle?: MapStyleElement[];
  showsUserLocation?: boolean;
  renderMarker?: (marker: MapMarkerData, isSelected: boolean) => React.ReactNode;
  selectedMarkerId?: string | null;
  mapRef?: React.RefObject<MapView | null>;
}
