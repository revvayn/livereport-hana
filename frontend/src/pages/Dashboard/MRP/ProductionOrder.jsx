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

  // Fetch daftar demand saat pertama kali buka
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
      // Jangan tampilkan Swal di sini agar tidak mengganggu jika user belum login (401)
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Handle Detail & Kalkulasi MRP
  const handleShowDetail = async (so) => {
    try {
      setLoading(true);
      
      // 1. Ambil Item Demand (Matrix) - Sesuai rute /api/demand/:id/items
      const resItems = await api.get(`/demand/${so.demand_id}/items`);
      
      // 2. Ambil Kalkulasi BOM - Sesuai rute /api/bom-calculation/:id/bom-calc di server.js
      const resBOM = await api.get(`/bom-calculation/${so.demand_id}/bom-calc`);
      
      setSoItems(resItems.data);
      setBomData(resBOM.data || {});
      setSelectedSO(so);
      setView("detail");
    } catch (err) {
      console.error("Detail Error:", err);
      const msg = err.response?.data?.error || "Gagal memuat detail atau rute tidak ditemukan (404)";
      Swal.fire("Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen">
      {/* TAMPILAN 1: DAFTAR SO */}
      {view === "so" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Production Order List</h2>
            <button 
              onClick={fetchDemands} 
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
            >
              Refresh Data
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-sm uppercase">
                  <th className="p-3 border">SO Number</th>
                  <th className="p-3 border">Customer</th>
                  <th className="p-3 border text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && demands.length === 0 ? (
                  <tr><td colSpan="3" className="p-10 text-center text-gray-500">Memuat data...</td></tr>
                ) : demands.length > 0 ? (
                  demands.map((d) => (
                    <tr key={d.demand_id} className="hover:bg-gray-50 transition">
                      <td className="p-3 border font-medium">{d.reference_no}</td>
                      <td className="p-3 border text-gray-600">{d.customer_name}</td>
                      <td className="p-3 border text-center">
                        <button
                          onClick={() => handleShowDetail(d)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md text-sm transition shadow-sm"
                        >
                          Detail & MRP
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" className="p-10 text-center text-gray-500">Tidak ada data demand ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAMPILAN 2: DETAIL */}
      {view === "detail" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
            <button
              onClick={() => setView("so")}
              className="text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-2"
            >
              <span>←</span> Kembali ke Daftar
            </button>
            <h2 className="text-lg font-bold text-gray-800">
              Demand: <span className="text-indigo-600">{selectedSO?.reference_no}</span>
            </h2>
          </div>

          <div className="flex border-b bg-white rounded-t-lg overflow-hidden">
            <button
              className={`flex-1 px-6 py-3 font-semibold transition ${activeTab === 'matrix' ? 'border-b-4 border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('matrix')}
            >
              JADWAL PRODUKSI (MATRIX)
            </button>
            <button
              className={`flex-1 px-6 py-3 font-semibold transition ${activeTab === 'bom' ? 'border-b-4 border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('bom')}
            >
              KEBUTUHAN MATERIAL (BOM)
            </button>
          </div>

          {/* TAB CONTENT: JADWAL PRODUKSI */}
          {activeTab === "matrix" && (
            <div className="bg-white p-6 shadow rounded-b-lg overflow-x-auto border-t-0">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-3 text-left">Item Code</th>
                    <th className="border p-3 text-center">Total Qty</th>
                    <th className="border p-3 text-left">Production Status</th>
                  </tr>
                </thead>
                <tbody>
                  {soItems.length > 0 ? soItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border p-3 font-mono text-indigo-700">{item.item_code}</td>
                      <td className="border p-3 text-center font-bold text-lg">{item.total_qty}</td>
                      <td className="border p-3">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">
                          {item.production_schedule ? 'Scheduled' : 'Draft'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" className="p-5 text-center text-gray-400 italic">Data item tidak tersedia.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB CONTENT: BOM CALCULATION (MRP) */}
          {activeTab === "bom" && (
            <div className="space-y-6">
              {Object.keys(bomData).length > 0 ? Object.keys(bomData).map((fgCode) => (
                <div key={fgCode} className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                  <div className="bg-indigo-600 p-3 flex justify-between items-center">
                    <span className="font-bold text-white uppercase tracking-wider text-sm">Finished Good: {fgCode}</span>
                    <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded">MRP Logic Active</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left text-gray-600">
                          <th className="p-3 border-b">Component Material</th>
                          <th className="p-3 border-b text-right">Required</th>
                          <th className="p-3 border-b text-right">Stock (Main)</th>
                          <th className="p-3 border-b text-right">Shortage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bomData[fgCode].map((comp, cIdx) => (
                          <tr key={cIdx} className="border-b last:border-0 hover:bg-gray-50 transition">
                            <td className="p-3">
                              <div className="font-bold text-gray-700">{comp.component_code}</div>
                              <div className="text-xs text-gray-400">{comp.component_description}</div>
                            </td>
                            <td className="p-3 text-right font-mono font-medium">
                              {Number(comp.required_qty).toLocaleString('id-ID')}
                            </td>
                            <td className="p-3 text-right font-mono text-blue-600">
                              {Number(comp.on_hand_qty).toLocaleString('id-ID')}
                            </td>
                            <td className={`p-3 text-right font-bold font-mono ${comp.shortage > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                              {comp.shortage > 0 ? `-${Number(comp.shortage).toLocaleString('id-ID')}` : 'Sufficient'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )) : (
                <div className="bg-white p-10 text-center rounded-lg shadow italic text-gray-400">
                  Tidak ada data BOM untuk demand ini. Periksa pengaturan Bill of Materials.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}