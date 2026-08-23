const express = require("express");

const {
  createVehicle,
  getVehicles,
  searchVehicles,
  updateVehicle
} = require("../controllers/vehicleController");

const {
  protect
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createVehicle);

router.get("/search", searchVehicles);

router.get("/", getVehicles);

router.put("/:id", protect, updateVehicle);

module.exports = router;