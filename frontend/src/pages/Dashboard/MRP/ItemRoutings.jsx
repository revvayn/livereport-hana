import { useState, useEffect } from "react";
import api from "../../../api/api"; // pastikan api.js baseURL ke backend
import Swal from "sweetalert2";

export default function ItemRoutings() {
  const [routings, setRoutings] = useState([]);
  const [form, setForm] = useState({ item_id: "", operation_id: "", machine_id: "", cycle_time_min: "", sequence: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRoutings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/item-routings");
      setRoutings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal fetch item routings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.item_id || !form.operation_id || !form.machine_id || !form.sequence) {
      return Swal.fire("Error", "Item, Operation, Machine, dan Sequence wajib diisi", "warning");
    }
    try {
      setLoading(true);
      if (editId) {
        await api.put(`/item-routings/${editId}`, form);
        Swal.fire("Berhasil", "Item routing diupdate", "success");
      } else {
        await api.post("/item-routings", form);
        Swal.fire("Berhasil", "Item routing ditambahkan", "success");
      }
      setForm({ item_id: "", operation_id: "", machine_id: "", cycle_time_min: "", sequence: "" });
      setEditId(null);
      fetchRoutings();
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", err.response?.data?.error || "Gagal menyimpan routing", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (r) => {
    setForm({
      item_id: r.item_id,
      operation_id: r.operation_id,
      machine_id: r.machine_id,
      cycle_time_min: r.cycle_time_min,
      sequence: r.sequence,
    });
    setEditId(r.id);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus item routing?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
    });
    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      await api.delete(`/item-routings/${id}`);
      Swal.fire("Berhasil", "Item routing dihapus", "success");
      fetchRoutings();
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", err.response?.data?.error || "Gagal hapus routing", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow w-full max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Item Routings</h1>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap gap-2">
        <input placeholder="Item ID" value={form.item_id} onChange={(e) => setForm({...form, item_id: e.target.value})} required className="border p-2 rounded"/>
        <input placeholder="Operation ID" value={form.operation_id} onChange={(e) => setForm({...form, operation_id: e.target.value})} required className="border p-2 rounded"/>
        <input placeholder="Machine ID" value={form.machine_id} onChange={(e) => setForm({...form, machine_id: e.target.value})} required className="border p-2 rounded"/>
        <input placeholder="Cycle Time (min)" value={form.cycle_time_min} onChange={(e) => setForm({...form, cycle_time_min: e.target.value})} className="border p-2 rounded"/>
        <input placeholder="Sequence" value={form.sequence} onChange={(e) => setForm({...form, sequence: e.target.value})} required className="border p-2 rounded"/>
        <button type="submit" className={`px-4 rounded text-white ${editId?"bg-yellow-500":"bg-blue-600"}`} disabled={loading}>
          {loading ? "Menyimpan..." : editId ? "Update" : "Add"}
        </button>
      </form>

      <table className="w-full border-collapse border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Item</th>
            <th className="border p-2">Operation</th>
            <th className="border p-2">Machine</th>
            <th className="border p-2">Cycle Time</th>
            <th className="border p-2">Sequence</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {routings.length ? routings.map(r => (
            <tr key={r.id}>
              <td className="border p-2">{r.id}</td>
              <td className="border p-2">{r.item_name}</td>
              <td className="border p-2">{r.operation_name}</td>
              <td className="border p-2">{r.machine_name}</td>
              <td className="border p-2">{r.cycle_time_min}</td>
              <td className="border p-2">{r.sequence}</td>
              <td className="border p-2 flex gap-2">
                <button onClick={() => handleEdit(r)} className="bg-yellow-400 px-2 rounded">Edit</button>
                <button onClick={() => handleDelete(r.id)} className="bg-red-500 text-white px-2 rounded">Delete</button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="7" className="text-center p-4 text-gray-500">{loading ? "Loading..." : "No item routings found"}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
