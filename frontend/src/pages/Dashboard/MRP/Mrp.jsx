import React, { useEffect, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import api from "../../../api/api";
import { Search, Calendar, FilterX, Trash2, ChevronLeft, ChevronRight, FileDown } from "lucide-react";

export default function Mrp() {
  /* ================= STATE ================= */
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("so");
  const [selectedSO, setSelectedSO] = useState(null);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('schedule');
  const [bomData, setBomData] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  /* --- STATE PAGINATION --- */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* ================= HELPERS ================= */
  const toInputDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  /* ================= FETCH DATA ================= */
  const fetchDemands = async () => {
    try {
      setLoading(true);
      const res = await api.get("/demand");
      const normalized = (res.data || []).map(so => ({
        ...so,
        id: so.id ?? so.demand_id,
      }));
      setDemands(normalized);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  /* ================= FILTER & PAGINATION LOGIC ================= */
  const filteredDemands = demands.filter((so) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      (so.so_number?.toLowerCase() || "").includes(search) ||
      (so.customer_name?.toLowerCase() || "").includes(search);

    const deliveryDate = toInputDate(so.delivery_date);
    const matchesStart = !dateRange.start || deliveryDate >= dateRange.start;
    const matchesEnd = !dateRange.end || deliveryDate <= dateRange.end;

    return matchesSearch && matchesStart && matchesEnd;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDemands = filteredDemands.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDemands.length / itemsPerPage);

  const resetFilter = () => {
    setSearchTerm("");
    setDateRange({ start: "", end: "" });
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateRange]);

  /* ================= ACTIONS ================= */
  const handleShowDetail = async (so) => {
    try {
      setLoading(true);
      const targetId = so.id || so.demand_id;
      const res = await api.get(`/mrp/calculate/${targetId}`);
      setBomData(res.data.mrp_data);
      setSelectedSO(res.data.info);
      setView("detail");
    } catch (err) {
      Swal.fire("Error", "Gagal menghitung MRP. Pastikan Item Routing & BOM sudah lengkap.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExportBOM = async () => {
    if (Object.keys(bomData).length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("MRP Detail");

    worksheet.columns = [
      { header: "Parent Item", key: "parent", width: 20 },
      { header: "Routing Item", key: "routing", width: 20 },
      { header: "Stage", key: "stage", width: 15 },
      { header: "Component", key: "comp", width: 15 },
      { header: "Description", key: "desc", width: 35 },
      { header: "UOM", key: "uom", width: 10 },
      { header: "Ratio", key: "ratio", width: 12 },
      { header: "Total Required", key: "req", width: 15 },
    ];

    Object.keys(bomData).forEach((fgCode) => {
      bomData[fgCode].forEach((comp) => {
        worksheet.addRow({
          parent: fgCode,
          routing: comp.product_item,
          stage: comp.stage,
          comp: comp.component_code,
          desc: comp.component_description,
          uom: comp.uom || 'PCS',
          ratio: Number(comp.ratio),
          req: Number(comp.total_req),
        });
      });
    });

    // Style Header Excel (Hitam Corporate)
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "0F172A" } };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `MRP_Detail_${selectedSO.so_number}.xlsx`);
  };

  const handleDelete = async (demandId) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
      confirmButtonColor: "#0f172a", // Ganti ke hitam
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/demand/${demandId}`);
      fetchDemands();
      Swal.fire("Berhasil", "Data dihapus", "success");
    } catch {
      Swal.fire("Error", "Gagal hapus data", "error");
    }
  };

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen font-sans">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
            {view === "so" ? "MRP" : `MRP DETAIL: ${selectedSO?.so_number}`}
          </h2>

          {view === "so" ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari SO atau Customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-[11px] border border-gray-200 rounded-md focus:outline-none w-48 font-semibold focus:border-slate-900 transition-all"
                />
              </div>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-2 gap-1">
                <Calendar size={14} className="text-gray-400 mx-1" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="bg-transparent py-2 text-[10px] font-bold text-gray-600 outline-none"
                />
                <span className="text-gray-300 px-1">-</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="bg-transparent py-2 text-[10px] font-bold text-gray-600 outline-none"
                />
              </div>
              {(searchTerm || dateRange.start || dateRange.end) && (
                <button onClick={resetFilter} className="p-2 text-red-500 hover:bg-red-50 rounded-md"><FilterX size={16} /></button>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={handleExportBOM} 
                className="flex items-center gap-2 text-[10px] bg-emerald-600 text-white px-4 py-2 rounded font-bold uppercase hover:bg-emerald-700 transition-all shadow-md"
              >
                <FileDown size={14} /> Export Excel
              </button>
              <button 
                onClick={() => setView("so")} 
                className="text-[10px] bg-slate-900 px-4 py-2 rounded font-bold text-white uppercase hover:bg-slate-800 transition-all shadow-md"
              >
                Kembali
              </button>
            </div>
          )}
        </div>

        {/* LIST VIEW */}
        {view === "so" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-4 text-left">SO Number</th>
                  <th className="py-3 px-4 text-left">Customer</th>
                  <th className="py-3 px-4 text-center">SO Date</th>
                  <th className="py-3 px-4 text-center">Delivery</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentDemands.length > 0 ? (
                  currentDemands.map((so) => (
                    <tr key={so.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-900">{so.so_number}</td>
                      <td className="py-4 px-4">{so.customer_name}</td>
                      <td className="py-4 px-4 text-center font-mono text-gray-500">{new Date(so.so_date).toLocaleDateString("id-ID")}</td>
                      <td className="py-4 px-4 text-center font-mono font-bold text-slate-900">{new Date(so.delivery_date).toLocaleDateString("id-ID")}</td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleShowDetail(so)}
                          className="px-4 py-1.5 rounded text-[11px] font-bold bg-slate-900 text-white shadow-md hover:bg-slate-800 transition-all active:scale-95"
                        >
                          Lihat MRP
                        </button>
                        <button
                          onClick={() => handleDelete(so.id)}
                          className="bg-white border border-red-100 text-red-500 p-1.5 rounded hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="py-10 text-center text-gray-400 text-xs italic">Data tidak ditemukan</td></tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            {filteredDemands.length > 0 && (
              <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDemands.length)} of {filteredDemands.length}
                </div>
                <div className="flex items-center gap-1">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="p-1 rounded hover:bg-white disabled:opacity-30 transition-all"><ChevronLeft size={16} className="text-slate-900" /></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`min-w-[24px] h-6 text-[10px] font-bold rounded ${currentPage === page ? "bg-slate-900 text-white" : "text-slate-900 hover:bg-white"}`}>{page}</button>
                  ))}
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="p-1 rounded hover:bg-white disabled:opacity-30 transition-all"><ChevronRight size={16} className="text-slate-900" /></button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DETAIL VIEW */}
        {view === "detail" && (
          <div className="space-y-4">
            {Object.keys(bomData).map((fgCode) => {
              const demandFromBackend = bomData[fgCode][0]?.item_pcs;

              return (
                <div key={fgCode} className="mb-8 border rounded-lg overflow-hidden shadow-sm bg-white">
                  <div className="bg-slate-900 px-4 py-2 text-white flex justify-between items-center font-bold tracking-wider uppercase text-xs">
                    <span>DEMAND ITEM: {fgCode}</span>
                    <span className="text-[11px] bg-white/10 px-3 py-1 rounded border border-white/20">
                      TOTAL: {Number(demandFromBackend).toLocaleString()} PCS
                    </span>
                  </div>

                  <table className="w-full text-[10px]">
                    <thead className="bg-gray-100 text-gray-600 uppercase border-b font-bold">
                      <tr>
                        <th className="p-3 text-left w-32">Routing Item</th>
                        <th className="p-3 text-left w-24">Component</th>
                        <th className="p-3 text-left">Description</th>
                        <th className="p-3 text-center w-16">UOM</th>
                        <th className="p-3 text-center w-24">Ratio</th>
                        <th className="p-3 text-right w-28">Total Req</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {bomData[fgCode].map((comp, i) => {
                        // Perbedaan warna tiap stage dalam nuansa Hitam/Abu Corporate
                        let stageBadge = "bg-slate-900 text-white"; // Default 1
                        let rowBg = "bg-white";

                        if (comp.stage.includes("2")) { stageBadge = "bg-slate-600 text-white"; rowBg = "bg-gray-50/30"; }
                        else if (comp.stage.includes("3")) { stageBadge = "bg-slate-400 text-white"; rowBg = "bg-gray-50/50"; }
                        else if (comp.stage.includes("4")) { stageBadge = "bg-gray-200 text-slate-800"; rowBg = "bg-gray-50/80"; }

                        return (
                          <tr key={i} className={`${rowBg} hover:bg-slate-100/50 transition-colors`}>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-[2px] text-[9px] font-bold block text-center shadow-sm ${stageBadge}`}>
                                {comp.product_item}
                              </span>
                              <span className="text-[7px] text-gray-500 block text-center mt-1 font-bold uppercase tracking-tighter">
                                {comp.stage}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-gray-700">{comp.component_code}</td>
                            <td className="p-3 text-gray-600 italic">{comp.component_description}</td>
                            <td className="p-3 text-center font-bold text-gray-400">{comp.uom || 'PCS'}</td>
                            <td className="p-3 text-center font-mono text-gray-400">{Number(comp.ratio).toFixed(6)}</td>
                            <td className="p-3 text-right font-bold text-slate-900 text-sm">
                              {Number(comp.total_req).toLocaleString(undefined, { minimumFractionDigits: 3 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}