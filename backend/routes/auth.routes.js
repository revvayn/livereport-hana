const express = require("express");
const controller = require("../controllers/auth.controller");

const router = express.Router();

router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.get("/me", controller.me);
router.put("/update", controller.updateProfile); 
router.put("/change-password", controller.changePassword); 


module.exports = router;
