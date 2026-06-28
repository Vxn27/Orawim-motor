"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Package, ClipboardList, AlertTriangle, ArrowRight, RotateCw } from "lucide-react";

const STAT_CARDS = [
  { label: "Pengguna Terdaftar", key: "totalUsers", icon: Users, note: "akun aktif" },
  { label: "Produk Tercatat", key: "totalProducts", icon: Package, note: "item gudang" },
  { label: "Transaksi Masuk", key: "totalOrders", icon: ClipboardList, note: "order tercatat" },
  { label: "Stok Menipis", key: "lowStockCount", icon: AlertTriangle, note: "perlu restock" },
];

function fmt(value) {
  if (value == null) return "—";
  return typeof value === "number" ? value.toLocaleString("id-ID") : value;
}

function rupiah(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function todayStamp() {
  return new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function SectionHeader({ eyebrow, title, desc, trailing }) {
  return (
    <div className="flex flex-col gap-3 border-b border-dashed border-white/15 pb-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? (
          <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.25em] text-red-400/80">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 font-[var(--font-display)] text-xl font-semibold uppercase tracking-wide text-stone-100">
          {title}
        </h2>
        {desc ? <p className="mt-1 text-sm text-stone-400">{desc}</p> : null}
      </div>
      {trailing ? (
        <div className="font-[var(--font-mono)] text-xs text-stone-500">{trailing}</div>
      ) : null}
    </div>
  );
}

function EmptyRow({ children }) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-black/20 px-4 py-6 text-center text-sm text-stone-500">
      {children}
    </div>
  );
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [summaryRes, usersRes, productsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/summary"),
        fetch("/api/admin/users"),
        fetch("/api/admin/products"),
        fetch("/api/admin/orders"),
      ]);

      const summaryData = await summaryRes.json();
      const usersData = await usersRes.json();
      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();

      if (!summaryData.success) throw new Error(summaryData.message || "Ringkasan gagal dimuat.");
      if (!usersData.success) throw new Error(usersData.message || "Data pengguna gagal dimuat.");
      if (!productsData.success) throw new Error(productsData.message || "Data produk gagal dimuat.");
      if (!ordersData.success) throw new Error(ordersData.message || "Data transaksi gagal dimuat.");

      setSummary(summaryData.data);
      setUsers(usersData.data);
      setProducts(productsData.data);
      setOrders(ordersData.data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Data admin tidak bisa dimuat. Coba muat ulang.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const orderStatusCounts = useMemo(() => {
    if (!summary?.ordersByStatus) return [];
    return summary.ordersByStatus.map((item) => ({ status: item.status, count: item.count }));
  }, [summary]);

  return (
    <main className="min-h-screen bg-[#120b0b] px-4 py-8 text-stone-200 lg:px-10">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 px-6 py-7 lg:px-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-600 via-red-500/60 to-transparent" />
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.3em] text-red-400/80">
                Panel Bengkel — Internal
              </p>
              <h1 className="mt-2 font-[var(--font-display)] text-3xl font-bold uppercase tracking-wide text-stone-50 lg:text-4xl">
                ORAWIM MOTOR
              </h1>
              <p className="mt-2 max-w-xl text-sm text-stone-400">
                Catatan pengguna, stok produk, dan transaksi bengkel — diperbarui langsung dari sistem.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start rounded-lg border border-dashed border-white/20 bg-black/30 px-4 py-3 font-[var(--font-mono)] text-xs text-stone-400 lg:self-auto">
              <span className="uppercase tracking-[0.2em] text-stone-500">Dicetak</span>
              <span className="text-stone-200">{todayStamp()}</span>
              <button
                type="button"
                onClick={loadData}
                title="Muat ulang data"
                className="ml-2 rounded-md border border-white/10 p-1.5 text-stone-400 transition hover:border-green-500/40 hover:text-green-400"
              >
                <RotateCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-black/30 px-6 py-16 text-center">
            <p className="font-[var(--font-mono)] text-sm text-stone-500">Memuat catatan bengkel…</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 px-6 py-5 text-sm text-orange-200">
            <p className="font-medium">Gagal memuat data.</p>
            <p className="mt-1 text-orange-300/80">{error}</p>
            <button
              type="button"
              onClick={loadData}
              className="mt-3 rounded-md border border-orange-400/40 px-3 py-1.5 text-xs uppercase tracking-wide text-orange-200 hover:bg-orange-500/10"
            >
              Coba lagi
            </button>
          </div>
        ) : (
          <>
            {/* STAT TICKETS — receipt-stub styling instead of generic icon cards */}
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {STAT_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.key}
                    className="relative rounded-xl border border-white/10 bg-black/30 px-5 pb-4 pt-5"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{card.label}</p>
                      <Icon size={16} className="mt-0.5 text-stone-600" />
                    </div>
                    <p className="mt-4 font-[var(--font-mono)] text-3xl font-medium tabular-nums text-stone-50">
                      {fmt(summary?.[card.key])}
                    </p>
                  </div>
                );
              })}
            </section>

            {/* TRANSACTIONS BY STATUS + TOP PRODUCTS */}
            <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
                <SectionHeader
                  eyebrow="Status"
                  title="Ringkasan Transaksi"
                  desc="Jumlah order menurut status saat ini."
                />
                <div className="mt-5 space-y-2">
                  {orderStatusCounts.length === 0 ? (
                    <EmptyRow>Belum ada transaksi untuk dirangkum.</EmptyRow>
                  ) : (
                    orderStatusCounts.map((item) => (
                      <div
                        key={item.status}
                        className="flex items-center justify-between border-b border-dashed border-white/10 py-3 last:border-none"
                      >
                        <span className="text-sm capitalize text-stone-300">{item.status}</span>
                        <span className="font-[var(--font-mono)] text-sm tabular-nums text-stone-100">
                          {item.count.toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
                <SectionHeader eyebrow="Top" title="Produk Terlaris" desc="Berdasarkan jumlah terjual." />
                <div className="mt-5 space-y-2">
                  {summary?.topProducts?.length > 0 ? (
                    summary.topProducts.map((product, i) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 border-b border-dashed border-white/10 py-3 last:border-none"
                      >
                        <span className="font-[var(--font-mono)] text-xs text-stone-600">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 truncate text-sm text-stone-300">{product.name}</span>
                        <span className="font-[var(--font-mono)] text-sm tabular-nums text-stone-100">
                          {product.sold_quantity.toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))
                  ) : (
                    <EmptyRow>Belum ada produk yang terjual.</EmptyRow>
                  )}
                </div>
              </div>
            </section>

            {/* USERS TABLE */}
            <section className="rounded-2xl border border-white/10 bg-black/30 p-6">
              <SectionHeader
                eyebrow="Akun"
                title="Data Pengguna"
                desc="Semua akun yang terdaftar di sistem."
                trailing={`${users.length.toLocaleString("id-ID")} akun`}
              />
              <div className="mt-5 overflow-x-auto">
                {users.length === 0 ? (
                  <EmptyRow>Belum ada pengguna terdaftar.</EmptyRow>
                ) : (
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                        <th className="px-3 py-3 font-[var(--font-mono)]">ID</th>
                        <th className="px-3 py-3">Nama</th>
                        <th className="px-3 py-3">Email</th>
                        <th className="px-3 py-3">Peran</th>
                        <th className="px-3 py-3">Telepon</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-t border-dashed border-white/10">
                          <td className="px-3 py-3 font-[var(--font-mono)] text-stone-500">
                            #{String(user.id).padStart(3, "0")}
                          </td>
                          <td className="px-3 py-3 text-stone-200">{user.name}</td>
                          <td className="px-3 py-3 text-stone-400">{user.email}</td>
                          <td className="px-3 py-3 capitalize text-stone-300">{user.role}</td>
                          <td className="px-3 py-3 text-stone-400">{user.phone || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            {/* PRODUCTS TABLE */}
            <section className="rounded-2xl border border-white/10 bg-black/30 p-6">
              <SectionHeader
                eyebrow="Gudang"
                title="Daftar Produk"
                desc="Stok dan harga produk saat ini."
                trailing={`${products.length.toLocaleString("id-ID")} produk`}
              />
              <div className="mt-5 overflow-x-auto">
                {products.length === 0 ? (
                  <EmptyRow>Belum ada produk tercatat.</EmptyRow>
                ) : (
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                        <th className="px-3 py-3 font-[var(--font-mono)]">ID</th>
                        <th className="px-3 py-3">Nama</th>
                        <th className="px-3 py-3">Harga</th>
                        <th className="px-3 py-3">Stok</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const low = Number(product.stock) <= 5;
                        return (
                          <tr key={product.id} className="border-t border-dashed border-white/10">
                            <td className="px-3 py-3 font-[var(--font-mono)] text-stone-500">
                              #{String(product.id).padStart(3, "0")}
                            </td>
                            <td className="px-3 py-3 text-stone-200">{product.name}</td>
                            <td className="px-3 py-3 font-[var(--font-mono)] tabular-nums text-stone-300">
                              {rupiah(product.price)}
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={`font-[var(--font-mono)] tabular-nums ${
                                  low ? "text-orange-400" : "text-stone-300"
                                }`}
                              >
                                {product.stock}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            {/* ORDERS TABLE */}
            <section className="rounded-2xl border border-white/10 bg-black/30 p-6">
              <SectionHeader
                eyebrow="Order"
                title="Daftar Transaksi"
                desc="Pesanan dan status pembayaran pelanggan."
                trailing={`${orders.length.toLocaleString("id-ID")} transaksi`}
              />
              <div className="mt-5 overflow-x-auto">
                {orders.length === 0 ? (
                  <EmptyRow>Belum ada transaksi masuk.</EmptyRow>
                ) : (
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                        <th className="px-3 py-3 font-[var(--font-mono)]">ID</th>
                        <th className="px-3 py-3">Pelanggan</th>
                        <th className="px-3 py-3">Total</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Kontak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-t border-dashed border-white/10">
                          <td className="px-3 py-3 font-[var(--font-mono)] text-stone-500">
                            #{String(order.id).padStart(4, "0")}
                          </td>
                          <td className="px-3 py-3 text-stone-200">{order.customer_name || "—"}</td>
                          <td className="px-3 py-3 font-[var(--font-mono)] tabular-nums text-stone-300">
                            {rupiah(order.total_price)}
                          </td>
                          <td className="px-3 py-3">
                            <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs capitalize text-stone-300">
                              {order.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-stone-400">{order.phone_number || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}