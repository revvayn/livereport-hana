import { useEffect, useState } from "react";
import api from "../../../api/api"; 
import Swal from "sweetalert2";

export default function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // State untuk form (Tambah/Edit)
  const [formData, setFormData] = useState({
    user_id: null,
    username: "",
    password: "",
    email: "",
    nama_lengkap: "",
    role: "admin"
  });

  // 1. Load Data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Menggunakan instance api, cukup path-nya saja
      const res = await api.get("/user");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal memuat data user", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Reset & Open Modal
  const openModal = (user = null) => {
    if (user) {
      // Saat edit, password dikosongkan (opsional di backend)
      setFormData({ 
        ...user, 
        password: "" 
      }); 
    } else {
      setFormData({ 
        user_id: null, 
        username: "", 
        password: "", 
        email: "", 
        nama_lengkap: "", 
        role: "admin" 
      });
    }
    setShowModal(true);
  };

  // 4. Save Data (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.user_id) {
        // Update data user
        await api.put(`/user/${formData.user_id}`, formData);
        Swal.fire({ icon: "success", title: "Berhasil", text: "User diperbarui", timer: 1500, showConfirmButton: false });
      } else {
        // Tambah user baru
        await api.post("/user", formData);
        Swal.fire({ icon: "success", title: "Berhasil", text: "User berhasil dibuat", timer: 1500, showConfirmButton: false });
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.error || "Terjadi kesalahan sistem";
      Swal.fire("Error", msg, "error");
    }
  };

  // 5. Delete Data
  const handleDelete = (id) => {
    Swal.fire({
      title: "Hapus User?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // Tailwind red-500
      cancelButtonColor: "#6b7280", // Tailwind gray-500
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/user/${id}`);
          Swal.fire("Terhapus!", "User telah dihapus.", "success");
          fetchUsers();
        } catch (err) {
          Swal.fire("Error", "Gagal menghapus user", "error");
        }
      }
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen User</h1>
          <p className="text-sm text-gray-500">Kelola hak akses dan profil pengguna sistem.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-semibold transition-all flex items-center gap-2"
        >
          <span>+</span> Tambah User
        </button>
      </div>

      {/* Tabel User */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Username</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Nama Lengkap</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Email</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Role</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="p-10 text-center text-gray-400">Memproses data...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" className="p-10 text-center text-gray-400">Tidak ada data user.</td></tr>
            ) : users.map((u) => (
              <tr key={u.user_id} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-4 text-sm font-bold text-gray-700">{u.username}</td>
                <td className="p-4 text-sm text-gray-600">{u.nama_lengkap}</td>
                <td className="p-4 text-sm text-gray-600">{u.email || "-"}</td>
                <td className="p-4 text-sm">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow-sm ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-sm text-center">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => openModal(u)} className="text-blue-600 hover:text-blue-800 font-bold transition-colors">Edit</button>
                    <button onClick={() => handleDelete(u.user_id)} className="text-red-500 hover:text-red-700 font-bold transition-colors">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800">{formData.user_id ? "Edit User" : "Tambah User Baru"}</h2>
              <p className="text-xs text-gray-500 mt-1">Lengkapi informasi kredensial user di bawah ini.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Username</label>
                  <input name="username" value={formData.username} onChange={handleChange} className="w-full border border-gray-200 p-2.5 rounded-lg mt-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" required placeholder="Contoh: admin_produksi" />
                </div>
                
                {/* Password hanya wajib diisi saat tambah user baru */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Password {formData.user_id && <span className="text-blue-500 italic">(Kosongkan jika tidak ganti)</span>}
                  </label>
                  <input name="password" type="password" value={formData.password} onChange={handleChange} className="w-full border border-gray-200 p-2.5 rounded-lg mt-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" required={!formData.user_id} placeholder="••••••••" />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Nama Lengkap</label>
                  <input name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} className="w-full border border-gray-200 p-2.5 rounded-lg mt-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" required placeholder="Nama asli user" />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Email</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-200 p-2.5 rounded-lg mt-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="user@company.com" />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Role Akses</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="w-full border border-gray-200 p-2.5 rounded-lg mt-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white">
                    <option value="admin">Admin</option>
                    <option value="user">Repoter</option>
                    <option value="manager">Planner</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">Batal</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all">
                  {formData.user_id ? "Simpan Perubahan" : "Buat User Sekarang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}