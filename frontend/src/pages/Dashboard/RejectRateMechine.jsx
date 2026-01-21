import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useMemo } from "react";
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

function RejectRate() {
  const { user } = useOutletContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const d = payload[0].payload;
    const isOver = d.reject_rate > d.target;

    return (
      <div className="bg-[#1f2933] border border-[#374151] rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="font-semibold text-gray-200 mb-1">
          {d.displayGroup}
        </p>

        <p className="text-gray-300">
          Reject Rate :{" "}
          <span
            className={`font-bold ${isOver ? "text-red-400" : "text-emerald-400"
              }`}
          >
            {d.reject_rate}%
          </span>
        </p>

        <p className="text-gray-400">
          Target : {d.target}%
        </p>

        <p className="text-gray-400">
          Reject : {d.reject.toLocaleString()}
        </p>

        <p className="text-gray-400">
          CEK : {d.cek.toLocaleString()}
        </p>
      </div>
    );
  };


  /* ================= MACHINE CONFIG ================= */
  const machineMap = useMemo(() => ({
    HOTPRESS_PANEL: {
      label: "Hot Press",
      color: "#3b82f6",
      target: 5,
    },
    BLOW_DETECTOR_PANEL: {
      label: "Blow Detector",
      color: "#f97316",
      target: 5,
    },
    SANDING_PANEL: {
      label: "Sanding",
      color: "#eab308",
      target: 5,
    },
    GRADING_FG_PANEL: {
      label: "Finish Good",
      color: "#9ca3af",
      target: 5,
    },
    GRADING_FI: {
      label: "Final Inspection",
      color: "#22c55e",
      target: 5,
    },
  }), []);

  /* ================= FETCH & NORMALIZE ================= */
  useEffect(() => {
    api
      .get("/reject-rate/reject-by-machine")
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
          // SORT DESC (INDUSTRY STANDARD)
          .sort((a, b) => b.reject_rate - a.reject_rate);

        setData(normalized);
      })
      .catch(() => alert("Gagal load data"))
      .finally(() => setLoading(false));
  }, [machineMap]);

  if (!user || loading) {
    return <p className="text-center mt-20">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">
          Reject Rate by Machine
        </h1>
        <p className="text-sm text-gray-500">
          Rekap reject produksi berdasarkan mesin / proses
        </p>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr className="border-b">
                <th rowSpan="2" className="px-4 py-3 text-left font-semibold">
                  Group Reject
                </th>
                <th rowSpan="2" className="px-4 py-3 text-center font-semibold">
                  Target (%)
                </th>
                <th colSpan="2" className="px-4 py-3 text-center font-semibold">
                  2025
                </th>
                <th rowSpan="2" className="px-4 py-3 text-center font-semibold">
                  Bulan
                </th>
                <th colSpan="2" className="px-4 py-3 text-center font-semibold">
                  Avg / Bln
                </th>
                <th rowSpan="2" className="px-4 py-3 text-center font-semibold">
                  % Reject
                </th>
              </tr>
              <tr className="border-b">
                <th className="px-4 py-2 text-right font-semibold">CEK</th>
                <th className="px-4 py-2 text-right font-semibold">Reject</th>
                <th className="px-4 py-2 text-right font-semibold">CEK</th>
                <th className="px-4 py-2 text-right font-semibold">Reject</th>
              </tr>
            </thead>

            <tbody>
              {data.map((r, i) => {
                const isOver = r.reject_rate > r.target;

                return (
                  <tr
                    key={i}
                    className={`border-t transition
                      ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}
                      hover:bg-blue-50/40`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {r.displayGroup}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {r.target}%
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-mono">
                      {r.cek.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-right font-mono">
                      {r.reject.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-center text-gray-600">
                      {r.bulan}
                    </td>

                    <td className="px-4 py-3 text-right font-mono">
                      {r.avg_cek.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-right font-mono">
                      {r.avg_reject.toLocaleString()}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold
                          ${isOver
                            ? "bg-red-100 text-red-600"
                            : "bg-emerald-100 text-emerald-600"
                          }`}
                      >
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

      {/* ================= CHART ================= */}
      <div className="bg-[#2b2b2b] rounded-xl p-5 border border-[#3a3a3a]">
        <h3 className="text-xs font-semibold text-gray-200 mb-3 tracking-wide">
          REJECT BY MACHINE
        </h3>

        {/* LEGEND */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
          {data.map((d) => (
            <div key={d.displayGroup} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-xs text-gray-300">{d.displayGroup}</span>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 40, left: 170, bottom: 10 }}
            barCategoryGap={22}

          >
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              content={<CustomTooltip />}
            />

            <CartesianGrid
              horizontal={false}
              stroke="#3f3f3f"
              strokeDasharray="2 4"
            />

            <XAxis
              type="number"
              domain={[0, "dataMax + 1"]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: "#9ca3af", fontSize: 10 }}
              axisLine={{ stroke: "#4b5563" }}
              tickLine={false}
            />

            <YAxis
              type="category"
              dataKey="displayGroup"
              tick={{ fill: "#e5e7eb", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={160}
            />

            <Bar
              dataKey="reject_rate"
              barSize={18}
              radius={[0, 6, 6, 0]}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}

              <LabelList
                dataKey="reject_rate"
                position="right"
                formatter={(v) => `${v}%`}
                fill="#e5e7eb"
                fontSize={10}
                fontWeight={600}
                offset={8}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RejectRate;
