import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function getAdminUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;

  const [rows] = await db.query(
    "SELECT id, role FROM users WHERE id = ?",
    [userId]
  );

  return rows[0] || null;
}

export function adminUnauthorized() {
  return NextResponse.json(
    { success: false, message: "Akses hanya untuk admin." },
    { status: 403 }
  );
}
