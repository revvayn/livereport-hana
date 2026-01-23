import { useEffect, useState } from "react";
import api from "../../api/api";

export default function BBPerforma() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get("/bahan-baku/kedatangan-grader", {
                params: {
                    tahun: 2025,
                    bulan: "Jan-2025",
                },
            });
            setData(res.data);
        } catch (err) {
            console.error("BB Performa Error:", err);
        } finally {
            setLoading(false);
        }
    };




    if (loading) return <p>Loading...</p>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                    Kedatangan Juli 2025
                </h3>
                <p className="text-sm text-gray-500">
                    Performa Grader Berdasarkan GRPO
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 text-sm">
                    <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                        <tr>
                            <th rowSpan="2" className="px-3 py-2 border text-center">No</th>
                            <th rowSpan="2" className="px-3 py-2 border text-left">Nama Grader</th>

                            <th colSpan="3" className="px-3 py-2 border text-center">LOG 5F</th>
                            <th colSpan="3" className="px-3 py-2 border text-center">LOG 9F</th>

                            <th colSpan="2" className="px-3 py-2 border text-center">Total</th>
                            <th rowSpan="2" className="px-3 py-2 border text-center">Rank</th>

                            <th colSpan="3" className="px-3 py-2 border text-center">Jenis Kayu</th>
                        </tr>
                        <tr className="bg-gray-50">
                            <th className="px-3 py-2 border">Pcs</th>
                            <th className="px-3 py-2 border">Vol</th>
                            <th className="px-3 py-2 border">Avg Ø</th>

                            <th className="px-3 py-2 border">Pcs</th>
                            <th className="px-3 py-2 border">Vol</th>
                            <th className="px-3 py-2 border">Avg Ø</th>

                            <th className="px-3 py-2 border">Pcs</th>
                            <th className="px-3 py-2 border">Vol</th>

                            <th className="px-3 py-2 border">Jabon</th>
                            <th className="px-3 py-2 border">Albasia</th>
                            <th className="px-3 py-2 border">Mahoni</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((r, i) => (
                            <tr
                                key={i}
                                className="hover:bg-gray-50 transition"
                            >
                                <td className="px-3 py-2 border text-center">{i + 1}</td>
                                <td className="px-3 py-2 border font-medium text-gray-800">
                                    {r.nama_grader}
                                </td>

                                <td className="px-3 py-2 border text-right">{r.log5_pcs}</td>
                                <td className="px-3 py-2 border text-right">
                                    {Number(r.log5_vol).toFixed(2)}
                                </td>
                                <td className="px-3 py-2 border text-right">{r.log5_avg_dia}</td>

                                <td className="px-3 py-2 border text-right">{r.log9_pcs}</td>
                                <td className="px-3 py-2 border text-right">
                                    {Number(r.log9_vol).toFixed(2)}
                                </td>
                                <td className="px-3 py-2 border text-right">{r.log9_avg_dia}</td>

                                <td className="px-3 py-2 border text-right font-semibold">
                                    {r.total_pcs}
                                </td>
                                <td className="px-3 py-2 border text-right font-semibold">
                                    {Number(r.total_vol).toFixed(2)}
                                </td>

                                <td className="px-3 py-2 border text-center">
                                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                        #{r.rank}
                                    </span>
                                </td>

                                <td className="px-3 py-2 border text-right">{r.jabon}</td>
                                <td className="px-3 py-2 border text-right">{r.albasia}</td>
                                <td className="px-3 py-2 border text-right">{r.mahoni}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>


    );
}
