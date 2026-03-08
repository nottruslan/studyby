import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:pl-56">
        <AdminHeader />
        <main className="px-4 pt-4 lg:px-6 lg:pt-6">{children}</main>
      </div>
    </div>
  );
}
