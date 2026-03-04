import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";

export default function AssemblyCore() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ 
    assembly_code: "", 
    description: "", 
    warehouse: "" 
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sesuaikan dengan route backend: router.get('/core', ...)
  const API_PATH = "/assembly/core"; 

  /* ================= FETCH ================= */
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get(API_PATH);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
      Swal.fire("Error", "Gagal mengambil data assembly core", "error");
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
    if (!form.assembly_code || !form.warehouse) {
      return Swal.fire("Peringatan", "Kode Assembly dan Warehouse wajib diisi", "warning");
    }

    try {
      setLoading(true);
      if (editId) {
        await api.put(`${API_PATH}/${editId}`, form);
        Swal.fire("Berhasil", "Data Core berhasil diupdate", "success");
      } else {
        await api.post(API_PATH, form);
        Swal.fire("Berhasil", "Data Core berhasil ditambahkan", "success");
      }
      
      setForm({ assembly_code: "", description: "", warehouse: "WIPA" });
      setEditId(null);
      fetchItems();
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      Swal.fire("Gagal", err.response?.data?.error || "Gagal menyimpan data", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (item) => {
    setForm({
      assembly_code: item.assembly_code,
      description: item.description || "",
      warehouse: item.warehouse || "WIPA",
    });
    setEditId(item.id);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus data core?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      await api.delete(`${API_PATH}/${id}`);
      Swal.fire("Berhasil", "Data berhasil dihapus", "success");
      fetchItems();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      Swal.fire("Gagal", "Gagal menghapus data", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-300 w-full max-w-5xl mx-auto shadow-sm">
      <h1 className="text-xl font-bold mb-5 pb-2 border-b border-gray-200 text-gray-800">
        Master Assembly Core
      </h1>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="mb-8 flex gap-3 flex-wrap items-end bg-gray-50 p-4 rounded-md border border-gray-200">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Kode Assembly</label>
          <input
            type="text"
            className="border border-gray-300 p-2 rounded text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            placeholder="Contoh: CORE-001"
            value={form.assembly_code}
            onChange={(e) => setForm({ ...form, assembly_code: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[250px]">
          <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Deskripsi</label>
          <input
            type="text"
            className="border border-gray-300 p-2 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            placeholder="Keterangan komponen core..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Warehouse</label>
          <input
            type="text"
            className="border border-gray-300 p-2 rounded text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            placeholder="WIPA"
            value={form.warehouse}
            onChange={(e) => setForm({ ...form, warehouse: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`px-6 h-[38px] rounded text-sm font-bold text-white transition-all shadow-sm ${
            editId ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "..." : editId ? "UPDATE" : "TAMBAH"}
        </button>
        
        {editId && (
          <button
            type="button"
            onClick={() => { setEditId(null); setForm({ assembly_code: "", description: "", warehouse: "WIPA" }); }}
            className="px-4 h-[38px] rounded text-sm font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-all"
          >
            BATAL
          </button>
        )}
      </form>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-left uppercase text-[11px] font-bold text-gray-600 border-b border-gray-200">
              <th className="p-3 w-16">ID</th>
              <th className="p-3 w-48">Kode Assembly</th>
              <th className="p-3">Deskripsi</th>
              <th className="p-3 w-32">Warehouse</th>
              <th className="p-3 w-32 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.length > 0 ? (
              items.map((i) => (
                <tr key={i.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-3 text-gray-400">{i.id}</td>
                  <td className="p-3 font-mono font-bold text-blue-800">{i.assembly_code}</td>
                  <td className="p-3 text-gray-700">{i.description || "-"}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-gray-200 text-gray-700">
                      {i.warehouse}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => handleEdit(i)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-xs"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => handleDelete(i.id)}
                        className="text-red-500 hover:text-red-700 font-bold text-xs"
                      >
                        HAPUS
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-12 text-gray-400 italic">
                  {loading ? "Memuat data core..." : "Belum ada data assembly core."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}