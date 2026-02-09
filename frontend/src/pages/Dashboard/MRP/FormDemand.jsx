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
    api.get("/sales-orders").then(res => setSalesOrders(res.data));
  }, []);

  const handleSelectSO = async (e) => {
    const soId = e.target.value;
    setSelectedSO(soId);
    if (!soId) return;

    try {
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
        qty: it.qty,
      }));

      setItems(autoPlotGlobalBackward(initialItems, dDate));
    } catch {
      Swal.fire("Error", "Gagal load SO", "error");
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
      const targetDay = newList[itemIdx].calendar[dayIdx];
      const current = targetDay.shifts[shift].active;
      targetDay.shifts[shift].active = mode === "on" ? true : mode === "off" ? false : !current;
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
    // 1. Validasi Input Header
    if (!header.soNo) return Swal.fire("Peringatan", "Pilih Sales Order terlebih dahulu", "warning");
    if (!header.deliveryDate) return Swal.fire("Peringatan", "Isi Tanggal Kirim (Delivery)", "warning");
    if (!header.productionDate) return Swal.fire("Peringatan", "Isi Tanggal Produksi sebelum menyimpan", "warning");
    
    // 2. Validasi Item
    if (items.length === 0) return Swal.fire("Peringatan", "Minimal harus ada 1 item", "warning");

    try {
      setLoading(true);
      
      // Mengirim data ke backend (Pastikan endpoint ini sesuai di Route Express Anda)
      const response = await api.post("/demand", { header, items });
      
      if (response.status === 201 || response.status === 200) {
        Swal.fire({
          title: "Berhasil!",
          text: "Data Perencanaan Produksi (Demand) telah tersimpan di database.",
          icon: "success",
          confirmButtonColor: "#3085d6"
        });
        
        // Opsional: Reset form atau arahkan ke halaman list
        // window.location.reload(); 
      }
    } catch (error) {
      console.error("Submit Error:", error);
      const errorMsg = error.response?.data?.error || error.message;
      Swal.fire("Error", "Gagal simpan ke database: " + errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-6 bg-white rounded-xl shadow w-full" onMouseUp={() => setDrag(null)}>
      <h1 className="text-xl font-semibold mb-4">Demand Planner – Backward Planning</h1>

      {/* Select SO */}
      <div className="mb-6">
        <label className="text-xs font-medium text-gray-600 mb-1 block">Sales Order</label>
        <select value={selectedSO} onChange={handleSelectSO} className="border p-2 rounded text-sm w-full">
          <option value="">-- Pilih Sales Order --</option>
          {salesOrders.map((so) => (
            <option key={so.id} value={so.id}>{so.so_number} - {so.customer_name}</option>
          ))}
        </select>
      </div>

      {/* Header Info */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          {["soNo", "soDate", "customer"].map((k) => (
            <div key={k} className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1 uppercase">
                {k === "soNo" ? "SO Number" : k === "soDate" ? "Tanggal SO" : "Customer"}
              </label>
              <input
                type={k === "soDate" ? "date" : "text"}
                className="border p-2 rounded text-sm bg-gray-50"
                value={header[k]}
                readOnly={k !== "productionDate"}
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Tanggal Kirim (Delivery)</label>
            <input type="date" className="border p-2 rounded text-sm bg-blue-50 border-blue-200" value={header.deliveryDate} onChange={(e) => updateHeader("deliveryDate", e.target.value)} />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Tanggal Produksi</label>
            <input
              type="date"
              className="border p-2 rounded text-sm bg-yellow-50 border-yellow-200" // Beri warna beda agar tahu ini bisa diisi
              value={header.productionDate}
              onChange={(e) => updateHeader("productionDate", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Items Calendar */}
      {items.map((item, i) => (
        <div key={i} className="border rounded-xl p-4 mb-6 bg-gray-50">
          <div className="mb-3 flex justify-between items-center text-sm font-semibold text-gray-700">
            <div>{item.itemCode || `Item ${i + 1}`} – Total Qty: {item.qty || 0}</div>
            <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-red-600 text-xs border px-2 py-1 rounded hover:bg-red-50">Remove</button>
          </div>

          <div className="overflow-x-auto">
            <div className="flex gap-2">
              {item.calendar.map((d, idx) => {
                const isShip = header.deliveryDate && d.date.toDateString() === new Date(header.deliveryDate).toDateString();
                return (
                  <div key={idx} className={`min-w-[140px] border rounded-lg p-2 text-xs bg-white ${isShip ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
                    <div className="text-center font-bold mb-1">{formatDate(d.date)}</div>
                    <div className="grid grid-cols-3 gap-1">
                      {["shift1", "shift2", "shift3"].map((s) => (
                        <div
                          key={s}
                          onMouseDown={(e) => {
                            const mode = e.shiftKey ? "on" : e.altKey ? "off" : "toggle";
                            setDrag({ i, s, mode });
                            toggleShift(i, idx, s, mode);
                          }}
                          onMouseEnter={() => drag && drag.i === i && toggleShift(i, idx, drag.s, drag.mode)}
                          className={`h-8 border rounded flex items-center justify-center cursor-pointer transition-colors ${d.shifts[s].active ? `${ITEM_COLORS[i % ITEM_COLORS.length]} text-white border-transparent` : "bg-gray-100 text-gray-300"}`}
                        >
                          {d.shifts[s].active ? "50" : ""}
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

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button onClick={() => setItems([...items, createItem(new Date())])} className="border-2 border-dashed border-gray-300 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50">
          + Add Manual Item
        </button>

        <div className="flex gap-3">
          <button onClick={handleExportExcel} disabled={loading} className="bg-green-600 text-white py-3 rounded-xl w-1/3 hover:bg-green-700 font-bold flex items-center justify-center gap-2">
            {loading ? "..." : "📊 EXCEL"}
          </button>
          <button onClick={handleSubmit} disabled={loading} className="bg-blue-600 text-white py-3 rounded-xl w-2/3 hover:bg-blue-700 font-bold">
            {loading ? "SAVING..." : "SAVE DEMAND"}
          </button>
        </div>
      </div>
    </div>
  );
}