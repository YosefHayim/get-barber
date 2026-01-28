import { supabase } from '@/lib/supabase';
import { Share, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import type {
  FollowProfile,
  Story,
  StoryGroup,
  CreateStoryInput,
  ShareContent,
  FeedItem,
  Comment,
  SocialStats,
} from './types';

// ==================== FOLLOW SYSTEM ====================

// Follow a user
export async function followUser(
  followerId: string,
  followingId: string
): Promise<void> {
  const { error } = await supabase.from('follows').insert({
    follower_id: followerId,
    following_id: followingId,
  });

  if (error) throw error;
}

// Unfollow a user
export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<void> {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);

  if (error) throw error;
}

// Check if following
export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

// Get followers
export async function getFollowers(
  userId: string,
  limit: number = 50
): Promise<FollowProfile[]> {
  const { data, error } = await supabase
    .from('follows')
    .select(
      `
      follower:profiles!follower_id(
        id,
        display_name,
        avatar_url,
        user_type
      )
    `
    )
    .eq('following_id', userId)
    .limit(limit);

  if (error) throw error;

  return (data || []).map((item: any) => ({
    id: item.follower.id,
    name: item.follower.display_name,
    avatar: item.follower.avatar_url,
    isBarber: item.follower.user_type === 'barber',
    followersCount: 0,
    followingCount: 0,
    isFollowing: false,
  }));
}

// Get following
export async function getFollowing(
  userId: string,
  limit: number = 50
): Promise<FollowProfile[]> {
  const { data, error } = await supabase
    .from('follows')
    .select(
      `
      following:profiles!following_id(
        id,
        display_name,
        avatar_url,
        user_type
      )
    `
    )
    .eq('follower_id', userId)
    .limit(limit);

  if (error) throw error;

  return (data || []).map((item: any) => ({
    id: item.following.id,
    name: item.following.display_name,
    avatar: item.following.avatar_url,
    isBarber: item.following.user_type === 'barber',
    followersCount: 0,
    followingCount: 0,
    isFollowing: true,
  }));
}

// Get follow counts
export async function getFollowCounts(
  userId: string
): Promise<{ followers: number; following: number }> {
  const [followersResult, followingResult] = await Promise.all([
    supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', userId),
    supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', userId),
  ]);

  return {
    followers: followersResult.count || 0,
    following: followingResult.count || 0,
  };
}

// ==================== STORIES ====================

// Get stories from followed users
export async function getStories(userId: string): Promise<StoryGroup[]> {
  const twentyFourHoursAgo = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  ).toISOString();

  // Get users we follow
  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  const followingIds = (following || []).map((f) => f.following_id);
  followingIds.push(userId); // Include own stories

  // Get stories from those users
  const { data: stories, error } = await supabase
    .from('stories')
    .select(
      `
      *,
      user:profiles!user_id(display_name, avatar_url, user_type),
      views:story_views(user_id),
      likes:story_likes(user_id)
    `
    )
    .in('user_id', followingIds)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Group by user
  const groupedMap = new Map<string, StoryGroup>();

  for (const story of stories || []) {
    const group = groupedMap.get(story.user_id) || {
      userId: story.user_id,
      userName: story.user?.display_name || 'Unknown',
      userAvatar: story.user?.avatar_url,
      isBarber: story.user?.user_type === 'barber',
      stories: [],
      hasUnviewed: false,
      latestStoryAt: story.created_at,
    };

    const isViewed = (story.views || []).some((v: any) => v.user_id === userId);
    const isLiked = (story.likes || []).some((l: any) => l.user_id === userId);

    group.stories.push({
      id: story.id,
      userId: story.user_id,
      userName: story.user?.display_name || 'Unknown',
      userAvatar: story.user?.avatar_url,
      isBarber: story.user?.user_type === 'barber',
      mediaUrl: story.media_url,
      mediaType: story.media_type,
      thumbnailUrl: story.thumbnail_url,
      caption: story.caption,
      duration: story.duration || (story.media_type === 'video' ? 15 : 5),
      viewCount: (story.views || []).length,
      likeCount: (story.likes || []).length,
      isViewed,
      isLiked,
      createdAt: story.created_at,
      expiresAt: story.expires_at,
    });

    if (!isViewed) {
      group.hasUnviewed = true;
    }

    groupedMap.set(story.user_id, group);
  }

  // Sort: own stories first, then unviewed, then most recent
  return Array.from(groupedMap.values()).sort((a, b) => {
    if (a.userId === userId) return -1;
    if (b.userId === userId) return 1;
    if (a.hasUnviewed && !b.hasUnviewed) return -1;
    if (!a.hasUnviewed && b.hasUnviewed) return 1;
    return new Date(b.latestStoryAt).getTime() - new Date(a.latestStoryAt).getTime();
  });
}

