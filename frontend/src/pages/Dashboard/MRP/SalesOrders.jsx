import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";
import { ShoppingCart, Search, Edit2, Trash2, Loader2, PlusCircle, Calendar, User } from "lucide-react";

export default function SalesOrders() {
  const [salesOrders, setSalesOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ 
    so_number: "", 
    so_date: "", 
    customer_id: "", 
    delivery_date: "", 
    status: "OPEN" 
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resSO, resCust] = await Promise.all([
        api.get("/sales-orders"),
        api.get("/customers")
      ]);
      setSalesOrders(Array.isArray(resSO.data) ? resSO.data : []);
      setCustomers(Array.isArray(resCust.data) ? resCust.data : []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal mengambil data transaksi", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= HANDLERS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.so_number || !form.so_date || !form.customer_id) {
      return Swal.fire("Peringatan", "Nomor SO, Tanggal, dan Customer wajib diisi", "warning");
    }
  
    try {
      setLoading(true);
      if (editId) {
        await api.put(`/sales-orders/${editId}`, form); 
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Sales Order diperbarui', timer: 1500, showConfirmButton: false });
      } else {
        await api.post("/sales-orders", form);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Sales Order dibuat', timer: 1500, showConfirmButton: false });
      }
      resetForm();
      fetchData();
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.error || "Gagal menyimpan data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (so) => {
    const formatForInputDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setForm({
      so_number: so.so_number,
      so_date: formatForInputDate(so.so_date),
      customer_id: so.customer_id,
      delivery_date: formatForInputDate(so.delivery_date),
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
      title: "Hapus Sales Order?",
      text: "Data pesanan ini akan dihapus permanen",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        await api.delete(`/sales-orders/${id}`);
        fetchData();
        Swal.fire("Terhapus", "Data berhasil dihapus", "success");
      } catch (err) {
        Swal.fire("Gagal", "Gagal menghapus data", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter SO berdasarkan nomor
  const filteredSO = salesOrders.filter(so => 
    so.so_number.toLowerCase().includes(search.toLowerCase()) ||
    so.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-lg text-white">
              <ShoppingCart size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Orders</h1>
              <p className="text-sm text-slate-500">Manajemen pesanan pelanggan dan jadwal pengiriman</p>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Cari nomor SO atau customer..."
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 transition-all w-full md:w-80"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <PlusCircle size={16} />
            {editId ? "Update Informasi Pesanan" : "Input Sales Order Baru"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nomor SO</label>
              <input
                type="text"
                placeholder="SO-2024-001"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 transition-all text-sm font-mono font-bold"
                value={form.so_number}
                onChange={e => setForm({ ...form, so_number: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Tanggal SO</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 transition-all text-sm"
                value={form.so_date}
                onChange={e => setForm({ ...form, so_date: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Customer</label>
              <select
                value={form.customer_id}
                onChange={e => setForm({ ...form, customer_id: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 transition-all text-sm"
              >
                <option value="">-- Pilih Customer --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Estimasi Kirim</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 transition-all text-sm"
                value={form.delivery_date}
                onChange={e => setForm({ ...form, delivery_date: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Status SO</label>
              <div className="flex gap-2">
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 transition-all text-sm font-bold"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-white transition-all ${
                    editId ? "bg-amber-600 hover:bg-amber-700" : "bg-slate-900 hover:bg-slate-800"
                  }`}
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : editId ? <Edit2 size={18} /> : <PlusCircle size={18} />}
                </button>
              </div>
            </div>
          </form>
          {editId && (
            <div className="mt-2 flex justify-end">
              <button onClick={resetForm} className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-tighter">
                Batal Edit
              </button>
            </div>
          )}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nomor SO</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Info Tanggal</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSO.length > 0 ? (
                  filteredSO.map((so) => (
                    <tr key={so.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-sm text-slate-400 font-medium">#{so.id}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                          {so.so_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400" />
                          <span className="text-sm font-semibold text-slate-700 uppercase">{so.customer_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                          <Calendar size={12} />
                          Order: {new Date(so.so_date).toLocaleDateString("id-ID")}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-emerald-600 font-bold">
                          <Calendar size={12} />
                          Kirim: {so.delivery_date ? new Date(so.delivery_date).toLocaleDateString("id-ID") : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest ${
                          so.status === 'OPEN' 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {so.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={() => handleEdit(so)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(so.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic text-sm">
                      {loading ? "Menghubungkan ke server..." : "Data Sales Order tidak ditemukan."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}