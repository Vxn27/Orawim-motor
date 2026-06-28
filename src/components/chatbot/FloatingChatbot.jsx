"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const services = [
  { id: 1, name: "Service Mesin" },
  { id: 2, name: "Ganti Oli" },
  { id: 3, name: "Tune Up" },
  { id: 4, name: "Service Kelistrikan" },
  { id: 5, name: "Ban & Rem" },
];

const defaultBookingData = {
  service_id: null,
  name: "",
  phone: "",
  booking_date: "",
  complaint: "",
  payment_method: "",
  down_payment: 25000,
};

const bookingKeywords = /booking|book|reservasi|pesan.*service|pesan.*booking|jadwal/i;

function normalizeDate(value) {
  const trimmed = value.trim();
  const isoMatch = trimmed.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${String(isoMatch[2]).padStart(2, "0")}-${String(isoMatch[3]).padStart(2, "0")}`;
  }

  const dmyMatch = trimmed.match(/(\d{1,2})[\/ -](\d{1,2})[\/ -](\d{4})/);
  if (dmyMatch) {
    return `${dmyMatch[3]}-${String(dmyMatch[2]).padStart(2, "0")}-${String(dmyMatch[1]).padStart(2, "0")}`;
  }

  return null;
}

function resolveService(input) {
  const normalizedInput = input.trim().toLowerCase();

  const byId = Number(normalizedInput);
  if (!Number.isNaN(byId)) {
    return services.find((service) => service.id === byId) || null;
  }

  const exactMatch = services.find((service) => service.name.toLowerCase() === normalizedInput);
  if (exactMatch) return exactMatch;

  return (
    services.find((service) => service.name.toLowerCase().includes(normalizedInput)) ||
    services.find((service) => normalizedInput.includes(service.name.toLowerCase())) ||
    null
  );
}

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      role: "assistant",
      content: "Halo 👋 Ada yang bisa kami bantu mengenai layanan ORAWIM MOTOR?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingMode, setBookingMode] = useState(false);
  const [bookingStep, setBookingStep] = useState(null);
  const [bookingData, setBookingData] = useState(defaultBookingData);
  const [userId, setUserId] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const chatEndRef = useRef(null);

  const addChatMessage = (content, role = "assistant") => {
    setChat((prev) => [...prev, { role, content }]);
  };

  const resetBooking = () => {
    setBookingMode(false);
    setBookingStep(null);
    setBookingData(defaultBookingData);
  };

  const startBookingFlow = (prefill = {}) => {
    const nextData = { ...defaultBookingData, ...prefill };
    setBookingData(nextData);
    const initialStep = nextData.service_id ? "name" : "service";
    setBookingMode(true);
    setBookingStep(initialStep);

    if (nextData.service_id) {
      const selectedService = services.find((service) => service.id === nextData.service_id);
      addChatMessage(
        `Siap, saya sudah menyiapkan layanan ${selectedService?.name || "terpilih"}. Silakan kirim nama lengkap Anda.`
      );
      return;
    }

    addChatMessage(
    `Siap, saya bantu buat booking.
    Setiap reservasi dikenakan DP sebesar Rp25.000.
    Silakan pilih layanan:
    ${services
      .map((service) => `${service.id}. ${service.name}`)
      .join("\n")}`
    );
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (data.success) {
          setUserId(data.user.id);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (open) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat, open]);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const userMessageCount = chat.filter((msg) => msg.role === "user").length;
    const isFirstMessage = userMessageCount === 0;

    setChat((prev) => [...prev, { role: "user", content: trimmedMessage }]);
    setMessage("");
    setLoading(true);
    setError("");

    if (bookingMode) {
      const nextValue = trimmedMessage;

      if (/^(batal|cancel|stop|nanti)$/i.test(nextValue)) {
        resetBooking();
        addChatMessage("Booking dibatalkan. Jika ingin membuat booking lagi, kirimkan kata 'booking'.");
        setLoading(false);
        return;
      }

      if (bookingStep === "service") {
        const selectedService = resolveService(nextValue);
        if (!selectedService) {
          addChatMessage(
            `Saya belum mengenali layanan tersebut. Pilih salah satu: ${services
              .map((service) => `${service.id}. ${service.name}`)
              .join(", ")}`
          );
          setLoading(false);
          return;
        }

        const nextData = { ...bookingData, service_id: selectedService.id };
        setBookingData(nextData);
        setBookingStep("name");
        addChatMessage(`Layanan ${selectedService.name} dipilih. Silakan kirim nama lengkap Anda.`);
        setLoading(false);
        return;
      }

      if (bookingStep === "name") {
        if (nextValue.length < 2) {
          addChatMessage("Nama lengkap belum valid. Silakan kirim nama lengkap Anda.");
          setLoading(false);
          return;
        }

        const nextData = { ...bookingData, name: nextValue };
        setBookingData(nextData);
        setBookingStep("phone");
        addChatMessage("Silakan kirim nomor HP Anda.");
        setLoading(false);
        return;
      }

      if (bookingStep === "phone") {
        const phone = nextValue.replace(/\D/g, "");
        if (phone.length < 10 || phone.length > 15) {
          addChatMessage("Nomor HP belum valid. Silakan kirim nomor HP Anda (contoh: 081234567890)." );
          setLoading(false);
          return;
        }

        const nextData = { ...bookingData, phone: nextValue };
        setBookingData(nextData);
        setBookingStep("date");
        addChatMessage("Silakan kirim tanggal booking Anda (contoh: 2026-06-29)." );
        setLoading(false);
        return;
      }

      if (bookingStep === "date") {
        const normalizedDate = normalizeDate(nextValue);
        if (!normalizedDate) {
          addChatMessage("Format tanggal belum tepat. Silakan kirim tanggal dalam format YYYY-MM-DD atau DD/MM/YYYY.");
          setLoading(false);
          return;
        }

        const nextData = { ...bookingData, booking_date: normalizedDate };
        setBookingData(nextData);
        setBookingStep("complaint");
        addChatMessage("Silakan jelaskan keluhan motor Anda.");
        setLoading(false);
        return;
      }


      if (bookingStep === "complaint") {
        const nextData = {
          ...bookingData,
          complaint: nextValue,
        };

        setBookingData(nextData);
        setBookingStep("payment");

        addChatMessage(
        `Silakan pilih metode pembayaran:
        1. Mandiri
        2. QRIS
        Ketik *1* atau *2*.`
        );

        setLoading(false);
        return;
      }

      if (bookingStep === "payment") {
        let paymentMethod = "";

        switch (nextValue.trim().toLowerCase()) {
          case "1":
          case "mandiri":
            paymentMethod = "Mandiri";
            break;
          case "2":
          case "qris":
            paymentMethod = "QRIS";
            break;
          default:
            addChatMessage("Metode pembayaran tidak valid.\n\n1. Mandiri\n2. QRIS");
            setLoading(false);
            return;
        }

        const nextData = {
          ...bookingData,
          payment_method: paymentMethod,
        };

        setBookingData(nextData);
        setBookingStep("confirm");

        const selectedService = services.find((service) => service.id === nextData.service_id);
        addChatMessage(
        `Ringkasan Booking
        Layanan     : ${selectedService?.name}
        Nama        : ${nextData.name}
        No. HP      : ${nextData.phone}
        Tanggal     : ${nextData.booking_date}
        Keluhan     : ${nextData.complaint}
        Pembayaran  : ${nextData.payment_method}
        Ketik *YA* untuk konfirmasi pembayaran.
        Ketik *BATAL* jika ingin membatalkan.`
        );
        setLoading(false);
        return;
      }

      if (bookingStep === "confirm") {
        if (!/^(ya|yes|ok|lanjut|konfirmasi|simpan)$/i.test(nextValue)) {
          addChatMessage("Booking belum dikonfirmasi. Ketik YA untuk lanjut atau BATAL untuk membatalkan.");
          setLoading(false);
          return;
        }

        setBookingLoading(true);

        try {
          const res = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...bookingData,
              complaint: bookingData.complaint || nextValue,
              user_id: userId,
            }),
          });

          const data = await res.json();
          if (!data.success) {
            throw new Error(data.message || "Gagal membuat booking");
          }

          addChatMessage(
          `Booking berhasil dibuat!
          ID Booking : ${data.booking_id}
          Terima kasih telah melakukan reservasi.
          Tim ORAWIM akan segera menghubungi Anda untuk proses selanjutnya.`
          );
          
          resetBooking();
        } catch (err) {
          addChatMessage(err?.message || "Booking gagal dibuat. Silakan coba lagi.");
          console.error(err);
        } finally {
          setBookingLoading(false);
          setLoading(false);
        }
        return;
      }
    }

    if (bookingKeywords.test(trimmedMessage)) {
      startBookingFlow();
      setLoading(false);
      return;
    }

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

      addChatMessage(data.reply);
    } catch (err) {
      setError(err?.message || "Gagal mengirim pesan. Coba lagi.");
      addChatMessage(err?.message || "Gagal mengirim pesan. Coba lagi.");
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
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-red-600 shadow-2xl shadow-red-500/40 flex items-center justify-center text-2xl"
      >
        💬
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-28 right-6 z-50 w-[350px] max-w-[90vw] rounded-[35px] overflow-hidden border border-white/10 bg-[#0d0d0d]/95 backdrop-blur-2xl shadow-2xl shadow-red-500/20"
          >
            <div className="bg-red-600 p-5">
              <h2 className="text-xl font-black">ORAWIM AI</h2>
              <p className="text-sm text-red-100 mt-1">Customer Support Assistant</p>
            </div>

            <div className="p-5 h-[350px] overflow-y-auto space-y-4">
              {chat.map((item, index) => {
                const isUser = item.role === "user";
                return (
                 <div
                    key={index}
                    className={`rounded-2xl p-4 max-w-[85%] whitespace-pre-line leading-7  text-[15px] leading-7 whitespace-pre-line ${
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

            <div className="border-t border-white/10 p-4 flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tulis pesan..."
                disabled={loading || bookingLoading}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-red-500 disabled:opacity-60"
              />

              <button
                onClick={sendMessage}
                disabled={loading || bookingLoading}
                className="bg-red-600 hover:bg-red-700 transition px-5 rounded-2xl font-semibold disabled:cursor-not-allowed disabled:bg-red-500"
              >
                {loading || bookingLoading ? "Kirim..." : "Kirim"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}