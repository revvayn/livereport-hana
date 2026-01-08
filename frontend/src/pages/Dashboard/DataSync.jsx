import { useState } from "react";
import { syncData } from "../../api/api";
import Loader from "../../components/Loader";

export default function DataSync() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleSync = async () => {
    if (!fromDate || !toDate) {
      setMessage("Tanggal dari dan sampai wajib diisi!");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result = await syncData({ fromDate, toDate });
      setMessage(`Sync berhasil: ${result.rows} baris`);
    } catch (err) {
      setMessage(`Sync gagal: ${err.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Data Sync SAP HANA → PostgreSQL</h1>

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
      </div>

      <button
        onClick={handleSync}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        disabled={loading}
      >
        {loading ? "Syncing..." : "Start Sync"}
      </button>

      {loading && <Loader />}
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
