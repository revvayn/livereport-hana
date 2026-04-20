import { useState, useEffect, useMemo } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";
import {
  ShoppingCart, Search, Edit2, Trash2, Loader2, PlusCircle,
  Package, ClipboardList, Calculator, ArrowRightCircle, 
  XCircle, ChevronRight
} from "lucide-react";

export default function SalesOrders() {
  // --- STATE UTAMA ---
  const [salesOrders, setSalesOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  // --- STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- FILTER LOGIC (Memoized untuk performa) ---
  const filteredSO = useMemo(() => {
    return salesOrders.filter(so =>
      so.so_number.toLowerCase().includes(search.toLowerCase()) ||
      so.customer_name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [salesOrders, search]);

  const totalPages = Math.ceil(filteredSO.length / itemsPerPage);
  const currentItems = filteredSO.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- STATE FORM HEADER (SO) ---
  const [soForm, setSoForm] = useState({
    so_number: "", so_date: "", customer_id: "", delivery_date: "", status: "OPEN"
  });
  const [editSoId, setEditSoId] = useState(null);

  // --- STATE DETAIL (ITEMS) ---
  const [selectedSO, setSelectedSO] = useState(null);
  const [items, setItems] = useState([]);
  const [itemForm, setItemForm] = useState({ item_id: "", quantity: "", pcs: "", ratio: 0 });
  const [editItemId, setEditItemId] = useState(null);

  // --- FETCH SEMUA DATA ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resSO, resCust, resItems] = await Promise.all([
        api.get("/sales-orders"),
        api.get("/customers"),
        api.get("/sales-orders/master-items")
      ]);
      setSalesOrders(Array.isArray(resSO.data) ? resSO.data : []);
      setCustomers(Array.isArray(resCust.data) ? resCust.data : []);
      setAllItems(resItems.data || []);
    } catch (err) {
      Swal.fire("Error", "Gagal mengambil data dari server", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setCurrentPage(1); }, [search]);

  // --- HANDLERS ---

  const handleSoSubmit = async (e) => {
    e.preventDefault();
    if (!soForm.customer_id || !soForm.so_number) {
      return Swal.fire("Peringatan", "Nomor SO dan Customer wajib diisi", "warning");
    }

    try {
      setLoading(true);
      if (editSoId) {
        await api.put(`/sales-orders/${editSoId}`, soForm);
        // Sinkronisasi jika SO yang sedang diedit juga sedang dibuka di panel detail
        if (selectedSO?.id === editSoId) {
          setSelectedSO({ ...selectedSO, ...soForm });
        }
      } else {
        await api.post("/sales-orders", soForm);
      }
      
      resetSoForm();
      await fetchData();
      Swal.fire({ icon: 'success', title: 'Berhasil disimpan', timer: 1000, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.message || "Terjadi kesalahan input", "error");
    } finally { setLoading(false); }
  };

  const handleEditSo = (so) => {
    const formatDate = (d) => d ? new Date(d).toISOString().split('T')[0] : "";
    setSoForm({
      so_number: so.so_number,
      so_date: formatDate(so.so_date),
      customer_id: so.customer_id,
      delivery_date: formatDate(so.delivery_date),
      status: so.status,
    });
    setEditSoId(so.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetSoForm = () => {
    setSoForm({ so_number: "", so_date: "", customer_id: "", delivery_date: "", status: "OPEN" });
    setEditSoId(null);
  };

  const selectOrder = async (so) => {
    setSelectedSO(so);
    setEditItemId(null);
    setItemForm({ item_id: "", quantity: "", pcs: "", ratio: 0 });
    try {
      setLoading(true);
      const res = await api.get(`/sales-orders/detail/${so.id}/items`);
      setItems(res.data || []);
    } catch (err) {
      console.error("Gagal load item detail", err);
    } finally { setLoading(false); }
  };

  const handleDeleteSo = async (id) => {
    const res = await Swal.fire({
      title: 'Hapus Sales Order?',
      text: "Seluruh item di dalamnya juga akan terhapus selamanya!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#0f172a',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (res.isConfirmed) {
      try {
        setLoading(true);
        await api.delete(`/sales-orders/${id}`);
        if (selectedSO?.id === id) setSelectedSO(null);
        await fetchData();
        Swal.fire("Terhapus", "Data berhasil dibersihkan", "success");
      } catch (err) {
        Swal.fire("Gagal", "Data ini kemungkinan sudah digunakan di modul lain", "error");
      } finally { setLoading(false); }
    }
  };

  const handleItemFormChange = (name, value) => {
    let nextForm = { ...itemForm, [name]: value };
    
    if (name === "item_id") {
      const master = allItems.find(i => Number(i.id) === Number(value));
      nextForm.ratio = master ? parseFloat(master.ratio_bom) : 0;
    }
    
    if (nextForm.pcs && nextForm.ratio) {
      nextForm.quantity = (parseFloat(nextForm.pcs) * nextForm.ratio).toFixed(6);
    } else if (name === "pcs" && !value) {
      nextForm.quantity = "";
    }
    setItemForm(nextForm);
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    if (selectedSO.status === "CLOSED") {
      return Swal.fire("Terkunci", "Status SO sudah CLOSED", "warning");
    }

    try {
      setLoading(true);
      const payload = {
        item_id: parseInt(itemForm.item_id),
        quantity: parseFloat(itemForm.quantity),
        pcs: parseInt(itemForm.pcs),
        sales_order_id: selectedSO.id
      };

      if (editItemId) {
        await api.put(`/sales-orders/detail/item/${editItemId}`, payload);
      } else {
        await api.post("/sales-orders/detail/item", payload);
      }

      // Reset item form & refresh list
      setItemForm({ item_id: "", quantity: "", pcs: "", ratio: 0 });
      setEditItemId(null);
      const res = await api.get(`/sales-orders/detail/${selectedSO.id}/items`);
      setItems(res.data || []);
    } catch (err) {
      Swal.fire("Error", "Gagal menyimpan rincian item", "error");
    } finally { setLoading(false); }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await api.post("/sales-orders/import-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      Swal.fire("Berhasil", "Data SO berhasil diimport", "success");
      fetchData();
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.error || "Format file tidak sesuai", "error");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-lg text-white">
              <ShoppingCart size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Order Manager</h1>
              <p className="text-sm text-slate-500 font-medium">Header & Detail Item Integration</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold cursor-pointer transition-all shadow-sm active:scale-95">
              {loading ? <Loader2 className="animate-spin" size={16} /> : <PlusCircle size={16} />}
              <span>Upload Excel</span>
              <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} />
            </label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text" placeholder="Cari SO atau Customer..."
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full md:w-64 outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                value={search} onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* SISI KIRI: DAFTAR SO & FORM HEADER */}
          <div className="lg:col-span-7 space-y-6">

            {/* Form Input SO */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                   {editSoId ? "Mode Edit Header" : "Buat Pesanan Baru"}
                </h2>
                {editSoId && (
                  <button onClick={resetSoForm} className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded">BATAL EDIT</button>
                )}
              </div>

              <form onSubmit={handleSoSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nomor SO</label>
                  <input type="text" placeholder="SO-001" className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-mono font-bold outline-none focus:border-slate-900"
                    value={soForm.so_number} onChange={e => setSoForm({ ...soForm, so_number: e.target.value.toUpperCase() })} required />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Customer</label>
                  <select className="w-full p-2 bg-slate-50 border rounded-lg text-sm outline-none focus:border-slate-900 font-medium" 
                    value={soForm.customer_id} onChange={e => setSoForm({ ...soForm, customer_id: e.target.value })} required>
                    <option value="">-- Pilih --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
                  <select className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold outline-none focus:border-slate-900" 
                    value={soForm.status} onChange={e => setSoForm({ ...soForm, status: e.target.value })}>
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal Order</label>
                  <input type="date" className="w-full p-2 bg-slate-50 border rounded-lg text-sm outline-none focus:border-slate-900"
                    value={soForm.so_date} onChange={e => setSoForm({ ...soForm, so_date: e.target.value })} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Est. Selesai</label>
                  <input type="date" className="w-full p-2 bg-slate-50 border rounded-lg text-sm outline-none focus:border-slate-900"
                    value={soForm.delivery_date} onChange={e => setSoForm({ ...soForm, delivery_date: e.target.value })} />
                </div>

                <div className="flex items-end">
                  <button type="submit" disabled={loading} className={`w-full py-2 rounded-lg text-white font-black text-xs transition-all flex justify-center items-center gap-2 ${editSoId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200'}`}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : editSoId ? <><Edit2 size={14} /> UPDATE</> : <><PlusCircle size={14} /> SIMPAN</>}
                  </button>
                </div>
              </form>
            </div>

            {/* Tabel Daftar SO */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-black uppercase">Order</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase">Customer</th>
                      <th className="px-4 py-3 text-center text-[10px] font-black uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-[10px] font-black uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentItems.map(so => (
                      <tr key={so.id} onClick={() => selectOrder(so)}
                        className={`hover:bg-slate-50/80 transition-all cursor-pointer group ${selectedSO?.id === so.id ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="font-mono font-black text-blue-700 text-sm">{so.so_number}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{new Date(so.so_date).toLocaleDateString("id-ID")}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-bold text-slate-700 uppercase leading-none truncate max-w-[150px]">{so.customer_name}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${so.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                            {so.status}
                          </span>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => handleEditSo(so)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteSo(so.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                            <button onClick={() => selectOrder(so)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"><ChevronRight size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Halaman {currentPage} dari {totalPages}</span>
                  <div className="flex gap-1">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-2 py-1 bg-white border rounded text-[10px] font-bold disabled:opacity-50">PREV</button>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-2 py-1 bg-white border rounded text-[10px] font-bold disabled:opacity-50">NEXT</button>
                  </div>
                </div>
              )}
              
              {filteredSO.length === 0 && <div className="p-10 text-center text-slate-400 text-xs italic font-medium">Tidak ada data untuk ditampilkan...</div>}
            </div>
          </div>

          {/* SISI KANAN: ITEM DETAIL */}
          <div className="lg:col-span-5">
            {selectedSO ? (
              <div className="bg-white rounded-xl shadow-lg border-2 border-slate-900 overflow-hidden sticky top-8">
                <div className="bg-slate-900 p-4 text-white flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${selectedSO.status === 'OPEN' ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`}></span>
                      <h3 className="font-black text-sm tracking-tight">DETAIL: {selectedSO.so_number}</h3>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedSO.customer_name}</p>
                  </div>
                  <button onClick={() => setSelectedSO(null)} className="text-slate-400 hover:text-white transition-colors"><XCircle size={20} /></button>
                </div>

                <div className="p-5 space-y-5">
                  <form onSubmit={handleItemSubmit} className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Pilih Produk</label>
                      <select className="w-full p-2.5 bg-white border rounded-lg text-sm font-medium outline-none focus:border-slate-900"
                        value={itemForm.item_id} onChange={(e) => handleItemFormChange("item_id", e.target.value)} required>
                        <option value="">-- Cari Item Master --</option>
                        {allItems.map(i => <option key={i.id} value={i.id}>{i.item_code} - {i.description}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-1"><Package size={10} /> Qty (PCS)</label>
                        <input type="number" className="w-full p-2.5 bg-white border rounded-lg text-sm font-black focus:border-slate-900 outline-none"
                          placeholder="0" value={itemForm.pcs} onChange={(e) => handleItemFormChange("pcs", e.target.value)} required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><Calculator size={10} /> Total Volume</label>
                        <div className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-mono text-slate-500">
                          {itemForm.quantity || "0.000"} <span className="text-[10px]">M³</span>
                        </div>
                      </div>
                    </div>

                    <button type="submit" disabled={loading || selectedSO.status === "CLOSED"} className={`w-full py-2.5 rounded-lg text-white font-black text-xs transition-all ${editItemId ? 'bg-amber-600' : 'bg-blue-600 shadow-md shadow-blue-100'}`}>
                      {editItemId ? 'UPDATE RINCIAN' : 'TAMBAHKAN KE LIST'}
                    </button>
                  </form>

                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Terdaftar:</h4>
                    {items.map(i => (
                      <div key={i.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-300 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-blue-600 transition-colors">
                            <Package size={16} />
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-800 leading-tight">{i.item_code}</div>
                            <div className="text-[10px] text-slate-500 font-bold">{i.pcs} Pcs • {parseFloat(i.quantity).toFixed(4)} m³</div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => {
                            setEditItemId(i.id);
                            const m = allItems.find(x => Number(x.id) === Number(i.item_id));
                            setItemForm({ item_id: i.item_id, pcs: i.pcs, quantity: i.quantity, ratio: m?.ratio_bom || 0 });
                          }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={12} /></button>
                          
                          <button onClick={async () => {
                            const res = await Swal.fire({ title: 'Hapus Item?', text: "Hapus rincian ini?", icon: 'warning', showCancelButton: true, confirmButtonColor: '#0f172a' });
                            if (res.isConfirmed) {
                              await api.delete(`/sales-order-items/${i.id}`);
                              selectOrder(selectedSO);
                            }
                          }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="py-10 text-center border-2 border-dashed border-slate-50 rounded-xl">
                        <ClipboardList className="mx-auto text-slate-200 mb-2" size={32} />
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Belum ada rincian</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 bg-white rounded-xl border-4 border-dashed border-slate-100 text-slate-300">
                <ArrowRightCircle size={48} className="opacity-10 mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center leading-relaxed">
                  Pilih salah satu order<br/>untuk melihat detail item
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}