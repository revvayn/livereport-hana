import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";

export default function Items() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ item_code: "", description: "", uom: "", item_type: "FG" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get("/items");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
      Swal.fire("Error", "Gagal mengambil data items", "error");
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
    if (!form.item_code || !form.item_type) {
      return Swal.fire("Error", "Item code dan type wajib diisi", "warning");
    }

    try {
      setLoading(true);
      if (editId) {
        await api.put(`/items/${editId}`, form);
        Swal.fire("Berhasil", "Item berhasil diupdate", "success");
      } else {
        await api.post("/items", form);
        Swal.fire("Berhasil", "Item berhasil ditambahkan", "success");
      }
      setForm({ item_code: "", description: "", uom: "", item_type: "FG" });
      setEditId(null);
      fetchItems();
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      Swal.fire("Gagal", err.response?.data?.error || "Gagal menyimpan item", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (item) => {
    setForm({
      item_code: item.item_code,
      description: item.description || "",
      uom: item.uom || "",
      item_type: item.item_type || "FG",
    });
    setEditId(item.id);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus item?",
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
      await api.delete(`/items/${id}`);
      Swal.fire("Berhasil", "Item berhasil dihapus", "success");
      fetchItems();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      Swal.fire("Gagal", err.response?.data?.error || "Gagal menghapus item", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow w-full max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Items</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-6 flex gap-3 flex-wrap">
        <input
          type="text"
          className="border p-2 rounded flex-1"
          placeholder="Item Code"
          value={form.item_code}
          onChange={(e) => setForm({ ...form, item_code: e.target.value })}
        />
        <input
          type="text"
          className="border p-2 rounded flex-1"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="text"
          className="border p-2 rounded w-24"
          placeholder="UOM"
          value={form.uom}
          onChange={(e) => setForm({ ...form, uom: e.target.value })}
        />
        <select
          className="border p-2 rounded w-32"
          value={form.item_type}
          onChange={(e) => setForm({ ...form, item_type: e.target.value })}
        >
          <option value="FG">FG</option>
          <option value="WIP">WIP</option>
          <option value="RM">RM</option>
        </select>
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
            <th className="border p-2">Description</th>
            <th className="border p-2">UOM</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length ? (
            items.map((i) => (
              <tr key={i.id}>
                <td className="border p-2">{i.id}</td>
                <td className="border p-2">{i.item_code}</td>
                <td className="border p-2">{i.description}</td>
                <td className="border p-2">{i.uom}</td>
                <td className="border p-2">{i.item_type}</td>
                <td className="border p-2 flex gap-2">
                  <button onClick={() => handleEdit(i)} className="bg-yellow-400 px-2 rounded">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(i.id)} className="bg-red-500 text-white px-2 rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center p-4 text-gray-500">
                {loading ? "Loading..." : "No items found"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
