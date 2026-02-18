import React, { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import api from "../../../api/api";

export default function ProductionSchedule() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSO, setSelectedSO] = useState(null);
  const [plots, setPlots] = useState([]);
  const [plottingLoading, setPlottingLoading] = useState(false);

  // Fetch data demand utama
  const fetchDemands = async () => {
    try {
      setLoading(true);
      const res = await api.get("/demand");
      setDemands(res.data);
    } catch (err) {
      Swal.fire("Error", "Gagal load data demand", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch detail plotting berdasarkan SO
  const fetchPlots = async (demandId) => {
    if (!demandId) return;
    try {
      setPlottingLoading(true);
      const res = await api.get(`/planned-order/schedule/${demandId}`);
      setPlots(res.data);
    } catch (err) {
      Swal.fire("Error", "Gagal mengambil detail plotting", "error");
    } finally {
      setPlottingLoading(false);
    }
  };

  const handleAutoSchedule = async (so) => {
    const result = await Swal.fire({
      title: "Generate Schedule?",
      text: `Sistem akan menghitung jadwal produksi untuk SO: ${so.reference_no}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      confirmButtonText: "Proses",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await api.post(`/planned-order/auto-generate-so`, {
          demand_id: so.demand_id,
          delivery_date: so.delivery_date
        });
        await fetchDemands();
        fetchPlots(so.demand_id);
        Swal.fire("Berhasil", "Jadwal diperbarui", "success");
      } catch (err) {
        Swal.fire("Gagal", "Terjadi kesalahan sistem", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // LOGIKA PENGOLAHAN DATA UNTUK MATRIX
  const matrix = useMemo(() => {
    if (plots.length === 0) return { dates: [], items: [] };

    // Ambil tanggal unik (Header Kolom)
    const dates = [...new Set(plots.map(p => p.date.split('T')[0]))].sort();

    // Kelompokkan data berdasarkan Item Code untuk Baris
    // Kita ambil juga field detail (description, uom, dll) dari plot pertama tiap item
    const itemMap = plots.reduce((acc, current) => {
      if (!acc[current.item_code]) {
        acc[current.item_code] = {
          item_code: current.item_code,
          description: current.description || "-",
          uom: current.uom || "-",
          total_qty: current.total_qty || 0, // Dalam M3
          pcs: current.pcs || 0,
          data: []
        };
      }
      acc[current.item_code].data.push(current);
      return acc;
    }, {});

    return { dates, items: Object.values(itemMap) };
  }, [plots]);

  useEffect(() => { fetchDemands(); }, []);

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen space-y-6 font-sans">
      
      {/* SECTION 1: DEMAND LIST */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-6">
          DEMAND & PRODUCTION PLANNING
        </h1>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b uppercase text-[11px] text-left font-semibold">
                <th className="pb-3 pl-2">SO Number</th>
                <th className="pb-3 text-center">Items</th>
                <th className="pb-3 text-center">Deliv. Date</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {demands.map((so) => (
                <tr 
                  key={so.demand_id} 
                  className={`cursor-pointer hover:bg-gray-50 ${selectedSO?.demand_id === so.demand_id ? 'bg-indigo-50' : ''}`}
                  onClick={() => { setSelectedSO(so); fetchPlots(so.demand_id); }}
                >
                  <td className="py-4 pl-2 font-bold">{so.reference_no}</td>
                  <td className="py-4 text-center text-xs">{so.total_items} SKU</td>
                  <td className="py-4 text-center text-xs text-gray-500">
                    {new Date(so.delivery_date).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-4 text-center">
                    <span className={`text-[10px] px-2 py-1 rounded font-bold ${so.has_schedule ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {so.has_schedule ? "SCHEDULED" : "WAITING"}
                    </span>
                  </td>
                  <td className="py-4 text-right pr-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAutoSchedule(so); }}
                      className="bg-indigo-600 text-white px-4 py-1.5 rounded text-[11px] font-bold"
                    >
                      Generate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: DETAIL MATRIX GANTT */}
      {selectedSO && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase">
              DEMAND LIST / <span className="text-indigo-600">DETAIL: {selectedSO.reference_no}</span>
            </h2>
            <button onClick={() => setSelectedSO(null)} className="text-gray-400 hover:text-red-500">✕</button>
          </div>

          <div className="overflow-x-auto border rounded-lg shadow-inner">
            <table className="w-full text-[10px] border-collapse min-w-max">
              <thead>
                {/* Header Row 1: Main Info & Dates */}
                <tr className="bg-gray-50 border-b">
                  <th className="p-3 border-r sticky left-0 bg-gray-50 z-30 text-left text-gray-500 uppercase">Item Code</th>
                  <th className="p-3 border-r sticky left-[80px] bg-gray-50 z-30 text-left text-gray-500 uppercase">Description</th>
                  <th className="p-3 border-r sticky left-[250px] bg-gray-50 z-30 text-center text-gray-500 uppercase">UOM</th>
                  <th className="p-3 border-r sticky left-[300px] bg-gray-50 z-30 text-center text-gray-500 uppercase">Qty (M3)</th>
                  <th className="p-3 border-r sticky left-[360px] bg-gray-50 z-30 text-center text-indigo-600 uppercase">PCS</th>
                  
                  {matrix.dates.map(date => (
                    <th key={date} colSpan="3" className="p-2 border-r text-center bg-gray-50 font-bold text-gray-700 border-b">
                      {new Date(date).toLocaleDateString("id-ID", { day: '2-digit', month: 'short' })}
                    </th>
                  ))}
                </tr>
                {/* Header Row 2: Shifts */}
                <tr className="bg-gray-50 border-b text-[9px] text-gray-400">
                  <th className="sticky left-0 bg-gray-50 z-30 border-r"></th>
                  <th className="sticky left-[80px] bg-gray-50 z-30 border-r"></th>
                  <th className="sticky left-[250px] bg-gray-50 z-30 border-r"></th>
                  <th className="sticky left-[300px] bg-gray-50 z-30 border-r"></th>
                  <th className="sticky left-[360px] bg-gray-50 z-30 border-r"></th>
                  {matrix.dates.map(date => (
                    <React.Fragment key={date}>
                      <th className="p-1.5 border-r w-10 text-center">S1</th>
                      <th className="p-1.5 border-r w-10 text-center">S2</th>
                      <th className="p-1.5 border-r w-10 text-center">S3</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plottingLoading ? (
                  <tr><td colSpan={5 + (matrix.dates.length * 3)} className="p-10 text-center animate-pulse font-bold text-indigo-500">Memuat Data Plotting...</td></tr>
                ) : matrix.items.length > 0 ? (
                  matrix.items.map((item) => (
                    <tr key={item.item_code} className="border-b bg-white hover:bg-gray-50">
                      <td className="p-3 border-r sticky left-0 bg-white font-bold text-indigo-700 z-10">{item.item_code}</td>
                      <td className="p-3 border-r sticky left-[80px] bg-white text-gray-500 italic z-10 w-40 truncate">{item.description}</td>
                      <td className="p-3 border-r sticky left-[250px] bg-white text-center text-gray-400 z-10">{item.uom}</td>
                      <td className="p-3 border-r sticky left-[300px] bg-white text-center font-bold z-10">{item.total_qty}</td>
                      <td className="p-3 border-r sticky left-[360px] bg-indigo-50 text-indigo-700 font-black text-center z-10">{item.pcs}</td>
                      
                      {matrix.dates.map(date => [1, 2, 3].map(shift => {
                        const cell = item.data.find(d => d.date.split('T')[0] === date && d.shift === shift);
                        return (
                          <td key={`${date}-${shift}`} className={`p-2 border-r text-center ${cell ? 'bg-emerald-500 text-white font-bold' : 'text-gray-200'}`}>
                            {cell ? Math.round(cell.qty) : "-"}
                          </td>
                        );
                      }))}
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="20" className="p-10 text-center text-gray-400 italic">Belum ada data produksi terplot.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* LEGEND FOOTER */}
          <div className="mt-6 flex justify-between items-center text-[10px] text-gray-500">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-500 rounded-sm"></div>
                <span className="font-bold uppercase">Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-gray-300 rounded-sm"></div>
                <span className="font-bold uppercase">No Schedule</span>
              </div>
            </div>
            <div className="italic font-bold text-indigo-600 uppercase tracking-tighter">
              S1/S2/S3 = Shift 1, 2, 3
            </div>
          </div>
        </div>
      )}
    </div>
  );
}