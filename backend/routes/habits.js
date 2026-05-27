const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Get all habits
router.get("/", authMiddleware, async (req, res) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" }
    });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create habit
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, category, reminder } = req.body;
    const habit = await prisma.habit.create({
      data: { name, category, reminder, userId: req.userId }
    });
    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete habit
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await prisma.habit.delete({
      where: { id: req.params.id, userId: req.userId }
    });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;