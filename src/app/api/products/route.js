import db from "@/lib/db";

export async function GET(req) {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT id, name, description, price, stock, image FROM products LIMIT 100"
    );
    connection.release();

    // format data untuk frontend (tambah rating & sold dari dummy data)
    const products = rows.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: `Rp ${product.price.toLocaleString("id-ID")}`,
      priceValue: product.price,
      stock: product.stock,
      image: product.image,
      rating: (Math.random() * 0.2 + 4.7).toFixed(1), // random 4.7-4.9
      sold: Math.floor(Math.random() * 200) + 40, // random 40-240
    }));

    return Response.json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
