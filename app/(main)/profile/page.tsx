import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileView } from "@/components/profile/ProfileView";
import { PasswordSection } from "@/components/profile/PasswordSection";

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
      <PasswordSection />
    </div>
  );
}
