import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";

export default function ItemRoutings() {
  const [routings, setRoutings] = useState([]);
  const [masters, setMasters] = useState({ 
    items: [], 
    finishing: [], 
    pannels: [], 
    cores: [] 
  });
  const [form, setForm] = useState({
    item_code: "", 
    finishing_code: "", 
    assembly_code_pannel: "",
    assembly_code_core: ""
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Hanya fetch master data yang relevan dengan kolom database saat ini
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
      console.error("Fetch Data Error:", err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validasi minimal: Item Code wajib diisi
    if (!form.item_code) return Swal.fire("Peringatan", "Item Code wajib dipilih", "warning");

    try {
      setLoading(true);
      if (editId) {
        await api.put(`/item-routings/${editId}`, form);
        Swal.fire("Berhasil", "Routing diupdate", "success");
      } else {
        await api.post("/item-routings", form);
        Swal.fire("Berhasil", "Routing baru disimpan", "success");
      }
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", err.response?.data?.error || "Terjadi kesalahan sistem", "error");
    } finally { setLoading(false); }
  };

  const handleEdit = (r) => {
    setForm({
      item_code: r.item_code || "",
      finishing_code: r.finishing_code || "",
      assembly_code_pannel: r.assembly_code_pannel || "",
      assembly_code_core: r.assembly_code_core || ""
    });
    setEditId(r.id);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus data ini?",
      text: "Data yang dihapus tidak bisa dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!"
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/item-routings/${id}`);
        Swal.fire("Terhapus", "Data berhasil dihapus", "success");
        fetchData();
      } catch (err) {
        Swal.fire("Gagal", "Gagal menghapus data", "error");
      }
    }
  };

  const resetForm = () => {
    setForm({ item_code: "", finishing_code: "", assembly_code_pannel: "", assembly_code_core: "" });
    setEditId(null);
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Item Routing Mapping</h1>

      {/* Form: Hanya 4 kolom yang ada di Database */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-blue-600 uppercase">1. Packing (Item)</label>
            <select className="w-full border p-2 rounded text-sm bg-white" value={form.item_code} onChange={e => setForm({...form, item_code: e.target.value})} required>
              <option value="">-- Pilih Item --</option>
              {masters.items.map(i => <option key={i.id} value={i.item_code}>{i.item_code}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-green-600 uppercase">2. Finishing</label>
            <select className="w-full border p-2 rounded text-sm bg-white" value={form.finishing_code} onChange={e => setForm({...form, finishing_code: e.target.value})}>
              <option value="">-- Pilih Finishing --</option>
              {masters.finishing.map(f => <option key={f.id} value={f.finishing_code}>{f.finishing_code}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-orange-600 uppercase">3. Assy Pannel</label>
            <select className="w-full border p-2 rounded text-sm bg-white" value={form.assembly_code_pannel} onChange={e => setForm({...form, assembly_code_pannel: e.target.value})}>
              <option value="">-- Pilih Pannel --</option>
              {masters.pannels.map(p => <option key={p.id} value={p.assembly_code}>{p.assembly_code}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-purple-600 uppercase">4. Assy Core</label>
            <select className="w-full border p-2 rounded text-sm bg-white" value={form.assembly_code_core} onChange={e => setForm({...form, assembly_code_core: e.target.value})}>
              <option value="">-- Pilih Core --</option>
              {masters.cores.map(c => <option key={c.id} value={c.assembly_code}>{c.assembly_code}</option>)}
            </select>
          </div>
          
          <div className="md:col-span-4 flex justify-end gap-2 mt-2">
            {editId && (
              <button type="button" onClick={resetForm} className="px-6 py-2 rounded font-bold bg-gray-300 text-gray-700">BATAL</button>
            )}
            <button type="submit" disabled={loading} className={`px-10 py-2 rounded font-bold text-white shadow-md transition-all ${editId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {loading ? '...' : editId ? 'UPDATE DATA' : 'SIMPAN ROUTING'}
            </button>
          </div>
        </div>
      </form>

      {/* Tabel View: Disesuaikan dengan kolom yang ada */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="bg-gray-800 text-white uppercase tracking-wider">
            <tr>
              <th className="p-3 text-center w-16">ID</th>
              <th className="p-3 border-l border-gray-700">Packing (Item)</th>
              <th className="p-3 border-l border-gray-700">Finishing</th>
              <th className="p-3 border-l border-gray-700">Assy Pannel</th>
              <th className="p-3 border-l border-gray-700">Assy Core</th>
              <th className="p-3 text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {routings.length > 0 ? routings.map(r => (
              <tr key={r.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="p-3 text-center text-gray-500 font-mono">{r.id}</td>
                <td className="p-3">
                   <div className="font-bold text-blue-700">{r.item_code}</div>
                   <div className="text-[10px] text-gray-400 italic">{r.item_desc || 'No description'}</div>
                </td>
                <td className="p-3">
                   <div className="font-bold text-green-700">{r.finishing_code || '-'}</div>
                   <div className="text-[10px] text-gray-400 italic">{r.finishing_desc || '-'}</div>
                </td>
                <td className="p-3">
                   <div className="font-bold text-orange-700">{r.assembly_code_pannel || '-'}</div>
                   <div className="text-[10px] text-gray-400 italic">{r.pannel_desc || '-'}</div>
                </td>
                <td className="p-3">
                   <div className="font-bold text-purple-700">{r.assembly_code_core || '-'}</div>
                   <div className="text-[10px] text-gray-400 italic">{r.core_desc || '-'}</div>
                </td>
                <td className="p-3">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => handleEdit(r)} className="text-blue-600 hover:text-blue-800 font-bold">EDIT</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-800 font-bold">HAPUS</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="p-10 text-center text-gray-400 italic">Belum ada data routing yang terpetakan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}