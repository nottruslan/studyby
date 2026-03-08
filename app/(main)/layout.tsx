import { redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/shared/Header";
import { Sidebar } from "@/components/shared/Sidebar";
import { BottomNavigationBar } from "@/components/shared/BottomNavigationBar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  unstable_noStore();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/onboarding");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const admin = createAdminClient();
    const { error } = await admin.from("profiles").upsert(
      {
        id: user.id,
        username: user.email?.split("@")[0] ?? "user",
        email: user.email ?? null,
        avatar_url: null,
        university: null,
        balance: 0,
      },
      { onConflict: "id" }
    );
    if (error) {
      console.error("[layout] profiles upsert failed:", error.message);
      throw new Error("Не удалось создать профиль. Проверьте SUPABASE_SERVICE_ROLE_KEY и RLS.");
    }
    redirect("/feed");
  }

  return (
    <div className="main-app-shell flex h-full min-h-screen flex-col bg-background">
      <div className="scroll-area flex min-h-0 flex-1 flex-col lg:flex-row">
        <Sidebar />
        <div className="lg:pl-56 flex-1">
          <Header profile={profile} />
          <main className="px-4 pt-4 pb-4 lg:px-6 lg:pt-6 lg:pb-6">
            <div className="lg:mx-auto lg:max-w-4xl pr-1">{children}</div>
          </main>
        </div>
      </div>
      <div className="lg:hidden flex-shrink-0 border-t border-border bg-background">
        <BottomNavigationBar />
      </div>
    </div>
  );
}
