export interface GeoLocation {
  readonly latitude: number;
  readonly longitude: number;
}

export interface GeoLocationWithAccuracy extends GeoLocation {
  readonly accuracy: number;
  readonly altitude?: number;
  readonly heading?: number;
  readonly speed?: number;
  readonly timestamp: number;
}

export interface GeoRegion extends GeoLocation {
  readonly latitudeDelta: number;
  readonly longitudeDelta: number;
}

export interface ApiResponse<T> {
  readonly data: T;
  readonly success: boolean;
  readonly message?: string;
  readonly timestamp: string;
}

export interface PaginatedResponse<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
}

export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface WithId {
  readonly id: string;
}

export interface WithTimestamps {
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type Nullable<T> = T | null;
