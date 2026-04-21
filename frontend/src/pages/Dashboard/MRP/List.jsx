import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../api/api";
import * as XLSX from "xlsx";
import { Search, Calendar, FilterX, FileSpreadsheet } from "lucide-react";

export default function List() {
    const navigate = useNavigate();
    const [demands, setDemands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState("so");
    const [selectedSO, setSelectedSO] = useState(null);
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, dateRange]);

    const robustParse = (data) => {
        if (!data) return [];
        let parsed = data;
        try {
            while (typeof parsed === "string") {
                parsed = JSON.parse(parsed);
            }
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.warn("Parse Error:", e);
            return [];
        }
    };

    const toInputDate = (date) => {
        if (!date) return "";
        return new Date(date).toISOString().split("T")[0];
    };

    const addDays = (date, d) => {
        const n = new Date(date);
        n.setDate(n.getDate() + d);
        return n;
    };

    const buildCalendar = (startDate, days = 30) => {
        return Array.from({ length: days }, (_, i) => {
            const currentDate = addDays(startDate, i);
            return {
                date: toInputDate(currentDate),
                shifts: {
                    shift1: { qty: 0 },
                    shift2: { qty: 0 },
                    shift3: { qty: 0 },
                },
            };
        });
    };

    const fetchDemands = async () => {
        try {
            setLoading(true);
            const res = await api.get("/production");
            setDemands(res.data || []);
        } catch (err) {
            console.error("Fetch Error:", err);
            Swal.fire("Error", "Gagal mengambil data SO", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDemands();
    }, []);

    const handleShowDetail = async (so) => {
        try {
            setLoading(true);
            const targetId = so.id || so.demand_id;
            const res = await api.get(`/production/full-schedule/${targetId}`);
            const { header, items: allItems } = res.data;

            setSelectedSO(header);

            const deliveryDate = new Date(header.delivery_date);
            const startDate = addDays(deliveryDate, -29);
            const calendarTemplate = buildCalendar(startDate, 30);

            const mappedItems = allItems.map((it) => {
                const dbSchedule = robustParse(it.production_schedule);

                const synchronizedCalendar = calendarTemplate.map((slot) => {
                    const found = dbSchedule.find(d => d.date === slot.date);
                    return {
                        date: slot.date,
                        shifts: {
                            shift1: { qty: Number(found?.shifts?.shift1?.qty || 0) },
                            shift2: { qty: Number(found?.shifts?.shift2?.qty || 0) },
                            shift3: { qty: Number(found?.shifts?.shift3?.qty || 0) },
                        }
                    };
                });

                return {
                    ...it,
                    itemCode: it.item_code || it.itemCode,
                    calendar: synchronizedCalendar
                };
            });

            setItems(mappedItems);
            setView("detail");
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Gagal sinkronisasi data matriks", "error");
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (items.length === 0) return;

        const headerRow1 = ["Stage", "Item Code", "Description", "Target PCS"];
        const headerRow2 = ["", "", "", ""]; 

        items[0].calendar.forEach(day => {
            const d = new Date(day.date);
            const dateLabel = `${d.getDate()}/${d.getMonth() + 1}`;
            headerRow1.push(dateLabel, "", "");
            headerRow2.push("S3", "S1", "S2");
        });

        const excelData = items.map(item => {
            const rowData = [
                item.category || "-",
                item.itemCode || "-",
                item.description || "-",
                item.pcs || 0
            ];

            item.calendar.forEach(day => {
                rowData.push(
                    Number(day.shifts.shift1?.qty) || 0,
                    Number(day.shifts.shift2?.qty) || 0,
                    Number(day.shifts.shift3?.qty) || 0
                );
            });

            return rowData;
        });

        const worksheet = XLSX.utils.aoa_to_sheet([
            [`SALES ORDER: ${selectedSO?.so_number}`],
            [`Customer: ${selectedSO?.customer_name} | Delivery: ${new Date(selectedSO?.delivery_date).toLocaleDateString()}`],
            [],
            headerRow1,
            headerRow2,
            ...excelData
        ]);

        const merges = [];
        let currentCol = 4;
        items[0].calendar.forEach(() => {
            merges.push({
                s: { r: 3, c: currentCol }, 
                e: { r: 3, c: currentCol + 2 } 
            });
            currentCol += 3;
        });
        worksheet["!merges"] = merges;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Production_Schedule");
        XLSX.writeFile(workbook, `Matrix_${selectedSO?.so_number}_Detailed.xlsx`);
    };

    const filteredDemands = demands.filter((so) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = (so.so_number?.toLowerCase().includes(search)) || (so.customer_name?.toLowerCase().includes(search));
        const deliveryStr = toInputDate(so.delivery_date);
        const matchesStart = !dateRange.start || deliveryStr >= dateRange.start;
        const matchesEnd = !dateRange.end || deliveryStr <= dateRange.end;
        return matchesSearch && matchesStart && matchesEnd;
    });

    // LOGIKA PAGINATION YANG DIPERBAIKI
    const totalPages = Math.ceil(filteredDemands.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDemands = filteredDemands.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="p-6 bg-[#f8f9fa] min-h-screen font-sans">
            {loading && (
                <div className="fixed inset-0 bg-black/20 z-[9999] flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-bold text-emerald-600">Memproses Data...</span>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                        {view === "so" ? "Production Control Center" : `Matrix System: ${selectedSO?.so_number}`}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2">
                        {view === "so" ? (
                            <>
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari SO atau Customer..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-4 py-2 text-[11px] border border-gray-200 rounded-lg w-64 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 gap-1">
                                    <Calendar size={14} className="text-gray-400" />
                                    <input type="date" className="bg-transparent py-2 text-[10px] font-bold outline-none" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
                                    <span className="text-gray-300">-</span>
                                    <input type="date" className="bg-transparent py-2 text-[10px] font-bold outline-none" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
                                </div>
                                {(searchTerm || dateRange.start) && (
                                    <button onClick={() => { setSearchTerm(""); setDateRange({ start: "", end: "" }) }} className="bg-red-50 text-red-500 p-2 hover:bg-red-100 rounded-lg transition-colors"><FilterX size={16} /></button>
                                )}
                            </>
                        ) : (
                            <>
                                <button onClick={exportToExcel} className="flex items-center gap-2 text-[10px] bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 shadow-sm transition-all">
                                    <FileSpreadsheet size={14} /> EXPORT EXCEL
                                </button>
                                <button onClick={() => setView("so")} className="text-[10px] bg-gray-100 px-4 py-2 rounded-lg font-bold text-gray-600 uppercase hover:bg-gray-200 transition-all">Kembali</button>
                            </>
                        )}
                    </div>
                </div>

                {view === "so" ? (
                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider">
                                <tr>
                                    <th className="py-4 px-6 text-left">SO Number</th>
                                    <th className="py-4 px-6 text-left">Customer</th>
                                    <th className="py-4 px-6 text-center">Delivery Date</th>
                                    <th className="py-4 px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {currentDemands.length > 0 ? (
                                    currentDemands.map((so) => (
                                        <tr key={so.id} className="hover:bg-emerald-50/40 transition-colors group">
                                            <td className="py-4 px-6 font-bold text-emerald-700">{so.so_number}</td>
                                            <td className="py-4 px-6 text-gray-600 font-medium">{so.customer_name}</td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-mono font-bold text-[11px]">
                                                    {new Date(so.delivery_date).toLocaleDateString("id-ID")}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button onClick={() => handleShowDetail(so)} className="bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm">
                                                    Buka Jadwal
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-10 text-center text-gray-400">Data tidak ditemukan</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* PAGINATION CONTROLS DI DALAM VIEW SO */}
                        {filteredDemands.length > itemsPerPage && (
                            <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-50">
                                <div className="text-[11px] text-gray-500 font-medium">
                                    Menampilkan <span className="text-emerald-600">{indexOfFirstItem + 1}</span> - <span className="text-emerald-600">{Math.min(indexOfLastItem, filteredDemands.length)}</span> dari <span className="text-emerald-600">{filteredDemands.length}</span> SO
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 text-[11px] font-bold border rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    >
                                        Prev
                                    </button>

                                    {[...Array(totalPages)].map((_, i) => {
                                        const pageNum = i + 1;
                                        if (totalPages > 5 && Math.abs(pageNum - currentPage) > 1 && pageNum !== 1 && pageNum !== totalPages) {
                                            if (pageNum === 2 || pageNum === totalPages - 1) return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                                            return null;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${currentPage === pageNum
                                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                                                    : "border hover:bg-emerald-50 text-gray-600"
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 text-[11px] font-bold border rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-emerald-50/50 p-5 rounded-xl border border-emerald-100">
                            <div><label className="block text-[9px] font-black text-emerald-600 uppercase mb-1">Customer</label><p className="text-sm font-bold text-slate-800">{selectedSO?.customer_name}</p></div>
                            <div><label className="block text-[9px] font-black text-emerald-600 uppercase mb-1">SO Number</label><p className="text-sm font-bold text-slate-800">{selectedSO?.so_number}</p></div>
                            <div><label className="block text-[9px] font-black text-emerald-600 uppercase mb-1">Delivery Target</label><p className="text-sm font-bold text-orange-600">{new Date(selectedSO?.delivery_date).toLocaleDateString("id-ID", { dateStyle: 'full' })}</p></div>
                            <div className="flex items-center justify-end"><span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black border border-emerald-200">READ ONLY MODE</span></div>
                        </div>

                        <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-inner bg-white max-h-[65vh]">
                            <table className="w-full text-[10px] border-separate border-spacing-0">
                                <thead className="sticky top-0 z-50">
                                    <tr className="bg-slate-800 text-white font-bold uppercase">
                                        <th className="border-r border-slate-700 p-3 sticky left-0 bg-slate-800 z-50 min-w-[100px]">Stage</th>
                                        <th className="border-r border-slate-700 p-3 sticky left-[100px] bg-slate-800 z-50 min-w-[120px]">Item Code</th>
                                        <th className="border-r border-slate-700 p-3 sticky left-[220px] bg-slate-800 z-50 min-w-[200px]">Description</th>
                                        <th className="border-r border-slate-700 p-3 text-center bg-slate-900 sticky left-[420px] z-50 w-20">Target</th>

                                        {items[0]?.calendar?.map((day, i) => {
                                            const isLastDay = i === items[0].calendar.length - 1;
                                            return (
                                                <th key={i} colSpan="3" className={`border-r border-slate-700 p-2 text-center min-w-[120px] ${isLastDay ? 'bg-red-600' : 'bg-slate-700'}`}>
                                                    <div className="text-[10px]">{new Date(day.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}</div>
                                                    {isLastDay && <span className="text-[8px] block mt-1 bg-white/20 rounded">DELIVERY</span>}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                    <tr className="bg-slate-600 text-[8px] text-slate-300">
                                        <th className="sticky left-0 bg-slate-600 border-r border-slate-500 z-50 h-6"></th>
                                        <th className="sticky left-[100px] bg-slate-600 border-r border-slate-500 z-50"></th>
                                        <th className="sticky left-[220px] bg-slate-600 border-r border-slate-500 z-50"></th>
                                        <th className="sticky left-[420px] bg-slate-600 border-r border-slate-500 z-50"></th>
                                        {items[0]?.calendar?.map((_, i) => (
                                            <React.Fragment key={i}>
                                                <th className="border-r border-slate-500 bg-slate-700/50">S3</th>
                                                <th className="border-r border-slate-500 bg-slate-700/50">S1</th>
                                                <th className="border-r border-slate-500 bg-slate-700/50">S2</th>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {items.map((item, index) => (
                                        <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                                            <td className={`border-r p-3 sticky left-0 z-40 font-black text-center text-[9px]
                                                ${item.category === 'Packing' ? 'bg-blue-50 text-blue-700' :
                                                    item.category === 'Finishing' ? 'bg-orange-50 text-orange-700' : 'bg-purple-50 text-purple-700'}`}>
                                                {item.category}
                                            </td>
                                            <td className="border-r p-3 sticky left-[100px] bg-white z-40 font-bold text-slate-700 uppercase">{item.itemCode}</td>
                                            <td className="border-r p-3 sticky left-[220px] bg-white z-40 text-gray-500 truncate max-w-[200px]">{item.description}</td>
                                            <td className="border-r text-center font-black bg-gray-50 sticky left-[420px] z-40 text-slate-800">{item.pcs}</td>

                                            {item.calendar?.map((day, dIdx) => {
                                                const isLastDay = dIdx === item.calendar.length - 1;
                                                return ["shift1", "shift2", "shift3"].map((s) => {
                                                    const qty = Number(day.shifts[s].qty) || 0;
                                                    return (
                                                        <td key={`${dIdx}-${s}`} className={`border-r p-0 text-center ${isLastDay ? "bg-red-50/30" : ""}`}>
                                                            <div className={`w-full h-10 flex items-center justify-center font-bold transition-all
                                                                ${qty > 0 ? "bg-emerald-500 text-white shadow-inner scale-[0.9] rounded" : "text-gray-300"}`}>
                                                                {qty > 0 ? qty : "-"}
                                                            </div>
                                                        </td>
                                                    );
                                                });
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}