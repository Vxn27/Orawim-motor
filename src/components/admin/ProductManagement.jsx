"use client";

import { useEffect, useMemo, useState } from "react";
import { Package, Plus, Pencil, Trash2, Search, RotateCw, X } from "lucide-react";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  image: "",
  category_id: "",
  brands_id: "",
};

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    setFeedback("");
    try {
      const [productsRes, optionsRes] = await Promise.all([
        fetch("/api/admin/products?limit=all"),
        fetch("/api/admin/products?mode=options"),
      ]);

      const productsData = await productsRes.json();
      const optionsData = await optionsRes.json();

      if (!productsData.success) throw new Error(productsData.message || "Gagal memuat produk");
      if (!optionsData.success) throw new Error(optionsData.message || "Gagal memuat opsi produk");

      setProducts(productsData.data || []);
      setCategories(optionsData.data?.categories || []);
      setBrands(optionsData.data?.brands || []);
    } catch (err) {
      setError(err.message || "Tidak bisa memuat produk");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(q) ||
        String(product.id).includes(q)
      );
    });
  }, [products, query]);

  const resetModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setError(null);
    setFeedback("");
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      image: product.image || "",
      category_id: product.category_id ?? "",
      brands_id: product.brands_id ?? "",
    });
    setError(null);
    setFeedback("");
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      image: form.image.trim(),
      category_id: form.category_id ? Number(form.category_id) : null,
      brands_id: form.brands_id ? Number(form.brands_id) : null,
    };

    if (!payload.name) {
      setError("Nama produk wajib diisi.");
      return;
    }

    if (!Number.isFinite(payload.price) || payload.price < 0) {
      setError("Harga produk tidak valid.");
      return;
    }

    if (!Number.isFinite(payload.stock) || payload.stock < 0) {
      setError("Stok produk tidak valid.");
      return;
    }

    setSaving(true);
    setError(null);
    setFeedback("");

    try {
      const method = editingProduct ? "PUT" : "POST";
      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProduct ? { id: editingProduct.id, ...payload } : payload),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Gagal menyimpan produk");
      }

      if (editingProduct) {
        setProducts((prev) =>
          prev.map((item) => (item.id === data.data.id ? data.data : item))
        );
        setFeedback("Produk berhasil diperbarui.");
      } else {
        setProducts((prev) => [data.data, ...prev]);
        setFeedback("Produk berhasil ditambahkan.");
      }

      resetModal();
    } catch (err) {
      setError(err.message || "Tidak bisa menyimpan produk");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Hapus produk "${product.name}"?`)) {
      return;
    }

    setError(null);
    setFeedback("");

    try {
      const res = await fetch(`/api/admin/products?id=${product.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Gagal menghapus produk");
      }

      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      setFeedback("Produk berhasil dihapus.");
    } catch (err) {
      setError(err.message || "Tidak bisa menghapus produk");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-[#1b1613] p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-red-400/80">Manajemen Produk</p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-100">Produk Bengkel</h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-400">
              Kelola daftar produk, stok, dan harga dari satu tempat. Semua perubahan langsung tersimpan ke database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadProducts}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-200 transition hover:bg-white/10"
            >
              <span className="inline-flex items-center gap-2">
                <RotateCw size={16} /> Refresh
              </span>
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <span className="inline-flex items-center gap-2">
                <Plus size={16} /> Tambah Produk
              </span>
            </button>
          </div>
        </div>
      </div>

      {feedback ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {feedback}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="rounded-3xl border border-white/10 bg-[#1b1613] p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
            <Search size={16} className="text-stone-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama produk..."
              className="w-full bg-transparent text-sm text-stone-200 outline-none md:w-64"
            />
          </div>
          <div className="text-sm text-stone-400">
            {filteredProducts.length} produk tampil
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 py-10 text-center text-sm text-stone-400">
              Memuat data produk...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 py-10 text-center text-sm text-stone-400">
              Tidak ada produk yang cocok.
            </div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                  <th className="px-3 py-3">ID</th>
                  <th className="px-3 py-3">Produk</th>
                  <th className="px-3 py-3">Harga</th>
                  <th className="px-3 py-3">Stok</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const stock = Number(product.stock) || 0;
                  const lowStock = stock <= 10;
                  const outOfStock = stock <= 0;
                  let status = "Tersedia";

                  if (outOfStock) {
                    status = "Habis";
                  } else if (lowStock) {
                    status = "Stok Rendah";
                  }

                  return (
                    <tr key={product.id} className="border-t border-dashed border-white/10">
                      <td className="px-3 py-4 text-stone-500">#{String(product.id).padStart(3, "0")}</td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-stone-100">{product.name}</p>
                            <p className="text-xs text-stone-500">{product.description || "Tanpa deskripsi"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-stone-300">Rp {Number(product.price || 0).toLocaleString("id-ID")}</td>
                      <td className="px-3 py-4 text-stone-300">{stock}</td>
                      <td className="px-3 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs ${outOfStock ? "bg-red-500/15 text-red-300" : lowStock ? "bg-orange-500/15 text-orange-300" : "bg-emerald-500/15 text-emerald-300"}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            className="rounded-xl border border-white/10 bg-white/5 p-2 text-stone-300 transition hover:text-white"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product)}
                            className="rounded-xl border border-white/10 bg-white/5 p-2 text-stone-300 transition hover:text-red-400"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#1b1613] p-6 shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-red-400/80">
                  {editingProduct ? "Edit Produk" : "Tambah Produk"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-100">
                  {editingProduct ? "Perbarui data produk" : "Buat produk baru"}
                </h2>
              </div>
              <button
                type="button"
                onClick={resetModal}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-stone-300 transition hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm text-stone-400">Nama Produk</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: Oli Racing 4T"
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none focus:border-red-500"
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm text-stone-400">Deskripsi</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Jelaskan detail produk"
                  rows={3}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none focus:border-red-500"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-stone-400">Harga</span>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none focus:border-red-500"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-stone-400">Stok</span>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none focus:border-red-500"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-stone-400">Kategori</span>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none focus:border-red-500"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-stone-400">Brand</span>
                <select
                  value={form.brands_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, brands_id: e.target.value }))}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none focus:border-red-500"
                >
                  <option value="">Pilih brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm text-stone-400">URL Gambar (opsional)</span>
                <input
                  value={form.image}
                  onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                  placeholder="https://..."
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none focus:border-red-500"
                />
              </label>

              <div className="flex justify-end gap-3 md:col-span-2">
                <button
                  type="button"
                  onClick={resetModal}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-stone-200 transition hover:bg-white/10"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Menyimpan..." : editingProduct ? "Simpan Perubahan" : "Tambah Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
