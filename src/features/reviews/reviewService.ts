import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import type {
  Review,
  ReviewPhoto,
  ReviewReply,
  CreateReviewInput,
  ReviewSummary,
  ReviewSortOption,
  ReviewFilters,
  PendingReview,
  ReviewTag,
} from './types';

// Get reviews for a barber
export async function getBarberReviews(
  barberId: string,
  options: {
    sort?: ReviewSortOption;
    filters?: ReviewFilters;
    page?: number;
    limit?: number;
  } = {}
): Promise<Review[]> {
  const { sort = 'most_recent', filters, page = 0, limit = 20 } = options;

  let query = supabase
    .from('reviews')
    .select(
      `
      *,
      customer:profiles!customer_id(display_name, avatar_url),
      service:services(name),
      photos:review_photos(id, url, thumbnail_url, caption, type, order),
      reply:review_replies(id, barber_id, content, created_at),
      helpful:review_helpful(user_id)
    `
    )
    .eq('barber_id', barberId);

  // Apply filters
  if (filters) {
    if (filters.minRating) {
      query = query.gte('rating', filters.minRating);
    }
    if (filters.maxRating) {
      query = query.lte('rating', filters.maxRating);
    }
    if (filters.verified) {
      query = query.eq('is_verified', true);
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }
  }

  // Apply sorting
  switch (sort) {
    case 'highest_rated':
      query = query.order('rating', { ascending: false });
      break;
    case 'lowest_rated':
      query = query.order('rating', { ascending: true });
      break;
    case 'most_helpful':
      query = query.order('helpful_count', { ascending: false });
      break;
    case 'with_photos':
      // Filter for reviews with photos, then sort by date
      query = query
        .not('photos', 'is', null)
        .order('created_at', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  query = query.range(page * limit, (page + 1) * limit - 1);

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map((r: any) => mapReviewFromDb(r));
}

// Get review by ID
export async function getReviewById(reviewId: string): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select(
      `
      *,
      customer:profiles!customer_id(display_name, avatar_url),
      barber:profiles!barber_id(display_name),
      service:services(name),
      photos:review_photos(id, url, thumbnail_url, caption, type, order),
      reply:review_replies(id, barber_id, content, created_at, barber:profiles!barber_id(display_name, avatar_url)),
      helpful:review_helpful(user_id)
    `
    )
    .eq('id', reviewId)
    .single();

  if (error) return null;

  return mapReviewFromDb(data);
}

function mapReviewFromDb(r: any, currentUserId?: string): Review {
  return {
    id: r.id,
    bookingId: r.booking_id,
    customerId: r.customer_id,
    customerName: r.customer?.display_name || 'Anonymous',
    customerAvatar: r.customer?.avatar_url,
    barberId: r.barber_id,
    barberName: r.barber?.display_name || '',
    rating: r.rating,
    title: r.title,
    content: r.content,
    photos: (r.photos || [])
      .sort((a: any, b: any) => a.order - b.order)
      .map((p: any) => ({
        id: p.id,
        url: p.url,
        thumbnailUrl: p.thumbnail_url,
        caption: p.caption,
        type: p.type,
        order: p.order,
      })),
    serviceName: r.service?.name || '',
    serviceId: r.service_id,
    helpfulCount: r.helpful_count || (r.helpful || []).length,
    replyCount: r.reply ? 1 : 0,
    isHelpful: currentUserId
      ? (r.helpful || []).some((h: any) => h.user_id === currentUserId)
      : false,
    barberReply: r.reply?.[0]
      ? {
          id: r.reply[0].id,
          barberId: r.reply[0].barber_id,
          barberName: r.reply[0].barber?.display_name || '',
          barberAvatar: r.reply[0].barber?.avatar_url,
          content: r.reply[0].content,
          createdAt: r.reply[0].created_at,
        }
      : undefined,
    tags: r.tags || [],
    isVerified: r.is_verified,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// Create a review
export async function createReview(
  customerId: string,
  input: CreateReviewInput
): Promise<Review> {
  // Upload photos first
  const uploadedPhotos: { url: string; type: string }[] = [];

  if (input.photos && input.photos.length > 0) {
    for (const photo of input.photos) {
      const fileExt = photo.uri.split('.').pop();
      const fileName = `${customerId}/${input.bookingId}/${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.${fileExt}`;

      const base64 = await FileSystem.readAsStringAsync(photo.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { error: uploadError } = await supabase.storage
        .from('review-photos')
        .upload(fileName, decode(base64), {
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        console.error('Photo upload error:', uploadError);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('review-photos').getPublicUrl(fileName);

      uploadedPhotos.push({
        url: publicUrl,
        type: photo.type,
      });
    }
  }

  // Create review
  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      booking_id: input.bookingId,
      customer_id: customerId,
      barber_id: input.barberId,
      service_id: input.serviceId,
      rating: input.rating,
      title: input.title,
      content: input.content,
      tags: input.tags || [],
      is_verified: true, // Coming from a real booking
    })
    .select()
    .single();

  if (error) throw error;

  // Add photos
  if (uploadedPhotos.length > 0) {
    const photoInserts = uploadedPhotos.map((p, index) => ({
      review_id: review.id,
      url: p.url,
      type: p.type,
      order: index,
    }));

    await supabase.from('review_photos').insert(photoInserts);
  }

  // Update barber's average rating
  await updateBarberRating(input.barberId);

  // Get the full review
  const fullReview = await getReviewById(review.id);
  if (!fullReview) throw new Error('Failed to create review');

  return fullReview;
}

// Helper to decode base64
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Update review
export async function updateReview(
  reviewId: string,
  updates: { title?: string; content?: string; rating?: number; tags?: ReviewTag[] }
): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId);

  if (error) throw error;
}

// Delete review
export async function deleteReview(reviewId: string): Promise<void> {
  // Get review to find barber ID
  const { data: review } = await supabase
    .from('reviews')
    .select('barber_id')
    .eq('id', reviewId)
    .single();

  const { error } = await supabase.from('reviews').delete().eq('id', reviewId);

  if (error) throw error;

  // Update barber's average rating
  if (review) {
    await updateBarberRating(review.barber_id);
  }
}

// Mark review as helpful
export async function markReviewHelpful(
  userId: string,
  reviewId: string
): Promise<void> {
  const { error } = await supabase.from('review_helpful').upsert({
    user_id: userId,
    review_id: reviewId,
  });

  if (error) throw error;

  // Update helpful count
  await supabase.rpc('increment_helpful_count', { review_id: reviewId });
}

// Unmark review as helpful
export async function unmarkReviewHelpful(
  userId: string,
  reviewId: string
): Promise<void> {
  const { error } = await supabase
    .from('review_helpful')
    .delete()
    .eq('user_id', userId)
    .eq('review_id', reviewId);

  if (error) throw error;

  // Update helpful count
  await supabase.rpc('decrement_helpful_count', { review_id: reviewId });
}

// Barber reply to review
export async function replyToReview(
  barberId: string,
  reviewId: string,
  content: string
): Promise<ReviewReply> {
  const { data, error } = await supabase
    .from('review_replies')
    .insert({
      review_id: reviewId,
      barber_id: barberId,
      content,
    })
    .select('*, barber:profiles!barber_id(display_name, avatar_url)')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    barberId: data.barber_id,
    barberName: data.barber?.display_name || '',
    barberAvatar: data.barber?.avatar_url,
    content: data.content,
    createdAt: data.created_at,
  };
}

// Get review summary for barber
export async function getReviewSummary(barberId: string): Promise<ReviewSummary> {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('rating, tags, is_verified, photos:review_photos(id)')
    .eq('barber_id', barberId);

  if (error) throw error;

  const allReviews = reviews || [];
  const totalReviews = allReviews.length;

  if (totalReviews === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      topTags: [],
      photosCount: 0,
      verifiedCount: 0,
    };
  }

  // Calculate average
  const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = sum / totalReviews;

  // Calculate distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  allReviews.forEach((r) => {
    distribution[r.rating as keyof typeof distribution]++;
  });

  // Count tags
  const tagCounts: Record<string, number> = {};
  allReviews.forEach((r) => {
    (r.tags || []).forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const topTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag: tag as ReviewTag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Count photos
  const photosCount = allReviews.reduce(
    (acc, r) => acc + ((r.photos as any[]) || []).length,
    0
  );

  // Count verified
  const verifiedCount = allReviews.filter((r) => r.is_verified).length;

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
    ratingDistribution: distribution,
    topTags,
    photosCount,
    verifiedCount,
  };
}

