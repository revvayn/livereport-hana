import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";

export default function SalesOrders() {
  const [salesOrders, setSalesOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ so_number: "", so_date: "", customer_id: "", delivery_date: "", status: "OPEN" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch sales orders
  const fetchSalesOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/sales-orders");
      setSalesOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal fetch sales orders", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers for dropdown
  const fetchCustomers = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSalesOrders();
    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.so_number || !form.so_date || !form.customer_id) {
      return Swal.fire("Error", "SO Number, SO Date, dan Customer wajib diisi", "warning");
    }

    try {
      setLoading(true);
      if (editId) {
        await api.put(`sales/sales-orders/${editId}`, form);
        Swal.fire("Berhasil", "Sales order diupdate", "success");
      } else {
        await api.post("/sales-orders", form);
        Swal.fire("Berhasil", "Sales order ditambahkan", "success");
      }
      setForm({ so_number: "", so_date: "", customer_id: "", delivery_date: "", status: "OPEN" });
      setEditId(null);
      fetchSalesOrders();
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", err.response?.data?.error || "Gagal menyimpan sales order", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (so) => {
    setForm({
      so_number: so.so_number,
      so_date: so.so_date,
      customer_id: so.customer_id,
      delivery_date: so.delivery_date,
      status: so.status,
    });
    setEditId(so.id);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus sales order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
    });
    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      await api.delete(`/sales-orders/${id}`);
      Swal.fire("Berhasil", "Sales order dihapus", "success");
      fetchSalesOrders();
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", err.response?.data?.error || "Gagal hapus sales order", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow w-full max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Sales Orders</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap gap-2">
        <input type="text" placeholder="SO Number" value={form.so_number} onChange={e => setForm({...form, so_number: e.target.value})} required className="border p-2 rounded"/>
        <input type="date" placeholder="SO Date" value={form.so_date} onChange={e => setForm({...form, so_date: e.target.value})} required className="border p-2 rounded"/>
        <select value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})} required className="border p-2 rounded">
          <option value="">-- Pilih Customer --</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
        </select>
        <input type="date" placeholder="Delivery Date" value={form.delivery_date} onChange={e => setForm({...form, delivery_date: e.target.value})} className="border p-2 rounded"/>
        <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="border p-2 rounded">
          <option value="OPEN">OPEN</option>
          <option value="CLOSED">CLOSED</option>
        </select>
        <button type="submit" className={`px-4 rounded text-white ${editId ? "bg-yellow-500" : "bg-blue-600"}`} disabled={loading}>
          {loading ? "Menyimpan..." : editId ? "Update" : "Add"}
        </button>
      </form>

      {/* Table */}
      <table className="w-full border-collapse border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">SO Number</th>
            <th className="border p-2">SO Date</th>
            <th className="border p-2">Customer</th>
            <th className="border p-2">Delivery Date</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {salesOrders.length ? salesOrders.map(so => (
            <tr key={so.id}>
              <td className="border p-2">{so.id}</td>
              <td className="border p-2">{so.so_number}</td>
              <td className="border p-2">{so.so_date}</td>
              <td className="border p-2">{so.customer_name}</td>
              <td className="border p-2">{so.delivery_date}</td>
              <td className="border p-2">{so.status}</td>
              <td className="border p-2 flex gap-2">
                <button onClick={() => handleEdit(so)} className="bg-yellow-400 px-2 rounded">Edit</button>
                <button onClick={() => handleDelete(so.id)} className="bg-red-500 text-white px-2 rounded">Delete</button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="7" className="text-center p-4 text-gray-500">{loading ? "Loading..." : "No sales orders found"}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
