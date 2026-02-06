const express = require("express");
const router = express.Router();
const controller = require("../controllers/operations.controller");

router.get("/", controller.getOperations);
router.get("/:id", controller.getOperationById);
router.post("/", controller.createOperation);
router.put("/:id", controller.updateOperation);
router.delete("/:id", controller.deleteOperation);

module.exports = router;
