import { useState, useEffect } from "react";
import Auth from "./Auth";
import HabitTracker from "./HabitTracker";
import Verify from "./Verify";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  // Verify page
  if (window.location.pathname === "/verify") {
    return <Verify />;
  }

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