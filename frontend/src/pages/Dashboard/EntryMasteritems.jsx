import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../api/api";

export default function EntryMasteritems() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 100;

  /* ================= FETCH ITEMS ================= */
  const fetchItems = async (pageNumber = 1, keyword = "") => {
    try {
      const res = await api.get(
        `/items?page=${pageNumber}&limit=${limit}&search=${keyword}`
      );

      setItems(res.data.data);
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      Swal.fire("Error", "Gagal mengambil data item", "error");
    }
  };

  useEffect(() => {
    fetchItems(1, "");
  }, []);

  /* ================= UPLOAD ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      Swal.fire("Error", "Pilih file Excel terlebih dahulu", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await api.post("/items/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire("Berhasil", res.data.message, "success");
      setFile(null);
      fetchItems(1, search);
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Upload gagal",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= CLEAR ================= */
  const handleClear = async () => {
    const confirm = await Swal.fire({
      title: "Yakin hapus semua master item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Ya, hapus",
    });

    if (!confirm.isConfirmed) return;

    await api.delete("/items/clear");
    fetchItems(1, "");
    setSearch("");
  };

  return (
    <div className="space-y-6">
      {/* UPLOAD */}
      <div className="bg-white rounded-xl shadow p-6 max-w-xl">
        <h2 className="text-lg font-semibold mb-4">Upload Master Item</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full border rounded p-2"
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {loading ? "Uploading..." : "Upload Item"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Clear Data
            </button>
          </div>
        </form>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
        <div className="flex justify-between mb-3">
          <h2 className="text-lg font-semibold">Master Item</h2>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchItems(1, e.target.value);
            }}
            placeholder="Search item..."
            className="border rounded px-3 py-2 text-sm"
          />
        </div>

        <table className="min-w-full text-sm border">
          <thead className="bg-slate-100">
            <tr>
              <th className="border px-2 py-1">Item Code</th>
              <th className="border px-2 py-1">Item Name</th>
              <th className="border px-2 py-1">Type</th>
              <th className="border px-2 py-1">UOM</th>
              <th className="border px-2 py-1">Lead Time</th>
              <th className="border px-2 py-1">Safety Stock</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.item_code}>
                  <td className="border px-2 py-1">{row.item_code}</td>
                  <td className="border px-2 py-1">{row.item_name}</td>
                  <td className="border px-2 py-1">{row.item_type}</td>
                  <td className="border px-2 py-1">{row.uom}</td>
                  <td className="border px-2 py-1">{row.lead_time_days}</td>
                  <td className="border px-2 py-1">{row.safety_stock}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
