const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const { sendVerificationEmail } = require("./email");

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !password || !name)
      return res.status(400).json({ error: "All fields required" });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");

    await prisma.user.create({
      data: { email, name, password: hashed, verifyToken, verified: false }
    });

    await sendVerificationEmail(email, verifyToken);
    res.json({ message: "Verification email ပို့ပြီးပြီ။ Email စစ်ပါ။" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify Email
router.get("/verify", async (req, res) => {
  try {
    const { token } = req.query;
    const user = await prisma.user.findFirst({ where: { verifyToken: token } });
    if (!user) return res.status(400).json({ error: "Invalid token" });

    await prisma.user.update({
      where: { id: user.id },
      data: { verified: true, verifyToken: null }
    });

    res.json({ message: "Email verified successfully! ✅ Login လုပ်နိုင်ပြီ။" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "User not found" });

    if (!user.verified)
      return res.status(400).json({ error: "Email မ verify ရသေးဘူး။ Email စစ်ပါ။" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;