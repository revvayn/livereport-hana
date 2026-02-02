import { useEffect, useState } from "react";

export default function PlannedOrder() {
  const [plannedOrders, setPlannedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data dari backend
  useEffect(() => {
    async function fetchPlannedOrders() {
      try {
        const res = await fetch("http://localhost:5000/api/planned-order"); // ganti URL sesuai backendmu
        const data = await res.json();
        setPlannedOrders(data);
      } catch (err) {
        console.error("Gagal mengambil planned order:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlannedOrders();
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">Planned Order</h1>

      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : plannedOrders.length === 0 ? (
        <p className="text-gray-500">Tidak ada planned order.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b">Plan ID</th>
                <th className="py-2 px-4 border-b">Component Code</th>
                <th className="py-2 px-4 border-b">Qty Plan</th>
                <th className="py-2 px-4 border-b">Due Date</th>
                <th className="py-2 px-4 border-b">Order Type</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Reference Demand</th>
                <th className="py-2 px-4 border-b">Created At</th>
              </tr>
            </thead>
            <tbody>
              {plannedOrders.map((po) => (
                <tr key={po.plan_id} className="text-center">
                  <td className="py-2 px-4 border-b">{po.plan_id}</td>
                  <td className="py-2 px-4 border-b">{po.component_code}</td>
                  <td className="py-2 px-4 border-b">{po.qty_plan}</td>
                  <td className="py-2 px-4 border-b">{po.due_date}</td>
                  <td className="py-2 px-4 border-b">{po.order_type}</td>
                  <td className="py-2 px-4 border-b">{po.status}</td>
                  <td className="py-2 px-4 border-b">{po.reference_demand}</td>
                  <td className="py-2 px-4 border-b">{po.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
