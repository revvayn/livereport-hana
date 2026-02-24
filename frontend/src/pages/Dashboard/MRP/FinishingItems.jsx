import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";

export default function FinishingItems() {
  const [selectedItemId, setSelectedItemId] = useState("");
  const [itemName, setItemName] = useState("");
  const [allItems, setAllItems] = useState([]); // Master Items
  const [finishingItems, setFinishingItems] = useState([]); // Data dari tabel item_finishing
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    finishing_code: "",
    description: "",
    warehouse: "",
  });

  /* ================= FETCH DATA MASTER (ITEMS) ================= */
  useEffect(() => {
    const fetchMasterItems = async () => {
      try {
        const res = await api.get("/finishing-items");
        console.log("Data Master Items:", res.data); // Cek apakah data masuk
        setAllItems(res.data || []);
      } catch (err) {
        // Tambahkan console.error untuk melihat status code (404, 500, dll)
        console.error("Error Fetch Master:", err.response || err);
        Swal.fire("Error", "Gagal load data master items", "error");
      }
    };
    fetchMasterItems();
  }, []);

  /* ================= FETCH DETAIL FINISHING BERDASARKAN ITEM ================= */
  useEffect(() => {
    if (selectedItemId) {
      fetchFinishingList(selectedItemId);
      const item = allItems.find((x) => Number(x.id) === Number(selectedItemId));
      setItemName(item ? `${item.item_code} - ${item.description}` : "");
    } else {
      setFinishingItems([]);
      setItemName("");
    }
    cancelEdit();
  }, [selectedItemId]);

  const fetchFinishingList = async (itemId) => {
    try {
      setLoading(true);
      // Perbaikan: Tambahkan prefix /finishing-items di depan /item
      // URL yang benar: /api/finishing-items/item/${itemId}
      const res = await api.get(`/finishing-items/item/${itemId}`);
      setFinishingItems(res.data || []);
    } catch (err) {
      console.error("Fetch Detail Error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItemId) return Swal.fire("Peringatan", "Pilih Item Utama terlebih dahulu", "warning");

    try {
      const payload = {
        items_id: parseInt(selectedItemId),
        finishing_code: form.finishing_code,
        description: form.description,
        warehouse: form.warehouse,
      };

      if (editId) {
        await api.put(`/finishing-items/${editId}`, payload);
        Swal.fire("Berhasil", "Finishing berhasil diupdate", "success");
      } else {
        await api.post("/finishing-items", payload);
        Swal.fire("Berhasil", "Finishing berhasil ditambahkan", "success");
      }

      cancelEdit();
      fetchFinishingList(selectedItemId);
    } catch (err) {
      Swal.fire("Error", "Gagal menyimpan data", "error");
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ finishing_code: "", description: "", warehouse: "" });
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Finishing?",
      text: "Data finishing ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/finishing-items/${id}`);
        Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
        fetchFinishingList(selectedItemId);
      } catch (err) {
        Swal.fire("Error", "Gagal menghapus data", "error");
      }
    }
  };

  return (
    <div className="p-6 bg-white border rounded-lg max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4 border-b pb-2">
        Finishing Setup for: <span className="text-blue-600">{itemName || "Select Item First"}</span>
      </h1>

      {/* Selector Item Utama */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-500 mb-1">Pilih Item Utama</label>
        <select
          className="w-full md:w-1/2 p-2 border border-gray-300 rounded text-sm bg-white"
          value={selectedItemId}
          onChange={(e) => setSelectedItemId(e.target.value)}
        >
          <option value="">-- Pilih Master Item --</option>
          {allItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.item_code} - {item.description}
            </option>
          ))}
        </select>
      </div>

      {/* Form Input Finishing */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 items-end bg-gray-50 p-4 rounded">
        <div>
          <label className="block text-[10px] font-bold uppercase text-gray-600">Finishing Code</label>
          <input
            type="text"
            className="w-full p-2 border rounded text-sm"
            placeholder="Contoh: COATING-01"
            value={form.finishing_code}
            onChange={(e) => setForm({ ...form, finishing_code: e.target.value })}
            required
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-[10px] font-bold uppercase text-gray-600">Warehouse</label>
          <input
            type="text"
            className="w-full p-2 border rounded text-sm"
            placeholder="Warehouse..."
            value={form.warehouse}
            onChange={(e) => setForm({ ...form, warehouse: e.target.value })}
            required
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-[10px] font-bold uppercase text-gray-600">Description</label>
          <input
            type="text"
            className="w-full p-2 border rounded text-sm"
            placeholder="Detail proses..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={`flex-1 p-2 rounded font-bold text-white text-sm ${editId ? 'bg-orange-500' : 'bg-blue-600'}`}>
            {editId ? 'UPDATE' : 'ADD'}
          </button>
          {editId && (
            <button type="button" onClick={cancelEdit} className="p-2 bg-gray-400 text-white rounded text-sm font-bold">
              X
            </button>
          )}
        </div>
      </form>

      {/* Tabel Finishing */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 text-left text-gray-600 uppercase text-[11px]">
            <tr>
              <th className="border p-3 w-10 text-center">No</th>
              <th className="border p-3">Finishing Code</th>
              <th className="border p-3">Description</th>
              <th className="border p-3">Warehouse</th>
              <th className="border p-3 text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {finishingItems.length > 0 ? (
              finishingItems.map((fi, idx) => (
                <tr key={fi.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border p-3 text-center text-gray-400">{idx + 1}</td>
                  <td className="border p-3 font-mono font-bold text-blue-700">{fi.finishing_code}</td>
                  <td className="border p-3">{fi.description || "-"}</td>
                  <td className="border p-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      {fi.warehouse}
                    </span>
                  </td>
                  <td className="border p-3 text-center">
                    <button
                      onClick={() => {
                        setEditId(fi.id);
                        setForm({
                          finishing_code: fi.finishing_code,
                          description: fi.description || "",
                          warehouse: fi.warehouse || "",
                        });
                      }}
                      className="text-blue-600 hover:underline mr-3 font-medium"
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(fi.id)} className="text-red-600 hover:underline font-medium">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-10 text-gray-400 italic">
                  {selectedItemId ? "No finishing details found for this item." : "Please select an item to see details."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}