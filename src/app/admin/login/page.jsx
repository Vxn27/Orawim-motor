"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message);
      setLoading(false);
      return;
    }

    localStorage.setItem("isLogin", "true");
    router.push("/admin");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black px-5">
      <img
        src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1400&auto=format&fit=crop"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />

      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute w-[400px] h-[400px] bg-red-500/20 blur-[140px] rounded-full top-20 right-20" />

      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[40px] p-8 shadow-2xl shadow-red-500/10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-[30px] bg-red-600 flex items-center justify-center mx-auto text-3xl font-black shadow-2xl shadow-red-500/40">
            O
          </div>

          <h1 className="text-3xl font-black mt-6">Admin Login</h1>
          <p className="text-gray-400 mt-2">Masuk untuk mengakses dashboard admin bengkel.</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-sm text-gray-400">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email admin"
              className="w-full mt-2 bg-black/40 border border-white/10 focus:border-red-500 outline-none rounded-2xl px-5 py-4"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full mt-2 bg-black/40 border border-white/10 focus:border-red-500 outline-none rounded-2xl px-5 py-4"
            />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleLogin}
            className="w-full bg-red-600 hover:bg-red-700 transition py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-red-500/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Memproses..." : "Login Admin"}
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          Bukan admin?
          <span
            onClick={() => router.push("/login")}
            className="text-red-500 ml-2 cursor-pointer hover:text-red-400 transition"
          >
            Login pengguna
          </span>
        </div>
      </motion.div>
    </section>
  );
}
