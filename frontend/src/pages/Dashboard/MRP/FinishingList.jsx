import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../api/api";

export default function FinishingList() {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("so");
  const [selectedSO, setSelectedSO] = useState(null);
  const [items, setItems] = useState([]);

  /* ================= API CALLS ================= */
  const fetchDemands = async () => {
    try {
      setLoading(true);
      const res = await api.get("/demand");
      // Normalisasi ID agar konsisten
      const normalized = (res.data || []).map(so => ({
        ...so,
        id: so.id ?? so.demand_id,
      }));
      setDemands(normalized);
    } catch (err) {
      console.error(err);
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
      const resItems = await api.get(`/finishing/${so.id}/finishing-items`);
      
      if (!resItems.data || resItems.data.length === 0) {
        Swal.fire("Data Kosong", "Data belum digenerate.", "warning");
        return;
      }

      const mappedItems = resItems.data.map((it) => {
        let schedule = it.production_schedule;
        if (typeof schedule === 'string') {
          try { schedule = JSON.parse(schedule); } catch { schedule = []; }
        }

        return {
          id: it.id,
          itemCode: it.item_code,
          description: it.description,
          uom: it.uom || "PCS",
          qty: it.total_qty || 0,
          pcs: Number(it.pcs || 0),
          calendar: Array.isArray(schedule) ? schedule : []
        };
      });

      setItems(mappedItems);
      setSelectedSO(so);
      setView("detail");
    } catch (err) {
      Swal.fire("Error", "Gagal memuat detail", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFinishing = async (so) => {
    try {
      Swal.fire({ title: "Processing...", didOpen: () => Swal.showLoading() });
      await api.post(`/finishing/${so.id}/generate-finishing`);
      await fetchDemands();
      Swal.fire("Berhasil", "Data Finishing dibuat", "success");
    } catch (err) {
      Swal.fire("Error", "Gagal generate", "error");
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
      await api.put(`/finishing/update-schedule`, { items });
      Swal.fire("Berhasil!", "Jadwal finishing telah disimpan.", "success");
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest">
            {view === "so" ? "Finishing Schedule" : `Edit Schedule: ${selectedSO?.so_number}`}
          </h2>
          {view === "detail" && (
            <button
              onClick={() => setView("so")}
              className="text-[10px] bg-gray-100 px-4 py-2 rounded font-bold text-gray-600 uppercase hover:bg-gray-200"
            >
              Kembali
            </button>
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
                  <th className="py-3 px-4 text-center">Delivery</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {demands.map((so) => (
                  <tr key={so.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-blue-700">{so.so_number}</td>
                    <td className="py-4 px-4">{so.customer_name}</td>
                    <td className="py-4 px-4 text-center font-mono text-gray-500">
                      {new Date(so.so_date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-bold text-blue-600">
                      {new Date(so.delivery_date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      {!so.is_finishing_generated && (
                        <button
                          onClick={() => handleGenerateFinishing(so)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded text-[11px] font-bold transition-all"
                        >
                          Generate
                        </button>
                      )}
                      <button
                        onClick={() => handleShowDetail(so)}
                        disabled={!so.is_finishing_generated}
                        className={`px-4 py-1.5 rounded text-[11px] font-bold transition-all ${
                          so.is_finishing_generated 
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" 
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Buka Jadwal
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── MATRIX DETAIL VIEW ── */}
        {view === "detail" && (
          <>
            {/* SUB-HEADER INFO */}
            <div className="grid grid-cols-4 gap-4 mb-6 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
               <div>
                  <label className="block text-[8px] uppercase text-blue-600 font-bold">SO Date</label>
                  <p className="text-sm font-bold">{new Date(selectedSO?.so_date).toLocaleDateString("id-ID")}</p>
               </div>
               <div>
                  <label className="block text-[8px] uppercase text-blue-600 font-bold">Customer</label>
                  <p className="text-sm font-bold">{selectedSO?.customer_name}</p>
               </div>
               <div>
                  <label className="block text-[8px] uppercase text-blue-600 font-bold">Delivery Date</label>
                  <p className="text-sm font-bold text-orange-600">{new Date(selectedSO?.delivery_date).toLocaleDateString("id-ID")}</p>
               </div>
               <div>
                  <label className="block text-[8px] uppercase text-blue-600 font-bold">Stage</label>
                  <p className="text-sm font-bold text-blue-700">FINISHING</p>
               </div>
            </div>

            <div className="overflow-x-auto border rounded-lg shadow-inner bg-gray-50 max-h-[75vh]">
              <table className="w-full text-[10px] border-collapse bg-white">
                <thead className="sticky top-0 z-30 shadow-sm">
                  <tr className="bg-blue-600 text-white font-bold uppercase">
                    <th className="border-r border-blue-500 p-2 sticky left-0 bg-blue-600 z-40 min-w-[180px] text-left">
                      Item Info
                    </th>
                    <th className="border-r border-blue-500 p-2 w-12 text-center bg-blue-700">UOM</th>
                    <th className="border-r border-blue-500 p-2 w-16 text-center bg-blue-700">QTY</th>
                    <th className="border-r border-blue-500 p-2 w-16 text-center bg-blue-800">PCS</th>
                    <th className="border-r border-blue-500 p-2 w-20 text-center bg-blue-900 uppercase">Status</th>
                    {items[0]?.calendar?.map((day, i) => (
                      <th key={i} colSpan="3" className="border-r border-blue-500 p-1 text-center min-w-[100px]">
                        {new Date(day.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-blue-50 text-[8px] text-blue-800 font-bold">
                    <th className="border p-1 sticky left-0 bg-blue-50 z-40"></th>
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
                      <tr key={index} className="hover:bg-blue-50/20 transition-colors">
                        <td className="border p-2 sticky left-0 bg-white z-20 shadow-md">
                          <div className="font-bold text-blue-700">{item.itemCode}</div>
                          <div className="text-[8px] text-gray-400 truncate max-w-[160px]">{item.description}</div>
                          <div className={`text-[8px] font-black mt-1 ${sisa <= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {sisa <= 0 ? "PAS ✅" : `SISA: ${sisa} PCS`}
                          </div>
                        </td>
                        <td className="border text-center text-gray-500">{item.uom}</td>
                        <td className="border text-center font-mono text-blue-600 bg-gray-50/50">{item.qty}</td>
                        <td className="border text-center font-bold bg-blue-50/30 text-blue-800">{item.pcs}</td>
                        <td className="border text-center">
                           <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">Finishing</span>
                        </td>

                        {item.calendar?.map((day, dIdx) =>
                          ["shift1", "shift2", "shift3"].map((s) => {
                            const qty = day.shifts[s].qty || 0;
                            return (
                              <td
                                key={`${dIdx}-${s}`}
                                className={`border p-0 text-center transition-all ${qty > 0 ? "bg-blue-600 text-white" : "bg-white"}`}
                              >
                                <input
                                  type="number"
                                  value={qty || ""}
                                  onChange={(e) => handleQtyChange(index, dIdx, s, e.target.value)}
                                  className={`w-full h-8 text-center bg-transparent outline-none text-[10px] font-bold ${qty > 0 ? "placeholder-blue-200" : "placeholder-gray-300"}`}
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

            {/* LEGEND & SAVE */}
            <div className="mt-5 flex justify-between items-center bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
              <div className="flex gap-6 text-[10px] font-bold uppercase tracking-tight">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span className="text-blue-800">Aktifitas Finishing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
                  <span className="text-gray-500">Kosong</span>
                </div>
              </div>
              <button
                onClick={handleSaveSchedule}
                className="bg-blue-600 text-white px-10 py-2.5 rounded text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
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