// Get pending reviews for customer
export async function getPendingReviews(customerId: string): Promise<PendingReview[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      id,
      date,
      barber_id,
      barber:profiles!barber_id(display_name, avatar_url),
      service:services(id, name),
      review:reviews(id)
    `
    )
    .eq('customer_id', customerId)
    .eq('status', 'completed')
    .gte('date', sevenDaysAgo)
    .is('review', null);

  if (error) throw error;

  return (data || []).map((b: any) => {
    const bookingDate = new Date(b.date);
    const expiryDate = new Date(bookingDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const daysRemaining = Math.ceil(
      (expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    );

    return {
      bookingId: b.id,
      barberId: b.barber_id,
      barberName: b.barber?.display_name || 'Unknown',
      barberAvatar: b.barber?.avatar_url,
      serviceName: b.service?.name || 'Unknown',
      serviceId: b.service?.id,
      bookingDate: b.date,
      daysRemaining: Math.max(0, daysRemaining),
    };
  });
}

// Get customer's reviews
export async function getCustomerReviews(customerId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(
      `
      *,
      barber:profiles!barber_id(display_name),
      service:services(name),
      photos:review_photos(id, url, thumbnail_url, caption, type, order),
      reply:review_replies(id, barber_id, content, created_at)
    `
    )
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((r: any) => mapReviewFromDb(r, customerId));
}

// Update barber's average rating
async function updateBarberRating(barberId: string): Promise<void> {
  const { data } = await supabase
    .from('reviews')
    .select('rating')
    .eq('barber_id', barberId);

  if (!data || data.length === 0) {
    await supabase
      .from('barber_profiles')
      .update({ average_rating: 0, review_count: 0 })
      .eq('user_id', barberId);
    return;
  }

  const avgRating =
    data.reduce((sum, r) => sum + r.rating, 0) / data.length;

  await supabase
    .from('barber_profiles')
    .update({
      average_rating: Math.round(avgRating * 10) / 10,
      review_count: data.length,
    })
    .eq('user_id', barberId);
}

// Report a review
export async function reportReview(
  userId: string,
  reviewId: string,
  reason: string
): Promise<void> {
  const { error } = await supabase.from('review_reports').insert({
    user_id: userId,
    review_id: reviewId,
    reason,
  });

  if (error) throw error;
}

export default {
  getBarberReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  unmarkReviewHelpful,
  replyToReview,
  getReviewSummary,
  getPendingReviews,
  getCustomerReviews,
  reportReview,
};
