import { useEffect, useState } from "react";

export default function BOMCalculation() {
  const [bomData, setBomData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBOM() {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/api/bom-calculation");

        if (!res.ok) {
          throw new Error("Gagal mengambil data BOM");
        }

        const data = await res.json();
        setBomData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Gagal fetch BOM:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBOM();
  }, []);

  /* =========================
     FORMATTER
  ========================= */
  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "0";
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }).format(Number(num));
  };

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("id-ID") : "-";

  /* =========================
     STATE
  ========================= */
  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow">
        <p className="text-gray-500">Memuat data BOM Calculation…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-xl shadow">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (bomData.length === 0) {
    return (
      <div className="p-6 bg-white rounded-xl shadow">
        <p className="text-gray-500">Tidak ada data BOM calculation.</p>
      </div>
    );
  }

  /* =========================
     TABLE
  ========================= */
  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">BOM Calculation</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-3 border-b text-center">Plan ID</th>
              <th className="py-2 px-3 border-b text-center">FG Code</th>
              <th className="py-2 px-3 border-b text-left">Component Code</th>
              <th className="py-2 px-3 border-b text-left">Description</th>
              <th className="py-2 px-3 border-b text-right">Required Qty</th>
              <th className="py-2 px-3 border-b text-right">On Hand</th>
              <th className="py-2 px-3 border-b text-right">Reserved</th>
              <th className="py-2 px-3 border-b text-right">Shortage</th>
              <th className="py-2 px-3 border-b text-center">Due Date</th>
              <th className="py-2 px-3 border-b text-center">Order Type</th>
              <th className="py-2 px-3 border-b text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {bomData.map((row) => {
              const isParent = row.isParent === true;
              const isShortage = Number(row.shortage) > 0;

              return (
                <tr
                  key={`${row.plan_id}-${row.component_code || "PARENT"}`}
                  className={
                    isParent
                      ? "bg-gray-200 font-semibold text-center"
                      : "hover:bg-gray-50"
                  }
                >
                  {/* PLAN ID */}
                  <td className="py-2 px-3 border-b text-center">
                    {isParent ? row.plan_id : ""}
                  </td>

                  {/* FG CODE */}
                  <td className="py-2 px-3 border-b text-center">
                    {isParent ? row.fg_code : ""}
                  </td>

                  {/* COMPONENT CODE */}
                  <td className="py-2 px-3 border-b text-left pl-6">
                    {!isParent ? row.component_code : ""}
                  </td>

                  {/* DESCRIPTION */}
                  <td className="py-2 px-3 border-b text-left pl-6">
                    {!isParent ? row.component_description : ""}
                  </td>

                  {/* REQUIRED QTY */}
                  <td className="py-2 px-3 border-b text-right">
                    {!isParent ? formatNumber(row.required_qty) : ""}
                  </td>

                  {/* ON HAND */}
                  <td className="py-2 px-3 border-b text-right">
                    {!isParent ? formatNumber(row.on_hand_qty) : ""}
                  </td>

                  {/* RESERVED */}
                  <td className="py-2 px-3 border-b text-right">
                    {!isParent ? formatNumber(row.reserved_qty) : ""}
                  </td>

                  {/* SHORTAGE */}
                  <td
                    className={`py-2 px-3 border-b text-right ${
                      !isParent && isShortage
                        ? "text-red-600 font-semibold"
                        : ""
                    }`}
                  >
                    {!isParent ? formatNumber(row.shortage) : ""}
                  </td>

                  {/* DUE DATE (PARENT ONLY) */}
                  <td className="py-2 px-3 border-b text-center">
                    {isParent ? formatDate(row.due_date) : ""}
                  </td>

                  {/* ORDER TYPE (PARENT ONLY) */}
                  <td className="py-2 px-3 border-b text-center">
                    {isParent ? row.order_type : ""}
                  </td>

                  {/* STATUS (PARENT ONLY) */}
                  <td className="py-2 px-3 border-b text-center">
                    {isParent ? row.planned_status : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
