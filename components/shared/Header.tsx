import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { ProfileMenu } from "./ProfileMenu";

type Profile = { username: string | null; avatar_url: string | null; role?: string | null };

export function Header({ profile }: { profile?: Profile | null }) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4 pt-[env(safe-area-inset-top)] min-h-[calc(3.5rem+env(safe-area-inset-top))] lg:px-6">
      <Link href="/feed" className="text-lg font-semibold lg:hidden">
        Studby
      </Link>
      <div className="lg:flex-1" />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {profile && (
          <ProfileMenu
            username={profile.username}
            avatarUrl={profile.avatar_url}
            role={profile.role}
          />
        )}
      </div>
    </header>
  );
}
