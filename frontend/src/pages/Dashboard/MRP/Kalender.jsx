import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar as CalendarIcon, Package, Zap, Wrench,
  Loader2, Search, ChevronRight, Plus, Trash2, X
} from "lucide-react";
import axios from "axios";

const CATEGORIES = [
  { id: "packing", label: "Packing", icon: <Package size={16} />, activeClass: "bg-emerald-600 text-white shadow-indigo-100", text: "text-indigo-600", light: "bg-indigo-50/50" },
  { id: "finishing", label: "Finishing", icon: <Zap size={16} />, activeClass: "bg-indigo-600 text-white shadow-amber-100", text: "text-amber-600", light: "bg-amber-50/50" },
  { id: "assembly", label: "Assembly", icon: <Wrench size={16} />, activeClass: "bg-amber-500 text-white shadow-emerald-100", text: "text-emerald-600", light: "bg-emerald-50/50" },
];

const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
export default function ExcelSchedule() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [activeTab, setActiveTab] = useState("packing");
  const [rawData, setRawData] = useState({ packing: [], finishing: [], assembly: [] });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- STATE BARU: HARI LIBUR ---
  const [holidays, setHolidays] = useState([]);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: "", description: "" });
  const [filterMonth, setFilterMonth] = useState(''); // '' berarti 'Semua Bulan'
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString()); // Default tahun sekarang

  const filteredHolidays = holidays.filter(h => {
    const date = new Date(h.holiday_date);
    const matchesMonth = filterMonth === '' || (date.getMonth() + 1).toString() === filterMonth;
    const matchesYear = filterYear === '' || date.getFullYear().toString() === filterYear;
    return matchesMonth && matchesYear;
  });

  // Fetch Data (Jadwal + Libur)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resProd, resFin, resAssy, resHolidays] = await Promise.all([
        axios.get(`/api/production/all/schedule`),
        axios.get(`/api/production/finishing-all`),
        axios.get(`/api/production/assembly-all`),
        axios.get(`/api/production/holidays`) // Endpoint libur
      ]);

      setRawData({
        packing: resProd.data.production_schedule || [],
        finishing: resFin.data.finishing_schedule || [],
        assembly: resAssy.data.assembly_schedule || []
      });
      setHolidays(resHolidays.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- FUNGSI CRUD LIBUR ---
  const handleAddHoliday = async () => {
    if (!newHoliday.date || !newHoliday.description) return;
    try {
      await axios.post('/api/production/holidays', newHoliday);
      setNewHoliday({ date: "", description: "" });
      fetchData(); // Refresh data
    } catch (err) { alert("Gagal menambah hari libur"); }
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm("Hapus hari libur ini?")) return;
    try {
      await axios.delete(`/api/production/holidays/${id}`);
      fetchData();
    } catch (err) { alert("Gagal menghapus"); }
  };

  // Helper untuk cek apakah tanggal tertentu adalah libur
  const getHolidayData = (date) => {
    const dStr = date.toLocaleDateString('en-CA'); // format YYYY-MM-DD
    return holidays.find(h => h.holiday_date.split('T')[0] === dStr);
  };

  // --- LOGIKA TABEL ---
  const daysInMonth = useMemo(() => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [month, year]);
  // State untuk menyimpan kolom mana yang di-sort dan arahnya
  const [sortConfig, setSortConfig] = useState({ key: 'holiday_date', direction: 'asc' });

  // Fungsi untuk mengubah kriteria sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Data yang sudah di-sort untuk di-render
  const sortedHolidays = [...filteredHolidays].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const tableData = useMemo(() => {
    const currentCategoryData = rawData[activeTab];
    const grouped = {};
    const activeMonthFilter = `${year}-${String(month + 1).padStart(2, '0')}`;

    currentCategoryData.forEach(item => {
      const rawDate = item.date || item.tanggal;
      if (!rawDate) return;
      const d = new Date(rawDate);
      const itemMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const dateKey = `${itemMonthKey}-${String(d.getDate()).padStart(2, '0')}`;
      if (itemMonthKey !== activeMonthFilter) return;

      const so = item.so_number || "N/A";
      const code = item.item_code || "N/A";
      const desc = item.item_description || "-";

      if (!grouped[so]) grouped[so] = {};
      if (!grouped[so][code]) grouped[so][code] = { dailyQty: {}, description: desc };

      const s1 = Number(item.shifts?.shift1?.qty || item.shift1 || 0);
      const s2 = Number(item.shifts?.shift2?.qty || item.shift2 || 0);
      const s3 = Number(item.shifts?.shift3?.qty || item.shift3 || 0);
      grouped[so][code].dailyQty[dateKey] = { s1, s2, s3, total: s1 + s2 + s3 };
    });

    const flatData = [];
    Object.keys(grouped).forEach(so => {
      const filteredItems = Object.keys(grouped[so]).filter(code =>
        so.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grouped[so][code].description.toLowerCase().includes(searchTerm.toLowerCase())
      );

      filteredItems.forEach((code, index) => {
        flatData.push({
          so, itemCode: code, description: grouped[so][code].description,
          dailyQty: grouped[so][code].dailyQty, isFirstItem: index === 0, rowCount: filteredItems.length
        });
      });
    });
    return flatData;
  }, [rawData, activeTab, searchTerm, month, year]);

  const activeCat = CATEGORIES.find(c => c.id === activeTab);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 font-sans text-slate-900">

      {/* --- MODAL HARI LIBUR --- */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 transition-all">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-100">

            {/* Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50/80">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                  <div className="bg-rose-100 p-1.5 rounded-lg">
                    <CalendarIcon size={20} className="text-rose-600" />
                  </div>
                  Atur Hari Libur
                </h3>
                <p className="text-[11px] text-slate-500 font-medium ml-10">Manajemen kalender operasional</p>
              </div>
              <button
                onClick={() => setIsHolidayModalOpen(false)}
                className="bg-white border hover:bg-slate-100 text-slate-400 hover:text-slate-600 p-2 rounded-xl transition-all shadow-sm"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {/* Form Input Section */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 shadow-inner">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Pilih Tanggal</label>
                    <input
                      type="date"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all shadow-sm"
                      value={newHoliday.date}
                      onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Keterangan Libur</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Contoh: Libur Nasional Idul Fitri"
                        className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all shadow-sm"
                        value={newHoliday.description}
                        onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
                      />
                      <button
                        onClick={handleAddHoliday}
                        className="bg-rose-500 text-white px-5 rounded-xl hover:bg-rose-600 active:scale-95 transition-all shadow-lg shadow-rose-200 flex items-center justify-center group"
                      >
                        <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Search & Filter Section */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                  <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="bg-white border-none rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 outline-none shadow-sm focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="">Semua Bulan</option>
                    {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m, i) => (
                      <option key={m} value={(i + 1).toString()}>{m}</option>
                    ))}
                  </select>

                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="bg-white border-none rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 outline-none shadow-sm focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="">Semua Tahun</option>
                    {[2024, 2025, 2026, 2027].map(y => (
                      <option key={y} value={y.toString()}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Tombol Reset Filter jika diperlukan */}
                {(filterMonth !== '' || filterYear !== '') && (
                  <button
                    onClick={() => { setFilterMonth(''); setFilterYear(''); }}
                    className="px-3 py-1 text-[10px] font-bold text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    RESET
                  </button>
                )}
              </div>
              {/* Table Section */}
              <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        {/* Header Tanggal - Clickable */}
                        <th
                          onClick={() => requestSort('holiday_date')}
                          className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors group"
                        >
                          <div className="flex items-center gap-1">
                            Tanggal
                            <span className="inline-block transition-transform duration-200">
                              {sortConfig.key === 'holiday_date' ? (
                                sortConfig.direction === 'asc' ? '↑' : '↓'
                              ) : (
                                <span className="opacity-0 group-hover:opacity-100 text-slate-300">↑</span>
                              )}
                            </span>
                          </div>
                        </th>

                        {/* Header Keterangan - Clickable */}
                        <th
                          onClick={() => requestSort('description')}
                          className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors group"
                        >
                          <div className="flex items-center gap-1">
                            Keterangan
                            <span className="inline-block transition-transform duration-200">
                              {sortConfig.key === 'description' ? (
                                sortConfig.direction === 'asc' ? '↑' : '↓'
                              ) : (
                                <span className="opacity-0 group-hover:opacity-100 text-slate-300">↑</span>
                              )}
                            </span>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-right"></th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {/* GUNAKAN sortedHolidays di sini, bukan holidays mentah */}
                      {sortedHolidays.length > 0 ? (
                        sortedHolidays.map((h) => (
                          <tr key={h.id} className="hover:bg-rose-50/30 transition-colors group">
                            <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                              {new Date(h.holiday_date).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-600 font-medium italic">
                              {h.description}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDeleteHoliday(h.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-100 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <CalendarIcon size={32} className="text-slate-200" />
                              <p className="text-sm text-slate-400 italic">Belum ada hari libur terdaftar</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="mt-4 text-[10px] text-center text-slate-400">
                * Hari Minggu otomatis dianggap libur oleh sistem
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upper Header */}
      <div className="max-w-[1600px] mx-auto mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <div className="h-1 w-6 bg-indigo-600 rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Monitoring System</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Production Schedule</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* --- TOMBOL MODAL LIBUR --- */}
            <button
              onClick={() => setIsHolidayModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-xl text-xs font-bold shadow-sm hover:bg-rose-50 transition-all"
            >
              <CalendarIcon size={16} /> Kelola Libur
            </button>

            <div className="bg-white border border-slate-200 p-1 rounded-xl flex shadow-sm">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id} onClick={() => setActiveTab(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === cat.id ? cat.activeClass : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="max-w-[1600px] mx-auto mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text" placeholder="Search Sales Order or Items..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-slate-50">
            {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-slate-50">
            {Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {loading && <div className="flex items-center px-2"><Loader2 className="animate-spin text-indigo-500" size={20} /></div>}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="max-w-[1600px] mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-280px)]">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50">
                <th className="sticky left-0 z-[60] bg-slate-50 p-4 text-left text-[11px] font-semibold text-slate-500 uppercase border-b border-r border-slate-200 min-w-[160px]">Sales Order</th>
                <th className="sticky left-[160px] z-[60] bg-slate-50 p-4 text-left text-[11px] font-semibold text-slate-500 uppercase border-b border-r border-slate-200 min-w-[240px]">Item Description</th>
                {daysInMonth.map((date, i) => {
                  const isToday = date.toDateString() === today.toDateString();
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  const holiday = getHolidayData(date); // --- CEK LIBUR ---

                  return (
                    <th key={i} className={`p-2 border-b border-r border-slate-200 min-w-[100px] text-center transition-colors 
                      ${isToday ? 'bg-indigo-50/50' : ''} ${holiday ? 'bg-rose-50/50' : ''}`}>
                      <span className={`text-[10px] font-bold ${isWeekend || holiday ? 'text-rose-500' : 'text-slate-400'}`}>
                        {["MINGGU", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"][date.getDay()]}
                      </span>
                      <div className={`text-lg font-bold mt-0.5 ${isToday ? 'text-indigo-600' : (isWeekend || holiday ? 'text-rose-600' : 'text-slate-700')}`}>
                        {date.getDate()}
                      </div>
                      {holiday && (
                        <div className="text-[8px] text-rose-400 truncate px-1 uppercase font-bold" title={holiday.description}>
                          {holiday.description}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="text-sm">
              {tableData.length > 0 ? (
                tableData.map((row, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                    {row.isFirstItem && (
                      <td rowSpan={row.rowCount} className="sticky left-0 z-40 bg-white group-hover:bg-slate-50 p-4 border-r border-b border-slate-100 align-top transition-colors">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                          {row.so}
                        </div>
                      </td>
                    )}
                    <td className="sticky left-[160px] z-30 bg-white group-hover:bg-slate-50 p-4 border-r border-b border-slate-100 transition-colors">
                      <div className="text-xs font-bold text-indigo-600 mb-0.5">{row.itemCode}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 group-hover:text-slate-700">{row.description}</div>
                    </td>

                    {daysInMonth.map((date, i) => {
                      const dKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                      const data = row.dailyQty[dKey];
                      const hasData = data && data.total > 0;
                      const holiday = getHolidayData(date);

                      return (
                        <td key={i} className={`border-r border-b border-slate-50 p-1.5 transition-all 
                          ${hasData ? activeCat.light : ''} ${holiday ? 'bg-rose-50/20' : ''}`}>
                          {hasData ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between items-center px-1 text-[10px] font-mono font-medium text-slate-400">
                                <span className={data.s1 > 0 ? "text-slate-700 font-bold" : ""}>{data.s1}</span>
                                <span className={data.s2 > 0 ? "text-slate-700 font-bold" : ""}>{data.s2}</span>
                                <span className={data.s3 > 0 ? "text-slate-700 font-bold" : ""}>{data.s3}</span>
                              </div>
                              <div className={`text-[10px] font-bold text-center py-0.5 rounded-md ${activeCat.activeClass.split(' shadow')[0]}`}>
                                {data.total}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full w-full flex items-center justify-center opacity-[0.03] group-hover:opacity-[0.08]">
                              <ChevronRight size={12} className="rotate-45" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={daysInMonth.length + 2} className="py-20 text-center">
                    <div className="inline-flex flex-col items-center">
                      <div className="p-4 bg-slate-50 rounded-full mb-3">
                        <Search size={32} className="text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-medium italic">No schedule data found for this selection</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ... Footer Legend (tetap sama) ... */}
    </div>
  );
}