// Create a story
export async function createStory(
  userId: string,
  input: CreateStoryInput
): Promise<Story> {
  // Upload media to storage
  const fileExt = input.mediaUri.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  // Read file as base64
  const base64 = await FileSystem.readAsStringAsync(input.mediaUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const { error: uploadError } = await supabase.storage
    .from('stories')
    .upload(fileName, decode(base64), {
      contentType: input.mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('stories').getPublicUrl(fileName);

  // Create story record
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('stories')
    .insert({
      user_id: userId,
      media_url: publicUrl,
      media_type: input.mediaType,
      caption: input.caption,
      duration: input.mediaType === 'video' ? 15 : 5,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    userName: '',
    mediaUrl: data.media_url,
    mediaType: data.media_type,
    caption: data.caption,
    duration: data.duration,
    viewCount: 0,
    likeCount: 0,
    isViewed: true,
    isLiked: false,
    isBarber: false,
    createdAt: data.created_at,
    expiresAt: data.expires_at,
  };
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

// View a story
export async function viewStory(userId: string, storyId: string): Promise<void> {
  const { error } = await supabase.from('story_views').upsert({
    user_id: userId,
    story_id: storyId,
  });

  if (error) throw error;
}

// Like a story
export async function likeStory(userId: string, storyId: string): Promise<void> {
  const { error } = await supabase.from('story_likes').upsert({
    user_id: userId,
    story_id: storyId,
  });

  if (error) throw error;
}

// Unlike a story
export async function unlikeStory(userId: string, storyId: string): Promise<void> {
  const { error } = await supabase
    .from('story_likes')
    .delete()
    .eq('user_id', userId)
    .eq('story_id', storyId);

  if (error) throw error;
}

// Delete a story
export async function deleteStory(storyId: string): Promise<void> {
  const { error } = await supabase.from('stories').delete().eq('id', storyId);
  if (error) throw error;
}

// ==================== SHARING ====================

// Share content
export async function shareContent(content: ShareContent): Promise<boolean> {
  try {
    const result = await Share.share({
      title: content.title,
      message: `${content.message}\n\n${content.url}`,
      url: Platform.OS === 'ios' ? content.url : undefined,
    });

    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('Share error:', error);
    return false;
  }
}

// Generate share link for barber
export function getBarberShareLink(barberId: string): ShareContent {
  const baseUrl = process.env.EXPO_PUBLIC_APP_URL || 'https://getbarber.app';
  return {
    type: 'barber',
    title: 'Check out this barber on GetBarber!',
    message: 'I found an amazing barber on GetBarber. Check them out!',
    url: `${baseUrl}/barber/${barberId}`,
  };
}

// Generate share link for booking
export function getBookingShareLink(bookingId: string): ShareContent {
  const baseUrl = process.env.EXPO_PUBLIC_APP_URL || 'https://getbarber.app';
  return {
    type: 'booking',
    title: 'My haircut appointment',
    message: "Just booked a haircut on GetBarber! Can't wait!",
    url: `${baseUrl}/booking/${bookingId}`,
  };
}

// ==================== FEED ====================

// Get social feed
export async function getFeed(
  userId: string,
  page: number = 0,
  limit: number = 20
): Promise<FeedItem[]> {
  // Get following list
  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  const followingIds = (following || []).map((f) => f.following_id);
  followingIds.push(userId);

  // Get feed items (this would be a view or materialized table in production)
  const { data: items, error } = await supabase
    .from('feed_items')
    .select(
      `
      *,
      user:profiles!user_id(display_name, avatar_url),
      likes:feed_likes(user_id)
    `
    )
    .in('user_id', followingIds)
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  if (error) throw error;

  return (items || []).map((item: any) => ({
    id: item.id,
    type: item.type,
    userId: item.user_id,
    userName: item.user?.display_name || 'Unknown',
    userAvatar: item.user?.avatar_url,
    content: item.content,
    likeCount: (item.likes || []).length,
    commentCount: item.comment_count || 0,
    isLiked: (item.likes || []).some((l: any) => l.user_id === userId),
    createdAt: item.created_at,
  }));
}

// Like feed item
export async function likeFeedItem(userId: string, itemId: string): Promise<void> {
  const { error } = await supabase.from('feed_likes').upsert({
    user_id: userId,
    item_id: itemId,
  });

  if (error) throw error;
}

// Unlike feed item
export async function unlikeFeedItem(userId: string, itemId: string): Promise<void> {
  const { error } = await supabase
    .from('feed_likes')
    .delete()
    .eq('user_id', userId)
    .eq('item_id', itemId);

  if (error) throw error;
}

// Get comments
export async function getComments(
  itemId: string,
  limit: number = 50
): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(
      `
      *,
      user:profiles!user_id(display_name, avatar_url)
    `
    )
    .eq('item_id', itemId)
    .is('parent_id', null)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((c: any) => ({
    id: c.id,
    userId: c.user_id,
    userName: c.user?.display_name || 'Unknown',
    userAvatar: c.user?.avatar_url,
    content: c.content,
    likeCount: c.like_count || 0,
    isLiked: false,
    createdAt: c.created_at,
  }));
}

// Add comment
export async function addComment(
  userId: string,
  itemId: string,
  content: string,
  parentId?: string
): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: userId,
      item_id: itemId,
      content,
      parent_id: parentId,
    })
    .select('*, user:profiles!user_id(display_name, avatar_url)')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    userName: data.user?.display_name || 'Unknown',
    userAvatar: data.user?.avatar_url,
    content: data.content,
    likeCount: 0,
    isLiked: false,
    createdAt: data.created_at,
  };
}

// Get social stats
export async function getSocialStats(userId: string): Promise<SocialStats> {
  const [followCounts, storiesResult] = await Promise.all([
    getFollowCounts(userId),
    supabase
      .from('stories')
      .select('id, story_views(id), story_likes(id)')
      .eq('user_id', userId),
  ]);

  const stories = storiesResult.data || [];
  const totalViews = stories.reduce(
    (sum, s: any) => sum + (s.story_views?.length || 0),
    0
  );
  const totalLikes = stories.reduce(
    (sum, s: any) => sum + (s.story_likes?.length || 0),
    0
  );

  return {
    followersCount: followCounts.followers,
    followingCount: followCounts.following,
    storiesCount: stories.length,
    totalViews,
    totalLikes,
  };
}

export default {
  followUser,
  unfollowUser,
  isFollowing,
  getFollowers,
  getFollowing,
  getFollowCounts,
  getStories,
  createStory,
  viewStory,
  likeStory,
  unlikeStory,
  deleteStory,
  shareContent,
  getBarberShareLink,
  getBookingShareLink,
  getFeed,
  likeFeedItem,
  unlikeFeedItem,
  getComments,
  addComment,
  getSocialStats,
};
