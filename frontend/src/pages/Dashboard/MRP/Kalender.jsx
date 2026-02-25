import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Package, Zap, Wrench, Loader2 } from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";

const weekdays = ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"];
const CATEGORIES = [
    { id: "packing", label: "Packing", icon: <Package size={16} />, color: "bg-blue-600", ring: "ring-blue-500" },
    { id: "finishing", label: "Finishing", icon: <Zap size={16} />, color: "bg-amber-500", ring: "ring-amber-400" },
    { id: "assembly", label: "Assembly", icon: <Wrench size={16} />, color: "bg-emerald-600", ring: "ring-emerald-500" },
];

function isoToDateKey(isoString) {
    return isoString.split("T")[0];
}

export default function Kalender() {
    const { itemId } = useParams();

    const today = new Date();
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());
    const [activeTab, setActiveTab] = useState("packing");
    const [shiftData, setShiftData] = useState({ packing: {}, finishing: {}, assembly: {} });
    const [loading, setLoading] = useState(false);
    const [debugInfo, setDebugInfo] = useState(null); // ← debug panel

    const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    function formatToLocalKey(isoString) {
        const d = new Date(isoString);
        // Kita ambil tanggal berdasarkan local time (WIB), bukan UTC
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchSchedule = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/production/all/schedule`);
            const scheduleArray = res.data.production_schedule || [];
            const formatted = {};
            let totalProcessed = 0;

            scheduleArray.forEach((item) => {
                if (item && item.date) {
                    const dateKey = String(item.date).substring(0, 10);

                    if (!formatted[dateKey]) {
                        formatted[dateKey] = { shift1: 0, shift2: 0, shift3: 0 };
                    }

                    formatted[dateKey].shift1 += Number(item.shifts?.shift1?.qty || 0);
                    formatted[dateKey].shift2 += Number(item.shifts?.shift2?.qty || 0);
                    formatted[dateKey].shift3 += Number(item.shifts?.shift3?.qty || 0);
                    totalProcessed++;
                }
            });

            // PERUBAHAN DI SINI:
            // Kita hanya mengisi 'packing' dengan data tersebut. 
            // 'finishing' dan 'assembly' dikosongkan (objek {})
            setShiftData({
                packing: formatted,    // Data dari demand_items masuk sini
                finishing: {},         // Kosongkan jika bukan kategorinya
                assembly: {}           // Kosongkan jika bukan kategorinya
            });

            setDebugInfo({
                totalRows: res.data.production_schedule ? "Fetched" : 0,
                totalEntries: totalProcessed,
                keys: Object.keys(formatted),
                sample: scheduleArray.length > 0 ? scheduleArray[0] : null
            });
        } catch (err) {
            console.error("Frontend Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

    const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

    const generateCalendar = (m, y) => {
        const startOffset = (new Date(y, m, 1).getDay() + 6) % 7;
        const totalDays = new Date(y, m + 1, 0).getDate();
        let cur = 1;
        return Array.from({ length: 42 }, (_, i) =>
            i < startOffset || cur > totalDays ? null : cur++
        );
    };

    const activeCat = CATEGORIES.find(c => c.id === activeTab);
    const currentStore = shiftData[activeTab] || {};

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen font-sans">

            {/* ══════════════════════════════════════════════════
                DEBUG PANEL — hapus blok ini setelah beres
            ══════════════════════════════════════════════════ */}
            {debugInfo && (
                <div className="mb-4 p-4 rounded-2xl border-2 text-xs font-mono bg-sky-50 border-sky-200 text-sky-900">
                    <p className="font-bold mb-1">🔍 DEBUG MODE: ALL ITEMS</p>
                    <p>Total Baris Database : {debugInfo.totalRows}</p>
                    <p>Total Jadwal Ditemukan: {debugInfo.totalEntries}</p>
                    <p>Tanggal Terisi      : {debugInfo.keys?.length || 0} hari</p>
                    <details className="mt-2">
                        <summary className="cursor-pointer font-bold text-blue-600">Lihat Daftar Tanggal</summary>
                        <p className="mt-1 bg-white p-2 rounded border">{debugInfo.keys?.join(", ") || "Kosong"}</p>
                    </details>
                </div>
            )}

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setActiveTab(cat.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all
                        ${activeTab === cat.id ? `${cat.color} text-white shadow-lg` : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>
                        {cat.icon} {cat.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative">

                {loading && (
                    <div className="absolute inset-0 bg-white/70 z-20 flex items-center justify-center backdrop-blur-sm">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                    </div>
                )}

                {/* Navigasi */}
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl text-white shadow-md ${activeCat.color}`}>
                            <CalendarIcon size={24} />
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {itemId ? `Item #${itemId}` : "ALL PRODUCTION"} · {activeTab}
                            {/* Tambahkan keterangan jika data kosong */}
                            {activeTab !== 'packing' && " (No Data for this category)"}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-100 p-2 rounded-2xl">
                        <button onClick={prevMonth} className="p-2.5 bg-white hover:bg-blue-50 text-gray-600 rounded-xl shadow-sm">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex gap-2 px-2 font-bold text-sm text-gray-700">
                            <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="bg-transparent outline-none cursor-pointer">
                                {monthNames.map((n, i) => <option key={i} value={i}>{n}</option>)}
                            </select>
                            <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="bg-transparent outline-none cursor-pointer">
                                {Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={nextMonth} className="p-2.5 bg-white hover:bg-blue-50 text-gray-600 rounded-xl shadow-sm">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <button onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800">
                        Hari Ini
                    </button>
                </div>

                {/* Grid */}
                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-7 gap-2 mb-3">
                        {weekdays.map(wd => (
                            <div key={wd} className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] py-1">{wd}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {generateCalendar(month, year).map((date, idx) => {
                            const dateKey = date
                                ? `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`
                                : null;

                            const vals = dateKey
                                ? (currentStore[dateKey] || { shift1: 0, shift2: 0, shift3: 0 })
                                : { shift1: 0, shift2: 0, shift3: 0 };

                            const isToday = date === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                            const hasData = date && (Number(vals.shift1) > 0 || Number(vals.shift2) > 0 || Number(vals.shift3) > 0);
                            const inStore = dateKey && dateKey in currentStore;

                            const shiftDots = [
                                Number(vals.shift1) > 0 ? "bg-blue-400" : "bg-gray-200",
                                Number(vals.shift2) > 0 ? "bg-amber-400" : "bg-gray-200",
                                Number(vals.shift3) > 0 ? "bg-emerald-400" : "bg-gray-200",
                            ];

                            return (
                                <div key={idx}
                                    className={`min-h-[120px] rounded-2xl border-2 p-2 transition-all flex flex-col
                                    ${!date ? "bg-transparent border-transparent" : "border-gray-100 bg-white hover:shadow-md group"}
                                    ${isToday ? `ring-2 ${activeCat.ring} ring-offset-1` : ""}
                                    ${hasData && !isToday ? "border-emerald-300 bg-emerald-50/60" : ""}
                                    ${inStore && !hasData ? "border-dashed border-gray-300" : ""}`}>

                                    {date && (
                                        <>
                                            <div className="flex items-start justify-between mb-1.5">
                                                <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-lg
                                                    ${isToday ? `${activeCat.color} text-white` : hasData ? "bg-emerald-100 text-emerald-700" : "text-gray-400"}`}>
                                                    {date}
                                                </span>
                                                <div className="flex gap-0.5 mt-0.5">
                                                    {shiftDots.map((c, i) => (
                                                        <span key={i} className={`w-1.5 h-1.5 rounded-full ${c}`} />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-1 mt-auto">
                                                {[1, 2, 3].map(s => {
                                                    const v = Number(vals[`shift${s}`] || 0);
                                                    return (
                                                        <div key={s} className={`flex items-center gap-1.5 rounded-lg px-1.5 py-1
                                                            ${v > 0 ? "bg-emerald-100/70" : "bg-gray-50"}`}>
                                                            <span className={`text-[9px] font-black w-3 shrink-0 ${v > 0 ? "text-emerald-600" : "text-gray-300"}`}>
                                                                S{s}
                                                            </span>
                                                            <span className={`w-full text-[11px] font-bold text-right ${v > 0 ? "text-emerald-700" : "text-gray-300"}`}>
                                                                {v > 0 ? v.toLocaleString() : "—"}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {hasData && (
                                                <div className="mt-1.5 text-[9px] font-black text-emerald-600 text-right">
                                                    ={(Number(vals.shift1) + Number(vals.shift2) + Number(vals.shift3)).toLocaleString()}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="px-6 pb-5 pt-4 flex flex-wrap gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-t border-gray-100">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" />    Shift 1</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />   Shift 2</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Shift 3</span>
                    <span className="flex items-center gap-1.5"><span className="w-4 h-2 rounded bg-emerald-100 border border-emerald-300" /> Ada data</span>
                    <span className="flex items-center gap-1.5"><span className="w-4 h-2 rounded border-2 border-dashed border-gray-300" /> Entry qty 0</span>
                </div>
            </div>
        </div>
    );
}
