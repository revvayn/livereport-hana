const pool = require("../db");

// --- HELPER FUNCTIONS ---
const robustParse = (data) => {
    if (!data) return [];
    let parsed = data;
    try {
        while (typeof parsed === 'string' && parsed.trim() !== "") {
            parsed = JSON.parse(parsed);
        }
    } catch (e) {
        try {
            let cleaned = String(parsed).replace(/^"+|"+$/g, '');
            parsed = JSON.parse(cleaned);
        } catch (err) {
            return [];
        }
    }
    return Array.isArray(parsed) ? parsed : [];
};

const mapSchedule = (rows, scheduleKey, resKey) => {
    let finalFlatData = [];
    rows.forEach(row => {
        const schedule = robustParse(row[scheduleKey]); 
        if (Array.isArray(schedule)) {
            const enhanced = schedule.map(s => ({
                ...s,
                so_number: row.so_number,
                item_code: row.item_code,
                item_description: row.description || row.item_description || "-"
            }));
            finalFlatData = finalFlatData.concat(enhanced);
        }
    });
    return { [resKey]: finalFlatData };
};

// --- HOLIDAY CONTROLLERS ---
const getHolidays = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM public_holidays ORDER BY holiday_date ASC");
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const addHoliday = async (req, res) => {
    const { date, description } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO public_holidays (holiday_date, description) VALUES ($1, $2) RETURNING *",
            [date, description]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteHoliday = async (req, res) => {
    try {
        await pool.query("DELETE FROM public_holidays WHERE id = $1", [req.params.id]);
        res.json({ message: "Terhapus" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- PRODUCTION CONTROLLERS ---
const getAllProductionSchedules = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT di.production_schedule, d.so_number, di.item_code, di.description 
            FROM demand_items di 
            JOIN demands d ON di.demand_id = d.id`);
        res.json(mapSchedule(result.rows, 'production_schedule', 'production_schedule'));
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getAllFinishingSchedules = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT df.production_schedule, d.so_number, df.item_code, df.description 
            FROM demand_item_finishing df 
            JOIN demands d ON df.demand_id = d.id`);
        res.json(mapSchedule(result.rows, 'production_schedule', 'finishing_schedule'));
    } catch (err) { res.status(500).json({ error: err.message }); }
};

const getAllAssemblySchedules = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT da.production_schedule, d.so_number, da.item_code, da.description 
            FROM demand_item_assembly da 
            JOIN demands d ON da.demand_id = d.id`);
        res.json(mapSchedule(result.rows, 'production_schedule', 'assembly_schedule'));
    } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { 
    getHolidays, addHoliday, deleteHoliday,
    getAllProductionSchedules, getAllFinishingSchedules, getAllAssemblySchedules 
};