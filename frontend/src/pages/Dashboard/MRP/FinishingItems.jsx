import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";
// Menggunakan lucide-react agar konsisten
import { Layers, Search, Edit2, Trash2, Loader2, PlusCircle, Database } from "lucide-react";

export default function FinishingItems() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ 
    finishing_code: "", 
    description: "", 
    warehouse: "FGOD" 
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const API_PATH = "/finishing";

  const fetchItems = async (keyword = "") => {
    try {
      setLoading(true);
      const res = await api.get(`${API_PATH}?search=${keyword}`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Swal.fire("Error", "Gagal mengambil data master finishing", "error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(search);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.finishing_code || !form.description) {
      return Swal.fire("Peringatan", "Kode dan Deskripsi wajib diisi", "warning");
    }

    try {
      setLoading(true);
      if (editId) {
        await api.put(`${API_PATH}/${editId}`, form);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data diperbarui', timer: 1500, showConfirmButton: false });
      } else {
        await api.post(API_PATH, form);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data ditambahkan', timer: 1500, showConfirmButton: false });
      }
      handleReset();
      fetchItems();
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.error || "Gagal menyimpan data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      finishing_code: item.finishing_code,
      description: item.description || "",
      warehouse: item.warehouse || "WIPA"
    });
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setForm({ finishing_code: "", description: "", warehouse: "WIPA" });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Data?",
      text: "Data yang dihapus tidak dapat dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a", // Slate-900
      cancelButtonColor: "#94a3b8", // Slate-400
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        await api.delete(`${API_PATH}/${id}`);
        fetchItems();
        Swal.fire("Terhapus", "Data berhasil dihapus", "success");
      } catch (err) {
        Swal.fire("Gagal", "Gagal menghapus data", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-lg text-white">
              <Layers size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Finishing</h1>
              <p className="text-sm text-slate-500">Kelola standarisasi proses finishing produk</p>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Cari kode finishing..."
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 transition-all w-full md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <PlusCircle size={16} />
            {editId ? "Update Standar Finishing" : "Registrasi Finishing Baru"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 transition-all text-sm font-mono font-bold uppercase"
              placeholder="Kode (Cth: FIN001)"
              value={form.finishing_code}
              onChange={(e) => setForm({ ...form, finishing_code: e.target.value.toUpperCase() })}
            />
            <input
              type="text"
              className="md:col-span-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 transition-all text-sm"
              placeholder="Deskripsi Proses Finishing"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              type="text"
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 transition-all text-sm font-bold uppercase"
              placeholder="Warehouse (Cth: FGOD)"
              value={form.warehouse}
              onChange={(e) => setForm({ ...form, warehouse: e.target.value.toUpperCase() })}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all ${
                  editId ? "bg-amber-600 hover:bg-amber-700" : "bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200"
                } disabled:opacity-50`}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : editId ? "UPDATE" : "SIMPAN"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 bg-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-300 transition-all"
                >
                  BATAL
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kode</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Deskripsi Finishing</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Warehouse</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length > 0 ? (
                  items.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-mono font-bold">
                          {i.finishing_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">{i.description || "-"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Database size={14} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-600 uppercase">{i.warehouse}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={() => handleEdit(i)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(i.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">
                      {loading ? "Menghubungkan ke server..." : "Tidak ada data master finishing ditemukan."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}