import AdminLayout from "@/components/admin/AdminLayout";
import { getAdminUser } from "@/lib/admin";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Users | ORAWIM MOTOR",
};

export default async function AdminUsersPage() {
  const adminUser = await getAdminUser();
  if (!adminUser || adminUser.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#150f0f] px-4 py-8 text-stone-100 lg:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-[#1b1613] p-8 shadow-xl shadow-black/20">
          <h1 className="text-3xl font-semibold text-stone-100">Detail Pengguna</h1>
          <p className="mt-3 max-w-2xl text-sm text-stone-400">
            Halaman ini untuk melihat dan mengelola data pengguna secara penuh. Tambahkan pengelolaan detail pengguna di sini.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
