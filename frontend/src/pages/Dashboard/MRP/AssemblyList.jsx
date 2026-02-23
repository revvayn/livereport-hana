import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../../api/api";

export default function AssemblyList() {
  /* ================= STATE ================= */
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("so"); // 'so' or 'detail'
  const [selectedSO, setSelectedSO] = useState(null);
  const [items, setItems] = useState([]);
  const [editingDemandId, setEditingDemandId] = useState(null);

  /* ================= FETCH DATA ================= */
  const fetchDemands = async () => {
    try {
      setLoading(true);
      const res = await api.get("/demand");
      setDemands(res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal memuat data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDemands(); }, []);

  /* ================= DETAIL VIEW ================= */
  const handleShowDetail = async (so) => {
    try {
      setLoading(true);
      const resItems = await api.get(`/demand/${so.demand_id}/items`);
      const itemsData = resItems.data || [];

      setEditingDemandId(so.demand_id);
      setSelectedSO(so);

      const mappedItems = itemsData.map((it) => {
        const parsed =
          typeof it.production_schedule === "string"
            ? JSON.parse(it.production_schedule)
            : it.production_schedule || [];

        return {
          itemId: it.id,
          itemCode: it.item_code,
          description: it.description,
          uom: it.uom,
          qty: it.total_qty,
          pcs: it.pcs,
          calendar: parsed,
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

  /* ================= GENERATE ASSEMBLY ================= */
  const handleGenerateAssembly = async (so) => {
    try {
      Swal.fire({
        title: "Mohon tunggu...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      await api.post(`/demand/${so.demand_id}/generate-assembly`);

      // PENTING: Refresh data agar is_assembly_generated menjadi true di state
      await fetchDemands();

      Swal.close();
      Swal.fire("Berhasil!", "Assembly berhasil digenerate", "success");

      // Langsung buka metrix detail sesuai permintaan Anda
      handleShowDetail(so);

    } catch (err) {
      Swal.close();
      Swal.fire("Error", err.response?.data?.error || "Gagal generate assembly", "error");
    }
  };

  /* ================= QTY CHANGE ================= */
  const handleQtyChange = (itemIndex, dayIndex, shiftKey, value) => {
    const newItems = [...items];
    const qty = Number(value);
    if (isNaN(qty) || qty < 0) return;

    // Pastikan object path ada
    if (!newItems[itemIndex].calendar[dayIndex].shifts[shiftKey]) {
      newItems[itemIndex].calendar[dayIndex].shifts[shiftKey] = {};
    }

    // Update data
    newItems[itemIndex].calendar[dayIndex].shifts[shiftKey] = {
      ...newItems[itemIndex].calendar[dayIndex].shifts[shiftKey],
      qty: qty,
      active: qty > 0,
      type: "assembly" // Paksa jadi assembly karena ini halaman assembly
    };

    setItems(newItems);
  };

  /* ================= SAVE SCHEDULE ================= */
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

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Data?",
      text: "Data tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33"
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/demand/${id}`);
        fetchDemands();
        Swal.fire("Deleted!", "Data berhasil dihapus.", "success");
      } catch (err) { Swal.fire("Error", "Gagal menghapus", "error"); }
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen font-sans">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm font-bold text-indigo-600 uppercase">
            {view === "so" ? "ASSEMBLY PLANNING LIST" : `PLANNING DETAIL: ${selectedSO?.so_number}`}
          </div>
          {view === "detail" && (
            <button onClick={() => setView("so")} className="text-[10px] bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 font-bold text-gray-600 uppercase">
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
                  <th className="pb-2">SO Number</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2 text-center">Items</th>
                  <th className="pb-2 text-center">Delivery</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-700">
                {demands.map((so) => (
                  <tr key={so.demand_id} className="hover:bg-gray-50">
                    <td className="py-4 font-bold text-indigo-600">{so.so_number}</td>
                    <td>{so.customer_name}</td>
                    <td className="text-center">{so.total_items}</td>
                    <td className="text-center">{new Date(so.delivery_date).toLocaleDateString("id-ID")}</td>
                    <td className="text-right flex justify-end gap-2 py-4">
                      {/* Tombol ini otomatis hilang jika is_assembly_generated bernilai true */}
                      {so.is_generated && !so.is_assembly_generated && (
                        <button
                          onClick={() => handleGenerateAssembly(so)}
                          className="bg-yellow-500 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-yellow-600 transition-colors"
                        >
                          Generate Assembly
                        </button>
                      )}

                      <button
                        onClick={() => handleShowDetail(so)}
                        disabled={!so.is_generated}
                        className={`px-3 py-1.5 rounded text-xs font-bold ${so.is_generated ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                      >
                        View Detail
                      </button>
                      <button onClick={() => handleDelete(so.demand_id)} className="text-red-500 border border-red-100 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-50 transition-colors">
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
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-lg shadow-inner bg-gray-50">
              <table className="w-full text-[10px] border-collapse bg-white">
                <thead className="sticky top-0 z-30 shadow-sm">
                  <tr className="bg-gray-100 text-gray-600 font-bold uppercase">
                    {/* Kolom Info Item yang Sticky */}
                    <th className="border p-2 sticky left-0 bg-gray-100 z-40 min-w-[150px] text-left">Item Info</th>
                    <th className="border p-2 min-w-[150px] text-left">Description</th>
                    <th className="border p-2 w-12 text-center">UoM</th>
                    <th className="border p-2 w-16 text-center">Qty</th>
                    <th className="border p-2 w-16 text-center bg-indigo-50 text-indigo-700">Pcs</th>

                    {/* Kolom Tanggal */}
                    {items[0]?.calendar?.map((day, i) => (
                      <th key={i} colSpan="3" className="border p-1 text-center bg-indigo-50 text-indigo-700">
                        {new Date(day.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-gray-50 text-[8px] text-gray-400 font-bold">
                    <th className="border p-1 sticky left-0 bg-gray-50 z-40"></th>
                    <th className="border"></th>
                    <th className="border"></th>
                    <th className="border"></th>
                    <th className="border bg-indigo-50/30"></th>
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
                  {items.map((item, idx) => {
                    const currentTotal = item.calendar?.reduce((sum, d) =>
                      sum + (Number(d.shifts.shift1?.qty) || 0) + (Number(d.shifts.shift2?.qty) || 0) + (Number(d.shifts.shift3?.qty) || 0), 0) || 0;
                    const sisa = Number(item.pcs) - currentTotal;

                    return (
                      <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                        {/* KOLOM PERTAMA: Item Code & Status Sisa */}
                        <td className="border p-2 sticky left-0 bg-white z-20 shadow-[1px_0_2px_rgba(0,0,0,0.1)]">
                          {/* Pastikan baris di bawah ini ada agar Item Code muncul */}
                          <div className="font-bold text-indigo-700">{item.itemCode}</div>
                          <div className={`text-[9px] font-black mt-1 ${sisa <= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {sisa <= 0 ? "PAS ✅" : `SISA: ${sisa} PCS`}
                          </div>
                        </td>

                        {/* Kolom Detail Lainnya */}
                        <td className="border p-2 text-gray-500 text-[9px] leading-tight">{item.description}</td>
                        <td className="border text-center text-gray-500">{item.uom}</td>
                        <td className="border text-center text-gray-500">{item.qty}</td>
                        <td className="border text-center font-bold bg-gray-50">{item.pcs}</td>

                        {/* Input Matriks Jadwal */}
                        {item.calendar?.map((day, dIdx) =>
                          ["shift1", "shift2", "shift3"].map(s => {
                            const qty = day.shifts[s]?.qty || 0;
                            const type = day.shifts[s]?.type;
                            let bgColor = "bg-white";

                            if (day.shifts[s]?.active) {
                              if (type === "packing") bgColor = "bg-emerald-500 text-white";
                              else if (type === "finishing") bgColor = "bg-purple-600 text-white";
                              else if (type === "assembly") bgColor = "bg-lime-400 text-white";
                            }

                            return (
                              <td key={`${dIdx}-${s}`} className={`border p-0 text-center font-bold transition-all ${bgColor}`}>
                                <input
                                  type="number"
                                  value={qty || ""}
                                  onChange={e => handleQtyChange(idx, dIdx, s, e.target.value)}
                                  className="w-10 h-8 text-center bg-transparent outline-none focus:ring-1 focus:ring-indigo-300 rounded"
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

            {/* FOOTER ACTION */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg flex flex-wrap justify-between items-center gap-4">
              <div className="flex gap-6 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-500 rounded shadow-sm"></div> Packing</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-purple-600 rounded shadow-sm"></div> Finishing</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-lime-400 rounded shadow-sm"></div> Assembly</div>
              </div>

              <button onClick={handleSaveSchedule} className="bg-indigo-600 text-white px-8 py-2.5 rounded shadow-lg hover:bg-indigo-700 transition-all font-bold text-xs uppercase tracking-widest">
                Simpan Perubahan Jadwal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}