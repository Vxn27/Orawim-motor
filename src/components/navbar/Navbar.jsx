"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  LogOut,
} from "lucide-react";

export default function Navbar() {

  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenu, setMobileMenu] = useState(false);

  // hindari flicker saat server-render -> client-hydrate
  const [mounted, setMounted] = useState(false);

  // ✅ baca localStorage dulu sebagai nilai awal, hindari flicker
  const [isLogin, setIsLogin] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isLogin") === "true";
    }
    return false;
  });

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("/api/me");
        const text = await res.text();
        const data = text ? JSON.parse(text) : { success: false };

        setIsLogin(data.success);

        // ✅ simpan ke localStorage sebagai cache
        localStorage.setItem("isLogin", data.success ? "true" : "false");

      } catch {
        setIsLogin(false);
        localStorage.setItem("isLogin", "false");
      }
    };
    checkLogin();
    // set mounted setelah pertama render di client
    if (typeof window !== "undefined") setMounted(true);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setIsLogin(false);
    localStorage.setItem("isLogin", "false"); // ✅ hapus cache
    window.location.href = "/";
  };

  const menus = [
    { name: "Home", path: "/" },
    { name: "Produk", path: "/product" },
    { name: "Booking", path: "/booking" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 w-full z-50 border-b border-white/5 bg-black/70 backdrop-blur-2xl">

      <div className="w-full px-5 lg:px-12 h-20 flex items-center justify-between">

        <div
          onClick={() => router.push("/")}
          className="cursor-pointer flex-shrink-0"
        >
          <h1 className="text-2xl lg:text-3xl font-black tracking-widest whitespace-nowrap">
            ORAWIM
            <span className="text-red-500"> MOTOR</span>
          </h1>
        </div>

        <div className="hidden md:flex items-center gap-10">
          {menus.map((menu, index) => (
            <button
              key={index}
              onClick={() => router.push(menu.path)}
              className={`text-sm font-medium transition relative ${
                pathname === menu.path
                  ? "text-red-500"
                  : "text-gray-300 hover:text-red-500"
              }`}
            >
              {menu.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          
          <button
            onClick={() => router.push("/profile")}
            className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:border-red-500 hover:bg-red-500/10 transition"
          >
            <User size={19} />
          </button>

          <button
            onClick={() => router.push("/cart")}
            className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:border-red-500 hover:bg-red-500/10 transition"
          >
            <ShoppingCart size={19} />
          </button>

          <button
            onClick={isLogin ? handleLogout : () => router.push("/login")}
            className="hidden md:flex items-center gap-2 bg-red-600 hover:bg-red-700 transition px-5 h-11 rounded-2xl text-sm font-semibold shadow-lg shadow-red-500/20"
          >
            {mounted ? (isLogin ? <LogOut size={17} /> : <User size={17} />) : null}
            {mounted ? (isLogin ? "Logout" : "Login") : null}
          </button>

          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
          >
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>

      </div>

      {mobileMenu && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0a0a] px-5 py-5">
          <div className="flex flex-col gap-3">

            {menus.map((menu, index) => (
              <button
                key={index}
                onClick={() => {
                  router.push(menu.path);
                  setMobileMenu(false);
                }}
                className={`text-left px-5 py-4 rounded-2xl transition ${
                  pathname === menu.path
                    ? "bg-red-600 text-white"
                    : "bg-white/5 text-gray-300"
                }`}
              >
                {menu.name}
              </button>
            ))}

            <button
              onClick={() => {
                isLogin ? handleLogout() : router.push("/login");
                setMobileMenu(false);
              }}
              className="bg-red-600 py-4 rounded-2xl font-semibold mt-2"
            >
              {mounted ? (isLogin ? "Logout" : "Login") : null}
            </button>

          </div>
        </div>
      )}

    </nav>
  );
}