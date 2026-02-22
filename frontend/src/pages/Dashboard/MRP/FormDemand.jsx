// FormDemand.js
import { useEffect, useState, useCallback } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import api from "../../../api/api";
import { useMemo } from "react";

const ITEM_COLORS = ["bg-green-600", "bg-blue-600", "bg-purple-600", "bg-orange-600", "bg-pink-600", "bg-teal-600"];

/* ================= HELPERS ================= */
const addDays = (date, d) => {
  const n = new Date(date);
  n.setDate(n.getDate() + d);
  return n;
};


const isSameDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

const formatDate = (d) => d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

const toInputDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toISOString().split("T")[0];
};

const buildCalendar = (startDate, days = 14) => {
  return Array.from({ length: days }, (_, i) => ({
    date: addDays(startDate, i),
    shifts: {
      shift1: { active: false, qty: 0 }, // Default qty 0 agar bersih
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
      if (shift.active) {
        total += Number(shift.qty) || 0;
      }
    });
  });
  return total;
};

/* ================= LOGIC: CUMULATIVE BACKWARD PLOTTING ================= */
const autoPlotGlobalBackward = (items, deliveryDate) => {
  if (!deliveryDate || items.length === 0) return items;

  const delivery = new Date(deliveryDate + "T00:00:00");
  const startDate = addDays(delivery, -13);

  // Inisialisasi kalender kosong untuk semua item
  let updatedItems = items.map((it) => ({
    ...it,
    calendarStart: startDate,
    calendar: buildCalendar(startDate, 14),
  }));

  // Tracker untuk posisi plotting terakhir (Mulai dari H-1, Shift 3)
  let currentDayIdx = 12;
  let currentShift = 3;

  updatedItems.forEach((item) => {
    let targetPcs = Number(item.pcs) || 0;
    if (targetPcs <= 0) return;

    let currentPlotted = 0;

    // Lanjutkan plotting dari posisi tracker terakhir
    while (currentPlotted < targetPcs && currentDayIdx >= 0) {
      const sKey = `shift${currentShift}`;
      const remaining = targetPcs - currentPlotted;
      const amountToPlot = remaining < 50 ? remaining : 50;

      item.calendar[currentDayIdx].shifts[sKey].active = true;
      item.calendar[currentDayIdx].shifts[sKey].qty = amountToPlot;
      currentPlotted += amountToPlot;

      // Geser tracker mundur
      currentShift--;
      if (currentShift < 1) {
        currentShift = 3;
        currentDayIdx--;
      }
    }
  });

  return updatedItems;
};

