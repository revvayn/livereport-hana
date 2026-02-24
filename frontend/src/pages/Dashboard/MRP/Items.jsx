import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";

export default function Items() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ item_code: "", description: "", uom: "", warehouse: "GPAK" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get("/items");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
      Swal.fire("Error", "Gagal mengambil data items", "error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  /* ================= ADD / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Perbaikan: Validasi menggunakan form.warehouse, bukan item_type
    if (!form.item_code || !form.warehouse) {
      return Swal.fire("Error", "Item code dan Warehouse wajib diisi", "warning");
    }

    try {
      setLoading(true);
      if (editId) {
        await api.put(`/items/${editId}`, form);
        Swal.fire("Berhasil", "Item berhasil diupdate", "success");
      } else {
        await api.post("/items", form);
        Swal.fire("Berhasil", "Item berhasil ditambahkan", "success");
      }
      // Perbaikan: Reset form menggunakan field yang benar
      setForm({ item_code: "", description: "", uom: "", warehouse: "GPAK" });
      setEditId(null);
      fetchItems();
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      Swal.fire("Gagal", err.response?.data?.error || "Gagal menyimpan item", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (item) => {
    setForm({
      item_code: item.item_code,
      description: item.description || "",
      uom: item.uom || "",
      warehouse: item.warehouse || "GPAK",
    });
    setEditId(item.id);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus item?",
      text: "Data tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
    });
    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      await api.delete(`/items/${id}`);
      Swal.fire("Berhasil", "Item berhasil dihapus", "success");
      fetchItems();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      Swal.fire("Gagal", err.response?.data?.error || "Gagal menghapus item", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-300 w-full max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-5 pb-2 border-b border-gray-200">Master Data Items</h1>

      {/* Form Sederhana */}
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2 flex-wrap">
        <input
          type="text"
          className="border border-gray-300 p-2 rounded text-sm w-40 focus:outline-none focus:border-blue-500"
          placeholder="Kode Item"
          value={form.item_code}
          onChange={(e) => setForm({ ...form, item_code: e.target.value })}
        />
        <input
          type="text"
          className="border border-gray-300 p-2 rounded flex-1 min-w-[200px] text-sm focus:outline-none focus:border-blue-500"
          placeholder="Deskripsi Barang"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="text"
          className="border border-gray-300 p-2 rounded text-sm w-20 focus:outline-none focus:border-blue-500"
          placeholder="UOM"
          value={form.uom}
          onChange={(e) => setForm({ ...form, uom: e.target.value })}
        />
        <input
          type="text"
          className="border border-gray-300 p-2 rounded text-sm w-28 focus:outline-none focus:border-blue-500 bg-white"
          placeholder="Warehouse"
          value={form.warehouse}
          onChange={(e) => setForm({ ...form, warehouse: e.target.value })}
        />

        <button
          type="submit"
          disabled={loading}
          className={`px-6 rounded text-sm font-bold text-white transition-colors ${
            editId ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "..." : editId ? "UPDATE" : "TAMBAH"}
        </button>
      </form>

      {/* Tabel Standar */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr className="text-left uppercase text-xs font-bold text-gray-600">
              <th className="border border-gray-200 p-3 w-16">ID</th>
              <th className="border border-gray-200 p-3 w-40">Kode</th>
              <th className="border border-gray-200 p-3">Deskripsi</th>
              <th className="border border-gray-200 p-3 w-20">UOM</th>
              <th className="border border-gray-200 p-3 w-24">Warehouse</th>
              <th className="border border-gray-200 p-3 w-32 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((i) => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-3 text-gray-500">{i.id}</td>
                  <td className="border border-gray-200 p-3 font-mono font-semibold">{i.item_code}</td>
                  <td className="border border-gray-200 p-3">{i.description}</td>
                  <td className="border border-gray-200 p-3 text-center">{i.uom}</td>
                  <td className="border border-gray-200 p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                      {i.warehouse}
                    </span>
                  </td>
                  <td className="border border-gray-200 p-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(i)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleDelete(i.id)}
                        className="text-red-600 hover:underline font-medium"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-10 text-gray-400">
                  {loading ? "Memuat data..." : "Belum ada data item."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}