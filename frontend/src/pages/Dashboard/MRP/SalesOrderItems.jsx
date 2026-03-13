import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";
import Select from "react-select";
import { 
  Package, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  PlusCircle, 
  ClipboardList, 
  Calculator,
  ArrowRightCircle
} from "lucide-react";

export default function SalesOrderItems() {
  const [selectedSOId, setSelectedSOId] = useState("");
  const [soNumber, setSoNumber] = useState("");
  const [allSalesOrders, setAllSalesOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    item_id: "",
    quantity: "",
    pcs: "",
    ratio: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resSO, resItems] = await Promise.all([
          api.get("/sales-orders"),
          api.get("/sales-order-items/master-items")
        ]);
        setAllSalesOrders(resSO.data || []);
        setAllItems(resItems.data || []);
      } catch (err) {
        Swal.fire("Error", "Gagal load data master", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSOId) {
      fetchItems(selectedSOId);
      const so = allSalesOrders.find(x => Number(x.id) === Number(selectedSOId));
      setSoNumber(so?.so_number || "");
    } else {
      setItems([]);
      setSoNumber("");
    }
    cancelEdit();
  }, [selectedSOId]);

  const fetchItems = async (soId) => {
    const res = await api.get(`/sales-order-items/${soId}/items`);
    setItems(res.data || []);
  };

  const handleFormChange = (name, value) => {
    let nextForm = { ...form, [name]: value };

    if (name === "item_id") {
      const master = allItems.find(i => Number(i.id) === Number(value));
      nextForm.ratio = master ? parseFloat(master.ratio_bom) : 0;
    }

    const p = name === "pcs" ? value : nextForm.pcs;
    const r = nextForm.ratio;

    if (p && r) {
      const rawQty = parseFloat(p) * r;
      nextForm.quantity = parseFloat(rawQty.toFixed(6));
    } else {
      nextForm.quantity = "";
    }
    setForm(nextForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSOId) return Swal.fire("Peringatan", "Pilih Sales Order terlebih dahulu", "warning");

    try {
      setLoading(true);
      const payload = {
        item_id: parseInt(form.item_id),
        quantity: parseFloat(form.quantity),
        pcs: parseInt(form.pcs) || 0,
        sales_order_id: parseInt(selectedSOId)
      };

      if (editId) {
        await api.put(`/sales-order-items/${editId}`, payload);
        Swal.fire({ icon: 'success', title: 'Updated', text: 'Item diperbarui', timer: 1500, showConfirmButton: false });
      } else {
        await api.post("/sales-order-items", payload);
        Swal.fire({ icon: 'success', title: 'Added', text: 'Item ditambahkan', timer: 1500, showConfirmButton: false });
      }

      cancelEdit();
      fetchItems(selectedSOId);
    } catch (err) {
      Swal.fire("Error", "Gagal simpan data", "error");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ item_id: "", quantity: "", pcs: "", ratio: 0 });
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Item?",
      text: "Item akan dihapus dari daftar Sales Order ini",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Ya, Hapus"
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/sales-order-items/${id}`);
        Swal.fire("Terhapus", "Item berhasil dihapus", "success");
        fetchItems(selectedSOId);
      } catch (err) {
        Swal.fire("Error", "Gagal menghapus item", "error");
      }
    }
  };

  // Styling untuk React Select agar konsisten dengan tema Slate
  const customSelectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: '#f8fafc',
      borderColor: '#e2e8f0',
      borderRadius: '0.5rem',
      fontSize: '14px',
      padding: '2px'
    }),
    option: (base, state) => ({
      ...base,
      fontSize: '13px',
      backgroundColor: state.isSelected ? '#0f172a' : state.isFocused ? '#f1f5f9' : 'white'
    })
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-lg text-white">
              <ClipboardList size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SO Item Management</h1>
              <p className="text-sm text-slate-500">Detail produk untuk: <span className="font-bold text-blue-600">{soNumber || "Pilih SO"}</span></p>
            </div>
          </div>

          <div className="w-full md:w-80">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block ml-1">Pilih Sales Order</label>
            <select
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all"
              value={selectedSOId}
              onChange={(e) => setSelectedSOId(e.target.value)}
            >
              <option value="">-- Cari Nomor SO --</option>
              {allSalesOrders.map((so) => (
                <option key={so.id} value={so.id}>
                  {so.so_number} - {so.customer_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Form Card */}
        {selectedSOId ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <PlusCircle size={16} />
              {editId ? "Edit Item Pesanan" : "Tambah Item ke Pesanan"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Pilih Item / Produk</label>
                <select
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-slate-900 outline-none"
                  value={form.item_id}
                  onChange={(e) => handleFormChange("item_id", e.target.value)}
                  required
                >
                  <option value="">-- Pilih Produk --</option>
                  {allItems.map(i => <option key={i.id} value={i.id}>{i.item_code} - {i.description}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Jumlah (Pcs)</label>
                <input 
                  type="number" 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-slate-900 outline-none font-bold" 
                  value={form.pcs} 
                  onChange={(e) => handleFormChange("pcs", e.target.value)} 
                  placeholder="0"
                  required 
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1">
                  <Calculator size={10} /> Total Volume (m³)
                </label>
                <input 
                  type="number" 
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-mono text-slate-500 cursor-not-allowed" 
                  value={form.quantity} 
                  readOnly 
                />
              </div>

              <div className="md:col-span-2 flex gap-2">
                <button 
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-2.5 rounded-lg text-white text-xs font-black transition-all ${editId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200'}`}
                >
                  {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : editId ? 'UPDATE' : 'TAMBAH'}
                </button>
                {editId && (
                  <button 
                    type="button"
                    onClick={cancelEdit}
                    className="p-2.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-100 p-8 rounded-xl text-center">
            <ArrowRightCircle className="mx-auto text-blue-400 mb-2" size={32} />
            <p className="text-blue-700 font-medium">Silakan pilih Nomor Sales Order di atas untuk mengelola item.</p>
          </div>
        )}

        {/* Table List Card */}
        {selectedSOId && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Informasi Produk</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Pcs</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Volume (m³)</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.length > 0 ? (
                    items.map(i => (
                      <tr key={i.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded text-slate-600">
                              <Package size={16} />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{i.item_code}</div>
                              <div className="text-[11px] text-slate-400 uppercase tracking-tight">{i.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-bold text-xs">
                            {i.pcs} <span className="text-[10px] font-normal text-slate-400 ml-1">Pcs</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                            {new Intl.NumberFormat('id-ID', {
                              minimumFractionDigits: 4,
                              maximumFractionDigits: 4
                            }).format(i.quantity)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            <button 
                              onClick={() => {
                                setEditId(i.id);
                                const m = allItems.find(x => Number(x.id) === Number(i.item_id));
                                setForm({ item_id: i.item_id, pcs: i.pcs, quantity: i.quantity, ratio: m?.ratio_bom || 0 });
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(i.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic text-sm">
                        Belum ada item untuk Sales Order ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}