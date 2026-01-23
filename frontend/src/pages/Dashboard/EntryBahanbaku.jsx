import { useState, useEffect, useCallback } from "react";
import Loader from "../../components/Loader";
import api from "../../api/api";

export default function EntryBahanbaku() {
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

    /* ================= RESTORE STATE ================= */
    useEffect(() => {
        const saved = localStorage.getItem("bahanbakuSync");
        if (!saved) return;

        try {
            const parsed = JSON.parse(saved);
            setFromDate(parsed.fromDate || "");
            setToDate(parsed.toDate || "");
            setHasSynced(!!parsed.hasSynced);
        } catch {
            localStorage.removeItem("bahanbakuSync");
        }
    }, []);

    /* ================= FETCH DATA ================= */
    const fetchData = useCallback(
        async (targetPage = 1) => {
            if (!hasSynced) return;

            setTableLoading(true);
            setMessage("");

            try {
                const res = await api.get("/bahanbaku/bahanbaku-sync", {
                    params: {
                        page: targetPage,
                        limit: 10,
                        search: search.trim(),
                    },
                });

                if (res.data?.success) {
                    setData(res.data.data || []);
                    setPagination(res.data.pagination || { totalPage: 1 });
                } else {
                    setData([]);
                    setMessage("❌ Data kosong");
                }
            } catch (err) {
                console.error(err);
                setMessage("❌ Gagal mengambil data GRPO");
            } finally {
                setTableLoading(false);
            }
        },
        [hasSynced, search]
    );

    useEffect(() => {
        fetchData(page);
    }, [page, fetchData]);

    /* ================= SYNC ================= */
    const handleSync = async () => {
        if (!fromDate || !toDate) {
            alert("Pilih tanggal dari dan sampai");
            return;
        }

        setSyncLoading(true);
        setMessage("");

        try {
            const res = await api.post("/bahanbaku/sync", { fromDate, toDate });
            const total = res.data?.total || 0;

            setHasSynced(true);
            setPage(1);
            setMessage(`✅ Sync GRPO berhasil: ${total} data`);

            localStorage.setItem(
                "bahanbakuSync",
                JSON.stringify({ fromDate, toDate, hasSynced: true })
            );

            fetchData(1);
        } catch (err) {
            console.error(err);
            setMessage("❌ Sync GRPO gagal");
        } finally {
            setSyncLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-1">Data Sync SAP → GRPO</h1>
            <p className="text-sm text-gray-500 mb-6">
                Sinkronisasi & monitoring data GRPO
            </p>

            {/* FILTER */}
            <div className="flex flex-wrap gap-3 mb-4">
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border px-3 py-2 rounded-lg" />
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border px-3 py-2 rounded-lg" />
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
                placeholder="🔍 Cari GRPO / Vendor / Item..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full sm:w-80 px-4 py-2 mb-4 border rounded-lg"
            />

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow overflow-hidden">
                {tableLoading && <Loader />}
                <div className="overflow-x-auto">
                    <table className="min-w-max w-full text-sm">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3">No GRPO</th>
                                <th className="px-4 py-3">Tanggal</th>
                                <th className="px-4 py-3">Vendor</th>
                                <th className="px-4 py-3">Item</th>
                                <th className="px-4 py-3 text-right">Qty (m³)</th>
                                <th className="px-4 py-3 text-right">Total</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!tableLoading && data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-gray-400">
                                        Tidak ada data
                                    </td>
                                </tr>
                            ) : (
                                data.map(d => (
                                    <tr
                                        key={`${d.tgl_grpo}-${d.no_grpo}-${d.kode_item}`}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 font-semibold">{d.no_grpo}</td>
                                        <td className="px-4 py-3">
                                            {new Date(d.tgl_grpo).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="px-4 py-3">{d.nama_vendor}</td>
                                        <td className="px-4 py-3">{d.description}</td>
                                        <td className="px-4 py-3 text-right">{d.qty_grpo}</td>
                                        <td className="px-4 py-3 text-right">
                                            {Number(d.total_price_grpo).toLocaleString("id-ID")}
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

            {/* PAGINATION */}
            <div className="flex justify-between items-center mt-6">
                <span className="text-sm">
                    Page <b>{page}</b> of <b>{pagination.totalPage}</b>
                </span>
                <div className="flex gap-2">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border rounded-lg disabled:opacity-40">
                        ◀ Prev
                    </button>
                    <button disabled={page >= pagination.totalPage} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border rounded-lg disabled:opacity-40">
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
    const Section = ({ title, children }) => (
      <div>
        <h3 className="font-semibold text-gray-700 mb-3 border-b pb-1">
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children}
        </div>
      </div>
    );
  
    const Detail = ({ label, value }) => (
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-gray-500 text-xs mb-1">{label}</p>
        <p className="font-semibold text-gray-800">
          {value ?? "-"}
        </p>
      </div>
    );
  
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl w-full max-w-6xl p-6 max-h-[90vh] overflow-y-auto">
          
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Detail GRPO #{data.no_grpo}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-600 text-lg"
            >
              ✕
            </button>
          </div>
  
          <div className="space-y-6 text-sm">
  
            {/* DOKUMEN */}
            <Section title="Dokumen GRPO">
              <Detail label="Tanggal GRPO" value={new Date(data.tgl_grpo).toLocaleDateString("id-ID")} />
              <Detail label="Tahun" value={data.tahun} />
              <Detail label="Bulan" value={data.bulan} />
              <Detail label="Entry GRPO" value={data.entry_grpo} />
              <Detail label="No GRPO" value={data.no_grpo} />
              <Detail label="No Invoice SIM" value={data.no_inv_sim} />
              <Detail label="No Tally" value={data.no_tally} />
              <Detail label="No Ref PO" value={data.no_ref_po} />
              <Detail label="No Kedatangan" value={data.no_kedatangan} />
              <Detail label="Surat Jalan Vendor" value={data.no_surat_jalan_vendor} />
            </Section>
  
            {/* VENDOR */}
            <Section title="Vendor">
              <Detail label="Kode Vendor" value={data.kode_vendor} />
              <Detail label="Nama Vendor" value={data.nama_vendor} />
              <Detail label="Rank" value={data.rank} />
              <Detail label="Kota Asal" value={data.kota_asal} />
              <Detail label="Asal Barang" value={data.asal_barang} />
            </Section>
  
            {/* ITEM & MATERIAL */}
            <Section title="Item & Material">
              <Detail label="Group Rotary" value={data.group_rotary} />
              <Detail label="Kode Item" value={data.kode_item} />
              <Detail label="Deskripsi" value={data.description} />
              <Detail label="Jenis Kayu" value={data.jenis_kayu} />
              <Detail label="Group Kayu" value={data.group_kayu} />
              <Detail label="Diameter" value={data.diameter} />
              <Detail label="Total Diameter" value={data.total_dia} />
              <Detail label="Code" value={data.code} />
            </Section>
  
            {/* QUANTITY */}
            <Section title="Quantity">
              <Detail label="Qty PCS GRPO" value={data.qty_pcs_grpo} />
              <Detail label="Qty GRPO (m³)" value={data.qty_grpo} />
            </Section>
  
            {/* HARGA */}
            <Section title="Harga">
              <Detail label="Harga per m³" value={Number(data.price_per_m3).toLocaleString("id-ID")} />
              <Detail label="Total Harga GRPO" value={Number(data.total_price_grpo).toLocaleString("id-ID")} />
            </Section>
  
            {/* STATUS & GUDANG */}
            <Section title="Status & Gudang">
              <Detail label="Warehouse" value={data.whs} />
              <Detail label="Status GRPO" value={data.status_grpo} />
              <Detail label="SLP Code" value={data.slpcode} />
              <Detail label="Nama Grader" value={data.nama_grader} />
            </Section>
  
          </div>
  
          {/* FOOTER */}
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
  