/* ================= COMPONENT ================= */
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
      const res = await api.get(`/demand/sales-orders/${soId}`);
      const { header: resHeader, items: rawItems } = res.data;

      const newHeader = {
        soNo: resHeader.so_number || "",
        soDate: toInputDate(resHeader.so_date),
        customer: resHeader.customer_name || "",
        deliveryDate: toInputDate(resHeader.delivery_date),
        productionDate: "",
      };
      setHeader(newHeader);

      const initialItems = (rawItems || []).map(it => ({
        ...createItem(new Date()),
        itemId: it.item_id,
        itemCode: it.item_code,
        description: it.description,
        uom: it.uom || 'PCS',
        qty: Number(it.quantity || 0),
        pcs: Number(it.pcs || 0),
      }));

      if (newHeader.deliveryDate && initialItems.length > 0) {
        setItems(autoPlotGlobalBackward(initialItems, newHeader.deliveryDate));
      } else {
        setItems(initialItems);
      }
    } catch (error) {
      Swal.fire("Error", "Gagal memuat detail Sales Order", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (idx, field, value) => {
    setItems(prev => {
      const newList = [...prev];
      newList[idx] = { ...newList[idx], [field]: value };
      if (field === "pcs") {
        return autoPlotGlobalBackward(newList, header.deliveryDate);
      }
      return newList;
    });
  };

  const updateHeader = (k, v) => {
    setHeader(prev => {
      const nextHeader = { ...prev, [k]: v };
      if (k === "deliveryDate") {
        setItems(oldItems => autoPlotGlobalBackward(oldItems, v));
      }
      return nextHeader;
    });
  };

  /* ================= VALIDATION HELPER ================= */
  const validateQtyLimit = (item, currentShiftValue, newValue) => {
    const targetPcs = Number(item.pcs) || 0;
    const currentTotalPlotted = getTotalPlottedQty(item.calendar);

    // Hitung berapa total jika nilai shift ini diupdate
    const newTotal = currentTotalPlotted - Number(currentShiftValue || 0) + Number(newValue);

    if (newTotal > targetPcs) {
      Swal.fire({
        icon: 'warning',
        title: 'Melebihi Kapasitas',
        text: `Total plotting (${newTotal} Pcs) tidak boleh melebihi Total Pcs (${targetPcs} Pcs).`,
        timer: 2000,
        showConfirmButton: false
      });
      return false;
    }
    return true;
  };

  /* ================= UPDATED FUNCTIONS INSIDE COMPONENT ================= */

  const toggleShift = useCallback((itemIdx, dayIdx, shift, mode) => {
    setItems(prev => {
      const newList = [...prev];
      const item = newList[itemIdx];
      const targetDay = { ...item.calendar[dayIdx] };
      const currentActive = targetDay.shifts[shift].active;
      const nextActive = mode === "on" ? true : mode === "off" ? false : !currentActive;

      if (nextActive && !currentActive) {
        const currentTotal = getTotalPlottedQty(item.calendar);
        const targetPcs = Number(item.pcs) || 0;
        const remaining = targetPcs - currentTotal;

        if (remaining <= 0) {
          // Alert jika mencoba mengaktifkan shift tapi sisa pcs sudah 0
          Swal.fire({ icon: 'info', title: 'Plotting Selesai', text: 'Semua PCS sudah teralokasi.', timer: 1500, showConfirmButton: false });
          return prev;
        }

        targetDay.shifts[shift] = {
          ...targetDay.shifts[shift],
          active: true,
          qty: remaining < 50 ? remaining : 50
        };
      } else {
        targetDay.shifts[shift].active = nextActive;
        // Jika di-off-kan, qty jadi 0
        if (!nextActive) targetDay.shifts[shift].qty = 0;
      }

      newList[itemIdx].calendar[dayIdx] = targetDay;
      return newList;
    });
  }, []);

  const updateShiftQty = (itemIdx, dayIdx, shift, value) => {
    const valNum = Number(value) || 0;

    setItems(prev => {
      const newList = [...prev];
      const item = newList[itemIdx];
      const currentVal = item.calendar[dayIdx].shifts[shift].qty;

      // Jalankan validasi
      if (!validateQtyLimit(item, currentVal, valNum)) {
        return prev; // Jika gagal, jangan update state
      }

      const targetDay = { ...item.calendar[dayIdx] };
      targetDay.shifts[shift] = {
        ...targetDay.shifts[shift],
        qty: valNum,
        active: valNum > 0
      };
      newList[itemIdx].calendar[dayIdx] = targetDay;
      return newList;
    });
  };

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
    if (!header.soNo || !header.deliveryDate || !header.productionDate) {
      return Swal.fire("Peringatan", "Lengkapi semua tanggal!", "warning");
    }
    try {
      setLoading(true);
      await api.post("/demand", { header, items });
      Swal.fire("Berhasil!", "Data tersimpan.", "success");
    } catch (error) {
      Swal.fire("Error", "Gagal simpan data", "error");
    } finally {
      setLoading(false);
    }
  };

  const options = useMemo(() => salesOrders.map((so) => ({
    value: so.id,
    label: `${so.so_number} - ${so.customer_name}`,
  })), [salesOrders]);

  return (
    <div
      className="min-h-screen p-6 bg-white rounded-lg border border-gray-300 w-full overflow-y-auto"
      onMouseUp={() => setDrag(null)}
    >
      <h1 className="text-xl font-bold mb-5 pb-2 border-b border-gray-200 text-gray-800">
        Demand Planner – Cumulative Backward
      </h1>

      {/* Select SO */}
      <div className="mb-6">
        <label className="text-xs font-bold text-gray-600 mb-1 block uppercase">
          Pilih Sales Order
        </label>

        <Select
          options={options}
          value={options.find((opt) => opt.value === selectedSO) || null}
          onChange={(selected) => {
            // Trigger fungsi handleSelectSO yang sudah ada di kode Anda
            handleSelectSO({ target: { value: selected ? selected.value : "" } });
          }}
          isSearchable={true}
          isClearable={true}
          placeholder="-- Cari SO Number atau Nama Customer --"
          className="text-sm"
          // Agar dropdown tidak terpotong container:
          menuPortalTarget={document.body}
          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
        />
      </div>

      {/* Header Info */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          {[{ k: "soNo", l: "SO Number" }, { k: "soDate", l: "Tanggal SO" }, { k: "customer", l: "Customer" }].map((f) => (
            <div key={f.k} className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 mb-1 uppercase">{f.l}</label>
              <input type="text" className="border border-gray-200 p-2 rounded text-sm bg-gray-50 text-gray-600" value={header[f.k]} readOnly />
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
        <button onClick={() => setItems([...items, createItem(new Date())])} className="w-full border border-gray-300 py-2 rounded text-sm font-bold text-gray-500 hover:bg-gray-100 uppercase">+ TAMBAH ITEM MANUAL</button>
        <div className="flex gap-2">
          <button onClick={handleExportExcel} disabled={loading} className="flex-1 bg-white border border-green-600 text-green-700 py-2 rounded font-bold text-sm hover:bg-green-50">EXPORT EXCEL</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-[2] bg-blue-600 text-white py-2 rounded font-bold text-sm hover:bg-blue-700 shadow-md">
            {loading ? "MENYIMPAN..." : "SIMPAN PRODUCTION DEMAND"}
          </button>
        </div>
      </div>
    </div>
  );
}