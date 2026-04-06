import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";
import { Package, Search, Edit2, Trash2, Loader2, PlusCircle, Database, FileUp, Clock, Target } from "lucide-react";

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

  const fetchItems = async (keyword = "") => {
    try {
      setLoading(true);
      const res = await api.get(`/items?search=${keyword}`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Swal.fire("Error", "Gagal mengambil data items", "error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItems(search);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.item_code || !form.description) {
      return Swal.fire("Peringatan", "Kode dan Deskripsi wajib diisi", "warning");
    }

    try {
      setLoading(true);
      const payload = { ...form, cycle_time: parseInt(form.cycle_time) || 0 };

      if (editId) {
        await api.put(`/items/${editId}`, payload);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data diperbarui', timer: 1500, showConfirmButton: false });
      } else {
        await api.post("/items", payload);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data ditambahkan', timer: 1500, showConfirmButton: false });
      }

      setForm({ item_code: "", description: "", uom: "", warehouse: "GPAK", cycle_time: "" });
      setEditId(null);
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

  // Fungsi Kalkulasi EWH (80% dari 7 jam)
  const calculateDailyCapacity = (ct) => {
    if (!ct || ct <= 0) return 0;
    const ewhSeconds = 7 * 0.8 * 3600; // 20,160 detik
    return Math.floor(ewhSeconds / ct);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-lg text-white">
              <Package size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Data Items</h1>
              <p className="text-sm text-slate-500">Kelola inventaris dan spesifikasi cycle time</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <input type="file" id="upload-excel" className="hidden" accept=".xlsx, .xls" onChange={(e) => {/* handleImportExcel logic */ }} />
            <label htmlFor="upload-excel" className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-all">
              {loading ? <Loader2 className="animate-spin" size={16} /> : <FileUp size={16} />}
              IMPORT EXCEL
            </label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cari item..."
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 transition-all w-full md:w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <PlusCircle size={16} />
            {editId ? "Update Informasi Item" : "Tambah Item Baru"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:border-slate-900 text-sm font-bold"
                placeholder="Kode Item"
                value={form.item_code}
                onChange={(e) => setForm({ ...form, item_code: e.target.value })}
              />
            </div>
            <div className="md:col-span-4">
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:border-slate-900 text-sm"
                placeholder="Deskripsi Barang"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:border-slate-900 text-sm"
                placeholder="UOM"
                value={form.uom}
                onChange={(e) => setForm({ ...form, uom: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <input
                type="number"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:border-slate-900 text-sm"
                placeholder="CT (Detik)"
                value={form.cycle_time}
                onChange={(e) => setForm({ ...form, cycle_time: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all ${editId ? "bg-amber-600 hover:bg-amber-700" : "bg-slate-900 hover:bg-slate-800"}`}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : editId ? "UPDATE" : "SIMPAN"}
              </button>
            </div>
          </form>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Item</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">UOM & WH</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Performance (80% EWH)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold text-slate-500">{i.item_code}</span>
                        <span className="text-sm font-semibold text-slate-700">{i.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-slate-600">UOM: {i.uom || '-'}</span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <Database size={10} /> {i.warehouse}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Clock size={14} className="text-blue-500" />
                          <span className="text-sm font-semibold">{i.cycle_time || 0}s</span>
                        </div>
                        {/* Menampilkan capacity_per_shift langsung dari database */}
                        <div className="flex items-center gap-1.5 text-slate-600 border-l pl-4">
                          <Target size={14} className="text-green-500" />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-green-700">
                              {i.capacity_per_shift || 0}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">Pcs / 7h Shift</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(i)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(i.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}