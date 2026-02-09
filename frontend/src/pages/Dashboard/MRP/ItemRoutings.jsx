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
    <div className="p-6 bg-white rounded-lg border border-gray-300 w-full max-w-6xl mx-auto shadow-sm">
      <h1 className="text-xl font-bold mb-5 pb-2 border-b border-gray-200 text-gray-800">Item Routings</h1>

      {/* Form: Dibuat Grid agar tinggi dan jarak antar elemen konsisten */}
      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Item</label>
          <select
            value={form.item_id}
            onChange={e => setForm({ ...form, item_id: e.target.value })}
            required
            className="border border-gray-300 p-2 rounded text-sm bg-white focus:outline-none focus:border-blue-500 w-full h-10"
          >
            <option value="">-- Pilih Item --</option>
            {items.map(i => <option key={i.id} value={i.id}>{i.item_code}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Operation</label>
          <select
            value={form.operation_id}
            onChange={e => setForm({ ...form, operation_id: e.target.value })}
            required
            className="border border-gray-300 p-2 rounded text-sm bg-white focus:outline-none focus:border-blue-500 w-full h-10"
          >
            <option value="">-- Operation --</option>
            {operations.map(o => <option key={o.id} value={o.id}>{o.operation_name}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Machine</label>
          <select
            value={form.machine_id}
            onChange={e => setForm({ ...form, machine_id: e.target.value })}
            required
            className="border border-gray-300 p-2 rounded text-sm bg-white focus:outline-none focus:border-blue-500 w-full h-10"
          >
            <option value="">-- Machine --</option>
            {machines.map(m => <option key={m.id} value={m.id}>{m.machine_name}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">C/T (Min)</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={form.cycle_time_min}
            onChange={e => setForm({ ...form, cycle_time_min: e.target.value })}
            required
            className="border border-gray-300 p-2 rounded text-sm focus:outline-none focus:border-blue-500 w-full h-10 text-center"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Sequence</label>
          <input
            type="number"
            placeholder="Seq"
            value={form.sequence}
            onChange={e => setForm({ ...form, sequence: e.target.value })}
            required
            className="border border-gray-300 p-2 rounded text-sm focus:outline-none focus:border-blue-500 w-full h-10 text-center"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`h-10 rounded text-sm font-bold text-white transition-all shadow-sm ${editId ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "..." : editId ? "UPDATE" : "TAMBAH"}
        </button>
      </form>

      {/* Tabel Symmetrical Layout */}
      <div className="overflow-hidden border border-gray-200 rounded-md">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-left text-xs font-bold text-gray-600 uppercase w-12 text-center">ID</th>
              <th className="p-3 text-left text-xs font-bold text-gray-600 uppercase">Item Code</th>
              <th className="p-3 text-left text-xs font-bold text-gray-600 uppercase">Operation</th>
              <th className="p-3 text-left text-xs font-bold text-gray-600 uppercase">Machine</th>
              <th className="p-3 text-center text-xs font-bold text-gray-600 uppercase w-24">C/T</th>
              <th className="p-3 text-center text-xs font-bold text-gray-600 uppercase w-20">Seq</th>
              <th className="p-3 text-center text-xs font-bold text-gray-600 uppercase w-32">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {routings.length > 0 ? (
              routings.map((r) => (
                <tr key={r.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-3 text-center text-gray-400 font-mono text-xs">{r.id}</td>
                  <td className="p-3 font-bold text-blue-700">{r.item_code}</td>
                  <td className="p-3 text-gray-700">{r.operation_name}</td>
                  <td className="p-3 text-gray-600 italic">{r.machine_name}</td>
                  <td className="p-3 text-center font-mono">{parseFloat(r.cycle_time_min).toFixed(2)}</td>
                  <td className="p-3 text-center font-bold">
                    <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">{r.sequence}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => handleEdit(r)} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-tighter">Edit</button>
                      <span className="text-gray-300">|</span>
                      <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-800 font-bold text-xs uppercase tracking-tighter">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-12 text-gray-400 italic">
                  {loading ? "Sedang menyelaraskan data..." : "Database routing kosong."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
