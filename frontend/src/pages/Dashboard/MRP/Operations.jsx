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
    <div className="p-6 bg-white rounded-xl shadow w-full max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Operations</h1>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-3">
        <input
          className="border p-2 rounded flex-1"
          placeholder="Operation Name"
          value={form.operation_name}
          onChange={(e) => setForm({ ...form, operation_name: e.target.value })}
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

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Operation Name</th>
            <th className="border p-2">Department</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {operations.length ? (
            operations.map((op) => (
              <tr key={op.id}>
                <td className="border p-2">{op.id}</td>
                <td className="border p-2">{op.operation_name}</td>
                <td className="border p-2">{op.department}</td>
                <td className="border p-2 flex gap-2">
                  <button onClick={() => handleEdit(op)} className="bg-yellow-400 px-2 rounded">Edit</button>
                  <button onClick={() => handleDelete(op.id)} className="bg-red-500 text-white px-2 rounded">Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center p-4 text-gray-500">
                {loading ? "Loading..." : "No operations found"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
