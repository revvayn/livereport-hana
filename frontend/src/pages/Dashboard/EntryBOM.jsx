import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../api/api";

export default function EntryBOM() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [bomData, setBomData] = useState([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 100;

  /* ================= FETCH BOM ================= */
  const fetchBOM = async (pageNumber = 1, keyword = "") => {
    try {
      const res = await api.get(`/bom?page=${pageNumber}&limit=${limit}&search=${keyword}`);
      setBomData(res.data?.data || []);
      setPage(res.data?.page || 1);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal mengambil data BOM", "error");
    }
  };

  useEffect(() => {
    fetchBOM(1, "");
  }, []);

  /* ================= UPLOAD ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return Swal.fire("Error", "Pilih file Excel terlebih dahulu", "error");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await api.post("/bom/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("Berhasil", res.data?.message, "success");
      setFile(null);
      fetchBOM(1, search);
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.message || "Upload gagal", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CLEAR DATA ================= */
  const handleClear = async () => {
    const confirm = await Swal.fire({
      title: "Yakin hapus semua data BOM?",
      text: "Data tidak bisa dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete("/bom/clear");
      Swal.fire("Berhasil", "Data BOM dikosongkan", "success");
      fetchBOM(1, "");
      setSearch("");
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.message || "Gagal clear data", "error");
    }
  };

  /* ================= GROUP DATA ================= */
  const groupedBOM = (bomData || []).reduce((acc, item) => {
    if (!acc[item.product_item]) {
      acc[item.product_item] = {
        ...item,
        components: [],
      };
    }
    acc[item.product_item].components.push(item);
    return acc;
  }, {});
  const groupedArray = Object.values(groupedBOM);

  return (
    <div className="space-y-6">
      {/* UPLOAD */}
      <div className="bg-white rounded-xl shadow p-6 max-w-xl">
        <h2 className="text-lg font-semibold mb-4">Upload BOM (Excel)</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files[0])} className="block w-full border rounded p-2" />
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50">
              {loading ? "Uploading..." : "Upload BOM"}
            </button>
            <button type="button" onClick={handleClear} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50">
              Clear Data BOM
            </button>
          </div>
        </form>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Data Bill of Materials</h2>
          <input type="text" placeholder="Search data BOM..." value={search} onChange={(e) => { setSearch(e.target.value); fetchBOM(1, e.target.value); }} className="border rounded px-3 py-2 text-sm w-64" />
        </div>

        <table className="min-w-full text-sm border">
          <thead className="bg-slate-100">
            <tr>
              <th className="border px-2 py-1">Product</th>
              <th className="border px-2 py-1">Product Name</th>
              <th className="border px-2 py-1">Qty</th>
              <th className="border px-2 py-1">PCS</th>
              <th className="border px-2 py-1">WH FG</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Line</th>
              <th className="border px-2 py-1">Component</th>
              <th className="border px-2 py-1">Component Name</th>
              <th className="border px-2 py-1">Qty Comp</th>
              <th className="border px-2 py-1">WH Comp</th>
              <th className="border px-2 py-1">UOM</th>
              <th className="border px-2 py-1">Ratio</th>
            </tr>
          </thead>

          <tbody>
            {groupedArray.length === 0 ? (
              <tr><td colSpan="13" className="text-center py-4 text-gray-500">Data tidak ditemukan</td></tr>
            ) : (
              groupedArray.map((group) => (
                <React.Fragment key={group.product_item}>
                  <tr className="bg-slate-200 font-semibold">
                    <td className="border px-2 py-1">{group.product_item}</td>
                    <td className="border px-2 py-1">{group.product_name}</td>
                    <td className="border px-2 py-1">{group.quantity}</td>
                    <td className="border px-2 py-1">{group.qtypcs_item}</td>
                    <td className="border px-2 py-1">{group.warehouse_fg}</td>
                    <td className="border px-2 py-1">{group.status_bom}</td>
                    <td colSpan="7" className="border px-2 py-1 italic text-gray-600">Components</td>
                  </tr>

                  {group.components.map((row) => (
                    <tr key={`${row.product_item}-${row.linenum}`} className="hover:bg-slate-50">
                      <td className="border px-2 py-1"></td>
                      <td className="border px-2 py-1"></td>
                      <td className="border px-2 py-1"></td>
                      <td className="border px-2 py-1"></td>
                      <td className="border px-2 py-1"></td>
                      <td className="border px-2 py-1"></td>
                      <td className="border px-2 py-1">{row.linenum ?? "-"}</td>
                      <td className="border px-2 py-1">{row.component_code ?? "-"}</td>
                      <td className="border px-2 py-1">{row.component_description ?? "-"}</td>
                      <td className="border px-2 py-1">{row.component_quantity ?? 0}</td>
                      <td className="border px-2 py-1">{row.component_whs ?? "-"}</td>
                      <td className="border px-2 py-1">{row.uom_component ?? "-"}</td>
                      <td className="border px-2 py-1">{row.ratio_component ?? 0}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-600">Page {page} / {totalPages} | Data tampil: {bomData.length}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => fetchBOM(page - 1, search)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
            <button disabled={page === totalPages} onClick={() => fetchBOM(page + 1, search)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
