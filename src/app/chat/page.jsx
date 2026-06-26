"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";

export default function ChatPage() {
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
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setChat((prev) => [...prev, { role: "user", content: trimmedMessage }]);
    setMessage("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedMessage }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Terjadi kesalahan chat");
      }

      setChat((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Gagal mengirim pesan. Coba lagi.");
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
    <main className="bg-[#050505] text-white min-h-screen">
      <Navbar />
      <div className="pt-28 px-5 lg:px-12 pb-16">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-red-500">Chatbot WIM Motor</p>
            <h1 className="text-4xl font-black sm:text-5xl">Tanya layanan bengkel langsung ke AI.</h1>
            <p className="max-w-2xl text-gray-300">
              Kirim pertanyaan seputar servis, biaya, dan layanan. AI akan menjawab berdasarkan data layanan yang tersedia.
            </p>
          </div>

          <div className="rounded-[40px] border border-white/10 bg-[#0d0d0d]/90 p-5 shadow-2xl shadow-red-500/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold">Chat dengan AI</h2>
                <p className="text-sm text-gray-400">Gunakan chat untuk menanyakan layanan bengkel WIM Motor.</p>
              </div>
            </div>

            <div className="min-h-[420px] overflow-hidden rounded-[32px] border border-white/10 bg-[#050505]">
              <div className="h-[450px] overflow-y-auto p-5 space-y-4">
                {chat.map((item, index) => (
                  <div
                    key={index}
                    className={`max-w-[85%] rounded-3xl px-5 py-4 ${
                      item.role === "assistant"
                        ? "bg-white/5 border border-white/10 text-gray-100"
                        : "bg-red-600 text-white ml-auto"
                    }`}
                  >
                    <div className="mb-2 text-[10px] uppercase tracking-[0.3em] opacity-70">
                      {item.role === "assistant" ? "AI" : "User"}
                    </div>
                    <div className="whitespace-pre-wrap break-words">{item.content}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              {error ? (
                <div className="mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={3}
                  placeholder="Tulis pesan..."
                  className="min-h-[96px] flex-1 resize-none rounded-3xl border border-white/10 bg-black/70 px-4 py-4 text-sm text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={loading}
                  className="inline-flex h-14 items-center justify-center rounded-3xl bg-red-600 px-6 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-500"
                >
                  {loading ? "Mengirim..." : "Kirim"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
