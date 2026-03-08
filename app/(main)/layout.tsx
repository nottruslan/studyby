import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/shared/Header";
import { Sidebar } from "@/components/shared/Sidebar";
import { BottomNavigationBar } from "@/components/shared/BottomNavigationBar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    await supabase.from("profiles").insert({
      id: user.id,
      username: user.email?.split("@")[0] ?? "user",
      avatar_url: null,
      university: null,
      balance: 0,
    });
    redirect("/profile");
  }

  return (
    <div className="main-app-shell min-h-screen bg-background pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <Sidebar />
      <div className="lg:pl-56">
        <Header profile={profile} />
        <main className="px-4 pt-4 lg:px-6 lg:pt-6">
          <div className="lg:mx-auto lg:max-w-4xl">{children}</div>
        </main>
      </div>
      <div className="lg:hidden">
        <BottomNavigationBar />
      </div>
    </div>
  );
}
