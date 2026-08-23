const express = require("express");

const {
  createVehicle,
  getVehicles,
  searchVehicles,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle
} = require("../controllers/vehicleController");

const {
  protect
} = require("../middleware/authMiddleware");

const admin = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/", protect, createVehicle);

router.get("/search", searchVehicles);

router.get("/", getVehicles);

router.put("/:id", protect, updateVehicle);

router.delete("/:id", protect, admin, deleteVehicle);

router.post("/:id/purchase", protect, purchaseVehicle);

router.post("/:id/restock", protect, admin, restockVehicle);

module.exports = router;