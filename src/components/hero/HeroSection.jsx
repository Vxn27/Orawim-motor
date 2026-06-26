"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function HeroSection() {

  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-[#050505] pt-28 pb-20">

      {/* BG GLOW */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/10 blur-[120px] rounded-full" />

      <div className="w-full px-5 lg:px-12">

        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[85vh]">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >

            {/* TITLE */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight max-w-[520px]">

              SERVICE &
              <span className="text-red-500"> SPAREPART </span>
              MOTOR DALAM
              SATU PLATFORM

            </h1>

            {/* DESC */}
            <p className="text-gray-400 text-base md:text-lg mt-6 leading-relaxed max-w-[540px]">
              Booking servis, pembelian sparepart, konsultasi motor,
              dan chatbot AI bengkel modern dalam satu website.
            </p>
            

            {/* BUTTON */}
            <div className="flex flex-wrap gap-4 mt-12">

              <button
                onClick={() => router.push("/booking")}
                className="bg-red-600 hover:bg-red-700 transition px-7 py-4 rounded-2xl font-semibold"
              >
                Booking Sekarang
              </button>

              <button
                onClick={() => router.push("/product")}
                className="border border-white/10 hover:border-red-500 hover:bg-red-500/10 transition px-7 py-4 rounded-2xl"
              >
                Lihat Produk
              </button>

            </div>

          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full"
          >

            <div className="w-full h-full bg-white/5 border border-white/10 rounded-[24px] overflow-hidden shadow-2xl shadow-red-500/10">

              <img
                src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1400&auto=format&fit=crop"
                alt="Motor"
                className="w-full h-[600px] object-cover"
              />

            </div>

          </motion.div>

        </div>

      </div>

    </section>
  );
}