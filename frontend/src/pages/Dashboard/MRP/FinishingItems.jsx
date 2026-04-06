import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";
import { Layers, Search, Edit2, Trash2, Loader2, PlusCircle, Database, FileUp, Clock, Target } from "lucide-react";

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

  const API_PATH = "/finishing";

  const fetchItems = async (keyword = "") => {
    try {
      setLoading(true);
      const res = await api.get(`${API_PATH}?search=${keyword}`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Swal.fire("Error", "Gagal mengambil data master finishing", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => fetchItems(search), 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.finishing_code || !form.description) return Swal.fire("Peringatan", "Data wajib diisi", "warning");

    try {
      setLoading(true);
      const payload = { ...form, cycle_time: parseInt(form.cycle_time) || 0 };
      if (editId) {
        await api.put(`${API_PATH}/${editId}`, payload);
      } else {
        await api.post(API_PATH, payload);
      }
      handleReset();
      fetchItems();
      Swal.fire({ icon: 'success', title: 'Berhasil', timer: 1000, showConfirmButton: false });
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
      await api.post(`${API_PATH}/import`, formData);
      Swal.fire("Berhasil", "Data berhasil diimport", "success");
      fetchItems();
    } catch (err) {
      Swal.fire("Gagal", "Gagal import file", "error");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-lg text-white"><Layers size={24} /></div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Master Finishing</h1>
              <p className="text-sm text-slate-500">Standarisasi Kapasitas & Proses Finishing</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <input type="file" id="import-fin" className="hidden" onChange={handleImportExcel} />
            <label htmlFor="import-fin" className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold cursor-pointer hover:bg-slate-50">
              <FileUp size={16} /> IMPORT EXCEL
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" placeholder="Cari finishing..."
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full md:w-64"
                value={search} onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <input
              type="text" placeholder="Kode Finishing"
              className="px-4 py-2.5 border rounded-lg text-sm font-bold uppercase"
              value={form.finishing_code}
              onChange={(e) => setForm({ ...form, finishing_code: e.target.value.toUpperCase() })}
            />
            <input
              type="text" placeholder="Deskripsi Finishing"
              className="md:col-span-2 px-4 py-2.5 border rounded-lg text-sm"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              type="number" placeholder="Cycle Time (s)"
              className="px-4 py-2.5 border rounded-lg text-sm"
              value={form.cycle_time}
              onChange={(e) => setForm({ ...form, cycle_time: e.target.value })}
            />
             <input
              type="text" placeholder="Warehouse"
              className="px-4 py-2.5 border rounded-lg text-sm font-bold"
              value={form.warehouse}
              onChange={(e) => setForm({ ...form, warehouse: e.target.value.toUpperCase() })}
            />
            <button type="submit" disabled={loading} className="bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800">
              {editId ? "UPDATE" : "SIMPAN"}
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Proses Finishing</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Warehouse</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Kapasitas (80% EWH)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-bold text-slate-400">{i.finishing_code}</span>
                      <span className="text-sm font-semibold text-slate-700">{i.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Database size={14} /> {i.warehouse}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-slate-600"><Clock size={14} className="text-blue-500" /> <span className="text-sm">{i.cycle_time}s</span></div>
                      <div className="flex items-center gap-1 border-l pl-4 text-green-700 font-bold"><Target size={14} /> {i.capacity_per_shift} <small className="font-normal text-slate-400">/7h</small></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => handleEdit(i)} className="text-slate-400 hover:text-blue-600"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(i.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}