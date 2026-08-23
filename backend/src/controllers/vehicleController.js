const Vehicle = require("../models/Vehicle");

const createVehicle = async (req, res) => {
  try {
    const {
      make,
      model,
      category,
      price,
      quantity
    } = req.body;

    if (
      !make ||
      !model ||
      !category ||
      price === undefined ||
      quantity === undefined
    ) {
      return res.status(400).json({
        message:
          "Make, model, category, price and quantity are required"
      });
    }

    if (price < 0 || quantity < 0) {
      return res.status(400).json({
        message: "Price and quantity cannot be negative"
      });
    }

    const vehicle = await Vehicle.create({
      make,
      model,
      category,
      price,
      quantity
    });

    return res.status(201).json({
      message: "Vehicle added successfully",
      vehicle
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add vehicle",
      error: error.message
    });
  }
};

module.exports = {
  createVehicle
};