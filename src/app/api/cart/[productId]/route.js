import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(req, { params }) {
  try {
    const { productId } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Anda harus login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const quantity = Number(body.quantity) || 1;

    const connection = await db.getConnection();
    try {
      const [carts] = await connection.query(
        "SELECT id FROM carts WHERE user_id = ? LIMIT 1",
        [userId]
      );

      if (carts.length === 0) {
        return NextResponse.json(
          { success: false, message: "Keranjang tidak ditemukan." },
          { status: 404 }
        );
      }

      const cartId = carts[0].id;

      await connection.query(
        `UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?`,
        [quantity, cartId, productId]
      );

      return NextResponse.json({ success: true, message: "Jumlah produk diperbarui." });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Cart PUT error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui keranjang." },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { productId } = await params;
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
        return NextResponse.json(
          { success: false, message: "Keranjang tidak ditemukan." },
          { status: 404 }
        );
      }

      const cartId = carts[0].id;

      await connection.query(
        `DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?`,
        [cartId, productId]
      );

      return NextResponse.json({ success: true, message: "Produk dihapus dari keranjang." });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus produk." },
      { status: 500 }
    );
  }
}