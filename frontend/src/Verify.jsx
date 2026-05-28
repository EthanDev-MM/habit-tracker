import { useEffect, useState } from "react";
import axios from "axios";

export default function Verify() {
  const [msg, setMsg] = useState("Verifying...");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) { setMsg("Invalid link"); return; }

    axios.get(`https://habit-tracker-production-08c6.up.railway.app/api/auth/verify?token=${token}`)
      .then(res => { setMsg(res.data.message); setOk(true); })
      .catch(err => setMsg(err.response?.data?.error || "Error"));
  }, []);

  return (
    <div style={{ background: "#0f0f13", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ background: "#1a1a2e", borderRadius: 20, padding: "2rem", textAlign: "center", border: `1px solid ${ok ? "#00E5A0" : "#1e293b"}`, maxWidth: 400 }}>
        <p style={{ fontSize: 40, margin: "0 0 16px" }}>{ok ? "🎉" : "⏳"}</p>
        <p style={{ color: ok ? "#00E5A0" : "#e2e8f0", fontSize: 16, margin: "0 0 20px" }}>{msg}</p>
        {ok && (
          <a href="https://habit-tracker-kappa-bice.vercel.app" style={{ padding: "10px 24px", background: "linear-gradient(135deg, #00E5A0, #4DA6FF)", borderRadius: 12, color: "#0f0f13", fontWeight: 700, textDecoration: "none" }}>
            Login လုပ်မယ် →
          </a>
        )}
      </div>
    </div>
  );
}