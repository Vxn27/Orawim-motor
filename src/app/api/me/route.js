// src/app/api/me/route.js

import { cookies } from "next/headers";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies(); // ✅ tambah await
    const userId = cookieStore.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false });
    }

    const [rows] = await db.query(
      "SELECT id, name, email, role, notelp, alamat, created_at FROM users WHERE id = ?",
      [userId.value]
    );

    const user = rows[0];

    if (!user) {
      return NextResponse.json({ success: false });
    }

    return NextResponse.json({
      success: true,
      user,
    });

  } catch (err) {
    return NextResponse.json({ success: false });
  }
}