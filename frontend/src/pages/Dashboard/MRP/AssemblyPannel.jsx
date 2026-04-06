import { useState, useEffect, useRef } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";
import { Layout, Search, Edit2, Trash2, Loader2, PlusCircle, Database, FileUp, Clock, Target } from "lucide-react";

export default function AssemblyPannel() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ 
    assembly_code: "", 
    description: "", 
    warehouse: "PFIN",
    cycle_time: "" 
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef(null);

  const API_PATH = "/assembly/pannel"; 

  const fetchItems = async (keyword = "") => {
    try {
      setLoading(true);
      const res = await api.get(`${API_PATH}?search=${keyword}`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
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
    if (!form.assembly_code || !form.description) {
      return Swal.fire("Peringatan", "Kode dan Deskripsi wajib diisi", "warning");
    }

    try {
      setLoading(true);
      // Payload memastikan cycle_time adalah angka
      const payload = { 
        ...form, 
        cycle_time: parseInt(form.cycle_time) || 0 
      };

      if (editId) {
        await api.put(`${API_PATH}/${editId}`, payload);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data diperbarui', timer: 1000, showConfirmButton: false });
      } else {
        await api.post(API_PATH, payload);
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
      assembly_code: item.assembly_code,
      description: item.description || "",
      warehouse: item.warehouse || "PFIN",
      cycle_time: item.cycle_time || ""
    });
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setForm({ assembly_code: "", description: "", warehouse: "PFIN", cycle_time: "" });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Data?",
      text: "Data akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#94a3b8",
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
      await api.post(`${API_PATH}/import-excel`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      Swal.fire("Berhasil", "Data berhasil diimport", "success");
      fetchItems();
    } catch (err) {
      Swal.fire("Gagal", "Gagal import excel", "error");
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-lg text-white">
              <Layout size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Assembly Pannel</h1>
              <p className="text-sm text-slate-500">Manajemen Cycle Time & Kapasitas Produksi</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2">
            <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
            <button 
              onClick={() => fileInputRef.current.click()}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              <FileUp size={16} /> IMPORT EXCEL
            </button>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Cari kode panel..."
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
            {editId ? "Edit Informasi Panel" : "Tambah Panel Baru"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:border-slate-900 text-sm font-bold uppercase"
                placeholder="Kode Panel"
                value={form.assembly_code}
                onChange={(e) => setForm({ ...form, assembly_code: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div className="md:col-span-4">
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:border-slate-900 text-sm"
                placeholder="Deskripsi"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-2">
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:border-slate-900 text-sm uppercase"
                placeholder="Warehouse"
                value={form.warehouse}
                onChange={(e) => setForm({ ...form, warehouse: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="md:col-span-2">
              <input
                type="number"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:border-slate-900 text-sm"
                placeholder="Cycle Time (s)"
                value={form.cycle_time}
                onChange={(e) => setForm({ ...form, cycle_time: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all ${
                  editId ? "bg-amber-600 hover:bg-amber-700" : "bg-slate-900 hover:bg-slate-800"
                } disabled:opacity-50`}
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
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Assembly Item</th>
                  <th className="px-6 py-4 text-center">Warehouse</th>
                  <th className="px-6 py-4">Performance (80% EWH)</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length > 0 ? (
                  items.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-bold text-slate-500 uppercase">{i.assembly_code}</span>
                          <span className="text-sm font-semibold text-slate-700">{i.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                           <Database size={12}/> {i.warehouse}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Clock size={14} className="text-blue-500" />
                            <span className="text-sm font-semibold">{i.cycle_time || 0}s</span>
                          </div>
                          <div className="flex items-center gap-1.5 border-l pl-4">
                            <Target size={14} className="text-green-500" />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-green-700">{i.capacity_per_shift || 0}</span>
                              <span className="text-[10px] text-slate-400">Pcs / 7h Shift</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => handleEdit(i)} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(i.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">
                      {loading ? "Memuat data..." : "Data tidak tersedia"}
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