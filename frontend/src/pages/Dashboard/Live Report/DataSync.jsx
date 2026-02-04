import { useState, useEffect, useCallback } from "react";
import Loader from "../../../components/Loader";
import api from "../../../api/api";

export default function DataSync() {
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

  /* Restore localStorage */
  useEffect(() => {
    const saved = localStorage.getItem("dataSync");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setFromDate(parsed.fromDate || "");
      setToDate(parsed.toDate || "");
      setHasSynced(!!parsed.hasSynced);
      setPage(1);
    } catch {
      localStorage.removeItem("dataSync");
    }
  }, []);

  /* Fetch data */
  const fetchData = useCallback(
    async (targetPage = 1) => {
      if (!hasSynced) return;
      setTableLoading(true);
      setMessage("");

      try {
        const res = await api.get("/data/data-sync", {
          params: { page: targetPage, limit: 10, search: search.trim() },
        });

        if (res.data?.success) {
          setData(res.data.data || []);
          setPagination(res.data.pagination || { totalPage: 1 });
        } else {
          setData([]);
          setMessage("❌ Data kosong dari server");
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

  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  /* Sync */
  const handleSync = async () => {
    if (!fromDate || !toDate) return alert("Pilih tanggal dari dan sampai!");
    setSyncLoading(true);
    setMessage("");

    try {
      const res = await api.post("/data/sync", { fromDate, toDate });

      setMessage(`✅ Sync berhasil: ${res.data?.total || 0} baris`);
      setHasSynced(true);
      setPage(1);

      localStorage.setItem(
        "dataSync",
        JSON.stringify({ fromDate, toDate, hasSynced: true })
      );

      fetchData(1);
    } catch (err) {
      console.error(err);
      setMessage("❌ Sync gagal, cek log server");
    } finally {
      setSyncLoading(false);
    }
  };

  /* Filter data untuk search */
  const filteredData = data.filter(
    (d) =>
      d.production_no.includes(search) ||
      d.sales_order_no.includes(search) ||
      d.buyer_name.toLowerCase().includes(search.toLowerCase()) ||
      d.workcenter.toLowerCase().includes(search.toLowerCase()) ||
      d.mesin.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-1">Data Sync SAP HANA → PostgreSQL</h1>
      <p className="text-sm text-gray-500 mb-6">
        Sinkronisasi & monitoring data produksi
      </p>

      {/* Filter */}
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

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Cari production / buyer / item..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full sm:w-80 px-4 py-2 mb-4 border rounded-lg"
      />

      {/* Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {tableLoading && <Loader />}
        <div className="overflow-x-auto">
          <table className="min-w-max w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">Production</th>
                <th className="px-4 py-3">SO</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Workcenter</th>
                <th className="px-4 py-3">Mesin</th>
                <th className="px-4 py-3 text-center">Reject</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {!tableLoading && filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filteredData.map((d) => (
                  <tr key={d.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{d.production_no}</td>
                    <td className="px-4 py-3">{d.sales_order_no}</td>
                    <td className="px-4 py-3">{d.buyer_name}</td>
                    <td className="px-4 py-3">{d.workcenter}</td>
                    <td className="px-4 py-3">{d.mesin}</td>
                    <td className="px-4 py-3 text-center text-red-600">{d.reject_pcs}</td>
                    <td className="px-4 py-3">
                      {d.doc_date ? new Date(d.doc_date).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => { setSelected(d); setShowDetail(true); }}
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

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <span className="text-sm">
          Page <b>{page}</b> of <b>{pagination.totalPage}</b>
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-40"
          >
            ◀ Prev
          </button>
          <button
            disabled={page >= pagination.totalPage}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-40"
          >
            Next ▶
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selected && (
        <DetailModal data={selected} onClose={() => setShowDetail(false)} />
      )}
    </div>
  );
}

/* ================= DETAIL MODAL ================= */
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
      <p className="font-semibold text-gray-800">{value ?? "-"}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Detail Production #{data.production_no}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 text-lg">
            ✕
          </button>
        </div>

        <div className="space-y-6 text-sm">
          <Section title="Order & Buyer">
            <Detail label="Production No" value={data.production_no} />
            <Detail label="Sales Order No" value={data.sales_order_no} />
            <Detail label="Buyer Code" value={data.buyer_code} />
            <Detail label="Buyer Name" value={data.buyer_name} />
            <Detail label="Status PO" value={data.status_po} />
            <Detail label="Status SO" value={data.status_so} />
            <Detail label="SO Cancel" value={data.so_cancel ? "YES" : "NO"} />
          </Section>

          <Section title="Proses Produksi">
            <Detail label="Shift" value={data.shift} />
            <Detail label="Operator" value={data.operator_name} />
            <Detail label="Koordinator" value={data.koordinator} />
            <Detail label="No Proses" value={data.no_proses} />
            <Detail label="Workcenter" value={data.workcenter} />
            <Detail label="Kategori" value={data.kategori} />
            <Detail label="Item Code" value={data.item_code} />
            <Detail label="Item Description" value={data.item_description} />
            <Detail label="Mesin" value={data.mesin} />
            <Detail label="Route" value={data.route} />
            <Detail label="Workcenter2" value={data.workcenter2} />
            <Detail label="Unit Mesin" value={data.unit_mesin} />
            <Detail label="Status Check Out" value={data.status_check_out} />
          </Section>

          <Section title="Quantity">
            <Detail label="Vol per Pcs" value={data.vol_per_pcs} />
            <Detail label="Input Pcs" value={data.input_pcs} />
            <Detail label="Input Volume" value={data.input_volume} />
            <Detail label="Output Pcs" value={data.output_pcs} />
            <Detail label="Output Volume" value={data.output_volume} />
            <Detail label="Valid Pcs" value={data.valid_qty_pcs} />
            <Detail label="Valid Volume" value={data.valid_qty} />
            <Detail label="Reject Pcs" value={data.reject_pcs} />
            <Detail label="Reject Volume" value={data.reject_volume} />
          </Section>

          <Section title="Document">
            <Detail label="Checkin No" value={data.checkin_no} />
            <Detail label="Checkout No" value={data.checkout_no} />
            <Detail
              label="Doc Date"
              value={
                data.doc_date ? new Date(data.doc_date).toLocaleDateString("id-ID") : "-"
              }
            />
            <Detail label="Bulan" value={data.bulan} />
            <Detail
              label="Created At"
              value={
                data.created_at
                  ? new Date(data.created_at).toLocaleString("id-ID")
                  : "-"
              }
            />
          </Section>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
