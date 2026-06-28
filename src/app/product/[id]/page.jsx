"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Star, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import { products as staticProducts } from "@/data/product";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = parseInt(params.id);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [qty, setQty] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parseNumericPrice = (price) => {
    if (typeof price === "number") return price;
    if (!price) return 0;
    const digits = price.toString().replace(/[^0-9]/g, "");
    return Number(digits) || 0;
  };

  const requireLoginOrRedirect = async () => {
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
      if (!res.ok || !data.success) {
        window.alert("Silakan login terlebih dahulu sebelum melakukan aksi ini.");
        router.push("/login");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Auth check failed:", error);
      window.alert("Silakan login terlebih dahulu sebelum melakukan aksi ini.");
      router.push("/login");
      return false;
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Coba fetch dari API dulu
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.data);
          setSelectedImage(data.data.image);
        } else {
          // Fallback ke static products
          const foundProduct = staticProducts.find((p) => p.id === productId);
          if (foundProduct) {
            setProduct(foundProduct);
            setSelectedImage(foundProduct.image);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        // Fallback ke static products
        const foundProduct = staticProducts.find((p) => p.id === productId);
        if (foundProduct) {
          setProduct(foundProduct);
          setSelectedImage(foundProduct.image);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <section className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            <p className="text-gray-400 mt-4">Memuat produk...</p>
          </div>
        </section>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <section className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-4">Produk tidak ditemukan</p>
            <button
              onClick={() => router.back()}
              className="bg-red-600 hover:bg-red-700 transition px-6 py-3 rounded-2xl font-semibold"
            >
              Kembali
            </button>
          </div>
        </section>
      </>
    );
  }

  const images = [selectedImage];

  const handleOrderSubmit = async (event) => {
    event.preventDefault();

    if (!customerName || !phoneNumber || !shippingAddress) {
      return;
    }

    try {
      setIsSubmitting(true);

      const authResponse = await fetch("/api/me");
      const authData = await authResponse.json();

      if (!authResponse.ok || !authData.success) {
        window.alert("Silakan login terlebih dahulu sebelum melakukan pemesanan.");
        setIsSubmitting(false);
        router.push("/login");
        return;
      }

      const price = product.priceValue ?? parseNumericPrice(product.price);
      const orderItems = [
        {
          productId: product.id,
          quantity: qty,
          price,
        },
      ];

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
        throw new Error(data.message || "Gagal mengirim pesanan");
      }

      setOrderModalOpen(false);
      setCustomerName("");
      setPhoneNumber("");
      setShippingAddress("");
      setOrderNotes("");

      window.alert("Pesanan berhasil dikirim ke database. Terima kasih!");
    } catch (error) {
      console.error("Order submit error:", error);
      window.alert(error.message || "Terjadi kesalahan saat mengirim pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="min-h-fit bg-[#050505] text-white px-4 md:px-6 py-20">
        <div className="max-w-7xl mx-auto">
          {/* BACK BUTTON */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition mb-8"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* LEFT */}
            <div>
              {/* IMAGE */}
              <div className="bg-[#111111] rounded-2xl overflow-hidden border border-white/5">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-[350px] md:h-[500px] object-cover"
                />
              </div>

              {/* THUMBNAILS */}
              {images.length > 1 && (
                <div className="flex gap-3 mt-4">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className={`w-24 h-24 rounded-xl overflow-hidden border ${
                        selectedImage === img
                          ? "border-red-500"
                          : "border-white/10"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div>
              {/* TITLE */}
              <h1 className="text-2xl md:text-4xl font-bold leading-tight">
                {product.name}
              </h1>

              {/* RATING */}
              <div className="flex items-center gap-3 mt-4 text-sm">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star size={16} fill="currentColor" />
                  <span>{product.rating}</span>
                </div>
                <span className="text-gray-400">{product.sold} Terjual</span>
              </div>

              {/* PRICE */}
              <h2 className="text-3xl md:text-4xl font-black text-red-500 mt-6">
                {product.price}
              </h2>

              {/* DESC */}
              <div className="mt-6 whitespace-pre-line leading-8 text-gray-400">
                {product.description}
              </div>

              {/* STOCK INFO */}
              <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-sm text-gray-400">
                  Stok Tersedia: <span className="text-green-400 font-bold">{product.stock}</span>
                </p>
              </div>

              {/* QUANTITY */}
              <div className="mt-8">
                <p className="text-sm text-gray-400 mb-3">Quantity</p>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => qty > 1 && setQty(qty - 1)}
                    className="w-10 h-10 rounded-xl border transition"
                  >
                    -
                  </button>

                  <span className="text-xl font-bold">{qty}</span>

                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-10 rounded-xl border transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* BUTTON */}
              <div className="flex gap-3 mt-10">
                <button
                  onClick={async () => {
                    const loggedIn = await requireLoginOrRedirect();
                    if (!loggedIn) return;
                    setOrderModalOpen(true);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 transition py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  Buy Now
                </button>

                <button
                  onClick={() => setWishlist(!wishlist)}
                  className={`w-14 rounded-xl border flex items-center justify-center transition ${
                    wishlist
                      ? "bg-red-600 border-red-600"
                      : "bg-white/5 border-white/10 hover:border-red-500"
                  }`}
                >
                  <ShoppingCart 
                    size={20} 
                    fill={wishlist ? "white" : "transparent"}
                  />
                </button>

                <button
                  onClick={() => setWishlist(!wishlist)}
                  className={`w-14 rounded-xl border flex items-center justify-center transition ${
                    wishlist
                      ? "bg-red-600 border-red-600"
                      : "bg-white/5 border-white/10 hover:border-red-500"
                  }`}
                >
                  <Heart
                    size={20}
                    fill={wishlist ? "white" : "transparent"}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              className="w-full max-w-md rounded-[28px] bg-[#111111] border border-white/10 p-6 text-white shadow-2xl"
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
    </>
  );
}