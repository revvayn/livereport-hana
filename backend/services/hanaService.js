const { getHanaConnection } = require("../config/hana");

async function getDataFromHanaByDateRange(fromDate, toDate) {
  const client = getHanaConnection();

  const query = `
  -- 1. Detail per baris
  SELECT
      ROW_NUMBER() OVER (PARTITION BY A."Doc Date" ORDER BY A."SO Num", A."ItemCode") AS "No",
      A."Doc Date",
      TO_VARCHAR(A."Doc Date", 'Month-YYYY') AS "Bulan",
      'Week ' || TO_VARCHAR(WEEK(A."Doc Date") - WEEK(TO_DATE(TO_VARCHAR(A."Doc Date", 'YYYY-MM') || '-01')) + 1) AS "Minggu ke",
      A."SO Num",
      A."No PO",
      A."Buyer",
      A."ItemCode",
      A."Dscription",
      A."Uom",
      A."Pcs" AS "Plan Pcs",
      A."Volume" AS "Plan Volume",
      COALESCE(B."Output Pcs", 0) AS "Capaian Pcs",
      COALESCE(B."Output Volume", 0) AS "Capaian Volume",
      A."Pcs" - COALESCE(B."Output Pcs", 0) AS "Balance Pcs",
      A."Volume" - COALESCE(B."Output Volume", 0) AS "Balance Volume",
      CASE 
          WHEN (A."Pcs" - COALESCE(B."Output Pcs", 0)) > 0 THEN 'Kurang Produksi'
          WHEN (A."Pcs" - COALESCE(B."Output Pcs", 0)) < 0 THEN 'Over Produksi'
          ELSE 'Sesuai Plan'
      END AS "Status",
      A."Note"
  FROM
  (
      -- PLAN
      SELECT 
          T0."TaxDate" AS "Doc Date",
          T2."OriginNum" AS "SO Num",
          T1."SerialNum" AS "No PO",
          T4."AliasName" AS "Buyer",
          T1."ItemCode",
          T1."Dscription",
          T1."unitMsr" AS "Uom",
          T1."U_STEM_QtyPcs" AS "Pcs",
          T1."Quantity" AS "Volume",
          T0."Comments" AS "Note"
      FROM
          BBP_LIVE.OWTQ T0 
          LEFT JOIN BBP_LIVE.WTQ1 T1 ON T0."DocEntry" = T1."DocEntry"
          LEFT JOIN BBP_LIVE.OWOR T2 ON T1."SerialNum" = T2."DocNum"
          LEFT JOIN BBP_LIVE.ORDR T3 ON T2."OriginNum" = T3."DocNum"
          LEFT JOIN BBP_LIVE.OCRD T4 ON T3."CardCode" = T4."CardCode"
      WHERE
          T0."DocDate" BETWEEN ? AND ?
          AND T1."FromWhsCod" IN ('PFIN','WIPA')
          AND T1."WhsCode" IN ('TRANSIT')
          AND ( T0."Comments" IS NULL OR T0."Comments" = '' OR T0."Comments" NOT LIKE '%WEEK%' )
  ) A
  LEFT JOIN 
  (
      -- CAPAIAN
      SELECT
          CASE 
              WHEN T0."U_Shift" = 'SHF-03' AND 
                   TO_TIME(SUBSTRING(LPAD(T0."U_JamMulai", 4, '0'), 1, 2) || ':' || 
                           SUBSTRING(LPAD(T0."U_JamMulai", 4, '0'), 3, 2) || ':00')
                   BETWEEN TO_TIME('00:00:00') AND TO_TIME('23:59:00')
              THEN ADD_DAYS(CAST(T0."U_DocDate" AS DATE), -1)
              ELSE CAST(T0."U_DocDate" AS DATE)
          END AS "Doc Date",
          W0."OriginNum" AS "SO Num",
          T0."U_PD_No" AS "No PO",
          T0."U_Product" AS "ItemCode",
          SUM(T0."U_OutputQtyPcs") AS "Output Pcs",
          SUM(T0."U_OutputQty") AS "Output Volume"
      FROM 
          BBP_LIVE."@STEM_SFOUTH" T0
      LEFT JOIN 
          BBP_LIVE."OWOR" W0 ON W0."DocNum" = T0."U_PD_No"
      WHERE
          T0."U_Status" = 'O'
          AND T0."U_SandingUlang" = 'N'
          AND T0."U_R1" = 'N'
          AND T0."U_R2" = 'N'
          AND T0."U_WCCode" IN ('GLUESPREADER_CORE', 'GLUESPREADER_PANEL')
      GROUP BY
          CASE 
              WHEN T0."U_Shift" = 'SHF-03' AND 
                   TO_TIME(SUBSTRING(LPAD(T0."U_JamMulai", 4, '0'), 1, 2) || ':' || 
                           SUBSTRING(LPAD(T0."U_JamMulai", 4, '0'), 3, 2) || ':00')
                   BETWEEN TO_TIME('00:00:00') AND TO_TIME('23:59:00')
              THEN ADD_DAYS(CAST(T0."U_DocDate" AS DATE), -1)
              ELSE CAST(T0."U_DocDate" AS DATE)
          END,
          W0."OriginNum",
          T0."U_PD_No",
          T0."U_Product"
  ) B
  ON
      A."Doc Date" = B."Doc Date"
      AND A."SO Num" = B."SO Num"
      AND A."No PO" = B."No PO"
      AND A."ItemCode" = B."ItemCode"
  `;

  return new Promise((resolve, reject) => {
    client.exec(query, [fromDate, toDate], (err, rows) => {
      client.disconnect();
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = { getDataFromHanaByDateRange };
