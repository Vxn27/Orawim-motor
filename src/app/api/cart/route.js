import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/lib/db";

// Cari cart milik user, kalau belum ada, buat baru
const getOrCreateCartId = async (connection, userId) => {
  const [existing] = await connection.query(
    "SELECT id FROM carts WHERE user_id = ? LIMIT 1",
    [userId]
  );

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [created] = await connection.query(
    "INSERT INTO carts (user_id) VALUES (?)",
    [userId]
  );

  return created.insertId;
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Anda harus login terlebih dahulu." },
        { status: 401 }
      );
    }

    const connection = await db.getConnection();
    try {
      const [carts] = await connection.query(
        "SELECT id FROM carts WHERE user_id = ? LIMIT 1",
        [userId]
      );

      if (carts.length === 0) {
        return NextResponse.json({ success: true, data: [] });
      }

      const cartId = carts[0].id;

      const [rows] = await connection.query(
        `SELECT ci.product_id, ci.quantity, p.name, p.image, p.price, p.stock
         FROM cart_items ci
         JOIN products p ON p.id = ci.product_id
         WHERE ci.cart_id = ?`,
        [cartId]
      );

      const items = rows.map((row) => ({
        id: row.product_id,
        name: row.name,
        image: row.image,
        price: `Rp ${row.price.toLocaleString("id-ID")}`,
        priceValue: row.price,
        stock: row.stock,
        quantity: row.quantity,
      }));

      return NextResponse.json({ success: true, data: items });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat keranjang." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Anda harus login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "productId wajib diisi." },
        { status: 400 }
      );
    }

    const connection = await db.getConnection();
    try {
      const cartId = await getOrCreateCartId(connection, userId);

      await connection.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
        [cartId, productId, quantity, quantity]
      );

      return NextResponse.json({ success: true, message: "Produk ditambahkan ke keranjang." });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menambahkan produk." },
      { status: 500 }
    );
  }
}