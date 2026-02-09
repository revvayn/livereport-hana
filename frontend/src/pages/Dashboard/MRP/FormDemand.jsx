// FormDemand.js
import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import api from "../../../api/api";

const ITEM_COLORS = ["bg-green-600", "bg-blue-600", "bg-purple-600", "bg-orange-600", "bg-pink-600", "bg-teal-600"];

/* ================= HELPERS ================= */
const addDays = (date, d) => {
  const n = new Date(date);
  n.setDate(n.getDate() + d);
  return n;
};

const formatDate = (d) => d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

const toInputDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
};

const buildCalendar = (startDate, days = 14) => {
  return Array.from({ length: days }, (_, i) => ({
    date: addDays(startDate, i),
    shifts: {
      shift1: { active: false, qty: 50 },
      shift2: { active: false, qty: 50 },
      shift3: { active: false, qty: 50 },
    },
  }));
};

const createItem = (start) => ({
  itemId: null,
  itemCode: "",
  description: "",
  uom: "",
  qty: "",
  calendarStart: start,
  calendar: buildCalendar(start),
});

/* ================= LOGIC: GLOBAL BACKWARD PLOTTING ================= */
const autoPlotGlobalBackward = (items, deliveryDate) => {
  if (!deliveryDate || items.length === 0) return items;

  const delivery = new Date(deliveryDate);
  const startDate = addDays(delivery, -13);
  const h1DateStr = addDays(delivery, -1).toDateString();

  const cleanedItems = items.map((it) => ({
    ...it,
    calendarStart: startDate,
    calendar: buildCalendar(startDate, 14),
  }));

  const taskQueue = [];
  cleanedItems.forEach((it, idx) => {
    const shiftsNeeded = Math.ceil((Number(it.qty) || 0) / 50);
    for (let n = 0; n < shiftsNeeded; n++) {
      taskQueue.push({ itemIdx: idx });
    }
  });

  const h1Index = cleanedItems[0].calendar.findIndex(d => d.date.toDateString() === h1DateStr);

  if (h1Index !== -1) {
    let qIdx = 0;
    for (let d = h1Index; d >= 0; d--) {
      for (const s of ["shift3", "shift2", "shift1"]) {
        if (qIdx >= taskQueue.length) break;
        const task = taskQueue[qIdx];
        cleanedItems[task.itemIdx].calendar[d].shifts[s].active = true;
        qIdx++;
      }
      if (qIdx >= taskQueue.length) break;
    }
  }
  return cleanedItems;
};

