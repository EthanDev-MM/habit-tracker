import { useState, useEffect } from "react";
import Auth from "./Auth";
import HabitTracker from "./HabitTracker";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  function handleLogin(userData) {
    setUser(userData);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  if (!user) return <Auth onLogin={handleLogin} />;
  return <HabitTracker user={user} onLogout={handleLogout} />;
}