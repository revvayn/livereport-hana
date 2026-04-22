const pool = require("../db");
const XLSX = require("xlsx");

// GET all item routings - Hanya mengambil kolom yang ada di database
exports.getItemRoutings = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ir.id, 
        -- Data Level 1: Packing
        ir.item_code, i.description as item_desc, i.warehouse as item_wh,
        -- Data Level 2: Finishing
        ir.finishing_code, f.description as finishing_desc, f.warehouse as finishing_wh,
        -- Data Level 3: Pannel
        ir.assembly_code_pannel, ap.description as pannel_desc, ap.warehouse as pannel_wh,
        -- Data Level 4: Core
        ir.assembly_code_core, ac.description as core_desc, ac.warehouse as core_wh
      FROM item_routings ir
      LEFT JOIN items i ON ir.item_code = i.item_code
      LEFT JOIN item_finishing f ON ir.finishing_code = f.finishing_code
      LEFT JOIN item_assembly_pannel ap ON ir.assembly_code_pannel = ap.assembly_code
      LEFT JOIN item_assembly_core ac ON ir.assembly_code_core = ac.assembly_code
      ORDER BY ir.id DESC
    `);
    res.json(result.rows || []);
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data routing: " + err.message });
  }
};

// CREATE item routing - Hanya input 4 kolom code
exports.createItemRouting = async (req, res) => {
  const { 
    item_code, finishing_code, assembly_code_pannel, assembly_code_core 
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO item_routings(
        item_code, finishing_code, assembly_code_pannel, assembly_code_core
      ) VALUES($1, $2, $3, $4) RETURNING *`,
      [item_code, finishing_code, assembly_code_pannel, assembly_code_core]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Create Error:", err.message);
    res.status(500).json({ error: "Gagal membuat routing: " + err.message });
  }
};

// UPDATE item routing
exports.updateItemRouting = async (req, res) => {
  const { id } = req.params;
  const { 
    item_code, finishing_code, assembly_code_pannel, assembly_code_core 
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE item_routings 
       SET item_code=$1, finishing_code=$2, assembly_code_pannel=$3, assembly_code_core=$4
       WHERE id=$5 RETURNING *`,
      [item_code, finishing_code, assembly_code_pannel, assembly_code_core, id]
    );
    
    if (result.rows.length === 0) {
        return res.status(404).json({ error: "Data tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ error: "Gagal update routing" });
  }
};

// DELETE item routing
exports.deleteItemRouting = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM item_routings WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: "Data tidak ditemukan" });
    }
    res.json({ message: "Routing deleted" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).json({ error: "Gagal hapus routing" });
  }
};

exports.uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Mohon pilih file Excel terlebih dahulu" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (data.length === 0) {
      return res.status(400).json({ error: "File Excel kosong" });
    }

    let successCount = 0;
    let failCount = 0;
    const errorDetails = [];

    for (const [index, row] of data.entries()) {
      const { item_code, finishing_code, assembly_code_pannel, assembly_code_core } = row;

      // Skip jika kolom utama kosong
      if (!item_code) continue;

      try {
        // Gunakan .trim() dan .toUpperCase() untuk meminimalisir kesalahan input manual di Excel
        await pool.query(
          `INSERT INTO item_routings (item_code, finishing_code, assembly_code_pannel, assembly_code_core)
           VALUES ($1, $2, $3, $4)`,
          [
            item_code?.toString().trim().toUpperCase(),
            finishing_code?.toString().trim().toUpperCase(),
            assembly_code_pannel?.toString().trim().toUpperCase(),
            assembly_code_core?.toString().trim().toUpperCase()
          ]
        );
        successCount++;
      } catch (err) {
        failCount++;
        // Mencatat error spesifik untuk diberitahukan ke user nanti
        errorDetails.push(`Baris ${index + 2} (${item_code}): Kode Pannel/Core tidak terdaftar di Master.`);
        console.error(`Gagal import baris ${index + 2}:`, err.message);
      }
    }

    // Mengirim respon sukses namun memberikan info jika ada yang gagal
    res.json({ 
      message: `${successCount} data berhasil diimpor.`,
      failed: failCount,
      details: errorDetails.length > 0 ? errorDetails : null
    });

  } catch (err) {
    console.error("Upload Error Global:", err);
    res.status(500).json({ error: "Gagal memproses file: " + err.message });
  }
};

exports.clearItemRouting = async (req, res) => {
  try {
    // TRUNCATE aman digunakan di sini karena tabel ini adalah tabel anak
    // RESTART IDENTITY akan mereset sequence 'item_routings_id_seq'
    await pool.query("TRUNCATE TABLE item_routings RESTART IDENTITY");

    res.json({ 
      success: true,
      message: "Semua data item routing berhasil dibersihkan dan ID telah direset." 
    });
  } catch (err) {
    // Log error spesifik di server untuk kebutuhan debugging
    console.error("Error pada clearItemRouting:", err.message);

    res.status(500).json({ 
      success: false,
      error: "Gagal membersihkan data item routing.",
      message: err.message 
    });
  }
};