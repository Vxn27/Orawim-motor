export const getCartItems = async () => {
  try {
    const res = await fetch("/api/cart");
    const data = await res.json();
    if (!data.success) return [];
    return data.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    return [];
  }
};

export const addToCart = async (product, quantity = 1) => {
  try {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity }),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, message: "Gagal menambahkan ke keranjang." };
  }
};

export const updateCartQuantity = async (productId, quantity) => {
  try {
    await fetch(`/api/cart/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: quantity > 0 ? quantity : 1 }),
    });
    return await getCartItems();
  } catch (error) {
    console.error("Error updating quantity:", error);
    return await getCartItems();
  }
};

export const removeCartItem = async (productId) => {
  try {
    await fetch(`/api/cart/${productId}`, { method: "DELETE" });
    return await getCartItems();
  } catch (error) {
    console.error("Error removing cart item:", error);
    return await getCartItems();
  }
};

const parsePrice = (price) => {
  if (typeof price !== "string") return Number(price) || 0;
  const numeric = price.replace(/[^0-9]/g, "");
  return Number(numeric) || 0;
};

export const getCartSubtotal = async () => {
  const items = await getCartItems();
  return items.reduce((total, item) => {
    return total + parsePrice(item.price) * item.quantity;
  }, 0);
};

export const parseCartPrice = parsePrice;