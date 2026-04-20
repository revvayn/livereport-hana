import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";
import { 
  Package, Search, Edit2, Trash2, Loader2, PlusCircle, 
  Database, Clock, Target, ChevronLeft, ChevronRight, X 
} from "lucide-react";

export default function Items() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    item_code: "",
    description: "",
    uom: "",
    warehouse: "GPAK",
    cycle_time: ""
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // --- State Paginasi Frontend ---
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10; // Anda bisa ubah ke 25 jika mau

  // Mengambil SEMUA data sekaligus dari API
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get("/items");
      // Menangani berbagai format response API
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setItems(data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal mengambil data dari server", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // --- LOGIKA FILTER & PAGINATION (FRONTEND) ---
  const filteredItems = items.filter(i =>
    i.description?.toLowerCase().includes(search.toLowerCase()) ||
    i.item_code?.toLowerCase().includes(search.toLowerCase())
  );

  // Hitung total halaman berdasarkan data yang sudah difilter
  const totalPages = Math.ceil(filteredItems.length / limit) || 1;

  // Potong data untuk ditampilkan di tabel (Inilah yang membuat page 10 data)
  const startIndex = (currentPage - 1) * limit;
  const currentTableData = filteredItems.slice(startIndex, startIndex + limit);

  // Reset ke halaman 1 jika user sedang mencari sesuatu
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.item_code || !form.description) {
      return Swal.fire("Peringatan", "Kode dan Deskripsi wajib diisi", "warning");
    }

    try {
      setLoading(true);
      const payload = { ...form, cycle_time: parseFloat(form.cycle_time) || 0 };

      if (editId) {
        await api.put(`/items/${editId}`, payload);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data diperbarui', timer: 1000, showConfirmButton: false });
      } else {
        await api.post("/items", payload);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data ditambahkan', timer: 1000, showConfirmButton: false });
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
      item_code: item.item_code,
      description: item.description,
      uom: item.uom || "",
      warehouse: item.warehouse || "GPAK",
      cycle_time: item.cycle_time || ""
    });
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setForm({ item_code: "", description: "", uom: "", warehouse: "GPAK", cycle_time: "" });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Item?",
      text: "Data tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      confirmButtonText: "Ya, Hapus",
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        await api.delete(`/items/${id}`);
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
      await api.post("/items/import-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("Berhasil", "Data Excel berhasil di-import", "success");
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
      text: "Tindakan ini akan menghapus SELURUH data packing dan tidak dapat dibatalkan!",
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
        await api.delete("/items/clear-all");
        fetchItems(); // Refresh list
        Swal.fire("Berhasil", "Semua data packing telah dihapus", "success");
      } catch (err) {
        Swal.fire("Gagal", "Tidak dapat membersihkan data", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* --- HEADER --- */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-lg text-white shadow-lg">
              <Package size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">Master Data Items</h1>
              <p className="text-sm text-slate-500 font-medium">Kelola inventaris dan cycle time</p>
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
              <span>Import Excel</span>
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} />
            </label>

            <div className="relative group flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Cari item atau kode..."
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

        {/* --- FORM INPUT --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            {editId ? <Edit2 size={16} className="text-amber-500" /> : <PlusCircle size={16} />}
            {editId ? "Mode Edit Data" : "Tambah Item Baru"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <input
              type="text"
              className="md:col-span-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-900 text-sm font-bold uppercase"
              placeholder="Kode"
              value={form.item_code}
              onChange={(e) => setForm({ ...form, item_code: e.target.value.toUpperCase() })}
            />
            <input
              type="text"
              className="md:col-span-4 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-900 text-sm"
              placeholder="Deskripsi Barang"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              type="text"
              className="md:col-span-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-900 text-sm uppercase"
              placeholder="UOM"
              value={form.uom}
              onChange={(e) => setForm({ ...form, uom: e.target.value })}
            />
            <input
              type="number"
              className="md:col-span-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-slate-900 text-sm font-mono"
              placeholder="CT (Detik)"
              value={form.cycle_time}
              onChange={(e) => setForm({ ...form, cycle_time: e.target.value })}
            />
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-md active:scale-95 ${editId ? "bg-amber-600 hover:bg-amber-700" : "bg-slate-900 hover:bg-slate-800"} disabled:opacity-50`}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (editId ? "UPDATE" : "SIMPAN")}
              </button>
            </div>
          </form>
        </div>

        {/* --- TABEL DATA --- */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Item</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">UOM & WH</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Performance</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentTableData.length > 0 ? (
                  currentTableData.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-bold text-slate-400">{i.item_code}</span>
                          <span className="text-sm font-semibold text-slate-700 uppercase tracking-tight">{i.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-slate-600">UOM: {i.uom || '-'}</span>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                            <Database size={10} /> {i.warehouse}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Clock size={14} className="text-blue-500" />
                            <span className="text-sm font-bold font-mono">{i.cycle_time || 0}s</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 border-l pl-4">
                            <Target size={14} className="text-green-500" />
                            <span className="text-sm font-bold font-mono text-green-700">{i.capacity_per_shift || 0} <span className="text-[10px] font-normal text-slate-400">pcs</span></span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => handleEdit(i)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(i.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic text-sm">
                      {loading ? "Memproses..." : "Data tidak tersedia."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* --- PAGINASI --- */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs font-medium text-slate-500">
              Halaman <span className="text-slate-900 font-bold">{currentPage}</span> dari <span className="text-slate-900 font-bold">{totalPages}</span>
              <span className="ml-2">({filteredItems.length} Total Data)</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border bg-white disabled:opacity-30 shadow-sm hover:bg-slate-50 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border bg-white disabled:opacity-30 shadow-sm hover:bg-slate-50 transition-all"
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