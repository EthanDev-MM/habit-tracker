import { useState, useEffect } from "react";
import { getHabits, createHabit, deleteHabit, toggleLog, getWeekLogs } from "./api/index";

const CATEGORIES = ["Health", "Work", "Personal", "Learning", "Fitness"];
const CAT_COLORS = { Health: "#1D9E75", Work: "#378ADD", Personal: "#D4537E", Learning: "#7F77DD", Fitness: "#EF9F27" };
const CAT_BG = { Health: "#E1F5EE", Work: "#E6F1FB", Personal: "#FBEAF0", Learning: "#EEEDFE", Fitness: "#FAEEDA" };
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
  const [filterCat, setFilterCat] = useState("All");
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
    } catch (err) {
      console.error(err);
    }
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

  async function handleAddHabit() {
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

  const filtered = filterCat === "All" ? habits : habits.filter(h => h.category === filterCat);
  const todayDone = habits.filter(h => isDone(h.id, today)).length;

  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif" }}>Loading...</div>;

  return (
    <div style={{ fontFamily: "sans-serif", padding: "1.25rem", maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>Habit Tracker</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "#666" }}>Hi, {user.name || user.email}</span>
          <button onClick={onLogout} style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #ddd", background: "transparent", cursor: "pointer", fontSize: 13 }}>Logout</button>
        </div>
      </div>
      <p style={{ fontSize: 14, color: "#666", margin: "0 0 1.25rem" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: "1.25rem" }}>
        {[
          { label: "Today", value: `${todayDone}/${habits.length}`, sub: "completed" },
          { label: "Total habits", value: habits.length, sub: "active" },
          { label: "This week", value: `${week.filter(d => habits.some(h => isDone(h.id, d))).length}/7`, sub: "days active" },
        ].map(c => (
          <div key={c.label} style={{ background: "#f5f5f5", borderRadius: 8, padding: "12px 14px" }}>
            <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>{c.label}</p>
            <p style={{ fontSize: 22, fontWeight: 500, margin: "0 0 2px" }}>{c.value}</p>
            <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>{c.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        {["today", "week"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid", borderColor: view === v ? "#333" : "#ddd", background: view === v ? "#f0f0f0" : "transparent", fontSize: 13, cursor: "pointer" }}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ fontSize: 13, padding: "5px 8px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer" }}>
            <option>All</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button onClick={() => setShowAdd(true)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #ddd", background: "transparent", fontSize: 13, cursor: "pointer" }}>+ Add</button>
        </div>
      </div>

      {showAdd && (
        <div style={{ background: "white", border: "1px solid #eee", borderRadius: 12, padding: "1rem", marginBottom: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <input placeholder="Habit name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ fontSize: 13, padding: "7px 10px", borderRadius: 8, border: "1px solid #ddd", gridColumn: "1/3" }} />
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ fontSize: 13, padding: "7px 10px", borderRadius: 8, border: "1px solid #ddd" }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="time" value={form.reminder} onChange={e => setForm(f => ({ ...f, reminder: e.target.value }))} style={{ fontSize: 13, padding: "7px 10px", borderRadius: 8, border: "1px solid #ddd" }} />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={() => setShowAdd(false)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #ddd", background: "transparent", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleAddHabit} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#1D9E75", color: "white", fontSize: 13, cursor: "pointer" }}>Save</button>
          </div>
        </div>
      )}

      {view === "today" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 && <p style={{ color: "#888", fontSize: 14 }}>No habits yet. Add one!</p>}
          {filtered.map(h => {
            const done = isDone(h.id, today);
            return (
              <div key={h.id} onClick={() => handleToggle(h.id, today)} style={{ background: "white", border: `1px solid ${done ? CAT_COLORS[h.category] : "#eee"}`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ width: 24, height: 24, borderRadius: 12, border: `2px solid ${done ? CAT_COLORS[h.category] : "#ccc"}`, background: done ? CAT_COLORS[h.category] : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {done && <svg width="12" height="12" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: 14, textDecoration: done ? "line-through" : "none", color: done ? "#999" : "#333" }}>{h.name}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                    <span style={{ fontSize: 11, background: CAT_BG[h.category], color: CAT_COLORS[h.category], padding: "2px 8px", borderRadius: 20 }}>{h.category}</span>
                    {h.reminder && <span style={{ fontSize: 11, color: "#aaa" }}>⏰ {h.reminder}</span>}
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); handleDelete(h.id); }} style={{ padding: "4px", background: "transparent", border: "none", color: "#ccc", cursor: "pointer", fontSize: 18 }}>×</button>
              </div>
            );
          })}
        </div>
      )}

      {view === "week" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "140px repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
            <div />
            {week.map(d => {
              const dt = new Date(d + "T00:00:00"); const isToday = d === today;
              return (
                <div key={d} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 10, color: "#aaa", margin: "0 0 2px" }}>{DAYS[dt.getDay()]}</p>
                  <p style={{ fontSize: 12, fontWeight: isToday ? 600 : 400, color: isToday ? "#333" : "#888", margin: 0 }}>{dt.getDate()}</p>
                </div>
              );
            })}
          </div>
          {filtered.map(h => (
            <div key={h.id} style={{ display: "grid", gridTemplateColumns: "140px repeat(7, 1fr)", gap: 4, alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</p>
                <span style={{ fontSize: 10, background: CAT_BG[h.category], color: CAT_COLORS[h.category], padding: "1px 6px", borderRadius: 20 }}>{h.category}</span>
              </div>
              {week.map(d => {
                const done = isDone(h.id, d); const isToday = d === today;
                return (
                  <div key={d} onClick={() => handleToggle(h.id, d)} style={{ width: 32, height: 32, borderRadius: 8, background: done ? CAT_COLORS[h.category] : "#f5f5f5", border: isToday && !done ? `2px solid ${CAT_COLORS[h.category]}` : "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", margin: "0 auto" }}>
                    {done && <svg width="14" height="14" viewBox="0 0 14 14"><polyline points="2,7 6,11 12,3" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
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