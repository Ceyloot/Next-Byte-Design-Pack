export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  sender?: UserProfile;
  receiver?: UserProfile;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  friend?: UserProfile;
  user?: UserProfile;
}

export interface SearchUserResult {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image_url?: string;
  is_friend: boolean;
  has_pending_request: boolean;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image_url?: string;
  level?: number;
  total_xp?: number;
  achievements_count?: number;
  badges_count?: number;
}
