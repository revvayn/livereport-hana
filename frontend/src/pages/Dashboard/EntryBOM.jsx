import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../api/api";

export default function EntryBOM() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bomData, setBomData] = useState([]);

    const fetchBOM = async () => {
        try {
            const res = await api.get("/bom");
            setBomData(res.data.data || []); // ⬅️ AMAN
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Gagal mengambil data BOM", "error");
        }
    };

    useEffect(() => {
        fetchBOM();
    }, []);

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
            const res = await api.post("/bom/upload", formData);
            Swal.fire("Berhasil", res.data.message, "success");
            setFile(null);
            fetchBOM(); // refresh tabel
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

    return (
        <div className="bg-white rounded-xl shadow p-6 space-y-6">
            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
                <h2 className="text-lg font-semibold">Upload BOM (Excel)</h2>

                <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="block w-full border rounded p-2"
                />

                <button
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    {loading ? "Uploading..." : "Upload BOM"}
                </button>
            </form>

            {/* TABLE */}
            <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-xs border-collapse">
                    <thead className="bg-gray-100 sticky top-0">
                        <tr>
                            <th className="border px-2 py-1">No</th>
                            <th className="border px-2 py-1">Product Item</th>
                            <th className="border px-2 py-1">Product Name</th>
                            <th className="border px-2 py-1">Qty</th>
                            <th className="border px-2 py-1">Qty PCS</th>
                            <th className="border px-2 py-1">WH FG</th>
                            <th className="border px-2 py-1">Status</th>
                            <th className="border px-2 py-1">Line</th>
                            <th className="border px-2 py-1">Component</th>
                            <th className="border px-2 py-1">Component Name</th>
                            <th className="border px-2 py-1">Qty Component</th>
                            <th className="border px-2 py-1">WH Comp</th>
                            <th className="border px-2 py-1">UOM</th>
                            <th className="border px-2 py-1">Ratio</th>
                        </tr>
                    </thead>

                    <tbody>
                        {Array.isArray(bomData) && bomData.length > 0 ? (
                            bomData.map((row, index) => (
                                <tr key={row.id || index} className="hover:bg-gray-50">
                                    <td className="border px-2 py-1 text-center">{index + 1}</td>
                                    <td className="border px-2 py-1">{row.product_item}</td>
                                    <td className="border px-2 py-1">{row.product_name}</td>
                                    <td className="border px-2 py-1 text-right">{row.quantity}</td>
                                    <td className="border px-2 py-1 text-right">{row.qtypcs_item}</td>
                                    <td className="border px-2 py-1">{row.warehouse_fg}</td>
                                    <td className="border px-2 py-1">{row.status_bom}</td>
                                    <td className="border px-2 py-1 text-center">{row.linenum}</td>
                                    <td className="border px-2 py-1">{row.component_code}</td>
                                    <td className="border px-2 py-1">{row.component_description}</td>
                                    <td className="border px-2 py-1 text-right">
                                        {row.component_quantity}
                                    </td>
                                    <td className="border px-2 py-1">{row.component_whs}</td>
                                    <td className="border px-2 py-1">{row.uom_component}</td>
                                    <td className="border px-2 py-1 text-right">
                                        {row.ratio_component}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="14" className="text-center py-6 text-gray-500">
                                    Data BOM belum tersedia
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
