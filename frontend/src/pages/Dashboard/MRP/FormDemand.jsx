import { useState } from "react";
import Swal from "sweetalert2";
import api from "../../../api/api";

/* ================= HELPERS ================= */
const addDays = (date, d) => {
  const n = new Date(date);
  n.setDate(n.getDate() + d);
  return n;
};

const formatDate = d =>
  d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

const buildCalendar = (start, days = 30) =>
  Array.from({ length: days }, (_, i) => ({
    date: addDays(start, i),
    shifts: { shift1: false, shift2: false, shift3: false }
  }));

const createItem = start => ({
  itemCode: "",
  description: "",
  uom: "",
  qty: "",
  calendarStart: start,
  calendar: buildCalendar(start)
});

/* ================= COMPONENT ================= */
export default function FormDemand() {
  const [header, setHeader] = useState({
    soNo: "",
    soDate: "",
    customer: ""
  });

  const [anchorDate, setAnchorDate] = useState(new Date());
  const [items, setItems] = useState([createItem(new Date())]);
  const [drag, setDrag] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= HEADER ================= */
  const updateHeader = (k, v) =>
    setHeader(prev => ({ ...prev, [k]: v }));

  /* ================= ITEM ================= */
  const addItem = () =>
    setItems(prev => [...prev, createItem(anchorDate)]);

  const removeItem = idx =>
    setItems(prev => prev.filter((_, i) => i !== idx));

  const updateItem = (i, changes) => {
    setItems(prev => {
      const c = [...prev];
      c[i] = { ...c[i], ...changes };
      return c;
    });
  };

  /* ================= DATE SEARCH ================= */
  const jumpToDate = d => {
    const date = new Date(d);
    setAnchorDate(date);
    setItems(prev =>
      prev.map(it => ({
        ...it,
        calendarStart: date,
        calendar: buildCalendar(date)
      }))
    );
  };

  /* ================= SHIFT TOGGLE ================= */
  const toggleShift = (itemIdx, dayIdx, shift, mode = "toggle") => {
    setItems(prev => {
      const c = [...prev];
      const s = c[itemIdx].calendar[dayIdx].shifts;
      if (mode === "on") s[shift] = true;
      else if (mode === "off") s[shift] = false;
      else s[shift] = !s[shift];
      return [...c];
    });
  };

  /* ================= DRAG UX ================= */
  const startDrag = (itemIdx, dayIdx, shift, e) => {
    let mode = "toggle";
    if (e.shiftKey) mode = "on";
    if (e.altKey) mode = "off";

    setDrag({ itemIdx, shift, mode });
    toggleShift(itemIdx, dayIdx, shift, mode);
  };

  const enterDrag = (itemIdx, dayIdx) => {
    if (!drag || drag.itemIdx !== itemIdx) return;
    toggleShift(itemIdx, dayIdx, drag.shift, drag.mode);
  };

  const stopDrag = () => setDrag(null);

  const clearDay = (itemIdx, dayIdx) => {
    setItems(prev => {
      const c = [...prev];
      c[itemIdx].calendar[dayIdx].shifts = {
        shift1: false,
        shift2: false,
        shift3: false
      };
      return [...c];
    });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    try {
      setLoading(true);
      await api.post("/demand", { header, items });
      Swal.fire("Success", "Demand tersimpan", "success");
    } catch {
      Swal.fire("Error", "Gagal simpan demand", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="p-6 bg-white rounded-xl shadow w-full">
      <h1 className="text-xl font-semibold mb-4">
        Demand Planner – Drag Calendar (3 Shift)
      </h1>

      {/* HEADER */}
      <div className="space-y-4 mb-6">

        {/* ROW 1 : SO */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              SO Number
            </label>
            <input
              className="border p-2 rounded text-sm"
              value={header.soNo}
              onChange={e => updateHeader("soNo", e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Tanggal SO
            </label>
            <input
              type="date"
              className="border p-2 rounded text-sm"
              value={header.soDate}
              onChange={e => updateHeader("soDate", e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Customer
            </label>
            <input
              className="border p-2 rounded text-sm"
              value={header.customer}
              onChange={e => updateHeader("customer", e.target.value)}
            />
          </div>
        </div>

        {/* ROW 2 : DATE PLAN */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Tanggal Kirim
            </label>
            <input
              type="date"
              className="border p-2 rounded text-sm"
              value={header.deliveryDate}
              onChange={e =>
                updateHeader("deliveryDate", e.target.value)
              }
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Tanggal Produksi
            </label>
            <input
              type="date"
              className="border p-2 rounded text-sm"
              value={header.productionDate}
              onChange={e =>
                updateHeader("productionDate", e.target.value)
              }
            />
          </div>
        </div>

      </div>


      {/* DATE SEARCH */}
      <div className="flex gap-3 mb-6 items-center">
        <label className="text-sm font-medium">
          Jump to date:
        </label>
        <input
          type="date"
          className="border rounded p-2 text-sm"
          onChange={e => jumpToDate(e.target.value)}
        />
        <span className="text-xs text-gray-500">
          Kalender akan scroll dari tanggal ini
        </span>
      </div>

      {/* ITEMS */}
      {items.map((item, i) => (
        <div
          key={i}
          className="border rounded-xl p-4 mb-6 bg-gray-50"
        >
          {/* ITEM HEADER */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            <div>
              <div className="text-xs font-semibold mb-1">
                Item Code
              </div>
              <input
                className="border p-2 rounded text-sm w-full"
                value={item.itemCode}
                onChange={e =>
                  updateItem(i, { itemCode: e.target.value })
                }
              />
            </div>

            <div>
              <div className="text-xs font-semibold mb-1">
                Description
              </div>
              <input
                className="border p-2 rounded text-sm w-full"
                value={item.description}
                onChange={e =>
                  updateItem(i, { description: e.target.value })
                }
              />
            </div>

            <div>
              <div className="text-xs font-semibold mb-1">
                UOM
              </div>
              <input
                className="border p-2 rounded text-sm w-full"
                value={item.uom}
                onChange={e =>
                  updateItem(i, { uom: e.target.value })
                }
              />
            </div>

            <div>
              <div className="text-xs font-semibold mb-1">
                Quantity
              </div>
              <input
                type="number"
                className="border p-2 rounded text-sm w-full"
                value={item.qty}
                onChange={e =>
                  updateItem(i, { qty: e.target.value })
                }
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => removeItem(i)}
                className="text-red-600 text-sm hover:underline"
              >
                Remove Item
              </button>
            </div>
          </div>

          {/* CALENDAR TITLE */}
          <div className="text-sm font-semibold mb-2">
            Tanggal Selesai Packing
          </div>

          {/* CALENDAR */}
          <div className="overflow-x-auto">
            <div className="flex gap-2">
              {item.calendar.map((d, idx) => (
                <div
                  key={idx}
                  onDoubleClick={() => clearDay(i, idx)}
                  className="min-w-[120px] border rounded-lg bg-white p-2 text-xs"
                >
                  <div className="text-center font-semibold mb-1">
                    {formatDate(d.date)}
                  </div>

                  {["shift1", "shift2", "shift3"].map((s, si) => (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={e =>
                        startDrag(i, idx, s, e)
                      }
                      onMouseEnter={() =>
                        enterDrag(i, idx)
                      }
                      onMouseUp={stopDrag}
                      className={`w-full mt-1 py-1 rounded select-none
                  ${d.shifts[s]
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                        }`}
                    >
                      Shift {si + 1}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}


      {/* ACTION */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={addItem}
          className="border px-4 py-2 rounded text-sm"
        >
          + Add Item
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white py-3 rounded w-full"
      >
        {loading ? "Saving..." : "Save Demand"}
      </button>
    </div>
  );
}
