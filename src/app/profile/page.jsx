"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

function InfoCard({ label, value, multiline = false }) {
  return (
    <div className="bg-[#0f0f0f] border border-white/10 rounded-[20px] px-6 py-5">
      <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-1.5">{label}</p>
      <p className={`font-semibold text-white/90 ${multiline ? "leading-relaxed text-sm" : "text-base"}`}>
        {value || "—"}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();

        if (!res.ok || !data.success) {
          router.push("/login");
          return;
        }

        setProfile(data.user);
      } catch (error) {
        console.error("Failed to load profile:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <section className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-red-500 mx-auto" />
          <p className="text-gray-400 mt-4 text-sm tracking-wide">Memuat profil...</p>
        </div>
      </section>
    );
  }

  if (!profile) return null;

  const initials = profile.name
    ? profile.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <section className="min-h-screen bg-[#050505] text-white px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-5xl mx-auto rounded-[32px] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl shadow-red-500/10"
      >
        {/* HEADER */}
        <div className="bg-[#0f0f0f] border-b border-white/10 px-8 py-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[4px] text-red-400 uppercase font-medium">
                Akun Saya
              </p>
              <h1 className="text-2xl sm:text-3xl font-black mt-1.5 tracking-tight">
                Profil Pengguna
              </h1>
            </div>

            <button
              onClick={() => router.push("/")}
              className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 transition-all duration-150 text-sm font-semibold"
            >
              ← Kembali
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="grid gap-5 sm:grid-cols-[220px_1fr] p-6 sm:p-8">

          {/* LEFT */}
          <div className="bg-[#0f0f0f] border border-white/10 rounded-[24px] p-6 flex flex-col items-center text-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-2xl font-black tracking-tight select-none">
              {initials}
            </div>

            <div>
              <p className="text-lg font-bold leading-snug">{profile.name || "—"}</p>
              <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-400 border border-red-500/25 capitalize">
                {profile.role}
              </span>
            </div>

            <div className="w-full mt-2 p-3 rounded-xl bg-black/40 border border-white/10 text-left">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">User ID</p>
              <p className="text-xs font-mono text-gray-300 break-all">{profile.id}</p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            <InfoCard label="Email" value={profile.email} />

            <div className="grid sm:grid-cols-2 gap-4">
              <InfoCard label="Nomor Telepon" value={profile.notelp} />
              <InfoCard
                label="Bergabung"
                value={
                  profile.created_at
                    ? new Date(profile.created_at).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : undefined
                }
              />
            </div>

            <InfoCard label="Alamat" value={profile.alamat} multiline />
          </div>
        </div>
      </motion.div>
    </section>
  );
}