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
    <div className="p-6 bg-white rounded-lg border border-gray-300 w-full max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-5 pb-2 border-b border-gray-200">Sales Orders</h1>

      {/* Form Sederhana */}
      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Nomor SO"
          value={form.so_number}
          onChange={e => setForm({ ...form, so_number: e.target.value })}
          required
          className="border border-gray-300 p-2 rounded text-sm focus:outline-none focus:border-blue-500 w-40"
        />

        <input
          type="date"
          value={form.so_date}
          onChange={e => setForm({ ...form, so_date: e.target.value })}
          required
          className="border border-gray-300 p-2 rounded text-sm focus:outline-none focus:border-blue-500 bg-white"
        />

        <select
          value={form.customer_id}
          onChange={e => setForm({ ...form, customer_id: e.target.value })}
          required
          className="border border-gray-300 p-2 rounded text-sm bg-white focus:outline-none focus:border-blue-500 flex-1 min-w-[150px]"
        >
          <option value="">-- Pilih Customer --</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
        </select>

        <input
          type="date"
          title="Delivery Date"
          value={form.delivery_date}
          onChange={e => setForm({ ...form, delivery_date: e.target.value })}
          className="border border-gray-300 p-2 rounded text-sm focus:outline-none focus:border-blue-500 bg-white"
        />

        <select
          value={form.status}
          onChange={e => setForm({ ...form, status: e.target.value })}
          className="border border-gray-300 p-2 rounded text-sm bg-white focus:outline-none focus:border-blue-500 w-28"
        >
          <option value="OPEN">OPEN</option>
          <option value="CLOSED">CLOSED</option>
        </select>

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
              <th className="border border-gray-200 p-3 w-40">Nomor SO</th>
              <th className="border border-gray-200 p-3 w-32">Tgl SO</th>
              <th className="border border-gray-200 p-3">Customer</th>
              <th className="border border-gray-200 p-3 w-32">Tgl Kirim</th>
              <th className="border border-gray-200 p-3 w-24 text-center">Status</th>
              <th className="border border-gray-200 p-3 w-32 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {salesOrders.length > 0 ? (
              salesOrders.map(so => (
                <tr key={so.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-3 text-gray-500">{so.id}</td>
                  <td className="border border-gray-200 p-3 font-mono font-bold">{so.so_number}</td>
                  <td className="border border-gray-200 p-3">{so.so_date}</td>
                  <td className="border border-gray-200 p-3 font-medium uppercase">{so.customer_name}</td>
                  <td className="border border-gray-200 p-3">{so.delivery_date || "-"}</td>
                  <td className="border border-gray-200 p-3 text-center">
                    <span className={`font-bold text-[10px] ${so.status === 'OPEN' ? 'text-green-600' : 'text-gray-400'}`}>
                      {so.status}
                    </span>
                  </td>
                  <td className="border border-gray-200 p-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(so)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleDelete(so.id)}
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
                  {loading ? "Memuat data..." : "Belum ada Sales Order."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
