import { useEffect, useState } from "react";
import api from "../../../api/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const card =
  "bg-white rounded-2xl shadow-sm border border-gray-100 p-5";

const COLORS = ["#2563eb", "#f97316", "#16a34a", "#eab308", "#9333ea"];

export default function BBAsalLog() {
  const [data, setData] = useState({
    bulan_ini: [],
    tahun_2025: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/bahan-baku/dashboard")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error("Dashboard error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading data...</p>;

  return (
    <div className="space-y-8">

      {/* ================= TITLE ================= */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Top 5 Asal Log
        </h1>
        <p className="text-sm text-gray-400">
          Ringkasan asal log berdasarkan volume (m³)
        </p>
      </div>

      {/* ================= BULAN INI ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* TABLE */}
        <div className={card}>
          <h3 className="font-semibold text-gray-800 mb-3">
            Asal Log Berdasar Daerah (Bulan Ini)
          </h3>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-2 text-left">Rank</th>
                <th className="py-2 text-left">Daerah</th>
                <th className="py-2 text-right">Qty (m³)</th>
              </tr>
            </thead>
            <tbody>
              {data.bulan_ini.map((r) => (
                <tr key={r.rank} className="border-b last:border-0">
                  <td className="py-2">{r.rank}</td>
                  <td className="py-2 font-medium">{r.daerah_asal}</td>
                  <td className="py-2 text-right">
                    {Number(r.qty).toLocaleString(undefined, {
                      maximumFractionDigits: 4,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BAR CHART */}
        <div className={card}>
          <h3 className="font-semibold text-gray-800 mb-3">
            Top 5 Daerah Asal (Bulan Ini)
          </h3>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.bulan_ini} layout="vertical">
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="daerah_asal"
                width={100}
              />
              <Tooltip />
              <Bar dataKey="qty" fill="#2563eb" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= TAHUN 2025 ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* TABLE */}
        <div className={card}>
          <h3 className="font-semibold text-gray-800 mb-3">
            Asal Log Berdasar Kota (Tahun 2025)
          </h3>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-2 text-left">Rank</th>
                <th className="py-2 text-left">Kota</th>
                <th className="py-2 text-right">Qty (m³)</th>
              </tr>
            </thead>
            <tbody>
              {data.tahun_2025.map((r) => (
                <tr key={r.rank} className="border-b last:border-0">
                  <td className="py-2">{r.rank}</td>
                  <td className="py-2 font-medium">{r.kota}</td>
                  <td className="py-2 text-right">
                    {Number(r.qty).toLocaleString(undefined, {
                      maximumFractionDigits: 4,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PIE */}
        <div className={card}>
          <h3 className="font-semibold text-gray-800 mb-3 text-center">
            Distribusi Asal Log 2025
          </h3>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.tahun_2025}
                dataKey="qty"
                nameKey="kota"
                outerRadius={100}
                label={({ percent }) =>
                  `${(percent * 100).toFixed(0)}%`
                }
              >
                {data.tahun_2025.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
