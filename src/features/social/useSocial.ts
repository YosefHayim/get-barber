import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
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
} from './socialService';
import type {
  FollowProfile,
  StoryGroup,
  CreateStoryInput,
  ShareContent,
  FeedItem,
  Comment,
  SocialStats,
} from './types';

// Follow/Unfollow hook
export function useFollow(targetUserId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: isCurrentlyFollowing, isLoading } = useQuery<boolean>({
    queryKey: ['is-following', user?.id, targetUserId],
    queryFn: () => isFollowing(user!.id, targetUserId),
    enabled: !!user?.id && !!targetUserId && user.id !== targetUserId,
  });

  const followMutation = useMutation({
    mutationFn: () => followUser(user!.id, targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following', user?.id, targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['followers', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['follow-counts'] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUser(user!.id, targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following', user?.id, targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['followers', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['follow-counts'] });
    },
  });

  const toggleFollow = useCallback(() => {
    if (isCurrentlyFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  }, [isCurrentlyFollowing, followMutation, unfollowMutation]);

  return {
    isFollowing: isCurrentlyFollowing ?? false,
    isLoading: isLoading || followMutation.isPending || unfollowMutation.isPending,
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    toggleFollow,
  };
}

// Followers/Following lists hook
export function useFollowLists(userId: string) {
  const {
    data: followers,
    isLoading: loadingFollowers,
    refetch: refetchFollowers,
  } = useQuery<FollowProfile[]>({
    queryKey: ['followers', userId],
    queryFn: () => getFollowers(userId),
    enabled: !!userId,
  });

  const {
    data: following,
    isLoading: loadingFollowing,
    refetch: refetchFollowing,
  } = useQuery<FollowProfile[]>({
    queryKey: ['following', userId],
    queryFn: () => getFollowing(userId),
    enabled: !!userId,
  });

  const { data: counts } = useQuery({
    queryKey: ['follow-counts', userId],
    queryFn: () => getFollowCounts(userId),
    enabled: !!userId,
  });

  return {
    followers: followers || [],
    following: following || [],
    followersCount: counts?.followers || 0,
    followingCount: counts?.following || 0,
    isLoading: loadingFollowers || loadingFollowing,
    refetch: () => {
      refetchFollowers();
      refetchFollowing();
    },
  };
}

// Stories hook
export function useStories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: storyGroups,
    isLoading,
    error,
    refetch,
  } = useQuery<StoryGroup[]>({
    queryKey: ['stories', user?.id],
    queryFn: () => getStories(user!.id),
    enabled: !!user?.id,
    refetchInterval: 60000, // Refresh every minute
  });

  // Create story
  const createMutation = useMutation({
    mutationFn: (input: CreateStoryInput) => createStory(user!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories', user?.id] });
      Alert.alert('Story Posted', 'Your story is now live!');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to post story');
    },
  });

  // View story
  const viewMutation = useMutation({
    mutationFn: (storyId: string) => viewStory(user!.id, storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories', user?.id] });
    },
  });

  // Like story
  const likeMutation = useMutation({
    mutationFn: (storyId: string) => likeStory(user!.id, storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories', user?.id] });
    },
  });

  // Unlike story
  const unlikeMutation = useMutation({
    mutationFn: (storyId: string) => unlikeStory(user!.id, storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories', user?.id] });
    },
  });

  // Delete story
  const deleteMutation = useMutation({
    mutationFn: (storyId: string) => deleteStory(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories', user?.id] });
    },
  });

  return {
    storyGroups: storyGroups || [],
    isLoading,
    error,
    refetch,
    createStory: createMutation.mutate,
    viewStory: viewMutation.mutate,
    likeStory: likeMutation.mutate,
    unlikeStory: unlikeMutation.mutate,
    deleteStory: deleteMutation.mutate,
    isCreating: createMutation.isPending,
  };
}

// Share hook
export function useShare() {
  const share = useCallback(async (content: ShareContent) => {
    return shareContent(content);
  }, []);

  const shareBarber = useCallback(async (barberId: string) => {
    const content = getBarberShareLink(barberId);
    return shareContent(content);
  }, []);

  const shareBooking = useCallback(async (bookingId: string) => {
    const content = getBookingShareLink(bookingId);
    return shareContent(content);
  }, []);

  return {
    share,
    shareBarber,
    shareBooking,
  };
}

// Feed hook
export function useFeed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: feedItems,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useQuery<FeedItem[]>({
    queryKey: ['feed', user?.id],
    queryFn: () => getFeed(user!.id),
    enabled: !!user?.id,
  });

  // Like item
  const likeMutation = useMutation({
    mutationFn: (itemId: string) => likeFeedItem(user!.id, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed', user?.id] });
    },
  });

  // Unlike item
  const unlikeMutation = useMutation({
    mutationFn: (itemId: string) => unlikeFeedItem(user!.id, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed', user?.id] });
    },
  });

  const toggleLike = useCallback(
    (itemId: string, isLiked: boolean) => {
      if (isLiked) {
        unlikeMutation.mutate(itemId);
      } else {
        likeMutation.mutate(itemId);
      }
    },
    [likeMutation, unlikeMutation]
  );

  return {
    items: feedItems || [],
    isLoading,
    error,
    refetch,
    toggleLike,
    loadMore: fetchNextPage,
    hasMore: hasNextPage,
    isLoadingMore: isFetchingNextPage,
  };
}

// Comments hook
export function useComments(itemId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: comments,
    isLoading,
    error,
    refetch,
  } = useQuery<Comment[]>({
    queryKey: ['comments', itemId],
    queryFn: () => getComments(itemId),
    enabled: !!itemId,
  });

  const addMutation = useMutation({
    mutationFn: ({
      content,
      parentId,
    }: {
      content: string;
      parentId?: string;
    }) => addComment(user!.id, itemId, content, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', itemId] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to add comment');
    },
  });

  return {
    comments: comments || [],
    isLoading,
    error,
    refetch,
    addComment: addMutation.mutate,
    isAdding: addMutation.isPending,
  };
}

// Social stats hook
export function useSocialStats(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  const { data: stats, isLoading } = useQuery<SocialStats>({
    queryKey: ['social-stats', targetId],
    queryFn: () => getSocialStats(targetId!),
    enabled: !!targetId,
  });

  return {
    stats: stats || {
      followersCount: 0,
      followingCount: 0,
      storiesCount: 0,
      totalViews: 0,
      totalLikes: 0,
    },
    isLoading,
  };
}

export default {
  useFollow,
  useFollowLists,
  useStories,
  useShare,
  useFeed,
  useComments,
  useSocialStats,
};
