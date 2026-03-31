import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../api/api";
import { Search, Calendar, FilterX } from "lucide-react";

export default function List() {
    const navigate = useNavigate();
    const [demands, setDemands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState("so");
    const [selectedSO, setSelectedSO] = useState(null);
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });

    // Helper untuk membersihkan JSON string yang double-quoted
    const robustParse = (data) => {
        if (!data) return null;
        let parsed = data;
        try {
            while (typeof parsed === "string") {
                parsed = JSON.parse(parsed);
            }
            return parsed;
        } catch (e) {
            return null;
        }
    };

    const toInputDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().split("T")[0];
    };

    const addDays = (date, d) => {
        const n = new Date(date);
        n.setDate(n.getDate() + d);
        return n;
    };

    const buildCalendar = (startDate, days = 14) => {
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
            // Sesuaikan dengan route backend: router.get("/", productionController.getDemands)
            const res = await api.get("/production"); 
            setDemands(res.data || []);
        } catch (err) {
            console.error("Fetch Error:", err);
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
            // SESUAIKAN ENDPOINT: /production/full-schedule/:id
            const targetId = so.id || so.demand_id;
            const res = await api.get(`/production/full-schedule/${targetId}`);
            const { header, items: allItems } = res.data;

            setSelectedSO(header);
            
            // Tentukan anchor date (H-13 dari delivery date)
            const deliveryDate = new Date(header.delivery_date);

            const mappedItems = allItems.map((it) => {
                const rawSchedule = robustParse(it.production_schedule);
                
                // 1. Tentukan tanggal patokan (misal 7 hari sebelum delivery atau rentang tetap)
                // Kita buat template 14 hari yang seragam untuk SEMUA baris
                const deliveryDate = new Date(header.delivery_date);
                const calendarTemplate = buildCalendar(addDays(deliveryDate, -13), 14);
              
                // 2. Sinkronisasi data DB ke Template
                const synchronizedCalendar = calendarTemplate.map((slot) => {
                  // CARI data yang tanggalnya cocok dengan slot kolom ini
                  const matchingData = Array.isArray(rawSchedule) 
                    ? rawSchedule.find(d => d.date === slot.date)
                    : null;
              
                  if (matchingData) {
                    return {
                      ...slot,
                      shifts: matchingData.shifts // Gunakan shift dari DB jika tanggal cocok
                    };
                  }
                  return slot; // Tetap 0 jika tidak ada data untuk tanggal tersebut
                });
              
                return {
                  ...it,
                  calendar: synchronizedCalendar
                };
              });

            setItems(mappedItems);
            setView("detail");
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Gagal memuat data matriks", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleQtyChange = (itemIdx, dayIdx, shiftKey, value) => {
        const newItems = [...items];
        newItems[itemIdx].calendar[dayIdx].shifts[shiftKey].qty = value === "" ? 0 : Number(value);
        setItems(newItems);
    };

    const handleSaveSchedule = async () => {
        try {
            setLoading(true);
            // Kirim ke endpoint update (Pastikan backend menghandle loop update per category)
            await api.put(`/production/full-update/${selectedSO.id}`, { items });
            
            Swal.fire("Berhasil!", "Semua jadwal lintas divisi telah diperbarui.", "success");
            fetchDemands();
            setView("so");
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Gagal menyimpan perubahan", "error");
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredDemands = demands.filter((so) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = 
            (so.so_number?.toLowerCase().includes(search)) || 
            (so.customer_name?.toLowerCase().includes(search));
        
        const deliveryStr = toInputDate(so.delivery_date);
        const matchesStart = !dateRange.start || deliveryStr >= dateRange.start;
        const matchesEnd = !dateRange.end || deliveryStr <= dateRange.end;

        return matchesSearch && matchesStart && matchesEnd;
    });

    return (
        <div className="p-6 bg-[#f8f9fa] min-h-screen font-sans">
            {loading && (
                <div className="fixed inset-0 bg-black/10 z-[999] flex items-center justify-center">
                    <div className="bg-white p-4 rounded-lg shadow-xl font-bold text-emerald-600 animate-pulse">Memproses...</div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest">
                        {view === "so" ? "Production Control Center" : `Matrix System: ${selectedSO?.so_number}`}
                    </h2>
                    
                    {view === "so" ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari SO..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 text-[11px] border border-gray-200 rounded-md w-48 font-semibold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                />
                            </div>
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-2 gap-1">
                                <Calendar size={14} className="text-gray-400" />
                                <input type="date" className="bg-transparent py-2 text-[10px] font-bold outline-none" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})}/>
                                <span className="text-gray-300">-</span>
                                <input type="date" className="bg-transparent py-2 text-[10px] font-bold outline-none" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})}/>
                            </div>
                            {(searchTerm || dateRange.start) && (
                                <button onClick={() => {setSearchTerm(""); setDateRange({start:"", end:""})}} className="text-red-500 p-2 hover:bg-red-50 rounded-md"><FilterX size={16}/></button>
                            )}
                        </div>
                    ) : (
                        <button onClick={() => setView("so")} className="text-[10px] bg-gray-100 px-4 py-2 rounded font-bold text-gray-600 uppercase hover:bg-gray-200">Kembali</button>
                    )}
                </div>

                {view === "so" ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase">
                                <tr>
                                    <th className="py-3 px-4 text-left">SO Number</th>
                                    <th className="py-3 px-4 text-left">Customer</th>
                                    <th className="py-3 px-4 text-center">Delivery Date</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredDemands.map((so) => (
                                    <tr key={so.id} className="hover:bg-emerald-50/30 transition-colors">
                                        <td className="py-4 px-4 font-bold text-emerald-700">{so.so_number}</td>
                                        <td className="py-4 px-4">{so.customer_name}</td>
                                        <td className="py-4 px-4 text-center font-mono font-bold text-orange-600">
                                            {new Date(so.delivery_date).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <button onClick={() => handleShowDetail(so)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded text-[11px] font-bold">Buka Matriks</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Detail SO Header Card */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                            <div><label className="block text-[8px] font-black text-emerald-600">CUSTOMER</label><p className="text-sm font-bold">{selectedSO?.customer_name}</p></div>
                            <div><label className="block text-[8px] font-black text-emerald-600">SO NO</label><p className="text-sm font-bold">{selectedSO?.so_number}</p></div>
                            <div><label className="block text-[8px] font-black text-emerald-600">DELIVERY DATE</label><p className="text-sm font-bold text-orange-600">{new Date(selectedSO?.delivery_date).toLocaleDateString("id-ID")}</p></div>
                            <div className="flex items-end justify-end"><span className="px-3 py-1 bg-emerald-200 text-emerald-800 rounded-full text-[10px] font-black">FULL ACCESS</span></div>
                        </div>

                        {/* Production Matrix */}
                        <div className="overflow-x-auto border rounded-lg shadow-inner bg-white max-h-[65vh]">
                            <table className="w-full text-[10px] border-collapse">
                                <thead className="sticky top-0 z-30 shadow-sm">
                                    <tr className="bg-slate-800 text-white font-bold uppercase">
                                        <th className="border-r border-slate-700 p-2 sticky left-0 bg-slate-800 z-40 min-w-[100px]">Stage</th>
                                        <th className="border-r border-slate-700 p-2 sticky left-[100px] bg-slate-800 z-40 min-w-[180px]">Item Description</th>
                                        <th className="border-r border-slate-700 p-2 w-16 text-center">Target PCS</th>
                                        {items[0]?.calendar?.map((day, i) => (
                                            <th key={i} colSpan="3" className="border-r border-slate-700 p-1 text-center min-w-[90px] bg-slate-700">
                                                {new Date(day.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                                            </th>
                                        ))}
                                    </tr>
                                    <tr className="bg-slate-600 text-[8px] text-slate-300 uppercase">
                                        <th className="sticky left-0 bg-slate-600"></th>
                                        <th className="sticky left-[100px] bg-slate-600"></th>
                                        <th></th>
                                        {items[0]?.calendar?.map((_, i) => (
                                            <React.Fragment key={i}>
                                                <th className="border-r border-slate-500">S1</th>
                                                <th className="border-r border-slate-500">S2</th>
                                                <th className="border-r border-slate-500">S3</th>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className={`border p-2 sticky left-0 z-20 font-black text-center ${
                                                item.category === 'Packing' ? 'bg-blue-50 text-blue-700' :
                                                item.category === 'Finishing' ? 'bg-orange-50 text-orange-700' : 'bg-purple-50 text-purple-700'
                                            }`}>
                                                {item.category}
                                            </td>
                                            <td className="border p-2 sticky left-[100px] bg-white z-20 shadow-md">
                                                <div className="font-bold text-gray-800 truncate w-40">{item.itemCode}</div>
                                                <div className="text-[8px] text-gray-400 truncate w-40">{item.description}</div>
                                            </td>
                                            <td className="border text-center font-bold bg-gray-50">{item.pcs}</td>
                                            {item.calendar?.map((day, dIdx) =>
                                                ["shift1", "shift2", "shift3"].map((s) => (
                                                    <td key={`${dIdx}-${s}`} className={`border p-0 text-center transition-colors ${day.shifts[s].qty > 0 ? "bg-emerald-500" : ""}`}>
                                                        <input
                                                            type="number"
                                                            value={day.shifts[s].qty || ""}
                                                            onChange={(e) => handleQtyChange(index, dIdx, s, e.target.value)}
                                                            className={`w-full h-8 text-center bg-transparent outline-none text-[10px] font-bold ${day.shifts[s].qty > 0 ? "text-white" : "text-gray-600"}`}
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                ))
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleSaveSchedule}
                                className="bg-emerald-600 text-white px-8 py-3 rounded-lg text-xs font-black hover:bg-emerald-700 shadow-lg transition-transform active:scale-95"
                            >
                                SIMPAN PERUBAHAN MATRIX JADWAL
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}