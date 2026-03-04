import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";

export default function FinishingItems() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ 
    finishing_code: "", 
    description: "", 
    warehouse: "WIPA"
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_PATH = "/finishing"; 

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get(API_PATH);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Swal.fire("Error", "Gagal mengambil data master finishing", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.finishing_code) {
      return Swal.fire("Peringatan", "Kode Finishing wajib diisi", "warning");
    }

    try {
      setLoading(true);
      if (editId) {
        await api.put(`${API_PATH}/${editId}`, form);
        Swal.fire("Berhasil", "Data Finishing berhasil diupdate", "success");
      } else {
        await api.post(API_PATH, form);
        Swal.fire("Berhasil", "Data Finishing berhasil ditambahkan", "success");
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
      finishing_code: item.finishing_code,
      description: item.description || "",
      warehouse: item.warehouse || "WIPA"
    });
    setEditId(item.id);
  };

  const handleReset = () => {
    setForm({ finishing_code: "", description: "", warehouse: "WIPA" });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus data finishing?",
      text: "Data tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`${API_PATH}/${id}`);
        Swal.fire("Berhasil", "Data berhasil dihapus", "success");
        fetchItems();
      } catch (err) {
        Swal.fire("Gagal", "Gagal menghapus data", "error");
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-300 w-full max-w-5xl mx-auto shadow-sm">
      <h1 className="text-xl font-bold mb-5 pb-2 border-b border-gray-200 text-gray-800">
        Master Finishing
      </h1>

      {/* Form Section - Grid disesuaikan menjadi 4 kolom karena Item Ref dihapus */}
      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 p-4 rounded-md border border-gray-200 shadow-inner">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Kode Finishing</label>
          <input
            type="text"
            placeholder="FIN-XXX"
            className="border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase font-bold"
            value={form.finishing_code}
            onChange={(e) => setForm({ ...form, finishing_code: e.target.value.toUpperCase() })}
          />
        </div>

        <div className="flex flex-col gap-1 md:col-span-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Deskripsi</label>
          <input
            type="text"
            placeholder="Keterangan proses..."
            className="border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Warehouse</label>
          <input
            type="text"
            className="border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.warehouse}
            onChange={(e) => setForm({ ...form, warehouse: e.target.value })}
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className={`flex-1 h-[38px] ${editId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded text-xs font-bold transition-all shadow-sm`}>
            {loading ? "..." : editId ? "UPDATE DATA" : "SIMPAN MASTER"}
          </button>
          {editId && (
            <button type="button" onClick={handleReset} className="px-4 h-[38px] bg-gray-400 text-white rounded text-xs font-bold hover:bg-gray-500">
              BATAL
            </button>
          )}
        </div>
      </form>

      {/* Table View */}
      <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-white font-bold uppercase text-[10px] tracking-widest">
            <tr>
              <th className="p-4 text-left">Kode Finishing</th>
              <th className="p-4 text-left">Deskripsi</th>
              <th className="p-4 text-left">Warehouse</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((i) => (
              <tr key={i.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="p-4 font-mono font-bold text-blue-700">{i.finishing_code}</td>
                <td className="p-4 text-gray-700">{i.description || "-"}</td>
                <td className="p-4">
                  <span className="bg-gray-200 px-3 py-1 rounded-full text-[10px] font-bold text-gray-700">
                    {i.warehouse}
                  </span>
                </td>
                <td className="p-4 text-center whitespace-nowrap">
                  <button onClick={() => handleEdit(i)} className="text-blue-600 font-bold hover:text-blue-800 px-2 text-xs">EDIT</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => handleDelete(i.id)} className="text-red-500 font-bold hover:text-red-700 px-2 text-xs">HAPUS</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="4" className="p-10 text-center text-gray-400 italic">
                  Belum ada data master finishing yang tersimpan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}