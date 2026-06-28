import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getAdminUser, adminUnauthorized } from "@/lib/admin";

export async function GET() {
  const adminUser = await getAdminUser();
  if (!adminUser || adminUser.role !== "admin") {
    return adminUnauthorized();
  }

  try {
    const [userRows] = await db.query(
      "SELECT COUNT(*) AS total FROM users"
    );
    const [productRows] = await db.query(
      `SELECT COUNT(*) AS total, SUM(stock) AS totalStock,
        SUM(CASE WHEN stock <= 5 THEN 1 ELSE 0 END) AS lowStock
       FROM products`
    );
    const [orderRows] = await db.query(
      "SELECT COUNT(*) AS total FROM orders"
    );
    const [statusRows] = await db.query(
      "SELECT status, COUNT(*) AS count FROM orders GROUP BY status"
    );
    const [topProducts] = await db.query(
      `SELECT
          p.id,
          p.name,
          COALESCE(SUM(oi.quantity), 0) AS sold_quantity
        FROM products p
        LEFT JOIN order_items oi ON oi.product_id = p.id
        GROUP BY p.id
        ORDER BY sold_quantity DESC
        LIMIT 5`
    );

    const userSummary = userRows[0] || { total: 0 };
    const productSummary = productRows[0] || {
      total: 0,
      totalStock: 0,
      lowStock: 0,
    };
    const orderSummary = orderRows[0] || { total: 0 };

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: Number(userSummary.total),
        totalProducts: Number(productSummary.total),
        totalOrders: Number(orderSummary.total),
        lowStockCount: Number(productSummary.lowStock),
        totalStock: Number(productSummary.totalStock),
        ordersByStatus: statusRows,
        topProducts,
      },
    });
  } catch (error) {
    console.error("Admin summary error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat ringkasan." },
      { status: 500 }
    );
  }
}
