const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const { protect } = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Car Dealership Inventory API is running"
  });
});

app.use("/api/auth", authRoutes);

app.get(
  "/api/protected-test",
  protect,
  (req, res) => {
    res.json({
      message: "Protected route accessed successfully",
      user: req.user
    });
  }
);

module.exports = app;