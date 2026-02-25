// production.controller.js
const pool = require("../db");

function parseSchedule(raw) {
    if (!raw) return [];
    
    let data = raw;
    
    // Melakukan loop parsing jika data masih berupa string
    // Ini akan menangani kasus ""[{...}]"" (double escaped string)
    try {
        while (typeof data === "string") {
            data = JSON.parse(data);
        }
    } catch (e) {
        console.error("Gagal total saat parse JSON:", e.message);
        return [];
    }

    return Array.isArray(data) ? data : [];
}

const getProductionSchedule = async (req, res) => {
    const { itemId } = req.params;
    try {
        const result = await pool.query(
            "SELECT production_schedule FROM demand_items WHERE id = $1",
            [itemId]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: "Item tidak ditemukan" });

        let raw = result.rows[0].production_schedule;
        
        // LOGIC PEMBERSIHAN EXTRA:
        // Jika data di DB tersimpan sebagai string yang dibungkus kutip lagi
        while (typeof raw === 'string') {
            try {
                raw = JSON.parse(raw);
            } catch (e) {
                // Jika gagal parse, mungkin karena format "" (double quote)
                // Kita coba bersihkan manual tanda kutip ganda di awal dan akhir
                raw = raw.replace(/^"+|"+$/g, ''); 
                raw = JSON.parse(raw);
            }
        }

        res.json({
            production_schedule: Array.isArray(raw) ? raw : []
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getAllProductionSchedules = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, production_schedule FROM demand_items"
        );

        let finalFlatData = [];

        result.rows.forEach(row => {
            let schedule = row.production_schedule;

            // Tahap 1: Un-quote jika data adalah string
            while (typeof schedule === 'string' && schedule.trim() !== "") {
                try {
                    // Cek jika string diawali [" atau {"
                    schedule = JSON.parse(schedule);
                } catch (e) {
                    // Jika gagal parse karena format aneh, coba hilangkan kutip manual
                    schedule = schedule.replace(/^"+|"+$/g, '');
                    try {
                        schedule = JSON.parse(schedule);
                    } catch (e2) { break; }
                }
            }

            // Tahap 2: Pastikan hasil akhirnya adalah Array
            if (Array.isArray(schedule)) {
                finalFlatData = finalFlatData.concat(schedule);
            }
        });

        // Debug log di terminal backend untuk memastikan data terbongkar
        console.log("Total entries combined:", finalFlatData.length);

        res.json({ production_schedule: finalFlatData });
    } catch (err) {
        console.error("Error backend:", err.message);
        res.status(500).json({ error: err.message });
    }
};
module.exports = { 
    getProductionSchedule, 
    getAllProductionSchedules // <-- WAJIB DITAMBAHKAN
};