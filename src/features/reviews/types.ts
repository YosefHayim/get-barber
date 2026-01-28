// Review System Types

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  barberId: string;
  barberName: string;
  rating: number; // 1-5
  title?: string;
  content: string;
  photos: ReviewPhoto[];
  serviceName: string;
  serviceId: string;
  helpfulCount: number;
  replyCount: number;
  isHelpful: boolean; // Current user marked as helpful
  barberReply?: ReviewReply;
  tags: ReviewTag[];
  isVerified: boolean; // Verified purchase
  createdAt: string;
  updatedAt: string;
}

export interface ReviewPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  type: 'before' | 'after' | 'general';
  order: number;
}

export interface ReviewReply {
  id: string;
  barberId: string;
  barberName: string;
  barberAvatar?: string;
  content: string;
  createdAt: string;
}

export type ReviewTag =
  | 'great_cut'
  | 'friendly'
  | 'on_time'
  | 'clean_shop'
  | 'good_value'
  | 'skilled'
  | 'patient'
  | 'professional'
  | 'would_recommend'
  | 'great_conversation';

export const REVIEW_TAGS: { value: ReviewTag; label: string }[] = [
  { value: 'great_cut', label: 'Great Cut' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'on_time', label: 'On Time' },
  { value: 'clean_shop', label: 'Clean Shop' },
  { value: 'good_value', label: 'Good Value' },
  { value: 'skilled', label: 'Skilled' },
  { value: 'patient', label: 'Patient' },
  { value: 'professional', label: 'Professional' },
  { value: 'would_recommend', label: 'Would Recommend' },
  { value: 'great_conversation', label: 'Great Conversation' },
];

export interface CreateReviewInput {
  bookingId: string;
  barberId: string;
  serviceId: string;
  rating: number;
  title?: string;
  content: string;
  photos?: { uri: string; type: 'before' | 'after' | 'general' }[];
  tags?: ReviewTag[];
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  topTags: { tag: ReviewTag; count: number }[];
  photosCount: number;
  verifiedCount: number;
}

export type ReviewSortOption =
  | 'most_recent'
  | 'highest_rated'
  | 'lowest_rated'
  | 'most_helpful'
  | 'with_photos';

export interface ReviewFilters {
  minRating?: number;
  maxRating?: number;
  withPhotos?: boolean;
  tags?: ReviewTag[];
  verified?: boolean;
}

export interface PendingReview {
  bookingId: string;
  barberId: string;
  barberName: string;
  barberAvatar?: string;
  serviceName: string;
  serviceId: string;
  bookingDate: string;
  daysRemaining: number; // Days left to leave review
}
