import { useEffect, useState } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";
import { Plus, Edit2, Trash2, Search, ShieldCheck, Mail, X, User as UserIcon } from "lucide-react";

export default function User() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State pencarian

  const [formData, setFormData] = useState({
    user_id: null,
    username: "",
    password: "",
    email: "",
    nama_lengkap: "",
    role: "Admin"
  });

  // 1. Load Data
  const fetchUsers = async () => {
    try {
      setLoading(true);
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

  // 2. Logic Pencarian (Filtering)
  const filteredUsers = users.filter((u) => {
    const search = searchTerm.toLowerCase();
    return (
      u.username.toLowerCase().includes(search) ||
      u.nama_lengkap.toLowerCase().includes(search) ||
      (u.email && u.email.toLowerCase().includes(search))
    );
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (user = null) => {
    if (user) {
      setFormData({
        user_id: user.user_id,
        username: user.username,
        password: "", // Kosongkan saat edit untuk keamanan
        email: user.email || "",
        nama_lengkap: user.nama_lengkap,
        role: user.role
      });
    } else {
      setFormData({
        user_id: null,
        username: "",
        password: "",
        email: "",
        nama_lengkap: "",
        role: "Admin"
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.user_id) {
        await api.put(`/user/${formData.user_id}`, formData);
        Swal.fire({ icon: "success", title: "Berhasil", text: "User diperbarui", timer: 1500, showConfirmButton: false });
      } else {
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

  const handleDelete = (id) => {
    Swal.fire({
      title: "Hapus User?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
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
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans text-slate-900">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Manajemen User</h1>
          <p className="text-slate-500 mt-1">Kelola hak akses, perbarui profil, dan kontrol keamanan sistem.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="group bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all duration-200 flex items-center gap-2 active:scale-95"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          <span className="font-semibold text-sm">Tambah User Baru</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Search Bar Fungsional */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama, username, atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm shadow-sm"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                <th className="p-5">Identitas User</th>
                <th className="p-5">Kontak</th>
                <th className="p-5">Role Akses</th>
                <th className="p-5 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="4" className="p-20 text-center text-slate-400 animate-pulse font-medium">Menyiapkan data...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="4" className="p-20 text-center text-slate-400 font-medium font-bold italic">User tidak ditemukan.</td></tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.user_id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                        {u.nama_lengkap ? u.nama_lengkap.charAt(0).toUpperCase() : "?"}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{u.username}</div>
                        <div className="text-xs text-slate-500">{u.nama_lengkap}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      {u.email || "-"}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        u.role?.toLowerCase() === 'admin'
                        ? 'bg-purple-50 text-purple-600 ring-1 ring-purple-200'
                        : u.role === 'Planner'
                          ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'
                          : 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
                      }`}>
                      <ShieldCheck size={12} />
                      {u.role}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(u)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(u.user_id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-50 relative">
              <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600"><X size={20} /></button>
              <h2 className="text-2xl font-bold text-slate-800">{formData.user_id ? "Perbarui Profil" : "User Baru"}</h2>
              <p className="text-sm text-slate-500 mt-1 italic">Tentukan akses dan identitas pengguna sistem.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Username</label>
                    <input name="username" value={formData.username} onChange={handleChange} className="w-full bg-slate-50 border-none p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all mt-1" required placeholder="admin.it" />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Password</label>
                    <input name="password" type="password" value={formData.password} onChange={handleChange} className="w-full bg-slate-50 border-none p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all mt-1" required={!formData.user_id} placeholder="••••••••" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Nama Lengkap</label>
                  <input name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} className="w-full bg-slate-50 border-none p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all mt-1" required placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Email (Opsional)</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-50 border-none p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all mt-1" placeholder="user@company.com" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">Pilih Role</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-indigo-50/50 border-none p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all mt-1 font-semibold text-indigo-700">
                    <option value="Admin">Admin</option>
                    <option value="Reporter">Reporter</option>
                    <option value="Planner">Planner</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">
                  {formData.user_id ? "Simpan Perubahan" : "Buat User Baru"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="w-full py-2 text-sm font-semibold text-slate-400 hover:text-slate-600">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}