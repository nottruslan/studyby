import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { EditProfileForm } from "@/components/profile/EditProfileForm";

export default async function EditProfilePage() {
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
      <div className="flex items-center gap-2">
        <Link
          href="/profile"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground rounded-3xl p-1 -m-1"
        >
          <ChevronLeft className="h-5 w-5" />
          Назад
        </Link>
      </div>
      <h2 className="text-xl font-semibold">Редактировать профиль</h2>
      <EditProfileForm profile={profile} />
    </div>
  );
}
