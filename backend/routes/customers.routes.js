const express = require("express");
const router = express.Router();
const controller = require("../controllers/customers.controller");

router.get("/", controller.getCustomers);
router.get("/:id", controller.getCustomerById);
router.post("/", controller.createCustomer);
router.put("/:id", controller.updateCustomer);
router.delete("/:id", controller.deleteCustomer);

module.exports = router;
