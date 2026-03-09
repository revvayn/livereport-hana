import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../api/api";
import { Search, Calendar, FilterX } from "lucide-react"; // Import icon untuk estetika modern

export default function PackingList() {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("so");
  const [selectedSO, setSelectedSO] = useState(null);
  const [items, setItems] = useState([]);
  
  // State baru untuk Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const [header, setHeader] = useState({
    soNo: "",
    soDate: "",
    customer: "",
    deliveryDate: "",
    productionDate: "",
  });

  /* ================= HELPERS ================= */
  const toInputDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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

  /* ================= API CALLS ================= */
  const fetchDemands = async () => {
    try {
      setLoading(true);
      const res = await api.get("/demand");
      setDemands(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  /* ================= FILTER LOGIC ================= */
  const filteredDemands = demands.filter((so) => {
    const matchesSearch = 
      so.so_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      so.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const deliveryDate = toInputDate(so.delivery_date);
    const matchesStart = !dateRange.start || deliveryDate >= dateRange.start;
    const matchesEnd = !dateRange.end || deliveryDate <= dateRange.end;

    return matchesSearch && matchesStart && matchesEnd;
  });

  const resetFilter = () => {
    setSearchTerm("");
    setDateRange({ start: "", end: "" });
  };

  /* ================= EVENT HANDLERS ================= */
  const handleShowDetail = async (so) => {
    try {
      setLoading(true);
      const resItems = await api.get(`/demand/${so.demand_id}/items`);
      const itemsData = resItems.data || [];

      setSelectedSO(so);
      setHeader({
        soNo: so.so_number,
        soDate: toInputDate(so.so_date),
        customer: so.customer_name,
        deliveryDate: toInputDate(so.delivery_date),
        productionDate: toInputDate(so.production_date),
      });

      const deliveryDate = so.delivery_date
        ? new Date(toInputDate(so.delivery_date) + "T00:00:00")
        : new Date();

      const mappedItems = itemsData.map((it) => {
        const parsedCalendar = it.production_schedule
          ? typeof it.production_schedule === "string"
            ? JSON.parse(it.production_schedule)
            : it.production_schedule
          : null;

        let calendarStart = it.calendarStart
          ? new Date(it.calendarStart + "T00:00:00")
          : addDays(deliveryDate, -13);

        return {
          itemId: it.id,
          itemCode: it.item_code,
          description: it.description,
          uom: it.uom || "PCS",
          qty: it.total_qty,
          pcs: it.pcs || it.total_pcs || 0,
          calendarStart: toInputDate(calendarStart),
          calendar: parsedCalendar || buildCalendar(calendarStart, 14),
        };
      });

      setItems(mappedItems);
      setView("detail");
    } catch (err) {
      Swal.fire("Error", "Gagal memuat detail", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = (itemIdx, dayIdx, shiftKey, value) => {
    const newItems = [...items];
    newItems[itemIdx].calendar[dayIdx].shifts[shiftKey].qty =
      value === "" ? 0 : Number(value);
    setItems(newItems);
  };

  const handleSaveSchedule = async () => {
    try {
      setLoading(true);
      await api.put(`/demand/${selectedSO.demand_id}`, { header, items });
      Swal.fire("Berhasil!", "Jadwal packing telah disimpan.", "success");
      fetchDemands();
      setView("so");
    } catch (error) {
      Swal.fire("Error", "Gagal menyimpan jadwal", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen font-sans">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest">
            {view === "so" ? "Packing Schedule" : `Edit Schedule: ${selectedSO?.so_number}`}
          </h2>
          {view === "detail" && (
            <button
              onClick={() => setView("so")}
              className="text-[10px] bg-gray-100 px-4 py-2 rounded font-bold text-gray-600 uppercase hover:bg-gray-200"
            >
              Kembali
            </button>
          )}

          {/* ── FILTER CONTROLS (Hanya muncul di List View) ── */}
          {view === "so" && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Input */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Cari SO atau Customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-48 font-semibold"
                />
              </div>

              {/* Date Filter */}
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-2 gap-1">
                <Calendar size={14} className="text-gray-400 mx-1" />
                <input 
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="bg-transparent py-2 text-[10px] font-bold text-gray-600 outline-none"
                />
                <span className="text-gray-300 px-1">-</span>
                <input 
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="bg-transparent py-2 text-[10px] font-bold text-gray-600 outline-none"
                />
              </div>

              {/* Reset Button */}
              {(searchTerm || dateRange.start || dateRange.end) && (
                <button 
                  onClick={resetFilter}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Reset Filter"
                >
                  <FilterX size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── LIST VIEW ── */}
        {view === "so" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-4 text-left">SO Number</th>
                  <th className="py-3 px-4 text-left">Customer</th>
                  <th className="py-3 px-4 text-center">SO Date</th>
                  <th className="py-3 px-4 text-center">Delivery Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDemands.length > 0 ? (
                  filteredDemands.map((so) => (
                    <tr key={so.demand_id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-4 px-4 font-bold text-emerald-700">{so.so_number}</td>
                      <td className="py-4 px-4">{so.customer_name}</td>
                      <td className="py-4 px-4 text-center font-mono text-gray-500">
                        {new Date(so.so_date).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-4 px-4 text-center font-mono font-bold text-emerald-600">
                        {new Date(so.delivery_date).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleShowDetail(so)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded text-[11px] font-bold transition-all"
                        >
                          Buka Jadwal
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-gray-400 text-xs italic">
                      Data tidak ditemukan...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── MATRIX DETAIL VIEW ── (Tetap sama sesuai permintaan) */}
        {view === "detail" && (
          <>
            {/* SUB-HEADER INFO */}
            <div className="grid grid-cols-4 gap-4 mb-6 bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
               <div>
                  <label className="block text-[8px] uppercase text-emerald-600 font-bold">SO Date</label>
                  <p className="text-sm font-bold">{new Date(selectedSO?.so_date).toLocaleDateString("id-ID")}</p>
               </div>
               <div>
                  <label className="block text-[8px] uppercase text-emerald-600 font-bold">Customer</label>
                  <p className="text-sm font-bold">{selectedSO?.customer_name}</p>
               </div>
               <div>
                  <label className="block text-[8px] uppercase text-emerald-600 font-bold">Delivery Date</label>
                  <p className="text-sm font-bold text-orange-600">{new Date(selectedSO?.delivery_date).toLocaleDateString("id-ID")}</p>
               </div>
               <div>
                  <label className="block text-[8px] uppercase text-emerald-600 font-bold">Status</label>
                  <p className="text-sm font-bold text-emerald-700">ACTIVE</p>
               </div>
            </div>

            <div className="overflow-x-auto border rounded-lg shadow-inner bg-gray-50 max-h-[75vh]">
              <table className="w-full text-[10px] border-collapse bg-white">
                <thead className="sticky top-0 z-30 shadow-sm">
                  <tr className="bg-emerald-600 text-white font-bold uppercase">
                    <th className="border-r border-emerald-500 p-2 sticky left-0 bg-emerald-600 z-40 min-w-[180px] text-left">
                      Item Info
                    </th>
                    <th className="border-r border-emerald-500 p-2 w-12 text-center bg-emerald-700">
                      UOM
                    </th>
                    <th className="border-r border-emerald-500 p-2 w-16 text-center bg-emerald-700">
                      QTY
                    </th>
                    <th className="border-r border-emerald-500 p-2 w-16 text-center bg-emerald-800">
                      PCS
                    </th>
                    <th className="border-r border-emerald-500 p-2 w-20 text-center bg-emerald-900">
                      Action
                    </th>
                    {items[0]?.calendar?.map((day, i) => (
                      <th key={i} colSpan="3" className="border-r border-emerald-500 p-1 text-center min-w-[100px]">
                        {new Date(day.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-emerald-50 text-[8px] text-emerald-800 font-bold">
                    <th className="border p-1 sticky left-0 bg-emerald-50 z-40"></th>
                    <th className="border"></th>
                    <th className="border"></th>
                    <th className="border"></th>
                    <th className="border"></th>
                    {items[0]?.calendar?.map((_, i) => (
                      <React.Fragment key={i}>
                        <th className="border py-1">S1</th>
                        <th className="border py-1">S2</th>
                        <th className="border py-1">S3</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const totalInput = item.calendar?.reduce(
                      (sum, day) =>
                        sum +
                        (Number(day.shifts.shift1.qty) || 0) +
                        (Number(day.shifts.shift2.qty) || 0) +
                        (Number(day.shifts.shift3.qty) || 0),
                      0
                    ) || 0;

                    const sisa = Number(item.pcs) - totalInput;

                    return (
                      <tr key={index} className="hover:bg-emerald-50/20 transition-colors">
                        <td className="border p-2 sticky left-0 bg-white z-20 shadow-md">
                          <div className="font-bold text-emerald-700">{item.itemCode}</div>
                          <div className="text-[8px] text-gray-400 truncate max-w-[160px]">{item.description}</div>
                          <div className={`text-[8px] font-black mt-1 ${sisa <= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {sisa <= 0 ? "PAS ✅" : `SISA: ${sisa} PCS`}
                          </div>
                        </td>
                        <td className="border text-center text-gray-500">{item.uom}</td>
                        <td className="border text-center font-mono text-emerald-600 bg-gray-50/50">
                          {item.qty}
                        </td>
                        <td className="border text-center font-bold bg-emerald-50/30 text-emerald-800">
                          {item.pcs}
                        </td>
                        <td className="border text-center">
                          <button
                            onClick={() => navigate(`/dashboard/production/kalender/${item.itemId}`)}
                            className="bg-emerald-100 hover:bg-emerald-500 hover:text-white text-emerald-700 px-2 py-1 rounded text-[9px] font-bold transition-all border border-emerald-200"
                          >
                            Jadwal
                          </button>
                        </td>
                        {item.calendar?.map((day, dIdx) =>
                          ["shift1", "shift2", "shift3"].map((s) => {
                            const qty = day.shifts[s].qty || 0;
                            return (
                              <td
                                key={`${dIdx}-${s}`}
                                className={`border p-0 text-center transition-all ${qty > 0 ? "bg-emerald-600 text-white" : "bg-white"}`}
                              >
                                <input
                                  type="number"
                                  value={qty || ""}
                                  onChange={(e) => handleQtyChange(index, dIdx, s, e.target.value)}
                                  className={`w-full h-8 text-center bg-transparent outline-none text-[10px] font-bold ${qty > 0 ? "placeholder-emerald-200" : "placeholder-gray-300"}`}
                                  placeholder="0"
                                />
                              </td>
                            );
                          })
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex justify-between items-center bg-white p-4 rounded-lg border border-emerald-200 shadow-sm">
              <div className="flex gap-6 text-[10px] font-bold uppercase tracking-tight">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-600 rounded"></div>
                  <span className="text-emerald-800">Aktifitas Packing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
                  <span className="text-gray-500">Kosong</span>
                </div>
              </div>
              <button
                onClick={handleSaveSchedule}
                className="bg-emerald-600 text-white px-10 py-2.5 rounded text-xs font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95"
              >
                Simpan Perubahan Jadwal
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}