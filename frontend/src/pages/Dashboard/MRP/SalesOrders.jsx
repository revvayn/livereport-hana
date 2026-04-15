import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";
import {
  ShoppingCart, Search, Edit2, Trash2, Loader2, PlusCircle,
  Calendar, User, Package, ClipboardList, Calculator,
  ArrowRightCircle, XCircle, ChevronRight, CheckCircle2
} from "lucide-react";

export default function SalesOrders() {
  // --- STATE UTAMA ---
  const [salesOrders, setSalesOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

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
      // Perhatikan: path disesuaikan dengan route backend
      const [resSO, resCust, resItems] = await Promise.all([
        api.get("/sales-orders"),
        api.get("/customers"),
        api.get("/sales-orders/master-items") // Sesuaikan path
      ]);
      setSalesOrders(Array.isArray(resSO.data) ? resSO.data : []);
      setCustomers(Array.isArray(resCust.data) ? resCust.data : []);
      setAllItems(resItems.data || []);
    } catch (err) {
      Swal.fire("Error", "Gagal mengambil data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- HANDLER SALES ORDER (HEADER) ---
  const handleSoSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editSoId) {
        await api.put(`/sales-orders/${editSoId}`, soForm);
        // Jika sedang mengedit SO yang terpilih di panel kanan, update state selectedSO-nya juga
        if (selectedSO?.id === editSoId) {
          setSelectedSO(prev => ({ ...prev, ...soForm }));
        }
      } else {
        await api.post("/sales-orders", soForm);
      }
      resetSoForm();
      fetchData();
      Swal.fire({ icon: 'success', title: 'Berhasil', timer: 800, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Gagal", "Cek kembali inputan anda", "error");
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

  // --- HANDLER ITEMS (DETAIL) ---
  const selectOrder = async (so) => {
    setSelectedSO(so);
    setLoading(true);
    try {
      // Sesuaikan endpoint dengan route backend baru
      const res = await api.get(`/sales-orders/detail/${so.id}/items`);
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      cancelItemEdit();
    }
  };
  // --- HANDLER DELETE SO (HEADER) ---
  const handleDeleteSo = async (id) => {
    const res = await Swal.fire({
      title: 'Hapus Sales Order?',
      text: "Menghapus Header akan menghapus seluruh item di dalamnya!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', // Merah
      cancelButtonColor: '#0f172a',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (res.isConfirmed) {
      try {
        setLoading(true);
        await api.delete(`/sales-orders/${id}`);
        if (selectedSO?.id === id) setSelectedSO(null); // Tutup panel kanan jika yang dihapus sedang dibuka
        fetchData(); // Refresh tabel
        Swal.fire("Terhapus", "Sales Order berhasil dihapus", "success");
      } catch (err) {
        Swal.fire("Gagal", "Tidak dapat menghapus data", "error");
      } finally {
        setLoading(false);
      }
    }
  };
  const handleItemFormChange = (name, value) => {
    let nextForm = { ...itemForm, [name]: value };
    if (name === "item_id") {
      const master = allItems.find(i => Number(i.id) === Number(value));
      nextForm.ratio = master ? parseFloat(master.ratio_bom) : 0;
    }
    if (nextForm.pcs && nextForm.ratio) {
      nextForm.quantity = parseFloat((nextForm.pcs * nextForm.ratio).toFixed(6));
    } else if (name === "pcs" && !value) {
      nextForm.quantity = "";
    }
    setItemForm(nextForm);
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    if (selectedSO.status === "CLOSED") {
      return Swal.fire("Akses Ditolak", "SO sudah CLOSED, tidak bisa tambah/edit item", "warning");
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

      cancelItemEdit();
      // Refresh list item saja
      const res = await api.get(`/sales-orders/detail/${selectedSO.id}/items`);
      setItems(res.data || []);
    } catch (err) {
      Swal.fire("Error", "Gagal simpan item", "error");
    } finally { setLoading(false); }
  };

  const cancelItemEdit = () => {
    setEditItemId(null);
    setItemForm({ item_id: "", quantity: "", pcs: "", ratio: 0 });
  };

  const filteredSO = salesOrders.filter(so =>
    so.so_number.toLowerCase().includes(search.toLowerCase()) ||
    so.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

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
      fetchData(); // Refresh data tabel
    } catch (err) {
      Swal.fire("Gagal", err.response?.data?.error || "Gagal import file", "error");
    } finally {
      setLoading(false);
      e.target.value = ""; // Reset input file
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
  <div className="flex items-center gap-4">
    <div className="p-3 bg-slate-900 rounded-lg text-white">
      <ShoppingCart size={24} />
    </div>
    <div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Order Manager</h1>
      <p className="text-sm text-slate-500 font-medium">Sistem Terintegrasi Header & Detail Item</p>
    </div>
  </div>
  
  <div className="flex items-center gap-3">
    {/* TOMBOL UPLOAD EXCEL BARU */}
    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold cursor-pointer transition-all shadow-sm active:scale-95">
      {loading ? <Loader2 className="animate-spin" size={16} /> : <PlusCircle size={16} />}
      <span>Upload SO</span>
      <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportExcel} />
    </label>

    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      <input
        type="text" placeholder="Cari Nomor SO..."
        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full md:w-64 outline-none focus:border-slate-900 transition-all"
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
                  <PlusCircle size={16} /> {editSoId ? "Mode Edit Header" : "Buat Pesanan Baru"}
                </h2>
                {editSoId && (
                  <button onClick={resetSoForm} className="text-[10px] font-bold text-red-500 hover:underline">BATAL EDIT</button>
                )}
              </div>

              <form onSubmit={handleSoSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Nomor SO</label>
                  <input type="text" placeholder="CONTOH: SO001" className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-mono font-bold outline-none focus:border-slate-900"
                    value={soForm.so_number} onChange={e => setSoForm({ ...soForm, so_number: e.target.value.toUpperCase() })} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Customer</label>
                  <select className="w-full p-2 bg-slate-50 border rounded-lg text-sm outline-none focus:border-slate-900 font-medium text-slate-700" value={soForm.customer_id}
                    onChange={e => setSoForm({ ...soForm, customer_id: e.target.value })}>
                    <option value="">-- Pilih Customer --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Status SO</label>
                  <select className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold outline-none focus:border-slate-900" value={soForm.status}
                    onChange={e => setSoForm({ ...soForm, status: e.target.value })}>
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Tanggal Order</label>
                  <input type="date" className="w-full p-2 bg-slate-50 border rounded-lg text-sm outline-none focus:border-slate-900"
                    value={soForm.so_date} onChange={e => setSoForm({ ...soForm, so_date: e.target.value })} />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 ml-1 uppercase">Estimasi Selesai</label>
                  <input type="date" className="w-full p-2 bg-slate-50 border rounded-lg text-sm outline-none focus:border-slate-900"
                    value={soForm.delivery_date} onChange={e => setSoForm({ ...soForm, delivery_date: e.target.value })} />
                </div>

                <div className="flex items-end">
                  <button type="submit" disabled={loading} className={`w-full py-2 rounded-lg text-white font-black text-xs transition-all flex justify-center items-center gap-2 ${editSoId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-200'}`}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : editSoId ? <><Edit2 size={14} /> UPDATE HEADER</> : <><PlusCircle size={14} /> SIMPAN PESANAN</>}
                  </button>
                </div>
              </form>
            </div>

            {/* Tabel Daftar SO */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-black uppercase">Detail Order</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase">Customer</th>
                    <th className="px-4 py-3 text-center text-[10px] font-black uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-[10px] font-black uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSO.map(so => (
                    <tr key={so.id} onClick={() => selectOrder(so)}
                      className={`hover:bg-slate-50/80 transition-all cursor-pointer group ${selectedSO?.id === so.id ? 'bg-blue-50/50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-mono font-black text-blue-700 text-sm leading-none mb-1">{so.so_number}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{new Date(so.so_date).toLocaleDateString("id-ID")}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-bold text-slate-700 uppercase leading-none">{so.customer_name}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-tighter border ${so.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                          {so.status}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2 justify-center">
                          {/* Tombol Edit */}
                          <button
                            onClick={() => handleEditSo(so)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Header"
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* Tombol Hapus - INI YANG BARU */}
                          <button
                            onClick={() => handleDeleteSo(so.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Sales Order"
                          >
                            <Trash2 size={14} />
                          </button>

                          {/* Tombol Pilih/Detail */}
                          <button
                            onClick={() => selectOrder(so)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Lihat Detail Item"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSO.length === 0 && <div className="p-10 text-center text-slate-400 text-sm italic">Data tidak ditemukan...</div>}
            </div>
          </div>

          {/* SISI KANAN: ITEM DARI SO TERPILIH */}
          <div className="lg:col-span-5">
            {selectedSO ? (
              <div className="bg-white rounded-xl shadow-lg border-2 border-slate-900 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Header Item List */}
                <div className="bg-slate-900 p-4 text-white flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${selectedSO.status === 'OPEN' ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                      <h3 className="font-black text-sm tracking-tight">ITEMS: {selectedSO.so_number}</h3>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">{selectedSO.customer_name}</p>
                  </div>
                  <button onClick={() => setSelectedSO(null)} className="text-slate-400 hover:text-white transition-colors"><XCircle size={20} /></button>
                </div>

                <div className="p-5 space-y-5">
                  {/* Form Input Item */}
                  <form onSubmit={handleItemSubmit} className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Pilih Produk / Item</label>
                      <select className="w-full p-2.5 bg-white border rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                        value={itemForm.item_id} onChange={(e) => handleItemFormChange("item_id", e.target.value)} required>
                        <option value="">-- Pilih Produk Master --</option>
                        {allItems.map(i => <option key={i.id} value={i.id}>{i.item_code} - {i.description}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-1"><Package size={10} /> Jumlah (PCS)</label>
                        <input type="number" className="w-full p-2.5 bg-white border rounded-lg text-sm font-black focus:border-slate-900 outline-none"
                          placeholder="0" value={itemForm.pcs} onChange={(e) => handleItemFormChange("pcs", e.target.value)} required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1"><Calculator size={10} /> Total M³</label>
                        <input type="number" className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-mono text-slate-500"
                          readOnly value={itemForm.quantity} />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button type="submit" disabled={loading} className={`flex-1 py-2.5 rounded-lg text-white font-black text-xs transition-all ${editItemId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100'}`}>
                        {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : editItemId ? 'UPDATE ITEM' : 'TAMBAH KE DAFTAR'}
                      </button>
                      {editItemId && (
                        <button type="button" onClick={cancelItemEdit} className="px-3 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Daftar Item Terinput */}
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Item Terdaftar:</h4>
                    {items.map(i => (
                      <div key={i.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            <Package size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-800 leading-tight">{i.item_code}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">{i.pcs} Pcs <span className="mx-1">•</span> {parseFloat(i.quantity).toFixed(4)} m³</div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => {
                            setEditItemId(i.id);
                            const m = allItems.find(x => Number(x.id) === Number(i.item_id));
                            setItemForm({ item_id: i.item_id, pcs: i.pcs, quantity: i.quantity, ratio: m?.ratio_bom || 0 });
                          }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                          <button onClick={async () => {
                            const res = await Swal.fire({ title: 'Hapus Item?', text: "Item akan dihapus dari SO ini", icon: 'warning', showCancelButton: true, confirmButtonColor: '#0f172a' });
                            if (res.isConfirmed) {
                              await api.delete(`/sales-order-items/${i.id}`);
                              selectOrder(selectedSO); // Refresh list
                            }
                          }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="py-12 text-center">
                        <ClipboardList className="mx-auto text-slate-200 mb-2" size={40} />
                        <p className="text-xs text-slate-400 font-medium italic">Belum ada item yang diinputkan...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 bg-white rounded-xl border-4 border-dashed border-slate-100 text-slate-300">
                <div className="p-5 bg-slate-50 rounded-full mb-4">
                  <ArrowRightCircle size={48} className="opacity-20 text-slate-900" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center">Pilih Sales Order Di Tabel Kiri<br /><span className="text-[10px] font-medium lowercase">untuk mengelola rincian produk</span></p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}