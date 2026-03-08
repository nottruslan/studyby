import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
