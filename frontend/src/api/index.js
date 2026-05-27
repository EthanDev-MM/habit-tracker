import axios from "axios";

const API = axios.create({
  baseURL: "https://habit-tracker-production-08c6.up.railway.app/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);

export const getHabits = () => API.get("/habits");
export const createHabit = (data) => API.post("/habits", data);
export const deleteHabit = (id) => API.delete(`/habits/${id}`);

export const toggleLog = (data) => API.post("/logs/toggle", data);
export const getWeekLogs = () => API.get("/logs/week");