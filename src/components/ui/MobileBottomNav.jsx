"use client";

import { motion } from "framer-motion";

const menus = [
  { icon: "🏠", label: "Home" },
  { icon: "🛒", label: "Produk" },
  { icon: "📅", label: "Booking" },
  { icon: "💬", label: "Chat" },
  { icon: "👤", label: "Profile" },
];

export default function MobileBottomNav() {
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 md:hidden">
      
      <div className="mx-4 mb-4 bg-[#111111]/90 backdrop-blur-2xl border border-white/10 rounded-[30px] px-4 py-3 flex justify-between items-center shadow-2xl shadow-red-500/10">
        
        {menus.map((menu, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-red-500 transition"
          >
            <span className="text-xl">
              {menu.icon}
            </span>

            <span className="text-[11px]">
              {menu.label}
            </span>
          </motion.button>
        ))}

      </div>

    </div>
  );
}