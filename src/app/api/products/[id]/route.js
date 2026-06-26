import db from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    console.log("ID yang diterima:", id, typeof id);

    const connection = await db.getConnection();

    const [rows] = await connection.query(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    connection.release();

    if (rows.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    const product = rows[0];
    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: `Rp ${product.price.toLocaleString("id-ID")}`,
      priceValue: product.price,
      stock: product.stock,
      image: product.image,
      rating: (Math.random() * 0.2 + 4.7).toFixed(1),
      sold: Math.floor(Math.random() * 200) + 40,
    };

    return Response.json({
      success: true,
      data: formattedProduct,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}