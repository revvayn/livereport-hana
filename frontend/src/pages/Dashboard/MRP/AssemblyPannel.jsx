import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";

export default function AssemblyPannel() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ 
    assembly_code: "", 
    description: "", 
    warehouse: "" 
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_PATH = "/assembly/pannel"; 

  /* ================= FETCH DATA ================= */
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get(API_PATH);
      // Backend mengembalikan res.json(result.rows)
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
      Swal.fire("Error", "Gagal mengambil data assembly pannel", "error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  /* ================= ADD / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi sederhana
    if (!form.assembly_code.trim()) {
      return Swal.fire("Peringatan", "Kode Assembly tidak boleh kosong", "warning");
    }

    try {
      setLoading(true);
      if (editId) {
        // Mode Update
        await api.put(`${API_PATH}/${editId}`, form);
        Swal.fire("Berhasil", "Data Pannel berhasil diperbarui", "success");
      } else {
        // Mode Create
        await api.post(API_PATH, form);
        Swal.fire("Berhasil", "Data Pannel berhasil ditambahkan", "success");
      }
      
      handleReset();
      fetchItems();
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || "Terjadi kesalahan saat menyimpan data";
      Swal.fire("Gagal", errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT HANDLER ================= */
  const handleEdit = (item) => {
    setForm({
      assembly_code: item.assembly_code,
      description: item.description || "",
      warehouse: item.warehouse || "WIPA",
    });
    setEditId(item.id);
    // Scroll ke atas agar user sadar sedang mode edit
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ================= RESET HANDLER ================= */
  const handleReset = () => {
    setForm({ assembly_code: "", description: "", warehouse: "WIPA" });
    setEditId(null);
  };

  /* ================= DELETE HANDLER ================= */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data assembly pannel ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await api.delete(`${API_PATH}/${id}`);
        Swal.fire("Dihapus!", "Data telah berhasil dihapus.", "success");
        fetchItems();
      } catch (err) {
        console.error("Delete error:", err.response?.data || err.message);
        Swal.fire("Gagal", "Gagal menghapus data", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-6xl mx-auto my-4">
      <div className="flex justify-between items-center mb-6 pb-2 border-b">
        <h1 className="text-2xl font-bold text-gray-800">Master Assembly Pannel</h1>
        {editId && (
          <button 
            onClick={handleReset}
            className="text-sm text-red-500 hover:underline font-medium"
          >
            Batal Edit
          </button>
        )}
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-8 flex gap-3 flex-wrap items-end border border-gray-100">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Kode Assembly</label>
          <input
            type="text"
            className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            placeholder="Contoh: ASSY-PNL-001"
            value={form.assembly_code}
            onChange={(e) => setForm({ ...form, assembly_code: e.target.value })}
          />
        </div>

        <div className="flex-[2] min-w-[300px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Deskripsi</label>
          <input
            type="text"
            className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            placeholder="Keterangan barang..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="w-32">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Warehouse</label>
          <input
            type="text"
            className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            placeholder="WIPA"
            value={form.warehouse}
            onChange={(e) => setForm({ ...form, warehouse: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`px-8 py-2 rounded text-sm font-bold text-white shadow-sm transition-all h-[38px] ${
            editId 
              ? "bg-orange-500 hover:bg-orange-600 active:scale-95" 
              : "bg-blue-600 hover:bg-blue-700 active:scale-95"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "PROSES..." : editId ? "UPDATE DATA" : "SIMPAN BARU"}
        </button>
      </form>

      {/* Table Section */}
      <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full border-collapse bg-white text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-gray-600 uppercase text-[11px] font-bold tracking-wider">
              <th className="p-4 w-16">ID</th>
              <th className="p-4 w-56">Kode Assembly</th>
              <th className="p-4">Deskripsi</th>
              <th className="p-4 w-32">Warehouse</th>
              <th className="p-4 w-40 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length > 0 ? (
              items.map((i) => (
                <tr key={i.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-4 text-gray-400 font-medium">{i.id}</td>
                  <td className="p-4 font-mono font-bold text-blue-700">{i.assembly_code}</td>
                  <td className="p-4 text-gray-600">{i.description || "-"}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      {i.warehouse}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-4 justify-center">
                      <button 
                        onClick={() => handleEdit(i)} 
                        className="text-blue-600 hover:text-blue-800 font-semibold text-xs uppercase tracking-tight"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(i.id)} 
                        className="text-red-500 hover:text-red-700 font-semibold text-xs uppercase tracking-tight"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-20 text-gray-400 italic bg-gray-50/50">
                  {loading ? "Sedang menyinkronkan data..." : "Data Pannel tidak ditemukan."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}