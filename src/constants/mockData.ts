import type { BookingStatus } from './theme';

export interface MockBarber {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  distanceMeters: number;
  priceMin: number;
  priceMax: number;
  isOnline: boolean;
  specialties: string[];
  yearsExperience: number;
}

export interface MockCustomer {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  rating: number;
  totalBookings: number;
  phone: string;
}

export interface MockConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string | null;
  participantType: 'barber' | 'customer';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'negotiating' | 'confirmed' | 'completed' | 'cancelled';
  serviceNames: string[];
  offeredPrice: number | null;
}

export interface MockMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'customer' | 'barber';
  content: string | null;
  messageType: 'text' | 'offer' | 'counter_offer' | 'system' | 'image';
  offerAmount: number | null;
  offerStatus: 'pending' | 'accepted' | 'rejected' | 'expired' | null;
  createdAt: string;
}

export interface MockBooking {
  id: string;
  barberId: string;
  barberName: string;
  barberAvatar: string | null;
  customerId: string;
  customerName: string;
  customerAvatar: string | null;
  services: string[];
  totalPrice: number;
  status: BookingStatus;
  scheduledAt: string;
  address: string;
  createdAt: string;
  completedAt: string | null;
  rating: number | null;
  review: string | null;
}

export interface MockServiceRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar: string | null;
  customerRating: number;
  services: string[];
  address: string;
  distanceMeters: number;
  createdAt: string;
  expiresAt: string;
  offeredPrice: number | null;
  status: 'new' | 'viewed' | 'responded' | 'expired';
}

export const MOCK_BARBERS: MockBarber[] = [
  {
    id: 'barber-1',
    userId: 'user-barber-1',
    displayName: 'Yossi Cohen',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    bio: 'Master barber with 15 years of experience. Specializing in classic cuts and hot towel shaves.',
    rating: 4.9,
    totalReviews: 328,
    isVerified: true,
    distanceMeters: 450,
    priceMin: 60,
    priceMax: 150,
    isOnline: true,
    specialties: ['Classic Cuts', 'Hot Towel Shave', 'Beard Styling'],
    yearsExperience: 15,
  },
  {
    id: 'barber-2',
    userId: 'user-barber-2',
    displayName: 'David Levi',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    bio: 'Modern styles and fades. Instagram: @davidthebarber_tlv',
    rating: 4.7,
    totalReviews: 156,
    isVerified: true,
    distanceMeters: 850,
    priceMin: 50,
    priceMax: 120,
    isOnline: true,
    specialties: ['Fades', 'Modern Styles', 'Hair Design'],
    yearsExperience: 8,
  },
  {
    id: 'barber-3',
    userId: 'user-barber-3',
    displayName: 'Moshe Goldberg',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    bio: 'Your neighborhood barber. Quick, professional, and affordable.',
    rating: 4.5,
    totalReviews: 89,
    isVerified: false,
    distanceMeters: 1200,
    priceMin: 40,
    priceMax: 80,
    isOnline: false,
    specialties: ['Quick Cuts', 'Kids Haircuts', 'Senior Cuts'],
    yearsExperience: 12,
  },
  {
    id: 'barber-4',
    userId: 'user-barber-4',
    displayName: 'Eli Mizrachi',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    bio: 'Premium grooming experience. Relax and let me handle the rest.',
    rating: 4.8,
    totalReviews: 203,
    isVerified: true,
    distanceMeters: 2100,
    priceMin: 80,
    priceMax: 200,
    isOnline: true,
    specialties: ['Premium Grooming', 'Scalp Treatment', 'VIP Service'],
    yearsExperience: 10,
  },
];

export const MOCK_CUSTOMERS: MockCustomer[] = [
  {
    id: 'customer-1',
    displayName: 'Avi Shapira',
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=200',
    rating: 4.8,
    totalBookings: 12,
    phone: '+972-50-123-4567',
  },
  {
    id: 'customer-2',
    displayName: 'Nir Hasson',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200',
    rating: 5.0,
    totalBookings: 8,
    phone: '+972-52-987-6543',
  },
  {
    id: 'customer-3',
    displayName: 'Oren Tal',
    avatarUrl: null,
    rating: 4.5,
    totalBookings: 3,
    phone: '+972-54-555-1234',
  },
];

