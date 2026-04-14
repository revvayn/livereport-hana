import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";
import {
  Layout, Search, Edit2, Trash2, Loader2, PlusCircle,
  Clock, Target, Percent, Calculator, Database
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
    ewh: 80,
    percentage: 100,
    total_lines: 1,
    yield: 100,
    description: ""
  });

  const API_PATH = "/work-centers";

  const fetchItems = async (keyword = "") => {
    try {
      setLoading(true);
      const res = await api.get(`${API_PATH}?search=${keyword}`);
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

  const handleReset = () => {
    setEditId(null);
    setForm({
      work_center_name: "",
      line_name: "",
      lead_time: 1,
      ewh: 80,
      percentage: 100,
      total_lines: 1,
      yield: 100,
      description: ""
    });
  };

  const calculateTotalEwh = (ewh_p, lines, cap_p) => {
    const baseSeconds = 25200;
    const res = (baseSeconds * (parseFloat(ewh_p) / 100)) * parseInt(lines) * (parseFloat(cap_p) / 100);
    return isNaN(res) ? 0 : Math.round(res);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.work_center_name || !form.total_lines) {
      return Swal.fire("Peringatan", "Data wajib diisi", "warning");
    }

    try {
      setLoading(true);
      if (editId) {
        await api.put(`${API_PATH}/${editId}`, form);
      } else {
        await api.post(API_PATH, form);
      }
      handleReset();
      fetchItems();
      Swal.fire({ icon: 'success', title: 'Berhasil', timer: 1000, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Error", "Gagal menyimpan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      work_center_name: item.work_center_name,
      line_name: item.line_name || "",
      lead_time: item.lead_time,
      ewh: item.ewh,
      percentage: item.percentage,
      total_lines: item.total_lines,
      yield: item.yield,
      description: item.description || ""
    });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus data ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await api.delete(`${API_PATH}/${id}`);
        fetchItems();
        Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
      } catch (err) {
        Swal.fire("Error", "Gagal menghapus", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-lg text-white"><Layout size={24} /></div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Master Work Centers</h1>
              <p className="text-sm text-slate-500">Manajemen Area & Kapasitas Produksi</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text" placeholder="Cari work center..."
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full md:w-64"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Form Card (2 Baris agar lebih lega) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Section 1: Identitas Utama */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <Database size={12} className="text-slate-400" /> Nama Work Center
                </label>
                <input
                  type="text"
                  placeholder="Contoh: ASSEMBLY"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:font-normal placeholder:text-slate-300"
                  value={form.work_center_name}
                  onChange={(e) => setForm({ ...form, work_center_name: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <Layout size={12} className="text-slate-400" /> Nama Line
                </label>
                <input
                  type="text"
                  placeholder="Contoh: LINE A"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  value={form.line_name}
                  onChange={(e) => setForm({ ...form, line_name: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <Clock size={12} className="text-slate-400" /> Lead Time (Shift)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  value={form.lead_time}
                  onChange={(e) => setForm({ ...form, lead_time: e.target.value })}
                />
              </div>
            </div>

            {/* Section 2: Parameter Teknis */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 border-t border-slate-50 items-end">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase text-center block">Total Lines</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-center font-black text-slate-700 shadow-sm"
                  value={form.total_lines}
                  onChange={(e) => setForm({ ...form, total_lines: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-blue-600 uppercase text-center block tracking-tight">Utility (%)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 bg-blue-50/50 border border-blue-100 rounded-xl text-sm text-center text-blue-700 font-black focus:ring-2 focus:ring-blue-500/20 outline-none"
                  value={form.ewh}
                  onChange={(e) => setForm({ ...form, ewh: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-emerald-600 uppercase text-center block tracking-tight">Capacity (%)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-sm text-center text-emerald-700 font-black focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  value={form.percentage}
                  onChange={(e) => setForm({ ...form, percentage: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-amber-600 uppercase text-center block tracking-tight">Yield (%)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 bg-amber-50/50 border border-amber-100 rounded-xl text-sm text-center text-amber-700 font-black focus:ring-2 focus:ring-amber-500/20 outline-none"
                  value={form.yield}
                  onChange={(e) => setForm({ ...form, yield: e.target.value })}
                />
              </div>

              {/* Result Preview Box */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase text-center block tracking-tight">EWH Result</label>
                <div className="flex items-center justify-between bg-slate-900 text-white rounded-xl px-4 py-2.5 shadow-lg shadow-indigo-200/20 h-[42px] border border-slate-800">
                  <Calculator size={14} className="text-indigo-400" />
                  <span className="text-sm font-black tabular-nums tracking-tighter text-indigo-100">
                    {calculateTotalEwh(form.ewh, form.total_lines, form.percentage).toLocaleString()}s
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[42px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-100 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : editId ? (
                    <>Update Data</>
                  ) : (
                    <>Simpan Data</>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Work Center & Line</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Configuration</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Kapasitas Produksi</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.length > 0 ? (
                items.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 uppercase">{i.work_center_name}</span>
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                          <Database size={12} /> {i.line_name || "Tanpa Nama Line"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                        <span className="text-xs font-bold text-slate-600">{i.total_lines} Lines</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">LT: {i.lead_time} SHIFT</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-indigo-50 rounded-lg">
                            <Target size={16} className="text-indigo-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-800">
                              {Number(i.ewh_final).toLocaleString()} <span className="text-[10px] font-normal text-slate-400 uppercase">Detik</span>
                            </span>
                            <span className="text-[10px] text-slate-500 flex gap-1 items-center">
                              <span className="text-blue-600 font-bold">U:{i.ewh}%</span> •
                              <span className="text-green-600 font-bold">C:{i.percentage}%</span> •
                              <span className="text-amber-600 font-bold">Y:{i.yield || 100}%</span> {/* Tampilkan Yield di sini */}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => handleEdit(i)} className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(i.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-400 italic font-medium">Belum ada data work center.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}