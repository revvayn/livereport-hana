import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function RejectRateMechine() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= TOOLTIP ================= */
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;

    const d = payload[0].payload;
    const isOver = d.reject_rate > d.target;

    return (
      <div className="bg-[#1f2933] border border-[#374151] rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="font-semibold text-gray-200 mb-1">
          {d.displayGroup}
        </p>

        <p className="text-gray-300">
          Reject Rate :{" "}
          <span className={`font-bold ${isOver ? "text-red-400" : "text-emerald-400"}`}>
            {d.reject_rate}%
          </span>
        </p>

        <p className="text-gray-400">Target : {d.target}%</p>
        <p className="text-gray-400">Reject : {d.reject.toLocaleString()}</p>
        <p className="text-gray-400">CEK : {d.cek.toLocaleString()}</p>
      </div>
    );
  };

  /* ================= MACHINE CONFIG ================= */
  const machineMap = useMemo(() => ({
    HOTPRESS_PANEL: { label: "Hot Press", color: "#3b82f6", target: 5 },
    BLOW_DETECTOR_PANEL: { label: "Blow Detector", color: "#f97316", target: 5 },
    SANDING_PANEL: { label: "Sanding", color: "#eab308", target: 5 },
    GRADING_FG_PANEL: { label: "Finish Good", color: "#9ca3af", target: 5 },
    GRADING_FI: { label: "Final Inspection", color: "#22c55e", target: 5 },
  }), []);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    setLoading(true);

    api.get("/reject-rate/machine")
      .then((res) => {
        const normalized = res.data
          .map((row) => {
            const cfg = machineMap[row.group] || {};
            return {
              ...row,
              displayGroup: cfg.label || row.group,
              color: cfg.color || "#60a5fa",
              target: cfg.target ?? 5,
            };
          })
          .sort((a, b) => b.reject_rate - a.reject_rate);

        setData(normalized);
      })
      .catch(() => alert("Gagal load data reject rate"))
      .finally(() => setLoading(false));
  }, [machineMap]);

  if (loading) {
    return <p className="text-center mt-20">Loading...</p>;
  }

  /* ================= RENDER ================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">
          Reject Rate by Machine
        </h1>
        <p className="text-sm text-gray-500">
          Rekap reject produksi berdasarkan mesin / proses
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr className="border-b">
                <th rowSpan="2" className="px-4 py-3 text-left">Group Reject</th>
                <th rowSpan="2" className="px-4 py-3 text-center">Target</th>
                <th colSpan="2" className="px-4 py-3 text-center">2025</th>
                <th rowSpan="2" className="px-4 py-3 text-center">Bulan</th>
                <th colSpan="2" className="px-4 py-3 text-center">Avg / Bln</th>
                <th rowSpan="2" className="px-4 py-3 text-center">% Reject</th>
              </tr>
              <tr className="border-b">
                <th className="px-4 py-2 text-right">CEK</th>
                <th className="px-4 py-2 text-right">Reject</th>
                <th className="px-4 py-2 text-right">CEK</th>
                <th className="px-4 py-2 text-right">Reject</th>
              </tr>
            </thead>

            <tbody>
              {data.map((r, i) => {
                const isOver = r.reject_rate > r.target;

                return (
                  <tr key={i} className="border-t hover:bg-blue-50/40">
                    <td className="px-4 py-3 font-medium">{r.displayGroup}</td>
                    <td className="px-4 py-3 text-center">{r.target}%</td>
                    <td className="px-4 py-3 text-right">{r.cek.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{r.reject.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">{r.bulan}</td>
                    <td className="px-4 py-3 text-right">{r.avg_cek.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{r.avg_reject.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isOver ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                      }`}>
                        {r.reject_rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-[#2b2b2b] rounded-xl p-5 border border-[#3a3a3a]">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart layout="vertical" data={data} margin={{ left: 160 }}>
            <Tooltip content={<CustomTooltip />} />
            <CartesianGrid horizontal={false} stroke="#3f3f3f" />
            <XAxis type="number" tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="displayGroup" width={150} />
            <Bar dataKey="reject_rate" barSize={18}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
              <LabelList dataKey="reject_rate" position="right" formatter={(v) => `${v}%`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RejectRateMechine;
