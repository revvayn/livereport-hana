import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";

export default function ItemRoutings() {
  const [routings, setRoutings] = useState([]);
  const [items, setItems] = useState([]);
  const [machines, setMachines] = useState([]);
  const [operations, setOperations] = useState([]);
  const [form, setForm] = useState({
    item_id: "",
    operation_id: "",
    machine_id: "",
    cycle_time_min: "",
    sequence: ""
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRoutings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/item-routings");
      setRoutings(res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal fetch item routings", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [resItems, resMachines, resOperations] = await Promise.all([
        api.get("/items"),
        api.get("/machines"),
        api.get("/operations")
      ]);
      setItems(resItems.data || []);
      setMachines(resMachines.data || []);
      setOperations(resOperations.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoutings();
    fetchDropdowns();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { item_id, operation_id, machine_id, cycle_time_min, sequence } = form;
    if (!item_id || !operation_id || !machine_id || cycle_time_min === "" || sequence === "") {
      return Swal.fire("Error", "Semua field wajib diisi", "warning");
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
      Swal.fire("Gagal", err.response?.data?.error || "Gagal menyimpan item routing", "error");
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
      sequence: r.sequence
    });
    setEditId(r.id);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus routing?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626"
    });
    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      await api.delete(`/item-routings/${id}`);
      Swal.fire("Berhasil", "Routing dihapus", "success");
      fetchRoutings();
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", err.response?.data?.error || "Gagal hapus routing", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-semibold mb-2">Item Routings</h2>

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-4">
        <select value={form.item_id} onChange={e => setForm({...form, item_id: e.target.value})} required className="border p-2 rounded">
          <option value="">-- Pilih Item --</option>
          {items.map(i => <option key={i.id} value={i.id}>{i.item_code}</option>)}
        </select>
        <select value={form.operation_id} onChange={e => setForm({...form, operation_id: e.target.value})} required className="border p-2 rounded">
          <option value="">-- Pilih Operation --</option>
          {operations.map(o => <option key={o.id} value={o.id}>{o.operation_name}</option>)}
        </select>
        <select value={form.machine_id} onChange={e => setForm({...form, machine_id: e.target.value})} required className="border p-2 rounded">
          <option value="">-- Pilih Machine --</option>
          {machines.map(m => <option key={m.id} value={m.id}>{m.machine_name}</option>)}
        </select>
        <input type="number" step="0.01" placeholder="Cycle Time (min)" value={form.cycle_time_min} onChange={e => setForm({...form, cycle_time_min: e.target.value})} required className="border p-2 rounded"/>
        <input type="number" placeholder="Sequence" value={form.sequence} onChange={e => setForm({...form, sequence: e.target.value})} required className="border p-2 rounded"/>
        <button type="submit" className={`px-4 rounded text-white ${editId ? "bg-yellow-500" : "bg-blue-600"}`} disabled={loading}>
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
              <td className="border p-2">{r.item_code}</td>
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
              <td colSpan="7" className="text-center p-2 text-gray-500">{loading ? "Loading..." : "No routings found"}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
