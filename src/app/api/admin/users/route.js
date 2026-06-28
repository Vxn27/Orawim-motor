import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getAdminUser, adminUnauthorized } from "@/lib/admin";

export async function GET() {
  const adminUser = await getAdminUser();
  if (!adminUser || adminUser.role !== "admin") {
    return adminUnauthorized();
  }

  try {
    const [rows] = await db.query(
      "SELECT id, name, email, role, notelp AS phone, alamat AS address FROM users WHERE role = 'customer' ORDER BY id ASC"
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat pengguna." },
      { status: 500 }
    );
  }
}
