"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* FLOATING BUTTON */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-red-600 shadow-2xl shadow-red-500/40 flex items-center justify-center text-2xl"
      >
        💬
      </motion.button>

      {/* CHAT WINDOW */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-28 right-6 z-50 w-[350px] max-w-[90vw] rounded-[35px] overflow-hidden border border-white/10 bg-[#0d0d0d]/95 backdrop-blur-2xl shadow-2xl shadow-red-500/20"
          >

            {/* HEADER */}
            <div className="bg-red-600 p-5">
              <h2 className="text-xl font-black">
                ORAWIM AI
              </h2>

              <p className="text-sm text-red-100 mt-1">
                Customer Support Assistant
              </p>
            </div>

            {/* CHAT BODY */}
            <div className="p-5 h-[350px] overflow-y-auto space-y-4">

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-fit max-w-[85%]">
                Halo 👋
                <br />
                Ada yang bisa kami bantu?
              </div>

              <div className="bg-red-600 rounded-2xl p-4 w-fit max-w-[85%] ml-auto">
                Saya ingin booking servis
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-fit max-w-[85%]">
                Baik 🔥
                <br />
                Silakan pilih tanggal booking.
              </div>

            </div>

            {/* INPUT */}
            <div className="border-t border-white/10 p-4 flex gap-3">
              
              <input
                type="text"
                placeholder="Tulis pesan..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-red-500"
              />

              <button className="bg-red-600 hover:bg-red-700 transition px-5 rounded-2xl font-semibold">
                Kirim
              </button>

            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}