import { useState, useEffect } from "react";
import api from "../../../api/api"; // pastikan api.js punya baseURL http://localhost:5000/api
import Swal from "sweetalert2";

export default function Machines() {
  const [machines, setMachines] = useState([]);
  const [form, setForm] = useState({ machine_code: "", machine_name: "", department: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const res = await api.get("/machines");
      setMachines(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
      Swal.fire("Error", "Gagal mengambil data machines", "error");
      setMachines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.machine_code || !form.machine_name) {
      return Swal.fire("Error", "Machine code dan name wajib diisi", "warning");
    }

    try {
      setLoading(true);
      if (editId) {
        await api.put(`/machines/${editId}`, form);
        Swal.fire("Berhasil", "Machine berhasil diupdate", "success");
      } else {
        await api.post("/machines", form);
        Swal.fire("Berhasil", "Machine berhasil ditambahkan", "success");
      }
      setForm({ machine_code: "", machine_name: "", department: "" });
      setEditId(null);
      fetchMachines();
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      Swal.fire("Gagal", err.response?.data?.error || "Gagal menyimpan machine", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (m) => {
    setForm({
      machine_code: m.machine_code || "",
      machine_name: m.machine_name || "",
      department: m.department || ""
    });
    setEditId(m.id);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus machine?",
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
      await api.delete(`/machines/${id}`);
      Swal.fire("Berhasil", "Machine berhasil dihapus", "success");
      fetchMachines();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      Swal.fire("Gagal", err.response?.data?.error || "Gagal menghapus machine", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-300 w-full max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-5 pb-2 border-b border-gray-200">Master Data Machines</h1>

      {/* Form Sederhana */}
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          type="text"
          className="border border-gray-300 p-2 rounded text-sm w-40 focus:outline-none focus:border-blue-500"
          placeholder="Kode Mesin"
          value={form.machine_code}
          onChange={(e) => setForm({ ...form, machine_code: e.target.value })}
          required
        />
        <input
          type="text"
          className="border border-gray-300 p-2 rounded flex-1 text-sm focus:outline-none focus:border-blue-500"
          placeholder="Nama Mesin"
          value={form.machine_name}
          onChange={(e) => setForm({ ...form, machine_name: e.target.value })}
          required
        />
        <input
          type="text"
          className="border border-gray-300 p-2 rounded w-40 text-sm focus:outline-none focus:border-blue-500"
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
              <th className="border border-gray-200 p-3 w-40">Kode Mesin</th>
              <th className="border border-gray-200 p-3">Nama Mesin</th>
              <th className="border border-gray-200 p-3 w-40">Departemen</th>
              <th className="border border-gray-200 p-3 w-32 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {machines.length > 0 ? (
              machines.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-3 text-gray-500">{m.id}</td>
                  <td className="border border-gray-200 p-3 font-mono font-semibold">{m.machine_code}</td>
                  <td className="border border-gray-200 p-3 uppercase">{m.machine_name}</td>
                  <td className="border border-gray-200 p-3">
                    <span className="text-gray-600 italic">{m.department || "-"}</span>
                  </td>
                  <td className="border border-gray-200 p-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(m)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleDelete(m.id)}
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
                <td colSpan="5" className="text-center p-10 text-gray-400">
                  {loading ? "Memuat data..." : "Belum ada data mesin."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
