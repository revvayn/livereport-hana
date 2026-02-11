import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";

export default function SalesOrderItems() {
  const [selectedSOId, setSelectedSOId] = useState("");
  const [soNumber, setSoNumber] = useState("");
  const [allSalesOrders, setAllSalesOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    item_id: "",
    quantity: "",
    pcs: "",
    ratio: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSO, resItems] = await Promise.all([
          api.get("/sales-orders"),
          api.get("/sales-order-items/master-items")
        ]);
        setAllSalesOrders(resSO.data || []);
        setAllItems(resItems.data || []);
      } catch (err) {
        Swal.fire("Error", "Gagal load data master", "error");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSOId) {
      fetchItems(selectedSOId);
      const so = allSalesOrders.find(x => Number(x.id) === Number(selectedSOId));
      setSoNumber(so?.so_number || "");
    }
    cancelEdit();
  }, [selectedSOId]);

  const fetchItems = async (soId) => {
    const res = await api.get(`/sales-order-items/${soId}/items`);
    setItems(res.data || []);
  };

  const handleFormChange = (name, value) => {
    let nextForm = { ...form, [name]: value };

    if (name === "item_id") {
      const master = allItems.find(i => Number(i.id) === Number(value));
      // ratio_bom di sini sudah hasil (qty / pcs) dari SQL
      nextForm.ratio = master ? parseFloat(master.ratio_bom) : 0;
    }

    const p = name === "pcs" ? value : nextForm.pcs;
    const r = nextForm.ratio;

    if (p && r) {
      // Hasil Qty SO = Pcs Input * Ratio BOM
      const rawQty = parseFloat(p) * r;
      nextForm.quantity = parseFloat(rawQty.toFixed(6));
    } else {
      nextForm.quantity = "";
    }
    setForm(nextForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        item_id: parseInt(form.item_id),
        quantity: parseFloat(form.quantity),
        pcs: parseInt(form.pcs) || 0,
        sales_order_id: parseInt(selectedSOId)
      };

      if (editId) await api.put(`/sales-order-items/${editId}`, payload);
      else await api.post("/sales-order-items", payload);

      Swal.fire("Berhasil", "Data tersimpan", "success");
      cancelEdit();
      fetchItems(selectedSOId);
    } catch (err) {
      Swal.fire("Error", "Gagal simpan", "error");
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ item_id: "", quantity: "", pcs: "", ratio: 0 });
  };

  return (
    <div className="p-6 bg-white border rounded-lg max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4 border-b pb-2">Items for {soNumber || "..."}</h1>

      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-500 mb-1">Pilih Sales Order</label>
        <select
          className="w-full md:w-1/2 p-2 border border-gray-300 rounded text-sm bg-white"
          value={selectedSOId}
          onChange={(e) => setSelectedSOId(e.target.value)}
        >
          <option value="">-- Pilih Sales Order --</option>
          {allSalesOrders.map((so) => (
            <option key={so.id} value={so.id}>
              {so.so_number} - {so.customer_name} {/* Menambahkan Nama Customer */}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6 items-end bg-gray-50 p-4 rounded">
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold uppercase">Item</label>
          <select
            className="w-full p-2 border rounded bg-white text-sm"
            value={form.item_id}
            onChange={(e) => handleFormChange("item_id", e.target.value)}
            required
          >
            <option value="">-- Choose Item --</option>
            {allItems.map(i => <option key={i.id} value={i.id}>{i.item_code} - {i.description}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase">Pcs</label>
          <input type="number" className="w-full p-2 border rounded text-sm" value={form.pcs} onChange={(e) => handleFormChange("pcs", e.target.value)} required />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-gray-400">Total Qty (m3)</label>
          <input type="number" className="w-full p-2 border rounded text-sm bg-gray-100" value={form.quantity} readOnly />
        </div>
        <button className={`p-2 rounded font-bold text-white text-sm ${editId ? 'bg-orange-500' : 'bg-blue-600'}`}>
          {editId ? 'UPDATE' : 'ADD'}
        </button>
      </form>

      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="border p-2">Item Code</th>
            <th className="border p-2">Description</th>
            <th className="border p-2 text-center">Pcs</th>
            <th className="border p-2 text-center">Qty (m3)</th>
            <th className="border p-2 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map(i => (
            <tr key={i.id} className="hover:bg-gray-50">
              <td className="border p-2 font-bold">{i.item_code}</td>
              <td className="border p-2">{i.description}</td>
              <td className="border p-2 text-center">{i.pcs}</td>
              <td className="border p-2 text-center font-bold">
                {new Intl.NumberFormat('id-ID', {
                  minimumFractionDigits: 4,
                  maximumFractionDigits: 4
                }).format(i.quantity)}
              </td>
              <td className="border p-2 text-center">
                <button onClick={() => {
                  setEditId(i.id);
                  const m = allItems.find(x => Number(x.id) === Number(i.item_id));
                  setForm({ item_id: i.item_id, pcs: i.pcs, quantity: i.quantity, ratio: m?.ratio_bom || 0 });
                }} className="text-blue-600 mr-2">Edit</button>
                <button onClick={() => handleDelete(i.id)} className="text-red-600">Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}