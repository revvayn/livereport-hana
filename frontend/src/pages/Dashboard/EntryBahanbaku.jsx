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
        const saved = localStorage.getItem("bahanbaku");
        if (!saved) return;
        try {
            const parsed = JSON.parse(saved);
            setFromDate(parsed.fromDate || "");
            setToDate(parsed.toDate || "");
            setHasSynced(!!parsed.hasSynced);
            setPage(1);
        } catch {
            localStorage.removeItem("bahanbaku");
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
            return alert("Pilih tanggal dari dan sampai");
        }

        setSyncLoading(true);
        setMessage("");

        try {
            const res = await api.post("/bahanbaku/sync", {
                fromDate,
                toDate,
            });

            setMessage(`✅ Sync GRPO berhasil: ${res.data?.total || 0} data`);
            setHasSynced(true);
            setPage(1);

            localStorage.setItem(
                "grpoSync",
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
            <h1 className="text-2xl font-bold mb-1">Entry GRPO</h1>
            <p className="text-sm text-gray-500 mb-6">
                Sinkronisasi & monitoring data GRPO
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
                placeholder="🔍 Cari GRPO / Vendor / Item..."
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
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left">No GRPO</th>
                                <th className="px-4 py-3 text-left">Vendor</th>
                                <th className="px-4 py-3 text-left">Item</th>
                                <th className="px-4 py-3 text-right">Qty</th>
                                <th className="px-4 py-3 text-right">Total Price</th>
                                <th className="px-4 py-3">Status</th>
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
                                data.map((d) => (
                                    <tr key={d.id} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-3 font-semibold">{d.no_grpo}</td>
                                        <td className="px-4 py-3">{d.nama_vendor}</td>
                                        <td className="px-4 py-3">{d.description}</td>
                                        <td className="px-4 py-3 text-right">{d.qty_grpo}</td>
                                        <td className="px-4 py-3 text-right">
                                            {Number(d.total_price_grpo).toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-4 py-3">{d.status_grpo}</td>
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
