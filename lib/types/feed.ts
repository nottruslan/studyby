export type FeedPost = {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  author?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
};
