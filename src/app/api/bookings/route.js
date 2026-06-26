import db from "@/lib/db";

export async function POST(req) {
  try {
    const formData = await req.formData();
    
    const name = formData.get("name");
    const phone = formData.get("phone");
    const service_id = formData.get("service_id");
    const booking_date = formData.get("booking_date");
    const complaint = formData.get("complaint");
    const down_payment = formData.get("down_payment");
    const file = formData.get("file");

    // Validation
    if (!name || !phone || !service_id || !booking_date || !complaint) {
      return Response.json(
        { success: false, message: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Get user_id from session or auth header
    // For now, we'll assume user_id is sent in the request
    const user_id = formData.get("user_id");
    if (!user_id) {
      return Response.json(
        { success: false, message: "User tidak terautentikasi" },
        { status: 401 }
      );
    }

    const connection = await db.getConnection();

    try {
      // Insert booking
      const [result] = await connection.execute(
        `INSERT INTO bookings
        (user_id, service_id, booking_date, complaint, down_payment, status)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          service_id,
          booking_date,
          complaint,
          down_payment || 0,
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
