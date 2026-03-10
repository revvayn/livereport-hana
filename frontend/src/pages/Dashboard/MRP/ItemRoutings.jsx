import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";
import Select from "react-select"; // Import library baru

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

  // --- LOGIC FETCH & HANDLER (TETAP SAMA) ---
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
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Helper untuk mengubah data master menjadi format yang dikenali react-select { value, label }
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
        Swal.fire("Berhasil", "Routing diupdate", "success");
      } else {
        await api.post("/item-routings", form);
        Swal.fire("Berhasil", "Routing baru disimpan", "success");
      }
      resetForm();
      fetchData();
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.error || "Kesalahan sistem", "error");
    } finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ item_code: "", finishing_code: "", assembly_code_pannel: "", assembly_code_core: "" });
    setEditId(null);
  };

  // Styling kustom untuk react-select agar senada dengan Tailwind Anda
  const customStyles = {
    control: (base) => ({
      ...base,
      fontSize: '14px',
      borderRadius: '0.375rem', // rounded
      borderColor: '#e2e8f0', // border-gray-200
      minHeight: '38px',
    }),
    option: (base) => ({ ...base, fontSize: '13px' }),
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Item Routing Mapping</h1>

      <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          {/* 1. Packing (Item) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">1. Packing (Item)</label>
            <Select
              placeholder="-- Cari Item --"
              options={formatOptions(masters.items, 'item_code', 'item_desc')}
              value={masters.items.find(i => i.item_code === form.item_code) ? { value: form.item_code, label: form.item_code } : null}
              onChange={(opt) => setForm({...form, item_code: opt ? opt.value : ""})}
              styles={customStyles}
              isClearable
            />
          </div>

          {/* 2. Finishing */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-green-600 uppercase tracking-wider">2. Finishing</label>
            <Select
              placeholder="-- Cari Finishing --"
              options={formatOptions(masters.finishing, 'finishing_code', 'finishing_desc')}
              value={masters.finishing.find(f => f.finishing_code === form.finishing_code) ? { value: form.finishing_code, label: form.finishing_code } : null}
              onChange={(opt) => setForm({...form, finishing_code: opt ? opt.value : ""})}
              styles={customStyles}
              isClearable
            />
          </div>

          {/* 3. Assy Pannel */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">3. Assy Pannel</label>
            <Select
              placeholder="-- Cari Pannel --"
              options={formatOptions(masters.pannels, 'assembly_code', 'pannel_desc')}
              value={masters.pannels.find(p => p.assembly_code === form.assembly_code_pannel) ? { value: form.assembly_code_pannel, label: form.assembly_code_pannel } : null}
              onChange={(opt) => setForm({...form, assembly_code_pannel: opt ? opt.value : ""})}
              styles={customStyles}
              isClearable
            />
          </div>

          {/* 4. Assy Core */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">4. Assy Core</label>
            <Select
              placeholder="-- Cari Core --"
              options={formatOptions(masters.cores, 'assembly_code', 'core_desc')}
              value={masters.cores.find(c => c.assembly_code === form.assembly_code_core) ? { value: form.assembly_code_core, label: form.assembly_code_core } : null}
              onChange={(opt) => setForm({...form, assembly_code_core: opt ? opt.value : ""})}
              styles={customStyles}
              isClearable
            />
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

      {/* Tabel View (TETAP SAMA SEPERTI SEBELUMNYA) */}
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
                <td className="p-3 text-center">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => {
                        setForm({
                            item_code: r.item_code || "",
                            finishing_code: r.finishing_code || "",
                            assembly_code_pannel: r.assembly_code_pannel || "",
                            assembly_code_core: r.assembly_code_core || ""
                        });
                        setEditId(r.id);
                    }} className="text-blue-600 hover:text-blue-800 font-bold">EDIT</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-800 font-bold">HAPUS</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="p-10 text-center text-gray-400 italic">Belum ada data routing.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}