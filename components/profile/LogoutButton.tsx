"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    startTransition(() => {
      router.push("/onboarding");
      router.refresh();
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full rounded-3xl text-muted-foreground border-destructive/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
      onClick={handleLogout}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        "Выйти из аккаунта"
      )}
    </Button>
  );
}
