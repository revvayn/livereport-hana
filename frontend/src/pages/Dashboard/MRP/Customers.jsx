import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";
import { UserPlus, Search, Edit2, Trash2, Users, Loader2, FileUp, PlusCircle, X } from "lucide-react";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ customer_code: "", customer_name: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchCustomers = async (keyword = "") => {
    try {
      setLoading(true);
      const res = await api.get(`/customers?search=${keyword}`);
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Swal.fire("Error", "Gagal mengambil data", "error");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await api.post("/customers/import-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      Swal.fire("Berhasil", "Data customer berhasil diimport", "success");
      fetchCustomers();
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.error || "Gagal import file", "error");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers(search);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_code || !form.customer_name) {
      return Swal.fire("Peringatan", "Semua field wajib diisi", "warning");
    }

    try {
      setLoading(true);
      if (editId) {
        await api.put(`/customers/${editId}`, form);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data diperbarui', timer: 1500, showConfirmButton: false });
      } else {
        await api.post("/customers", form);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data ditambahkan', timer: 1500, showConfirmButton: false });
      }
      setForm({ customer_code: "", customer_name: "" });
      setEditId(null);
      fetchCustomers();
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.error || "Gagal menyimpan data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setForm({ customer_code: customer.customer_code, customer_name: customer.customer_name });
    setEditId(customer.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Data?",
      text: "Data yang dihapus tidak dapat dikembalikan",
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
        await api.delete(`/customers/${id}`);
        fetchCustomers();
        Swal.fire("Terhapus", "Data berhasil dihapus", "success");
      } catch (err) {
        Swal.fire("Gagal", "Tidak dapat menghapus data", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Section Modern */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-lg text-white shadow-lg shadow-slate-200">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Data Customer</h1>
              <p className="text-sm text-slate-500">Kelola informasi pelanggan dalam sistem</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Tombol Upload Emerald */}
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold cursor-pointer transition-all shadow-sm active:scale-95 whitespace-nowrap">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <PlusCircle size={18} />}
              <span>Upload Excel</span>
              <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleImportExcel}
              />
            </label>

            {/* Search Input dengan Group Focus */}
            <div className="relative group flex-1 sm:flex-none">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari nama pelanggan..."
                className="pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100 transition-all w-full md:w-64 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <UserPlus size={16} className={editId ? "text-amber-500" : "text-slate-400"} />
            {editId ? "Mode Edit: Update Informasi" : "Tambah Customer Baru"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-sm font-mono"
              placeholder="Kode (Cth: CUST001)"
              value={form.customer_code}
              onChange={(e) => setForm({ ...form, customer_code: e.target.value })}
            />
            <input
              type="text"
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 focus:bg-white transition-all text-sm"
              placeholder="Nama Lengkap Customer"
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            />
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-md active:scale-95 ${
                editId ? "bg-amber-600 hover:bg-amber-700" : "bg-slate-900 hover:bg-slate-800"
              } disabled:opacity-50`}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : editId ? "UPDATE DATA" : "SIMPAN CUSTOMER"}
            </button>
          </form>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kode Pelanggan</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.length > 0 ? (
                  customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-mono font-bold border border-slate-200">
                          {c.customer_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700 uppercase">{c.customer_name}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-400 italic text-sm">
                      {loading ? "Memproses data..." : "Data customer tidak tersedia."}
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