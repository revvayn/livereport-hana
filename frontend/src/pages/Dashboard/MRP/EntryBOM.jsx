import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../../api/api";

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
    <div className="p-4 space-y-4 bg-slate-50 min-h-screen text-xs">
      {/* HEADER & UPLOAD SECTION */}
      <div className="bg-white rounded-lg shadow-sm border p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-slate-800">Bill of Materials</h2>
          <input
            type="text"
            placeholder="Cari data..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); fetchBOM(1, e.target.value); }}
            className="border rounded-md px-3 py-1.5 w-48 md:w-64 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files[0])}
            className="text-[11px] border rounded bg-slate-50 px-2 py-1 w-40"
          />
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-3 py-1.5 rounded font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? "..." : "Upload"}
          </button>
          <button type="button" onClick={handleClear} className="bg-red-50 text-red-600 px-3 py-1.5 rounded font-medium border border-red-100 hover:bg-red-100">
            Clear
          </button>
        </form>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b">
                <th className="w-40 p-2 text-left font-bold">Product / Component</th>
                <th className="p-2 text-left font-bold">Description</th>
                <th className="w-16 p-2 text-center font-bold">Qty</th>
                <th className="w-16 p-2 text-center font-bold">PCS</th>
                <th className="w-16 p-2 text-center font-bold">WH</th>
                <th className="w-16 p-2 text-center font-bold">Status</th>
                <th className="w-12 p-2 text-center font-bold bg-slate-200/50">Line</th>
                <th className="w-16 p-2 text-center font-bold bg-slate-200/50">UOM</th>
                <th className="w-16 p-2 text-center font-bold bg-slate-200/50">Ratio</th>
              </tr>
            </thead>
            <tbody>
              {groupedArray.length === 0 ? (
                <tr><td colSpan="9" className="text-center py-10 text-slate-400 italic">Data tidak ditemukan</td></tr>
              ) : (
                groupedArray.map((group) => (
                  <React.Fragment key={group.product_item}>
                    {/* BARIS PARENT (PRODUK JADI) */}
                    <tr className="bg-slate-200/70 border-t-2 border-slate-300 font-bold">
                      <td className="p-2 text-blue-700 font-mono truncate">{group.product_item}</td>
                      <td className="p-2 text-slate-800 truncate">{group.product_name}</td>
                      <td className="p-2 text-center">{group.quantity}</td>
                      <td className="p-2 text-center">{group.qtypcs_item}</td>
                      <td className="p-2 text-center font-normal">{group.warehouse_fg}</td>
                      <td className="p-2 text-center">
                        <span className="bg-white px-1.5 py-0.5 rounded border text-[10px] uppercase shadow-sm">{group.status_bom}</span>
                      </td>
                      {/* Bagian kolom Child yang dikosongkan pada baris Parent */}
                      <td colSpan="3" className="p-2 bg-slate-100/50 text-[10px] text-slate-400 italic text-right pr-4">
                        Components List
                      </td>
                    </tr>

                    {/* BARIS CHILD (KOMPONEN) */}
                    {group.components.map((row) => (
                      <tr key={`${row.product_item}-${row.linenum}`} className="hover:bg-blue-50/50 border-b border-slate-50 transition-colors">
                        {/* Kolom Parent dikosongkan untuk fokus ke Child */}
                        <td className="p-2 pl-6 font-mono text-[10px] text-slate-500 truncate">{row.component_code}</td>
                        <td className="p-2 text-slate-600 italic truncate">{row.component_description}</td>
                        <td className="p-2 text-center font-medium text-slate-700">{row.component_quantity}</td>
                        <td className="p-2 text-center text-slate-300">-</td>
                        <td className="p-2 text-center text-slate-400">{row.component_whs}</td>
                        <td className="p-2 text-center text-slate-300">-</td>
                        {/* Data Spesifik Child */}
                        <td className="p-2 text-center text-slate-400 border-l bg-slate-50/30">{row.linenum}</td>
                        <td className="p-2 text-center text-slate-500 bg-slate-50/30 uppercase">{row.uom_component}</td>
                        <td className="p-2 text-center font-bold text-blue-600 bg-slate-50/30">{row.ratio_component}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER / PAGINATION */}
        <div className="p-3 bg-slate-100 border-t flex justify-between items-center text-[10px]">
          <span className="text-slate-500 font-medium">Page {page} of {totalPages} | Shown: {bomData.length} items</span>
          <div className="flex gap-1">
            <button disabled={page === 1} onClick={() => fetchBOM(page - 1, search)} className="px-3 py-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-40">Prev</button>
            <button disabled={page === totalPages} onClick={() => fetchBOM(page + 1, search)} className="px-3 py-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
