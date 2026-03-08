import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="lg:hidden sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-background px-4 pt-[env(safe-area-inset-top)] min-h-[calc(3.5rem+env(safe-area-inset-top))]">
        <Link
          href="/profile"
          className="flex items-center gap-1 rounded-3xl p-1 -m-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          Назад
        </Link>
        <h1 className="text-xl font-semibold text-foreground">Заказы</h1>
      </div>
      <AdminSidebar />
      <div className="lg:pl-56">
        <AdminHeader />
        <main className="px-4 pt-4 lg:px-6 lg:pt-6">{children}</main>
      </div>
    </div>
  );
}
