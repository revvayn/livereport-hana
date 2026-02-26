import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import api from "../../../api/api";

export default function AssemblyList() {
  /* ================= MAIN STATE ================= */
  const [editingDemandId, setEditingDemandId] = useState(null);
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("so");
  const [selectedSO, setSelectedSO] = useState(null);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('schedule');
  const [bomData, setBomData] = useState({});

  /* ================= FETCH DEMANDS ================= */
  const fetchDemands = async () => {
    try {
      setLoading(true);
      const res = await api.get("/demand");
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

  /* ================= DETAIL VIEW (Unified) ================= */
  const handleShowDetail = async (so) => {
    try {
        setLoading(true);
        const targetId = so.id || so.demand_id;

        // Ambil data dari tabel demand_item_assembly
        const [resItems, resBOM] = await Promise.all([
            api.get(`/assembly-items/${targetId}/items`), 
            api.get(`/bom-calculation/${targetId}/bom-calc`).catch(() => ({ data: {} })) 
        ]);

        if (!resItems.data || resItems.data.length === 0) {
            Swal.fire("Data Kosong", "Data assembly belum di-generate.", "warning");
            return;
        }

        const mappedItems = resItems.data.map((it) => {
            return {
                id: it.id,
                // Pastikan menggunakan nama kolom dari demand_item_assembly
                itemCode: it.item_code,     // misal: FGD00158
                description: it.description, // misal: FG DOORCORE MRE
                uom: it.uom,
                qty: Number(it.total_qty || 0),
                pcs: Number(it.pcs || 0),      
                calendar: Array.isArray(it.production_schedule) ? it.production_schedule : [],
            };
        });

        setItems(mappedItems);
        setBomData(resBOM.data || {});
        setSelectedSO(so);
        setView("detail");
    } catch (err) {
        console.error("Error view detail:", err);
        Swal.fire("Error", "Gagal memuat detail data.", "error");
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
      confirmButtonColor: "#ea580c", // Orange-600
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

  const handleGenerateAssembly = async (so) => {
    try {
      Swal.fire({ title: "Generating Assembly...", didOpen: () => Swal.showLoading() });
      const targetId = so.id || so.demand_id;

      // Panggil endpoint assembly baru
      await api.post(`/assembly-items/${targetId}/generate-assembly`);

      await fetchDemands(); // Refresh list
      Swal.fire("Berhasil", "Data Assembly berhasil dibuat", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.error || "Gagal generate assembly", "error");
    }
  };

  const handleQtyChange = (itemIndex, dayIndex, shiftKey, value) => {
    const newItems = [...items];
    const qty = value === "" ? 0 : Number(value);
    if (isNaN(qty) || qty < 0) return;

    if (!newItems[itemIndex].calendar[dayIndex].shifts) {
      newItems[itemIndex].calendar[dayIndex].shifts = { shift1: { qty: 0 }, shift2: { qty: 0 }, shift3: { qty: 0 } };
    }
    newItems[itemIndex].calendar[dayIndex].shifts[shiftKey].qty = qty;
    setItems(newItems);
  };

  const handleSaveSchedule = async () => {
    try {
      Swal.fire({ title: "Menyimpan...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      await api.put(`/finishing/update-schedule`, { items });
      Swal.close();
      Swal.fire("Berhasil!", "Jadwal berhasil disimpan", "success");
      await fetchDemands();
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
    return `${parts[2]} ${months[parseInt(parts[1], 10) - 1]}`;
  };
  const updateSchedule = async (req, res) => {
    const { items } = req.body; // Array of items dari React
    try {
        for (const item of items) {
            await pool.query(
                'UPDATE demand_item_assembly SET production_schedule = $1 WHERE id = $2',
                [JSON.stringify(item.calendar), item.id] // calendar dari React di-stringify
            );
        }
        res.json({ message: "Update Success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen font-sans">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm font-bold text-orange-600 uppercase tracking-wide">
            {view === "so" ? "ASSEMBLY SCHEDULE" : `DETAIL: ${selectedSO?.so_number}`}
          </div>
          {view === "detail" && (
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('schedule')} className={`text-[10px] px-3 py-1 rounded font-bold uppercase transition-all ${activeTab === 'schedule' ? 'bg-orange-600 text-white shadow-md shadow-orange-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Jadwal</button>
              <button onClick={() => setActiveTab('bom')} className={`text-[10px] px-3 py-1 rounded font-bold uppercase transition-all ${activeTab === 'bom' ? 'bg-orange-600 text-white shadow-md shadow-orange-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>BOM</button>
              <div className="w-px bg-gray-200 mx-1"></div>
              <button onClick={() => setView("so")} className="text-[10px] bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 font-bold text-gray-600 uppercase transition-all">Kembali</button>
            </div>
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
                  <tr key={so.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="py-4 px-1 font-bold text-orange-600">{so.so_number}</td>
                    <td className="py-4 px-1">{new Date(so.so_date).toLocaleDateString("id-ID")}</td>
                    <td className="py-4 px-1">{so.customer_name}</td>
                    <td className="py-4 px-1 text-center">{so.total_items}</td>
                    <td className="py-4 px-1 text-center font-medium">{new Date(so.delivery_date).toLocaleDateString("id-ID")}</td>
                    <td className="py-4 px-1 text-right flex justify-end gap-2">
                      {!so.is_assembly_generated && (
                        <button
                          onClick={() => handleGenerateAssembly(so)}
                          disabled={!so.is_finishing_generated} // LOCK jika finishing belum ada
                          className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${so.is_finishing_generated
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                          {so.is_finishing_generated ? "Generate Assembly" : "Waiting Finishing"}
                        </button>
                      )}
                      <button
                        onClick={() => handleShowDetail(so)}
                        disabled={!so.is_assembly_generated} // LOCK jika assembly belum ada
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${so.is_assembly_generated
                            ? "bg-orange-600 text-white hover:bg-orange-700 shadow-md"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                      >
                        View Detail
                      </button>
                      <button onClick={() => handleDelete(so.id)} className="bg-white border border-red-100 text-red-500 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-500 hover:text-white transition-all">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DETAIL VIEW: SCHEDULE TAB */}
        {view === "detail" && activeTab === 'schedule' && (
          <>
            <div className="overflow-x-auto border rounded-lg shadow-inner bg-gray-50">
              <table className="w-full text-[10px] border-collapse bg-white">
                <thead className="sticky top-0 z-30 shadow-sm">
                  <tr className="bg-gray-100 text-gray-600 font-bold uppercase">
                    <th className="border p-2 sticky left-0 bg-gray-100 z-40 min-w-[150px] text-left">Item Info</th>
                    <th className="border p-2 min-w-[150px] text-left">Description</th>
                    <th className="border p-2 w-12 text-center">UoM</th>
                    <th className="border p-2 w-16 text-center">Qty</th>
                    <th className="border p-2 w-16 text-center bg-orange-50 text-orange-700">Pcs</th>
                    {items[0]?.calendar?.map((day, i) => (
                      <th key={i} colSpan="3" className="border p-1 text-center bg-gray-100">
                        <div className="text-[10px] text-orange-600 font-bold">{formatHeaderDate(day.date)}</div>
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-gray-50 text-[8px] text-gray-400 font-bold">
                    <th className="border p-1 sticky left-0 bg-gray-50 z-40"></th>
                    <th className="border"></th><th className="border"></th><th className="border"></th>
                    <th className="border bg-orange-50/30"></th>
                    {items[0]?.calendar?.map((_, i) => (
                      <React.Fragment key={i}>
                        <th className="border py-1">S1</th><th className="border py-1">S2</th><th className="border py-1">S3</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const targetPcs = Number(item.pcs || 0);
                    const totalInput = (item.calendar || []).reduce((sum, day) => {
                      return sum + Number(day.shifts?.shift1?.qty || 0) + Number(day.shifts?.shift2?.qty || 0) + Number(day.shifts?.shift3?.qty || 0);
                    }, 0);
                    const sisa = targetPcs - totalInput;
                    return (
                      <tr key={index} className="hover:bg-orange-50/20 transition-colors">
                        <td className="border p-2 sticky left-0 bg-white z-20 shadow-[1px_0_2px_rgba(0,0,0,0.05)]">
                          <div className="font-bold text-orange-700 uppercase">{item.itemCode || "NO CODE"}</div>
                          <div className={`text-[9px] font-black mt-1 ${sisa <= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {sisa <= 0 ? "PAS ✅" : `BUTUH: ${sisa.toLocaleString()} PCS`}
                          </div>
                        </td>
                        <td className="border p-2 text-gray-700 text-[10px] leading-tight font-medium">{item.description || "No Description"}</td>
                        <td className="border text-center text-gray-500">{item.uom}</td>
                        <td className="border text-center text-gray-500">{item.qty}</td>
                        <td className="border text-center font-bold bg-orange-50/20">{item.pcs}</td>
                        {item.calendar?.map((day, dIdx) =>
                          ["shift1", "shift2", "shift3"].map((s) => {
                            const val = day.shifts?.[s]?.qty ?? 0;
                            const bgColor = val > 0 ? "bg-orange-500" : "bg-white";
                            const textColor = val > 0 ? "text-white" : "text-gray-400";
                            return (
                              <td key={`${dIdx}-${s}`} className={`border p-0 text-center font-bold transition-all ${bgColor}`}>
                                <input
                                  type="number"
                                  value={val}
                                  onChange={(e) => handleQtyChange(index, dIdx, s, e.target.value)}
                                  className={`w-10 h-8 text-center bg-transparent outline-none focus:ring-1 focus:ring-orange-300 rounded ${textColor}`}
                                  min={0}
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
            <div className="mt-5 flex justify-between items-center bg-orange-50/30 p-3 rounded-lg border border-dashed border-orange-200">
              <div className="flex gap-6 text-[10px] font-bold text-orange-800 uppercase tracking-wide">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                  <span>Assembly Stage</span>
                </div>
              </div>
              <button onClick={handleSaveSchedule} className="bg-orange-600 text-white px-8 py-2 rounded text-xs font-bold hover:bg-orange-700 shadow-orange-200 shadow-lg transition-all active:scale-95">
                Simpan Perubahan Jadwal
              </button>
            </div>
          </>
        )}

        {/* DETAIL VIEW: BOM TAB */}
        {view === "detail" && activeTab === 'bom' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {Object.keys(bomData).length > 0 ? Object.keys(bomData).map((fgCode) => (
              <div key={fgCode} className="border rounded-lg overflow-hidden bg-white shadow-sm border-gray-200">
                <div className="bg-orange-600 px-4 py-3 flex justify-between items-center text-white shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-1.5 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] opacity-80 leading-none mb-1">Finished Good Item</p>
                      <h3 className="text-sm font-black uppercase leading-none tracking-wide">
                        {fgCode} <span className="ml-2 text-orange-100 font-medium">({Number(bomData[fgCode][0]?.parent_pcs).toLocaleString('id-ID')} PCS)</span>
                      </h3>
                    </div>
                  </div>
                  <span className="text-[10px] bg-black/20 px-3 py-1 rounded-full font-bold">{bomData[fgCode].length} Components</span>
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
                        <th className="px-4 py-3 text-right bg-orange-50/50 w-[180px] text-orange-700 font-bold">Total Required</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bomData[fgCode].map((comp, cIdx) => (
                        <tr key={cIdx} className="hover:bg-orange-50/10 transition-colors group">
                          <td className="px-4 py-3 font-bold text-gray-800 border-r uppercase">{comp.component_code}</td>
                          <td className="px-4 py-3 text-gray-500 italic border-r">{comp.component_description}</td>
                          <td className="px-4 py-3 text-center border-r">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-[9px] font-bold border border-gray-200 uppercase">{comp.uom_component || "PCS"}</span>
                          </td>
                          <td className="px-4 py-3 text-center border-r font-bold text-gray-600">{comp.linenum}</td>
                          <td className="px-4 py-3 text-right border-r font-mono text-gray-400">{Number(comp.ratio_component).toFixed(6)}</td>
                          <td className="px-4 py-3 text-right bg-orange-50/10 group-hover:bg-orange-50/20 transition-colors">
                            <span className="text-orange-600 font-black font-mono text-[13px]">
                              {Number(comp.required_qty || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
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
      </div>
    </div>
  );
}