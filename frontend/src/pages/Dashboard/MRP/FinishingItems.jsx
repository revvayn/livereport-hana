import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";
import {
  Layers, Search, Edit2, Trash2, Loader2, PlusCircle,
  Database, Clock, Target, ChevronLeft, ChevronRight, X
} from "lucide-react";

export default function FinishingItems() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    finishing_code: "",
    description: "",
    warehouse: "FGOD",
    cycle_time: ""
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // --- CONFIG PAGINATION FRONTEND ---
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10; // Menampilkan 10 data per halaman
  const API_PATH = "/finishing";

  // Ambil semua data sekaligus
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get(API_PATH);
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setItems(data);
    } catch (err) {
      Swal.fire("Error", "Gagal mengambil data master finishing", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // --- LOGIKA FILTER & PAGINATION ---
  const filteredItems = items.filter(i =>
    i.finishing_code?.toLowerCase().includes(search.toLowerCase()) ||
    i.description?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / limit) || 1;

  // Data yang akan dirender di tabel
  const startIndex = (currentPage - 1) * limit;
  const currentTableData = filteredItems.slice(startIndex, startIndex + limit);

  // Reset ke hal 1 jika user mencari sesuatu
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.finishing_code || !form.description) return Swal.fire("Peringatan", "Data wajib diisi", "warning");

    try {
      setLoading(true);
      const payload = { ...form, cycle_time: parseInt(form.cycle_time) || 0 };
      if (editId) {
        await api.put(`${API_PATH}/${editId}`, payload);
        Swal.fire({ icon: 'success', title: 'Data Diperbarui', timer: 1000, showConfirmButton: false });
      } else {
        await api.post(API_PATH, payload);
        Swal.fire({ icon: 'success', title: 'Data Tersimpan', timer: 1000, showConfirmButton: false });
      }
      handleReset();
      fetchItems();
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.error || "Error sistem", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      finishing_code: item.finishing_code,
      description: item.description || "",
      warehouse: item.warehouse || "FGOD",
      cycle_time: item.cycle_time || ""
    });
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus data ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      confirmButtonText: "Ya, Hapus!"
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await api.delete(`${API_PATH}/${id}`);
        fetchItems();
        Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
      } catch (err) {
        Swal.fire("Error", "Gagal menghapus data", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReset = () => {
    setForm({ finishing_code: "", description: "", warehouse: "FGOD", cycle_time: "" });
    setEditId(null);
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
      Swal.fire("Gagal", "Gagal import file", "error");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleClearData = async () => {
    const confirm = await Swal.fire({
      title: "Kosongkan Semua Data?",
      text: "Tindakan ini akan menghapus SELURUH data finishing dan tidak dapat dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#0f172a",
      confirmButtonText: "Ya, Hapus Semua!",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        await api.delete(`${API_PATH}/clear-all`);

        // PERBAIKAN DI SINI:
        fetchItems(); // Nama fungsi harus sesuai dengan yang didefinisikan di atas

        Swal.fire("Berhasil", "Semua data finishing telah dihapus", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Gagal", "Tidak dapat membersihkan data", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-lg text-white shadow-lg shadow-slate-200">
              <Layers size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Master Finishing</h1>
              <p className="text-sm text-slate-500 font-medium">Standarisasi Kapasitas & Proses Finishing</p>
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
              <span>Upload Excel</span>
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} />
            </label>

            <div className="relative group flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900" size={18} />
              <input
                type="text"
                placeholder="Cari finishing..."
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

        {/* Form Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            {editId ? <Edit2 size={14} className="text-amber-500" /> : <PlusCircle size={14} />}
            {editId ? "Mode Edit Data" : "Input Data Baru"}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">

            {/* KODE */}
            <div className="md:col-span-2 flex">
              <input
                type="text" placeholder="KODE"
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold uppercase focus:border-slate-900 focus:ring-0 outline-none transition-all"
                value={form.finishing_code}
                onChange={(e) => setForm({ ...form, finishing_code: e.target.value.toUpperCase() })}
              />
            </div>

            {/* DESKRIPSI */}
            <div className="md:col-span-4 flex">
              <input
                type="text" placeholder="Deskripsi Finishing"
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-slate-900 focus:ring-0 outline-none transition-all"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* CYCLE TIME */}
            <div className="md:col-span-2 flex">
              <input
                type="number" placeholder="CT (s)"
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-slate-900 focus:ring-0 outline-none transition-all font-mono"
                value={form.cycle_time}
                onChange={(e) => setForm({ ...form, cycle_time: e.target.value })}
              />
            </div>

            {/* WAREHOUSE */}
            <div className="md:col-span-2 flex">
              <input
                type="text" placeholder="WAREHOUSE"
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:border-slate-900 focus:ring-0 outline-none uppercase transition-all"
                value={form.warehouse}
                onChange={(e) => setForm({ ...form, warehouse: e.target.value.toUpperCase() })}
              />
            </div>

            {/* SEKSI TOMBOL */}
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 h-11 flex items-center justify-center gap-2 px-4 rounded-lg text-sm font-bold text-white transition-all shadow-sm active:scale-95 disabled:opacity-50 ${editId ? "bg-amber-600 hover:bg-amber-700" : "bg-slate-900 hover:bg-slate-800"
                  }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    {editId ? <Edit2 size={16} /> : <PlusCircle size={16} />}
                    <span>{editId ? "UPDATE" : "SIMPAN"}</span>
                  </>
                )}
              </button>

              {editId && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-11 h-11 shrink-0 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-400 border border-slate-200 rounded-lg transition-all active:scale-95 shadow-sm"
                  title="Batal Edit"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Proses Finishing</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Warehouse</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kapasitas</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentTableData.length > 0 ? currentTableData.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold text-slate-400">{i.finishing_code}</span>
                        <span className="text-sm font-semibold text-slate-700 uppercase tracking-tight">{i.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                        <Database size={14} className="text-slate-300" /> {i.warehouse}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Clock size={14} className="text-blue-500" />
                          <span className="text-sm font-mono font-bold">{i.cycle_time}s</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 border-l pl-4 font-mono font-bold">
                          <Target size={14} className="text-green-500" />
                          <span className="text-sm text-green-700">{i.capacity_per_shift || 0} <span className="text-[10px] text-slate-400 font-normal">pcs/7h</span></span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => handleEdit(i)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(i.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic text-sm">
                      {loading ? "Memproses data..." : "Tidak ada data yang tersedia."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* --- PAGINATION FOOTER --- */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs font-medium text-slate-500">
              Menampilkan <span className="text-slate-900 font-bold">{currentTableData.length}</span> dari <span className="text-slate-900 font-bold">{filteredItems.length}</span> total data
              <span className="mx-2">|</span>
              Hal <span className="text-slate-900 font-bold">{currentPage}</span> / {totalPages}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Tombol Sebelumnya */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border bg-white disabled:opacity-30 shadow-sm hover:bg-slate-100 transition-all text-slate-600"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Daftar Nomor Halaman */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Logika sederhana: Tampilkan semua jika halaman sedikit, 
                  // atau tampilkan sekitar halaman aktif jika banyak.
                  if (totalPages > 5 && Math.abs(page - currentPage) > 1 && page !== 1 && page !== totalPages) {
                    if (Math.abs(page - currentPage) === 2) return <span key={page} className="text-slate-400 text-xs">...</span>;
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[32px] h-8 text-xs font-bold rounded-lg transition-all border ${currentPage === page
                        ? "bg-slate-900 text-white border-slate-900 shadow-md"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 shadow-sm"
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              {/* Tombol Selanjutnya */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border bg-white disabled:opacity-30 shadow-sm hover:bg-slate-100 transition-all text-slate-600"
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