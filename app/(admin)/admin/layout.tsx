import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminMobileHeader } from "@/components/admin/AdminMobileHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-screen flex-col bg-background">
      <AdminMobileHeader />
      <AdminSidebar />
      <div className="scroll-area flex min-h-0 flex-1 flex-col lg:pl-56">
        <AdminHeader />
        <main className="flex-1 px-4 pt-4 lg:px-6 lg:pt-6">{children}</main>
      </div>
    </div>
  );
}
