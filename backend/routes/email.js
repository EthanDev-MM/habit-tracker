const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(email, token) {
  const url = `${process.env.FRONTEND_URL}/verify?token=${token}`;
  await transporter.sendMail({
    from: `"Habit Tracker" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email - Habit Tracker",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:2rem;background:#0f0f13;color:#e2e8f0;border-radius:16px;">
        <h2 style="color:#00E5A0;">Welcome to Habit Tracker! 🎉</h2>
        <p>Email verify လုပ်ဖို့ အောက်က button နှိပ်ပါ —</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#00E5A0,#4DA6FF);color:#0f0f13;border-radius:12px;text-decoration:none;font-weight:700;margin:1rem 0;">
          Verify Email
        </a>
        <p style="color:#64748b;font-size:13px;">Link က 24 နာရီ သက်တမ်းရှိတယ်။</p>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail };