const { plans } = require("../data/dummyPlan");
const store = require("../globalStore");

const syncDummyData = async (fromDate, toDate) => {
  const from = new Date(fromDate);
  const to = new Date(toDate);

  const rows = plans
    .filter(p => {
      const d = new Date(p.doc_date);
      return d >= from && d <= to;
    })
    .map((p, i) => ({
      id: i + 1,
      production_no: p.so_num,
      sales_order_no: p.so_num,
      buyer_name: p.buyer,
      item_description: p.description,
      workcenter: "WC-01",
      reject_pcs: p.balance_pcs,
      doc_date: p.doc_date
    }));

  store.set(rows);

  console.log("✅ DATA TERSIMPAN:", rows.length);

  return rows.length;
};

const getDummyData = async ({ page, limit, search }) => {
  const data = store.get();

  console.log("📦 DATA SAAT GET:", data.length);

  let filtered = data;

  if (search) {
    const q = search.toLowerCase();
    filtered = data.filter(d =>
      d.production_no.toLowerCase().includes(q) ||
      d.buyer_name.toLowerCase().includes(q) ||
      d.item_description.toLowerCase().includes(q)
    );
  }

  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + Number(limit));

  return {
    data: paged,
    pagination: {
      totalPage: Math.ceil(filtered.length / limit) || 1
    }
  };
};

module.exports = {
  syncDummyData,
  getDummyData
};
