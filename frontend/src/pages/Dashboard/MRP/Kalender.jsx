import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Package, Zap, Wrench, Loader2, Filter } from "lucide-react";
import axios from "axios";

const weekdays = ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"];

// Update Warna sesuai permintaan: Packing Hijau, Finishing Biru, Assembly Oren
const CATEGORIES = [
    { id: "packing", label: "Packing", icon: <Package size={16} />, color: "bg-emerald-600", ring: "ring-emerald-500", light: "bg-emerald-50", text: "text-emerald-700" },
    { id: "finishing", label: "Finishing", icon: <Zap size={16} />, color: "bg-blue-600", ring: "ring-blue-500", light: "bg-blue-50", text: "text-blue-700" },
    { id: "assembly", label: "Assembly", icon: <Wrench size={16} />, color: "bg-orange-500", ring: "ring-orange-400", light: "bg-orange-50", text: "text-orange-700" },
];

const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function Kalender() {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());
    const [activeTab, setActiveTab] = useState("packing");
    const [shiftData, setShiftData] = useState({ packing: {}, finishing: {}, assembly: {} });
    const [loading, setLoading] = useState(false);

    const processScheduleArray = (arr) => {
        const formatted = {};
        if (!Array.isArray(arr)) return formatted;
        arr.forEach((item) => {
            if (item && item.date) {
                const dateKey = String(item.date).substring(0, 10);
                if (!formatted[dateKey]) formatted[dateKey] = { shift1: 0, shift2: 0, shift3: 0 };
                formatted[dateKey].shift1 += Number(item.shifts?.shift1?.qty || 0);
                formatted[dateKey].shift2 += Number(item.shifts?.shift2?.qty || 0);
                formatted[dateKey].shift3 += Number(item.shifts?.shift3?.qty || 0);
            }
        });
        return formatted;
    };

    const fetchSchedule = useCallback(async () => {
        setLoading(true);
        try {
            const [resProd, resFin] = await Promise.all([
                axios.get(`/api/production/all/schedule`),
                axios.get(`/api/production/finishing-all`)
            ]);
            setShiftData({
                packing: processScheduleArray(resProd.data.production_schedule),
                finishing: processScheduleArray(resFin.data.finishing_schedule),
                assembly: {} 
            });
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

    const generateCalendar = (m, y) => {
        const startOffset = (new Date(y, m, 1).getDay() + 6) % 7;
        const totalDays = new Date(y, m + 1, 0).getDate();
        let cur = 1;
        return Array.from({ length: 42 }, (_, i) => i < startOffset || cur > totalDays ? null : cur++);
    };

    const activeCat = CATEGORIES.find(c => c.id === activeTab);
    const currentStore = shiftData[activeTab] || {};

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-900">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Jadwal Produksi</h1>
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <CalendarIcon size={18} />
                        <span>Panel Monitoring Shift Kerja</span>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
                    {CATEGORIES.map(cat => (
                        <button 
                            key={cat.id} 
                            onClick={() => setActiveTab(cat.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all
                            ${activeTab === cat.id ? `${cat.color} text-white shadow-md` : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
                        >
                            {cat.icon} {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100 relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 z-30 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className={`animate-spin ${activeCat.text}`} size={48} />
                            <span className="font-bold text-slate-400 animate-pulse">Memuat Data...</span>
                        </div>
                    </div>
                )}

                {/* Toolbar Kalender */}
                <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-white">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${activeCat.color}`}>
                            <Filter size={28} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Periode Aktif</span>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-black">{monthNames[month]}</h2>
                                <h2 className="text-2xl font-light text-slate-400">{year}</h2>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100">
                        {/* Pilih Bulan */}
                        <select 
                            value={month} 
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="bg-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm border-none focus:ring-2 focus:ring-slate-200 outline-none"
                        >
                            {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>

                        {/* Pilih Tahun */}
                        <select 
                            value={year} 
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="bg-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm border-none focus:ring-2 focus:ring-slate-200 outline-none"
                        >
                            {Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i).map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>

                        <div className="w-px h-6 bg-slate-200 mx-1 hidden md:block" />

                        <div className="flex gap-1">
                            <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }}
                                className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}
                                className="px-4 py-2 hover:bg-white hover:shadow-sm rounded-lg text-xs font-black uppercase text-slate-600">
                                Hari Ini
                            </button>
                            <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }}
                                className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grid Kalender */}
                <div className="p-6 md:p-8 overflow-x-auto">
                    <div className="min-w-[800px]">
                        <div className="grid grid-cols-7 gap-4 mb-6">
                            {weekdays.map(wd => (
                                <div key={wd} className="text-center text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">{wd}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-4">
                            {generateCalendar(month, year).map((date, idx) => {
                                const dateKey = date ? `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}` : null;
                                const vals = currentStore[dateKey] || { shift1: 0, shift2: 0, shift3: 0 };
                                const isToday = date === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                                const hasData = date && (vals.shift1 > 0 || vals.shift2 > 0 || vals.shift3 > 0);
                                const totalQty = Number(vals.shift1) + Number(vals.shift2) + Number(vals.shift3);

                                return (
                                    <div key={idx}
                                        className={`min-h-[140px] rounded-[1.5rem] border-2 p-3 transition-all flex flex-col group
                                        ${!date ? "bg-transparent border-transparent" : "bg-white border-slate-50 shadow-sm hover:border-slate-200 hover:shadow-md"}
                                        ${isToday ? `ring-2 ${activeCat.ring} ring-offset-4 border-transparent` : ""}
                                        ${hasData ? `${activeCat.light} border-${activeCat.id === 'packing' ? 'emerald' : activeCat.id === 'finishing' ? 'blue' : 'orange'}-100` : ""}`}>

                                        {date && (
                                            <>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={`text-sm font-black w-8 h-8 flex items-center justify-center rounded-xl transition-colors
                                                        ${isToday ? `${activeCat.color} text-white shadow-lg shadow-${activeCat.id}/30` : hasData ? `${activeCat.text} bg-white shadow-sm` : "text-slate-300"}`}>
                                                        {date}
                                                    </span>
                                                    {hasData && <div className={`w-2 h-2 rounded-full ${activeCat.color} animate-pulse`} />}
                                                </div>

                                                <div className="space-y-1.5 flex-grow">
                                                    {[1, 2, 3].map(s => {
                                                        const v = Number(vals[`shift${s}`] || 0);
                                                        return (
                                                            <div key={s} className={`flex items-center justify-between px-2 py-1 rounded-lg transition-colors ${v > 0 ? "bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]" : "opacity-20"}`}>
                                                                <span className="text-[9px] font-black text-slate-400">S{s}</span>
                                                                <span className={`text-xs font-bold ${v > 0 ? activeCat.text : "text-slate-300"}`}>
                                                                    {v > 0 ? v.toLocaleString() : "—"}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {hasData && (
                                                    <div className={`mt-2 pt-2 border-t border-white flex justify-between items-center ${activeCat.text}`}>
                                                        <span className="text-[8px] font-black uppercase opacity-60">Total</span>
                                                        <span className="text-[11px] font-black">{totalQty.toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer / Legend */}
                <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex gap-6 items-center">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${activeCat.color}`} />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{activeCat.label} Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-slate-200" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Schedule</span>
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 italic">*Data diperbarui secara otomatis dari sistem ERP.</p>
                </div>
            </div>
        </div>
    );
}