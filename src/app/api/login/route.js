import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    const user = rows[0];

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Email tidak ditemukan" },
        { status: 401 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: "Password salah" },
        { status: 401 }
      );
    }

    // 🔥 bikin response
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
    });

    // 🍪 simpan session sederhana
    response.cookies.set("userId", user.id, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 hari
    });

    return response;

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Login gagal", error: error.message },
      { status: 500 }
    );
  }
}