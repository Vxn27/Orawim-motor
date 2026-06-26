"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar/Navbar";
import { motion } from "framer-motion";

const services = [
  { id: 1, name: "Service Mesin" },
  { id: 2, name: "Ganti Oli" },
  { id: 3, name: "Tune Up" },
  { id: 4, name: "Service Kelistrikan" },
  { id: 5, name: "Ban & Rem" },
];

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    booking_date: "",
    complaint: "",
    downpayment: 25000,
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Fetch user info
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (data.success) {
          setUserId(data.user.id);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setPageLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const rupiahFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setMessage("Anda harus login terlebih dahulu");
      return;
    }

    if (!selectedService) {
      setMessage("Pilih layanan terlebih dahulu");
      return;
    }

    if (!formData.name || !formData.phone || !formData.booking_date || !formData.complaint || !formData.downpayment) {
      setMessage("Semua field harus diisi");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("phone", formData.phone);
      data.append("service_id", selectedService);
      data.append("booking_date", formData.booking_date);
      data.append("complaint", formData.complaint);
      data.append("down_payment", formData.downpayment);
      data.append("user_id", userId);
      if (file) {
        data.append("file", file);
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (result.success) {
        setMessage("✓ Booking berhasil dibuat! Tunggu konfirmasi dari admin.");
        setFormData({ name: "", phone: "", booking_date: "", complaint: "", downpayment: 25000 });
        setFile(null);
        setSelectedService(null);
      } else {
        setMessage(`✗ ${result.message}`);
      }
    } catch (error) {
      setMessage("✗ Gagal mengirim booking");
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-transparent border-b-red-600 mx-auto animate-spin" />
          <p className="text-gray-400 mt-4">Memuat...</p>
        </div>
      </main>
    );
  }

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
          {/* LEFT - SERVICES */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[#111111] border border-white/5 rounded-[35px] p-8"
          >
            <h2 className="text-3xl font-black mb-8">Pilih Layanan</h2>

            <div className="space-y-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`w-full text-left px-6 py-5 rounded-2xl font-semibold transition ${
                    selectedService === service.id
                      ? "bg-red-600 text-white"
                      : "bg-black/30 hover:bg-red-600 text-white"
                  }`}
                >
                  {service.name}
                </button>
              ))}
            </div>

            {selectedService && (
              <div className="mt-6 p-4 bg-red-600/20 border border-red-600/50 rounded-xl">
                <p className="text-sm text-red-400">
                  Layanan dipilih: <strong>{services.find(s => s.id === selectedService)?.name}</strong>
                </p>
              </div>
            )}
          </motion.div>

          {/* RIGHT - FORM */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-[#111111] border border-white/5 rounded-[35px] p-8"
          >
            <h2 className="text-3xl font-black mb-8">Form Booking</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                name="name"
                placeholder="Nama Lengkap"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500 transition text-white placeholder-gray-500"
              />

              <input
                type="tel"
                name="phone"
                placeholder="Nomor HP"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500 transition text-white placeholder-gray-500"
              />

              <input
                type="date"
                name="booking_date"
                value={formData.booking_date}
                onChange={handleInputChange}
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500 transition text-white"
              />

              <input
                type="text"
                name="downpayment"
                placeholder="Rp 25.000 - Down Payment (DP)"
                value={`${rupiahFormatter.format(formData.downpayment)} - Down Payment (DP)`}
                readOnly
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500 transition text-white placeholder-gray-500"
              />

              <textarea
                name="complaint"
                rows="5"
                placeholder="Keluhan Motor..."
                value={formData.complaint}
                onChange={handleInputChange}
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500 transition text-white placeholder-gray-500 resize-none"
              />

              <label className="block text-sm text-gray-400">
                Silahkan masukan foto motor anda
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-gray-400 file:mr-4 file:bg-red-600 file:text-white file:border-0 file:rounded-lg file:px-3 file:py-2 file:cursor-pointer hover:border-white/20 transition"
              />

              {message && (
                <div
                  className={`p-4 rounded-2xl text-center font-semibold ${
                    message.includes("✓")
                      ? "bg-green-600/20 border border-green-600/50 text-green-400"
                      : "bg-red-600/20 border border-red-600/50 text-red-400"
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 transition py-4 rounded-2xl font-bold text-lg"
              >
                {loading ? "Mengirim..." : "Booking Sekarang"}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}