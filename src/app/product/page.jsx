"use client";

import Navbar from "@/components/navbar/Navbar";
import { ShoppingCart, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { products as staticProducts } from "@/data/product";
import { addToCart } from "@/lib/cart";

export default function ProductPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const searchRef = useRef(null);


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  // Handle search input dan generate suggestions
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (value.trim().length > 0) {
      // Filter produk berdasarkan input
      const filtered = (products.length > 0 ? products : staticProducts).filter(
        (product) =>
          product.name.toLowerCase().includes(value.toLowerCase())
      );

      setSuggestions(filtered.slice(0, 5)); // Tampilkan max 5 suggestions
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle klik pada suggestion
  const handleSuggestionClick = (product) => {
    router.push(`/product/${product.id}`);
    setShowSuggestions(false);
  };

  const handleAddToCart = async (product, event) => {
  event.stopPropagation();
  const result = await addToCart(product, 1);
  if (result.success) {
    setCartMessage("Produk berhasil ditambahkan");
  } else {
    setCartMessage(result.message || "Gagal menambahkan, silakan login dulu");
  }
  setTimeout(() => setCartMessage(""), 2500);
};

  // Handle click outside untuk close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <>
      <Navbar />

      <main className="bg-[#050505] text-white min-h-screen">

        {/* HERO SECTION */}
        <section className="pt-32">
          <div className="px-5 lg:px-12">

            <p className="text-red-500 font-semibold tracking-widest text-sm mb-3">
              ORAWIM STORE
            </p>

            <h1 className="text-4xl md:text-6xl font-black leading-tight">
              Sparepart & Oli Motor
            </h1>

            <p className="text-gray-400 text-lg mt-5 max-w-2xl">
              Produk premium dengan stock realtime dan kualitas terbaik.
            </p>

          </div>
        </section>

        {/* SEARCH SECTION */}
        <section className="pt-14">
          <div className="px-5 lg:px-12">

            <div className="flex flex-col md:flex-row gap-4">

              <div className="flex-1 relative" ref={searchRef}>
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  onFocus={() => searchInput && setShowSuggestions(true)}
                  placeholder="Cari oli, sparepart, aksesoris..."
                  className="w-full h-14 bg-[#111111] border border-white/10 rounded-2xl px-5 outline-none focus:border-red-500 transition"
                />

                {/* SUGGESTIONS DROPDOWN */}
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#111111] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl"
                  >
                    <div className="max-h-80 overflow-y-auto">
                      {suggestions.map((product, index) => (
                        <button
                          key={product.id}
                          onClick={() => handleSuggestionClick(product)}
                          className={`w-full px-5 py-4 text-left hover:bg-red-600/20 transition flex items-center gap-3 ${
                            index !== suggestions.length - 1
                              ? "border-b border-white/5"
                              : ""
                          }`}
                        >
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm truncate">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-red-500 font-bold text-sm">
                                {product.price}
                              </p>
                              <p className="text-yellow-400 text-xs flex items-center gap-1">
                                <Star size={12} fill="currentColor" />
                                {product.rating}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 text-xs">
                              Stock: {product.stock}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {showSuggestions && searchInput && suggestions.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#111111] border border-white/10 rounded-2xl px-5 py-4 z-50"
                  >
                    <p className="text-gray-400 text-center text-sm">
                      Produk tidak ditemukan
                    </p>
                  </motion.div>
                )}
              </div>

              <button className="bg-red-600 hover:bg-red-700 transition px-8 h-14 rounded-2xl font-semibold whitespace-nowrap">
                Cari Produk
              </button>

            </div>

          </div>
        </section>

        {/* PRODUCT SECTION */}
        <section className="pt-15 pb-20">
          <div className="px-5 lg:px-12">

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                  <p className="text-gray-400 mt-4">Memuat produk...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

              {products.map((product) => (
                <motion.div
                  key={product.id}
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
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full mt-6 bg-red-600 hover:bg-red-700 transition py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} />
                      Add to Cart
                    </button>

                  </div>

                </motion.div>
              ))}

              </div>
            )}
          </div>
        </section>

      </main>

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