const now = new Date();
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

export const MOCK_CONVERSATIONS_CUSTOMER: MockConversation[] = [
  {
    id: 'conv-1',
    participantId: 'barber-1',
    participantName: 'Yossi Cohen',
    participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    participantType: 'barber',
    lastMessage: 'Perfect! I can be there in 20 minutes. See you soon!',
    lastMessageTime: oneHourAgo.toISOString(),
    unreadCount: 2,
    status: 'confirmed',
    serviceNames: ['Haircut', 'Beard Trim'],
    offeredPrice: 95,
  },
  {
    id: 'conv-2',
    participantId: 'barber-2',
    participantName: 'David Levi',
    participantAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    participantType: 'barber',
    lastMessage: 'How about ₪80 for the haircut?',
    lastMessageTime: threeHoursAgo.toISOString(),
    unreadCount: 1,
    status: 'negotiating',
    serviceNames: ['Haircut'],
    offeredPrice: 80,
  },
  {
    id: 'conv-3',
    participantId: 'barber-4',
    participantName: 'Eli Mizrachi',
    participantAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    participantType: 'barber',
    lastMessage: 'Thank you for your business! Please leave a review.',
    lastMessageTime: yesterday.toISOString(),
    unreadCount: 0,
    status: 'completed',
    serviceNames: ['Premium Haircut', 'Hot Towel Shave'],
    offeredPrice: 180,
  },
];

export const MOCK_CONVERSATIONS_BARBER: MockConversation[] = [
  {
    id: 'conv-b-1',
    participantId: 'customer-1',
    participantName: 'Avi Shapira',
    participantAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=200',
    participantType: 'customer',
    lastMessage: 'Yes, that price works for me. When can you come?',
    lastMessageTime: oneHourAgo.toISOString(),
    unreadCount: 1,
    status: 'negotiating',
    serviceNames: ['Haircut', 'Beard Trim'],
    offeredPrice: 90,
  },
  {
    id: 'conv-b-2',
    participantId: 'customer-2',
    participantName: 'Nir Hasson',
    participantAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200',
    participantType: 'customer',
    lastMessage: 'Great service! Will book again.',
    lastMessageTime: twoDaysAgo.toISOString(),
    unreadCount: 0,
    status: 'completed',
    serviceNames: ['Fade Haircut'],
    offeredPrice: 70,
  },
  {
    id: 'conv-b-3',
    participantId: 'customer-3',
    participantName: 'Oren Tal',
    participantAvatar: null,
    participantType: 'customer',
    lastMessage: 'Can you do ₪60 instead of ₪75?',
    lastMessageTime: threeHoursAgo.toISOString(),
    unreadCount: 2,
    status: 'negotiating',
    serviceNames: ['Haircut'],
    offeredPrice: 60,
  },
];

