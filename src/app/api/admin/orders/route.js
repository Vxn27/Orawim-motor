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
      `SELECT
        id,
        user_id,
        total_price,
        status,
        customer_name,
        phone_number,
        shipping_address,
        notes
      FROM orders
      ORDER BY id ASC
      LIMIT 5`
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Admin orders error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat transaksi." },
      { status: 500 }
    );
  }
}
