// Social Features Types

export type FollowStatus = 'following' | 'not_following' | 'pending';

export interface FollowRelation {
  id: string;
  followerId: string;
  followingId: string;
  followedAt: string;
}

export interface FollowProfile {
  id: string;
  name: string;
  avatar?: string;
  isBarber: boolean;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  isBarber: boolean;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  thumbnailUrl?: string;
  caption?: string;
  duration: number; // seconds for video, display time for image
  viewCount: number;
  likeCount: number;
  isViewed: boolean;
  isLiked: boolean;
  createdAt: string;
  expiresAt: string; // Stories expire after 24 hours
}

export interface StoryGroup {
  userId: string;
  userName: string;
  userAvatar?: string;
  isBarber: boolean;
  stories: Story[];
  hasUnviewed: boolean;
  latestStoryAt: string;
}

export interface CreateStoryInput {
  mediaUri: string;
  mediaType: 'image' | 'video';
  caption?: string;
}

export interface ShareContent {
  type: 'barber' | 'booking' | 'story' | 'review' | 'promotion';
  title: string;
  message: string;
  url: string;
  imageUrl?: string;
}

export interface FeedItem {
  id: string;
  type: 'story' | 'booking_completed' | 'new_review' | 'follow' | 'portfolio_update';
  userId: string;
  userName: string;
  userAvatar?: string;
  content: {
    title: string;
    description?: string;
    imageUrl?: string;
    rating?: number;
    barberId?: string;
    barberName?: string;
  };
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  replies?: Comment[];
}

export interface SocialStats {
  followersCount: number;
  followingCount: number;
  storiesCount: number;
  totalViews: number;
  totalLikes: number;
}