export default function FormDemand() {
  const [salesOrders, setSalesOrders] = useState([]);
  const [selectedSO, setSelectedSO] = useState("");
  const [header, setHeader] = useState({
    soNo: "", soDate: "", customer: "", deliveryDate: "", productionDate: "",
  });
  const [items, setItems] = useState([createItem(new Date())]);
  const [drag, setDrag] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/sales-orders")
      .then(res => setSalesOrders(res.data))
      .catch(err => console.error("Gagal load daftar SO", err));
  }, []);

  const handleSelectSO = async (e) => {
    const soId = e.target.value;
    setSelectedSO(soId);
    if (!soId) return;

    try {
      setLoading(true);
      const res = await api.get(`/demand/from-so/${soId}`);
      const h = res.data.header;
      const dDate = toInputDate(h.deliveryDate);

      setHeader({
        soNo: h.soNo || "",
        soDate: toInputDate(h.soDate),
        customer: h.customer || "",
        deliveryDate: dDate,
        productionDate: "",
      });

      const initialItems = res.data.items.map(it => ({
        ...createItem(new Date()),
        itemId: it.itemId,
        itemCode: it.itemCode,
        description: it.description,
        uom: it.uom || 'PCS', // Perbaikan: menggunakan 'it' bukan 'item'
        qty: it.qty,
      }));

      setItems(autoPlotGlobalBackward(initialItems, dDate));
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal load data detail SO", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateHeader = (k, v) => {
    setHeader(prev => {
      const next = { ...prev, [k]: v };
      if (k === "deliveryDate") {
        setItems(oldItems => autoPlotGlobalBackward(oldItems, v));
      }
      return next;
    });
  };

  const toggleShift = useCallback((itemIdx, dayIdx, shift, mode) => {
    setItems(prev => {
      const newList = [...prev];
      const targetDay = { ...newList[itemIdx].calendar[dayIdx] };
      const current = targetDay.shifts[shift].active;

      targetDay.shifts[shift] = {
        ...targetDay.shifts[shift],
        active: mode === "on" ? true : mode === "off" ? false : !current
      };

      newList[itemIdx].calendar[dayIdx] = targetDay;
      return newList;
    });
  }, []);

  const handleExportExcel = async () => {
    if (items.length === 0 || !header.soNo) {
      return Swal.fire("Peringatan", "Pilih SO dan pastikan item tersedia", "warning");
    }

    try {
      setLoading(true);
      const response = await api.post("/demand/export-excel", { header, items }, {
        responseType: 'blob',
      });

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
    if (!header.soNo) return Swal.fire("Peringatan", "Pilih Sales Order terlebih dahulu", "warning");
    if (!header.deliveryDate) return Swal.fire("Peringatan", "Isi Tanggal Kirim (Delivery)", "warning");
    if (!header.productionDate) return Swal.fire("Peringatan", "Isi Tanggal Produksi sebelum menyimpan", "warning");
    if (items.length === 0) return Swal.fire("Peringatan", "Minimal harus ada 1 item", "warning");

    try {
      setLoading(true);
      const response = await api.post("/demand", { header, items });

      if (response.status === 201 || response.status === 200) {
        Swal.fire({
          title: "Berhasil!",
          text: "Data Perencanaan Produksi (Demand) telah tersimpan.",
          icon: "success",
          confirmButtonColor: "#3085d6"
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      Swal.fire("Error", "Gagal simpan ke database: " + errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };
  const updateItem = (idx, field, value) => {
    setItems(prev => {
      const newList = [...prev];
      newList[idx] = { ...newList[idx], [field]: value };
      return newList;
    });
  };
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-300 w-full" onMouseUp={() => setDrag(null)}>
      <h1 className="text-xl font-bold mb-5 pb-2 border-b border-gray-200 text-gray-800">
        Demand Planner – Backward Planning
      </h1>

      {/* Select SO */}
      <div className="mb-6">
        <label className="text-xs font-bold text-gray-600 mb-1 block uppercase">Pilih Sales Order</label>
        <select
          value={selectedSO}
          onChange={handleSelectSO}
          className="border border-gray-300 p-2 rounded text-sm w-full bg-white focus:outline-none focus:border-blue-500 shadow-sm"
        >
          <option value="">-- Pilih Sales Order --</option>
          {salesOrders.map((so) => (
            <option key={so.id} value={so.id}>{so.so_number} - {so.customer_name}</option>
          ))}
        </select>
      </div>

      {/* Header Info */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: "soNo", label: "SO Number", type: "text" },
            { key: "soDate", label: "Tanggal SO", type: "date" },
            { key: "customer", label: "Customer", type: "text" }
          ].map((field) => (
            <div key={field.key} className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 mb-1 uppercase">{field.label}</label>
              <input
                type={field.type}
                className="border border-gray-200 p-2 rounded text-sm bg-gray-50 text-gray-600 outline-none"
                value={header[field.key]}
                readOnly
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-blue-600 mb-1 uppercase">Tanggal Kirim (Delivery)</label>
            <input
              type="date"
              className="border border-blue-200 p-2 rounded text-sm bg-white focus:ring-1 focus:ring-blue-400 outline-none"
              value={header.deliveryDate}
              onChange={(e) => updateHeader("deliveryDate", e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-orange-600 mb-1 uppercase">Tanggal Produksi</label>
            <input
              type="date"
              className="border border-orange-200 p-2 rounded text-sm bg-white focus:ring-1 focus:ring-orange-400 outline-none"
              value={header.productionDate}
              onChange={(e) => updateHeader("productionDate", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Items Calendar */}
      {items.map((item, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 mb-6 bg-white shadow-sm">

          {/* Item Info Inputs (Symmetrical Header Style) */}
          <div className="flex items-end gap-3 mb-4 pb-4 border-b border-gray-100">

            {/* Indikator Nomor/Warna - Fixed Width agar tidak goyang */}
            <div className="flex-none w-12">
              <div className={`h-10 rounded ${ITEM_COLORS[i % ITEM_COLORS.length]} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                {i + 1}
              </div>
            </div>

            {/* Item Code - Flex 1 */}
            <div className="flex-1 min-w-[120px] flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Item Code</label>
              <input
                type="text"
                className="h-10 border border-gray-200 px-3 rounded text-sm bg-gray-50 text-gray-700 font-bold focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                value={item.itemCode || ""}
                placeholder="Kode..."
                onChange={(e) => updateItem(i, "itemCode", e.target.value)}
              />
            </div>

            {/* Deskripsi Barang - Flex 3 agar lebih lebar dari yang lain */}
            <div className="flex-[3] min-w-[200px] flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Deskripsi Barang</label>
              <input
                type="text"
                className="h-10 border border-gray-200 px-3 rounded text-sm bg-gray-50 text-gray-600 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                value={item.description || ""}
                placeholder="Nama barang..."
                onChange={(e) => updateItem(i, "description", e.target.value)}
              />
            </div>

            {/* UoM - Fixed Width */}
            <div className="w-20 flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">UoM</label>
              <input
                type="text"
                className="h-10 border border-gray-200 rounded text-sm bg-gray-50 text-gray-600 focus:outline-none focus:border-blue-400 text-center uppercase"
                value={item.uom || ""}
                placeholder="Unit"
                onChange={(e) => updateItem(i, "uom", e.target.value)}
              />
            </div>

            {/* Total Qty - Flex 1 */}
            <div className="flex-1 min-w-[100px] flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Total Qty SO</label>
              <input
                type="number"
                className="h-10 border border-gray-200 px-3 rounded text-sm bg-white text-blue-700 font-bold focus:outline-none focus:ring-1 focus:ring-blue-400"
                value={item.qty || ""}
                placeholder="0"
                onChange={(e) => updateItem(i, "qty", e.target.value)}
              />
            </div>

            {/* Tombol Hapus - Fixed Width */}
            <div className="flex-none">
              <button
                onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                className="h-10 px-4 bg-red-50 text-red-500 border border-red-100 rounded text-[10px] font-bold hover:bg-red-500 hover:text-white transition-all uppercase flex items-center justify-center"
              >
                Hapus Item
              </button>
            </div>
          </div>

          {/* Scrollable Calendar Area (Tetap Sama) */}
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-4">
              {item.calendar.map((d, idx) => {
                const isShip = header.deliveryDate && d.date.toDateString() === new Date(header.deliveryDate).toDateString();
                return (
                  <div
                    key={idx}
                    className={`min-w-[130px] border rounded p-2 text-[11px] transition-all ${isShip
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-inset'
                      : 'border-gray-200 bg-white shadow-sm'
                      }`}
                  >
                    <div className={`text-center font-bold mb-1 border-b pb-1 ${isShip ? 'border-blue-300 text-blue-800' : 'border-gray-100 text-gray-400'}`}>
                      {formatDate(d.date)}
                      {isShip && <span className="block text-[9px] uppercase tracking-tighter">[ Delivery ]</span>}
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1">
                      {["shift1", "shift2", "shift3"].map((s) => (
                        <div
                          key={s}
                          className={`relative h-7 border rounded flex items-center justify-center transition-colors ${d.shifts[s].active
                            ? `${ITEM_COLORS[i % ITEM_COLORS.length]} text-white border-transparent shadow-inner`
                            : "bg-gray-50 text-gray-300 border-gray-100"
                            }`}
                        >
                          <div
                            className="absolute inset-0 cursor-pointer z-0"
                            onMouseDown={(e) => {
                              const mode = e.shiftKey ? "on" : e.altKey ? "off" : "toggle";
                              setDrag({ i, s, mode });
                              toggleShift(i, idx, s, mode);
                            }}
                            onMouseEnter={() => {
                              if (drag && drag.i === i && drag.s === s) {
                                toggleShift(i, idx, drag.s, drag.mode);
                              }
                            }}
                          />

                          {d.shifts[s].active && (
                            <input
                              type="number"
                              value={d.shifts[s].qty || ""}
                              onChange={(e) => {
                                const newQty = e.target.value;
                                const newItems = [...items];
                                newItems[i].calendar[idx].shifts[s].qty = newQty;
                                setItems(newItems);
                              }}
                              className="relative z-10 w-full bg-transparent text-center font-bold focus:outline-none"
                            />
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

      {/* Legend & Actions */}
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 border-b pb-1">Keterangan:</h3>
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              item.itemCode && (
                <div key={i} className="flex items-center gap-2 bg-white border border-gray-200 px-2 py-1 rounded">
                  <div className={`w-2.5 h-2.5 rounded-full ${ITEM_COLORS[i % ITEM_COLORS.length]}`}></div>
                  <span className="text-[10px] font-bold text-gray-600 uppercase">
                    {item.itemCode} <span className="text-gray-400 font-normal italic">({item.uom})</span>
                  </span>
                </div>
              )
            ))}
          </div>
          <div className="flex items-center gap-2 border-l pl-6 border-gray-200">
            <div className="w-4 h-4 border-2 border-blue-600 bg-blue-100 rounded"></div>
            <span className="text-[11px] font-bold text-blue-700 uppercase">Target Delivery</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-6">
        <button
          onClick={() => setItems([...items, createItem(new Date())])}
          className="w-full border border-gray-300 py-2 rounded text-sm font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all"
        >
          + TAMBAH ITEM MANUAL
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            disabled={loading}
            className="flex-1 bg-white border border-green-600 text-green-700 py-2 rounded font-bold text-sm hover:bg-green-50 disabled:opacity-50 transition-colors"
          >
            {loading ? "..." : "EXPORT EXCEL"}
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] bg-blue-600 text-white py-2 rounded font-bold text-sm hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors shadow-md"
          >
            {loading ? "MENYIMPAN..." : "SIMPAN PRODUCTION DEMAND"}
          </button>
        </div>
      </div>
    </div>
  );
}