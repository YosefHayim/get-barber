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
  homeServiceAvailable: boolean;
  homeServiceSurcharge: number;
  instagramUrl?: string;
  whatsappNumber?: string;
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
    homeServiceAvailable: true,
    homeServiceSurcharge: 30,
    instagramUrl: 'https://instagram.com/yossi_barber',
    whatsappNumber: '+972501234567',
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
    homeServiceAvailable: true,
    homeServiceSurcharge: 25,
    instagramUrl: 'https://instagram.com/davidthebarber_tlv',
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
    homeServiceAvailable: false,
    homeServiceSurcharge: 0,
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
    homeServiceAvailable: true,
    homeServiceSurcharge: 50,
    instagramUrl: 'https://instagram.com/eli_premium_barber',
    whatsappNumber: '+972509876543',
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

export type ClientTag = 'vip' | 'regular' | 'new' | 'preferred' | 'difficult';

export interface MockClient {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  phone: string;
  email: string | null;
  isVip: boolean;
  tags: ClientTag[];
  totalBookings: number;
  totalSpent: number;
  averageRating: number;
  lastVisit: string | null;
  firstVisit: string;
  preferredServices: string[];
  notes: ClientNote[];
  bookingHistory: ClientBooking[];
}

export interface ClientNote {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientBooking {
  id: string;
  services: string[];
  totalPrice: number;
  date: string;
  rating: number | null;
  review: string | null;
}

const clientOneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const clientTwoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
const clientOneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const clientTwoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
const clientThreeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
const clientSixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

export const MOCK_CLIENTS: MockClient[] = [
  {
    id: 'client-1',
    displayName: 'Avi Shapira',
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=200',
    phone: '+972-50-123-4567',
    email: 'avi.shapira@gmail.com',
    isVip: true,
    tags: ['vip', 'regular'],
    totalBookings: 24,
    totalSpent: 2160,
    averageRating: 4.9,
    lastVisit: clientOneWeekAgo.toISOString(),
    firstVisit: clientSixMonthsAgo.toISOString(),
    preferredServices: ['Haircut', 'Beard Trim'],
    notes: [
      {
        id: 'note-1',
        content: 'Prefers scissors over clippers. Very particular about sideburns length.',
        createdAt: clientTwoMonthsAgo.toISOString(),
        updatedAt: clientTwoMonthsAgo.toISOString(),
      },
      {
        id: 'note-2',
        content: 'Works from home on Tuesdays - flexible for morning appointments.',
        createdAt: clientOneMonthAgo.toISOString(),
        updatedAt: clientOneMonthAgo.toISOString(),
      },
    ],
    bookingHistory: [
      { id: 'bh-1', services: ['Haircut', 'Beard Trim'], totalPrice: 95, date: clientOneWeekAgo.toISOString(), rating: 5, review: 'Perfect as always!' },
      { id: 'bh-2', services: ['Haircut'], totalPrice: 60, date: clientTwoWeeksAgo.toISOString(), rating: 5, review: null },
      { id: 'bh-3', services: ['Haircut', 'Beard Trim'], totalPrice: 95, date: clientOneMonthAgo.toISOString(), rating: 5, review: 'Great service' },
    ],
  },
  {
    id: 'client-2',
    displayName: 'Nir Hasson',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200',
    phone: '+972-52-987-6543',
    email: 'nir.h@outlook.com',
    isVip: true,
    tags: ['vip', 'preferred'],
    totalBookings: 18,
    totalSpent: 1890,
    averageRating: 5.0,
    lastVisit: clientTwoWeeksAgo.toISOString(),
    firstVisit: clientThreeMonthsAgo.toISOString(),
    preferredServices: ['Fade Haircut', 'Hair Design'],
    notes: [
      {
        id: 'note-3',
        content: 'Likes modern styles. Check his Instagram @nir_styles for reference.',
        createdAt: clientTwoMonthsAgo.toISOString(),
        updatedAt: clientOneMonthAgo.toISOString(),
      },
    ],
    bookingHistory: [
      { id: 'bh-4', services: ['Fade Haircut', 'Hair Design'], totalPrice: 110, date: clientTwoWeeksAgo.toISOString(), rating: 5, review: 'Incredible work!' },
      { id: 'bh-5', services: ['Fade Haircut'], totalPrice: 70, date: clientOneMonthAgo.toISOString(), rating: 5, review: null },
    ],
  },
  {
    id: 'client-3',
    displayName: 'Oren Tal',
    avatarUrl: null,
    phone: '+972-54-555-1234',
    email: null,
    isVip: false,
    tags: ['new'],
    totalBookings: 2,
    totalSpent: 130,
    averageRating: 4.5,
    lastVisit: clientOneMonthAgo.toISOString(),
    firstVisit: clientTwoMonthsAgo.toISOString(),
    preferredServices: ['Haircut'],
    notes: [],
    bookingHistory: [
      { id: 'bh-6', services: ['Haircut'], totalPrice: 60, date: clientOneMonthAgo.toISOString(), rating: 4, review: 'Good cut' },
      { id: 'bh-7', services: ['Haircut', 'Beard Trim'], totalPrice: 70, date: clientTwoMonthsAgo.toISOString(), rating: 5, review: null },
    ],
  },
  {
    id: 'client-4',
    displayName: 'Yonatan Levy',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    phone: '+972-50-111-2222',
    email: 'yonatan.levy@company.com',
    isVip: false,
    tags: ['regular', 'preferred'],
    totalBookings: 12,
    totalSpent: 1080,
    averageRating: 4.8,
    lastVisit: clientTwoWeeksAgo.toISOString(),
    firstVisit: clientSixMonthsAgo.toISOString(),
    preferredServices: ['Premium Haircut', 'Hot Towel Shave'],
    notes: [
      {
        id: 'note-4',
        content: 'Always tips well. Prefers late afternoon appointments.',
        createdAt: clientThreeMonthsAgo.toISOString(),
        updatedAt: clientThreeMonthsAgo.toISOString(),
      },
    ],
    bookingHistory: [
      { id: 'bh-8', services: ['Premium Haircut', 'Hot Towel Shave'], totalPrice: 150, date: clientTwoWeeksAgo.toISOString(), rating: 5, review: 'Best shave ever!' },
      { id: 'bh-9', services: ['Haircut'], totalPrice: 60, date: clientOneMonthAgo.toISOString(), rating: 5, review: null },
    ],
  },
  {
    id: 'client-5',
    displayName: 'Gal Stern',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    phone: '+972-54-333-4444',
    email: 'gal.stern@tech.io',
    isVip: false,
    tags: ['regular'],
    totalBookings: 8,
    totalSpent: 560,
    averageRating: 4.6,
    lastVisit: clientThreeMonthsAgo.toISOString(),
    firstVisit: clientSixMonthsAgo.toISOString(),
    preferredServices: ['Haircut'],
    notes: [
      {
        id: 'note-5',
        content: 'Sensitive scalp - use gentle products.',
        createdAt: clientSixMonthsAgo.toISOString(),
        updatedAt: clientSixMonthsAgo.toISOString(),
      },
    ],
    bookingHistory: [
      { id: 'bh-10', services: ['Haircut'], totalPrice: 60, date: clientThreeMonthsAgo.toISOString(), rating: 4, review: null },
    ],
  },
  {
    id: 'client-6',
    displayName: 'Daniel Cohen',
    avatarUrl: null,
    phone: '+972-52-666-7777',
    email: 'dcohen@email.com',
    isVip: false,
    tags: ['difficult'],
    totalBookings: 5,
    totalSpent: 375,
    averageRating: 3.8,
    lastVisit: clientTwoMonthsAgo.toISOString(),
    firstVisit: clientThreeMonthsAgo.toISOString(),
    preferredServices: ['Haircut', 'Beard Trim'],
    notes: [
      {
        id: 'note-6',
        content: 'Often changes mind during the cut. Needs extra confirmation before starting.',
        createdAt: clientTwoMonthsAgo.toISOString(),
        updatedAt: clientTwoMonthsAgo.toISOString(),
      },
    ],
    bookingHistory: [
      { id: 'bh-11', services: ['Haircut', 'Beard Trim'], totalPrice: 95, date: clientTwoMonthsAgo.toISOString(), rating: 3, review: 'Good but not what I asked for' },
    ],
  },
];

export const CLIENT_TAG_CONFIG: Record<ClientTag, { label: string; color: string; bgColor: string }> = {
  vip: { label: 'VIP', color: '#DAA520', bgColor: 'rgba(218, 165, 32, 0.15)' },
  regular: { label: 'Regular', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  new: { label: 'New', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  preferred: { label: 'Preferred', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.15)' },
  difficult: { label: 'Difficult', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
};

import type {
  AdCampaign,
  AdCampaignStatus,
  BarberWallet,
  WalletTransaction,
  CampaignStats,
} from '@/types/advertising.types';

const campaignStartDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
const campaignEndDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

export const MOCK_CAMPAIGNS: AdCampaign[] = [
  {
    id: 'campaign-1',
    barberId: 'current-barber',
    campaignType: 'featured_placement',
    status: 'active',
    dailyBudgetCents: 5000,
    totalBudgetCents: 50000,
    spentCents: 18500,
    targetAreaCenter: { latitude: 32.0853, longitude: 34.7818 },
    targetAreaRadiusKm: 5,
    targetNeighborhoods: ['Dizengoff', 'Rothschild', 'Florentin'],
    startDate: campaignStartDate.toISOString(),
    endDate: campaignEndDate.toISOString(),
    slotPosition: 1,
    pricePadDayCents: 5000,
    title: 'Premium Barber Services',
    description: 'Get 15% off your first visit!',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'campaign-2',
    barberId: 'current-barber',
    campaignType: 'search_boost',
    status: 'active',
    dailyBudgetCents: 2000,
    totalBudgetCents: 20000,
    spentCents: 6200,
    targetAreaCenter: { latitude: 32.0853, longitude: 34.7818 },
    targetAreaRadiusKm: 10,
    targetNeighborhoods: [],
    startDate: campaignStartDate.toISOString(),
    endDate: campaignEndDate.toISOString(),
    slotPosition: null,
    pricePadDayCents: null,
    title: 'Search Visibility Boost',
    description: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'campaign-3',
    barberId: 'current-barber',
    campaignType: 'push_notification',
    status: 'completed',
    dailyBudgetCents: 1000,
    totalBudgetCents: 5000,
    spentCents: 5000,
    targetAreaCenter: { latitude: 32.0853, longitude: 34.7818 },
    targetAreaRadiusKm: 3,
    targetNeighborhoods: ['Dizengoff'],
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    slotPosition: null,
    pricePadDayCents: null,
    title: 'Weekend Special',
    description: 'Book this weekend and save!',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'campaign-4',
    barberId: 'current-barber',
    campaignType: 'area_dominance',
    status: 'paused',
    dailyBudgetCents: 15000,
    totalBudgetCents: 150000,
    spentCents: 45000,
    targetAreaCenter: { latitude: 32.0853, longitude: 34.7818 },
    targetAreaRadiusKm: 2,
    targetNeighborhoods: ['Florentin'],
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    slotPosition: null,
    pricePadDayCents: null,
    title: 'Florentin Exclusive',
    description: 'The #1 barber in Florentin',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_WALLET: BarberWallet = {
  id: 'wallet-1',
  barberId: 'current-barber',
  balanceCents: 125000,
  totalDepositedCents: 500000,
  totalSpentCents: 375000,
  autoReplenish: true,
  autoReplenishAmountCents: 50000,
  autoReplenishThresholdCents: 10000,
  createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
};

export const MOCK_WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'txn-1',
    walletId: 'wallet-1',
    transactionType: 'deposit',
    amountCents: 50000,
    balanceAfterCents: 125000,
    description: 'Auto-replenish',
    referenceId: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn-2',
    walletId: 'wallet-1',
    transactionType: 'ad_spend',
    amountCents: -5000,
    balanceAfterCents: 75000,
    description: 'Featured Placement - Daily charge',
    referenceId: 'campaign-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn-3',
    walletId: 'wallet-1',
    transactionType: 'ad_spend',
    amountCents: -2000,
    balanceAfterCents: 73000,
    description: 'Search Boost - Daily charge',
    referenceId: 'campaign-2',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn-4',
    walletId: 'wallet-1',
    transactionType: 'bonus',
    amountCents: 10000,
    balanceAfterCents: 80000,
    description: 'Welcome bonus',
    referenceId: null,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn-5',
    walletId: 'wallet-1',
    transactionType: 'deposit',
    amountCents: 100000,
    balanceAfterCents: 70000,
    description: 'Credit card deposit',
    referenceId: null,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_CAMPAIGN_STATS: Record<string, CampaignStats> = {
  'campaign-1': {
    impressions: 2450,
    clicks: 189,
    bookings: 12,
    spent: 185,
    ctr: 7.7,
    conversionRate: 6.3,
    costPerBooking: 15.42,
  },
  'campaign-2': {
    impressions: 1820,
    clicks: 95,
    bookings: 6,
    spent: 62,
    ctr: 5.2,
    conversionRate: 6.3,
    costPerBooking: 10.33,
  },
  'campaign-3': {
    impressions: 850,
    clicks: 72,
    bookings: 8,
    spent: 50,
    ctr: 8.5,
    conversionRate: 11.1,
    costPerBooking: 6.25,
  },
  'campaign-4': {
    impressions: 3200,
    clicks: 245,
    bookings: 18,
    spent: 450,
    ctr: 7.7,
    conversionRate: 7.3,
    costPerBooking: 25.0,
  },
};

export const AD_STATUS_CONFIG: Record<AdCampaignStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Draft', color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.15)' },
  pending_approval: { label: 'Pending', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.15)' },
  active: { label: 'Active', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  paused: { label: 'Paused', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  completed: { label: 'Completed', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.15)' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
};

import type {
  LoyaltyAccount,
  LoyaltyTransaction,
  ReferralCode,
} from '@/types/loyalty.types';

export const MOCK_LOYALTY_ACCOUNT: LoyaltyAccount = {
  id: 'loyalty-1',
  customerId: 'current-user',
  currentTier: 'gold',
  totalPoints: 2450,
  availablePoints: 1850,
  lifetimeBookings: 28,
  lifetimeSpendCents: 525000,
  tierUpdatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
};

export const MOCK_LOYALTY_TRANSACTIONS: LoyaltyTransaction[] = [
  {
    id: 'ltxn-1',
    accountId: 'loyalty-1',
    transactionType: 'earned',
    points: 95,
    balanceAfter: 1850,
    description: 'Haircut + Beard Trim with Yossi Cohen',
    referenceType: 'booking',
    referenceId: 'booking-1',
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ltxn-2',
    accountId: 'loyalty-1',
    transactionType: 'redeemed',
    points: -500,
    balanceAfter: 1755,
    description: 'Redeemed for ₪50 discount',
    referenceType: 'redemption',
    referenceId: 'redeem-1',
    expiresAt: null,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ltxn-3',
    accountId: 'loyalty-1',
    transactionType: 'referral',
    points: 200,
    balanceAfter: 2255,
    description: 'Friend Nir joined via your referral',
    referenceType: 'referral',
    referenceId: 'ref-1',
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ltxn-4',
    accountId: 'loyalty-1',
    transactionType: 'bonus',
    points: 100,
    balanceAfter: 2055,
    description: 'Tier upgrade bonus - Welcome to Gold!',
    referenceType: 'tier',
    referenceId: 'gold',
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ltxn-5',
    accountId: 'loyalty-1',
    transactionType: 'earned',
    points: 180,
    balanceAfter: 1955,
    description: 'Premium Haircut + Hot Towel Shave',
    referenceType: 'booking',
    referenceId: 'booking-2',
    expiresAt: new Date(Date.now() + 330 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ltxn-6',
    accountId: 'loyalty-1',
    transactionType: 'earned',
    points: 50,
    balanceAfter: 1775,
    description: 'Left a review for David Levi',
    referenceType: 'review',
    referenceId: 'review-1',
    expiresAt: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_REFERRAL_CODE: ReferralCode = {
  id: 'refcode-1',
  userId: 'current-user',
  code: 'FRIEND50',
  usesCount: 3,
  maxUses: null,
  isActive: true,
  createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
};

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  isAvailable: boolean;
}

export const MOCK_REWARDS: RewardItem[] = [
  {
    id: 'reward-1',
    title: '₪25 Off',
    description: 'Get ₪25 off your next booking',
    pointsCost: 250,
    discountValue: 25,
    discountType: 'fixed',
    isAvailable: true,
  },
  {
    id: 'reward-2',
    title: '₪50 Off',
    description: 'Get ₪50 off your next booking',
    pointsCost: 500,
    discountValue: 50,
    discountType: 'fixed',
    isAvailable: true,
  },
  {
    id: 'reward-3',
    title: 'Free Beard Trim',
    description: 'Get a free beard trim with any haircut',
    pointsCost: 350,
    discountValue: 35,
    discountType: 'fixed',
    isAvailable: true,
  },
  {
    id: 'reward-4',
    title: '20% Off',
    description: 'Get 20% off your next booking',
    pointsCost: 800,
    discountValue: 20,
    discountType: 'percentage',
    isAvailable: true,
  },
  {
    id: 'reward-5',
    title: 'Free Haircut',
    description: 'Redeem for a free standard haircut',
    pointsCost: 1500,
    discountValue: 60,
    discountType: 'fixed',
    isAvailable: true,
  },
];

export type NotificationType = 
  | 'booking_confirmed'
  | 'booking_reminder'
  | 'booking_completed'
  | 'booking_cancelled'
  | 'message'
  | 'review_request'
  | 'promotion'
  | 'loyalty'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: {
    barberId?: string;
    barberName?: string;
    barberAvatar?: string;
    bookingId?: string;
    points?: number;
  };
  createdAt: string;
}

export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, {
  icon: string;
  color: string;
  bgColor: string;
}> = {
  booking_confirmed: { icon: 'calendar-check', color: '#10B981', bgColor: '#D1FAE5' },
  booking_reminder: { icon: 'clock', color: '#3B82F6', bgColor: '#DBEAFE' },
  booking_completed: { icon: 'check-circle', color: '#059669', bgColor: '#D1FAE5' },
  booking_cancelled: { icon: 'x-circle', color: '#EF4444', bgColor: '#FEE2E2' },
  message: { icon: 'message-circle', color: '#8B5CF6', bgColor: '#EDE9FE' },
  review_request: { icon: 'star', color: '#F59E0B', bgColor: '#FEF3C7' },
  promotion: { icon: 'gift', color: '#EC4899', bgColor: '#FCE7F3' },
  loyalty: { icon: 'award', color: '#DAA520', bgColor: 'rgba(218, 165, 32, 0.15)' },
  system: { icon: 'info', color: '#6B7280', bgColor: '#F3F4F6' },
};

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    body: 'Your appointment with Yossi Cohen for tomorrow at 10:00 AM has been confirmed.',
    isRead: false,
    actionUrl: '/bookings',
    metadata: {
      barberId: 'barber-1',
      barberName: 'Yossi Cohen',
      barberAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      bookingId: 'booking-1',
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    type: 'message',
    title: 'New Message',
    body: 'David Levi sent you a message: "Looking forward to seeing you!"',
    isRead: false,
    actionUrl: '/messages',
    metadata: {
      barberId: 'barber-2',
      barberName: 'David Levi',
      barberAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    type: 'loyalty',
    title: 'Points Earned!',
    body: 'You earned 95 points from your last booking. You now have 1,850 available points!',
    isRead: false,
    actionUrl: '/loyalty',
    metadata: {
      points: 95,
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-4',
    type: 'booking_reminder',
    title: 'Appointment Tomorrow',
    body: 'Reminder: You have an appointment with Yossi Cohen tomorrow at 10:00 AM',
    isRead: true,
    actionUrl: '/bookings',
    metadata: {
      barberId: 'barber-1',
      barberName: 'Yossi Cohen',
      bookingId: 'booking-1',
    },
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-5',
    type: 'review_request',
    title: 'How was your haircut?',
    body: 'Leave a review for Moshe Peretz and earn 50 bonus points!',
    isRead: true,
    actionUrl: '/reviews',
    metadata: {
      barberId: 'barber-3',
      barberName: 'Moshe Peretz',
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-6',
    type: 'promotion',
    title: '20% Off This Weekend!',
    body: 'Book any service this weekend and get 20% off. Use code WEEKEND20',
    isRead: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-7',
    type: 'booking_completed',
    title: 'Booking Completed',
    body: 'Your appointment with Moshe Peretz has been completed. Thanks for using BarberConnect!',
    isRead: true,
    metadata: {
      barberId: 'barber-3',
      barberName: 'Moshe Peretz',
      bookingId: 'booking-3',
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-8',
    type: 'system',
    title: 'Welcome to Gold Tier!',
    body: 'Congratulations! You\'ve been upgraded to Gold tier. Enjoy 1.5x points and 10% off all bookings.',
    isRead: true,
    actionUrl: '/loyalty',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
