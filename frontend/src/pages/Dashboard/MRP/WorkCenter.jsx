import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";
import { 
  Layout, Search, Edit2, Trash2, Loader2, PlusCircle, 
  Clock, Target, Percent, Database, Info 
} from "lucide-react";

export default function WorkCenter() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    work_center_name: "",
    line_name: "",
    lead_time: 1,
    ewh_percent: 80,
    yield: 100,
    description: ""
  });

  const fetchItems = async (keyword = "") => {
    try {
      setLoading(true);
      const res = await api.get(`/work-centers?search=${keyword}`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Swal.fire("Error", "Gagal mengambil data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => fetchItems(search), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const resetForm = () => {
    setEditId(null);
    setForm({
      work_center_name: "",
      line_name: "",
      lead_time: 1,
      ewh_percent: 80,
      yield: 100,
      description: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.work_center_name || !form.line_name) {
      return Swal.fire("Peringatan", "Nama Work Center dan Line wajib diisi", "warning");
    }

    const ewhInSeconds = Math.round(25200 * (form.ewh_percent / 100));
    const payload = { 
      ...form, 
      ewh: ewhInSeconds,
      lead_time: parseInt(form.lead_time) || 1,
      yield: parseFloat(form.yield) || 100
    };

    try {
      setLoading(true);
      if (editId) {
        await api.put(`/work-centers/${editId}`, payload);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data diperbarui', timer: 1500, showConfirmButton: false });
      } else {
        await api.post("/work-centers", payload);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data ditambahkan', timer: 1500, showConfirmButton: false });
      }
      resetForm();
      fetchItems();
    } catch (err) {
      Swal.fire("Error", "Gagal menyimpan data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      work_center_name: item.work_center_name,
      line_name: item.line_name,
      lead_time: item.lead_time,
      ewh_percent: item.ewh_percent || Math.round((item.ewh / 25200) * 100),
      yield: item.yield,
      description: item.description || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await api.delete(`/work-centers/${id}`);
        Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
        fetchItems();
      } catch (err) {
        Swal.fire("Error", "Gagal menghapus data", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section - Mengikuti Gaya Items */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-lg text-white">
              <Layout size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Work Centers</h1>
              <p className="text-sm text-slate-500">Kelola area kerja dan kapasitas produksi harian</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cari work center..."
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 transition-all w-full md:w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Form Card - Layout sesuai gambar (2 Baris) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            {editId ? (
              <Edit2 className="text-blue-600 w-5 h-5" />
            ) : (
              <PlusCircle className="text-green-600 w-5 h-5" />
            )}
            <h2 className="text-lg font-bold text-slate-800">
              {editId ? "Edit Work Center" : "Tambah Work Center Baru"}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Baris 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Nama Work Center</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  placeholder="Contoh: Assembly Line A"
                  value={form.work_center_name}
                  onChange={(e) => setForm({ ...form, work_center_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Line</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  placeholder="Contoh: Line 1"
                  value={form.line_name}
                  onChange={(e) => setForm({ ...form, line_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock size={14} /> Lead Time (Shift)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  value={form.lead_time}
                  onChange={(e) => setForm({ ...form, lead_time: e.target.value })}
                />
              </div>
            </div>

            {/* Baris 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  % EWH Capacity (%)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  value={form.ewh_percent}
                  onChange={(e) => setForm({ ...form, ewh_percent: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Target size={14} /> Yield (%)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  value={form.yield}
                  onChange={(e) => setForm({ ...form, yield: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Keterangan</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  placeholder="Catatan opsional"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : editId ? "Update Data" : "Simpan Data"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table Card - Identik dengan gaya Items */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Work Center</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Lead Time & Line</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Performance Metrics</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length > 0 ? (
                  items.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-tighter">WC-#{i.id}</span>
                          <span className="text-sm font-semibold text-slate-700">{i.work_center_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-slate-600 uppercase">Line: {i.line_name}</span>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <Clock size={10} /> {i.lead_time} SHIFT
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Percent size={14} className="text-blue-500" />
                            <div className="flex flex-col">
                              <span className={`text-sm font-bold ${i.ewh_percent > 90 ? 'text-red-600' : 'text-slate-700'}`}>
                                {i.ewh_percent}%
                              </span>
                              <span className="text-[10px] text-slate-400">EWH Cap</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 border-l pl-4">
                            <Target size={14} className="text-green-500" />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700">{i.yield}%</span>
                              <span className="text-[10px] text-slate-400 font-normal">Production Yield</span>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400 text-sm italic">
                      {loading ? "Memuat data..." : "Data tidak ditemukan."}
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