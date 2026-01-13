import { useState, useEffect, useCallback } from "react";
import Loader from "../../components/Loader";
import api from "../../api/api";

export default function DataSync() {
  /* ================= STATE ================= */
  const [syncLoading, setSyncLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPage: 1 });

  const [hasSynced, setHasSynced] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  /* ================= RESTORE LOCALSTORAGE ================= */
  useEffect(() => {
    const saved = localStorage.getItem("dataSync");
    if (saved) {
      const parsed = JSON.parse(saved);
      setFromDate(parsed.fromDate);
      setToDate(parsed.toDate);
      setHasSynced(true);
      setPage(1);
    }
  }, []);

  /* ================= FETCH DATA ================= */
  const fetchData = useCallback(
    async (targetPage) => {
      if (!hasSynced) return;

      setTableLoading(true);
      setMessage("");

      try {
        const res = await api.get("/data/data-sync", {
          params: {
            page: targetPage,
            limit: 10,
            search
          }
        });

        if (res.data?.success) {
          setData(res.data.data);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error(err);
        setMessage("❌ Gagal mengambil data");
      } finally {
        setTableLoading(false);
      }
    },
    [hasSynced, search]
  );

  /* ================= AUTO FETCH ================= */
  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  /* ================= SYNC ================= */
  const handleSync = async () => {
    if (!fromDate || !toDate) {
      alert("Pilih tanggal dari dan sampai!");
      return;
    }

    setSyncLoading(true);
    setMessage("");

    try {
      const res = await api.post("/data/sync", { fromDate, toDate });

      setMessage(`✅ Sync berhasil: ${res.data.rows} baris`);
      setHasSynced(true);
      setPage(1);

      localStorage.setItem(
        "dataSync",
        JSON.stringify({
          fromDate,
          toDate,
          hasSynced: true
        })
      );

      fetchData(1);
    } catch (err) {
      console.error(err);
      setMessage("❌ Sync gagal, cek log server");
    } finally {
      setSyncLoading(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-1">
        Data Sync SAP HANA → PostgreSQL
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Sinkronisasi & monitoring data produksi
      </p>

      {/* FILTER */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        />

        <button
          onClick={handleSync}
          disabled={syncLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg disabled:opacity-50"
        >
          {syncLoading ? "Syncing..." : "Start Sync"}
        </button>
      </div>

      {message && <div className="mb-4 text-sm font-medium">{message}</div>}

      {/* SEARCH */}
      <input
        type="text"
        placeholder="🔍 Cari production / buyer / item..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="w-full sm:w-80 px-4 py-2 mb-4 border rounded-lg"
      />

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {tableLoading && <Loader />}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3">Production</th>
                <th className="px-4 py-3">SO</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Workcenter</th>
                <th className="px-4 py-3 text-center">Reject</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {!tableLoading && data.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-400">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                data.map((d) => (
                  <tr key={d.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">
                      {d.production_no}
                    </td>
                    <td className="px-4 py-3">{d.sales_order_no}</td>
                    <td className="px-4 py-3">{d.buyer_name}</td>
                    <td className="px-4 py-3">{d.item_description}</td>
                    <td className="px-4 py-3">{d.workcenter}</td>
                    <td className="px-4 py-3 text-center text-red-600">
                      {d.reject_pcs}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(d.doc_date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelected(d);
                          setShowDetail(true);
                        }}
                        className="text-blue-600 hover:underline"
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
      <div className="flex justify-between items-center mt-6">
        <span className="text-sm">
          Page <b>{page}</b> of <b>{pagination.totalPage}</b>
        </span>

        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-40"
          >
            ◀ Prev
          </button>

          <button
            disabled={page >= pagination.totalPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-40"
          >
            Next ▶
          </button>
        </div>
      </div>

      {showDetail && selected && (
        <DetailModal data={selected} onClose={() => setShowDetail(false)} />
      )}
    </div>
  );
}

/* ================= DETAIL MODAL ================= */
function DetailModal({ data, onClose }) {
  const Item = ({ label, value }) => (
    <div className="bg-gray-50 p-3 rounded-lg">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold">{value || "-"}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">
            Detail Production #{data.production_no}
          </h2>
          <button onClick={onClose} className="text-xl">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Item label="Sales Order" value={data.sales_order_no} />
          <Item label="Buyer" value={data.buyer_name} />
          <Item label="Item" value={data.item_description} />
          <Item label="Workcenter" value={data.workcenter} />
        </div>
      </div>
    </div>
  );
}
