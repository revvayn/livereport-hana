const { USE_DUMMY } = require("../config/env");
const {
  getDummyData,
  syncDummyData
} = require("../services/planService");

const getDataSync = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = ""
  } = req.query;

  const result = USE_DUMMY
    ? await getDummyData({ page, limit, search })
    : { data: [], pagination: { totalPage: 1 } };

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
};

const syncData = async (req, res) => {
  const { fromDate, toDate } = req.body;

  const rows = USE_DUMMY
    ? await syncDummyData(fromDate, toDate)
    : 0;

  res.json({ success: true, rows });
};

module.exports = {
  getDataSync,
  syncData
};
