"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, User, Box, ShoppingCart, LogOut } from "lucide-react";

const links = [
  { label: "Dashboard", href: "/admin", icon: Home },
  { label: "Profil", href: "/admin/profile", icon: User },
  { label: "Produk", href: "/admin/products", icon: Box },
  { label: "Transaksi", href: "/admin/orders", icon: ShoppingCart },
];

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
  <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/10 bg-[#120b0b] px-5 py-6 text-stone-200 lg:flex lg:flex-col">      <div className="flex items-center gap-3 border-b border-white/10 pb-6">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600/20 text-red-300 shadow-inner shadow-red-500/10">
          <span className="text-lg font-black">O</span>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-red-400/80">Admin Bengkel</p>
          <h1 className="mt-1 text-xl font-semibold text-stone-100">ORAWIM MOTOR</h1>
        </div>
      </div>

      <nav className="mt-8 space-y-2">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <button
              key={link.href}
              type="button"
              onClick={() => router.push(link.href)}
              className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-medium transition ${
                active
                  ? "bg-red-500/15 text-white shadow-[0_0_0_1px_rgba(248,113,113,0.15)]"
                  : "text-stone-300 hover:bg-white/5 hover:text-stone-100"
              }`}
            >
              <Icon size={18} className={active ? "text-red-400" : "text-stone-400"} />
              {link.label}
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-3xl bg-red-600/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-600/20"
      >
        <LogOut size={16} /> Logout
      </button>
    </aside>
  );
}
