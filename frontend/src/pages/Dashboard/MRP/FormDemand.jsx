import { useEffect, useState } from "react";
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

  const toInputDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toISOString().split("T")[0];
  };  

const buildCalendar = (start, days = 30) =>
  Array.from({ length: days }, (_, i) => ({
    date: addDays(start, i),
    shifts: { shift1: false, shift2: false, shift3: false }
  }));

const createItem = start => ({
  itemId: null,
  itemCode: "",
  description: "",
  uom: "",
  qty: "",
  calendarStart: start,
  calendar: buildCalendar(start)
});

/* ================= COMPONENT ================= */
export default function FormDemand() {
  /* ================= STATE ================= */
  const [salesOrders, setSalesOrders] = useState([]);
  const [selectedSO, setSelectedSO] = useState("");

  const [header, setHeader] = useState({
    soNo: "",
    soDate: "",
    customer: "",
    deliveryDate: "",
    productionDate: ""
  });

  const [anchorDate, setAnchorDate] = useState(new Date());
  const [items, setItems] = useState([createItem(new Date())]);
  const [drag, setDrag] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD SALES ORDER LIST ================= */
  useEffect(() => {
    api.get("/sales-orders")
      .then(res => setSalesOrders(res.data))
      .catch(() => {
        Swal.fire("Error", "Gagal memuat Sales Order", "error");
      });
  }, []);

  /* ================= SELECT SO ================= */
  const handleSelectSO = async (e) => {
    const soId = e.target.value;
    setSelectedSO(soId);
    if (!soId) return;
  
    try {
      const res = await api.get(`/demand/from-so/${soId}`);
      const h = res.data.header;
  
      /* ================= HEADER ================= */
      setHeader({
        soNo: h.soNo || "",
        soDate: toInputDate(h.soDate),             // ✅ AUTO ISI
        customer: h.customer || "",
        deliveryDate: toInputDate(h.deliveryDate), // ✅ AUTO ISI
        productionDate: ""
      });
  
      /* ================= ITEMS ================= */
      setItems(
        res.data.items.map(it => ({
          itemId: it.itemId,
          itemCode: it.itemCode,
          description: it.description,
          uom: it.uom,
          qty: it.qty,
          calendarStart: new Date(),
          calendar: buildCalendar(new Date())
        }))
      );
  
    } catch (err) {
      Swal.fire("Error", "Gagal mengambil data SO", "error");
    }
  };
  

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

  /* ================= SHIFT ================= */
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

      {/* SELECT SO */}
      <div className="mb-6">
        <label className="text-xs font-medium text-gray-600 mb-1 block">
          Sales Order
        </label>
        <select
          value={selectedSO}
          onChange={handleSelectSO}
          className="border p-2 rounded text-sm w-full"
        >
          <option value="">-- Pilih Sales Order --</option>
          {salesOrders.map(so => (
            <option key={so.id} value={so.id}>
              {so.so_number}
            </option>
          ))}
        </select>
      </div>

      {/* HEADER */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          {["soNo", "soDate", "customer"].map((k, i) => (
            <div key={i} className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">
                {k === "soNo" ? "SO Number" : k === "soDate" ? "Tanggal SO" : "Customer"}
              </label>
              <input
                type={k === "soDate" ? "date" : "text"}
                className="border p-2 rounded text-sm"
                value={header[k]}
                onChange={e => updateHeader(k, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {["deliveryDate", "productionDate"].map(k => (
            <div key={k} className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">
                {k === "deliveryDate" ? "Tanggal Kirim" : "Tanggal Produksi"}
              </label>
              <input
                type="date"
                className="border p-2 rounded text-sm"
                value={header[k]}
                onChange={e => updateHeader(k, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* DATE SEARCH */}
      <div className="flex gap-3 mb-6 items-center">
        <label className="text-sm font-medium">Jump to date:</label>
        <input type="date" className="border rounded p-2 text-sm" onChange={e => jumpToDate(e.target.value)} />
      </div>

      {/* ITEMS */}
      {items.map((item, i) => (
        <div key={i} className="border rounded-xl p-4 mb-6 bg-gray-50">
          <div className="grid grid-cols-5 gap-3 mb-4">
            {["itemCode", "description", "uom", "qty"].map(k => (
              <input
                key={k}
                type={k === "qty" ? "number" : "text"}
                className="border p-2 rounded text-sm"
                value={item[k]}
                onChange={e => updateItem(i, { [k]: e.target.value })}
                placeholder={k.toUpperCase()}
              />
            ))}
            <button onClick={() => removeItem(i)} className="text-red-600 text-sm">
              Remove
            </button>
          </div>

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
                      onMouseDown={e => startDrag(i, idx, s, e)}
                      onMouseEnter={() => enterDrag(i, idx)}
                      onMouseUp={stopDrag}
                      className={`w-full mt-1 py-1 rounded ${
                        d.shifts[s] ? "bg-green-600 text-white" : "bg-gray-200"
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

      <button onClick={addItem} className="border px-4 py-2 rounded text-sm mb-4">
        + Add Item
      </button>

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
