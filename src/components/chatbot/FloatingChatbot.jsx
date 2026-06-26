"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      role: "assistant",
      content: "Halo 👋 Ada yang bisa kami bantu mengenai layanan WIM Motor?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat, open]);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    // Hitung apakah ini pesan pertama dari user (bukan counting greeting assistant)
    const userMessageCount = chat.filter((msg) => msg.role === "user").length;
    const isFirstMessage = userMessageCount === 0;

    setChat((prev) => [...prev, { role: "user", content: trimmedMessage }]);
    setMessage("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedMessage, isFirstMessage }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Terjadi kesalahan chat");
      }

      setChat((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err?.message || "Gagal mengirim pesan. Coba lagi.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

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
              {chat.map((item, index) => {
                const isUser = item.role === "user";
                return (
                  <div
                    key={index}
                    className={`rounded-2xl p-4 max-w-[85%] ${
                      isUser
                        ? "bg-red-600 text-white ml-auto"
                        : "bg-white/5 border border-white/10 text-white"
                    }`}
                  >
                    {item.content}
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* INPUT */}
            <div className="border-t border-white/10 p-4 flex gap-3">
              
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tulis pesan..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-red-500"
              />

              <button
                onClick={sendMessage}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 transition px-5 rounded-2xl font-semibold disabled:cursor-not-allowed disabled:bg-red-500"
              >
                {loading ? "Kirim..." : "Kirim"}
              </button>

            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}