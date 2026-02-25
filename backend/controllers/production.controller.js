const pool = require("../db"); // Sesuaikan dengan koneksi database Anda

// Mendapatkan jadwal berdasarkan Item ID
exports.getProductionSchedule = async (req, res) => {
    const { itemId } = req.params;
    try {
        const result = await pool.query(
            "SELECT id, production_schedule FROM demand_items WHERE id = $1",
            [itemId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Item tidak ditemukan" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update/Simpan jadwal ke kolom JSONB
exports.updateProductionSchedule = async (req, res) => {
    const { itemId } = req.params;
    const { production_schedule } = req.body; // Ini sekarang berisi { packing: {}, finishing: {}, assembly: {} }

    try {
        const result = await pool.query(
            "UPDATE demand_items SET production_schedule = $1 WHERE id = $2 RETURNING *",
            [JSON.stringify(production_schedule), itemId]
        );
        res.json({ message: "Jadwal berhasil diperbarui", data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal menyimpan ke database" });
    }
};