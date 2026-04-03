import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Calendar as CalendarIcon, Package, Zap, Wrench, Loader2, Search, ChevronRight } from "lucide-react";
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

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const [resProd, resFin, resAssy] = await Promise.all([
        axios.get(`/api/production/all/schedule`),
        axios.get(`/api/production/finishing-all`),
        axios.get(`/api/production/assembly-all`)
      ]);

      setRawData({
        packing: resProd.data.production_schedule || [],
        finishing: resFin.data.finishing_schedule || [],
        assembly: resAssy.data.assembly_schedule || []
      });
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSchedule(); }, [fetchSchedule]);

  const daysInMonth = useMemo(() => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [month, year]);

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
          so,
          itemCode: code,
          description: grouped[so][code].description,
          dailyQty: grouped[so][code].dailyQty,
          isFirstItem: index === 0,
          rowCount: filteredItems.length
        });
      });
    });
    return flatData;
  }, [rawData, activeTab, searchTerm, month, year]);

  const activeCat = CATEGORIES.find(c => c.id === activeTab);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 font-sans text-slate-900">
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
            {/* Minimalist Tab Switcher */}
            <div className="bg-white border border-slate-200 p-1 rounded-xl flex shadow-sm">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    activeTab === cat.id ? cat.activeClass : "text-slate-500 hover:text-slate-800"
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
            type="text"
            placeholder="Search Sales Order or Items..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            value={month} 
            onChange={(e) => setMonth(parseInt(e.target.value))} 
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none shadow-sm cursor-pointer hover:bg-slate-50"
          >
            {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select 
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))} 
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none shadow-sm cursor-pointer hover:bg-slate-50"
          >
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
                <th className="sticky left-0 z-[60] bg-slate-50 p-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-r border-slate-200 min-w-[160px]">Sales Order</th>
                <th className="sticky left-[160px] z-[60] bg-slate-50 p-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-r border-slate-200 min-w-[240px]">Item Description</th>
                {daysInMonth.map((date, i) => {
                  const isToday = date.toDateString() === today.toDateString();
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  return (
                    <th key={i} className={`p-2 border-b border-r border-slate-200 min-w-[100px] text-center transition-colors ${isToday ? 'bg-indigo-50/50' : ''}`}>
                      <span className={`text-[10px] font-bold ${isWeekend ? 'text-rose-400' : 'text-slate-400'}`}>
                      {["MINGGU", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"][date.getDay()]}
                      </span>
                      <div className={`text-lg font-bold mt-0.5 ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>
                        {date.getDate()}
                      </div>
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
                      <td 
                        rowSpan={row.rowCount} 
                        className="sticky left-0 z-40 bg-white group-hover:bg-slate-50 p-4 border-r border-b border-slate-100 align-top transition-colors"
                      >
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

                      return (
                        <td key={i} className={`border-r border-b border-slate-50 p-1.5 transition-all ${hasData ? activeCat.light : ''}`}>
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

      {/* Footer / Legend */}
      <div className="max-w-[1600px] mx-auto mt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-200"></span>
            <span>No Activity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${activeCat.activeClass.split(' ')[0]}`}></span>
            <span>Planned {activeCat.label}</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-200" />
          <div className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
            SHIFT FORMAT: S1 | S2 | S3
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-70 italic">
          Tip: Use Shift + Mousewheel to scroll horizontally through the dates.
        </div>
      </div>
    </div>
  );
}