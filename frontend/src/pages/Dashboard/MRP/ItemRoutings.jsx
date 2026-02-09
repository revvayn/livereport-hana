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
    <div className="p-6 bg-white rounded-lg border border-gray-300 w-full max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-5 pb-2 border-b border-gray-200">Item Routings</h1>

      {/* Form Sederhana - flex-wrap agar aman di layar tanggung */}
      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap gap-2">
        <select
          value={form.item_id}
          onChange={e => setForm({ ...form, item_id: e.target.value })}
          required
          className="border border-gray-300 p-2 rounded text-sm bg-white focus:outline-none focus:border-blue-500"
        >
          <option value="">-- Pilih Item --</option>
          {items.map(i => <option key={i.id} value={i.id}>{i.item_code}</option>)}
        </select>

        <select
          value={form.operation_id}
          onChange={e => setForm({ ...form, operation_id: e.target.value })}
          required
          className="border border-gray-300 p-2 rounded text-sm bg-white focus:outline-none focus:border-blue-500"
        >
          <option value="">-- Pilih Operation --</option>
          {operations.map(o => <option key={o.id} value={o.id}>{o.operation_name}</option>)}
        </select>

        <select
          value={form.machine_id}
          onChange={e => setForm({ ...form, machine_id: e.target.value })}
          required
          className="border border-gray-300 p-2 rounded text-sm bg-white focus:outline-none focus:border-blue-500"
        >
          <option value="">-- Pilih Machine --</option>
          {machines.map(m => <option key={m.id} value={m.id}>{m.machine_name}</option>)}
        </select>

        <input
          type="number"
          step="0.01"
          placeholder="Cycle Time (min)"
          value={form.cycle_time_min}
          onChange={e => setForm({ ...form, cycle_time_min: e.target.value })}
          required
          className="border border-gray-300 p-2 rounded text-sm w-32 focus:outline-none focus:border-blue-500"
        />

        <input
          type="number"
          placeholder="Seq"
          value={form.sequence}
          onChange={e => setForm({ ...form, sequence: e.target.value })}
          required
          className="border border-gray-300 p-2 rounded text-sm w-20 focus:outline-none focus:border-blue-500"
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
              <th className="border border-gray-200 p-3">Item</th>
              <th className="border border-gray-200 p-3">Operation</th>
              <th className="border border-gray-200 p-3">Machine</th>
              <th className="border border-gray-200 p-3 w-28 text-center">C/T (Min)</th>
              <th className="border border-gray-200 p-3 w-20 text-center">Seq</th>
              <th className="border border-gray-200 p-3 w-32 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {routings.length > 0 ? (
              routings.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-3 text-gray-500">{r.id}</td>
                  <td className="border border-gray-200 p-3 font-semibold text-blue-700">{r.item_code}</td>
                  <td className="border border-gray-200 p-3 font-medium">{r.operation_name}</td>
                  <td className="border border-gray-200 p-3 text-gray-600">{r.machine_name}</td>
                  <td className="border border-gray-200 p-3 text-center">{r.cycle_time_min}</td>
                  <td className="border border-gray-200 p-3 text-center font-bold">{r.sequence}</td>
                  <td className="border border-gray-200 p-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(r)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleDelete(r.id)}
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
                <td colSpan="7" className="text-center p-10 text-gray-400">
                  {loading ? "Memuat data..." : "Belum ada data routing item."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
