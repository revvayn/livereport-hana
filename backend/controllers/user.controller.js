const pool = require('../db'); // Asumsi Anda punya koneksi db di sini
const bcrypt = require("bcryptjs");

const userController = {
    // 1. Get All Users
    getAllUsers: async (req, res) => {
        try {
            const result = await pool.query('SELECT user_id, username, email, nama_lengkap, role, last_login, created_at FROM users ORDER BY user_id ASC');
            res.status(200).json(result.rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // 2. Get User By ID
    getUserById: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
            if (result.rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });
            res.status(200).json(result.rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // 3. Create User (Register)
    createUser: async (req, res) => {
        const { username, password, email, nama_lengkap, role } = req.body;
        try {
            // Hash Password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const result = await pool.query(
                `INSERT INTO users (username, password, email, nama_lengkap, role) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING user_id, username`,
                [username, hashedPassword, email, nama_lengkap, role]
            );
            res.status(201).json({ message: "User berhasil dibuat", user: result.rows[0] });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // 4. Update User
    updateUser: async (req, res) => {
        const { id } = req.params;
        const { username, email, nama_lengkap, role } = req.body;
        try {
            const result = await pool.query(
                `UPDATE users 
                 SET username = $1, email = $2, nama_lengkap = $3, role = $4, updated_at = CURRENT_TIMESTAMP 
                 WHERE user_id = $5 RETURNING *`,
                [username, email, nama_lengkap, role, id]
            );
            if (result.rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });
            res.status(200).json({ message: "User berhasil diperbarui", user: result.rows[0] });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // 5. Delete User
    deleteUser: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [id]);
            if (result.rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });
            res.status(200).json({ message: "User berhasil dihapus" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = userController;