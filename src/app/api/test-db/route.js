import db from "@/lib/db";

export async function GET() {
  try {
    const conn = await db.getConnection();

    console.log("DATABASE CONNECTED");

    conn.release();

    return Response.json({ status: "ok" });
  } catch (err) {
    console.error("DB ERROR:", err);
    return Response.json({ status: "error" }, { status: 500 });
  }
}