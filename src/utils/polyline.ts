import type { LatLng } from '@/components/maps/GoogleMapsProvider';

/**
 * Decodes a Google Maps encoded polyline string into an array of LatLng coordinates.
 * Based on the Google Polyline Algorithm.
 * @see https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
export function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let result = 0;
    let shift = 0;
    let byte: number;

    // Decode latitude
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    result = 0;
    shift = 0;

    // Decode longitude
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
}

/**
 * Encodes an array of LatLng coordinates into a Google Maps encoded polyline string.
 */
export function encodePolyline(coordinates: LatLng[]): string {
  let encoded = '';
  let prevLat = 0;
  let prevLng = 0;

  for (const coord of coordinates) {
    const lat = Math.round(coord.latitude * 1e5);
    const lng = Math.round(coord.longitude * 1e5);

    encoded += encodeSignedNumber(lat - prevLat);
    encoded += encodeSignedNumber(lng - prevLng);

    prevLat = lat;
    prevLng = lng;
  }

  return encoded;
}

function encodeSignedNumber(num: number): string {
  let sgn_num = num << 1;
  if (num < 0) {
    sgn_num = ~sgn_num;
  }
  return encodeNumber(sgn_num);
}

function encodeNumber(num: number): string {
  let encoded = '';
  while (num >= 0x20) {
    encoded += String.fromCharCode((0x20 | (num & 0x1f)) + 63);
    num >>= 5;
  }
  encoded += String.fromCharCode(num + 63);
  return encoded;
}

/**
 * Simplifies a polyline by removing points that are too close together.
 * Useful for reducing the number of points in a route for performance.
 */
export function simplifyPolyline(
  coordinates: LatLng[],
  tolerance: number = 0.0001
): LatLng[] {
  if (coordinates.length <= 2) return coordinates;

  const simplified: LatLng[] = [coordinates[0]];
  let prevPoint = coordinates[0];

  for (let i = 1; i < coordinates.length - 1; i++) {
    const point = coordinates[i];
    const distance = Math.sqrt(
      Math.pow(point.latitude - prevPoint.latitude, 2) +
        Math.pow(point.longitude - prevPoint.longitude, 2)
    );

    if (distance >= tolerance) {
      simplified.push(point);
      prevPoint = point;
    }
  }

  simplified.push(coordinates[coordinates.length - 1]);
  return simplified;
}

/**
 * Calculates the total distance of a polyline in kilometers.
 */
export function calculatePolylineDistance(coordinates: LatLng[]): number {
  let totalDistance = 0;
  const R = 6371; // Earth's radius in km

  for (let i = 0; i < coordinates.length - 1; i++) {
    const lat1 = (coordinates[i].latitude * Math.PI) / 180;
    const lat2 = (coordinates[i + 1].latitude * Math.PI) / 180;
    const dLat = lat2 - lat1;
    const dLon =
      ((coordinates[i + 1].longitude - coordinates[i].longitude) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    totalDistance += R * c;
  }

  return totalDistance;
}

export default {
  decodePolyline,
  encodePolyline,
  simplifyPolyline,
  calculatePolylineDistance,
};
