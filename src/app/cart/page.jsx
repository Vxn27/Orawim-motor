"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCartItems,
  getCartSubtotal,
  updateCartQuantity,
  removeCartItem,
} from "@/lib/cart";

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCart = async () => {
    const items = await getCartItems();
    setCartItems(items);
    const sub = await getCartSubtotal();
    setSubtotal(sub);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadCart();
      setLoading(false);
    };
    init();
  }, []);

  const handleQtyChange = async (productId, newQty) => {
    await updateCartQuantity(productId, newQty);
    await loadCart();
  };

  const handleRemoveItem = async (productId) => {
    await removeCartItem(productId);
    await loadCart();
  };

  const requireLoginOrRedirect = async () => {
    try {
      const response = await fetch("/api/me");
      const data = await response.json();
      if (!response.ok || !data.success) {
        window.alert("Silakan login terlebih dahulu sebelum melakukan checkout.");
        router.push("/login");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Auth check failed:", error);
      window.alert("Silakan login terlebih dahulu sebelum melakukan checkout.");
      router.push("/login");
      return false;
    }
  };

  const handleOrderSubmit = async (event) => {
    event.preventDefault();
    if (!customerName || !phoneNumber || !shippingAddress) {
      return;
    }

    const orderItems = cartItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      price: (item.priceValue ?? Number(item.price.toString().replace(/[^0-9]/g, ""))) || 0,
    }));

    if (orderItems.length === 0) {
      window.alert("Keranjang kosong. Tambahkan produk terlebih dahulu.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderItems,
          customerName,
          phoneNumber,
          shippingAddress,
          notes: orderNotes,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal mengirim pesanan.");
      }

      setOrderModalOpen(false);
      setCustomerName("");
      setPhoneNumber("");
      setShippingAddress("");
      setOrderNotes("");

      await loadCart();
      window.alert("Pesanan berhasil dibuat dan tersimpan di database.");
    } catch (error) {
      console.error("Cart order submit error:", error);
      window.alert(error.message || "Terjadi kesalahan saat mengirim pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          <p className="text-gray-400 mt-4">Memuat keranjang...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#050505] text-white px-5 py-10">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-14">

        <p className="text-red-500 font-semibold">
          SHOPPING CART
        </p>

        <h1 className="text-4xl md:text-6xl font-black mt-4">
          Keranjang Belanja
        </h1>

      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-5">
          {cartItems.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-[35px] p-10 text-center text-gray-300">
              <p className="text-2xl font-semibold mb-3">Keranjang belanja kosong</p>
              <p>Tambahkan produk ke keranjang dari halaman produk.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -5 }}
                className="bg-white/5 border border-white/10 rounded-[35px] p-6 flex flex-col md:flex-row gap-5"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full md:w-[220px] h-[220px] object-cover rounded-[25px]"
                />

                <div className="flex-1">
                  <h2 className="text-3xl font-black">{item.name}</h2>

                  <p className="text-red-500 text-2xl font-black mt-3">
                    {item.price}
                  </p>

                  <p className="text-gray-400 mt-4">Stok: {item.stock}</p>

                  <div className="flex items-center gap-4 mt-8">
                    <button
                      onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                      className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-xl"
                    >
                      -
                    </button>

                    <div className="text-2xl font-bold">{item.quantity}</div>

                    <button
                      onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                      className="w-12 h-12 rounded-2xl bg-red-600 text-xl"
                    >
                      +
                    </button>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="ml-auto text-sm text-gray-300 hover:text-white"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* RIGHT */}
        <div className="bg-white/5 border border-white/10 rounded-[35px] p-8 h-fit sticky top-10">

          <h2 className="text-3xl font-black mb-8">
            Checkout
          </h2>

          <div className="space-y-5">

            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString()}</span>
            </div>

            <div className="border-t border-white/10 pt-5 flex justify-between text-2xl font-black">
              <span>Total</span>
              <span>
                Rp {(subtotal).toLocaleString()}
              </span>
            </div>

            <button
              onClick={async () => {
                const loggedIn = await requireLoginOrRedirect();
                if (loggedIn) {
                  setOrderModalOpen(true);
                }
              }}
              className="w-full bg-red-600 hover:bg-red-700 transition py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-red-500/30 mt-5"
            >
              Checkout Sekarang
            </button>

          </div>

        </div>

      </div>

      <AnimatePresence>
        {orderModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-10"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-2xl rounded-[32px] bg-[#111111] border border-white/10 p-8 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs uppercase text-red-500 tracking-[3px]">Checkout</p>
                  <h2 className="text-2xl font-black mt-1">Form Pemesanan Produk</h2>
                </div>
              </div>

              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Nama Lengkap</label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0d0d0d] px-4 py-3 text-white outline-none focus:border-red-500"
                    placeholder="Masukkan nama Anda"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400">Nomor Telepon</label>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0d0d0d] px-4 py-3 text-white outline-none focus:border-red-500"
                    placeholder="Masukkan nomor telepon"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400">Alamat Pengiriman</label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="mt-2 w-full min-h-[80px] rounded-2xl border border-white/10 bg-[#0d0d0d] px-4 py-3 text-white outline-none focus:border-red-500 resize-none"
                    placeholder="Masukkan alamat pengiriman"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400">Catatan Tambahan (opsional)</label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="mt-2 w-full min-h-[60px] rounded-2xl border border-white/10 bg-[#0d0d0d] px-4 py-3 text-white outline-none focus:border-red-500 resize-none"
                    placeholder="Masukkan catatan untuk penjual"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setOrderModalOpen(false)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:border-red-500 transition"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full rounded-2xl px-6 py-3 text-sm font-semibold text-white transition ${
                      isSubmitting
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {isSubmitting ? "Mengirim..." : "Kirim Pesanan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}