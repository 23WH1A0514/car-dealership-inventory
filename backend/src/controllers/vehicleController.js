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


const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({
      quantity: { $gt: 0 }
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      vehicles
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch vehicles",
      error: error.message
    });
  }
};


const searchVehicles = async (req, res) => {
  try {
    const {
      make,
      model,
      category,
      minPrice,
      maxPrice
    } = req.query;

    const filter = {
      quantity: { $gt: 0 }
    };

    if (make) {
      filter.make = {
        $regex: make,
        $options: "i"
      };
    }

    if (model) {
      filter.model = {
        $regex: model,
        $options: "i"
      };
    }

    if (category) {
      filter.category = {
        $regex: category,
        $options: "i"
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    const vehicles = await Vehicle.find(filter)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      vehicles
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to search vehicles",
      error: error.message
    });
  }
};


const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found"
      });
    }

    const {
      make,
      model,
      category,
      price,
      quantity
    } = req.body;

    if (make !== undefined) {
      vehicle.make = make;
    }

    if (model !== undefined) {
      vehicle.model = model;
    }

    if (category !== undefined) {
      vehicle.category = category;
    }

    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({
          message: "Price cannot be negative"
        });
      }

      vehicle.price = price;
    }

    if (quantity !== undefined) {
      if (quantity < 0) {
        return res.status(400).json({
          message: "Quantity cannot be negative"
        });
      }

      vehicle.quantity = quantity;
    }

    await vehicle.save();

    return res.status(200).json({
      message: "Vehicle updated successfully",
      vehicle
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update vehicle",
      error: error.message
    });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found"
      });
    }

    return res.status(200).json({
      message: "Vehicle deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete vehicle",
      error: error.message
    });
  }
};
const purchaseVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found"
      });
    }

    if (vehicle.quantity <= 0) {
      return res.status(400).json({
        message: "Vehicle is out of stock"
      });
    }

    vehicle.quantity -= 1;

    await vehicle.save();

    return res.status(200).json({
      message: "Vehicle purchased successfully",
      vehicle
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to purchase vehicle",
      error: error.message
    });
  }
};
const restockVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found"
      });
    }

    const { quantity } = req.body;

    if (
      quantity === undefined ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        message: "Restock quantity must be a positive integer"
      });
    }

    vehicle.quantity += quantity;

    await vehicle.save();

    return res.status(200).json({
      message: "Vehicle restocked successfully",
      vehicle
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to restock vehicle",
      error: error.message
    });
  }
};
module.exports = {
  createVehicle,
  getVehicles,
  searchVehicles,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle
};