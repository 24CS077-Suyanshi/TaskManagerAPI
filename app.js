require("dotenv").config();
require("./listeners");

const express = require("express");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const cors = require("cors");
const app = express();

app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Basic request validation for JSON API requests
app.use((req, res, next) => {
  if (
    req.is("application/json") &&
    !req.body
  ) {
    return res.status(400).json({
      message: "Invalid JSON request body"
    });
  }

  next();
});

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

// Start server after connecting to MongoDB
async function startServer() {
  try {
    const jwtSecret = process.env.JWT_SECRET || "charusat_practical11_jwt_secret_key_12345";
    process.env.JWT_SECRET = jwtSecret;

    const mongoURI = process.env.MONGO_URI || "mongodb://mongodb:27017/taskdb";

    await mongoose.connect(mongoURI);

    console.log(`MongoDB connected successfully to ${mongoURI}`);

    const PORT = process.env.PORT || 5000;


    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();