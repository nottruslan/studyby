import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4 pt-[env(safe-area-inset-top)] min-h-[calc(3.5rem+env(safe-area-inset-top))]">
      <h1 className="text-lg font-semibold">Studby</h1>
      <ThemeToggle />
    </header>
  );
}
