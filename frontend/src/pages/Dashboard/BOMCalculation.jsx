import { useEffect, useState } from "react";

export default function BOMCalculation() {
  const [bomData, setBomData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBOM() {
      try {
        const res = await fetch("http://localhost:5000/api/bom-calculation");
        const data = await res.json();
        setBomData(data);
      } catch (err) {
        console.error("Gagal fetch BOM:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBOM();
  }, []);

  const formatNumber = (num) =>
    num != null
      ? Number(num).toLocaleString(undefined, { maximumFractionDigits: 4 })
      : 0;

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString() : "-";

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">BOM Calculation</h1>

      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : bomData.length === 0 ? (
        <p className="text-gray-500">Tidak ada BOM calculation.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b">Plan ID</th>
                <th className="py-2 px-4 border-b">FG Code</th>
                <th className="py-2 px-4 border-b">Component Code</th>
                <th className="py-2 px-4 border-b">Description</th>
                <th className="py-2 px-4 border-b">Required Qty</th>
                <th className="py-2 px-4 border-b">On Hand</th>
                <th className="py-2 px-4 border-b">Reserved</th>
                <th className="py-2 px-4 border-b">Shortage</th>
                <th className="py-2 px-4 border-b">Due Date</th>
                <th className="py-2 px-4 border-b">Order Type</th>
                <th className="py-2 px-4 border-b">Planned Status</th>
              </tr>
            </thead>
            <tbody>
              {bomData.map((row, idx) => {
                const isShortage = row.shortage > 0;
                const isParent = row.isParent; // pastikan backend menandai parent

                return (
                  <tr
                    key={idx}
                    className={`${
                      isParent
                        ? "bg-gray-200 font-semibold text-center"
                        : idx % 2 === 0
                        ? "bg-gray-50"
                        : "bg-white"
                    }`}
                  >
                    <td className="py-2 px-4 border-b text-center">
                      {isParent ? row.plan_id : ""}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {isParent ? row.fg_code : ""}
                    </td>
                    <td className={`py-2 px-4 border-b ${!isParent ? "pl-6 text-left" : ""}`}>
                      {!isParent ? row.component_code : ""}
                    </td>
                    <td className={`py-2 px-4 border-b ${!isParent ? "pl-6 text-left" : ""}`}>
                      {!isParent ? row.component_description : ""}
                    </td>
                    <td className="py-2 px-4 border-b text-right">
                      {!isParent ? formatNumber(row.required_qty) : ""}
                    </td>
                    <td className="py-2 px-4 border-b text-right">
                      {!isParent ? formatNumber(row.on_hand_qty) : ""}
                    </td>
                    <td className="py-2 px-4 border-b text-right">
                      {!isParent ? formatNumber(row.reserved_qty) : ""}
                    </td>
                    <td
                      className={`py-2 px-4 border-b text-right ${
                        !isParent && isShortage ? "text-red-600 font-semibold" : ""
                      }`}
                    >
                      {!isParent ? formatNumber(row.shortage) : ""}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {!isParent ? formatDate(row.due_date) : ""}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {!isParent ? row.order_type : ""}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {!isParent ? row.planned_status : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
