// controllers/assemblyController.js
const pool = require('../db'); // Sesuaikan dengan koneksi database Anda

exports.getAll = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM item_assembly ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getByFinishingId = async (req, res) => {
    try {
        const { finishingId } = req.params;
        const result = await pool.query(
            'SELECT * FROM item_assembly WHERE finishing_id = $1 ORDER BY id ASC',
            [finishingId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { finishing_id, assembly_code, description, warehouse, item_code } = req.body;
        const result = await pool.query(
            `INSERT INTO item_assembly (finishing_id, assembly_code, description, warehouse, item_code) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [finishing_id, assembly_code, description, warehouse, item_code]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { assembly_code, description, warehouse } = req.body;
        await pool.query(
            'UPDATE item_assembly SET assembly_code=$1, description=$2, warehouse=$3 WHERE id=$4',
            [assembly_code, description, warehouse, id]
        );
        res.json({ message: "Updated successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await pool.query('DELETE FROM item_assembly WHERE id = $1', [req.params.id]);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getFinishingItems = async (req, res) => {
    try {
        const { warehouse } = req.query;
        let query = 'SELECT * FROM item_finishing';
        let params = [];

        if (warehouse) {
            query += ' WHERE UPPER(warehouse) = $1';
            params.push(warehouse.toUpperCase());
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        // Jika ini error, maka frontend akan menampilkan "Gagal mengambil data"
        res.status(500).json({ error: err.message });
    }
};

exports.generateAssembly = async (req, res) => {
    const { demandId } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Logic: Menghubungkan transaksi ke master assembly lewat finishing_id
        const querySelect = `
    SELECT 
        dif.demand_id,
        dif.demand_item_id,
        dif.item_id,
        ia.assembly_code,
        ia.description AS assembly_desc,
        dif.uom,
        dif.total_qty,
        dif.pcs,
        dif.production_schedule
    FROM demand_item_finishing dif
    /* PERBAIKAN: Join dif.item_code ke ifin.finishing_code (bukan ifin.item_code) */
    JOIN item_finishing ifin ON dif.item_code = ifin.finishing_code
    JOIN item_assembly ia ON ifin.id = ia.finishing_id
    WHERE dif.demand_id = $1
`;

        const result = await client.query(querySelect, [demandId]);

        if (result.rows.length === 0) {
            return res.status(400).json({
                error: "Data tidak ditemukan. Pastikan item Finishing sudah memiliki relasi di Master Assembly (kolom finishing_id)."
            });
        }

        for (const row of result.rows) {
            // Pastikan data schedule dikonversi ke string JSON yang valid
            const schedule = row.production_schedule ? JSON.stringify(row.production_schedule) : '[]';

            await client.query(
                `INSERT INTO demand_item_assembly 
                (demand_id, demand_item_id, item_id, item_code, description, uom, total_qty, pcs, production_schedule, warehouse)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'WIPA')
                ON CONFLICT DO NOTHING`,
                [
                    row.demand_id,
                    row.demand_item_id,
                    row.item_id,
                    row.assembly_code,
                    row.assembly_desc,
                    row.uom,
                    row.total_qty,
                    row.pcs,
                    schedule
                ]
            );
        }

        await client.query('UPDATE demands SET is_assembly_generated = true WHERE id = $1', [demandId]);
        await client.query('COMMIT');

        res.json({ message: "Generate Assembly Berhasil berdasarkan finishing_id!" });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Generate Assembly Error:", err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

exports.getItemsByDemandId = async (req, res) => {
    try {
        const { demandId } = req.params;
        // Sekarang cukup ambil langsung karena proses FILTER sudah dilakukan saat GENERATE
        const result = await pool.query(
            'SELECT * FROM demand_item_assembly WHERE demand_id = $1 ORDER BY id ASC',
            [demandId]
        );

        const rows = result.rows.map(row => ({
            ...row,
            production_schedule: typeof row.production_schedule === 'string'
                ? JSON.parse(row.production_schedule)
                : row.production_schedule || []
        }));

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};