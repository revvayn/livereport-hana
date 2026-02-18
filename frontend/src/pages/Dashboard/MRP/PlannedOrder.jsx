import React, { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import api from "../../../api/api";

export default function ProductionSchedule() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSO, setSelectedSO] = useState(null);
  const [plots, setPlots] = useState([]);
  const [plottingLoading, setPlottingLoading] = useState(false);

  const fetchDemands = async () => {
    try {
      setLoading(true);
      const res = await api.get("/planned-order");
      setDemands(res.data);
    } catch (err) {
      console.error("Frontend Fetch Error:", err);
      Swal.fire("Error", "Gagal load data demand: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlots = async (so) => {
    setSelectedSO(so);
    try {
      setPlottingLoading(true);
      const res = await api.get(`/planned-order/schedule/${so.demand_id}`);
      setPlots(res.data);
    } catch (err) {
      Swal.fire("Error", "Gagal mengambil detail plotting", "error");
    } finally {
      setPlottingLoading(false);
    }
  };

  const handleGenerate = async (so) => {
    try {
      Swal.fire({
        title: 'Generating Schedule...',
        text: 'Sistem sedang menghitung jadwal backward...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
      const res = await api.post("/planned-order/auto-generate-so", {
        demand_id: so.demand_id,
        delivery_date: so.delivery_date
      });
      Swal.fire("Berhasil", res.data.message, "success");
      fetchDemands();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Gagal generate", "error");
    }
  };
  // Di ProductionSchedule.js
  const handleCellClick = async (item, date, shift, existingPlot) => {
    // Hindari klik pada kolom tanggal yang rusak (seperti 01 Jan)
    if (!date || date.startsWith('1970') || date.startsWith('0001')) {
      return Swal.fire("Error", "Tanggal tidak valid di baris ini", "error");
    }

    const action = existingPlot ? 'DELETE' : 'ADD';

    // Pastikan format YYYY-MM-DD murni tanpa jam
    const cleanDate = date.split('T')[0];

    try {
      setPlottingLoading(true);
      await api.post("/planned-order/toggle-plot", {
        demand_id: selectedSO.demand_id,
        item_id: item.item_id,
        date: cleanDate,
        shift: parseInt(shift),
        qty: item.pcs || 0,
        action: action
      });
      // Refresh data setelah sukses
      fetchPlots(selectedSO);
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.error || "Cek koneksi database", "error");
    } finally {
      setPlottingLoading(false);
    }
  };
  const getItemColor = (code) => {
    if (!code) return 'text-gray-900';
    if (code.startsWith('FGP')) return 'text-blue-700';
    if (code.startsWith('WIP')) return 'text-purple-700';
    if (code.startsWith('RM')) return 'text-orange-700';
    return 'text-gray-900';
  };

  const matrix = useMemo(() => {
    if (!plots || plots.length === 0) return { dates: [], items: [] };

    // 1. Ambil tanggal unik dan sort
    const dates = [...new Set(plots.map(p => {
      const d = new Date(p.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }))].sort();

    const itemMap = {};
    plots.forEach(current => {
      const key = current.item_id;
      if (!itemMap[key]) {
        itemMap[key] = { ...current, data: [] };
      }

      // Pastikan format date untuk perbandingan sama dengan variabel 'dates'
      const d = new Date(current.date);
      const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      itemMap[key].data.push({
        date: formattedDate,
        shift: parseInt(current.shift),
        qty: current.plot_qty,
        // KUNCI UTAMA: Cek tipe data di sini
        type: current.plot_type, // 'CURRENT' atau 'OTHER' dari Query SQL
        ref: current.ref_so
      });
    });

    return { dates, items: Object.values(itemMap) };
  }, [plots]);

  useEffect(() => { fetchDemands(); }, []);

  const renderListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h1 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-6">Production Demand List</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b uppercase text-[11px] text-left font-bold">
              <th className="pb-3 pl-2">SO Number</th>
              <th className="pb-3">Customer</th>
              <th className="pb-3 text-center">Items</th>
              <th className="pb-3 text-center">Delivery Date</th>
              <th className="pb-3 text-center">Status</th>
              <th className="pb-3 text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {demands.map((so) => (
              <tr key={so.demand_id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 pl-2 font-bold text-gray-800">{so.reference_no}</td>
                <td className="py-4 text-gray-600">{so.customer_name || '-'}</td>
                <td className="py-4 text-center">{so.total_items} SKU</td>
                <td className="py-4 text-center text-gray-500">
                  {new Date(so.delivery_date).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="py-4 text-center">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${so.has_schedule ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {so.has_schedule ? "SCHEDULED" : "WAITING"}
                  </span>
                </td>
                <td className="py-4 text-right pr-2 space-x-2 flex justify-end">
                  <button onClick={() => fetchPlots(so)} className="border border-indigo-600 text-indigo-600 px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-indigo-50">
                    View Matrix
                  </button>
                  <button onClick={() => handleGenerate(so)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-indigo-700 shadow-sm">
                    Generate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDetailView = () => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button onClick={() => setSelectedSO(null)} className="text-indigo-600 text-[11px] font-bold flex items-center gap-1 hover:underline mb-2">
            ← BACK TO LIST
          </button>
          <h2 className="text-lg font-bold text-gray-800">
            Schedule Detail: <span className="text-indigo-600">{selectedSO.reference_no}</span>
          </h2>
        </div>
        {/* Legend agar user tidak bingung */}
        <div className="flex gap-4 text-[10px]">
          <div className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded"></span> Current SO</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-100 border border-amber-300 rounded"></span> Scheduled (Other SO)</div>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-xl overflow-hidden shadow-inner">
        <table className="w-full text-[10px] border-collapse min-w-max">
          <thead className="bg-gray-100 text-gray-600 uppercase">
            <tr>
              <th className="p-3 border-r sticky left-0 bg-gray-100 z-30 text-left w-[100px]">Item Code</th>
              <th className="p-3 border-r sticky left-[100px] bg-gray-100 z-30 text-left w-[200px]">Description</th>
              <th className="p-3 border-r sticky left-[300px] bg-gray-100 z-30 text-center w-[60px]">UOM</th>
              <th className="p-3 border-r sticky left-[360px] bg-gray-100 z-30 text-center w-[80px]">QTY (M3)</th>
              <th className="p-3 border-r sticky left-[440px] bg-indigo-100 text-indigo-700 z-30 text-center w-[70px]">PCS</th>
              {matrix.dates.map(date => (
                <th key={date} colSpan="3" className="p-2 border-r text-center font-bold bg-gray-200 border-b border-gray-300">
                  {new Date(date).toLocaleDateString("id-ID", { day: '2-digit', month: 'short' })}
                </th>
              ))}
            </tr>
            <tr className="bg-gray-50 text-[8px] border-b">
              <th className="sticky left-0 bg-gray-50 z-30 border-r"></th>
              <th className="sticky left-[80px] bg-gray-50 z-30 border-r"></th>
              <th className="sticky left-[280px] bg-gray-50 z-30 border-r"></th>
              <th className="sticky left-[330px] bg-gray-50 z-30 border-r"></th>
              <th className="sticky left-[390px] bg-indigo-50 z-30 border-r"></th>
              {matrix.dates.map(date => (
                <React.Fragment key={date}>
                  <th className="p-1 border-r w-10 text-center">S1</th>
                  <th className="p-1 border-r w-10 text-center">S2</th>
                  <th className="p-1 border-r w-10 text-center">S3</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {plottingLoading ? (
              <tr><td colSpan="100" className="p-20 text-center animate-pulse text-indigo-500 font-bold">LOADING SCHEDULE...</td></tr>
            ) : matrix.items.map((item) => (
              <tr key={item.item_code} className="hover:bg-gray-50 group">
                <td className={`p-3 border-r sticky left-0 bg-white group-hover:bg-gray-50 font-bold z-10 w-[100px] ${getItemColor(item.item_code)}`}>
                  {item.item_code}
                </td>
                <td className="p-3 border-r sticky left-[100px] bg-white group-hover:bg-gray-50 text-gray-500 italic z-10 w-[200px] truncate">
                  {item.description}
                </td>
                <td className="p-3 border-r sticky left-[280px] bg-white group-hover:bg-gray-50 text-center text-gray-400 z-10">
                  {item.uom}
                </td>
                <td className="p-3 border-r sticky left-[330px] bg-white group-hover:bg-gray-50 text-center font-semibold z-10 text-gray-700">
                  {parseFloat(item.total_qty || 0).toFixed(2)}
                </td>
                <td className="p-3 border-r sticky left-[390px] bg-indigo-50 font-black text-indigo-700 text-center z-10 group-hover:bg-indigo-100 transition-colors">
                  {item.pcs}
                </td>
                {matrix.dates.map(date => [1, 2, 3].map(shift => {
                  const cell = item.data.find(d => d.date === date && d.shift === shift);

                  let cellClass = "cursor-pointer hover:bg-indigo-50 text-gray-200";
                  let content = "+";

                  if (cell) {
                    if (cell.type === 'CURRENT') {
                      cellClass = "cursor-pointer bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-inner";
                      content = cell.qty;
                    } else {
                      cellClass = "bg-amber-100 text-amber-700 border border-amber-300 cursor-not-allowed text-[7px]";
                      content = `SO:${cell.ref.split('/').pop()}`;
                    }
                  }

                  return (
                    <td
                      key={`${date}-${shift}`}
                      onClick={() => handleCellClick(item, date, shift, cell)}
                      className={`p-2 border-r text-center transition-all min-w-[40px] ${cellClass}`}
                      title={cell?.type === 'OTHER' ? `Conflict with ${cell.ref}` : "Click to Toggle"}
                    >
                      {content}
                    </td>
                  );
                }))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6 font-sans text-gray-900">
      {!selectedSO ? renderListView() : renderDetailView()}
    </div>
  );
}