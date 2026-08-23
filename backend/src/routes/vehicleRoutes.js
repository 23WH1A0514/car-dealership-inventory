const express = require("express");

const {
  createVehicle,
  getVehicles
} = require("../controllers/vehicleController");

const {
  protect
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createVehicle);

router.get("/", getVehicles);

module.exports = router;