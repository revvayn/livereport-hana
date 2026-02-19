import React, { useEffect, useState, useMemo, useRef } from "react";
import Swal from "sweetalert2";
import api from "../../../api/api";

export default function ProductionSchedule() {
  const [availableOps, setAvailableOps] = useState([]);
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSO, setSelectedSO] = useState(null);
  const [plots, setPlots] = useState([]);
  const [plottingLoading, setPlottingLoading] = useState(false);
  const [activeOp, setActiveOp] = useState(null);

  // --- REF UNTUK MENGUNCI SCROLL ---
  const tableContainerRef = useRef(null);
  const scrollLeftPos = useRef(0);

  const fetchDemands = async () => {
    try {
      setLoading(true);
      const res = await api.get("/planned-order");
      setDemands(res.data);
    } catch (err) {
      Swal.fire("Error", "Gagal load data demand", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlots = async (so) => {
    // Simpan posisi scroll sebelum fetching
    if (tableContainerRef.current) {
      scrollLeftPos.current = tableContainerRef.current.scrollLeft;
    }
    
    setSelectedSO(so);
    try {
      setPlottingLoading(true);
      const res = await api.get(`/planned-order/schedule/${so.demand_id}`);
      setPlots(res.data.plots || []);
      setAvailableOps(res.data.availableOperations || []);
      
      // Kembalikan posisi scroll setelah state diupdate
      setTimeout(() => {
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollLeft = scrollLeftPos.current;
        }
      }, 0);
    } catch (err) {
      Swal.fire("Error", "Gagal load data matrix", "error");
    } finally {
      setPlottingLoading(false);
    }
  };

  const getDynamicColor = (id, type) => {
    if (type === 'PACKING') return 'bg-emerald-500';
    if (!id) return 'bg-indigo-500';
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500', 'bg-rose-500'];
    return colors[id % colors.length];
  };

  const matrix = useMemo(() => {
    if (!plots || plots.length === 0 || !selectedSO) return { dates: [], items: [] };

    const formatDateLocal = (d) => {
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    };

    const itemMap = {};
    plots.forEach(p => {
      if (!itemMap[p.item_id]) {
        itemMap[p.item_id] = {
          item_id: p.item_id,
          item_code: p.item_code,
          description: p.description,
          uom: p.uom,
          pcs: parseFloat(p.pcs || 0),
          data: []
        };
      }

      if (p.date) {
        const dStr = p.date.split("T")[0];
        itemMap[p.item_id].data.push({
          plot_id: p.plot_id,
          date: dStr,
          shift: Number(p.shift),
          qty: parseFloat(p.qty || 0),
          operation_name: p.operation_name,
          operation_id: Number(p.operation_id),
          plot_type: p.plot_type
        });
      }
    });

    const deliveryDate = new Date(selectedSO.delivery_date);
    const startDate = new Date(deliveryDate);
    startDate.setDate(startDate.getDate() - 14);

    const fullDates = [];
    let temp = new Date(startDate);
    while (temp <= deliveryDate) {
      fullDates.push(formatDateLocal(temp));
      temp.setDate(temp.getDate() + 1);
    }

    return { dates: fullDates, items: Object.values(itemMap) };
  }, [plots, selectedSO]);

  const handleCellClick = async (item, date, shift, existingPlot) => {
    if (!date || plottingLoading) return;
    if (existingPlot && existingPlot.plot_type === 'OTHER') return;

    let action = 'ADD';
    let targetQty = 0;

    const totalTerplot = item.data
      .filter(d => d.plot_type === 'CURRENT' || d.plot_type === 'PACKING')
      .reduce((sum, d) => sum + d.qty, 0);
    const sisaKebutuhan = item.pcs - (existingPlot ? (totalTerplot - existingPlot.qty) : totalTerplot);

    if (!existingPlot || (existingPlot.plot_type === 'CURRENT' || existingPlot.plot_type === 'PACKING')) {
      if (!activeOp && !existingPlot) return Swal.fire("Info", "Pilih Operasi terlebih dahulu", "warning");

      const { value: formValues, isDismissed, isDenied } = await Swal.fire({
        title: 'Plotting Quantity',
        html: `<div class="text-left text-xs mb-2">Item: <b>${item.item_code}</b><br/>Sisa Butuh: <b>${sisaKebutuhan}</b></div>` +
              `<input id="swal-qty" type="number" class="swal2-input" placeholder="Qty" value="${existingPlot ? existingPlot.qty : sisaKebutuhan}">`,
        showCancelButton: true,
        showDenyButton: !!existingPlot,
        confirmButtonText: 'Simpan',
        denyButtonText: 'Hapus Plot',
        focusConfirm: false,
        preConfirm: () => {
          return document.getElementById('swal-qty').value;
        }
      });

      if (isDismissed) return;
      
      if (isDenied) {
        action = 'DELETE';
      } else {
        targetQty = parseFloat(formValues);
        if (!targetQty || targetQty <= 0) return Swal.fire("Gagal", "Quantity harus lebih dari 0", "error");
        action = 'ADD';
      }
    }

    try {
      setPlottingLoading(true);
      await api.post("/planned-order/toggle-plot", {
        plot_id: existingPlot?.plot_id,
        demand_id: selectedSO.demand_id,
        item_id: item.item_id,
        operation_id: action === 'ADD' ? (activeOp ? activeOp.id : existingPlot.operation_id) : (existingPlot?.operation_id),
        date: date,
        shift: parseInt(shift),
        qty: targetQty,
        action: action
      });
      await fetchPlots(selectedSO);
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.error || "Terjadi kesalahan", "error");
    } finally {
      setPlottingLoading(false);
    }
  };

  const getItemColor = (code) => {
    if (code?.startsWith('FGP')) return 'text-blue-700';
    if (code?.startsWith('WIP')) return 'text-purple-700';
    return 'text-gray-900';
  };

  const handleGenerate = async (so) => {
    try {
      setLoading(true);
      await api.post("/planned-order/generate-schedule", { 
        demand_id: so.demand_id, 
        delivery_date: so.delivery_date 
      });
      Swal.fire("Berhasil", "Jadwal otomatis digenerate", "success");
      fetchDemands();
    } catch (err) {
      Swal.fire("Error", "Gagal generate jadwal", "error");
    } finally {
      setLoading(false);
    }
  };

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
                    Matrix
                  </button>
                  <button onClick={() => handleGenerate(so)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-indigo-700">
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <button onClick={() => { setSelectedSO(null); setActiveOp(null); }} className="text-indigo-600 text-[11px] font-bold flex items-center gap-1 hover:underline mb-2">
            ← BACK TO LIST
          </button>
          <h2 className="text-lg font-bold text-gray-800">
            Schedule: <span className="text-indigo-600">{selectedSO.reference_no}</span>
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 items-center bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300">
          <button onClick={() => setActiveOp(null)} className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${!activeOp ? 'bg-gray-200 text-gray-700' : 'bg-white text-red-500 border-red-200'}`}>
            {activeOp ? '✕ RESET' : 'SELECT OP:'}
          </button>
          {availableOps.map((op) => (
            <button
              key={op.id}
              onClick={() => setActiveOp({ id: op.id, name: op.operation_name })}
              className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md border ${activeOp?.id === op.id ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' : 'border-transparent'}`}
            >
              <span className={`w-3 h-3 ${getDynamicColor(op.id)} rounded-sm`}></span>
              {op.operation_name}
            </button>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden border rounded-xl shadow-inner bg-gray-50">
        {/* OVERLAY LOADING: Menjaga tabel tetap ada sehingga tidak melompat */}
        {plottingLoading && (
          <div className="absolute inset-0 z-[60] bg-white/40 flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
          </div>
        )}

        <div 
          ref={tableContainerRef}
          className="overflow-x-auto"
          onScroll={(e) => (scrollLeftPos.current = e.target.scrollLeft)}
        >
          <table className="w-full text-[10px] border-collapse min-w-max">
            <thead className="bg-gray-100 text-gray-600 sticky top-0 z-40">
              <tr className="border-b">
                <th className="p-3 border-r sticky left-0 bg-gray-100 z-50 text-left w-[100px]">Code</th>
                <th className="p-3 border-r sticky left-[100px] bg-gray-100 z-50 text-left w-[180px]">Description</th>
                <th className="p-3 border-r sticky left-[280px] bg-gray-100 z-50 text-center w-[50px]">UOM</th>
                <th className="p-3 border-r sticky left-[330px] bg-indigo-50 text-indigo-700 z-50 text-center w-[60px]">PCS</th>
                {matrix.dates.map(date => (
                  <th id={`col-${date}`} key={date} colSpan="3" className="p-2 border-r text-center font-bold bg-gray-200 text-[9px]">
                    {new Date(date).toLocaleDateString("id-ID", { day: '2-digit', month: 'short' })}
                  </th>
                ))}
              </tr>
              <tr className="bg-gray-50 text-[8px] border-b">
                <th colSpan="4" className="sticky left-0 bg-gray-50 z-50 border-r"></th>
                {matrix.dates.map(date => (
                  <React.Fragment key={date}>
                    <th className="p-1 border-r w-10 text-center text-gray-400">S1</th>
                    <th className="p-1 border-r w-10 text-center text-gray-400">S2</th>
                    <th className="p-1 border-r w-10 text-center text-gray-400">S3</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {matrix.items.map((item) => (
                <tr key={item.item_id} className="hover:bg-gray-50 group h-12">
                  <td className={`p-3 border-r sticky left-0 bg-white group-hover:bg-gray-50 font-bold z-10 ${getItemColor(item.item_code)}`}>
                    {item.item_code}
                  </td>
                  <td className="p-3 border-r sticky left-[100px] bg-white group-hover:bg-gray-50 text-gray-500 italic z-10 truncate max-w-[180px]">
                    {item.description}
                  </td>
                  <td className="p-3 border-r sticky left-[280px] bg-white group-hover:bg-gray-50 text-center text-gray-400 z-10">
                    {item.uom}
                  </td>
                  <td className="p-3 border-r sticky left-[330px] bg-indigo-50 font-black text-indigo-700 text-center z-10">
                    {item.pcs}
                  </td>
                  {matrix.dates.map(date => [1, 2, 3].map(shiftNum => {
                    const cell = item.data.find(d =>
                      d.date === date &&
                      Number(d.shift) === Number(shiftNum)
                    );

                    let cellClass = "cursor-pointer hover:bg-indigo-100 text-transparent hover:text-indigo-400 transition-all border-r border-b";
                    let content = <span className="text-xs">+</span>;

                    if (cell) {
                      const isCurrentSO = cell.plot_type === 'CURRENT' || cell.plot_type === 'PACKING';
                      if (isCurrentSO) {
                        const bgColor = getDynamicColor(cell.operation_id, cell.plot_type);
                        cellClass = `${bgColor} text-white font-bold shadow-sm hover:brightness-95`;
                        content = (
                          <div className="flex flex-col items-center justify-center leading-tight h-full scale-90">
                            <span className="text-[7px] uppercase opacity-90 truncate w-full">{cell.operation_name}</span>
                            <span className="text-[10px] mt-0.5">{cell.qty}</span>
                          </div>
                        );
                      } else {
                        cellClass = "bg-gray-200 text-gray-400 cursor-not-allowed";
                        content = <span className="text-[8px] scale-75">FULL</span>;
                      }
                    }

                    return (
                      <td
                        key={`${date}-${shiftNum}`}
                        onClick={() => handleCellClick(item, date, shiftNum, cell)}
                        className={`p-0.5 text-center min-w-[45px] h-12 relative border-r border-b ${cellClass}`}
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
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6 font-sans">
      {!selectedSO ? renderListView() : renderDetailView()}
    </div>
  );
}