import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminLayout from "@/components/admin/AdminLayout";
import db from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin Dashboard | ORAWIM MOTOR",
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    redirect("/admin/login");
  }

  try {
    const [rows] = await db.query(
      "SELECT role FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    const role = rows[0]?.role;
    if (role !== "admin") {
      redirect("/admin/login");
    }
  } catch (error) {
    console.error("Admin auth error:", error);
    redirect("/admin/login");
  }

  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}
