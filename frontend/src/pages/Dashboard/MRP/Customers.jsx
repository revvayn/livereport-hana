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
    <div className="p-6 bg-white rounded-xl shadow w-full max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Customers</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-6 flex gap-3">
        <input
          type="text"
          className="border p-2 rounded flex-1"
          placeholder="Customer Code"
          value={form.customer_code}
          onChange={(e) => setForm({ ...form, customer_code: e.target.value })}
        />
        <input
          type="text"
          className="border p-2 rounded flex-1"
          placeholder="Customer Name"
          value={form.customer_name}
          onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
        />
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
            <th className="border p-2">Name</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.length ? (
            customers.map((c) => (
              <tr key={c.id}>
                <td className="border p-2">{c.id}</td>
                <td className="border p-2">{c.customer_code}</td>
                <td className="border p-2">{c.customer_name}</td>
                <td className="border p-2 flex gap-2">
                  <button onClick={() => handleEdit(c)} className="bg-yellow-400 px-2 rounded">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="bg-red-500 text-white px-2 rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center p-4 text-gray-500">
                {loading ? "Loading..." : "No customers found"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
