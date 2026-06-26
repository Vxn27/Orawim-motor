"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/cart";

export default function ProductCard({ product }) {
  const router = useRouter();
  const [cartMessage, setCartMessage] = useState("");

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

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const result = await addToCart(product, 1);
    if (result.success) {
      setCartMessage("Produk berhasil ditambahkan");
    } else {
      setCartMessage(result.message || "Gagal menambahkan, silakan login dulu");
    }
    setTimeout(() => setCartMessage(""), 2500);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.2 }}
        onClick={() => router.push(`/product/${product.id}`)}
        className="bg-[#111111] border border-white/5 rounded-[28px] overflow-hidden hover:border-red-500/30 transition cursor-pointer"
      >
        {/* IMAGE */}
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-[260px] object-cover hover:scale-105 transition duration-500"
          />

          <div className="absolute top-4 left-4 bg-red-600 text-white text-[11px] px-3 py-1 rounded-full font-bold">
            HOT
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          <h2 className="text-xl font-bold leading-snug min-h-[64px]">
            {product.name}
          </h2>

          <p className="text-red-500 text-3xl font-black mt-5">
            {product.price}
          </p>

          <div className="flex items-end justify-between mt-5">
            <div>
              <div className="flex items-center gap-1 text-yellow-400 text-sm">
                <Star size={14} fill="currentColor" />
                <span>{product.rating}</span>
              </div>

              <p className="text-green-400 text-sm mt-1">
                Stock {product.stock}
              </p>
            </div>

            <p className="text-gray-400 text-sm">
              Sold {product.sold}
            </p>
          </div>

          <button
            onClick={async (e) => {
              e.stopPropagation();
              const loggedIn = await requireLoginOrRedirect();
              if (!loggedIn) return;
              router.push(`/product/${product.id}`);
            }}
            className="w-full mt-6 bg-green-600 hover:bg-green-700 transition py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            Buy Now
          </button>

          <button
            onClick={handleAddToCart}
            className="w-full mt-6 bg-red-600 hover:bg-red-700 transition py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {cartMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-0 top-10 mx-auto z-50 w-full max-w-md rounded-2xl bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-2xl shadow-black/40"
          >
            {cartMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}