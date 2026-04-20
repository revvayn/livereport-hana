import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";
import { 
  Cpu, Search, Edit2, Trash2, Loader2, PlusCircle, 
  Database, Clock, Target, ChevronLeft, ChevronRight, X 
} from "lucide-react";

export default function AssemblyCore() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    assembly_code: "",
    description: "",
    warehouse: "WIPA",
    cycle_time: ""
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // --- STATE PAGINASI FRONTEND ---
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10; // Jumlah baris per halaman
  const API_PATH = "/assembly/core";

  // Ambil semua data sekaligus untuk performa filter yang cepat
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get(API_PATH);
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setItems(data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal mengambil data core", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // --- LOGIKA FILTER & PAGINATION (CLIENT SIDE) ---
  const filteredItems = items.filter(i =>
    i.assembly_code?.toLowerCase().includes(search.toLowerCase()) ||
    i.description?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / limit) || 1;
  const startIndex = (currentPage - 1) * limit;
  const currentTableData = filteredItems.slice(startIndex, startIndex + limit);

  // Reset ke halaman 1 jika user mencari data
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.assembly_code || !form.description) {
      return Swal.fire("Peringatan", "Kode dan Deskripsi wajib diisi", "warning");
    }

    try {
      setLoading(true);
      const payload = { ...form, cycle_time: parseInt(form.cycle_time) || 0 };

      if (editId) {
        await api.put(`${API_PATH}/${editId}`, payload);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data core diperbarui', timer: 1000, showConfirmButton: false });
      } else {
        await api.post(API_PATH, payload);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data core ditambahkan', timer: 1000, showConfirmButton: false });
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
      assembly_code: item.assembly_code,
      description: item.description || "",
      warehouse: item.warehouse || "WIPA",
      cycle_time: item.cycle_time || ""
    });
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setForm({ assembly_code: "", description: "", warehouse: "WIPA", cycle_time: "" });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Data?",
      text: "Data akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      confirmButtonText: "Ya, Hapus"
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

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await api.post(`${API_PATH}/import-excel`, formData);
      Swal.fire("Berhasil", "Data berhasil diimport", "success");
      fetchItems();
    } catch (err) {
      Swal.fire("Gagal", "Gagal import excel", "error");
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  const handleClearData = async () => {
    const confirm = await Swal.fire({
      title: "Kosongkan Semua Data?",
      text: "Tindakan ini akan menghapus SELURUH data core dan tidak dapat dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33", // Warna merah untuk bahaya
      cancelButtonColor: "#0f172a",
      confirmButtonText: "Ya, Hapus Semua!",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        await api.delete(`${API_PATH}/clear-all`);
        fetchItems(); // Refresh list
        Swal.fire("Berhasil", "Semua data customer telah dihapus", "success");
      } catch (err) {
        Swal.fire("Gagal", "Tidak dapat membersihkan data", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-lg text-white shadow-lg shadow-slate-200">
              <Cpu size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Master Assembly Core</h1>
              <p className="text-sm text-slate-500 font-medium">Optimasi Produksi & WIP Core</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
              onClick={handleClearData}
              disabled={loading || items.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} />
              <span>Clear Data</span>
            </button>
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold cursor-pointer transition-all active:scale-95 shadow-sm">
              <PlusCircle size={18} />
              <span>Import Core</span>
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} />
            </label>

            <div className="relative group flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Cari core atau deskripsi..."
                className="pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 transition-all w-full md:w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- FORM CARD --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-900 text-sm font-bold uppercase outline-none"
                placeholder="Kode Core"
                value={form.assembly_code}
                onChange={(e) => setForm({ ...form, assembly_code: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="md:col-span-4">
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-900 text-sm outline-none"
                placeholder="Deskripsi Item Core"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-900 text-sm uppercase outline-none"
                placeholder="Warehouse"
                value={form.warehouse}
                onChange={(e) => setForm({ ...form, warehouse: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="md:col-span-2">
              <input
                type="number"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-900 text-sm outline-none font-mono"
                placeholder="CT (s)"
                value={form.cycle_time}
                onChange={(e) => setForm({ ...form, cycle_time: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full h-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-md active:scale-95 ${
                  editId ? "bg-amber-600 hover:bg-amber-700" : "bg-slate-900 hover:bg-slate-800"
                } disabled:opacity-50`}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : editId ? "UPDATE" : "SIMPAN"}
              </button>
            </div>
          </form>
        </div>

        {/* --- TABLE CARD --- */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Core Item</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Warehouse</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentTableData.length > 0 ? (
                  currentTableData.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-bold text-slate-400 uppercase">{i.assembly_code}</span>
                          <span className="text-sm font-semibold text-slate-700 uppercase">{i.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                          <Database size={12} className="text-slate-400" /> {i.warehouse}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                            <Clock size={14} className="text-blue-500" />
                            <span className="text-sm font-bold">{i.cycle_time || 0}s</span>
                          </div>
                          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4 font-mono">
                            <Target size={14} className="text-green-500" />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-green-700 leading-none">{i.capacity_per_shift || 0}</span>
                              <span className="text-[9px] text-slate-400 font-normal uppercase">Pcs / 7h</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => handleEdit(i)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(i.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic text-sm font-medium">
                      {loading ? "Menyinkronkan data..." : "Tidak ada data core yang ditemukan."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* --- PAGINATION FOOTER --- */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs font-medium text-slate-500">
              Halaman <span className="text-slate-900 font-bold">{currentPage}</span> dari <span className="text-slate-900 font-bold">{totalPages}</span>
              <span className="ml-2 opacity-60">({filteredItems.length} total item)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}