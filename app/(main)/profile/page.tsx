import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProfileView } from "@/components/profile/ProfileView";
import { LogoutButton } from "@/components/profile/LogoutButton";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/profile");

  return (
    <div className="space-y-6">
      <h2 className="mb-4 text-xl font-semibold">Профиль</h2>
      <ProfileView profile={profile} />
      <Link
        href="/profile/confidentiality"
        className="flex items-center justify-between rounded-3xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50"
      >
        <span className="font-medium">Конфиденциальность</span>
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      </Link>
      <div className="pt-2">
        <LogoutButton />
      </div>
    </div>
  );
}
