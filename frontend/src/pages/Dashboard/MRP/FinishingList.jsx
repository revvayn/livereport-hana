import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../../api/api";

export default function FinishingList() {
  /* ================= MAIN STATE ================= */
  const [editingDemandId, setEditingDemandId] = useState(null);
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("so");
  const [selectedSO, setSelectedSO] = useState(null);
  const [items, setItems] = useState([]);

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

  /* ================= DETAIL VIEW ================= */
  const handleShowDetail = async (so) => {
    try {
      setLoading(true);
      const resItems = await api.get(`/finishing/${so.demand_id}/finishing-items`);
      const itemsData = resItems.data || [];

      const mappedItems = itemsData.map((it) => {
        // Pastikan production_schedule adalah array
        const calData = Array.isArray(it.production_schedule)
          ? it.production_schedule
          : [];

        return {
          demandItemId: it.demand_item_id,
          finishingId: it.finishing_id,
          itemCode: it.finishing_code || "N/A", // Menggunakan it.finishing_code
          description: it.description || "-",    // Menggunakan it.description
          uom: "PCS",
          qty: it.target_pcs || 0,
          pcs: it.target_pcs || 0,
          calendar: Array.isArray(it.production_schedule) ? it.production_schedule : [],
        };
      });

      setEditingDemandId(so.demand_id);
      setSelectedSO(so);
      setItems(mappedItems);
      setView("detail");
    } catch (err) {
      console.error("Error Detail:", err);
      Swal.fire("Error", "Gagal memuat detail finishing", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ACTION HANDLERS ================= */
  const handleDelete = async (demandId) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/demand/${demandId}`);
      fetchDemands();
      Swal.fire("Berhasil", "Data dihapus", "success");
    } catch {
      Swal.fire("Error", "Gagal hapus data", "error");
    }
  };

  const handleGenerateFinishing = async (so) => {
    try {
      Swal.fire({
        title: "Mohon tunggu...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      await api.post(`/finishing/${so.demand_id}/generate-finishing`);
      await fetchDemands();
      Swal.close();

      const updatedSO = demands.find(d => d.demand_id === so.demand_id) || so;
      Swal.fire("Berhasil!", "Finishing berhasil digenerate", "success");
      await handleShowDetail(updatedSO);
    } catch (err) {
      Swal.close();
      Swal.fire("Error", err.response?.data?.error || "Gagal generate", "error");
    }
  };

  const handleQtyChange = (itemIndex, dayIndex, shiftKey, value) => {
    const newItems = [...items];
    const qty = value === "" ? 0 : Number(value);
    if (isNaN(qty) || qty < 0) return;

    newItems[itemIndex].calendar[dayIndex].shifts[shiftKey].qty = qty;
    setItems(newItems);
  };

  const handleSaveSchedule = async () => {
    try {
      Swal.fire({ title: "Menyimpan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await api.put(`/demand/${editingDemandId}/update-finishing`, { items });
      Swal.close();
      Swal.fire("Berhasil!", "Jadwal berhasil disimpan", "success");
      fetchDemands();
    } catch (err) {
      Swal.close();
      Swal.fire("Error", "Gagal menyimpan jadwal", "error");
    }
  };

  const formatHeaderDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return "-";
    const parts = dateStr.split('-');
    if (parts.length !== 3) return "-";
    const months = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
    const day = parts[2];
    const monthIndex = parseInt(parts[1], 10) - 1;
    return `${day} ${months[monthIndex]}`;
  };

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen font-sans">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm font-bold text-indigo-600 uppercase">
            {view === "so" ? "DEMAND LIST" : `DETAIL: ${selectedSO?.so_number}`}
          </div>
          {view === "detail" && (
            <button onClick={() => setView("so")} className="text-[10px] bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 font-bold text-gray-600 uppercase transition-all">
              Kembali
            </button>
          )}
        </div>

        {/* LIST VIEW */}
        {view === "so" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b uppercase text-[11px] text-left">
                  <th className="py-2 px-1">SO Number</th>
                  <th className="py-2 px-1">SO Date</th>
                  <th className="py-2 px-1">Customer</th>
                  <th className="py-2 px-1 text-center">Items</th>
                  <th className="py-2 px-1 text-center">Delivery</th>
                  <th className="py-2 px-1 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {demands.map((so) => (
                  <tr key={so.demand_id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-1 font-bold text-indigo-600">{so.so_number}</td>
                    <td className="py-4 px-1">{new Date(so.so_date).toLocaleDateString("id-ID")}</td>
                    <td className="py-4 px-1">{so.customer_name}</td>
                    <td className="py-4 px-1 text-center">{so.total_items}</td>
                    <td className="py-4 px-1 text-center font-medium">{new Date(so.delivery_date).toLocaleDateString("id-ID")}</td>
                    <td className="py-4 px-1 text-right flex justify-end gap-2">
                      {!so.is_generated && (
                        <button onClick={() => handleGenerateFinishing(so)} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700 transition-colors">
                          Generate
                        </button>
                      )}
                      <button
                        onClick={() => handleShowDetail(so)}
                        disabled={!so.is_generated}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${so.is_generated ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                      >
                        View Detail
                      </button>
                      <button onClick={() => handleDelete(so.demand_id)} className="bg-white border border-red-200 text-red-500 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-500 hover:text-white transition-all">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DETAIL VIEW */}
        {view === "detail" && (
          <>
            <div className="overflow-x-auto border rounded-lg shadow-inner bg-gray-50">
              <table className="w-full text-[10px] border-collapse bg-white">
                <thead className="sticky top-0 z-30 shadow-sm">
                  <tr className="bg-gray-100 text-gray-600 font-bold uppercase">
                    <th className="border p-2 sticky left-0 bg-gray-100 z-40 min-w-[150px] text-left">Item Info</th>
                    <th className="border p-2 min-w-[150px] text-left">Description</th>
                    <th className="border p-2 w-12 text-center">UoM</th>
                    <th className="border p-2 w-16 text-center">Qty</th>
                    <th className="border p-2 w-16 text-center bg-indigo-50 text-indigo-700">Pcs</th>
                    {items[0]?.calendar?.map((day, i) => (
                      <th key={i} colSpan="3" className="border p-1 text-center bg-gray-100">
                        <div className="text-[10px] text-indigo-600 font-bold">
                          {formatHeaderDate(day.date)}
                        </div>
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-gray-50 text-[8px] text-gray-400 font-bold">
                    <th className="border p-1 sticky left-0 bg-gray-50 z-40"></th>
                    <th className="border"></th><th className="border"></th><th className="border"></th>
                    <th className="border bg-indigo-50/30"></th>
                    {items[0]?.calendar?.map((_, i) => (
                      <React.Fragment key={i}>
                        <th className="border py-1">S1</th><th className="border py-1">S2</th><th className="border py-1">S3</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    // Hitung Sisa PCS
                    const targetPcs = Number(item.pcs || 0);
                    const totalInput = (item.calendar || []).reduce((sum, day) => {
                      const s1 = Number(day.shifts?.shift1?.qty || 0);
                      const s2 = Number(day.shifts?.shift2?.qty || 0);
                      const s3 = Number(day.shifts?.shift3?.qty || 0);
                      return sum + s1 + s2 + s3;
                    }, 0);
                    const sisa = targetPcs - totalInput;

                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        {/* Kolom Info Item */}
                        <td className="border p-2 sticky left-0 bg-white z-20 shadow-[1px_0_2px_rgba(0,0,0,0.1)]">
                          {/* PERBAIKAN: Gunakan item.itemCode bukan it.finishing_code */}
                          <div className="font-bold text-purple-700 uppercase">{item.itemCode}</div>
                          <div className={`text-[9px] font-black mt-1 ${sisa <= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {sisa <= 0 ? "PAS ✅" : `BUTUH: ${sisa.toLocaleString()} PCS`}
                          </div>
                        </td>

                        <td className="border p-2 text-gray-700 text-[10px] leading-tight font-medium">
                          {/* PERBAIKAN: Gunakan item.description bukan it.description */}
                          {item.description}
                        </td>

                        <td className="border text-center text-gray-500">{item.uom}</td>
                        <td className="border text-center text-gray-500">{item.qty}</td>
                        <td className="border text-center font-bold bg-indigo-50/20">{item.pcs}</td>

                        {/* Kolom Kalender (Shift) - Tetap seperti kode Anda */}
                        {item.calendar?.map((day, dIdx) =>
                          ["shift1", "shift2", "shift3"].map((s) => {
                            const val = day.shifts?.[s]?.qty ?? 0;
                            const numVal = Number(val);
                            const bgColor = numVal > 0 ? "bg-purple-600" : "bg-white";
                            const textColor = numVal > 0 ? "text-white" : "text-gray-400";

                            return (
                              <td key={`${dIdx}-${s}`} className={`border p-0 text-center font-bold transition-all ${bgColor}`}>
                                <input
                                  type="number"
                                  value={numVal === 0 ? "" : numVal}
                                  onChange={(e) => handleQtyChange(index, dIdx, s, e.target.value)}
                                  className={`w-10 h-8 text-center bg-transparent outline-none focus:ring-1 focus:ring-indigo-300 rounded ${textColor}`}
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

            {/* LEGEND & ACTION (Legend Packing Dihapus) */}
            <div className="mt-5 flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300">
              <div className="flex gap-6 text-[10px] font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>
                  <span className="text-gray-600 uppercase">Finishing Stage</span>
                </div>
              </div>
              <button onClick={handleSaveSchedule} className="bg-indigo-600 text-white px-8 py-2 rounded text-xs font-bold hover:bg-indigo-700 shadow-indigo-200 shadow-lg transition-all active:scale-95">
                Simpan Perubahan Jadwal
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}