const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Toggle log (done/undone)
router.post("/toggle", authMiddleware, async (req, res) => {
  try {
    const { habitId, date } = req.body;
    const existing = await prisma.log.findFirst({
      where: { habitId, date }
    });

    if (existing) {
      const updated = await prisma.log.update({
        where: { id: existing.id },
        data: { done: !existing.done }
      });
      res.json(updated);
    } else {
      const log = await prisma.log.create({
        data: { habitId, date, done: true }
      });
      res.json(log);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get week logs
router.get("/week", authMiddleware, async (req, res) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.userId }
    });
    const habitIds = habits.map(h => h.id);

    const today = new Date();
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }

    const logs = await prisma.log.findMany({
      where: { habitId: { in: habitIds }, date: { in: dates } }
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;