import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getAdminUser, adminUnauthorized } from "@/lib/admin";

function getLimitFromRequest(url) {
  const { searchParams } = new URL(url);
  const rawLimit = searchParams.get("limit");

  if (!rawLimit || rawLimit.toLowerCase() === "all") {
    return null;
  }

  const parsed = Number.parseInt(rawLimit, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
}

function buildUnauthorized() {
  return adminUnauthorized();
}

export async function GET(req) {
  const adminUser = await getAdminUser();
  if (!adminUser || adminUser.role !== "admin") {
    return buildUnauthorized();
  }

  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode");

    if (mode === "options") {
      const [categoryRows] = await db.query("SELECT id, name FROM categories ORDER BY name ASC");
      const [brandRows] = await db.query("SELECT id, name FROM brands ORDER BY name ASC");
      return NextResponse.json({
        success: true,
        data: {
          categories: categoryRows,
          brands: brandRows,
        },
      });
    }

    const limit = getLimitFromRequest(req.url);
    const query = `SELECT id, name, description, price, stock, image, brand_id, category_id FROM products ORDER BY id ASC${limit ? ` LIMIT ${limit}` : ""}`;
    const [rows] = await db.query(query);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Admin products error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat produk." },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const adminUser = await getAdminUser();
  if (!adminUser || adminUser.role !== "admin") {
    return buildUnauthorized();
  }

  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const price = Number(body.price);
    const stock = Number(body.stock);
    const image = String(body.image || "").trim();
    const rawBrandId = body.brand_id ?? null;
    const rawCategoryId = body.category_id ?? body.categoryId ?? null;
    const brandId =
    rawBrandId === "" ||
    rawBrandId === null ||
    rawBrandId === undefined
      ? null
      : Number(rawBrandId);
    const categoryId = rawCategoryId === "" || rawCategoryId === null || rawCategoryId === undefined ? null : Number(rawCategoryId);

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Nama produk wajib diisi." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { success: false, message: "Harga produk tidak valid." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(stock) || stock < 0) {
      return NextResponse.json(
        { success: false, message: "Stok produk tidak valid." },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      "INSERT INTO products (name, description, price, stock, image, brand_id, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, description, price, stock, image, brandId, categoryId]
    );

    const [rows] = await db.query(
      "SELECT id, name, description, price, stock, image, brand_id, category_id FROM products WHERE id = ?",
      [result.insertId]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Admin create product error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menambahkan produk." },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const adminUser = await getAdminUser();
  if (!adminUser || adminUser.role !== "admin") {
    return buildUnauthorized();
  }

  try {
    const body = await req.json().catch(() => ({}));
    const id = Number(body.id);
    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const price = Number(body.price);
    const stock = Number(body.stock);
    const image = String(body.image || "").trim();
    const rawBrandId = body.brand_id ?? null;
    const rawCategoryId = body.category_id ?? body.categoryId ?? null;
    const brandId =
    rawBrandId === "" ||
    rawBrandId === null ||
    rawBrandId === undefined
      ? null
      : Number(rawBrandId);
    const categoryId = rawCategoryId === "" || rawCategoryId === null || rawCategoryId === undefined ? null : Number(rawCategoryId);

    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: "ID produk tidak valid." },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Nama produk wajib diisi." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { success: false, message: "Harga produk tidak valid." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(stock) || stock < 0) {
      return NextResponse.json(
        { success: false, message: "Stok produk tidak valid." },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      "UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image = ?, brand_id = ?, category_id = ? WHERE id = ?",
      [name, description, price, stock, image, brandId, categoryId, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    const [rows] = await db.query(
      "SELECT id, name, description, price, stock, image, brand_id, category_id FROM products WHERE id = ?",
      [id]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Admin update product error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui produk." },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const adminUser = await getAdminUser();
  if (!adminUser || adminUser.role !== "admin") {
    return buildUnauthorized();
  }

  const connection = await db.getConnection();

  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isFinite(id) || id <= 0) {
      connection.release();
      return NextResponse.json(
        { success: false, message: "ID produk tidak valid." },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    await connection.query("DELETE FROM order_items WHERE product_id = ?", [id]);
    const [result] = await connection.query("DELETE FROM products WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    await connection.commit();
    connection.release();

    return NextResponse.json({ success: true, message: "Produk berhasil dihapus." });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback delete product error:", rollbackError);
      }
      connection.release();
    }

    console.error("Admin delete product error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus produk." },
      { status: 500 }
    );
  }
}
