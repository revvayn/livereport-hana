import { useEffect, useState } from "react";
import api from "../../api/api";
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

const cardBase =
  "rounded-2xl p-5 shadow-sm border border-gray-100 bg-white";

const COLORS = ["#2563eb", "#f97316", "#16a34a", "#eab308", "#9333ea"];

export default function RejectRateFG() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/reject-rate/grading-fg")
      .then(res => {
        console.log("API RESULT FG:", res.data);
        setData(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  if (!data) return <p>Loading...</p>;

  const totalRejectKategori =
    data.kategori?.reduce((a, b) => a + Number(b.reject || 0), 0) || 0;

  const kategoriData = data.kategori
    ?.map(k => ({
      ...k,
      reject: Number(k.reject || 0),
    }))
    .filter(k => k.reject > 0) || [];

  return (
    <div className="space-y-8">

      {/* ================= KPI ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${cardBase} bg-gradient-to-br from-blue-50 to-white`}>
          <p className="text-sm text-gray-500">Reject Rate</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {data.kpi.reject_rate}%
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Overall FG
          </p>
        </div>

        <div className={cardBase}>
          <p className="text-sm text-gray-500">Total Cek</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">
            {data.kpi.cek.toLocaleString()}
          </p>
        </div>

        <div className={cardBase}>
          <p className="text-sm text-gray-500">Total Reject</p>
          <p className="text-3xl font-bold text-red-600 mt-1">
            {data.kpi.reject.toLocaleString()}
          </p>
        </div>

        <div className={cardBase}>
          <p className="text-sm text-gray-500">Reject by Kategori</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">
            {totalRejectKategori.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ================= REJECT PER HARI ================= */}
      <div className={cardBase}>
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800">
            Reject Per Hari
          </h3>
          <p className="text-xs text-gray-400">
            Trend reject harian FG
          </p>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data.perHari}>
            <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
            <YAxis unit="%" tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Line
              dataKey="reject_rate"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ================= REJECT PER SHIFT ================= */}
      <div className={cardBase}>
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800">
            Reject Per Shift
          </h3>
          <p className="text-xs text-gray-400">
            Perbandingan reject antar shift
          </p>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.perShift}>
            <XAxis dataKey="shift" />
            <YAxis unit="%" />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar
              dataKey="reject_rate"
              fill="#f97316"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ================= PIE KATEGORI ================= */}
      <div className={cardBase}>
        <div className="mb-4 text-center">
          <h3 className="font-semibold text-gray-800">
            Reject Per Kategori
          </h3>
          <p className="text-xs text-gray-400">
            Distribusi reject berdasarkan kategori
          </p>
        </div>

        {kategoriData.length === 0 ? (
          <p className="text-center text-gray-400 py-10">
            Tidak ada data reject
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={kategoriData}
                    dataKey="reject"
                    nameKey="kategori"
                    innerRadius={60}
                    outerRadius={110}
                    labelLine={false}
                    label={({ percent }) =>
                      percent ? `${(percent * 100).toFixed(0)}%` : ""
                    }
                  >
                    {kategoriData.map((_, i) => (
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

            {/* Legend */}
            <div className="space-y-2 text-sm">
              {kategoriData.map((k, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        COLORS[i % COLORS.length],
                    }}
                  />
                  <span className="text-gray-700">
                    {k.kategori}
                  </span>
                  <span className="ml-auto font-medium">
                    {k.reject}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= TOP 3 BUYER ================= */}
      <div className={cardBase}>
        <h3 className="font-semibold text-gray-800 mb-1">
          Top 3 Reject by Buyer
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Buyer dengan persentase reject tertinggi
        </p>

        <div className="space-y-4">
          {data.topBuyer.map((b, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
            >
              {/* Rank */}
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold
                ${i === 0 ? "bg-red-500" : i === 1 ? "bg-orange-400" : "bg-yellow-400"}`}
              >
                #{i + 1}
              </div>

              {/* Buyer */}
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {b.buyer_name || "Unknown Buyer"}
                </p>
                <p className="text-xs text-gray-400">
                  Reject Rate
                </p>
              </div>

              {/* Rate */}
              <div
                className={`text-lg font-bold ${
                  b.reject_rate > 9
                    ? "text-red-600"
                    : "text-emerald-600"
                }`}
              >
                {b.reject_rate}%
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
