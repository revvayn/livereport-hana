import { useState } from "react";
import api from "../../api/api";

export default function FormPlanning() {
  const [itemCode, setItemCode] = useState("");
  const [planningQty, setPlanningQty] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await api.post("/planning/form", {
        item_code: itemCode.trim(),
        planning_qty: Number(planningQty),
      });

      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal generate planning");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">
        Planning Material dari BOM
      </h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-4 items-end mb-6"
      >
        <div>
          <label className="block text-sm mb-1">Item Code</label>
          <input
            type="text"
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            className="border rounded p-2 w-48"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Planning Qty</label>
          <input
            type="number"
            min="1"
            value={planningQty}
            onChange={(e) => setPlanningQty(e.target.value)}
            className="border rounded p-2 w-40 text-right"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Processing..." : "Generate"}
        </button>
      </form>

      {/* ERROR */}
      {error && (
        <div className="text-red-600 mb-4">{error}</div>
      )}

      {/* RESULT */}
      {result && (
        <>
          <div className="mb-3 text-sm">
            <strong>Item:</strong> {result.item_code} <br />
            <strong>Planning Qty:</strong> {result.planning_qty}
          </div>

          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Component</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">BOM Qty</th>
                <th className="border p-2">Rasio</th>
                <th className="border p-2">Required Qty</th>
                <th className="border p-2">WHS</th>
              </tr>
            </thead>
            <tbody>
              {result.materials.map((row, i) => (
                <tr key={i}>
                  <td className="border p-2">{row.component_code}</td>
                  <td className="border p-2">{row.component_description}</td>
                  <td className="border p-2 text-right">
                    {row.bom_component_qty}
                  </td>
                  <td className="border p-2 text-right">
                    {row.rasio}
                  </td>
                  <td className="border p-2 text-right font-semibold">
                    {row.required_quantity}
                  </td>
                  <td className="border p-2">{row.whs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
