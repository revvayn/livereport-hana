const bcryptjs = require("bcryptjs");

(async () => {
  const hash = await bcryptjs.hash("123", 10);
  console.log(hash);
})();
