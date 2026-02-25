import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Package, Zap, Wrench, Save, Loader2 } from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom"; // ✅ import useParams

const weekdays = ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"];
const CATEGORIES = [
    { id: "packing",   label: "Packing",   icon: <Package size={16} />, color: "bg-blue-600" },
    { id: "finishing", label: "Finishing", icon: <Zap size={16} />,     color: "bg-amber-500" },
    { id: "assembly",  label: "Assembly",  icon: <Wrench size={16} />,  color: "bg-emerald-600" },
];

export default function Kalender() { // ✅ HAPUS { itemId } dari parameter
    const { itemId } = useParams();  // ✅ Ambil itemId dari URL

    const today = new Date();
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());
    const [activeTab, setActiveTab] = useState("packing");
    const [shiftData, setShiftData] = useState({ packing: {}, finishing: {}, assembly: {} });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

    // ── Fetch ────────────────────────────────────────────────────────────────
    const fetchSchedule = useCallback(async () => {
        if (!itemId) return;
        setLoading(true);
        try {
            const res = await axios.get(`/api/production/${itemId}/schedule`);

            let schedule = res.data.production_schedule || [];
            if (typeof schedule === "string") {
                try { schedule = JSON.parse(schedule); } catch { schedule = []; }
            }

            const formatted = {};
            schedule.forEach(item => {
                if (item.date) {
                    // "2026-03-28T17:00:00.000Z" → tambah 7 jam agar tidak geser ke tanggal sebelumnya
                    const d = new Date(new Date(item.date).getTime() + 7 * 60 * 60 * 1000);
                    const dateKey = d.toISOString().split("T")[0];
                    formatted[dateKey] = {
                        shift1: item.shifts?.shift1?.qty || 0,
                        shift2: item.shifts?.shift2?.qty || 0,
                        shift3: item.shifts?.shift3?.qty || 0,
                    };
                }
            });

            // ✅ Simpan ke tab packing
            setShiftData(prev => ({ ...prev, packing: formatted }));

            // Finishing — fetch dari endpoint terpisah jika ada
            try {
                const finRes = await axios.get(`/api/production/${itemId}/schedule/finishing`);
                let finSchedule = finRes.data.production_schedule || [];
                if (typeof finSchedule === "string") {
                    try { finSchedule = JSON.parse(finSchedule); } catch { finSchedule = []; }
                }
                const finFormatted = {};
                finSchedule.forEach(item => {
                    if (item.date) {
                        const d = new Date(new Date(item.date).getTime() + 7 * 60 * 60 * 1000);
                        const dateKey = d.toISOString().split("T")[0];
                        finFormatted[dateKey] = {
                            shift1: item.shifts?.shift1?.qty || 0,
                            shift2: item.shifts?.shift2?.qty || 0,
                            shift3: item.shifts?.shift3?.qty || 0,
                        };
                    }
                });
                setShiftData(prev => ({ ...prev, finishing: finFormatted }));
            } catch {
                // endpoint finishing belum ada, biarkan kosong
            }

        } catch (err) {
            console.error("Gagal mengambil jadwal:", err);
        } finally {
            setLoading(false);
        }
    }, [itemId]);

    useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

    // ── Save ─────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        try {
            const currentData = shiftData[activeTab] || {};
            const payload = Object.entries(currentData).map(([date, shifts]) => ({
                date: new Date(`${date}T17:00:00.000Z`).toISOString(),
                shifts: {
                    shift1: { qty: Number(shifts.shift1 || 0), active: Number(shifts.shift1) > 0 },
                    shift2: { qty: Number(shifts.shift2 || 0), active: Number(shifts.shift2) > 0 },
                    shift3: { qty: Number(shifts.shift3 || 0), active: Number(shifts.shift3) > 0 },
                },
            }));

            await axios.patch(`/api/production/${itemId}/schedule`, {
                production_schedule: payload,
                activeTab,
            });

            alert("Jadwal Berhasil Disimpan!");
            fetchSchedule();
        } catch (err) {
            alert("Gagal menyimpan jadwal: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    // ── Navigasi ─────────────────────────────────────────────────────────────
    const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

    const handleInputChange = (date, shift, value) => {
        const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
        setShiftData(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [dateKey]: {
                    ...(prev[activeTab]?.[dateKey] || { shift1: 0, shift2: 0, shift3: 0 }),
                    [shift]: value,
                },
            },
        }));
    };

    const generateCalendar = (m, y) => {
        const startOffset = (new Date(y, m, 1).getDay() + 6) % 7;
        const totalDays = new Date(y, m + 1, 0).getDate();
        let cur = 1;
        return Array.from({ length: 42 }, (_, i) =>
            i < startOffset || cur > totalDays ? null : cur++
        );
    };

    const activeCat = CATEGORIES.find(c => c.id === activeTab);

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen font-sans">

            {/* Tabs & Save */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                        <button key={cat.id} onClick={() => setActiveTab(cat.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all
                            ${activeTab === cat.id ? `${cat.color} text-white shadow-lg` : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>

                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md disabled:opacity-50 transition-all active:scale-95">
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Simpan Perubahan
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative">

                {loading && (
                    <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center backdrop-blur-[1px]">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                    </div>
                )}

                {/* Navigasi Bulan */}
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl text-white shadow-md ${activeCat.color}`}>
                            <CalendarIcon size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 leading-none mb-1">
                                {monthNames[month]} {year}
                            </h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Item #{itemId} · {activeTab}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-100 p-2 rounded-2xl">
                        <button onClick={prevMonth} className="p-2.5 bg-white hover:bg-blue-50 text-gray-600 rounded-xl shadow-sm transition-all">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex gap-2 px-2 font-bold text-sm text-gray-700">
                            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="bg-transparent outline-none cursor-pointer">
                                {monthNames.map((n, i) => <option key={i} value={i}>{n}</option>)}
                            </select>
                            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="bg-transparent outline-none cursor-pointer">
                                {Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={nextMonth} className="p-2.5 bg-white hover:bg-blue-50 text-gray-600 rounded-xl shadow-sm transition-all">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <button onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                        Kembali ke Hari Ini
                    </button>
                </div>

                {/* Grid Kalender */}
                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {weekdays.map(wd => (
                            <div key={wd} className="text-center text-[11px] font-black text-gray-300 uppercase tracking-[0.2em]">{wd}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-3">
                        {generateCalendar(month, year).map((date, idx) => {
                            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;

                            // ✅ Gunakan activeTab, bukan hardcode "packing"
                            const vals = shiftData[activeTab]?.[dateKey] || { shift1: "", shift2: "", shift3: "" };
                            const isToday = date === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                            const hasData = date && (Number(vals.shift1) > 0 || Number(vals.shift2) > 0 || Number(vals.shift3) > 0);

                            return (
                                <div key={idx} className={`min-h-[130px] rounded-2xl border-2 p-2 transition-all flex flex-col
                                    ${!date ? "bg-gray-50/50 border-transparent" : "border-gray-100 bg-white hover:border-blue-100 hover:shadow-lg group"}
                                    ${isToday ? "ring-2 ring-blue-500 ring-offset-2 border-blue-100" : ""}
                                    ${hasData && !isToday ? "border-emerald-200 bg-emerald-50/30" : ""}`}>

                                    {date && (
                                        <>
                                            <span className={`text-xs font-black w-7 h-7 flex items-center justify-center rounded-lg mb-2
                                                ${isToday ? "bg-blue-600 text-white shadow-md"
                                                : hasData ? "bg-emerald-100 text-emerald-700"
                                                : "bg-gray-50 text-gray-400 group-hover:text-blue-600"}`}>
                                                {date}
                                            </span>

                                            <div className="space-y-1.5 mt-auto">
                                                {[1, 2, 3].map(s => (
                                                    <div key={s} className="flex items-center gap-2 bg-gray-50 group-hover:bg-blue-50/50 rounded-lg px-2 py-1 transition-colors">
                                                        <span className="text-[9px] font-black text-gray-400 w-3">S{s}</span>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={vals[`shift${s}`] === 0 ? "" : (vals[`shift${s}`] || "")}
                                                            onChange={(e) => handleInputChange(date, `shift${s}`, e.target.value)}
                                                            className="w-full bg-transparent text-[11px] font-bold text-right outline-none text-gray-700 placeholder-gray-300"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
