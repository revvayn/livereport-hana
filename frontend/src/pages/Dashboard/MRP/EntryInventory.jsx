import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../../api/api";

export default function EntryInventory() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [inventoryData, setInventoryData] = useState([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 100;

  /* ================= FETCH INVENTORY ================= */
  const fetchInventory = async (pageNumber = 1, keyword = "") => {
    try {
      const res = await api.get(
        `/inventory?page=${pageNumber}&limit=${limit}&search=${keyword}`
      );
  
      setInventoryData(res.data.data || []);
      setPage(res.data.page || 1);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Gagal mengambil data inventory",
        "error"
      );
    }
  };
  

  /* ================= LOAD AWAL ================= */
  useEffect(() => {
    fetchInventory(1, "");
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

      const res = await api.post("/inventory/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire("Berhasil", res.data.message, "success");
      setFile(null);
      fetchInventory(1, search);
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Upload inventory gagal",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= CLEAR DATA ================= */
  const handleClear = async () => {
    const confirm = await Swal.fire({
      title: "Yakin hapus semua data inventory?",
      text: "Data tidak bisa dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete("/inventory/clear");
      Swal.fire("Berhasil", "Data inventory dikosongkan", "success");
      fetchInventory(1, "");
      setSearch("");
    } catch (err) {
      Swal.fire(
        "Gagal",
        err.response?.data?.message || "Gagal clear inventory",
        "error"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= UPLOAD ================= */}
      <div className="bg-white rounded-xl shadow p-6 max-w-xl">
        <h2 className="text-lg font-semibold mb-4">Upload Inventory (Excel)</h2>

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
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload Inventory"}
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Clear Inventory
            </button>
          </div>
        </form>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Data Inventory</h2>

          <input
            type="text"
            placeholder="Search item / warehouse..."
            value={search}
            onChange={(e) => {
              const val = e.target.value;
              setSearch(val);
              fetchInventory(1, val);
            }}
            className="border rounded px-3 py-2 text-sm w-64"
          />
        </div>

        <table className="min-w-full text-sm border">
          <thead className="bg-slate-100">
            <tr>
              <th className="border px-2 py-1">Item Code</th>
              <th className="border px-2 py-1">Warehouse</th>
              <th className="border px-2 py-1">On Hand</th>
              <th className="border px-2 py-1">Reserved</th>
              <th className="border px-2 py-1">Available</th>
              <th className="border px-2 py-1">Last Update</th>
            </tr>
          </thead>

          <tbody>
            {inventoryData.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            ) : (
              inventoryData.map((row) => (
                <tr key={row.inventory_id} className="hover:bg-slate-50">
                  <td className="border px-2 py-1">{row.item_code}</td>
                  <td className="border px-2 py-1">{row.warehouse}</td>
                  <td className="border px-2 py-1 text-right">
                    {row.on_hand_qty}
                  </td>
                  <td className="border px-2 py-1 text-right">
                    {row.reserved_qty}
                  </td>
                  <td className="border px-2 py-1 text-right font-semibold">
                    {Number(row.on_hand_qty) - Number(row.reserved_qty)}
                  </td>
                  <td className="border px-2 py-1">
                    {new Date(row.last_update).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ================= PAGINATION ================= */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-600">
            Page {page} / {totalPages} | Data tampil: {inventoryData.length}
          </span>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => fetchInventory(page - 1, search)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            <button
              disabled={page === totalPages}
              onClick={() => fetchInventory(page + 1, search)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
