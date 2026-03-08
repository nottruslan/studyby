import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChevronLeft } from "lucide-react";
import { AdminUserProfileView } from "@/components/admin/AdminUserProfileView";

type Props = { params: Promise<{ id: string }> };

export default async function AdminUserPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (myProfile?.role !== "admin") notFound();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, email, avatar_url, university, balance, role")
    .eq("id", id)
    .single();

  if (error || !profile) notFound();

  return (
    <div className="flex flex-col min-h-0">
      <header className="flex-shrink-0 flex items-center gap-2 border-b border-border bg-background px-4 py-3">
        <Link
          href="/admin/orders"
          prefetch={true}
          className="inline-flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground -m-1"
        >
          <ChevronLeft className="h-5 w-5" />
          К заказам
        </Link>
      </header>
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-md">
          <AdminUserProfileView
            profile={{
              id: profile.id,
              username: profile.username,
              email: profile.email ?? null,
              avatar_url: profile.avatar_url ?? null,
              university: profile.university ?? null,
              balance: profile.balance ?? 0,
              role: profile.role ?? null,
            }}
          />
        </div>
      </main>
    </div>
  );
}
