import { useState } from "react";
import Swal from "sweetalert2";
import api from "../../api/api";

export default function FormDemand() {
  const [itemCode, setItemCode] = useState("");
  const [qty, setQty] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [type, setType] = useState("SO");
  const [refNo, setRefNo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!itemCode || !qty || !dueDate) {
      Swal.fire("Error", "Lengkapi data demand", "error");
      return;
    }

    try {
      setLoading(true);

      await api.post("/demand", {
        item_code: itemCode.trim(),
        qty_demand: Number(qty),
        due_date: dueDate,
        demand_type: type,
        reference_no: refNo || null,
      });

      Swal.fire("Berhasil", "Demand berhasil disimpan", "success");

      // reset
      setItemCode("");
      setQty("");
      setDueDate("");
      setType("SO");
      setRefNo("");
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Gagal simpan demand",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl bg-white rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">Input Demand</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ITEM */}
        <div>
          <label className="block text-sm mb-1">Item Code</label>
          <input
            type="text"
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            className="border rounded p-2 w-full"
            required
          />
        </div>

        {/* QTY */}
        <div>
          <label className="block text-sm mb-1">Qty Demand</label>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="border rounded p-2 w-full text-right"
            required
          />
        </div>

        {/* DUE DATE */}
        <div>
          <label className="block text-sm mb-1">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border rounded p-2 w-full"
            required
          />
        </div>

        {/* TYPE */}
        <div>
          <label className="block text-sm mb-1">Demand Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="SO">Sales Order</option>
            <option value="FORECAST">Forecast</option>
          </select>
        </div>

        {/* REF */}
        <div>
          <label className="block text-sm mb-1">Reference No (Optional)</label>
          <input
            type="text"
            value={refNo}
            onChange={(e) => setRefNo(e.target.value)}
            className="border rounded p-2 w-full"
            placeholder="SO-00123"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !itemCode || !qty || !dueDate}
          className="bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded w-full"
        >

          {loading ? "Saving..." : "Save Demand"}
        </button>
      </form>
    </div>
  );
}
