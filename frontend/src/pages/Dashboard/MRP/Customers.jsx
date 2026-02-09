import { useState, useEffect } from "react";
import api from "../../../api/api"; // pastikan api.js punya baseURL http://localhost:5000
import Swal from "sweetalert2";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ customer_code: "", customer_name: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  /* ================= FETCH ================= */
  const fetchCustomers = async (keyword = "") => {
    try {
      setLoading(true);
      const res = await api.get(`/customers?search=${keyword}`);
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
      Swal.fire("Error", "Gagal mengambil data customers", "error");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  /* ================= ADD / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_code || !form.customer_name) {
      return Swal.fire("Error", "Customer code dan name wajib diisi", "warning");
    }

    try {
      setLoading(true);
      if (editId) {
        await api.put(`/customers/${editId}`, form);
        Swal.fire("Berhasil", "Customer berhasil diupdate", "success");
      } else {
        await api.post("/customers", form);
        Swal.fire("Berhasil", "Customer berhasil ditambahkan", "success");
      }
      setForm({ customer_code: "", customer_name: "" });
      setEditId(null);
      fetchCustomers();
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      Swal.fire("Gagal", err.response?.data?.error || "Gagal menyimpan customer", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (customer) => {
    setForm({ customer_code: customer.customer_code, customer_name: customer.customer_name });
    setEditId(customer.id);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus customer?",
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
      await api.delete(`/customers/${id}`);
      Swal.fire("Berhasil", "Customer berhasil dihapus", "success");
      fetchCustomers();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      Swal.fire("Gagal", err.response?.data?.error || "Gagal menghapus customer", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-300 w-full max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-5 pb-2 border-b border-gray-200">Data Customer</h1>

      {/* Form Sederhana */}
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          type="text"
          className="border border-gray-300 p-2 rounded text-sm w-40 focus:outline-none focus:border-blue-500"
          placeholder="Kode Customer"
          value={form.customer_code}
          onChange={(e) => setForm({ ...form, customer_code: e.target.value })}
        />
        <input
          type="text"
          className="border border-gray-300 p-2 rounded flex-1 text-sm focus:outline-none focus:border-blue-500"
          placeholder="Nama Lengkap Customer"
          value={form.customer_name}
          onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
        />
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
              <th className="border border-gray-200 p-3 w-40">Kode</th>
              <th className="border border-gray-200 p-3">Nama Customer</th>
              <th className="border border-gray-200 p-3 w-32 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-3 text-gray-500">{c.id}</td>
                  <td className="border border-gray-200 p-3 font-mono">{c.customer_code}</td>
                  <td className="border border-gray-200 p-3">{c.customer_name}</td>
                  <td className="border border-gray-200 p-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(c)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Edit
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleDelete(c.id)}
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
                  {loading ? "Memuat data..." : "Belum ada data customer."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
