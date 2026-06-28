import AdminLayout from "@/components/admin/AdminLayout";
import { getAdminUser } from "@/lib/admin";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Orders | ORAWIM MOTOR",
};

export default async function AdminOrdersPage() {
  const adminUser = await getAdminUser();
  if (!adminUser || adminUser.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#150f0f] px-4 py-8 text-stone-100 lg:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-[#1b1613] p-8 shadow-xl shadow-black/20">
          <h1 className="text-3xl font-semibold text-stone-100">Detail Transaksi</h1>
          <p className="mt-3 max-w-2xl text-sm text-stone-400">
            Halaman ini untuk melihat semua transaksi pelanggan. Informasi lengkap transaksi akan tersedia di sini.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
