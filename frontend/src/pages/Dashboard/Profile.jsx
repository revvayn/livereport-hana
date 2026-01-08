import { useEffect, useState } from "react";
import api from "../../api/api";
import Swal from "sweetalert2";

function VerifikatorProfile() {
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        nama_lengkap: "",
        email: ""
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/auth/me");
                if (res.data.success) {
                    setProfile(res.data.user);
                    setForm({
                        nama_lengkap: res.data.user.nama_lengkap,
                        email: res.data.user.email || ""
                    });
                }
            } catch {
                Swal.fire("Error", "Gagal mengambil profil", "error");
            }
        };
        fetchProfile();
    }, []);

    const handleUpdate = async () => {
        try {
            const res = await api.put("/auth/update", form);
            if (res.data.success) {
                setProfile(res.data.user);
                setEditMode(false);
                Swal.fire("Sukses", res.data.message, "success");
            }
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || "Gagal update", "error");
        }
    };

    const handleChangePassword = async () => {
        try {
            const res = await api.put("/auth/change-password", passwordForm);
            if (res.data.success) {
                setPasswordForm({ currentPassword: "", newPassword: "" });
                Swal.fire("Sukses", res.data.message, "success");
            }
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || "Gagal ganti password", "error");
        }
    };

    if (!profile) return <div className="text-center mt-10">Loading...</div>;

    return (
        <div className="max-w-lg mx-auto mt-16 px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8">

                {/* HEADER */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow">
                        {profile.nama_lengkap?.charAt(0)}
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-gray-800">
                        Profil Pengguna
                    </h2>
                    <p className="text-sm text-gray-500">
                        Kelola informasi akun Anda
                    </p>
                </div>

                {/* PROFILE SECTION */}
                {editMode ? (
                    <div className="space-y-5">

                        {/* Nama Lengkap */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                value={form.nama_lengkap}
                                onChange={(e) =>
                                    setForm({ ...form, nama_lengkap: e.target.value })
                                }
                                className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Masukkan nama lengkap"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Masukkan email"
                            />
                        </div>

                        {/* BUTTON */}
                        <div className="flex justify-end gap-3 pt-3">
                            <button
                                onClick={() => setEditMode(false)}
                                className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 text-gray-700">

                        <div className="flex justify-between border-b pb-2">
                            <span className="text-sm text-gray-500">Nama Lengkap</span>
                            <span className="font-semibold">{profile.nama_lengkap}</span>
                        </div>

                        <div className="flex justify-between border-b pb-2">
                            <span className="text-sm text-gray-500">Username</span>
                            <span className="font-semibold">{profile.username}</span>
                        </div>

                        <div className="flex justify-between border-b pb-2">
                            <span className="text-sm text-gray-500">Email</span>
                            <span className="font-semibold">{profile.email}</span>
                        </div>

                        <button
                            onClick={() => setEditMode(true)}
                            className="w-full mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition"
                        >
                            Edit Profil
                        </button>
                    </div>
                )}

                {/* DIVIDER */}
                <div className="my-10 border-t" />

                {/* CHANGE PASSWORD */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Keamanan Akun
                    </h3>

                    <div className="space-y-4">
                        <input
                            type="password"
                            placeholder="Password Lama"
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                                setPasswordForm({
                                    ...passwordForm,
                                    currentPassword: e.target.value
                                })
                            }
                            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                        />

                        <input
                            type="password"
                            placeholder="Password Baru"
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                                setPasswordForm({
                                    ...passwordForm,
                                    newPassword: e.target.value
                                })
                            }
                            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                        />

                        <button
                            onClick={handleChangePassword}
                            className="w-full px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition"
                        >
                            Ganti Password
                        </button>
                    </div>
                </div>

            </div>
        </div>


    );
}

export default VerifikatorProfile;
