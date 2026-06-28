import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const email = String(body.email || "").trim();
    const password = String(body.password || "").trim();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    let rows = [];
    try {
      [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    } catch (dbError) {
      console.error("Admin login DB error:", dbError);
      return NextResponse.json(
        { success: false, message: "Koneksi database gagal. Periksa server MySQL." },
        { status: 503 }
      );
    }

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

    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Akses admin hanya untuk akun admin." },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Login admin berhasil",
    });

    response.cookies.set("userId", user.id, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Admin login unexpected error:", error);
    return NextResponse.json(
      { success: false, message: "Login admin gagal", error: error.message },
      { status: 500 }
    );
  }
}
