export const QUERY_KEYS = {
  NEARBY_BARBERS: 'nearby-barbers',
  BARBER_PROFILE: 'barber-profile',
  BARBER_PORTFOLIO: 'barber-portfolio',
  SERVICES: 'services',
  SERVICE_REQUESTS: 'service-requests',
  REQUEST_STATUS: 'request-status',
  ACTIVE_REQUESTS: 'active-requests',
  BARBER_RESPONSES: 'barber-responses',
  CHAT_MESSAGES: 'chat-messages',
  BOOKINGS: 'bookings',
  BOOKING_DETAIL: 'booking-detail',
  REVIEWS: 'reviews',
  USER_PROFILE: 'user-profile',
  SAVED_ADDRESSES: 'saved-addresses',
  FAVORITE_BARBERS: 'favorite-barbers',
} as const;

export type QueryKey = (typeof QUERY_KEYS)[keyof typeof QUERY_KEYS];
