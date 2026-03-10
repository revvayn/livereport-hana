import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";

export default function SalesOrders() {
  const [salesOrders, setSalesOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ so_number: "", so_date: "", customer_id: "", delivery_date: "", status: "OPEN" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH DATA ================= */
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

  /* ================= HANDLERS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.so_number || !form.so_date || !form.customer_id) {
      return Swal.fire("Error", "SO Number, SO Date, dan Customer wajib diisi", "warning");
    }
  
    try {
      setLoading(true);
      if (editId) {
        // PERBAIKAN: Sesuaikan URL agar sama dengan struktur fetch/post
        await api.put(`/sales-orders/${editId}`, form); 
        Swal.fire("Berhasil", "Sales order diupdate", "success");
      } else {
        await api.post("/sales-orders", form);
        Swal.fire("Berhasil", "Sales order ditambahkan", "success");
      }
      resetForm();
      fetchSalesOrders();
    } catch (err) {
      console.error(err);
      // Tips: Tambahkan logging detail untuk melihat pesan error asli dari server
      console.log("Error Response Data:", err.response?.data);
      Swal.fire("Gagal", err.response?.data?.error || "Gagal menyimpan sales order", "error");
    } finally {
      setLoading(false);
    }
  };

  // Perbaikan: Fungsi edit mengonversi format tanggal agar terbaca input date (YYYY-MM-DD)
  const handleEdit = (so) => {
    // Fungsi pembantu untuk memastikan format YYYY-MM-DD
    const formatForInputDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      // Mengambil tahun, bulan (ditambah 1 karena 0-indexed), dan hari
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setForm({
      so_number: so.so_number,
      so_date: formatForInputDate(so.so_date), // Pastikan format YYYY-MM-DD
      customer_id: so.customer_id,
      delivery_date: formatForInputDate(so.delivery_date), // Pastikan format YYYY-MM-DD
      status: so.status,
    });
    setEditId(so.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm({ so_number: "", so_date: "", customer_id: "", delivery_date: "", status: "OPEN" });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus sales order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonColor: "#6b7280",
      confirmButtonColor: "#dc2626",
    });
    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      await api.delete(`/sales-orders/${id}`);
      Swal.fire("Berhasil", "Sales order dihapus", "success");
      fetchSalesOrders();
    } catch (err) {
      Swal.fire("Gagal", "Gagal hapus data", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 pb-2 border-b">
          <h1 className="text-xl font-bold text-gray-800">Sales Orders</h1>
          {editId && (
            <button onClick={resetForm} className="text-xs font-bold text-red-500 hover:underline">
              BATAL EDIT
            </button>
          )}
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nomor SO</label>
            <input
              type="text"
              value={form.so_number}
              onChange={e => setForm({ ...form, so_number: e.target.value })}
              required
              className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tgl SO</label>
            <input
              type="date"
              value={form.so_date}
              onChange={e => setForm({ ...form, so_date: e.target.value })}
              required
              className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Customer</label>
            <select
              value={form.customer_id}
              onChange={e => setForm({ ...form, customer_id: e.target.value })}
              required
              className="w-full border border-gray-300 p-2 rounded text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tgl Kirim</label>
            <input
              type="date"
              value={form.delivery_date}
              onChange={e => setForm({ ...form, delivery_date: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Status</label>
            <select
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="OPEN">OPEN</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-sm font-bold text-white shadow-sm transition-all ${editId ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "..." : editId ? "UPDATE" : "SIMPAN"}
          </button>
        </form>

        {/* Table Section */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr className="text-left uppercase text-[10px] font-black tracking-wider">
                <th className="p-3 border-b">ID</th>
                <th className="p-3 border-b">Nomor SO</th>
                <th className="p-3 border-b">Tgl SO</th>
                <th className="p-3 border-b">Customer</th>
                <th className="p-3 border-b">Tgl Kirim</th>
                <th className="p-3 border-b text-center">Status</th>
                <th className="p-3 border-b text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {salesOrders.length > 0 ? (
                salesOrders.map(so => (
                  <tr key={so.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3 text-gray-400">{so.id}</td>
                    <td className="p-3 font-mono font-bold text-blue-700">{so.so_number}</td>
                    <td className="p-3 text-gray-600">
                      {new Date(so.so_date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-3 font-medium uppercase text-gray-700">{so.customer_name}</td>
                    <td className="p-3 text-gray-600">
                      {so.delivery_date ? new Date(so.delivery_date).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-[9px] font-black ${so.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {so.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-3 justify-center">
                        <button onClick={() => handleEdit(so)} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(so.id)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-12 text-gray-400 italic">
                    {loading ? "Memuat data..." : "Belum ada Sales Order."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}