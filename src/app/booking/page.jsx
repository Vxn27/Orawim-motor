"use client";

import Navbar from "@/components/navbar/Navbar";
import { motion } from "framer-motion";

const services = [
  "Service Mesin",
  "Ganti Oli",
  "Tune Up",
  "Service Kelistrikan",
  "Ban & Rem",
];

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">

      <Navbar />

      <section className="w-full px-5 lg:px-12 pt-32 pb-20">

        {/* HEADER */}
        <div className="w-full mb-14">

          <p className="text-red-500 font-semibold tracking-widest text-sm">
            BOOKING SERVICE
          </p>

          <h1 className="text-4xl md:text-6xl font-black mt-4 leading-tight">
            Booking Service
            <br />
            ORAWIM MOTOR
          </h1>

        </div>

        {/* CONTENT */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[#111111] border border-white/5 rounded-[35px] p-8"
          >

            <h2 className="text-3xl font-black mb-8">
              Pilih Layanan
            </h2>

            <div className="space-y-4">

              {services.map((service, index) => (

                <button
                  key={index}
                  className="w-full text-left bg-black/30 hover:bg-red-600 transition px-6 py-5 rounded-2xl font-semibold"
                >
                  {service}
                </button>

              ))}

            </div>

          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[#111111] border border-white/5 rounded-[35px] p-8"
          >

            <h2 className="text-3xl font-black mb-8">
              Form Booking
            </h2>

            <div className="space-y-5">

              <input
                type="text"
                placeholder="Nama Lengkap"
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500"
              />

              <input
                type="text"
                placeholder="Nomor HP"
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500"
              />

              <input
                type="date"
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500"
              />

              <textarea
                rows="5"
                placeholder="Keluhan Motor..."
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500"
              />

              <input
                type="file"
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4"
              />

              <button className="w-full bg-red-600 hover:bg-red-700 transition py-4 rounded-2xl font-bold text-lg">
                Booking Sekarang
              </button>

            </div>

          </motion.div>

        </div>

      </section>

    </main>
  );
}