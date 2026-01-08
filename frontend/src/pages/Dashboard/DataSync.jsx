import { useState, useEffect, useCallback } from "react";
import Loader from "../../components/Loader";
import api from "../../api/api";

export default function DataSync() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPage: 1 });

  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // ==============================
  // HANDLE SYNC
  // ==============================
  const handleSync = async () => {
    if (!fromDate || !toDate) {
      alert("Pilih tanggal dari dan sampai!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/data/sync", { fromDate, toDate });
      setMessage(`Sync berhasil: ${res.data.rows} baris`);

      // Fetch data terbaru untuk tabel
      fetchData(1);
    } catch (err) {
      setMessage(`Sync gagal: ${err.message}`);
    }

    setLoading(false);
  };

  // ==============================
  // FETCH DATA UNTUK TABEL
  // ==============================
  const fetchData = useCallback(
    async (p = page) => {
      try {
        const res = await api.get("/data-sync", {
          params: { page: p, limit: 10, search, fromDate, toDate },
        });
        if (res.data.success) {
          setData(res.data.data);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error("FETCH ERROR:", err);
      }
    },
    [page, search, fromDate, toDate]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-4">Data Sync SAP HANA → PostgreSQL</h1>

      {/* DATE PICKER + SYNC */}
      <div className="flex gap-4 mb-4">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={handleSync}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? "Syncing..." : "Start Sync"}
        </button>
      </div>

      {message && <p className="mb-4">{message}</p>}
      {loading && <Loader />}

      {/* SEARCH */}
      <input
        type="text"
        placeholder="🔍 Cari production / buyer / item..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="w-full sm:w-80 px-4 py-2 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      />

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left">Production</th>
                <th className="px-4 py-3 text-left">SO</th>
                <th className="px-4 py-3 text-left">Buyer</th>
                <th className="px-4 py-3 text-left">Item</th>
                <th className="px-4 py-3 text-left">Workcenter</th>
                <th className="px-4 py-3 text-center">Reject</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-400">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                data.map((d, i) => (
                  <tr
                    key={d.id}
                    className={`border-t hover:bg-gray-50 ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}
                  >
                    <td className="px-4 py-3 font-semibold">{d.production_no}</td>
                    <td className="px-4 py-3">{d.sales_order_no}</td>
                    <td className="px-4 py-3">{d.buyer_name}</td>
                    <td className="px-4 py-3 truncate max-w-xs">{d.item_description}</td>
                    <td className="px-4 py-3">{d.workcenter}</td>
                    <td className="px-4 py-3 text-center font-semibold text-red-600">{d.reject_pcs}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(d.doc_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelected(d);
                          setShowDetail(true);
                        }}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3">
        <span className="text-sm text-gray-600">
          Page <b>{page}</b> of <b>{pagination.totalPage}</b>
        </span>

        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40"
          >
            ◀ Prev
          </button>
          <button
            disabled={page >= pagination.totalPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40"
          >
            Next ▶
          </button>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {showDetail && selected && (
        <DetailModal data={selected} onClose={() => setShowDetail(false)} />
      )}
    </div>
  );
}

// ====================== DETAIL MODAL ======================
function DetailModal({ data, onClose }) {
  const Section = ({ title, children }) => (
    <div>
      <h3 className="font-semibold text-gray-700 mb-3 border-b pb-1">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
  const Detail = ({ label, value }) => (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className="font-semibold text-gray-800">{value || "-"}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Detail Production #{data.production_no}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 text-lg">✕</button>
        </div>

        <Section title="Order & Buyer">
          <Detail label="Production No" value={data.production_no} />
          <Detail label="Sales Order No" value={data.sales_order_no} />
          <Detail label="Buyer Name" value={data.buyer_name} />
          <Detail label="Item Description" value={data.item_description} />
          <Detail label="Workcenter" value={data.workcenter} />
        </Section>

        <div className="mt-6 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
