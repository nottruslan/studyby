import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPostsByUserId } from "../actions";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FeedPost } from "@/lib/types/feed";

function formatTimeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (sec < 60) return "только что";
  if (sec < 3600) return `${Math.floor(sec / 60)} мин`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} ч`;
  return `${Math.floor(sec / 86400)} д`;
}

export default async function FeedProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/feed");

  const posts: FeedPost[] = await getPostsByUserId(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Никнейм</p>
          <p className="text-lg font-semibold">{profile.username ?? "—"}</p>
          <p className="mt-1 text-sm text-muted-foreground">id {profile.id.slice(0, 8)}</p>
          <p className="mt-1 text-sm text-muted-foreground">Описание — позже</p>
        </div>
        <Avatar className="h-20 w-20 shrink-0 border-2 border-border">
          <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.username ?? ""} />
          <AvatarFallback className="bg-muted text-lg">
            {(profile.username ?? "U").slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex gap-2">
        <Link
          href="/profile/edit"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Редактир. проф.
        </Link>
        <Button variant="outline" size="sm" type="button" disabled>
          Поделиться профи
        </Button>
      </div>
      <section>
        <h2 className="text-lg font-semibold mb-2">Посты</h2>
        {posts.length === 0 ? (
          <p className="text-muted-foreground text-sm">Пока нет постов</p>
        ) : (
          <ul className="divide-y divide-border">
            {posts.map((post) => (
              <li key={post.id} className="py-3">
                <p className="text-foreground">{post.body}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTimeAgo(post.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
