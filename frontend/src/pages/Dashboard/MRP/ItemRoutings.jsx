import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";
import Select from "react-select";
import { GitBranch, Search, Edit2, Trash2, Loader2, PlusCircle, Link } from "lucide-react";

export default function ItemRoutings() {
  const [routings, setRoutings] = useState([]);
  const [masters, setMasters] = useState({ 
    items: [], finishing: [], pannels: [], cores: [] 
  });
  const [form, setForm] = useState({
    item_code: "", 
    finishing_code: "", 
    assembly_code_pannel: "",
    assembly_code_core: ""
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resR, resI, resF, resP, resC] = await Promise.all([
        api.get("/item-routings"),
        api.get("/items"),
        api.get("/finishing"),
        api.get("/assembly/pannel"),
        api.get("/assembly/core")
      ]);
      setRoutings(resR.data || []);
      setMasters({
        items: resI.data || [], 
        finishing: resF.data || [],
        pannels: resP.data || [], 
        cores: resC.data || []
      });
    } catch (err) { 
      console.error(err);
      Swal.fire("Error", "Gagal mengambil data master", "error");
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const formatOptions = (data, codeKey, descKey) => 
    data.map(item => ({
      value: item[codeKey],
      label: `${item[codeKey]} - ${item[descKey] || ''}`
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.item_code) return Swal.fire("Peringatan", "Item Code wajib diisi", "warning");
    
    try {
      setLoading(true);
      if (editId) {
        await api.put(`/item-routings/${editId}`, form);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Mapping Routing diperbarui', timer: 1500, showConfirmButton: false });
      } else {
        await api.post("/item-routings", form);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Mapping Routing disimpan', timer: 1500, showConfirmButton: false });
      }
      resetForm();
      fetchData();
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.error || "Kesalahan sistem", "error");
    } finally { 
      setLoading(false); 
    }
  };

  const resetForm = () => {
    setForm({ item_code: "", finishing_code: "", assembly_code_pannel: "", assembly_code_core: "" });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Mapping?",
      text: "Data routing ini akan dihapus permanen",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        await api.delete(`/item-routings/${id}`);
        fetchData();
        Swal.fire("Terhapus", "Routing berhasil dihapus", "success");
      } catch (err) {
        Swal.fire("Gagal", "Gagal menghapus routing", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      fontSize: '13px',
      borderRadius: '0.5rem',
      borderColor: state.isFocused ? '#0f172a' : '#e2e8f0',
      boxShadow: state.isFocused ? '0 0 0 1px #0f172a' : 'none',
      '&:hover': { borderColor: '#0f172a' },
      minHeight: '42px',
      backgroundColor: '#f8fafc'
    }),
    option: (base, state) => ({
      ...base,
      fontSize: '12px',
      backgroundColor: state.isSelected ? '#0f172a' : state.isFocused ? '#f1f5f9' : 'white',
      color: state.isSelected ? 'white' : '#334155',
    }),
  };

  // Filter routings berdasarkan search input
  const filteredRoutings = routings.filter(r => 
    r.item_code?.toLowerCase().includes(search.toLowerCase()) ||
    r.item_desc?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-lg text-white">
              <GitBranch size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Item Routing Mapping</h1>
              <p className="text-sm text-slate-500">Hubungkan Item dengan alur proses produksi</p>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Cari item code..."
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
            {editId ? "Update Konfigurasi Routing" : "Tambah Mapping Baru"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">1. Packing (Item)</label>
              <Select
                placeholder="Pilih Item..."
                options={formatOptions(masters.items, 'item_code', 'item_desc')}
                value={formatOptions(masters.items, 'item_code', 'item_desc').find(o => o.value === form.item_code)}
                onChange={(opt) => setForm({...form, item_code: opt ? opt.value : ""})}
                styles={customStyles}
                isClearable
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">2. Finishing</label>
              <Select
                placeholder="Pilih Finishing..."
                options={formatOptions(masters.finishing, 'finishing_code', 'description')}
                value={formatOptions(masters.finishing, 'finishing_code', 'description').find(o => o.value === form.finishing_code)}
                onChange={(opt) => setForm({...form, finishing_code: opt ? opt.value : ""})}
                styles={customStyles}
                isClearable
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">3. Assy Pannel</label>
              <Select
                placeholder="Pilih Pannel..."
                options={formatOptions(masters.pannels, 'assembly_code', 'description')}
                value={formatOptions(masters.pannels, 'assembly_code', 'description').find(o => o.value === form.assembly_code_pannel)}
                onChange={(opt) => setForm({...form, assembly_code_pannel: opt ? opt.value : ""})}
                styles={customStyles}
                isClearable
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">4. Assy Core</label>
              <Select
                placeholder="Pilih Core..."
                options={formatOptions(masters.cores, 'assembly_code', 'description')}
                value={formatOptions(masters.cores, 'assembly_code', 'description').find(o => o.value === form.assembly_code_core)}
                onChange={(opt) => setForm({...form, assembly_code_core: opt ? opt.value : ""})}
                styles={customStyles}
                isClearable
              />
            </div>

            <div className="md:col-span-4 flex justify-end gap-2 pt-2">
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-300 transition-all"
                >
                  BATAL
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`px-10 py-2.5 rounded-lg text-sm font-bold text-white transition-all ${
                  editId ? "bg-amber-600 hover:bg-amber-700" : "bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200"
                } disabled:opacity-50`}
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : editId ? "UPDATE MAPPING" : "SIMPAN ROUTING"}
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
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">ID</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Item (Packing)</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Finishing</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pannel</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Core</th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRoutings.length > 0 ? (
                  filteredRoutings.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group text-xs">
                      <td className="px-4 py-4 text-center text-slate-400 font-mono">#{r.id}</td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900">{r.item_code}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{r.item_desc || '-'}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-blue-600">{r.finishing_code || '-'}</span>
                          <span className="text-[10px] text-slate-400">{r.finishing_desc || '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-emerald-600">{r.assembly_code_pannel || '-'}</span>
                          <span className="text-[10px] text-slate-400">{r.pannel_desc || '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-purple-600">{r.assembly_code_core || '-'}</span>
                          <span className="text-[10px] text-slate-400">{r.core_desc || '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              setForm({
                                item_code: r.item_code || "",
                                finishing_code: r.finishing_code || "",
                                assembly_code_pannel: r.assembly_code_pannel || "",
                                assembly_code_core: r.assembly_code_core || ""
                              });
                              setEditId(r.id);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic text-sm">
                      {loading ? "Menghubungkan ke server..." : "Tidak ada data routing mapping."}
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