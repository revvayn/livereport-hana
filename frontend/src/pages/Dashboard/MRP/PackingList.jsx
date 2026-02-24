import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../../api/api";

export default function PackingList() {
  /* ================= STATE ================= */
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("so");
  const [selectedSO, setSelectedSO] = useState(null);
  const [items, setItems] = useState([]);
  const [header, setHeader] = useState({
    soNo: "",
    soDate: "",
    customer: "",
    deliveryDate: "",
    productionDate: "",
  });

  /* ================= HELPERS ================= */
  const toInputDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const addDays = (date, d) => {
    const n = new Date(date);
    n.setDate(n.getDate() + d);
    return n;
  };

  const buildCalendar = (startDate, days = 14) => {
    return Array.from({ length: days }, (_, i) => ({
      date: addDays(startDate, i),
      shifts: {
        shift1: { qty: 0 },
        shift2: { qty: 0 },
        shift3: { qty: 0 },
      },
    }));
  };

  /* ================= API CALLS ================= */
  const fetchDemands = async () => {
    try {
      setLoading(true);
      const res = await api.get("/demand");
      setDemands(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  const handleShowDetail = async (so) => {
    try {
      setLoading(true);
      const resItems = await api.get(`/demand/${so.demand_id}/items`);
      const itemsData = resItems.data || [];

      setSelectedSO(so);
      setHeader({
        soNo: so.so_number,
        soDate: toInputDate(so.so_date),
        customer: so.customer_name,
        deliveryDate: toInputDate(so.delivery_date),
        productionDate: toInputDate(so.production_date),
      });

      const deliveryDate = so.delivery_date
        ? new Date(so.delivery_date + "T00:00:00")
        : new Date();

      const mappedItems = itemsData.map((it) => {
        const parsedCalendar = it.production_schedule
          ? typeof it.production_schedule === "string"
            ? JSON.parse(it.production_schedule)
            : it.production_schedule
          : null;

        let calendarStart = it.calendarStart
          ? new Date(it.calendarStart)
          : addDays(deliveryDate, -13);

        return {
          itemId: it.id,
          itemCode: it.item_code,
          description: it.description,
          uom: it.uom || "PCS",
          qty: it.total_qty,
          pcs: it.pcs || it.total_pcs || 0,
          calendarStart,
          calendar: parsedCalendar || buildCalendar(calendarStart, 14),
        };
      });

      setItems(mappedItems);
      setView("detail");
    } catch (err) {
      Swal.fire("Error", "Gagal memuat detail", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= MATRIX LOGIC ================= */
  const handleQtyChange = (itemIdx, dayIdx, shiftKey, value) => {
    const newItems = [...items];
    newItems[itemIdx].calendar[dayIdx].shifts[shiftKey].qty =
      value === "" ? 0 : Number(value);
    setItems(newItems);
  };

  const handleSaveSchedule = async () => {
    try {
      setLoading(true);
      await api.put(`/demand/${selectedSO.demand_id}`, { header, items });
      Swal.fire("Berhasil!", "Jadwal packing telah disimpan.", "success");
      fetchDemands();
      setView("so");
    } catch (error) {
      Swal.fire("Error", "Gagal menyimpan jadwal", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen font-sans">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">
            {view === "so"
              ? "Packing Schedule"
              : `Edit Schedule: ${selectedSO?.so_number}`}
          </h2>
          {view === "detail" && (
            <button
              onClick={() => setView("so")}
              className="text-[10px] bg-gray-100 px-4 py-2 rounded font-bold text-gray-600 uppercase"
            >
              Kembali
            </button>
          )}
        </div>

        {/* LIST VIEW */}
        {view === "so" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-4 text-left">SO Number</th>
                  <th className="py-3 px-4 text-left">Customer</th>
                  <th className="py-3 px-4 text-center">Delivery</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {demands.map((so) => (
                  <tr
                    key={so.demand_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-indigo-600">
                      {so.so_number}
                    </td>
                    <td className="py-4 px-4">{so.customer_name}</td>
                    <td className="py-4 px-4 text-center font-mono">
                      {new Date(so.delivery_date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleShowDetail(so)}
                        className="bg-indigo-600 text-white px-4 py-1.5 rounded text-[11px] font-bold"
                      >
                        Buka Jadwal
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MATRIX DETAIL VIEW */}
        {view === "detail" && (
          <>
            <div className="overflow-x-auto border rounded-lg shadow-inner bg-gray-50 max-h-[75vh]">
              <table className="w-full text-[10px] border-collapse bg-white">
                <thead className="sticky top-0 z-30 shadow-sm">
                  <tr className="bg-gray-100 text-gray-600 font-bold uppercase">
                    <th className="border p-2 sticky left-0 bg-gray-100 z-40 min-w-[150px] text-left">
                      Item Info
                    </th>
                    <th className="border p-2 w-16 text-center bg-indigo-50 text-indigo-700">
                      Target
                    </th>
                    {items[0]?.calendar?.map((day, i) => (
                      <th
                        key={i}
                        colSpan="3"
                        className="border p-1 text-center min-w-[100px]"
                      >
                        {new Date(day.date).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-gray-50 text-[8px] text-gray-400 font-bold">
                    <th className="border p-1 sticky left-0 bg-gray-50 z-40"></th>
                    <th className="border"></th>
                    {items[0]?.calendar?.map((_, i) => (
                      <React.Fragment key={i}>
                        <th className="border py-1">S1</th>
                        <th className="border py-1">S2</th>
                        <th className="border py-1">S3</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const totalInput =
                      item.calendar?.reduce(
                        (sum, day) =>
                          sum +
                          (Number(day.shifts.shift1.qty) || 0) +
                          (Number(day.shifts.shift2.qty) || 0) +
                          (Number(day.shifts.shift3.qty) || 0),
                        0
                      ) || 0;

                    const sisa = Number(item.pcs) - totalInput;

                    return (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="border p-2 sticky left-0 bg-white z-20 shadow-md">
                          <div className="font-bold text-indigo-700">
                            {item.itemCode}
                          </div>
                          <div
                            className={`text-[8px] font-black mt-1 ${
                              sisa <= 0
                                ? "text-emerald-600"
                                : "text-red-500"
                            }`}
                          >
                            {sisa <= 0
                              ? "PAS ✅"
                              : `SISA: ${sisa} PCS`}
                          </div>
                        </td>
                        <td className="border text-center font-bold bg-indigo-50/20">
                          {item.pcs}
                        </td>
                        {item.calendar?.map((day, dIdx) =>
                          ["shift1", "shift2", "shift3"].map((s) => {
                            const qty = day.shifts[s].qty || 0;

                            let bgColor = "bg-white";
                            if (qty > 0) {
                              bgColor =
                                "bg-emerald-500 text-white";
                            }

                            return (
                              <td
                                key={`${dIdx}-${s}`}
                                className={`border p-0 text-center transition-all ${bgColor}`}
                              >
                                <input
                                  type="number"
                                  value={qty || ""}
                                  onChange={(e) =>
                                    handleQtyChange(
                                      index,
                                      dIdx,
                                      s,
                                      e.target.value
                                    )
                                  }
                                  className="w-full h-8 text-center bg-transparent outline-none text-[10px] font-bold"
                                  placeholder="0"
                                />
                              </td>
                            );
                          })
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* LEGEND & SAVE */}
            <div className="mt-5 flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex gap-6 text-[10px] font-bold uppercase tracking-tighter">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                  <span className="text-gray-600">
                    Packing Stage
                  </span>
                </div>
              </div>
              <button
                onClick={handleSaveSchedule}
                className="bg-indigo-600 text-white px-10 py-2.5 rounded text-xs font-bold hover:bg-indigo-700 transition-all"
              >
                Simpan Perubahan Jadwal
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}