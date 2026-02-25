import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";

export default function FinishingItems() {
  const [selectedItemId, setSelectedItemId] = useState("");
  const [itemName, setItemName] = useState("");
  const [allItems, setAllItems] = useState([]); 
  const [finishingItems, setFinishingItems] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    finishing_code: "",
    description: "",
    warehouse: "",
  });

  /* ================= FETCH DATA MASTER (ITEMS) ================= */
  useEffect(() => {
    const fetchMasterItems = async () => {
      try {
        const res = await api.get("/items"); // Sesuaikan route master items Anda
        setAllItems(res.data || []);
      } catch (err) {
        console.error("Error Fetch Master:", err.response || err);
        Swal.fire("Error", "Gagal load data master items", "error");
      }
    };
    fetchMasterItems();
  }, []);

  /* ================= FETCH DETAIL FINISHING ================= */
  useEffect(() => {
    if (selectedItemId) {
      fetchFinishingList(selectedItemId);
      // Cari item di master untuk menampilkan header nama
      const item = allItems.find((x) => Number(x.id) === Number(selectedItemId));
      setItemName(item ? `${item.item_code} - ${item.description}` : "");
    } else {
      setFinishingItems([]);
      setItemName("");
    }
    cancelEdit();
  }, [selectedItemId, allItems]); // Tambahkan allItems di dependency

  const fetchFinishingList = async (itemId) => {
    try {
      setLoading(true);
      const res = await api.get(`/finishing-items/item/${itemId}`);
      setFinishingItems(res.data || []);
    } catch (err) {
      console.error("Fetch Detail Error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItemId) return Swal.fire("Peringatan", "Pilih Item Utama terlebih dahulu", "warning");

    // CARI ITEM_CODE DARI MASTER
    const selectedMaster = allItems.find(x => Number(x.id) === Number(selectedItemId));
    if (!selectedMaster) return Swal.fire("Error", "Data Master Item tidak ditemukan", "error");

    try {
      const payload = {
        items_id: parseInt(selectedItemId),
        item_code: selectedMaster.item_code, // <--- OTOMATIS AMBIL DARI MASTER
        finishing_code: form.finishing_code,
        description: form.description,
        warehouse: form.warehouse,
      };

      if (editId) {
        await api.put(`/finishing-items/${editId}`, payload);
        Swal.fire("Berhasil", "Finishing berhasil diupdate", "success");
      } else {
        await api.post("/finishing-items", payload);
        Swal.fire("Berhasil", "Finishing berhasil ditambahkan", "success");
      }

      cancelEdit();
      fetchFinishingList(selectedItemId);
    } catch (err) {
      console.error("Submit Error:", err);
      Swal.fire("Error", err.response?.data?.error || "Gagal menyimpan data", "error");
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ finishing_code: "", description: "", warehouse: "" });
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Finishing?",
      text: "Data finishing ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/finishing-items/${id}`);
        Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
        fetchFinishingList(selectedItemId);
      } catch (err) {
        Swal.fire("Error", "Gagal menghapus data", "error");
      }
    }
  };

  return (
    <div className="p-6 bg-white border rounded-lg max-w-6xl mx-auto shadow-sm">
      <h1 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
        <span className="text-gray-400 font-normal">Setup Finishing:</span>
        <span className="text-blue-600">{itemName || "Pilih Item Master"}</span>
      </h1>

      {/* Selector Item Utama */}
      <div className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-100">
        <label className="block text-xs font-bold text-blue-700 mb-1 uppercase tracking-wider">Pilih Master Item (Asal)</label>
        <select
          className="w-full md:w-1/2 p-2.5 border border-blue-200 rounded text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={selectedItemId}
          onChange={(e) => setSelectedItemId(e.target.value)}
        >
          <option value="">-- Cari Kode Barang --</option>
          {allItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.item_code} | {item.description}
            </option>
          ))}
        </select>
      </div>

      {/* Form Input Finishing */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 items-end bg-gray-50 p-4 rounded border">
        <div>
          <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Finishing Code (Original)</label>
          <input
            type="text"
            className="w-full p-2 border rounded text-sm focus:border-blue-500 outline-none"
            placeholder="Misal: FIN-COAT-01"
            value={form.finishing_code}
            onChange={(e) => setForm({ ...form, finishing_code: e.target.value })}
            required
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Warehouse Target</label>
          <input
            type="text"
            className="w-full p-2 border rounded text-sm focus:border-blue-500 outline-none"
            placeholder="Gudang Finishing..."
            value={form.warehouse}
            onChange={(e) => setForm({ ...form, warehouse: e.target.value })}
            required
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Proses Detail</label>
          <input
            type="text"
            className="w-full p-2 border rounded text-sm focus:border-blue-500 outline-none"
            placeholder="Deskripsi pengerjaan..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={`flex-1 p-2 rounded font-bold text-white text-sm transition-all ${editId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {editId ? 'UPDATE DATA' : 'TAMBAHKAN'}
          </button>
          {editId && (
            <button type="button" onClick={cancelEdit} className="p-2 bg-gray-400 text-white rounded text-sm font-bold hover:bg-gray-500">
              BATAL
            </button>
          )}
        </div>
      </form>

      {/* Tabel Finishing */}
      <div className="overflow-x-auto shadow-inner rounded border">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 text-left text-gray-600 uppercase text-[10px] tracking-widest">
            <tr>
              <th className="border-b p-3 w-10 text-center">No</th>
              <th className="border-b p-3">Finishing Code</th>
              <th className="border-b p-3">Description</th>
              <th className="border-b p-3">Warehouse</th>
              <th className="border-b p-3 text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {finishingItems.length > 0 ? (
              finishingItems.map((fi, idx) => (
                <tr key={fi.id} className="hover:bg-blue-50/50 transition-colors border-b last:border-none">
                  <td className="p-3 text-center text-gray-400">{idx + 1}</td>
                  <td className="p-3 font-mono font-bold text-blue-700">{fi.finishing_code}</td>
                  <td className="p-3 text-gray-600">{fi.description || "-"}</td>
                  <td className="p-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200 uppercase">
                      {fi.warehouse}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-3">
                        <button
                        onClick={() => {
                            setEditId(fi.id);
                            setForm({
                            finishing_code: fi.finishing_code,
                            description: fi.description || "",
                            warehouse: fi.warehouse || "",
                            });
                        }}
                        className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase"
                        >
                        Edit
                        </button>
                        <button onClick={() => handleDelete(fi.id)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase">
                        Hapus
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-12 text-gray-400 italic">
                  {selectedItemId ? "Belum ada detail finishing untuk item ini." : "Silakan pilih master item di atas."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}