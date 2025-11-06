// frontend/src/shared/api.js
import axios from "axios";

// use Render in production, localhost in dev
const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://cafe-fausse-backend-e3d1.onrender.com"
    : "http://localhost:5000";

export default function api(path, options = {}) {
  return axios({
    url: API_BASE + path,
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    data: options.body || undefined,
  }).then(res => res.data);
}