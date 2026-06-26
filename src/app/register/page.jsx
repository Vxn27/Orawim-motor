"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(""); 
  const [address, setAddress] = useState(""); 

  const handleRegister = async () => {
    try {
      console.log("🚀 Mulai register...");
      console.log({ name, email, password });

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, phone, address }),
      });

      console.log("📡 Response status:", response.status);

      const data = await response.json();

      console.log("📦 Response data:", data);

      if (!response.ok || !data.success) {
        console.log("❌ Register gagal:", data);
        alert(data.message || "Register gagal");
        return;
      }

      console.log("✅ Register sukses");
      alert("Register berhasil");
      router.push("/login")
    } catch (error) {
      console.error("🔥 ERROR FRONTEND:", error);
      alert("Register gagal (frontend error)");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#050505] text-white px-5">

      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-2xl"
      >

        <h1 className="text-4xl font-black text-center">
          REGISTER
        </h1>

        <p className="text-gray-400 text-center mt-3">
          Buat akun ORAWIM MOTOR
        </p>

        <div className="space-y-5 mt-10">

          <div>

            <label className="text-sm text-gray-400">
              Nama
            </label>

            <input
              type="text"
              placeholder="Masukkan nama"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500"
            />

          </div>

          <div>

            <label className="text-sm text-gray-400">
              No.Telp
            </label>

            <input
              type="tel"
              placeholder="Masukkan Nomor Telepon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-2 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500"
            />

          </div>

            <div>

            <label className="text-sm text-gray-400">
             Alamat
            </label>

            <input
              placeholder="Masukkan Alamat Anda"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={4}
              className="w-full mt-2 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500"
            />

          </div>

          <div>

            <label className="text-sm text-gray-400">
              Email
            </label>

            <input
              type="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500"
            />

          </div>

          <div>

            <label className="text-sm text-gray-400">
              Password
            </label>

            <input
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-2 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500"
            />

          </div>

          <button
            onClick={handleRegister}
            className="w-full bg-red-600 hover:bg-red-700 transition py-4 rounded-2xl font-bold"
          >
            Register
          </button>

        </div>

      </motion.div>

    </section>
  );
}