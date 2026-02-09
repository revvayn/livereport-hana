import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";

export default function Operations() {
  const [operations, setOperations] = useState([]);
  const [form, setForm] = useState({ operation_name: "", department: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOperations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/operations");
      setOperations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
      Swal.fire("Error", "Gagal mengambil data operations", "error");
      setOperations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.operation_name) {
      return Swal.fire("Error", "Operation name wajib diisi", "warning");
    }

    try {
      setLoading(true);
      if (editId) {
        await api.put(`/operations/${editId}`, form);
        Swal.fire("Berhasil", "Operation berhasil diupdate", "success");
      } else {
        await api.post("/operations", form);
        Swal.fire("Berhasil", "Operation berhasil ditambahkan", "success");
      }
      setForm({ operation_name: "", department: "" });
      setEditId(null);
      fetchOperations();
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      Swal.fire("Gagal", err.response?.data?.error || "Gagal menyimpan operation", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (op) => {
    setForm({
      operation_name: op.operation_name || "",
      department: op.department || ""
    });
    setEditId(op.id);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus operation?",
      text: "Data tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
    });
    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      await api.delete(`/operations/${id}`);
      Swal.fire("Berhasil", "Operation berhasil dihapus", "success");
      fetchOperations();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      Swal.fire("Gagal", err.response?.data?.error || "Gagal menghapus operation", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-300 w-full max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-5 pb-2 border-b border-gray-200">Master Data Operations</h1>

      {/* Form Sederhana */}
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          type="text"
          className="border border-gray-300 p-2 rounded flex-1 text-sm focus:outline-none focus:border-blue-500"
          placeholder="Nama Operasi (Contoh: Cutting, Welding)"
          value={form.operation_name}
          onChange={(e) => setForm({ ...form, operation_name: e.target.value })}
          required
        />
        <input
          type="text"
          className="border border-gray-300 p-2 rounded flex-1 text-sm focus:outline-none focus:border-blue-500"
          placeholder="Departemen"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        />
        <button
          type="submit"
          disabled={loading}
          className={`px-6 rounded text-sm font-bold text-white transition-colors ${editId ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "..." : editId ? "UPDATE" : "TAMBAH"}
        </button>
      </form>

      {/* Tabel Standar */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr className="text-left uppercase text-xs font-bold text-gray-600">
              <th className="border border-gray-200 p-3 w-16">ID</th>
              <th className="border border-gray-200 p-3">Nama Operasi</th>
              <th className="border border-gray-200 p-3 w-48">Departemen</th>
              <th className="border border-gray-200 p-3 w-32 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {operations.length > 0 ? (
              operations.map((op) => (
                <tr key={op.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-3 text-gray-500">{op.id}</td>
                  <td className="border border-gray-200 p-3 font-semibold">{op.operation_name}</td>
                  <td className="border border-gray-200 p-3 text-gray-600">{op.department || "-"}</td>
                  <td className="border border-gray-200 p-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(op)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleDelete(op.id)}
                        className="text-red-600 hover:underline font-medium"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-10 text-gray-400">
                  {loading ? "Memuat data..." : "Belum ada data operasi."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
