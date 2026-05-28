import { useState } from "react";
import { login, register } from "./api/index";

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError("");

    // Gmail restriction ONLY for Register
    if (!isLogin && !form.email.trim().toLowerCase().endsWith("@gmail.com")) {
      setError("Only @gmail.com emails are allowed for registration");
      setLoading(false);
      return;
    }

    try {
      const res = isLogin
        ? await login({ email: form.email, password: form.password })
        : await register(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", background: "#f5f5f5" }}>
      <div style={{ background: "white", padding: "2rem", borderRadius: "12px", width: "360px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          {isLogin ? "Login" : "Register"}
        </h2>

        {!isLogin && (
          <input
            placeholder="Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }}
          />
        )}

        <input
          placeholder="Email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }}
        />

        {error && <p style={{ color: "red", fontSize: "13px", marginBottom: "10px" }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", padding: "10px", background: "#1D9E75", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px", marginBottom: "10px" }}
        >
          {loading ? "Loading..." : isLogin ? "Login" : "Register"}
        </button>

        <p style={{ textAlign: "center", fontSize: "13px", color: "#666" }}>
          {isLogin ? "Account မရှိသေးဘူးလား? " : "Account ရှိပြီးပြီလား? "}
          <span onClick={() => setIsLogin(!isLogin)} style={{ color: "#1D9E75", cursor: "pointer" }}>
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}
