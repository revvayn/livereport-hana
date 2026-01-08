import { useState } from "react";
import { syncData } from "../../api/api";
import Loader from "../../components/Loader";

export default function DataSync() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSync = async () => {
    setLoading(true);
    setMessage("");
    try {
      const result = await syncData();
      setMessage(`Sync successful: ${result.rows} rows`);
    } catch (err) {
      setMessage(`Sync failed: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Data Sync SAP HANA → PostgreSQL</h1>
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
