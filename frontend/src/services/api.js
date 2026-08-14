import axios from "axios";

// Always read from REACT_APP_API_URL or default to http://localhost:8080
export const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:8080").replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
