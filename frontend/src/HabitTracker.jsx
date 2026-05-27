import { useState, useEffect } from "react";
import { getHabits, createHabit, deleteHabit, toggleLog, getWeekLogs } from "./api/index";

const CATEGORIES = ["Health", "Work", "Personal", "Learning", "Fitness"];
const CAT_COLORS = { Health: "#00E5A0", Work: "#4DA6FF", Personal: "#FF6B9D", Learning: "#A78BFA", Fitness: "#FFB547" };
const CAT_BG = { Health: "#0a2a1f", Work: "#0a1a2f", Personal: "#2a0a1f", Learning: "#1a0a2f", Fitness: "#2a1a0a" };
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function todayStr() { return new Date().toISOString().split("T")[0]; }
function weekDates() {
  const today = new Date(); const days = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(today); d.setDate(today.getDate() - i); days.push(d.toISOString().split("T")[0]); }
  return days;
}

export default function HabitTracker({ user, onLogout }) {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [view, setView] = useState("today");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Health", reminder: "" });
  const [loading, setLoading] = useState(true);
  const today = todayStr();
  const week = weekDates();

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const [habitsRes, logsRes] = await Promise.all([getHabits(), getWeekLogs()]);
      setHabits(habitsRes.data);
      setLogs(logsRes.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function handleToggle(habitId, date) {
    try {
      const res = await toggleLog({ habitId, date });
      setLogs(l => {
        const existing = l.find(x => x.habitId === habitId && x.date === date);
        if (existing) return l.map(x => x.id === existing.id ? res.data : x);
        return [...l, res.data];
      });
    } catch (err) { console.error(err); }
  }

  async function handleAdd() {
    if (!form.name.trim()) return;
    try {
      const res = await createHabit(form);
      setHabits(h => [res.data, ...h]);
      setForm({ name: "", category: "Health", reminder: "" });
      setShowAdd(false);
    } catch (err) { console.error(err); }
  }

  async function handleDelete(id) {
    try {
      await deleteHabit(id);
      setHabits(h => h.filter(x => x.id !== id));
    } catch (err) { console.error(err); }
  }

  function isDone(habitId, date) {
    const log = logs.find(l => l.habitId === habitId && l.date === date);
    return log?.done || false;
  }

  const todayDone = habits.filter(h => isDone(h.id, today)).length;
  const progress = habits.length ? Math.round((todayDone / habits.length) * 100) : 0;

  if (loading) return (
    <div style={{ background: "#0f0f13", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#00E5A0", fontSize: 16 }}>Loading...</p>
    </div>
  );

  return (
    <div style={{ background: "#0f0f13", minHeight: "100vh", color: "#e2e8f0", fontFamily: "sans-serif", padding: "1.5rem", maxWidth: 680, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, background: "linear-gradient(135deg, #00E5A0, #4DA6FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Habit Tracker</h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#64748b" }}>Hi, {user.name || user.email}</span>
          <button onClick={onLogout} style={{ padding: "6px 12px", borderRadius: 10, border: "1px solid #1e293b", background: "transparent", color: "#64748b", fontSize: 12, cursor: "pointer" }}>Logout</button>
        </div>
      </div>

      {/* Progress Card */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: 20, padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid #1e293b" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 4px" }}>Today's Progress</p>
            <p style={{ fontSize: 32, fontWeight: 700, margin: 0, color: "#e2e8f0" }}>{todayDone}<span style={{ fontSize: 18, color: "#64748b" }}>/{habits.length}</span></p>
          </div>
          <div style={{ width: 70, height: 70, borderRadius: "50%", background: `conic-gradient(#00E5A0 ${progress * 3.6}deg, #1e293b 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#00E5A0" }}>{progress}%</span>
            </div>
          </div>
        </div>
        <div style={{ height: 6, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #00E5A0, #4DA6FF)", borderRadius: 4, transition: "width 0.5s" }} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: "1.5rem" }}>
        {[
          { label: "Habits", value: habits.length, icon: "📋" },
          { label: "This Week", value: `${week.filter(d => habits.some(h => isDone(h.id, d))).length}/7`, icon: "📅" },
          { label: "Today", value: `${todayDone}/${habits.length}`, icon: "🔥" },
        ].map(s => (
          <div key={s.label} style={{ background: "#1a1a2e", borderRadius: 16, padding: "14px", border: "1px solid #1e293b", textAlign: "center" }}>
            <p style={{ fontSize: 20, margin: "0 0 4px" }}>{s.icon}</p>
            <p style={{ fontSize: 20, fontWeight: 700, margin: "0 0 2px", color: "#e2e8f0" }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Add Button */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem", alignItems: "center" }}>
        <div style={{ flex: 1, display: "flex", background: "#1a1a2e", borderRadius: 12, padding: 4, border: "1px solid #1e293b" }}>
          {["today", "week"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ flex: 1, padding: "8px", borderRadius: 10, border: "none", background: view === v ? "linear-gradient(135deg, #00E5A0, #4DA6FF)" : "transparent", color: view === v ? "#0f0f13" : "#64748b", fontSize: 13, cursor: "pointer", fontWeight: view === v ? 700 : 400 }}>
              {v === "today" ? "Today" : "This Week"}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)} style={{ background: "linear-gradient(135deg, #00E5A0, #4DA6FF)", border: "none", borderRadius: 12, padding: "10px 16px", color: "#0f0f13", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Add</button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div style={{ background: "#1a1a2e", border: "1px solid #00E5A0", borderRadius: 20, padding: "1.25rem", marginBottom: "1.25rem" }}>
          <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 12px", color: "#00E5A0" }}>✨ New Habit</p>
          <input placeholder="Habit name..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #1e293b", background: "#0f0f13", color: "#e2e8f0", fontSize: 14, marginBottom: 10, boxSizing: "border-box" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #1e293b", background: "#0f0f13", color: "#e2e8f0", fontSize: 14 }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="time" value={form.reminder} onChange={e => setForm(f => ({ ...f, reminder: e.target.value }))}
              style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #1e293b", background: "#0f0f13", color: "#e2e8f0", fontSize: 14 }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "1px solid #1e293b", background: "transparent", color: "#64748b", fontSize: 14, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleAdd} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #00E5A0, #4DA6FF)", color: "#0f0f13", fontSize: 14, cursor: "pointer", fontWeight: 700 }}>Save</button>
          </div>
        </div>
      )}

      {/* Today View */}
      {view === "today" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {habits.length === 0 && <p style={{ color: "#475569", textAlign: "center", marginTop: 40 }}>No habits yet. Add one! ✨</p>}
          {habits.map(h => {
            const done = isDone(h.id, today);
            return (
              <div key={h.id} onClick={() => handleToggle(h.id, today)}
                style={{ background: done ? CAT_BG[h.category] : "#1a1a2e", border: `1px solid ${done ? CAT_COLORS[h.category] : "#1e293b"}`, borderRadius: 18, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ width: 28, height: 28, borderRadius: 14, border: `2px solid ${done ? CAT_COLORS[h.category] : "#334155"}`, background: done ? CAT_COLORS[h.category] : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {done && <svg width="14" height="14" viewBox="0 0 14 14"><polyline points="2,7 6,11 12,3" stroke="#0f0f13" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: done ? CAT_COLORS[h.category] : "#e2e8f0", textDecoration: done ? "line-through" : "none", opacity: done ? 0.8 : 1 }}>{h.name}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 11, background: CAT_BG[h.category], color: CAT_COLORS[h.category], padding: "3px 10px", borderRadius: 20, border: `1px solid ${CAT_COLORS[h.category]}30` }}>{h.category}</span>
                    {h.reminder && <span style={{ fontSize: 11, color: "#475569" }}>⏰ {h.reminder}</span>}
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); handleDelete(h.id); }} style={{ background: "transparent", border: "none", color: "#334155", cursor: "pointer", fontSize: 18, padding: 4 }}>×</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Week View */}
      {view === "week" && (
        <div style={{ background: "#1a1a2e", borderRadius: 20, padding: "1rem", border: "1px solid #1e293b" }}>
          <div style={{ display: "grid", gridTemplateColumns: "120px repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
            <div />
            {week.map(d => {
              const dt = new Date(d + "T00:00:00"); const isToday = d === today;
              return (
                <div key={d} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 10, color: "#475569", margin: "0 0 2px" }}>{DAYS[dt.getDay()]}</p>
                  <p style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? "#00E5A0" : "#64748b", margin: 0 }}>{dt.getDate()}</p>
                </div>
              );
            })}
          </div>
          {habits.map(h => (
            <div key={h.id} style={{ display: "grid", gridTemplateColumns: "120px repeat(7, 1fr)", gap: 4, alignItems: "center", marginBottom: 8 }}>
              <p style={{ fontSize: 12, margin: 0, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</p>
              {week.map(d => {
                const done = isDone(h.id, d); const isToday = d === today;
                return (
                  <div key={d} onClick={() => handleToggle(h.id, d)}
                    style={{ width: 30, height: 30, borderRadius: 8, background: done ? CAT_COLORS[h.category] : "#0f0f13", border: isToday && !done ? `2px solid ${CAT_COLORS[h.category]}` : "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", margin: "0 auto" }}>
                    {done && <svg width="12" height="12" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="#0f0f13" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}