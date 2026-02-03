import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

export default function DemandList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDemand = async () => {
    try {
      setLoading(true);
      const res = await api.get("/demand");
      setData(res.data);
    } catch (err) {
      Swal.fire("Error", "Gagal mengambil data demand", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemand();
  }, []);

  // 🔹 cek apakah ada demand NEW
  const hasNewDemand = data.some(d => d.status === "NEW");

  const handleRunMRP = async () => {
    const confirm = await Swal.fire({
      title: "Run MRP?",
      text: "Semua demand status NEW akan diproses menjadi Planned Order",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Run MRP",
      cancelButtonText: "Batal"
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await api.post("/mrp/run");
      Swal.fire("Berhasil", res.data.message, "success").then(() => {
        navigate("/dashboard/demand/planned-order");
      });
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "MRP gagal dijalankan",
        "error"
      );
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Demand List</h1>

        <button
          onClick={handleRunMRP}
          disabled={!hasNewDemand}
          className={`px-4 py-2 rounded text-white
            ${hasNewDemand
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          ▶ Run MRP
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2">Item Code</th>
                <th className="border px-3 py-2 text-right">Qty</th>
                <th className="border px-3 py-2">Due Date</th>
                <th className="border px-3 py-2">Type</th>
                <th className="border px-3 py-2">Reference</th>
                <th className="border px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    Belum ada demand
                  </td>
                </tr>
              ) : (
                data.map(row => (
                  <tr key={row.demand_id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{row.item_code}</td>
                    <td className="border px-3 py-2 text-right">
                      {Number(row.qty_demand).toLocaleString()}
                    </td>
                    <td className="border px-3 py-2">
                      {new Date(row.due_date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="border px-3 py-2">{row.demand_type}</td>
                    <td className="border px-3 py-2">
                      {row.reference_no || "-"}
                    </td>
                    <td className="border px-3 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium
                          ${row.status === "NEW"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                          }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
