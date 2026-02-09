import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../../api/api";

export default function DemandList() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Navigasi
  const [view, setView] = useState("so"); // "so" atau "detail"
  const [selectedSO, setSelectedSO] = useState(null);
  const [soItems, setSoItems] = useState([]);

  const fetchDemands = async () => {
    try {
      setLoading(true);
      const res = await api.get("/demand");
      setDemands(res.data);
    } catch (err) {
      Swal.fire("Error", "Gagal load data", "error");
    } finally { setLoading(false); }
  };

  const handleShowDetail = async (so) => {
    try {
      const res = await api.get(`/demand/${so.demand_id}/items`);
      setSoItems(res.data);
      setSelectedSO(so);
      setView("detail");
    } catch (err) {
      Swal.fire("Error", "Gagal ambil detail", "error");
    }
  };

  useEffect(() => { fetchDemands(); }, []);

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

        {/* HEADER / BREADCRUMB */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm font-bold">
            <button
              onClick={() => setView("so")}
              className={view === "so" ? "text-indigo-600" : "text-gray-400"}
            >
              DEMAND LIST
            </button>
            {view === "detail" && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-indigo-600 uppercase">Detail: {selectedSO?.reference_no}</span>
              </>
            )}
          </div>
          {view === "detail" && (
            <button
              onClick={() => setView("so")}
              className="text-xs bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 font-bold text-gray-600"
            >
              KEMBALI
            </button>
          )}
        </div>

        {/* --- TAMPILAN 1: DAFTAR SALES ORDER --- */}
        {view === "so" && (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="text-gray-400 border-b uppercase text-[11px] text-left">
          <th className="pb-3">SO Number</th>
          {/* Tambahkan Header SO Date */}
          <th className="pb-3">SO Date</th>
          <th className="pb-3">Customer</th>
          <th className="pb-3 text-center">Items</th>
          <th className="pb-3 text-center">Prod. Date</th>
          <th className="pb-3 text-center">Deliv. Date</th>
          <th className="pb-3 text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {demands.map((so) => (
          <tr key={so.demand_id} className="hover:bg-gray-50/50">
            <td className="py-4 font-bold text-indigo-600">{so.reference_no}</td>
            
            {/* Kolom SO Date */}
            <td className="py-4 text-gray-500">
              {so.so_date 
                ? new Date(so.so_date).toLocaleDateString("id-ID") 
                : "-"}
            </td>

            <td className="py-4 text-gray-600">{so.customer_name}</td>
            
            <td className="py-4 text-center">
              <span className="bg-gray-100 px-2 py-0.5 rounded-full font-bold">
                {so.total_items}
              </span>
            </td>

            {/* Kolom Production Date */}
            <td className="py-4 text-center text-gray-500 font-medium">
              {so.production_date 
                ? new Date(so.production_date).toLocaleDateString("id-ID") 
                : "-"}
            </td>

            {/* Kolom Delivery Date */}
            <td className="py-4 text-center text-gray-500">
              {new Date(so.delivery_date).toLocaleDateString("id-ID")}
            </td>

            <td className="py-4 text-right">
              <button 
                onClick={() => handleShowDetail(so)}
                className="bg-indigo-600 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-indigo-700 shadow-sm transition-all"
              >
                View Detail
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

        {/* --- TAMPILAN 2: DETAIL MATRIX (SEMUA ITEM JADI SATU) --- */}
        {view === "detail" && (
          <div className="animate-in fade-in duration-300">
            <div className="overflow-x-auto border rounded-lg shadow-inner bg-gray-50">
              <table className="w-full text-[10px] border-collapse bg-white">
                <thead>
                  {/* BARIS 1: TANGGAL */}
                  <tr className="bg-gray-100 text-gray-600 font-bold">
                    <th className="border p-2 sticky left-0 bg-gray-100 z-20 min-w-[120px]">Item Code</th>
                    <th className="border p-2 w-16 text-center bg-gray-100">Total</th>
                    {soItems[0]?.production_schedule.map((day, i) => (
                      <th key={i} className="border p-1 text-center min-w-[100px]" colSpan="3">
                        {new Date(day.date).toLocaleDateString("id-ID", { day: '2-digit', month: 'short' })}
                      </th>
                    ))}
                  </tr>
                  {/* BARIS 2: SHIFT */}
                  <tr className="bg-gray-50 text-[8px] text-gray-400">
                    <th className="border p-1 sticky left-0 bg-gray-50 z-20"></th>
                    <th className="border p-1"></th>
                    {soItems[0]?.production_schedule.map((_, i) => (
                      <React.Fragment key={i}>
                        <th className="border p-1">S1</th>
                        <th className="border p-1">S2</th>
                        <th className="border p-1">S3</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {soItems.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/50">
                      {/* Kolom Item Code Sticky agar tidak hilang saat scroll ke kanan */}
                      <td className="border p-2 font-bold sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        {item.item_code}
                      </td>
                      <td className="border p-2 text-center font-bold text-gray-600 bg-gray-50">
                        {item.total_qty}
                      </td>
                      {/* Mapping Jadwal per Item */}
                      {item.production_schedule.map((day, dIdx) => (
                        <React.Fragment key={dIdx}>
                          {["shift1", "shift2", "shift3"].map((s) => (
                            <td
                              key={s}
                              className={`border p-1 text-center font-bold ${day.shifts[s].active
                                  ? 'bg-emerald-500 text-white shadow-inner'
                                  : 'text-gray-300'
                                }`}
                            >
                              {day.shifts[s].active ? day.shifts[s].qty : "-"}
                            </td>
                          ))}
                        </React.Fragment>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded text-[10px] text-blue-700 flex gap-4">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded"></div> Packing Schedule</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-white border border-gray-300 rounded"></div> No Schedule</div>
              <div className="ml-auto font-bold uppercase">S1/S2/S3 = Shift 1/2/3</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}