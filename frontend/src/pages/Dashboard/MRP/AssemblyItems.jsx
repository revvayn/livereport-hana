import { useState, useEffect } from "react";
import api from "../../../api/api";
import Swal from "sweetalert2";

export default function AssemblyItems() {
  const [selectedFinishingId, setSelectedFinishingId] = useState("");
  const [finishingName, setFinishingName] = useState("");
  const [masterFinishing, setMasterFinishing] = useState([]); // Data Master dari Tabel Finishing (PFIN)
  const [assemblyList, setAssemblyList] = useState([]); // Data Detail Tabel Assembly (WIPA)
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    assembly_code: "",
    description: "",
    warehouse: "WIPA", // Default Warehouse untuk Assembly
  });

  /* ================= FETCH MASTER (Hanya yang Warehouse PFIN) ================= */
  useEffect(() => {
    const fetchMasterPFIN = async () => {
      try {
        setLoading(true);
        // UBAH "/item-assembly" MENJADI "/assembly-items"
        const res = await api.get("/assembly-items/finishing-items", {
          params: { warehouse: "PFIN" }
        });
  
        console.log("Data PFIN diterima:", res.data);
        setMasterFinishing(res.data || []);
      } catch (err) {
        console.error("Fetch Master Error:", err);
        Swal.fire("Error", "Gagal mengambil data master PFIN", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchMasterPFIN();
  }, []);

  /* ================= FETCH DETAIL ASSEMBLY BERDASARKAN FINISHING ================= */
  useEffect(() => {
    if (selectedFinishingId) {
      // 1. Ambil data list assembly (WIPA)
      fetchAssemblyList(selectedFinishingId);
  
      // 2. Set Nama Header untuk tampilan "Setup Assembly (WIPA): FGD00001..."
      const found = masterFinishing.find(x => Number(x.id) === Number(selectedFinishingId));
      if (found) {
        setFinishingName(`${found.finishing_code} - ${found.description}`);
      }
    } else {
      setAssemblyList([]);
      setFinishingName("");
    }
    cancelEdit();
  }, [selectedFinishingId, masterFinishing]);

  const fetchAssemblyList = async (fId) => {
    try {
      setLoading(true);
      // UBAH JUGA DI SINI "/item-assembly" MENJADI "/assembly-items"
      const res = await api.get(`/assembly-items/finishing/${fId}`);
      setAssemblyList(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= SUBMIT (CREATE / UPDATE) ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFinishingId) return Swal.fire("Peringatan", "Pilih Parent Finishing (PFIN) dahulu", "warning");

    const selectedMaster = masterFinishing.find(x => Number(x.id) === Number(selectedFinishingId));

    try {
      const payload = {
        finishing_id: parseInt(selectedFinishingId),
        item_code: selectedMaster.item_code, // Wariskan item_code dari parent
        assembly_code: form.assembly_code,
        description: form.description,
        warehouse: form.warehouse,
      };

      if (editId) {
        await api.put(`/assembly-items/${editId}`, payload);
      } else {
        await api.post("/assembly-items", payload);
      }

      cancelEdit();
      fetchAssemblyList(selectedFinishingId);
    } catch (err) {
      Swal.fire("Error", "Gagal menyimpan data", "error");
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ assembly_code: "", description: "", warehouse: "WIPA" });
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Data?",
      text: "Komponen WIPA ini akan dihapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/item-assembly/${id}`);
        fetchAssemblyList(selectedFinishingId);
        Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
      } catch (err) {
        Swal.fire("Error", "Gagal menghapus", "error");
      }
    }
  };

  return (
    <div className="p-6 bg-white border rounded-lg max-w-6xl mx-auto shadow-sm">
      <h1 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
        <span className="text-gray-400 font-normal">Setup Assembly (WIPA):</span>
        <span className="text-green-600">{finishingName || "Pilih Master PFIN"}</span>
      </h1>

      {/* Selector Master Finishing (PFIN) */}
      <div className="mb-6 bg-green-50 p-4 rounded-md border border-green-100">
        <label className="block text-xs font-bold text-green-700 mb-1 uppercase tracking-wider">Parent Item (Warehouse PFIN)</label>
        <select
          className="w-full md:w-1/2 p-2.5 border border-green-200 rounded text-sm bg-white outline-none"
          value={selectedFinishingId}
          onChange={(e) => setSelectedFinishingId(e.target.value)}
        >
          <option value="">-- Pilih Finishing Code PFIN --</option>
          {masterFinishing.map((item) => (
            <option key={item.id} value={item.id}>
              {/* Mengambil FGD00001 dst dari kolom finishing_code */}
              {item.finishing_code} | {item.description}
            </option>
          ))}
        </select>
      </div>

      {/* Form Input Assembly (WIPA) */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 items-end bg-gray-50 p-4 rounded border">
        <div>
          <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Assembly Code (WIPA)</label>
          <input
            type="text"
            className="w-full p-2 border rounded text-sm outline-none focus:border-green-500"
            placeholder="Kode Assembly..."
            value={form.assembly_code}
            onChange={(e) => setForm({ ...form, assembly_code: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Warehouse</label>
          <input
            type="text"
            className="w-full p-2 border rounded text-sm bg-gray-100"
            value={form.warehouse}
            readOnly
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Keterangan Proses</label>
          <input
            type="text"
            className="w-full p-2 border rounded text-sm outline-none focus:border-green-500"
            placeholder="Proses WIPA..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={`flex-1 p-2 rounded font-bold text-white text-sm ${editId ? 'bg-orange-500' : 'bg-green-600'}`}>
            {editId ? 'UPDATE' : 'TAMBAH WIPA'}
          </button>
          {editId && <button type="button" onClick={cancelEdit} className="p-2 bg-gray-400 text-white rounded text-sm">BATAL</button>}
        </div>
      </form>

      {/* Tabel Data Assembly */}
      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-[10px] uppercase tracking-widest text-gray-600">
            <tr>
              <th className="p-3 text-center">No</th>
              <th className="p-3 text-left">Assembly Code</th>
              <th className="p-3 text-left">Item Code</th>
              <th className="p-3 text-left">Warehouse</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {assemblyList.length > 0 ? (
              assemblyList.map((row, idx) => (
                <tr key={row.id} className="border-b hover:bg-green-50/30">
                  <td className="p-3 text-center text-gray-400">{idx + 1}</td>
                  <td className="p-3 font-mono font-bold text-green-700">{row.assembly_code}</td>
                  <td className="p-3 text-gray-500">{row.item_code}</td>
                  <td className="p-3">
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] font-bold border border-green-200">
                      {row.warehouse}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => {
                      setEditId(row.id);
                      setForm({ assembly_code: row.assembly_code, description: row.description || "", warehouse: row.warehouse });
                    }} className="text-blue-600 mr-4 font-bold text-xs">EDIT</button>
                    <button onClick={() => handleDelete(row.id)} className="text-red-500 font-bold text-xs">HAPUS</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="p-10 text-center text-gray-400 italic">Pilih Master PFIN untuk melihat data Assembly.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}