export const MOCK_MESSAGES: Record<string, MockMessage[]> = {
  'conv-1': [
    {
      id: 'msg-1-1',
      conversationId: 'conv-1',
      senderId: 'current-user',
      senderType: 'customer',
      content: 'Hi! I need a haircut and beard trim at my place. Are you available?',
      messageType: 'text',
      offerAmount: null,
      offerStatus: null,
      createdAt: new Date(oneHourAgo.getTime() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-1-2',
      conversationId: 'conv-1',
      senderId: 'barber-1',
      senderType: 'barber',
      content: 'Hey! Yes, I can come to you. Let me check the services.',
      messageType: 'text',
      offerAmount: null,
      offerStatus: null,
      createdAt: new Date(oneHourAgo.getTime() - 25 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-1-3',
      conversationId: 'conv-1',
      senderId: 'barber-1',
      senderType: 'barber',
      content: null,
      messageType: 'offer',
      offerAmount: 100,
      offerStatus: 'rejected',
      createdAt: new Date(oneHourAgo.getTime() - 20 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-1-4',
      conversationId: 'conv-1',
      senderId: 'current-user',
      senderType: 'customer',
      content: null,
      messageType: 'counter_offer',
      offerAmount: 90,
      offerStatus: 'rejected',
      createdAt: new Date(oneHourAgo.getTime() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-1-5',
      conversationId: 'conv-1',
      senderId: 'barber-1',
      senderType: 'barber',
      content: null,
      messageType: 'offer',
      offerAmount: 95,
      offerStatus: 'accepted',
      createdAt: new Date(oneHourAgo.getTime() - 10 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-1-6',
      conversationId: 'conv-1',
      senderId: 'current-user',
      senderType: 'customer',
      content: 'Deal! My address is Dizengoff 150, Tel Aviv.',
      messageType: 'text',
      offerAmount: null,
      offerStatus: null,
      createdAt: new Date(oneHourAgo.getTime() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-1-7',
      conversationId: 'conv-1',
      senderId: 'barber-1',
      senderType: 'barber',
      content: 'Perfect! I can be there in 20 minutes. See you soon!',
      messageType: 'text',
      offerAmount: null,
      offerStatus: null,
      createdAt: oneHourAgo.toISOString(),
    },
  ],
  'conv-2': [
    {
      id: 'msg-2-1',
      conversationId: 'conv-2',
      senderId: 'current-user',
      senderType: 'customer',
      content: 'Looking for a fade haircut. What do you charge?',
      messageType: 'text',
      offerAmount: null,
      offerStatus: null,
      createdAt: new Date(threeHoursAgo.getTime() - 20 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-2-2',
      conversationId: 'conv-2',
      senderId: 'barber-2',
      senderType: 'barber',
      content: null,
      messageType: 'offer',
      offerAmount: 80,
      offerStatus: 'pending',
      createdAt: threeHoursAgo.toISOString(),
    },
  ],
};

export const MOCK_BOOKINGS_CUSTOMER: MockBooking[] = [
  {
    id: 'booking-1',
    barberId: 'barber-1',
    barberName: 'Yossi Cohen',
    barberAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    customerId: 'current-user',
    customerName: 'You',
    customerAvatar: null,
    services: ['Haircut', 'Beard Trim'],
    totalPrice: 95,
    status: 'confirmed',
    scheduledAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    address: 'Dizengoff 150, Tel Aviv',
    createdAt: oneHourAgo.toISOString(),
    completedAt: null,
    rating: null,
    review: null,
  },
  {
    id: 'booking-2',
    barberId: 'barber-4',
    barberName: 'Eli Mizrachi',
    barberAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    customerId: 'current-user',
    customerName: 'You',
    customerAvatar: null,
    services: ['Premium Haircut', 'Hot Towel Shave'],
    totalPrice: 180,
    status: 'completed',
    scheduledAt: yesterday.toISOString(),
    address: 'Rothschild 45, Tel Aviv',
    createdAt: twoDaysAgo.toISOString(),
    completedAt: yesterday.toISOString(),
    rating: 5,
    review: 'Amazing experience! Best barber in the city.',
  },
  {
    id: 'booking-3',
    barberId: 'barber-2',
    barberName: 'David Levi',
    barberAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    customerId: 'current-user',
    customerName: 'You',
    customerAvatar: null,
    services: ['Fade Haircut'],
    totalPrice: 70,
    status: 'completed',
    scheduledAt: oneWeekAgo.toISOString(),
    address: 'Ben Yehuda 88, Tel Aviv',
    createdAt: oneWeekAgo.toISOString(),
    completedAt: oneWeekAgo.toISOString(),
    rating: 4,
    review: null,
  },
  {
    id: 'booking-4',
    barberId: 'barber-3',
    barberName: 'Moshe Goldberg',
    barberAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    customerId: 'current-user',
    customerName: 'You',
    customerAvatar: null,
    services: ['Quick Haircut'],
    totalPrice: 45,
    status: 'cancelled',
    scheduledAt: twoDaysAgo.toISOString(),
    address: 'Allenby 30, Tel Aviv',
    createdAt: new Date(twoDaysAgo.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    completedAt: null,
    rating: null,
    review: null,
  },
];

export const MOCK_BOOKINGS_BARBER: MockBooking[] = [
  {
    id: 'booking-b-1',
    barberId: 'current-barber',
    barberName: 'You',
    barberAvatar: null,
    customerId: 'customer-1',
    customerName: 'Avi Shapira',
    customerAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=200',
    services: ['Haircut', 'Beard Trim'],
    totalPrice: 90,
    status: 'confirmed',
    scheduledAt: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    address: 'Ibn Gabirol 65, Tel Aviv',
    createdAt: threeHoursAgo.toISOString(),
    completedAt: null,
    rating: null,
    review: null,
  },
  {
    id: 'booking-b-2',
    barberId: 'current-barber',
    barberName: 'You',
    barberAvatar: null,
    customerId: 'customer-2',
    customerName: 'Nir Hasson',
    customerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200',
    services: ['Fade Haircut'],
    totalPrice: 70,
    status: 'completed',
    scheduledAt: twoDaysAgo.toISOString(),
    address: 'Frishman 22, Tel Aviv',
    createdAt: new Date(twoDaysAgo.getTime() - 3 * 60 * 60 * 1000).toISOString(),
    completedAt: twoDaysAgo.toISOString(),
    rating: 5,
    review: 'Great service! Will book again.',
  },
];

export const MOCK_SERVICE_REQUESTS: MockServiceRequest[] = [
  {
    id: 'request-1',
    customerId: 'customer-1',
    customerName: 'Avi Shapira',
    customerAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=200',
    customerRating: 4.8,
    services: ['Haircut', 'Beard Trim'],
    address: 'Ibn Gabirol 65, Tel Aviv',
    distanceMeters: 850,
    createdAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
    expiresAt: new Date(now.getTime() + 25 * 60 * 1000).toISOString(),
    offeredPrice: null,
    status: 'new',
  },
  {
    id: 'request-2',
    customerId: 'customer-3',
    customerName: 'Oren Tal',
    customerAvatar: null,
    customerRating: 4.5,
    services: ['Haircut'],
    address: 'Dizengoff 200, Tel Aviv',
    distanceMeters: 1200,
    createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
    expiresAt: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
    offeredPrice: 60,
    status: 'viewed',
  },
  {
    id: 'request-3',
    customerId: 'customer-2',
    customerName: 'Nir Hasson',
    customerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200',
    customerRating: 5.0,
    services: ['Fade Haircut', 'Hair Design'],
    address: 'Rothschild 80, Tel Aviv',
    distanceMeters: 600,
    createdAt: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
    expiresAt: new Date(now.getTime() + 28 * 60 * 1000).toISOString(),
    offeredPrice: null,
    status: 'new',
  },
];

export const MOCK_BARBER_STATS = {
  todayEarnings: 320,
  weeklyEarnings: 2450,
  monthlyEarnings: 9800,
  totalBookings: 156,
  completedToday: 4,
  averageRating: 4.8,
  totalReviews: 89,
  responseRate: 95,
  acceptanceRate: 87,
  pendingRequests: 3,
  upcomingBookings: 2,
};

export const MOCK_SERVICES = [
  { id: 'svc-1', name: 'Haircut', price: 60, duration: 30 },
  { id: 'svc-2', name: 'Beard Trim', price: 35, duration: 15 },
  { id: 'svc-3', name: 'Hot Towel Shave', price: 50, duration: 25 },
  { id: 'svc-4', name: 'Fade Haircut', price: 70, duration: 40 },
  { id: 'svc-5', name: 'Hair Design', price: 40, duration: 20 },
  { id: 'svc-6', name: 'Kids Haircut', price: 45, duration: 25 },
  { id: 'svc-7', name: 'Premium Haircut', price: 100, duration: 45 },
  { id: 'svc-8', name: 'Hair Coloring', price: 150, duration: 60 },
];
