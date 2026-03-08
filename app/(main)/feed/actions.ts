"use server";

import { createClient } from "@/lib/supabase/server";
import type { FeedPost } from "@/lib/types/feed";

const DEFAULT_LIMIT = 5;

/** Supabase can return joined relation as object or array; normalize to object. */
function normalizeAuthor(
  author: unknown
): FeedPost["author"] {
  if (author == null) return null;
  if (Array.isArray(author)) return (author[0] as FeedPost["author"]) ?? null;
  return author as FeedPost["author"];
}

export type GetFeedPostsResult = {
  posts: FeedPost[];
  nextCursor: string | null;
};

/** Fetch feed posts with author profile. Cursor = last item's created_at (ISO) for keyset pagination. */
export async function getFeedPosts(
  cursor: string | null,
  limit: number = DEFAULT_LIMIT
): Promise<GetFeedPostsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { posts: [], nextCursor: null };
  }

  let query = supabase
    .from("posts")
    .select(
      `
      id,
      user_id,
      body,
      created_at,
      author:profiles(username, avatar_url)
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data: rows, error } = await query;

  if (error) {
    console.error("[feed] getFeedPosts error:", error.message);
    return { posts: [], nextCursor: null };
  }

  const hasMore = rows && rows.length > limit;
  const slice = rows?.slice(0, limit) ?? [];
  const posts: FeedPost[] = slice.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    user_id: row.user_id as string,
    body: row.body as string,
    created_at: row.created_at as string,
    author: normalizeAuthor(row.author),
  }));
  const nextCursor =
    hasMore && slice.length > 0
      ? (slice[slice.length - 1] as Record<string, unknown>).created_at as string
      : null;

  return { posts, nextCursor };
}

/** Load more (used by client): same as getFeedPosts, alias for clarity. */
export async function loadMoreFeedPosts(
  cursor: string,
  limit: number = DEFAULT_LIMIT
): Promise<GetFeedPostsResult> {
  return getFeedPosts(cursor, limit);
}

export type CreatePostResult = { ok: true; postId: string } | { ok: false; error: string };

/** Posts by a single user (for profile page). */
export async function getPostsByUserId(
  userId: string,
  limit: number = 20
): Promise<FeedPost[]> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      user_id,
      body,
      created_at,
      author:profiles(username, avatar_url)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[feed] getPostsByUserId error:", error.message);
    return [];
  }
  return (rows ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    user_id: row.user_id as string,
    body: row.body as string,
    created_at: row.created_at as string,
    author: normalizeAuthor(row.author),
  }));
}

export async function createPost(body: string): Promise<CreatePostResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Не авторизован" };
  }
  const trimmed = body.trim();
  if (!trimmed) {
    return { ok: false, error: "Текст не может быть пустым" };
  }
  const { data, error } = await supabase
    .from("posts")
    .insert({ user_id: user.id, body: trimmed })
    .select("id")
    .single();
  if (error) {
    console.error("[feed] createPost error:", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true, postId: data.id };
}
