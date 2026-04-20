import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";
import {
  UserPlus, Search, Edit2, Trash2, Users, Loader2,
  PlusCircle, X, ChevronLeft, ChevronRight
} from "lucide-react";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ customer_code: "", customer_name: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // --- State Paginasi ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Fungsi ambil data (Ambil semua data sekaligus)
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customers");
      // Menangani berbagai kemungkinan format response dari backend
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setCustomers(data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal mengambil data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // --- Logika Filter & Paginasi Frontend ---
  // 1. Filter data berdasarkan input search
  const filteredCustomers = customers.filter(c =>
    c.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.customer_code?.toLowerCase().includes(search.toLowerCase())
  );

  // 2. Update Total Halaman & Reset ke halaman 1 jika hasil filter berubah
  useEffect(() => {
    const pages = Math.ceil(filteredCustomers.length / limit) || 1;
    setTotalPages(pages);
    if (currentPage > pages) setCurrentPage(1);
  }, [filteredCustomers.length, search, limit]);

  // 3. Potong data yang akan ditampilkan di tabel (Slice)
  const startIndex = (currentPage - 1) * limit;
  const currentTableData = filteredCustomers.slice(startIndex, startIndex + limit);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_code || !form.customer_name) {
      return Swal.fire("Peringatan", "Semua field wajib diisi", "warning");
    }

    try {
      setLoading(true);
      if (editId) {
        await api.put(`/customers/${editId}`, form);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data diperbarui', timer: 1000, showConfirmButton: false });
      } else {
        await api.post("/customers", form);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data ditambahkan', timer: 1000, showConfirmButton: false });
      }
      setForm({ customer_code: "", customer_name: "" });
      setEditId(null);
      fetchCustomers(); // Refresh data setelah simpan
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.error || "Gagal menyimpan data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setForm({ customer_code: customer.customer_code, customer_name: customer.customer_name });
    setEditId(customer.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Data?",
      text: "Data yang dihapus tidak dapat dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      confirmButtonText: "Ya, Hapus",
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        await api.delete(`/customers/${id}`);
        fetchCustomers();
        Swal.fire("Terhapus", "Data berhasil dihapus", "success");
      } catch (err) {
        Swal.fire("Gagal", "Tidak dapat menghapus data", "error");
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
      await api.post("/customers/import-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      Swal.fire("Berhasil", "Data customer berhasil diimport", "success");
      fetchCustomers();
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.error || "Gagal import file", "error");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };
  const handleClearData = async () => {
    const confirm = await Swal.fire({
      title: "Kosongkan Semua Data?",
      text: "Tindakan ini akan menghapus SELURUH data customer dan tidak dapat dibatalkan!",
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
        await api.delete("/customers/clear-all");
        fetchCustomers(); // Refresh list
        Swal.fire("Berhasil", "Semua data customer telah dihapus", "success");
      } catch (err) {
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
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Data Customer</h1>
              <p className="text-sm text-slate-500">Kelola informasi pelanggan dalam sistem</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleClearData}
              disabled={loading || customers.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} />
              <span>Clear Data</span>
            </button>
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold cursor-pointer transition-all shadow-sm active:scale-95 whitespace-nowrap">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <PlusCircle size={18} />}
              <span>Upload Excel</span>
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} />
            </label>

            <div className="relative group flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Cari pelanggan..."
                className="pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 transition-all w-full md:w-64 text-sm"
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
            <UserPlus size={16} className={editId ? "text-amber-500" : "text-slate-400"} />
            {editId ? "Mode Edit: Update Informasi" : "Tambah Customer Baru"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 text-sm font-mono uppercase"
              placeholder="Kode (Cth: CUST001)"
              value={form.customer_code}
              onChange={(e) => setForm({ ...form, customer_code: e.target.value })}
            />
            <input
              type="text"
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 text-sm uppercase"
              placeholder="Nama Lengkap Customer"
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-md active:scale-95 ${editId ? "bg-amber-600 hover:bg-amber-700" : "bg-slate-900 hover:bg-slate-800"} disabled:opacity-50`}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : editId ? "UPDATE DATA" : "SIMPAN"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => { setEditId(null); setForm({ customer_code: "", customer_name: "" }); }}
                  className="px-4 py-2.5 bg-slate-100 text-slate-500 rounded-lg text-sm font-bold hover:bg-slate-200"
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
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kode Pelanggan</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentTableData.length > 0 ? (
                  currentTableData.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-mono font-bold border border-slate-200">{c.customer_code}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700 uppercase">{c.customer_name}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => handleEdit(c)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-400 italic text-sm">
                      {loading ? "Memproses data..." : "Data tidak ditemukan."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Navigation */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs font-medium text-slate-500">
              Halaman <span className="text-slate-900 font-bold">{currentPage}</span> dari <span className="text-slate-900 font-bold">{totalPages}</span>
              <span className="ml-2">({filteredCustomers.length} Total Data)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || loading}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
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