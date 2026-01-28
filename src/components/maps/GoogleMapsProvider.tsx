import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Types
export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  location: LatLng;
  types: string[];
  rating?: number;
  phoneNumber?: string;
  website?: string;
  openingHours?: string[];
}

export interface DirectionsResult {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  polyline: string;
  steps: DirectionStep[];
}

export interface DirectionStep {
  instruction: string;
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  startLocation: LatLng;
  endLocation: LatLng;
}

export interface GeocodingResult {
  address: string;
  location: LatLng;
  placeId: string;
}

// Context
interface GoogleMapsContextValue {
  apiKey: string;
  isReady: boolean;
  userLocation: LatLng | null;
  isLoadingLocation: boolean;
  locationError: string | null;
  getCurrentLocation: () => Promise<LatLng | null>;
  searchPlaces: (query: string, location?: LatLng) => Promise<PlacePrediction[]>;
  getPlaceDetails: (placeId: string) => Promise<PlaceDetails | null>;
  getDirections: (origin: LatLng, destination: LatLng) => Promise<DirectionsResult | null>;
  geocodeAddress: (address: string) => Promise<GeocodingResult | null>;
  reverseGeocode: (location: LatLng) => Promise<string | null>;
  calculateDistance: (origin: LatLng, destination: LatLng) => number;
}

const GoogleMapsContext = createContext<GoogleMapsContextValue | undefined>(undefined);

// Provider
export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Initialize and get initial location
  useEffect(() => {
    const init = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        } else {
          setLocationError('Location permission denied');
        }
      } catch (error) {
        setLocationError('Failed to get location');
      } finally {
        setIsLoadingLocation(false);
        setIsReady(true);
      }
    };

    init();
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<LatLng | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(coords);
      return coords;
    } catch (error) {
      setLocationError('Failed to get location');
      return null;
    }
  }, []);

  // Search places using Google Places Autocomplete
  const searchPlaces = useCallback(
    async (query: string, location?: LatLng): Promise<PlacePrediction[]> => {
      if (!query.trim()) return [];

      try {
        const locationBias = location || userLocation;
        let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&key=${GOOGLE_MAPS_API_KEY}&language=he&components=country:il`;

        if (locationBias) {
          url += `&location=${locationBias.latitude},${locationBias.longitude}&radius=50000`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
          console.error('Places API error:', data.status);
          return [];
        }

        return (data.predictions || []).map((prediction: any) => ({
          placeId: prediction.place_id,
          description: prediction.description,
          mainText: prediction.structured_formatting?.main_text || prediction.description,
          secondaryText: prediction.structured_formatting?.secondary_text || '',
        }));
      } catch (error) {
        console.error('Search places error:', error);
        return [];
      }
    },
    [userLocation]
  );

  // Get place details
  const getPlaceDetails = useCallback(async (placeId: string): Promise<PlaceDetails | null> => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}&fields=name,formatted_address,geometry,types,rating,formatted_phone_number,website,opening_hours`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        console.error('Place details error:', data.status);
        return null;
      }

      const result = data.result;
      return {
        placeId,
        name: result.name,
        address: result.formatted_address,
        location: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        },
        types: result.types || [],
        rating: result.rating,
        phoneNumber: result.formatted_phone_number,
        website: result.website,
        openingHours: result.opening_hours?.weekday_text,
      };
    } catch (error) {
      console.error('Get place details error:', error);
      return null;
    }
  }, []);

  // Get directions between two points
  const getDirections = useCallback(
    async (origin: LatLng, destination: LatLng): Promise<DirectionsResult | null> => {
      try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}&language=he&mode=driving`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK') {
          console.error('Directions error:', data.status);
          return null;
        }

        const route = data.routes[0];
        const leg = route.legs[0];

        return {
          distance: {
            text: leg.distance.text,
            value: leg.distance.value,
          },
          duration: {
            text: leg.duration.text,
            value: leg.duration.value,
          },
          polyline: route.overview_polyline.points,
          steps: leg.steps.map((step: any) => ({
            instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
            distance: {
              text: step.distance.text,
              value: step.distance.value,
            },
            duration: {
              text: step.duration.text,
              value: step.duration.value,
            },
            startLocation: {
              latitude: step.start_location.lat,
              longitude: step.start_location.lng,
            },
            endLocation: {
              latitude: step.end_location.lat,
              longitude: step.end_location.lng,
            },
          })),
        };
      } catch (error) {
        console.error('Get directions error:', error);
        return null;
      }
    },
    []
  );

  // Geocode address to coordinates
  const geocodeAddress = useCallback(async (address: string): Promise<GeocodingResult | null> => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${GOOGLE_MAPS_API_KEY}&language=he&region=il`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        console.error('Geocoding error:', data.status);
        return null;
      }

      const result = data.results[0];
      return {
        address: result.formatted_address,
        location: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        },
        placeId: result.place_id,
      };
    } catch (error) {
      console.error('Geocode address error:', error);
      return null;
    }
  }, []);

  // Reverse geocode coordinates to address
  const reverseGeocode = useCallback(async (location: LatLng): Promise<string | null> => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=${GOOGLE_MAPS_API_KEY}&language=he`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        console.error('Reverse geocoding error:', data.status);
        return null;
      }

      return data.results[0]?.formatted_address || null;
    } catch (error) {
      console.error('Reverse geocode error:', error);
      return null;
    }
  }, []);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback((origin: LatLng, destination: LatLng): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((destination.latitude - origin.latitude) * Math.PI) / 180;
    const dLon = ((destination.longitude - origin.longitude) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((origin.latitude * Math.PI) / 180) *
        Math.cos((destination.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }, []);

  const value: GoogleMapsContextValue = {
    apiKey: GOOGLE_MAPS_API_KEY,
    isReady,
    userLocation,
    isLoadingLocation,
    locationError,
    getCurrentLocation,
    searchPlaces,
    getPlaceDetails,
    getDirections,
    geocodeAddress,
    reverseGeocode,
    calculateDistance,
  };

  return <GoogleMapsContext.Provider value={value}>{children}</GoogleMapsContext.Provider>;
}

// Hook
export function useGoogleMaps(): GoogleMapsContextValue {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
}

export default GoogleMapsProvider;
