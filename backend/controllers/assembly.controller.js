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