
const express = require("express");
const Task = require("../models/Task");

const authMiddleware = require("../middleware/authMiddleware");
const validateTask = require("../middleware/validateTask");

const router = express.Router();

// Protect every route
router.use(authMiddleware);

// GET all tasks of logged-in user
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.id
    });

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch tasks"
    });
  }
});

// POST - Create a new task with validation
router.post("/", validateTask, async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      user: req.user.id
    });

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create task"
    });
  }
});

module.exports = router;
