import { useEffect, useState } from "react";
import api from "../../api/api";
import Swal from "sweetalert2";
import { User, Lock, Mail, Edit3, Save, ShieldCheck, Loader2, BadgeCheck, Fingerprint, LogOut } from "lucide-react";

function VerifikatorProfile() {
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState({ nama_lengkap: "", email: "" });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/auth/me");
            if (res.data.success) {
                setProfile(res.data.user);
                setForm({ nama_lengkap: res.data.user.nama_lengkap, email: res.data.user.email || "" });
            }
        } catch {
            Swal.fire("Error", "Gagal mengambil profil", "error");
        }
    };

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            const res = await api.put("/auth/update", form);
            if (res.data.success) {
                setProfile(res.data.user);
                setEditMode(false);
                Swal.fire({ icon: 'success', title: 'Berhasil', showConfirmButton: false, timer: 1000 });
            }
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || "Gagal", "error");
        } finally { setIsSaving(false); }
    };

    if (!profile) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

    return (
        /* Gunakan h-full agar mengikuti sisa tinggi container dashboard (main content area) */
        <div className="h-full w-full bg-[#F4F7FE] p-4 flex flex-col overflow-hidden font-sans">
            
            {/* Grid Container yang dipaksa mengisi sisa ruang (min-h-0 penting untuk mencegah overflow) */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0">
                
                {/* --- LEFT COLUMN: IDENTITY --- */}
                <div className="col-span-12 lg:col-span-4 h-full flex flex-col min-h-0">
                    <div className="bg-white flex-1 rounded-[2.5rem] shadow-sm border border-white flex flex-col items-center justify-between p-6 relative overflow-hidden">
                        {/* Decorative Header */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-600 to-blue-500" />
                        
                        <div className="relative z-10 flex flex-col items-center mt-4 w-full">
                            <div className="w-24 h-24 rounded-full border-[6px] border-white bg-white shadow-xl flex items-center justify-center text-4xl font-black text-indigo-600 mb-4 transition-transform hover:scale-105">
                                {profile.nama_lengkap?.charAt(0)}
                            </div>
                            
                            <h2 className="text-xl font-black text-slate-800 text-center uppercase tracking-tight truncate w-full px-2">
                                {profile.nama_lengkap}
                            </h2>
                            <div className="mt-1 flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full">
                                <BadgeCheck size={14} className="text-indigo-600" />
                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                                    {profile.role || "PLANNER"}
                                </span>
                            </div>

                            {/* Info Tiles */}
                            <div className="mt-8 w-full space-y-3">
                                <div className="flex items-center gap-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Email Address</p>
                                        <p className="text-xs font-bold text-slate-700 truncate">{profile.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                                        <Fingerprint size={18} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Username ID</p>
                                        <p className="text-xs font-bold text-slate-700">{profile.username}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Branding Version Footer */}
                        <div className="w-full pt-4 border-t border-slate-50 flex justify-center">
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">
                                System Access v3.0
                            </span>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: ACTIONS --- */}
                <div className="col-span-12 lg:col-span-8 h-full flex flex-col min-h-0">
                    <div className="bg-white flex-1 rounded-[2.5rem] shadow-sm border border-white flex flex-col overflow-hidden">
                        
                        {/* Tab Navigation (Slimmer) */}
                        <div className="flex px-8 pt-4 border-b border-slate-50 shrink-0">
                            {[
                                { id: "profile", label: "Informasi Personal", icon: <User size={16}/> },
                                { id: "security", label: "Keamanan Akun", icon: <Lock size={16}/> }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-4 px-6 text-[11px] font-black uppercase tracking-widest transition-all relative flex items-center gap-2 ${
                                        activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    {tab.icon} {tab.label}
                                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full shadow-[0_-2px_8px_rgba(79,70,229,0.3)]" />}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content (Centered Vertically) */}
                        <div className="flex-1 p-8 flex flex-col justify-center min-h-0">
                            {activeTab === "profile" && (
                                <div className="max-w-md mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="mb-6">
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Profil Verifikator</h3>
                                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">Manajemen data personal sistem</p>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Nama Lengkap</label>
                                            <input 
                                                type="text" 
                                                value={form.nama_lengkap} 
                                                disabled={!editMode}
                                                onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
                                                className={`w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none transition-all ${editMode ? 'focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 bg-white shadow-inner' : 'opacity-60'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Email Korespondensi</label>
                                            <input 
                                                type="email" 
                                                value={form.email} 
                                                disabled={!editMode}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                className={`w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none transition-all ${editMode ? 'focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 bg-white shadow-inner' : 'opacity-60'}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 flex gap-3">
                                        {!editMode ? (
                                            <button 
                                                onClick={() => setEditMode(true)}
                                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                                            >
                                                <Edit3 size={14} /> Edit Profil
                                            </button>
                                        ) : (
                                            <>
                                                <button onClick={() => setEditMode(false)} className="px-6 py-3.5 bg-slate-100 text-slate-500 rounded-2xl text-[11px] font-black uppercase hover:bg-slate-200 transition-all">
                                                    Batal
                                                </button>
                                                <button 
                                                    onClick={handleUpdate} 
                                                    disabled={isSaving}
                                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                                                >
                                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                                                    Simpan Perubahan
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "security" && (
                                <div className="max-w-md mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Keamanan</h3>
                                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">Kredensial Autentikasi</p>
                                    </div>

                                    <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl flex gap-4 items-center mb-6">
                                        <ShieldCheck className="text-orange-500" size={24} />
                                        <p className="text-[10px] text-orange-700 leading-relaxed font-bold uppercase">Ganti password secara berkala untuk menjaga keamanan data.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Password Sekarang</label>
                                            <input 
                                                type="password" 
                                                placeholder="••••••••"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/5 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Password Baru</label>
                                            <input 
                                                type="password" 
                                                placeholder="••••••••"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                            />
                                        </div>
                                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] mt-2 shadow-xl hover:bg-black active:scale-95 transition-all">
                                            Update Password
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerifikatorProfile;