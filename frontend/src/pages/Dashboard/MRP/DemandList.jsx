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
  const handleDelete = async (demandId) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data demand dan semua item di dalamnya akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        // Pastikan endpoint ini sesuai dengan backend Anda (DELETE /demand/:id)
        await api.delete(`/demand/${demandId}`);

        Swal.fire("Berhasil", "Data telah dihapus.", "success");
        // Refresh data setelah hapus
        fetchDemands();
      } catch (err) {
        Swal.fire("Error", "Gagal menghapus data", "error");
      } finally {
        setLoading(false);
      }
    }
  };
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
                  <tr key={so.demand_id} className="hover:bg-gray-50/50 group">
                    <td className="py-4 font-bold text-indigo-600">{so.reference_no}</td>
                    <td className="py-4 text-gray-500">
                      {so.so_date ? new Date(so.so_date).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="py-4 text-gray-600">{so.customer_name}</td>
                    <td className="py-4 text-center">
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full font-bold">
                        {so.total_items}
                      </span>
                    </td>
                    <td className="py-4 text-center text-gray-500 font-medium">
                      {so.production_date ? new Date(so.production_date).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="py-4 text-center text-gray-500">
                      {new Date(so.delivery_date).toLocaleDateString("id-ID")}
                    </td>

                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleShowDetail(so)}
                          className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-700 shadow-sm transition-all"
                        >
                          View Detail
                        </button>

                        <button
                          onClick={() => handleDelete(so.demand_id)}
                          className="bg-white border border-red-200 text-red-500 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          title="Hapus Demand"
                        >
                          {/* Icon Trash sederhana */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
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
                    {/* Tambah Header Deskripsi & UoM */}
                    <th className="border p-2 sticky left-0 bg-gray-100 z-20 min-w-[120px]">Item Code</th>
                    <th className="border p-2 min-w-[150px] bg-gray-100">Description</th>
                    <th className="border p-2 w-12 text-center bg-gray-100">UoM</th>
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
                    <th className="border p-1"></th> {/* Placeholder Deskripsi */}
                    <th className="border p-1"></th> {/* Placeholder UoM */}
                    <th className="border p-1"></th> {/* Placeholder Total */}
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
                      {/* Item Code tetap Sticky */}
                      <td className="border p-2 font-bold sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        {item.item_code}
                      </td>

                      {/* Kolom Deskripsi Baru */}
                      <td className="border p-2 text-gray-600 italic">
                        {item.description || "-"}
                      </td>

                      {/* Kolom UoM Baru */}
                      <td className="border p-2 text-center font-medium text-gray-500 uppercase">
                        {item.uom || "PCS"}
                      </td>

                      <td className="border p-2 text-center font-bold text-indigo-600 bg-gray-50">
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

            {/* Keterangan UI */}
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