import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../../api/api";

export default function AssemblyList() {
  /* ================= STATE ================= */
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("so");
  const [selectedSO, setSelectedSO] = useState(null);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('schedule');
  const [bomData, setBomData] = useState({});

  /* ================= FETCH DATA ================= */
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

  const handleShowDetail = async (so) => {
    try {
      setLoading(true);
      const targetId = so.id || so.demand_id;
      const [resItems, resBOM] = await Promise.all([
        api.get(`/assembly/demand/${targetId}/items`),
        api.get(`/bom-calculation/${targetId}/bom-calc`).catch(() => ({ data: {} }))
      ]);

      if (!resItems.data || resItems.data.length === 0) {
        Swal.fire("Data Kosong", "Data assembly belum di-generate.", "warning");
        return;
      }

      setItems(resItems.data.map(it => ({
        id: it.id,
        itemCode: it.item_code,
        description: it.description,
        uom: it.uom,
        qty: Number(it.total_qty || 0),
        pcs: Number(it.pcs || 0),
        calendar: Array.isArray(it.calendar) ? it.calendar : [],
      })));
      setBomData(resBOM.data || {});
      setSelectedSO(so);
      setView("detail");
    } catch (err) {
      Swal.fire("Error", "Gagal memuat detail data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAssembly = async (so) => {
    try {
      Swal.fire({ title: "Generating...", didOpen: () => Swal.showLoading() });
      await api.post(`/assembly/generate/${so.id || so.demand_id}`);
      await fetchDemands();
      Swal.fire("Berhasil", "Data Assembly berhasil dibuat", "success");
    } catch (err) {
      Swal.fire("Error", "Gagal generate assembly", "error");
    }
  };

  const handleQtyChange = (itemIdx, dayIdx, shiftKey, value) => {
    const newItems = [...items];
    const qty = value === "" ? 0 : Number(value);
    newItems[itemIdx].calendar[dayIdx].shifts[shiftKey].qty = qty;
    setItems(newItems);
  };

  const handleSaveSchedule = async () => {
    try {
      setLoading(true);
      await api.put(`/assembly/update-schedule`, { items });
      Swal.fire("Berhasil!", "Jadwal assembly disimpan.", "success");
      fetchDemands();
      setView("so");
    } catch (err) {
      Swal.fire("Error", "Gagal menyimpan jadwal", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen font-sans">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold text-orange-600 uppercase tracking-widest">
            {view === "so" ? "Assembly Schedule" : `Edit Schedule: ${selectedSO?.so_number}`}
          </h2>
          {view === "detail" && (
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('schedule')} className={`text-[10px] px-4 py-2 rounded font-bold uppercase transition-all ${activeTab === 'schedule' ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>Jadwal</button>
              <button onClick={() => setActiveTab('bom')} className={`text-[10px] px-4 py-2 rounded font-bold uppercase transition-all ${activeTab === 'bom' ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>BOM</button>
              <button onClick={() => setView("so")} className="text-[10px] bg-gray-100 px-4 py-2 rounded font-bold text-gray-600 uppercase">Kembali</button>
            </div>
          )}
        </div>

        {/* LIST VIEW */}
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
                  <tr key={so.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-orange-600">{so.so_number}</td>
                    <td className="py-4 px-4">{so.customer_name}</td>
                    <td className="py-4 px-4 text-center font-mono text-gray-500">{new Date(so.so_date).toLocaleDateString("id-ID")}</td>
                    <td className="py-4 px-4 text-center font-mono font-bold text-orange-600">{new Date(so.delivery_date).toLocaleDateString("id-ID")}</td>
                    <td className="py-4 px-4 text-right space-x-2">
                      {!so.is_assembly_generated && (
                        <button onClick={() => handleGenerateAssembly(so)} className="bg-emerald-600 text-white px-4 py-1.5 rounded text-[11px] font-bold">Generate</button>
                      )}
                      <button onClick={() => handleShowDetail(so)} disabled={!so.is_assembly_generated} className={`px-4 py-1.5 rounded text-[11px] font-bold ${so.is_assembly_generated ? "bg-orange-600 text-white shadow-md" : "bg-gray-200 text-gray-400"}`}>Buka Jadwal</button>
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
            {/* INFO PANEL (LAYOUT SAMA PERSIS PACKING/FINISHING) */}
            <div className="grid grid-cols-4 gap-4 mb-6 bg-orange-50/50 p-4 rounded-lg border border-orange-100">
               <div>
                  <label className="block text-[8px] uppercase text-orange-600 font-bold">SO Date</label>
                  <p className="text-sm font-bold">{new Date(selectedSO?.so_date).toLocaleDateString("id-ID")}</p>
               </div>
               <div>
                  <label className="block text-[8px] uppercase text-orange-600 font-bold">Customer</label>
                  <p className="text-sm font-bold">{selectedSO?.customer_name}</p>
               </div>
               <div>
                  <label className="block text-[8px] uppercase text-orange-600 font-bold">Delivery Date</label>
                  <p className="text-sm font-bold text-red-600">{new Date(selectedSO?.delivery_date).toLocaleDateString("id-ID")}</p>
               </div>
               <div>
                  <label className="block text-[8px] uppercase text-orange-600 font-bold">Stage</label>
                  <p className="text-sm font-bold text-orange-700">ASSEMBLY</p>
               </div>
            </div>

            {activeTab === 'schedule' ? (
              <>
                <div className="overflow-x-auto border rounded-lg shadow-inner bg-gray-50 max-h-[70vh]">
                  <table className="w-full text-[10px] border-collapse bg-white">
                    <thead className="sticky top-0 z-30 shadow-sm">
                      <tr className="bg-orange-600 text-white font-bold uppercase">
                        <th className="border-r border-orange-500 p-2 sticky left-0 bg-orange-600 z-40 min-w-[180px] text-left">Item Info</th>
                        <th className="border-r border-orange-500 p-2 w-12 text-center bg-orange-700">UOM</th>
                        <th className="border-r border-orange-500 p-2 w-16 text-center bg-orange-700">QTY</th>
                        <th className="border-r border-orange-500 p-2 w-16 text-center bg-orange-800">PCS</th>
                        <th className="border-r border-orange-500 p-2 w-20 text-center bg-orange-900">STATUS</th>
                        {items[0]?.calendar?.map((day, i) => (
                          <th key={i} colSpan="3" className="border-r border-orange-500 p-1 text-center min-w-[100px]">
                            {new Date(day.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                          </th>
                        ))}
                      </tr>
                      <tr className="bg-orange-50 text-[8px] text-orange-800 font-bold">
                        <th className="border p-1 sticky left-0 bg-orange-50 z-40"></th>
                        <th className="border"></th><th className="border"></th><th className="border"></th><th className="border"></th>
                        {items[0]?.calendar?.map((_, i) => (
                          <React.Fragment key={i}>
                            <th className="border py-1">S1</th><th className="border py-1">S2</th><th className="border py-1">S3</th>
                          </React.Fragment>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => {
                        const totalInput = item.calendar?.reduce((sum, day) => sum + (Number(day.shifts.shift1.qty) || 0) + (Number(day.shifts.shift2.qty) || 0) + (Number(day.shifts.shift3.qty) || 0), 0) || 0;
                        const sisa = Number(item.pcs) - totalInput;
                        return (
                          <tr key={index} className="hover:bg-orange-50/20">
                            <td className="border p-2 sticky left-0 bg-white z-20 shadow-md">
                              <div className="font-bold text-orange-700">{item.itemCode}</div>
                              <div className="text-[8px] text-gray-400 truncate max-w-[160px]">{item.description}</div>
                              <div className={`text-[8px] font-black mt-1 ${sisa <= 0 ? "text-emerald-600" : "text-red-500"}`}>{sisa <= 0 ? "PAS ✅" : `SISA: ${sisa} PCS`}</div>
                            </td>
                            <td className="border text-center text-gray-500">{item.uom}</td>
                            <td className="border text-center font-mono text-orange-600 bg-orange-50/50">{item.qty}</td>
                            <td className="border text-center font-bold bg-orange-50/30 text-orange-800">{item.pcs}</td>
                            <td className="border text-center"><span className="text-[9px] font-bold text-orange-500 uppercase">Assembly</span></td>
                            {item.calendar?.map((day, dIdx) => ["shift1", "shift2", "shift3"].map((s) => {
                                const qty = day.shifts[s].qty || 0;
                                return (
                                  <td key={`${dIdx}-${s}`} className={`border p-0 text-center ${qty > 0 ? "bg-orange-600 text-white" : "bg-white"}`}>
                                    <input type="number" value={qty || ""} onChange={(e) => handleQtyChange(index, dIdx, s, e.target.value)} className="w-full h-8 text-center bg-transparent outline-none text-[10px] font-bold" placeholder="0" />
                                  </td>
                                );
                            }))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-5 flex justify-between items-center bg-white p-4 rounded-lg border border-orange-200 shadow-sm">
                  <div className="flex gap-6 text-[10px] font-bold uppercase tracking-tight text-orange-800">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-600 rounded"></div><span>Assembly Activity</span></div>
                  </div>
                  <button onClick={handleSaveSchedule} className="bg-orange-600 text-white px-10 py-2.5 rounded text-xs font-bold shadow-lg shadow-orange-200">Simpan Perubahan Jadwal</button>
                </div>
              </>
            ) : (
              /* BOM VIEW */
              <div className="space-y-4">
                {Object.keys(bomData).map((fgCode) => (
                  <div key={fgCode} className="border rounded-lg overflow-hidden border-gray-200 shadow-sm">
                    <div className="bg-orange-600 px-4 py-2 text-white flex justify-between items-center">
                      <span className="text-xs font-bold uppercase">{fgCode}</span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase font-bold">{bomData[fgCode][0]?.parent_pcs} PCS</span>
                    </div>
                    <table className="w-full text-[10px]">
                      <thead className="bg-gray-50 text-gray-400 uppercase text-[9px]">
                        <tr>
                          <th className="p-2 text-left">Component</th>
                          <th className="p-2 text-left">Description</th>
                          <th className="p-2 text-center">Ratio</th>
                          <th className="p-2 text-right">Total Req</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {bomData[fgCode].map((comp, i) => (
                          <tr key={i}>
                            <td className="p-2 font-bold">{comp.component_code}</td>
                            <td className="p-2 text-gray-500">{comp.component_description}</td>
                            <td className="p-2 text-center font-mono">{Number(comp.ratio_component).toFixed(4)}</td>
                            <td className="p-2 text-right font-bold text-orange-600">{Number(comp.required_qty).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}