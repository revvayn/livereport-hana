// production.controller.js
const pool = require("../db");

const getDemands = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM demands ORDER BY delivery_date ASC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const robustParse = (data) => {
    if (!data) return [];
    let parsed = data;
    try {
        while (typeof parsed === 'string' && parsed.trim() !== "") {
            try {
                parsed = JSON.parse(parsed);
            } catch (e) {
                // Jika gagal parse, bersihkan manual tanda kutip ganda di awal dan akhir
                let cleaned = parsed.replace(/^"+|"+$/g, '');
                if (cleaned === parsed) break; // Berhenti jika tidak ada perubahan
                parsed = JSON.parse(cleaned);
            }
        }
    } catch (err) {
        console.error("Gagal total saat parsing JSON:", err.message);
        return [];
    }
    return Array.isArray(parsed) ? parsed : [];
};

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
        const result = await pool.query(`
            SELECT di.production_schedule, d.so_number, di.item_code 
            FROM demand_items di
            JOIN demands d ON di.demand_id = d.id
        `);

        let finalFlatData = [];
        result.rows.forEach(row => {
            let schedule = robustParse(row.production_schedule);
            if (Array.isArray(schedule)) {
                // Tambahkan info SO dan Item ke setiap objek jadwal
                const enhanced = schedule.map(s => ({
                    ...s,
                    so_number: row.so_number,
                    item_code: row.item_code
                }));
                finalFlatData = finalFlatData.concat(enhanced);
            }
        });
        res.json({ production_schedule: finalFlatData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const getFinishingSchedule = async (req, res) => {
    const { itemId } = req.params;
    try {
        const result = await pool.query(
            "SELECT production_schedule FROM demand_item_finishing WHERE id = $1",
            [itemId]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: "Item Finishing tidak ditemukan" });

        const raw = result.rows[0].production_schedule;
        const schedule = robustParse(raw);

        res.json({ finishing_schedule: schedule });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Mendapatkan SEMUA schedule finishing (Digabungkan)
const getAllFinishingSchedules = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT df.production_schedule, d.so_number, df.item_code 
            FROM demand_item_finishing df
            JOIN demands d ON df.demand_id = d.id
        `);

        let finalFlatData = [];
        result.rows.forEach(row => {
            const schedule = robustParse(row.production_schedule);
            if (Array.isArray(schedule)) {
                const enhanced = schedule.map(s => ({
                    ...s,
                    so_number: row.so_number,
                    item_code: row.item_code
                }));
                finalFlatData = finalFlatData.concat(enhanced);
            }
        });
        res.json({ finishing_schedule: finalFlatData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// Mendapatkan satu schedule Assembly berdasarkan ID
const getAssemblySchedule = async (req, res) => {
    const { itemId } = req.params;
    try {
        const result = await pool.query(
            "SELECT production_schedule FROM demand_item_assembly WHERE id = $1",
            [itemId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Item Assembly tidak ditemukan" });
        }

        const raw = result.rows[0].production_schedule;
        const schedule = robustParse(raw);

        res.json({ assembly_schedule: schedule });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Mendapatkan SEMUA schedule Assembly (Digabungkan)
const getAllAssemblySchedules = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT da.production_schedule, d.so_number, da.item_code 
            FROM demand_item_assembly da
            JOIN demands d ON da.demand_id = d.id
        `);

        let finalFlatData = [];
        result.rows.forEach(row => {
            const schedule = robustParse(row.production_schedule);
            if (Array.isArray(schedule)) {
                const enhanced = schedule.map(s => ({
                    ...s,
                    so_number: row.so_number,
                    item_code: row.item_code
                }));
                finalFlatData = finalFlatData.concat(enhanced);
            }
        });
        res.json({ production_schedule: finalFlatData }); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getFullScheduleBySO = async (req, res) => {
    const { id } = req.params;
    try {
      // 1. Ambil data Header SO
      const soHeader = await pool.query("SELECT * FROM demands WHERE id = $1", [id]);
      
      // 2. Ambil data Packing (demand_items)
      const packingItems = await pool.query(
        "SELECT *, 'Packing' as category FROM demand_items WHERE demand_id = $1", [id]
      );
  
      // 3. Ambil data Finishing
      const finishingItems = await pool.query(
        "SELECT *, 'Finishing' as category FROM demand_item_finishing WHERE demand_id = $1", [id]
      );
  
      // 4. Ambil data Assembly
      const assemblyItems = await pool.query(
        "SELECT *, 'Assembly' as category FROM demand_item_assembly WHERE demand_id = $1", [id]
      );
  
      // Gabungkan semua item ke dalam satu array untuk matriks
      const allItems = [
        ...packingItems.rows,
        ...finishingItems.rows,
        ...assemblyItems.rows
      ];
  
      res.json({
        header: soHeader.rows[0],
        items: allItems
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  };
// Update exports
module.exports = { 
    getDemands,
    getProductionSchedule, 
    getAllProductionSchedules,
    getFinishingSchedule,
    getAllFinishingSchedules,
    getAssemblySchedule,
    getAllAssemblySchedules,
    getFullScheduleBySO
};