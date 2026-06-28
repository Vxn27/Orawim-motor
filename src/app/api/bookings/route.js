import { cookies } from "next/headers";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let payload = {};

    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else {
      const formData = await req.formData();
      payload = Object.fromEntries(formData.entries());
    }

    const name = payload.name || payload.nama || "";
    const phone = payload.phone || "";
    const service_id = payload.service_id || payload.serviceId || "";
    const booking_date = payload.booking_date || payload.bookingDate || "";
    const complaint = payload.complaint || payload.keluhan || "";
    const payment_method = payload.payment_method || payload.paymentMethod || "";
    const down_payment = payload.down_payment || payload.downpayment || 25000;
    const user_id = payload.user_id || payload.userId || (await cookies()).get("userId")?.value || null;

    if (!name || !phone || !service_id || !booking_date || !complaint) {
      return Response.json(
        { success: false, message: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    if (!user_id) {
      return Response.json(
        { success: false, message: "User tidak terautentikasi" },
        { status: 401 }
      );
    }

    const connection = await db.getConnection();

    try {
      const [result] = await connection.execute(
        `INSERT INTO booking
        (user_id, service_id, booking_date, complaint, down_payment, status)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          service_id,
          booking_date,
          complaint,
          down_payment || 25000,
          "pending",
        ]
      );

      connection.release();

      return Response.json(
        {
          success: true,
          message: "Booking berhasil dibuat",
          booking_id: result.insertId,
        },
        { status: 201 }
      );
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Booking error:", error);
    return Response.json(
      { success: false, message: "Gagal membuat booking", error: error.message },
      { status: 500 }
    );
  }
}
