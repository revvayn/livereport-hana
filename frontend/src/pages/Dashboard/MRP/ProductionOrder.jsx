import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../../api/api";

export default function ProductionOrder() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("so"); // 'so' atau 'detail'
  const [activeTab, setActiveTab] = useState("matrix");

  const [selectedSO, setSelectedSO] = useState(null);
  const [soItems, setSoItems] = useState([]);
  const [bomData, setBomData] = useState({});

  useEffect(() => {
    fetchDemands();
  }, []);

  const fetchDemands = async () => {
    try {
      setLoading(true);
      const res = await api.get("/demand");
      setDemands(res.data);
    } catch (err) {
      console.error("Fetch Demands Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetail = async (so) => {
    try {
      setLoading(true);
      const resItems = await api.get(`/demand/${so.demand_id}/items`);
      const resBOM = await api.get(`/bom-calculation/${so.demand_id}/bom-calc`);

      console.log("Debug BOM Data:", resBOM.data); // Cek apakah required_qty dari server sudah sama semua atau beda

      setSoItems(resItems.data);
      setBomData(resBOM.data || {});
      setSelectedSO(so);
      setView("detail");
    } catch (err) {
      console.error("Detail Error:", err);
      const msg = err.response?.data?.error || "Gagal memuat detail";
      Swal.fire("Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

        {/* HEADER & NAVIGATION */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm font-bold">
            <button
              onClick={() => setView("so")}
              className={view === "so" ? "text-indigo-600" : "text-gray-400 hover:text-gray-600 transition-colors"}
            >
              DEMAND LIST
            </button>
            {view === "detail" && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-indigo-600 uppercase tracking-tight">Detail: {selectedSO?.reference_no}</span>
              </>
            )}
          </div>

          {view === "detail" && (
            <div className="flex gap-2 items-center">
              <div className="flex bg-gray-100 p-0.5 rounded-md mr-2">
                <button
                  className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${activeTab === 'matrix' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('matrix')}
                >
                  MATRIX JADWAL
                </button>
                <button
                  className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${activeTab === 'bom' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('bom')}
                >
                  KEBUTUHAN MATERIAL (BOM)
                </button>
              </div>
              <button
                onClick={() => setView("so")}
                className="text-[10px] bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 font-bold text-gray-600 uppercase"
              >
                Kembali
              </button>
            </div>
          )}
        </div>

        {/* --- VIEW 1: DAFTAR SO --- */}
        {view === "so" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b uppercase text-[11px] text-left font-semibold">
                  <th className="pb-3">SO Number</th>
                  <th className="pb-3">SO Date</th>
                  <th className="pb-3">Customer</th> {/* Kolom Customer Ditambahkan */}
                  <th className="pb-3 text-center">Items</th>
                  <th className="pb-3 text-center">Prod. Date</th>
                  <th className="pb-3 text-center">Deliv. Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {demands.map((so) => (
                  <tr key={so.demand_id} className="hover:bg-gray-50/50 group transition-colors">
                    <td className="py-4 font-bold text-indigo-600">{so.reference_no}</td>
                    <td className="py-4 text-gray-500 text-xs">
                      {so.so_date ? new Date(so.so_date).toLocaleDateString("id-ID") : "-"}
                    </td>
                    {/* Menampilkan Nama Customer */}
                    <td className="py-4 text-gray-600 font-medium">
                      {so.customer_name || "N/A"}
                    </td>
                    <td className="py-4 text-center">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        {so.total_items} Items
                      </span>
                    </td>
                    <td className="py-4 text-center text-gray-500 text-xs">
                      {so.production_date ? new Date(so.production_date).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="py-4 text-center text-gray-500 text-xs">
                      {new Date(so.delivery_date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleShowDetail(so)}
                        className="bg-indigo-600 text-white px-3 py-1.5 rounded text-[10px] font-bold hover:bg-indigo-700 transition-all shadow-sm"
                      >
                        VIEW DETAIL
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {demands.length === 0 && !loading && (
              <div className="text-center py-10 text-gray-400 text-xs italic">
                Tidak ada data demand yang tersedia.
              </div>
            )}
          </div>
        )}

        {/* --- VIEW 2: DETAIL (MATRIX & BOM) --- */}
        {view === "detail" && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">

            {/* TAB 1: MATRIX JADWAL */}
            {activeTab === 'matrix' && (
              <div className="overflow-x-auto border rounded-lg shadow-inner bg-gray-50">
                <table className="w-full text-[10px] border-collapse bg-white">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 font-bold uppercase">
                      <th className="border p-2 sticky left-0 bg-gray-100 z-20 min-w-[120px] text-left">Item Code</th>
                      <th className="border p-2 min-w-[150px] text-left">Description</th>
                      <th className="border p-2 w-12 text-center">UoM</th>
                      <th className="border p-2 w-16 text-center">Qty (m3)</th>
                      <th className="border p-2 w-16 text-center bg-indigo-50 text-indigo-700">Pcs</th>
                      {soItems[0]?.production_schedule?.map((day, i) => (
                        <th key={i} className="border p-1 text-center min-w-[90px]" colSpan="3">
                          {new Date(day.date).toLocaleDateString("id-ID", { day: '2-digit', month: 'short' })}
                        </th>
                      ))}
                    </tr>
                    <tr className="bg-gray-50 text-[8px] text-gray-400">
                      <th className="border p-1 sticky left-0 bg-gray-50 z-20"></th>
                      <th className="border p-1"></th><th className="border p-1"></th><th className="border p-1"></th>
                      <th className="border p-1 bg-indigo-50/30"></th>
                      {soItems[0]?.production_schedule?.map((_, i) => (
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
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="border p-2 font-bold sticky left-0 bg-white z-10 text-indigo-700">
                          {item.item_code}
                        </td>
                        <td className="border p-2 text-gray-600 italic">{item.description || "-"}</td>
                        <td className="border p-2 text-center text-gray-500 uppercase">{item.uom || "PCS"}</td>
                        <td className="border p-2 text-center font-bold text-gray-900 bg-gray-50/50">{item.total_qty}</td>
                        <td className="border p-2 text-center font-black text-indigo-600 bg-indigo-50/20">
                          {Number(item.pcs || 0).toLocaleString('id-ID')}
                        </td>
                        {item.production_schedule?.map((day, dIdx) => (
                          <React.Fragment key={dIdx}>
                            {["shift1", "shift2", "shift3"].map((s) => (
                              <td
                                key={s}
                                className={`border p-1 text-center font-bold ${day.shifts[s].active ? 'bg-emerald-500 text-white' : 'text-gray-200'}`}
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
            )}

            {/* TAB 2: KEBUTUHAN MATERIAL (BOM) */}
            {/* TAB 2: KEBUTUHAN MATERIAL (BOM) */}
            {activeTab === 'bom' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {Object.keys(bomData).length > 0 ? Object.keys(bomData).map((fgCode) => (
                  <div key={fgCode} className="border rounded-lg overflow-hidden bg-white shadow-sm border-gray-200">

                    {/* Header Finished Good */}
                    <div className="bg-indigo-600 px-4 py-3 flex justify-between items-center text-white">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-1.5 rounded">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.2em] opacity-80 leading-none mb-1">Finished Good Item</p>
                          <h3 className="text-sm font-black uppercase leading-none">
                            {fgCode} <span className="ml-2 text-indigo-200">({Number(bomData[fgCode][0]?.parent_pcs).toLocaleString('id-ID')} PCS)</span>
                          </h3>
                        </div>
                      </div>
                      <span className="text-[10px] bg-black/20 px-3 py-1 rounded-full font-bold">
                        {bomData[fgCode].length} Components
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-[10px] border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-gray-400 uppercase text-[9px] font-black border-b tracking-wider">
                            <th className="px-4 py-3 text-left border-r w-[180px]">Component Code</th>
                            <th className="px-4 py-3 text-left border-r">Description</th>
                            <th className="px-4 py-3 text-center border-r w-[70px]">UoM</th>
                            <th className="px-4 py-3 text-center border-r w-[70px]">Line</th>
                            <th className="px-4 py-3 text-right border-r w-[100px]">Ratio</th>
                            <th className="px-4 py-3 text-right bg-indigo-50/50 w-[180px] text-indigo-700 font-bold">Total Required</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {bomData[fgCode].map((comp, cIdx) => (
                            <tr key={cIdx} className="hover:bg-gray-50/80 transition-colors group">
                              <td className="px-4 py-3 font-bold text-gray-800 border-r uppercase">
                                {comp.component_code}
                              </td>
                              <td className="px-4 py-3 text-gray-500 italic border-r">
                                {comp.component_description}
                              </td>
                              <td className="px-4 py-3 text-center border-r">
                                <span className="bg-gray-100 px-2 py-0.5 rounded text-[9px] font-bold border border-gray-200 uppercase">
                                  {comp.uom_component || "PCS"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center border-r font-bold text-gray-600">
                                {comp.linenum}
                              </td>
                              <td className="px-4 py-3 text-right border-r font-mono text-gray-400">
                                {Number(comp.ratio_component).toFixed(6)}
                              </td>
                              <td
                                className="px-4 py-3 text-right bg-indigo-50/20 group-hover:bg-indigo-50/40 transition-colors"
                                title={`Ratio: ${comp.ratio_component} x Pcs: ${comp.parent_pcs}`}
                              >
                                <span className="text-indigo-600 font-black font-mono text-[13px]">
                                  {Number(comp.required_qty || 0).toLocaleString('id-ID', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 4
                                  })}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-xs italic">
                    Data BOM tidak tersedia.
                  </div>
                )}
              </div>
            )}

            {/* KETERANGAN FOOTER */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100 text-[9px] text-gray-500 flex gap-4 items-center uppercase font-bold">
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div> Scheduled</div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-white border border-gray-300 rounded-sm"></div> No Schedule</div>
              <div className="ml-auto text-indigo-600 font-black italic">S1/S2/S3 = Shift 1, 2, 3</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}