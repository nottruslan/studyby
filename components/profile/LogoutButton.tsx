"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/onboarding");
    router.refresh();
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full rounded-3xl text-muted-foreground border-destructive/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
      onClick={handleLogout}
    >
      Выйти из аккаунта
    </Button>
  );
}
