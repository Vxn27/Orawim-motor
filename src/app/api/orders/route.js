import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { orderItems, customerName, phoneNumber, shippingAddress, notes } = body;

    if (
      !Array.isArray(orderItems) ||
      orderItems.length === 0 ||
      !customerName ||
      !phoneNumber ||
      !shippingAddress
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Data pesanan tidak lengkap atau tidak valid.",
        },
        { status: 400 }
      );
    }

    const totalPrice = orderItems.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      return sum + quantity * price;
    }, 0);

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value || null;

    const connection = await db.getConnection();

    try {
      const [orderResult] = await connection.query(
        "INSERT INTO orders (user_id, total_price, status, customer_name, phone_number, shipping_address, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [userId, totalPrice, "pending", customerName, phoneNumber, shippingAddress, notes]
      );

      const orderId = orderResult.insertId;
      const orderItemValues = orderItems.map((item) => [
        orderId,
        item.productId,
        item.quantity,
        item.price,
      ]);

      if (orderItemValues.length > 0) {
        await connection.query(
          "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
          [orderItemValues]
        );
      }

      return NextResponse.json({
        success: true,
        message: "Pesanan berhasil dibuat.",
        orderId,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal membuat pesanan.",
      },
      { status: 500 }
    );
  }
}
