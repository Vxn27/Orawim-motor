import AdminLayout from "@/components/admin/AdminLayout";
import ProductManagement from "@/components/admin/ProductManagement";
import { getAdminUser } from "@/lib/admin";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Products | ORAWIM MOTOR",
};

export default async function AdminProductsPage() {
  const adminUser = await getAdminUser();
  if (!adminUser || adminUser.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#120b0b] px-4 py-8 text-stone-100 lg:px-8">
        <ProductManagement />
      </div>
    </AdminLayout>
  );
}
