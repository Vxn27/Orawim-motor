import db from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {

  try {

    const body = await req.json();

    const { name, email, password, phone, address } = body;

    await db.query(
      `
      INSERT INTO users
      (name, email, password, role, notelp, alamat)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [name, email, password, "customer", phone, address]
    );

    return NextResponse.json({
      success: true,
      message: "Register berhasil",
    });

  } catch (error) {

    return NextResponse.json({
      success: false,
      message: "Register gagal",
      error: error.message,
    });

  }

}