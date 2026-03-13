import { useEffect, useState } from "react";
import api from "../../api/api";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion"; // Pastikan install framer-motion
import { 
    User, Lock, Mail, Edit3, Save, ShieldCheck, 
    Loader2, BadgeCheck, Fingerprint, X, ChevronRight 
} from "lucide-react";

function VerifikatorProfile() {
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState({ nama_lengkap: "", email: "" });

    useEffect(() => { fetchProfile(); }, []);

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

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            const res = await api.put("/auth/update", form);
            if (res.data.success) {
                setProfile(res.data.user);
                setEditMode(false);
                Swal.fire({ icon: 'success', title: 'Profil Diperbarui', showConfirmButton: false, timer: 1000 });
            }
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || "Gagal", "error");
        } finally { setIsSaving(false); }
    };

    if (!profile) return (
        <div className="h-full w-full flex items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-slate-400" size={32} />
                <span className="text-xs font-medium text-slate-400 tracking-widest uppercase">Initializing</span>
            </div>
        </div>
    );

    return (
        <div className="h-full w-full bg-white md:bg-[#fafafa] p-4 md:p-8 flex flex-col font-sans">
            <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col min-h-0">
                
                {/* Header Area */}
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Account Settings</h1>
                        <p className="text-sm text-slate-500">Kelola informasi profil dan keamanan akun Anda.</p>
                    </div>
                </header>

                <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">
                    
                    {/* --- LEFT: NAV & IDENTITY --- */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        {/* Profile Summary Card */}
                        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xl font-medium shadow-lg shadow-slate-200">
                                    {profile.nama_lengkap?.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-lg font-bold text-slate-900 truncate">{profile.nama_lengkap}</h2>
                                    <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                                        <BadgeCheck size={12} /> {profile.role || "Verifikator"}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <NavButton 
                                    active={activeTab === "profile"} 
                                    onClick={() => setActiveTab("profile")}
                                    icon={<User size={18} />}
                                    label="Personal Information"
                                />
                                <NavButton 
                                    active={activeTab === "security"} 
                                    onClick={() => setActiveTab("security")}
                                    icon={<Lock size={18} />}
                                    label="Security & Password"
                                />
                            </div>
                        </div>

                        {/* Quick Info */}
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">System Identity</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Fingerprint size={16} className="text-slate-400" />
                                    <span className="text-xs text-slate-600 font-mono">{profile.username}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail size={16} className="text-slate-400" />
                                    <span className="text-xs text-slate-600 truncate">{profile.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT: CONTENT AREA --- */}
                    <div className="col-span-12 lg:col-span-8">
                        <motion.div 
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white h-full rounded-[2rem] border border-slate-200/60 shadow-sm p-8 md:p-10"
                        >
                            {activeTab === "profile" ? (
                                <div className="max-w-xl">
                                    <div className="flex justify-between items-start mb-10">
                                        <div>
                                            <h3 className="text-xl font-semibold text-slate-900">Personal Information</h3>
                                            <p className="text-sm text-slate-500 mt-1">Gunakan nama asli untuk mempermudah verifikasi sistem.</p>
                                        </div>
                                        {!editMode && (
                                            <button 
                                                onClick={() => setEditMode(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors"
                                            >
                                                <Edit3 size={14} /> Edit
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <InputGroup 
                                            label="Full Name" 
                                            value={form.nama_lengkap} 
                                            disabled={!editMode}
                                            onChange={(val) => setForm({...form, nama_lengkap: val})}
                                        />
                                        <InputGroup 
                                            label="Email Address" 
                                            value={form.email} 
                                            disabled={!editMode}
                                            onChange={(val) => setForm({...form, email: val})}
                                        />
                                    </div>

                                    <AnimatePresence>
                                        {editMode && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="mt-12 flex items-center gap-3 pt-6 border-t border-slate-50"
                                            >
                                                <button 
                                                    onClick={() => setEditMode(false)}
                                                    className="px-6 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    onClick={handleUpdate}
                                                    disabled={isSaving}
                                                    className="flex items-center gap-2 px-8 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                                                >
                                                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                                    Save Changes
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="max-w-xl">
                                    <div className="mb-10">
                                        <h3 className="text-xl font-semibold text-slate-900">Security</h3>
                                        <p className="text-sm text-slate-500 mt-1">Pastikan akun Anda tetap aman dengan password yang kuat.</p>
                                    </div>

                                    <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl flex gap-3 items-start mb-8 text-amber-800">
                                        <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                                        <p className="text-xs leading-relaxed">Sistem mewajibkan penggantian password secara berkala setiap 90 hari untuk keamanan data verifikasi.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <InputGroup label="Current Password" type="password" placeholder="••••••••" />
                                        <InputGroup label="New Password" type="password" placeholder="••••••••" />
                                        <button className="w-full mt-4 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all">
                                            Update Password
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-component agar kode lebih bersih
const NavButton = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all ${
            active ? 'bg-slate-50 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
        }`}
    >
        <div className="flex items-center gap-3">
            <span className={active ? 'text-indigo-600' : ''}>{icon}</span>
            <span className="text-sm font-medium">{label}</span>
        </div>
        {active && <ChevronRight size={14} className="text-slate-300" />}
    </button>
);

const InputGroup = ({ label, value, disabled, onChange, type = "text", placeholder }) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
        <input 
            type={type}
            value={value}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => onChange?.(e.target.value)}
            className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all ${
                !disabled ? 'focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 ring-inset' : 'bg-slate-50/50 text-slate-400 border-slate-100 cursor-not-allowed'
            }`}
        />
    </div>
);

export default VerifikatorProfile;