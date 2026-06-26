"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PaymentPage() {

  const [image, setImage] = useState(null);
  const [verified, setVerified] = useState(false);

  const handleUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(URL.createObjectURL(file));

      setTimeout(() => {
        setVerified(true);
      }, 2500);
    }
  };

  return (
    <section className="min-h-screen bg-[#050505] text-white px-5 py-10 overflow-hidden">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-14">

        <p className="text-red-500 font-semibold">
          OCR PAYMENT SYSTEM
        </p>

        <h1 className="text-4xl md:text-6xl font-black mt-4 leading-tight">
          Upload Bukti <br />
          Pembayaran
        </h1>

      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10">

        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white/5 border border-white/10 rounded-[35px] p-8 backdrop-blur-2xl"
        >

          <h2 className="text-3xl font-black mb-8">
            Upload Transfer
          </h2>

          <div className="space-y-5">

            <div>
              <label className="text-gray-400 text-sm">
                Nama Pengirim
              </label>

              <input
                type="text"
                placeholder="Masukkan nama"
                className="w-full mt-2 bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm">
                Metode Pembayaran
              </label>

              <select className="w-full mt-2 bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500">
                <option>BCA</option>
                <option>BRI</option>
                <option>DANA</option>
                <option>QRIS</option>
              </select>
            </div>

            <div>
              <label className="text-gray-400 text-sm">
                Upload Bukti
              </label>

              <input
                type="file"
                onChange={handleUpload}
                className="w-full mt-2 bg-black/30 border border-white/10 rounded-2xl px-5 py-4"
              />
            </div>

          </div>

        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white/5 border border-white/10 rounded-[35px] p-8 backdrop-blur-2xl flex flex-col justify-center"
        >

          <h2 className="text-3xl font-black mb-8">
            OCR Detection
          </h2>

          {!image && (
            <div className="border-2 border-dashed border-white/10 rounded-[30px] h-[350px] flex items-center justify-center text-gray-500">
              Belum ada bukti upload
            </div>
          )}

          {image && (
            <div className="relative">

              <img
                src={image}
                className="w-full h-[350px] object-cover rounded-[30px]"
              />

              <AnimatePresence>

                {!verified && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/70 rounded-[30px] flex flex-col items-center justify-center"
                  >

                    <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />

                    <p className="mt-6 text-lg font-semibold">
                      OCR Sedang Memproses...
                    </p>

                  </motion.div>
                )}

              </AnimatePresence>

              {verified && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 bg-green-500/20 border border-green-500 rounded-[30px] flex flex-col items-center justify-center"
                >

                  <div className="text-7xl">
                    ✅
                  </div>

                  <h2 className="text-3xl font-black mt-5">
                    VERIFIED
                  </h2>

                  <p className="text-green-300 mt-2">
                    Pembayaran berhasil diverifikasi
                  </p>

                </motion.div>
              )}

            </div>
          )}

        </motion.div>

      </div>

    </section>
  );
}