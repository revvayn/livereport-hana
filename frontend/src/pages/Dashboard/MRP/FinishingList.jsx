import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../../api/api";

export default function FinishingList() {

  /* ================= MAIN STATE ================= */
  const [editingDemandId, setEditingDemandId] = useState(null);
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("so");
  const [activeTab, setActiveTab] = useState("matrix");

  const [selectedSO, setSelectedSO] = useState(null);
  const [drag, setDrag] = useState(null);
  /* ================= FORM STATE ================= */
  const [salesOrders, setSalesOrders] = useState([]);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState("");
  const [header, setHeader] = useState({
    soNo: "", soDate: "", customer: "", deliveryDate: "", productionDate: "",
  });
  const [items, setItems] = useState([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  /* ================= HELPERS ================= */
  const ITEM_COLORS = [
    "bg-green-600",
    "bg-blue-600",
    "bg-purple-600",
    "bg-orange-600",
    "bg-pink-600",
    "bg-teal-600",
  ];

  const updateHeader = (key, value) => {
    setHeader((prev) => ({ ...prev, [key]: value }));
  };

  const updateItem = (index, key, value) => {
    const newItems = [...items];
    newItems[index][key] = value;
    setItems(newItems);
  };

  const toggleShift = (itemIdx, dayIdx, shift, mode = "toggle") => {
    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[itemIdx] };
      const day = { ...item.calendar[dayIdx] };

      const current = day.shifts[shift].active;

      let newActive = current;
      if (mode === "on") newActive = true;
      else if (mode === "off") newActive = false;
      else newActive = !current;

      day.shifts[shift] = {
        ...day.shifts[shift],
        active: newActive,
      };

      item.calendar[dayIdx] = day;
      copy[itemIdx] = item;
      return copy;
    });
  };

  const updateShiftQty = (itemIndex, dayIndex, shiftKey, value) => {
    const newItems = [...items];

    newItems[itemIndex].calendar[dayIndex].shifts[shiftKey].qty = Number(value);
    newItems[itemIndex].calendar[dayIndex].shifts[shiftKey].active = true;

    setItems(newItems);
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;

    const date1 = d1 instanceof Date ? d1 : new Date(d1);
    const date2 = d2 instanceof Date ? d2 : new Date(d2);

    if (isNaN(date1) || isNaN(date2)) return false;

    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const addDays = (date, d) => {
    const n = new Date(date);
    n.setDate(n.getDate() + d);
    return n;
  };

  const toInputDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const buildCalendar = (startDate, days = 14) => {
    return Array.from({ length: days }, (_, i) => ({
      date: addDays(startDate, i),
      shifts: {
        shift1: { active: false, qty: 0 },
        shift2: { active: false, qty: 0 },
        shift3: { active: false, qty: 0 },
      },
    }));
  };

  const createItem = (start) => ({
    itemId: null,
    itemCode: "",
    description: "",
    uom: "",
    qty: "",
    pcs: "",
    calendarStart: start,
    calendar: buildCalendar(start),
  });

  const getTotalPlottedQty = (calendar) => {
    let total = 0;
    calendar.forEach((day) => {
      Object.values(day.shifts).forEach((shift) => {
        if (shift.active) total += Number(shift.qty) || 0;
      });
    });
    return total;
  };

  /* ================= AUTO PLOT ================= */
  const autoPlotGlobalBackward = (items, deliveryDate) => {
    if (!deliveryDate || items.length === 0) return items;

    const delivery = new Date(deliveryDate + "T00:00:00");
    const startDate = addDays(delivery, -13); // ✅ H-13 dari delivery

    let updatedItems = items.map((it) => ({
      ...it,
      calendarStart: startDate,
      calendar: buildCalendar(startDate, 14),
    }));

    let currentDayIdx = 12; // H-1
    let currentShift = 3;

    updatedItems.forEach((item) => {
      let targetPcs = Number(item.pcs) || 0;
      let currentPlotted = 0;

      while (currentPlotted < targetPcs && currentDayIdx >= 0) {
        const sKey = `shift${currentShift}`;
        const remaining = targetPcs - currentPlotted;
        const amountToPlot = remaining < 50 ? remaining : 50;

        item.calendar[currentDayIdx].shifts[sKey] = {
          active: true,
          qty: amountToPlot,
        };

        currentPlotted += amountToPlot;

        currentShift--;
        if (currentShift < 1) {
          currentShift = 3;
          currentDayIdx--;
        }
      }
    });

    return updatedItems;
  };

  /* ================= AUTO PLOT FINISHING ================= */
  const autoPlotFinishing = (items, itemRoutings, lastPackingCalendar) => {
    // items: array item dari SO
    // itemRoutings: array dari backend /item_routings
    // lastPackingCalendar: calendar terakhir dari packing (untuk key mundur)

    if (!items || !itemRoutings || items.length === 0) return [];

    // clone items
    const updatedItems = items.map(it => ({ ...it, calendar: [...it.calendar] }));

    updatedItems.forEach(item => {
      // ambil routing finishing sequence=0 untuk item ini
      const routing = itemRoutings.find(r => r.item_code === item.itemCode && r.sequence === 0);
      if (!routing) return;

      const totalQty = Number(item.pcs || 0);
      const cycleTime = Number(routing.cycle_time_min || 1); // minimal 1
      const maxPerShift = Number(routing.pcs || 50); // default 50 pcs/shift

      // start mundur dari H-1 terakhir packing
      let calendar = lastPackingCalendar || item.calendar;
      let dayIdx = calendar.length - 1;
      let shiftKeys = ["shift3", "shift2", "shift1"];
      let shiftIdx = shiftKeys.length - 1;

      let plotted = 0;
      while (plotted < totalQty && dayIdx >= 0) {
        const shiftKey = shiftKeys[shiftIdx];
        const remaining = totalQty - plotted;
        const qtyThisShift = remaining < maxPerShift ? remaining : maxPerShift;

        calendar[dayIdx].shifts[shiftKey] = {
          active: true,
          qty: qtyThisShift
        };

        plotted += qtyThisShift;

        // mundur shift
        shiftIdx--;
        if (shiftIdx < 0) {
          shiftIdx = shiftKeys.length - 1;
          dayIdx--; // pindah hari sebelumnya
        }
      }

      item.calendar = calendar;
    });

    return updatedItems;
  };

  /* ================= AUTO PLOT FINISHING VISUAL ================= */
  const autoPlotFinishingVisual = (items, itemRoutings, lastPackingCalendar) => {
    if (!items || !itemRoutings || items.length === 0) return [];

    const updatedItems = items.map(it => ({ ...it, calendar: [...it.calendar] }));

    updatedItems.forEach(item => {
      const routing = itemRoutings.find(r => r.item_code === item.itemCode && r.sequence === 0);
      if (!routing) return;

      const totalQty = Number(item.pcs || 0);
      const maxPerShift = Number(routing.pcs || 50);

      let calendar = lastPackingCalendar || item.calendar;
      let dayIdx = calendar.length - 1;
      let shiftKeys = ["shift3", "shift2", "shift1"];
      let shiftIdx = shiftKeys.length - 1;

      let plotted = 0;
      while (plotted < totalQty && dayIdx >= 0) {
        const shiftKey = shiftKeys[shiftIdx];
        const remaining = totalQty - plotted;
        const qtyThisShift = remaining < maxPerShift ? remaining : maxPerShift;

        calendar[dayIdx].shifts[shiftKey] = {
          active: true,
          qty: qtyThisShift,
          type: "finishing" // tanda shift finishing
        };

        plotted += qtyThisShift;

        shiftIdx--;
        if (shiftIdx < 0) {
          shiftIdx = shiftKeys.length - 1;
          dayIdx--;
        }
      }

      item.calendar = calendar;
    });

    return updatedItems;
  };

  /* ================= FETCH DEMAND LIST ================= */
  const fetchDemands = async () => {
    try {
      setLoading(true);
      const res = await api.get("/demand");
      setDemands(res.data || []);
    } catch (err) {
      console.error("Fetch Demands Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  /* ================= SELECT SO ================= */
  const handleSelectSO = async (e) => {
    const id = e.target.value;
    setSelectedSO(id);

    if (!id) return;

    const res = await api.get(`/demand/from-so/${id}`);
    const data = res.data;

    setHeader({
      soNo: data.so_number,
      soDate: toInputDate(data.so_date),
      customer: data.customer_name,
      deliveryDate: toInputDate(data.delivery_date),
      productionDate: toInputDate(data.production_date),
    });

    const mappedItems = data.items.map((item) => ({
      itemId: item.id || null,
      itemCode: item.item_code,
      description: item.description,
      uom: item.uom || "PCS",
      qty: item.qty,
      pcs: item.total_pcs || 0,
      calendar: item.production_schedule
        ? (typeof item.production_schedule === "string"
          ? JSON.parse(item.production_schedule)
          : item.production_schedule)
        : buildCalendar(
          addDays(
            new Date(data.delivery_date + "T00:00:00"),
            -13
          )
        )
    }));

    setItems(mappedItems);
  };

  /* ================= DETAIL VIEW ================= */
  const handleShowDetail = async (so) => {
    try {
      setLoading(true);

      const resItems = await api.get(`/demand/${so.demand_id}/items`);
      const itemsData = resItems.data || [];

      setEditingDemandId(so.demand_id);
      setSelectedSO(so);

      // ✅ HEADER ambil dari LIST (karena memang belum ada endpoint header)
      setHeader({
        soNo: so.so_number,
        soDate: toInputDate(so.so_date),
        customer: so.customer_name,
        deliveryDate: toInputDate(so.delivery_date),
        productionDate: toInputDate(so.production_date),
      });

      const mappedItems = itemsData.map((it) => {
        const parsed = typeof it.production_schedule === "string"
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
      console.error(err);
      Swal.fire("Error", "Gagal memuat detail", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
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
      setLoading(true);
      await api.delete(`/demand/${demandId}`);
      fetchDemands();
      Swal.fire("Berhasil", "Data dihapus", "success");
    } catch {
      Swal.fire("Error", "Gagal hapus data", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE SHIFT DETAIL ================= */
  const handleExportExcel = async () => {
    if (items.length === 0 || !header.soNo) return Swal.fire("Peringatan", "Data tidak lengkap", "warning");
    try {
      setLoading(true);
      const response = await api.post("/demand/export-excel", { header, items }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Demand_${header.soNo}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      Swal.fire("Error", "Gagal export Excel", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!header.deliveryDate || !header.productionDate) {
      return Swal.fire("Peringatan", "Lengkapi tanggal!", "warning");
    }
    try {
      setLoading(true);

      if (editingDemandId) {
        // UPDATE
        await api.put(`/demand/${editingDemandId}`, {
          header,
          items
        });

        Swal.fire("Berhasil!", "Demand berhasil diupdate.", "success");
      } else {
        // CREATE
        await api.post("/demand", { header, items });
        Swal.fire("Berhasil!", "Demand berhasil dibuat.", "success");
      }

      fetchDemands();

      // Refresh matrix setelah save

    } catch (error) {
      Swal.fire("Error", "Gagal menyimpan data", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleGenerateFinishing = () => {
    if (!items || items.length === 0) return Swal.fire("Peringatan", "Tidak ada item untuk diproses", "warning");
    if (!header.deliveryDate) return Swal.fire("Peringatan", "Lengkapi tanggal kirim!", "warning");
  
    // 1. Tentukan kalender terakhir dari packing (atau pakai calendarStart)
    const lastPackingCalendar = items[0]?.calendar || [];
  
    // 2. Dummy itemRoutings, seharusnya dari API /item_routings
    const itemRoutings = items.map((it) => ({
      item_code: it.itemCode,
      sequence: 0,
      pcs: 50,
      cycle_time_min: 1
    }));
  
    // 3. Generate visual finishing plot
    const plottedItems = autoPlotFinishingVisual(items, itemRoutings, lastPackingCalendar);
  
    // 4. Update state items langsung
    setItems(plottedItems);
  
    Swal.fire("Sukses!", "Finishing schedule berhasil digenerate (frontend)", "success");
  };
  
  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

        {/* HEADER & NAVIGATION */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm font-bold">
            <button
              onClick={() => setView("so")}
              className={view === "so"
                ? "text-indigo-600"
                : "text-gray-400 hover:text-gray-600 transition-colors"}
            >
              DEMAND LIST
            </button>

            {view === "detail" && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-indigo-600 uppercase tracking-tight">
                  Detail: {selectedSO?.so_number}
                </span>
              </>
            )}
          </div>

          {view === "detail" && (
            <div className="flex gap-2 items-center">
              <div className="flex bg-gray-100 p-0.5 rounded-md mr-2">
                <button
                  className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${activeTab === "matrix"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                  onClick={() => setActiveTab("matrix")}
                >
                  MATRIX JADWAL
                </button>
                <button
                  className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${activeTab === "bom"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                  onClick={() => setActiveTab("bom")}
                >
                  EDIT JADWAL
                </button>
              </div>

              <button
                onClick={() => setView("so")}
                className="text-[10px] bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 font-bold text-gray-600 uppercase"
              >
                Kembali
              </button>
            </div>
          )}
        </div>

        {/* ================= LIST VIEW ================= */}
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
                    <td className="py-4 font-bold text-indigo-600">
                      {so.so_number}
                    </td>
                    <td className="py-4 text-gray-500">
                      {so.so_date
                        ? new Date(so.so_date).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                    <td className="py-4 text-gray-600">
                      {so.customer_name}
                    </td>
                    <td className="py-4 text-center">
                      <span className="bg-gray-100 px-2 py-0.5 rounded-full font-bold">
                        {so.total_items}
                      </span>
                    </td>
                    <td className="py-4 text-center text-gray-500 font-medium">
                      {so.production_date
                        ? new Date(so.production_date).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                    <td className="py-4 text-center text-gray-500">
                      {new Date(so.delivery_date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">

                        {!so.is_generated && (
                          <button
                            onClick={async () => {
                              try {
                                Swal.fire({
                                  title: "Mohon tunggu...",
                                  text: "Sedang generate finishing schedule",
                                  allowOutsideClick: false,
                                  didOpen: () => Swal.showLoading(),
                                });

                                // generate finishing di backend
                                await api.post(`/demand/${so.demand_id}/generate-finishing`);

                                Swal.close();
                                Swal.fire({
                                  icon: "success",
                                  title: "Berhasil!",
                                  text: "Finishing schedule berhasil digenerate",
                                });

                                // LANGSUNG load detail view tanpa harus klik manual
                                await handleShowDetail(so);

                                // pastikan view di-set ke 'detail'
                                setView("detail");

                              } catch (err) {
                                Swal.close();
                                Swal.fire({
                                  icon: "error",
                                  title: "Gagal",
                                  text: err.response?.data?.error || "Terjadi kesalahan saat generate finishing",
                                });
                                console.error(err);
                              }
                            }}
                            className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700"
                          >
                            Generate
                          </button>
                        )}

                        <button
                          onClick={() => handleShowDetail(so)}
                          disabled={!so.is_generated}
                          className={`px-3 py-1.5 rounded text-xs font-bold transition-all
        ${so.is_generated
                              ? "bg-indigo-600 text-white hover:bg-indigo-700"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"}
      `}
                        >
                          View Detail
                        </button>

                        <button
                          onClick={() => handleDelete(so.demand_id)}
                          className="bg-white border border-red-200 text-red-500 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-500 hover:text-white"
                        >
                          Delete
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


        {/* --- TAMPILAN 2: DETAIL MATRIX --- */}
        {view === "detail" && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">

            {/* TAB 1: MATRIX JADWAL */}
            {activeTab === 'matrix' && (
              <div className="overflow-x-auto border rounded-lg shadow-inner bg-gray-50">
                <table className="w-full text-[10px] border-collapse bg-white">
                  <thead>
                    {/* Header utama */}
                    <tr className="bg-gray-100 text-gray-600 font-bold uppercase">
                      <th className="border p-2 sticky left-0 bg-gray-100 z-20 min-w-[120px] text-left">Item Code</th>
                      <th className="border p-2 min-w-[150px] text-left">Description</th>
                      <th className="border p-2 w-12 text-center">UoM</th>
                      <th className="border p-2 w-16 text-center">Qty (m3)</th>
                      <th className="border p-2 w-16 text-center bg-indigo-50 text-indigo-700">Pcs</th>
                      {items[0]?.calendar?.map((day, i) => (
                        <th key={i} className="border p-1 text-center min-w-[90px]" colSpan="3">
                          {new Date(day.date).toLocaleDateString("id-ID", { day: '2-digit', month: 'short' })}
                        </th>
                      ))}
                    </tr>

                    {/* Sub-header shift */}
                    <tr className="bg-gray-50 text-[8px] text-gray-400">
                      <th className="border p-1 sticky left-0 bg-gray-50 z-20"></th>
                      <th className="border p-1"></th>
                      <th className="border p-1"></th>
                      <th className="border p-1"></th>
                      <th className="border p-1 bg-indigo-50/30"></th>
                      {items[0]?.calendar?.map((day, i) => (
                        <React.Fragment key={i}>
                          <th className="border p-1">S1</th>
                          <th className="border p-1">S2</th>
                          <th className="border p-1">S3</th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                        <td className="border p-2 font-bold sticky left-0 bg-white z-10 text-indigo-700">
                          {item.itemCode}
                        </td>
                        <td className="border p-2 text-gray-600 italic">{item.description || "-"}</td>
                        <td className="border p-2 text-center text-gray-500 uppercase">{item.uom || "PCS"}</td>
                        <td className="border p-2 text-center font-bold text-gray-900 bg-gray-50/50">{item.qty}</td>
                        <td className="border p-2 text-center font-black text-indigo-600 bg-indigo-50/20">
                          {Number(item.pcs || 0).toLocaleString("id-ID")}
                        </td>

                        {item.calendar?.map((day, dIdx) =>
                          ["shift1", "shift2", "shift3"].map((s) => (
                            <td
                              key={`${dIdx}-${s}`}
                              className={`border p-1 text-center font-bold ${day.shifts[s].active
                                ? day.shifts[s].type === "finishing"
                                  ? "bg-purple-600 text-white"
                                  : "bg-emerald-500 text-white"
                                : "text-gray-200"
                                }`}
                            >
                              {day.shifts[s].active ? day.shifts[s].qty : "-"}
                            </td>
                          ))
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Footer legend yang tidak ikut scroll */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100 text-[9px] text-gray-500 flex gap-4 items-center uppercase font-bold">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></div> Packing
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 bg-purple-600 rounded-sm"></div> Finishing
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 bg-white border border-gray-300 rounded-sm"></div> No Schedule
              </div>
              <div className="ml-auto text-indigo-600 font-black italic">
                S1/S2/S3 = Shift 1, 2, 3
              </div>
            </div>

            {/* TAB 2: EDIT JADWAL */}
            {activeTab === "bom" && (
              <div className="border rounded-lg shadow-inner bg-gray-50 p-5">
                <h1 className="text-xl font-bold mb-5 pb-2 border-b border-gray-200 text-gray-800">
                  Demand Planner – Cumulative Backward
                </h1>

                {/* Header Info */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-3 gap-4">
                    {[{ k: "soNo", l: "SO Number" }, { k: "soDate", l: "Tanggal SO" }, { k: "customer", l: "Customer" }].map((f) => (
                      <div key={f.k} className="flex flex-col">
                        <label className="text-xs font-bold text-gray-500 mb-1 uppercase">
                          {f.l}
                        </label>
                        <input
                          type={f.k === "soDate" ? "date" : "text"}
                          className="border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          value={header[f.k] || ""}
                          onChange={(e) =>
                            setHeader((prev) => ({
                              ...prev,
                              [f.k]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-blue-600 mb-1 uppercase">Tanggal Kirim (Delivery)</label>
                      <input type="date" className="border border-blue-200 p-2 rounded text-sm" value={header.deliveryDate} onChange={(e) => updateHeader("deliveryDate", e.target.value)} />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-bold text-orange-600 mb-1 uppercase">Tanggal Produksi</label>
                      <input type="date" className="border border-orange-200 p-2 rounded text-sm" value={header.productionDate} onChange={(e) => updateHeader("productionDate", e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Items Calendar */}
                {items.map((item, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 mb-6 bg-white shadow-sm">
                    <div className="flex items-end gap-3 mb-2 pb-4 border-b border-gray-100">
                      {/* Label Nomor Item */}
                      <div className={`h-10 w-10 rounded ${ITEM_COLORS[i % ITEM_COLORS.length]} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                        {i + 1}
                      </div>

                      {/* Item Code - Perbaikan: Ditambahkan onChange */}
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Item Code</label>
                        <input
                          type="text"
                          className="h-10 w-full border border-gray-200 px-3 rounded text-sm font-bold focus:border-blue-500 outline-none transition-all"
                          value={item.itemCode || ""}
                          onChange={(e) => updateItem(i, "itemCode", e.target.value)}
                        />
                      </div>

                      {/* Deskripsi - Perbaikan: Ditambahkan onChange */}
                      <div className="flex-[1.5]">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Deskripsi</label>
                        <input
                          type="text"
                          className="h-10 w-full border border-gray-200 px-3 rounded text-sm focus:border-blue-500 outline-none transition-all"
                          value={item.description || ""}
                          onChange={(e) => updateItem(i, "description", e.target.value)}
                        />
                      </div>

                      {/* INPUT QUANTITY (Volume/m3) */}
                      <div className="w-24">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Qty (m3)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="h-10 w-full border border-gray-200 px-2 rounded text-sm text-center focus:border-blue-500 outline-none"
                          value={item.qty || ""}
                          onChange={(e) => updateItem(i, "qty", e.target.value)}
                        />
                      </div>

                      {/* INPUT TOTAL PCS (Untuk Plotting) */}
                      <div className="w-24">
                        <label className="text-[10px] font-bold text-blue-600 uppercase">Total Pcs</label>
                        <input
                          type="number"
                          className="h-10 w-full border border-blue-200 px-2 rounded text-sm text-center font-bold focus:border-blue-500 outline-none"
                          value={item.pcs || ""}
                          onChange={(e) => updateItem(i, "pcs", e.target.value)}
                        />
                      </div>

                      {/* Tombol Hapus */}
                      <button
                        onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                        className="h-10 px-3 bg-red-50 text-red-500 border border-red-100 rounded text-[10px] font-bold hover:bg-red-500 hover:text-white transition-all uppercase"
                      >
                        Hapus
                      </button>
                    </div>

                    {/* Info Sisa Plotting */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-[11px] font-bold uppercase">
                        Sisa Plotting:
                        <span className={`ml-2 px-2 py-0.5 rounded ${Number(item.pcs) - getTotalPlottedQty(item.calendar) === 0 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                          {Number(item.pcs) - getTotalPlottedQty(item.calendar)} Pcs
                        </span>
                      </div>
                      <div className="text-[9px] text-gray-400 italic">*Plotting berkelanjutan dari posisi shift terakhir</div>
                    </div>

                    {/* Baris Kalender/Shift */}
                    <div className="overflow-x-auto pb-2">
                      <div className="flex gap-2">
                        {item.calendar.map((d, idx) => {
                          const isShip = header.deliveryDate && isSameDay(d.date, new Date(header.deliveryDate + "T00:00:00"));
                          return (
                            <div
                              key={idx}
                              className={`min-w-[130px] border rounded-lg p-2 text-[11px] transition-all ${isShip ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-200 bg-white shadow-sm'}`}
                            >
                              <div className={`text-center font-bold mb-1 border-b pb-1 ${isShip ? 'text-blue-700' : 'text-gray-400'}`}>
                                {formatDate(d.date)}
                                {isShip && <span className="block text-[9px] font-black uppercase">📦 Delivery</span>}
                              </div>
                              <div className="grid grid-cols-3 gap-1 pt-1">
                                {["shift1", "shift2", "shift3"].map((s) => (
                                  <div
                                    key={s}
                                    className={`relative h-7 border rounded flex items-center justify-center transition-all 
                      ${d.shifts[s].active
                                        ? `${ITEM_COLORS[i % ITEM_COLORS.length]} text-white border-transparent shadow-inner`
                                        : "bg-gray-50 text-gray-300 border-gray-100"
                                      } ${isShip ? "opacity-20 cursor-not-allowed" : ""}`}
                                  >
                                    {!isShip && (
                                      <>
                                        {/* Area Klik/Drag Toggle */}
                                        <div className="absolute inset-0 z-0 cursor-pointer"
                                          onMouseDown={(e) => {
                                            if (e.target === e.currentTarget) {
                                              const mode = e.shiftKey ? "on" : e.altKey ? "off" : "toggle";
                                              setDrag({ i, s, mode });
                                              toggleShift(i, idx, s, mode);
                                            }
                                          }}
                                          onMouseEnter={() => { if (drag && drag.i === i) toggleShift(i, idx, s, drag.mode); }}
                                        />
                                        {/* Input Angka Shift */}
                                        <input
                                          type="number"
                                          value={d.shifts[s].qty || ""}
                                          onChange={(e) => updateShiftQty(i, idx, s, e.target.value)}
                                          className={`relative z-10 w-full bg-transparent text-center font-bold text-[10px] focus:outline-none 
                            ${d.shifts[s].active ? "text-white" : "text-gray-400 opacity-0 hover:opacity-100"}`}
                                        />
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex flex-col gap-3 mt-6">
                  <button onClick={() => {
                    if (!header.deliveryDate) return;

                    const start = addDays(
                      new Date(header.deliveryDate + "T00:00:00"),
                      -13
                    );

                    setItems([...items, createItem(start)]);
                  }} className="w-full border border-gray-300 py-2 rounded text-sm font-bold text-gray-500 hover:bg-gray-100 uppercase">+ TAMBAH ITEM MANUAL</button>
                  <div className="flex gap-2">
                    <button onClick={handleExportExcel} disabled={loading} className="flex-1 bg-white border border-green-600 text-green-700 py-2 rounded font-bold text-sm hover:bg-green-50">EXPORT EXCEL</button>
                    <button onClick={handleSubmit} disabled={loading} className="flex-[2] bg-blue-600 text-white py-2 rounded font-bold text-sm hover:bg-blue-700 shadow-md">
                      {loading ? "MENYIMPAN..." : "SIMPAN PRODUCTION DEMAND"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
