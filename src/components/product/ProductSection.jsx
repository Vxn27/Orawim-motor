"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";

export default function ProductSection() {

  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) {
          // hanya ambil 4 produk pertama untuk section
          setProducts(data.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="w-full bg-[#050505] py-10">

      <div className="w-full px-5 lg:px-12">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-12">

          <div>

            <p className="text-red-500 font-semibold tracking-[3px] text-sm uppercase">
              ORAWIM Store
            </p>

            <h2 className="text-4xl md:text-6xl font-black mt-3 leading-tight">
              Produk Terlaris
            </h2>

          </div>

          <button
            onClick={() => router.push("/product")}
            className="hidden md:flex items-center justify-center border border-white/10 hover:border-red-500 hover:bg-red-500/10 transition px-6 py-3 rounded-2xl text-sm"
          >
            Lihat Semua
          </button>

        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 w-full">

          {loading ? (
            <div className="col-span-full text-center py-10">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
              <p className="text-gray-400 mt-3">Memuat produk...</p>
            </div>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>

      </div>

    </section>
  );
}