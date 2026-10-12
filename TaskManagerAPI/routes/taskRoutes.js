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

// POST - Create a new task
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

// PUT - Update a task belonging to logged-in user
router.put("/:id", validateTask, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      {
        $set: {
          title: req.body.title,
          ...(req.body.description !== undefined && {
            description: req.body.description
          }),
          ...(req.body.completed !== undefined && {
            completed: req.body.completed
          })
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    return res.status(200).json(task);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid task ID"
      });
    }

    return res.status(500).json({
      message: "Failed to update task"
    });
  }
});

// DELETE - Delete a task belonging to logged-in user
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    return res.status(200).json({
      message: "Task deleted successfully"
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid task ID"
      });
    }

    return res.status(500).json({
      message: "Failed to delete task"
    });
  }
});

module.exports = router;
