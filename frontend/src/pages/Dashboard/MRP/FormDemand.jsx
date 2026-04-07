import { useEffect, useState, useCallback, useMemo } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import api from "../../../api/api";

const ITEM_COLORS = ["bg-green-600", "bg-blue-600", "bg-purple-600", "bg-orange-600", "bg-pink-600", "bg-teal-600"];

/* ================= HELPERS ================= */
const formatDate = (d) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const toInputDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toISOString().split("T")[0];
};

const formatToYYYYMMDD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const buildCalendar = (deliveryDate, days = 14) => {
  return Array.from({ length: days }, (_, i) => {
    const offset = i - (days - 1);
    const newDate = new Date(deliveryDate);
    newDate.setDate(newDate.getDate() + offset);

    return {
      date: formatToYYYYMMDD(newDate),
      shifts: {
        shift1: { active: false, qty: 0 },
        shift2: { active: false, qty: 0 },
        shift3: { active: false, qty: 0 },
      },
    };
  });
};

const createItem = (start) => ({
  itemId: null,
  itemCode: "",
  description: "",
  uom: "",
  qty: "",
  pcs: "",
  capacity_per_shift: 0,
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
const autoPlotGlobalBackward = (items, deliveryDate, holidays = []) => {
  if (!deliveryDate || items.length === 0) return items;

  let updatedItems = items.map((it) => ({
    ...it,
    calendar: buildCalendar(new Date(deliveryDate + "T00:00:00"), 14),
  }));

  let currentDayIdx = 12; // Mulai dari H-1 Delivery
  let currentShift = 3;

  updatedItems.forEach((item) => {
    let targetPcs = Number(item.pcs) || 0;
    const itemCapacity = Number(item.capacity_per_shift) || 0;

    if (targetPcs <= 0 || itemCapacity <= 0) return;

    let currentPlotted = 0;

    while (currentPlotted < targetPcs && currentDayIdx >= 0) {
      const dateString = item.calendar[currentDayIdx].date;
      const dateObj = new Date(dateString);
      const isSunday = dateObj.getDay() === 0;
      const isHoliday = (holidays || []).includes(dateString);

      if (isHoliday || isSunday) {
        currentDayIdx--;
        currentShift = 3;
        continue;
      }

      const sKey = `shift${currentShift}`;
      const remaining = targetPcs - currentPlotted;
      const amountToPlot = Math.min(remaining, itemCapacity);

      item.calendar[currentDayIdx].shifts[sKey].active = true;
      item.calendar[currentDayIdx].shifts[sKey].qty = amountToPlot;
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
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const initData = async () => {
      try {
        const [soRes, holidayRes] = await Promise.all([
          api.get("/demand/sales-orders"),
          api.get("/production/holidays")
        ]);
        setSalesOrders(soRes.data);
        setHolidays(holidayRes.data.map(h => h.holiday_date.split('T')[0]));
      } catch (err) {
        console.error("Gagal load data awal", err);
      }
    };
    initData();
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
        capacity_per_shift: Number(it.capacity_per_shift || 0),
      }));

      if (newHeader.deliveryDate && initialItems.length > 0) {
        setItems(autoPlotGlobalBackward(initialItems, newHeader.deliveryDate, holidays));
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
      if (field === "pcs" || field === "capacity_per_shift") {
        return autoPlotGlobalBackward(newList, header.deliveryDate, holidays);
      }
      return newList;
    });
  };

  const updateHeader = (k, v) => {
    setHeader(prev => {
      const nextHeader = { ...prev, [k]: v };
      if (k === "deliveryDate") {
        setItems(oldItems => autoPlotGlobalBackward(oldItems, v, holidays));
      }
      return nextHeader;
    });
  };

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
        const itemCap = Number(item.capacity_per_shift) || 0;

        if (remaining <= 0) return prev;

        targetDay.shifts[shift] = {
          ...targetDay.shifts[shift],
          active: true,
          qty: remaining < itemCap ? remaining : itemCap
        };
      } else {
        targetDay.shifts[shift].active = nextActive;
        if (!nextActive) targetDay.shifts[shift].qty = 0;
      }

      newList[itemIdx].calendar[dayIdx] = targetDay;
      return newList;
    });
  }, [holidays]);

  const updateShiftQty = (itemIdx, dayIdx, shift, value) => {
    const valNum = Number(value) || 0;
    setItems(prev => {
      const newList = [...prev];
      const item = newList[itemIdx];
      
      const currentTotal = getTotalPlottedQty(item.calendar);
      const currentVal = item.calendar[dayIdx].shifts[shift].qty;
      const newTotal = currentTotal - currentVal + valNum;

      if (newTotal > Number(item.pcs)) {
        Swal.fire({ icon: 'warning', title: 'Limit!', text: 'Melebihi Total Pcs', timer: 1500, showConfirmButton: false });
        return prev;
      }

      const targetDay = { ...item.calendar[dayIdx] };
      targetDay.shifts[shift] = { ...targetDay.shifts[shift], qty: valNum, active: valNum > 0 };
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
      const link = document.body.appendChild(document.createElement('a'));
      link.href = url;
      link.download = `Demand_${header.soNo}.xlsx`;
      link.click();
      link.remove();
    } catch (error) {
      Swal.fire("Error", "Gagal export Excel", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!header.soNo || !header.deliveryDate) return Swal.fire("Peringatan", "Lengkapi SO & Tanggal!", "warning");
    try {
      setLoading(true);
      await api.post("/demand", { header, items });
      await Swal.fire("Berhasil!", "Data tersimpan.", "success");
      window.location.reload();
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
    <div className="min-h-screen p-6 bg-white rounded-lg border border-gray-300 w-full overflow-y-auto" onMouseUp={() => setDrag(null)}>
      <h1 className="text-xl font-bold mb-5 pb-2 border-b border-gray-200 text-gray-800">PRODUCTION DEMAND FORM</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-3">
          <label className="text-xs font-bold text-gray-600 mb-1 block uppercase">Pilih Sales Order</label>
          <Select
            options={options}
            value={options.find((opt) => opt.value === selectedSO) || null}
            onChange={(selected) => handleSelectSO({ target: { value: selected ? selected.value : "" } })}
            isSearchable isClearable placeholder="-- Cari SO Number --" className="text-sm"
          />
        </div>
      </div>

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

      {items.map((item, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 mb-6 bg-white shadow-sm">
          <div className="flex items-end gap-3 mb-2 pb-4 border-b border-gray-100">
            <div className={`h-10 w-10 rounded ${ITEM_COLORS[i % ITEM_COLORS.length]} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>{i + 1}</div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Item Code</label>
              <input type="text" className="h-10 w-full border border-gray-200 px-3 rounded text-sm font-bold" value={item.itemCode || ""} onChange={(e) => updateItem(i, "itemCode", e.target.value)} />
            </div>
            <div className="flex-[1.5]">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Deskripsi</label>
              <input type="text" className="h-10 w-full border border-gray-200 px-3 rounded text-sm" value={item.description || ""} onChange={(e) => updateItem(i, "description", e.target.value)} />
            </div>
            <div className="w-24">
              <label className="text-[10px] font-bold text-blue-600 uppercase">Total Pcs</label>
              <input type="number" className="h-10 w-full border border-blue-200 px-2 rounded text-sm text-center font-bold" value={item.pcs || ""} onChange={(e) => updateItem(i, "pcs", e.target.value)} />
            </div>
            <div className="w-24">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Cap/Shift</label>
              <input type="number" className="h-10 w-full border border-gray-200 px-2 rounded text-sm text-center" value={item.capacity_per_shift || ""} onChange={(e) => updateItem(i, "capacity_per_shift", e.target.value)} />
            </div>
            <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="h-10 px-3 bg-red-50 text-red-500 border border-red-100 rounded text-[10px] font-bold">HAPUS</button>
          </div>

          <div className="flex gap-4 text-[11px] font-bold uppercase mb-4">
            <div>Sisa Plotting: <span className={`ml-2 px-2 py-0.5 rounded ${Number(item.pcs) - getTotalPlottedQty(item.calendar) === 0 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{Number(item.pcs) - getTotalPlottedQty(item.calendar)} Pcs</span></div>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex gap-2">
              {item.calendar.map((d, idx) => {
                const isHoliday = (holidays || []).includes(d.date);
                const isSunday = new Date(d.date).getDay() === 0;
                const isShip = header.deliveryDate && d.date === header.deliveryDate;

                return (
                  <div key={idx} className={`min-w-[130px] border rounded-lg p-2 text-[11px] ${isHoliday || isSunday ? 'bg-red-50 border-red-200' : isShip ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-200 bg-white'}`}>
                    <div className={`text-center font-bold mb-1 border-b pb-1 ${isHoliday || isSunday ? 'text-red-600' : isShip ? 'text-blue-700' : 'text-gray-400'}`}>
                      {formatDate(d.date)}
                      {isShip && <span className="block text-[9px] font-black uppercase">📦 Delivery</span>}
                      {(isHoliday || isSunday) && <span className="block text-[8px] uppercase">❌ LIBUR</span>}
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1">
                      {["shift1", "shift2", "shift3"].map((s) => (
                        <div key={s} className={`relative h-7 border rounded flex items-center justify-center ${d.shifts[s].active ? `${ITEM_COLORS[i % ITEM_COLORS.length]} text-white` : "bg-gray-50 text-gray-300"} ${isShip || isHoliday || isSunday ? "opacity-20 pointer-events-none" : ""}`}>
                          {(!isShip && !isHoliday && !isSunday) && (
                            <>
                              <div className="absolute inset-0 z-0 cursor-pointer"
                                onMouseDown={(e) => {
                                  const mode = e.shiftKey ? "on" : e.altKey ? "off" : "toggle";
                                  setDrag({ i, s, mode });
                                  toggleShift(i, idx, s, mode);
                                }}
                                onMouseEnter={() => { if (drag && drag.i === i) toggleShift(i, idx, s, drag.mode); }}
                              />
                              <input type="number" value={d.shifts[s].qty || ""} onChange={(e) => updateShiftQty(i, idx, s, e.target.value)}
                                className={`relative z-10 w-full bg-transparent text-center font-bold text-[10px] focus:outline-none ${d.shifts[s].active ? "text-white" : "text-gray-400 opacity-0 hover:opacity-100"}`}
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
        <button onClick={() => setItems([...items, createItem(new Date(header.deliveryDate || new Date()))])} className="w-full border border-gray-300 py-2 rounded text-sm font-bold text-gray-500 hover:bg-gray-100 uppercase">+ TAMBAH ITEM MANUAL</button>
        <div className="flex gap-2">
          <button onClick={handleExportExcel} disabled={loading} className="flex-1 bg-white border border-green-600 text-green-700 py-2 rounded font-bold text-sm">EXPORT EXCEL</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-[2] bg-blue-600 text-white py-2 rounded font-bold text-sm hover:bg-blue-700 shadow-md">
            {loading ? "MENYIMPAN..." : "SIMPAN PRODUCTION DEMAND"}
          </button>
        </div>
      </div>
    </div>
  );
}