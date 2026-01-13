const { plans } = require("../data/dummyPlan");

const getDummyData = async ({ page, limit, search }) => {
  let data = plans.map((p, i) => ({
    id: i + 1,
    production_no: p.so_num,
    sales_order_no: p.so_num,
    buyer_name: p.buyer,
    item_description: p.description,
    workcenter: "WC-01",
    reject_pcs: p.balance_pcs,
    doc_date: p.doc_date
  }));

  if (search) {
    const s = search.toLowerCase();
    data = data.filter(
      d =>
        d.production_no.toLowerCase().includes(s) ||
        d.buyer_name.toLowerCase().includes(s) ||
        d.item_description.toLowerCase().includes(s)
    );
  }

  const start = (page - 1) * limit;
  const end = start + Number(limit);

  return {
    data: data.slice(start, end),
    pagination: {
      totalPage: Math.ceil(data.length / limit) || 1
    }
  };
};

const syncDummyData = async (fromDate, toDate) => {
  console.log("🔁 Dummy Sync:", fromDate, "→", toDate);
  await new Promise(r => setTimeout(r, 500));
  return 2;
};

module.exports = {
  getDummyData,
  syncDummyData
};
