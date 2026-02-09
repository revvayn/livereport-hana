import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";

export default function SalesOrderItems() {
  const [selectedSOId, setSelectedSOId] = useState("");
  const [soNumber, setSoNumber] = useState("");
  const [allSalesOrders, setAllSalesOrders] = useState([]);
  const [items, setItems] = useState([]); // Data item di dalam SO yang dipilih
  const [allItems, setAllItems] = useState([]); // Master data item untuk dropdown
  const [form, setForm] = useState({ item_id: "", quantity: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Ambil Data Awal (Dropdown SO dan Master Items)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSO, resItems] = await Promise.all([
          api.get("/sales-orders"),
          api.get("/items")
        ]);
        setAllSalesOrders(Array.isArray(resSO.data) ? resSO.data : []);
        setAllItems(Array.isArray(resItems.data) ? resItems.data : []);
      } catch (err) {
        console.error("Fetch Error:", err);
        Swal.fire("Error", "Gagal memuat data awal", "error");
      }
    };
    fetchData();
  }, []);

  // 2. Ambil Items milik SO yang dipilih
  // 2. Ambil Items milik SO yang dipilih
  useEffect(() => {
    if (selectedSOId) {
      fetchItems(selectedSOId);

      // Pastikan perbandingan tipe datanya sama (sama-sama Number)
      const so = allSalesOrders.find((x) => Number(x.id) === Number(selectedSOId));
      setSoNumber(so?.so_number || "");
    } else {
      setItems([]);
      setSoNumber("");
    }
    cancelEdit();
  }, [selectedSOId, allSalesOrders]); // Tambahkan allSalesOrders sebagai dependency

  const fetchItems = async (soId) => {
    setLoading(true);
    try {
      const res = await api.get(`/sales-order-items/${soId}/items`);
      console.log("Data Items dari Server:", res.data);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error Fetch Items:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };


  const cancelEdit = () => {
    setEditId(null);
    setForm({ item_id: "", quantity: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSOId) return Swal.fire("Peringatan", "Pilih Sales Order dulu", "warning");

    setLoading(true);
    try {
      const payload = {
        item_id: parseInt(form.item_id),
        quantity: parseFloat(form.quantity),

        sales_order_id: parseInt(selectedSOId)
      };

      if (editId) {
        await api.put(`/sales-order-items/${editId}`, payload);
        Swal.fire("Updated", "Item berhasil diupdate", "success");
      } else {
        await api.post("/sales-order-items", payload);
        Swal.fire("Saved", "Item berhasil ditambah", "success");
      }
      cancelEdit();
      fetchItems(selectedSOId);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Gagal menyimpan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!"
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/sales-order-items/${id}`);
        fetchItems(selectedSOId);
        Swal.fire("Deleted", "Item telah dihapus", "success");
      } catch (err) {
        Swal.fire("Error", "Gagal menghapus", "error");
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-300 w-full max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-5 pb-2 border-b border-gray-200">
        Items for {soNumber || "Selected Order"}
      </h1>

      {/* Filter/Dropdown SO */}
      <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
        <label className="block mb-2 font-bold text-xs uppercase text-gray-600">Pilih Sales Order:</label>
        <select
          className="w-full md:w-1/2 p-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:border-blue-500"
          value={selectedSOId}
          onChange={(e) => setSelectedSOId(e.target.value)}
        >
          <option value="">-- Choose Sales Order --</option>
          {allSalesOrders.map((so) => (
            <option key={so.id} value={so.id}>
              {so.so_number} - {so.customer_name}
            </option>
          ))}
        </select>
      </div>

      {/* Form Tambah/Edit Item */}
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Item</label>
          <select
            className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:border-blue-500"
            value={form.item_id}
            onChange={(e) => setForm({ ...form, item_id: e.target.value })}
            required
          >
            <option value="">-- Choose Item --</option>
            {allItems.map((i) => (
              <option key={i.id} value={i.id}>
                {i.item_code} - {i.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Quantity</label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            required
            min="1"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 p-2 rounded text-sm font-bold text-white transition-colors ${editId ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "..." : editId ? "UPDATE" : "ADD"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-3 p-2 bg-gray-400 text-white text-sm rounded font-bold hover:bg-gray-500"
            >
              X
            </button>
          )}
        </div>
      </form>

      {/* Tabel Standar */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr className="text-left uppercase text-xs font-bold text-gray-600">
              <th className="border border-gray-200 p-3 w-40">Item Code</th>
              <th className="border border-gray-200 p-3">Description</th>
              <th className="border border-gray-200 p-3 w-24 text-center">Qty</th>
              <th className="border border-gray-200 p-3 w-32 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((i) => (
                <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border border-gray-200 p-3 font-mono font-bold text-blue-700">{i.item_code}</td>
                  <td className="border border-gray-200 p-3 text-gray-700">{i.description}</td>
                  <td className="border border-gray-200 p-3 text-center font-bold">{i.quantity}</td>
                  <td className="border border-gray-200 p-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          setEditId(i.id);
                          setForm({ item_id: i.item_id, quantity: i.quantity });
                        }}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleDelete(i.id)}
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
                  {selectedSOId ? (loading ? "Memuat data..." : "Belum ada item di SO ini.") : "Silakan pilih Sales Order terlebih dahulu."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}