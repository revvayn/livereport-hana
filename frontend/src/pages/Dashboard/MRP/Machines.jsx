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
    <div className="p-6 bg-white rounded-xl shadow w-full max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Machines</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-6 flex gap-3">
        <input
          className="border p-2 rounded flex-1"
          placeholder="Machine Code"
          value={form.machine_code}
          onChange={(e) => setForm({ ...form, machine_code: e.target.value })}
          required
        />
        <input
          className="border p-2 rounded flex-1"
          placeholder="Machine Name"
          value={form.machine_name}
          onChange={(e) => setForm({ ...form, machine_name: e.target.value })}
          required
        />
        <input
          className="border p-2 rounded flex-1"
          placeholder="Department"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        />
        <button
          type="submit"
          className={`px-4 rounded text-white ${editId ? "bg-yellow-500" : "bg-blue-600"}`}
          disabled={loading}
        >
          {loading ? "Menyimpan..." : editId ? "Update" : "Add"}
        </button>
      </form>

      {/* Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Code</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Department</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {machines.length ? (
            machines.map((m) => (
              <tr key={m.id}>
                <td className="border p-2">{m.id}</td>
                <td className="border p-2">{m.machine_code}</td>
                <td className="border p-2">{m.machine_name}</td>
                <td className="border p-2">{m.department}</td>
                <td className="border p-2 flex gap-2">
                  <button onClick={() => handleEdit(m)} className="bg-yellow-400 px-2 rounded">Edit</button>
                  <button onClick={() => handleDelete(m.id)} className="bg-red-500 text-white px-2 rounded">Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center p-4 text-gray-500">
                {loading ? "Loading..." : "No machines found"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
